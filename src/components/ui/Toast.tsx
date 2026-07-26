import { useEffect, useCallback } from 'react'
import { create } from 'zustand'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ToastItem {
  id: number
  type: 'success' | 'error' | 'info'
  message: string
}

let nextId = 0

interface ToastStore {
  toasts: ToastItem[]
  add: (type: ToastItem['type'], message: string, duration?: number) => void
  remove: (id: number) => void
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  add: (type, message, duration = 4000) => {
    const id = nextId++
    set(s => ({ toasts: [...s.toasts, { id, type, message }] }))
    if (duration > 0) {
      setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), duration)
    }
  },
  remove: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}))

const icons: Record<string, string> = {
  success: 'M9 12l2 2 4-4',
  error: 'M12 9v4m0 4h.01',
  info: 'M12 8v4m0 4h.01',
}

export function ToastContainer() {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-2 max-w-sm">
      <AnimatePresence>
        {useToast(s => s.toasts).map(t => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastItem({ toast }: { toast: ToastItem }) {
  const remove = useToast(s => s.remove)

  const dismiss = useCallback(() => remove(toast.id), [remove, toast.id])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [dismiss])

  const colors = {
    success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    error: 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400',
    info: 'border-brand-500/20 bg-brand-500/10 text-brand-600 dark:text-brand-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-xs font-medium backdrop-blur-xl shadow-lg',
        colors[toast.type]
      )}
    >
      <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d={icons[toast.type]} />
      </svg>
      <span className="flex-1">{toast.message}</span>
      <button onClick={dismiss} className="shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity">
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
      </button>
    </motion.div>
  )
}
