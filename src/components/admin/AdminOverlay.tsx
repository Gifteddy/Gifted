import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAdminStore } from '@/store/admin'
import useRealtimeNotifications from '@/hooks/useRealtimeNotifications'
import NotificationBell from '@/components/admin/NotificationBell'

export function AdminOverlay() {
  const { user, initialized, initialize } = useAdminStore()
  const { pathname } = useLocation()

  useEffect(() => {
    if (!initialized) initialize()
  }, [initialized, initialize])

  useRealtimeNotifications()

  if (!user || pathname.startsWith('/admin')) return null

  return (
    <div className="fixed right-4 top-4 z-50">
      <div className="rounded-xl border border-black/[0.06] bg-white/90 p-1.5 shadow-lg backdrop-blur-2xl dark:border-white/[0.06] dark:bg-[#12121A]/90">
        <NotificationBell />
      </div>
    </div>
  )
}
