import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GifteddyMark } from './GifteddyMark'
import { ChatMessage } from './ChatMessage'
import { QuickActions } from './QuickActions'
import { useGifteddyStore, nextId } from '@/store/gifteddy'
import { useTheme } from '@/store/theme'
import { streamChat } from './openrouter'
import { getSystemPrompt } from './systemPrompt'
import { fetchChatContext, needsContext } from './context'
import type { ChatMessage as ChatMessageType } from './openrouter'

export function ChatWindow() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { isOpen, messages, isStreaming, error, close, addMessage, updateLastMessage, setStreaming, setError } = useGifteddyStore()
  const [input, setInput] = useState('')
  const [showWelcome, setShowWelcome] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming) return
    setShowWelcome(false)

    const userMsg = {
      id: nextId(),
      role: 'user' as const,
      content: content.trim(),
      timestamp: Date.now(),
    }

    const assistantMsg = {
      id: nextId(),
      role: 'assistant' as const,
      content: '',
      timestamp: Date.now(),
    }

    addMessage(userMsg)
    addMessage(assistantMsg)
    setStreaming(true)
    setError(null)
    setInput('')

    abortRef.current = new AbortController()

    const systemPrompt = getSystemPrompt()
    const liveContext = needsContext(content) ? await fetchChatContext() : ''
    const enhancedPrompt = liveContext
      ? { ...systemPrompt, content: `${systemPrompt.content}\n\nCURRENT DATA FROM PORTFOLIO DATABASE:\n${liveContext}` }
      : systemPrompt

    const allMessages: ChatMessageType[] = [
      enhancedPrompt,
      ...useGifteddyStore.getState().messages
        .filter(m => m.content)
        .map(m => ({ role: m.role === 'user' ? 'user' as const : 'assistant' as const, content: m.content })),
    ]

    await streamChat(allMessages, {
      onToken: (token) => {
        updateLastMessage(token)
      },
      onDone: () => {
        setStreaming(false)
      },
      onError: (err) => {
        setStreaming(false)
        console.error('Chat error:', err)
        setError("I'm having trouble connecting right now. Please check your API key and try again in a moment.")
      },
    }, abortRef.current.signal)
  }, [isStreaming, addMessage, updateLastMessage, setStreaming, setError])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleQuickAction = (action: string) => {
    sendMessage(action)
  }

  const glassStyle: React.CSSProperties = {
    background: isDark ? 'rgba(18,18,24,0.88)' : 'rgba(255,255,255,0.75)',
    WebkitBackdropFilter: 'blur(28px) saturate(150%)',
    backdropFilter: 'blur(28px) saturate(150%)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}`,
    boxShadow: isDark
      ? '0 25px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)'
      : '0 25px 80px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)',
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 16 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed z-[90] max-sm:inset-x-4 max-sm:bottom-20 max-sm:w-auto sm:bottom-[100px] sm:right-6"
      style={{
        width: 'min(calc(100vw - 40px), 440px)',
        height: 'min(70vh, 700px)',
        maxHeight: 'calc(100vh - 140px)',
        borderRadius: '32px',
        ...glassStyle,
      }}
    >
      <div className="flex h-full flex-col overflow-hidden" style={{ borderRadius: '32px' }}>
        <div className={`flex items-center gap-3 px-5 py-4 ${isDark ? 'border-b border-white/8' : 'border-b border-black/5'}`}>
          <div className="h-10 w-10 overflow-hidden rounded-full">
            <GifteddyMark className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Gifteddy</span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <span className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Creative Assistant</span>
          </div>
          <button
            onClick={close}
            className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
              isDark ? 'text-white/40 hover:bg-white/8' : 'text-gray-400 hover:bg-black/5'
            }`}
            aria-label="Close chat"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 scroll-smooth">
          <AnimatePresence mode="wait">
            {showWelcome && messages.length === 0 ? (
              <motion.div
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex justify-start px-4">
                  <div
                    className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    }}
                  >
                    <p className={isDark ? 'text-white/90' : 'text-gray-900'}>Hi, I'm Gifteddy.</p>
                    <p className={`mt-2 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                      I'm here to help you explore Gifted's work, services, projects, and creative process.
                    </p>
                    <p className={`mt-2 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                      What would you like to know?
                    </p>
                  </div>
                </div>
                <QuickActions onSelect={handleQuickAction} isDark={isDark} />
              </motion.div>
            ) : (
              <motion.div
                key="messages"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {messages.map((msg, i) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
                    isDark={isDark}
                  />
                ))}
                {error && (
                  <div className="flex justify-center px-4">
                    <p className="max-w-xs text-center text-xs text-red-400">{error}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className={`px-4 py-3 ${isDark ? 'border-t border-white/8' : 'border-t border-black/5'}`}>
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about Gifted..."
              disabled={isStreaming}
              autoComplete="off"
              className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
              style={{
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                color: isDark ? 'white' : '#1a1a1a',
              }}
              aria-label="Chat input"
            />
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-white transition-all ${
                isStreaming || !input.trim() ? 'opacity-40' : 'hover:scale-105'
              }`}
              style={{ background: isDark ? '#9233ff' : '#7700ff' }}
              aria-label="Send message"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}
