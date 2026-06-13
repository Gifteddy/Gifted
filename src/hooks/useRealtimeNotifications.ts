import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useNotifications } from '@/store/notifications'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type Row = Record<string, unknown>

function showBrowser(title: string, body: string) {
  if (!('Notification' in window)) return
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/logo-G.png' })
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(p => {
      if (p === 'granted') new Notification(title, { body, icon: '/logo-G.png' })
    })
  }
}

function subscribe(channelName: string, table: string, handler: (payload: RealtimePostgresChangesPayload<Row>) => void) {
  return supabase
    .channel(channelName)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table }, handler)
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log(`[Realtime] Subscribed to ${table}`)
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error(`[Realtime] ${table}: ${status}`, err)
      } else if (status === 'CLOSED') {
        console.log(`[Realtime] ${table} channel closed`)
      }
    })
}

export default function useRealtimeNotifications() {
  const addNotification = useNotifications(s => s.addNotification)
  const channelsRef = useRef<ReturnType<typeof supabase.channel>[]>([])

  useEffect(() => {
    if (!('channel' in supabase)) {
      console.warn('[Realtime] Supabase channel() not available (noop client)')
      return
    }

    const handleInsert = (
      type: 'message' | 'testimonial' | 'file_upload',
      getInfo: (row: Row) => { title: string; description: string; link: string },
    ) => {
      return (payload: RealtimePostgresChangesPayload<Row>) => {
        const row = payload.new
        if (!row || !('id' in row)) return
        const { title, description, link } = getInfo(row)
        addNotification({ type, title, description, link })
        showBrowser(title, description)
      }
    }

    const contactChannel = subscribe(
      'notif-contact-messages',
      'contact_messages',
      handleInsert('message', (r) => ({
        title: `New message from ${r.name || 'Someone'}`,
        description: (r.subject as string) || (r.message as string)?.slice(0, 80) || '',
        link: '/admin/messages',
      })),
    )

    const testimonialChannel = subscribe(
      'notif-testimonials',
      'testimonials',
      handleInsert('testimonial', (r) => ({
        title: `New testimonial from ${r.name || 'Someone'}`,
        description: (r.content as string)?.slice(0, 80) || '',
        link: '/admin/testimonials',
      })),
    )

    const fileUploadChannel = subscribe(
      'notif-file-uploads',
      'file_uploads',
      handleInsert('file_upload', (r) => ({
        title: `Files uploaded by ${r.sender_name || 'Someone'}`,
        description: (r.message as string)?.slice(0, 80) || `${((r.files as unknown[])?.length || 0)} file(s)`,
        link: '/admin/file-uploads',
      })),
    )

    channelsRef.current = [contactChannel, testimonialChannel, fileUploadChannel]

    return () => {
      for (const ch of channelsRef.current) {
        supabase.removeChannel(ch)
      }
      channelsRef.current = []
    }
  }, [addNotification])
}
