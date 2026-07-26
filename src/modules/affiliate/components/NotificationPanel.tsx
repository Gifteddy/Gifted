import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { PartnerNotification } from '../types'

interface NotificationPanelProps {
  notifications: PartnerNotification[]
  partnerId: string
  onNotificationsRead: () => void
}

export function NotificationPanel({ notifications, partnerId, onNotificationsRead }: NotificationPanelProps) {
  const [open, setOpen] = useState(false)
  const unreadNotifs = notifications.filter(n => !n.read).length
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const handleMarkAllRead = async () => {
    await supabase.from('partner_notifications').update({ read: true }).eq('partner_id', partnerId).eq('read', false)
    onNotificationsRead()
  }

  return (
    <div className="relative" ref={panelRef}>
      <button onClick={() => setOpen(!open)} className="relative flex h-10 w-10 items-center justify-center rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors">
        <svg className="h-4 w-4 text-gray-500 dark:text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
        {unreadNotifs > 0 && <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[8px] font-bold text-white flex items-center justify-center">{unreadNotifs}</span>}
      </button>
      {open && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 top-12 w-72 sm:w-80 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-surface-dark shadow-xl shadow-black/[0.04] dark:shadow-black/[0.2] overflow-hidden z-50">
          <div className="p-3 border-b border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
            <p className="text-xs font-semibold">Notifications</p>
            {unreadNotifs > 0 && (
              <button onClick={handleMarkAllRead} className="text-[11px] px-2 py-1 text-brand-500 hover:bg-brand-500/10 rounded-lg transition-colors">Mark all read</button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto overscroll-contain">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-xs text-text-muted-light dark:text-text-muted-dark">No notifications yet</p>
              </div>
            ) : notifications.slice(0, 10).map(n => (
              <div key={n.id} className={cn('px-4 py-3 border-b border-black/[0.02] dark:border-white/[0.04] hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors', !n.read && 'bg-brand-500/[0.02]')}>
                <p className="text-xs font-medium text-gray-900 dark:text-white/90">{n.title}</p>
                <p className="text-[11px] text-text-muted-light dark:text-text-muted-dark mt-0.5">{n.message}</p>
                <p className="text-[10px] text-text-muted-light/50 dark:text-text-muted-dark/50 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
