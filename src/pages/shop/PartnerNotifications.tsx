import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Meta } from '@/lib/meta'
import { usePartnerStore } from '@/store/partner'
import { getPartnerNotifications, markNotificationRead, markAllNotificationsRead } from '@/modules/partner/queries'
import type { PartnerNotification } from '@/modules/partner/types'

const filterTabs = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'sale', label: 'Sales' },
  { key: 'commission', label: 'Commissions' },
  { key: 'payout', label: 'Payouts' },
  { key: 'system', label: 'System' },
] as const

type FilterKey = (typeof filterTabs)[number]['key']

const typeIcon: Record<string, string> = {
  sale: '💰',
  commission: '💸',
  payout: '🏦',
  achievement: '🏆',
  system: '⚙️',
  click: '🖱️',
  level_up: '⬆️',
}

function timeAgo(date: string) {
  const now = Date.now()
  const then = new Date(date).getTime()
  const seconds = Math.floor((now - then) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function PartnerNotifications() {
  const partner = usePartnerStore((s) => s.partner)
  const loading = usePartnerStore((s) => s.loading)

  const [notifications, setNotifications] = useState<PartnerNotification[]>([])
  const [fetching, setFetching] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchNotifications = async () => {
    if (!partner) return
    setFetching(true)
    try {
      const data = await getPartnerNotifications(partner.id)
      setNotifications(data)
    } catch { /* silent */ }
    setFetching(false)
  }

  useEffect(() => {
    fetchNotifications()
  }, [partner])

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
    } catch { /* silent */ }
  }

  const handleMarkAllRead = async () => {
    if (!partner) return
    try {
      await markAllNotificationsRead(partner.id)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch { /* silent */ }
  }

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'unread') return !n.read
    return n.type === activeFilter
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="text-4xl">🔔</div>
        <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white/90">Partner Account Required</h2>
        <p className="max-w-sm text-sm text-gray-500 dark:text-white/50">Join the partner programme to see your notifications.</p>
      </div>
    )
  }

  return (
    <>
      <Meta title="Notifications" description="Stay updated on your partner activity" />

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white/90 sm:text-3xl">Notifications</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-white/50">
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-4 py-2 text-xs font-medium text-gray-600 dark:text-white/60 transition-all hover:bg-gray-100 dark:hover:bg-white/[0.06]"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={cn(
                'shrink-0 rounded-xl px-4 py-2 text-xs font-medium transition-all',
                activeFilter === tab.key
                  ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/25'
                  : 'border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/[0.06]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {fetching ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/[0.1] dark:border-white/[0.1] py-16 text-center">
            <div className="text-4xl">🔔</div>
            <p className="mt-3 font-display text-lg font-semibold text-gray-900 dark:text-white/90">
              {activeFilter === 'unread' ? 'All caught up!' : 'No notifications'}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-white/50">
              {activeFilter === 'unread'
                ? 'You have read all your notifications'
                : 'Notifications about your partner activity will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((notification) => {
              const icon = typeIcon[notification.type] || '📢'
              const isExpanded = expandedId === notification.id
              const isLong = notification.message.length > 120

              return (
                <div
                  key={notification.id}
                  onClick={() => {
                    if (!notification.read) handleMarkRead(notification.id)
                    if (isLong) setExpandedId(isExpanded ? null : notification.id)
                  }}
                  className={cn(
                    'group relative rounded-2xl border p-4 transition-all',
                    notification.read
                      ? 'border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02]'
                      : 'border-brand-200 dark:border-brand-500/20 bg-brand-50/30 dark:bg-brand-500/5',
                    isLong && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03]'
                  )}
                >
                  {!notification.read && (
                    <div className="absolute right-4 top-4 h-2 w-2 rounded-full bg-brand-500" />
                  )}
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/[0.05] text-lg">
                      {icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={cn(
                          'text-sm font-semibold',
                          notification.read
                            ? 'text-gray-700 dark:text-white/70'
                            : 'text-gray-900 dark:text-white/90'
                        )}>
                          {notification.title}
                        </h3>
                        <span className="shrink-0 text-[10px] text-gray-400 dark:text-white/30">
                          {timeAgo(notification.created_at)}
                        </span>
                      </div>
                      <p className={cn(
                        'mt-0.5 text-xs text-gray-500 dark:text-white/40',
                        !isExpanded && isLong && 'line-clamp-2'
                      )}>
                        {notification.message}
                      </p>
                      {isLong && (
                        <span className="mt-1 inline-block text-[10px] font-medium text-brand-500">
                          {isExpanded ? 'Show less' : 'Read more'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
