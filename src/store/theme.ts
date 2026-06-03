import { create } from 'zustand'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const getSystemTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

const getInitialTheme = (): Theme => {
  const stored = localStorage.getItem('gifted-theme')
  if (stored === 'light' || stored === 'dark') return stored
  return getSystemTheme()
}

export const useTheme = create<ThemeState>((set) => {
  const theme = getInitialTheme()
  document.documentElement.classList.toggle('dark', theme === 'dark')

  return {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem('gifted-theme', theme)
      document.documentElement.classList.toggle('dark', theme === 'dark')
      set({ theme })
    },
  }
})
