import { create } from 'zustand'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface GifteddyState {
  isOpen: boolean
  messages: Message[]
  isStreaming: boolean
  error: string | null

  open: () => void
  close: () => void
  toggle: () => void
  addMessage: (message: Message) => void
  updateLastMessage: (content: string) => void
  setStreaming: (streaming: boolean) => void
  setError: (error: string | null) => void
  clearMessages: () => void
}

let messageId = 0
export const nextId = () => `msg_${++messageId}_${Date.now()}`

export const useGifteddyStore = create<GifteddyState>((set) => ({
  isOpen: false,
  messages: [],
  isStreaming: false,
  error: null,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set(s => ({ isOpen: !s.isOpen })),

  addMessage: (message) => set(s => ({ messages: [...s.messages, message], error: null })),

  updateLastMessage: (content) => set(s => {
    const msgs = [...s.messages]
    if (msgs.length > 0) {
      msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content: msgs[msgs.length - 1].content + content }
    }
    return { messages: msgs }
  }),

  setStreaming: (streaming) => set({ isStreaming: streaming }),
  setError: (error) => set({ error }),

  clearMessages: () => set({ messages: [], error: null }),
}))
