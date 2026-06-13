import { create } from 'zustand'
import type { AppNotification } from '@/lib/types'

const MAX_NOTIFICATIONS = 100

interface NotificationsState {
  notifications: AppNotification[]
  unreadCount: number
  addNotification: (n: Omit<AppNotification, 'id' | 'read' | 'created_at'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
}

const saved = (() => {
  try {
    const v = localStorage.getItem('gifted-notification-count')
    return v ? Number(v) : 0
  } catch { return 0 }
})()

export const useNotifications = create<NotificationsState>((set) => ({
  notifications: [],
  unreadCount: saved,

  addNotification: (n) => set((state) => {
    const notification: AppNotification = {
      ...n,
      id: crypto.randomUUID(),
      read: false,
      created_at: new Date().toISOString(),
    }
    const notifications = [notification, ...state.notifications].slice(0, MAX_NOTIFICATIONS)
    const count = state.unreadCount + 1
    localStorage.setItem('gifted-notification-count', String(count))
    return { notifications, unreadCount: count }
  }),

  markAsRead: (id) => set((state) => {
    const notifications = state.notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    )
    const unreadCount = notifications.filter(n => !n.read).length
    localStorage.setItem('gifted-notification-count', String(unreadCount))
    return { notifications, unreadCount }
  }),

  markAllAsRead: () => set((state) => {
    const notifications = state.notifications.map(n => ({ ...n, read: true }))
    localStorage.setItem('gifted-notification-count', '0')
    return { notifications, unreadCount: 0 }
  }),

  clearAll: () => {
    localStorage.removeItem('gifted-notification-count')
    return set({ notifications: [], unreadCount: 0 })
  },
}))
