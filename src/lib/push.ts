import { supabase } from './supabase'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || ''

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export async function isPushSupported(): Promise<boolean> {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

export async function getPushPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied'
  return Notification.permission
}

export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  return Notification.requestPermission()
}

export async function subscribeToPush(role: 'partner' | 'admin' = 'partner'): Promise<boolean> {
  try {
    if (!VAPID_PUBLIC_KEY) {
      console.warn('[Push] VAPID public key not configured')
      return false
    }

    const permission = await requestPushPermission()
    if (permission !== 'granted') return false

    const reg = await navigator.serviceWorker.ready
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
    })

    const sub = subscription.toJSON()
    if (!sub.endpoint || !sub.keys) return false

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase.from('push_subscriptions').upsert({
      user_id: user.id,
      role,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh || '',
      auth_key: sub.keys.auth || '',
      is_active: true,
    }, { onConflict: 'user_id,endpoint' })

    if (error) {
      console.error('[Push] Save subscription error:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('[Push] Subscribe error:', err)
    return false
  }
}

export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const reg = await navigator.serviceWorker.ready
    const subscription = await reg.pushManager.getSubscription()
    if (!subscription) return true

    const endpoint = subscription.endpoint
    await subscription.unsubscribe()

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('push_subscriptions')
        .delete()
        .eq('user_id', user.id)
        .eq('endpoint', endpoint)
    }

    return true
  } catch (err) {
    console.error('[Push] Unsubscribe error:', err)
    return false
  }
}

export async function isPushSubscribed(): Promise<boolean> {
  try {
    const reg = await navigator.serviceWorker.ready
    const subscription = await reg.pushManager.getSubscription()
    return !!subscription
  } catch {
    return false
  }
}

export async function sendPushNotification(params: {
  userId?: string
  role?: 'partner' | 'admin'
  title: string
  body: string
  url?: string
  tag?: string
}): Promise<boolean> {
  try {
    const res = await fetch('/api/send-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    return res.ok
  } catch {
    return false
  }
}
