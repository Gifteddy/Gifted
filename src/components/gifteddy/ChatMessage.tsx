import { renderMarkdown } from '@/lib/markdown'
import type { Message } from '@/store/gifteddy'

interface ChatMessageProps {
  message: Message
  isStreaming?: boolean
  isDark?: boolean
}

export function ChatMessage({ message, isStreaming, isDark }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} px-4`}>
      <div
        className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
        style={{
          background: isUser
            ? isDark ? '#7700ff' : '#7700ff'
            : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          color: isUser ? 'white' : isDark ? '#e0e0e0' : '#1a1a1a',
        }}
      >
        {message.content ? (
          <div className="gifteddy-prose">
            {renderMarkdown(message.content)}
          </div>
        ) : isStreaming ? (
          <span className="inline-flex gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-current opacity-60" style={{ animationDelay: '0ms' }} />
            <span className="h-2 w-2 animate-bounce rounded-full bg-current opacity-60" style={{ animationDelay: '150ms' }} />
            <span className="h-2 w-2 animate-bounce rounded-full bg-current opacity-60" style={{ animationDelay: '300ms' }} />
          </span>
        ) : null}
      </div>
    </div>
  )
}
