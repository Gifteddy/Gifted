import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePartnerStore } from '@/store/partner'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { PartnerNotification } from '@/modules/partner/types'

const TYPE_ICONS: Record<string, string> = {
  achievement: '★',
  conversion: '$',
  payout: '↗',
  system: '◉',
  promotion: '⊕',
}

export default function PartnerNotificationBell() {
  const { partner } = usePartnerStore()
  const [notifications, setNotifications] = useState<PartnerNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!partner) return

    async function fetchNotifications() {
      const { data } = await supabase
        .from('partner_notifications')
        .select('*')
        .eq('partner_id', partner!.id)
        .order('created_at', { ascending: false })
        .limit(30)

      if (data) {
        setNotifications(data as PartnerNotification[])
        setUnreadCount(data.filter(n => !n.read).length)
      }
    }

    fetchNotifications()

    const channel = supabase
      .channel(`partner-notifications-${partner!.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'partner_notifications',
        filter: `partner_id=eq.${partner!.id}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const n = payload.new as PartnerNotification
          setNotifications(prev => [n, ...prev].slice(0, 30))
          setUnreadCount(prev => prev + 1)
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new as PartnerNotification
          setNotifications(prev => prev.map(n => n.id === updated.id ? updated : n))
          setUnreadCount(() => {
            const next = notifications.map(n => n.id === updated.id ? updated : n)
            return next.filter(n => !n.read).length
          })
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [partner])

  useEffect(() => {
    if (!partner || !open) return

    const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
    if (unreadIds.length === 0) return

    async function markAllRead() {
      await supabase
        .from('partner_notifications')
        .update({ read: true })
        .in('id', unreadIds)
    }

    markAllRead().then(() => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    })
  }, [open, partner, notifications])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const handleItemClick = (n: PartnerNotification) => {
    setOpen(false)
    if (n.link) {
      navigate(n.link)
    }
  }

  const displayList = notifications.slice(0, 20)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-black/[0.04] dark:text-white/40 dark:hover:bg-white/[0.06]"
        aria-label="Notifications"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 origin-top-right overflow-hidden rounded-xl border border-black/[0.06] bg-white/95 shadow-lg backdrop-blur-2xl dark:border-white/[0.06] dark:bg-[#12121A]/95">
          <div className="flex items-center justify-between border-b border-black/[0.04] px-4 py-3 dark:border-white/[0.04]">
            <span className="text-xs font-semibold text-gray-800 dark:text-white/90">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-[10px] font-medium text-brand-500 dark:text-brand-400">{unreadCount} unread</span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {displayList.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <svg className="h-6 w-6 text-gray-300 dark:text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                </svg>
                <p className="text-xs text-gray-400 dark:text-white/30">No notifications yet</p>
              </div>
            ) : (
              displayList.map(n => (
                <button
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={cn(
                    'flex w-full items-start gap-3 border-b border-black/[0.02] px-4 py-3 text-left transition-colors last:border-0 hover:bg-black/[0.02] dark:border-white/[0.02] dark:hover:bg-white/[0.03]',
                    !n.read && 'bg-[#7700ff]/[0.03] dark:bg-[#9233ff]/[0.05]'
                  )}
                >
                  <span className="mt-0.5 shrink-0 text-sm leading-none text-gray-400 dark:text-white/40">
                    {TYPE_ICONS[n.type] || '◇'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn(
                      'truncate text-sm leading-tight',
                      n.read ? 'text-gray-500 dark:text-white/60' : 'font-medium text-gray-800 dark:text-white/90'
                    )}>
                      {n.title}
                    </p>
                    {n.message && (
                      <p className="mt-0.5 truncate text-xs text-gray-400 dark:text-white/40">{n.message}</p>
                    )}
                    <p className="mt-1 text-[10px] text-gray-300 dark:text-white/20">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#7700ff]" />
                  )}
                </button>
              ))
            )}
          </div>

          {notifications.length > 20 && (
            <div className="border-t border-black/[0.04] px-4 py-2 text-center text-[11px] text-gray-400 dark:border-white/[0.04] dark:text-white/30">
              +{notifications.length - 20} older notifications
            </div>
          )}
        </div>
      )}
    </div>
  )
}
