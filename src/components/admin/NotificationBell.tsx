import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '@/store/notifications'
import { cn } from '@/lib/utils'
import type { NotificationType } from '@/lib/types'

const TYPE_ICONS: Record<NotificationType, string> = {
  message: '□',
  testimonial: '★',
  file_upload: '↗',
  share_viewed: '⊕',
}

const ORIGINAL_TITLE = document.title

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    document.title = unreadCount > 0
      ? `(${unreadCount > 99 ? '99+' : unreadCount}) ${ORIGINAL_TITLE}`
      : ORIGINAL_TITLE
    return () => { document.title = ORIGINAL_TITLE }
  }, [unreadCount])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const handleItemClick = (n: typeof notifications[number]) => {
    if (!n.read) markAsRead(n.id)
    setOpen(false)
    navigate(n.link)
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
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllAsRead}
                  className="text-[11px] font-medium text-gray-400 transition-colors hover:text-gray-600 dark:text-white/40 dark:hover:text-white/70">
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAll}
                  className="text-[11px] font-medium text-gray-400 transition-colors hover:text-red-500 dark:text-white/40 dark:hover:text-red-400">
                  Clear
                </button>
              )}
            </div>
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
                    {n.description && (
                      <p className="mt-0.5 truncate text-xs text-gray-400 dark:text-white/40">{n.description}</p>
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
