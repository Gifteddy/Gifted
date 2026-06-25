import { create } from 'zustand'
import type { AppNotification } from '@/lib/types'

const MAX_NOTIFICATIONS = 100
const STORAGE_KEY = 'gifted-notifications'

interface NotificationsState {
  notifications: AppNotification[]
  unreadCount: number
  addNotification: (n: Omit<AppNotification, 'id' | 'read' | 'created_at'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
}

function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { notifications: [], unreadCount: 0 }
    const parsed = JSON.parse(raw)
    return {
      notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
      unreadCount: typeof parsed.unreadCount === 'number' ? parsed.unreadCount : 0,
    }
  } catch {
    return { notifications: [], unreadCount: 0 }
  }
}

function persist(state: { notifications: AppNotification[]; unreadCount: number }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      notifications: state.notifications,
      unreadCount: state.unreadCount,
    }))
  } catch { /* quota exceeded or unavailable */ }
}

const initial = loadPersisted()

export const useNotifications = create<NotificationsState>((set) => ({
  notifications: initial.notifications,
  unreadCount: initial.unreadCount,

  addNotification: (n) => set((state) => {
    const notification: AppNotification = {
      ...n,
      id: crypto.randomUUID(),
      read: false,
      created_at: new Date().toISOString(),
    }
    const notifications = [notification, ...state.notifications].slice(0, MAX_NOTIFICATIONS)
    const unreadCount = state.unreadCount + 1
    const next = { notifications, unreadCount }
    persist(next)
    return next
  }),

  markAsRead: (id) => set((state) => {
    const notifications = state.notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    )
    const unreadCount = notifications.filter(n => !n.read).length
    const next = { notifications, unreadCount }
    persist(next)
    return next
  }),

  markAllAsRead: () => set((state) => {
    const notifications = state.notifications.map(n => ({ ...n, read: true }))
    const next = { notifications, unreadCount: 0 }
    persist(next)
    return next
  }),

  clearAll: () => {
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* noop */ }
    return set({ notifications: [], unreadCount: 0 })
  },
}))
