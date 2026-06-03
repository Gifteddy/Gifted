import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from '@/store/theme'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggle = () => setTheme(theme === 'light' ? 'dark' : 'light')

  return (
    <button onClick={toggle} className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/5" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
      <AnimatePresence mode="popLayout">
        {theme === 'light' ? (
          <motion.div key="dark" initial={{ scale: 0, rotate: 90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: -90 }} transition={{ duration: 0.3 }}>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
            </svg>
          </motion.div>
        ) : (
          <motion.div key="light" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }} transition={{ duration: 0.3 }}>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )
}
