import { GifteddyMark } from './GifteddyMark'
import { useTheme } from '@/store/theme'
import { useGifteddyStore } from '@/store/gifteddy'

export function ChatBubble() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const toggle = useGifteddyStore(s => s.toggle)

  return (
    <button
      onClick={toggle}
      className="fixed z-[80] flex h-12 w-12 cursor-pointer items-center justify-center rounded-full max-sm:bottom-5 max-sm:right-5 sm:bottom-6 sm:right-6"
      style={{
        background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.15)',
      }}
      aria-label="Open Gifteddy chat"
    >
      <GifteddyMark className={`h-6 w-6 ${isDark ? 'text-brand-400' : 'text-brand-500'}`} />
    </button>
  )
}
