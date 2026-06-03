import { lazy, Suspense } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ChatBubble } from './ChatBubble'
import { useGifteddyStore } from '@/store/gifteddy'

const ChatWindow = lazy(() =>
  import('./ChatWindow').then(m => ({ default: m.ChatWindow }))
)

function ChatWindowFallback() {
  return null
}

export function Gifteddy() {
  const isOpen = useGifteddyStore(s => s.isOpen)

  return (
    <>
      <ChatBubble />
      <AnimatePresence>
        {isOpen && (
          <Suspense fallback={<ChatWindowFallback />}>
            <ChatWindow />
          </Suspense>
        )}
      </AnimatePresence>
    </>
  )
}
