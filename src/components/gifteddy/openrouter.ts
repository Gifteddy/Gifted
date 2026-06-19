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

async function makeRequest(body: string, retries = 2, signal?: AbortSignal): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal,
      })
      if (res.ok) return res
      if (res.status === 429 && attempt < retries) {
        await new Promise(r => setTimeout(r, (attempt + 1) * 1000))
        continue
      }
      const text = await res.text().catch(() => '')
      console.warn(`Chat proxy returned ${res.status}:`, text.slice(0, 200))
    } catch (e) {
      console.warn('Chat proxy unavailable:', e)
    }
    break
  }

  if (VITE_KEY) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
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
        if (res.status === 429 && attempt < retries) {
          await new Promise(r => setTimeout(r, (attempt + 1) * 1000))
          continue
        }
        const text = await res.text().catch(() => '')
        console.warn(`OpenRouter direct returned ${res.status}:`, text.slice(0, 200))
      } catch (e) {
        console.warn('OpenRouter direct unavailable:', e)
      }
      break
    }
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
      JSON.stringify({ model, messages, stream: true, temperature: 0.7, max_tokens: 1024 }),
      2,
      signal,
    )

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let buffer = ''
    let batchedTokens = ''
    let batchTimer: ReturnType<typeof setTimeout> | null = null

    const flushBatch = () => {
      if (batchedTokens) {
        onToken(batchedTokens)
        batchedTokens = ''
      }
      batchTimer = null
    }

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
        if (data === '[DONE]') {
          if (batchTimer) clearTimeout(batchTimer)
          flushBatch()
          return true
        }

        try {
          const parsed = JSON.parse(data)
          const token = parsed.choices?.[0]?.delta?.content || ''
          if (token) {
            batchedTokens += token
            if (!batchTimer) {
              batchTimer = setTimeout(flushBatch, 40)
            }
          }
        } catch {
          // skip malformed chunks
        }
      }
    }

    if (batchTimer) clearTimeout(batchTimer)
    flushBatch()
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
