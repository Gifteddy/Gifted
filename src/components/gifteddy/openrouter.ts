export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface StreamCallbacks {
  onToken: (token: string) => void
  onDone: () => void
  onError: (error: Error) => void
}

const models = [
  'openrouter/free',
]

const VITE_KEY = import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined

async function makeRequest(body: string, signal?: AbortSignal): Promise<Response> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal,
    })
    if (res.ok) return res
    const text = await res.text().catch(() => '')
    console.warn(`Chat proxy returned ${res.status}:`, text.slice(0, 200))
  } catch (e) {
    console.warn('Chat proxy unavailable:', e)
  }

  if (VITE_KEY) {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VITE_KEY}`,
        'HTTP-Referer': 'https://gifted.com',
        'X-Title': 'Gifted Portfolio',
      },
      body,
      signal,
    })
    if (res.ok) return res
    const text = await res.text().catch(() => '')
    console.warn(`OpenRouter direct returned ${res.status}:`, text.slice(0, 200))
  }

  throw new Error('API unavailable')
}

async function attemptStream(
  model: string,
  messages: ChatMessage[],
  onToken: (token: string) => void,
  signal?: AbortSignal,
): Promise<boolean> {
  try {
    const response = await makeRequest(
      JSON.stringify({ model, messages, stream: true, temperature: 0.7, max_tokens: 2048 }),
      signal,
    )

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue
        const data = trimmed.slice(6)
        if (data === '[DONE]') return true

        try {
          const parsed = JSON.parse(data)
          const token = parsed.choices?.[0]?.delta?.content || ''
          if (token) onToken(token)
        } catch {
          // skip malformed chunks
        }
      }
    }

    return true
  } catch (err) {
    if ((err as Error).name === 'AbortError') return true
    console.warn(`Model ${model} failed:`, err)
    return false
  }
}

export async function streamChat(
  messages: ChatMessage[],
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  for (const model of models) {
    const success = await attemptStream(model, messages, callbacks.onToken, signal)
    if (success) {
      callbacks.onDone()
      return
    }
  }

  callbacks.onError(new Error('All models failed'))
}
