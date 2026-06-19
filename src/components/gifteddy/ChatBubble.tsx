import { GifteddyMark } from './GifteddyMark'
import { useTheme } from '@/store/theme'
import { useGifteddyStore } from '@/store/gifteddy'

export function ChatBubble() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const toggle = useGifteddyStore(s => s.toggle)

  return (
    <div className="fixed z-[80] max-sm:bottom-5 max-sm:right-5 sm:bottom-6 sm:right-6">
      <div className="group relative flex items-center">
        <span
          className="pointer-events-none absolute right-full mr-3 translate-x-2 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-medium opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
          style={{
            background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
            color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
          }}
        >
          Ask Gifteddy
        </span>
        <button
          onClick={toggle}
          className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95"
          style={{
            background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.08)',
            WebkitBackdropFilter: 'blur(24px)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
          aria-label="Open Gifteddy chat"
        >
          <GifteddyMark className="h-10 w-10" />
        </button>
      </div>
    </div>
  )
}
