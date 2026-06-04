import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate, cn } from '@/lib/utils'

interface MessageItem {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  service: string
  preferred_contact: string
  status: 'unread' | 'read' | 'replied' | 'archived'
  created_at: string
}

const statusFilters = ['all', 'unread', 'read', 'replied', 'archived'] as const

export default function AdminMessages() {
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [selected, setSelected] = useState<MessageItem | null>(null)

  const loadMessages = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
      if (filter !== 'all') query = query.eq('status', filter)
      const { data } = await query
      setMessages((data || []) as MessageItem[])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { loadMessages() }, [loadMessages])

  const handleStatusUpdate = async (id: string, status: MessageItem['status']) => {
    await supabase.from('contact_messages').update({ status }).eq('id', id)
    if (selected?.id === id) setSelected({ ...selected, status })
    loadMessages()
  }

  const handleDelete = async (id: string) => {
    await supabase.from('contact_messages').delete().eq('id', id)
    setSelected(null)
    loadMessages()
  }

  const unreadCount = messages.filter(m => m.status === 'unread').length

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white/90">Messages</h1>
          {unreadCount > 0 && (
            <p className="mt-1 text-xs text-red-500">{unreadCount} unread</p>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1">
        {statusFilters.map(sf => (
          <button key={sf} onClick={() => setFilter(sf)}
            className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              filter === sf
                ? 'bg-[#7700ff]/10 text-[#7700ff] dark:text-[#ad66ff]'
                : 'text-gray-500 hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5'
            )}>
            {sf.charAt(0).toUpperCase() + sf.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7700ff] border-t-transparent" />
        </div>
      ) : messages.length === 0 ? (
        <div className="flex items-center justify-center rounded-2xl p-12 text-center admin-glass">
          <p className="text-sm text-gray-500 dark:text-white/40">No messages found.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-2 lg:col-span-1">
            {messages.map(msg => (
              <button key={msg.id} onClick={() => { setSelected(msg); if (msg.status === 'unread') handleStatusUpdate(msg.id, 'read') }}
                className={cn('w-full rounded-xl p-3 text-left transition-colors',
                  selected?.id === msg.id ? 'bg-[#7700ff]/10' : 'hover:bg-black/5 dark:hover:bg-white/5'
                )}>
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#7700ff]/10 text-xs font-medium text-[#7700ff] dark:text-[#ad66ff]">
                    {msg.name[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-gray-900 dark:text-white/90">{msg.name}</span>
                      {msg.status === 'unread' && <span className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />}
                    </div>
                    <p className="truncate text-xs text-gray-500 dark:text-white/40">{msg.subject || 'No subject'}</p>
                  </div>
                  <span className="shrink-0 text-xs text-gray-400 dark:text-white/30">
                    {new Date(msg.created_at).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selected ? (
              <div className="relative overflow-hidden rounded-2xl p-6 admin-glass">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white/90">{selected.name}</h2>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-white/40">
                      <a href={`mailto:${selected.email}`} className="hover:text-[#7700ff]">{selected.email}</a>
                      {selected.phone && <span>· {selected.phone}</span>}
                      <span>· {formatDate(selected.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={selected.status} onChange={(e) => handleStatusUpdate(selected.id, e.target.value as MessageItem['status'])}
                      className="admin-input text-xs py-1.5 px-2.5">
                      <option value="unread">Unread</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                      <option value="archived">Archived</option>
                    </select>
                    <button onClick={() => handleDelete(selected.id)} className="rounded-lg px-2.5 py-1.5 text-xs text-red-500 transition-colors hover:bg-red-500/10">Delete</button>
                  </div>
                </div>

                {selected.service && (
                  <div className="mb-3">
                    <span className="rounded-full px-3 py-1 text-xs text-gray-500 dark:text-white/50"
                      style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
                      {selected.service}
                    </span>
                  </div>
                )}

                {selected.subject && (
                  <h3 className="mb-2 text-sm font-medium text-gray-900 dark:text-white/90">{selected.subject}</h3>
                )}

                <div className="rounded-xl p-4 text-sm leading-relaxed text-gray-700 dark:text-white/70"
                  style={{ background: 'rgba(0,0,0,0.03)' }}>
                  {selected.message}
                </div>

                <div className="mt-4 flex items-center gap-3 text-xs text-gray-500 dark:text-white/40">
                  <span>Preferred contact: {selected.preferred_contact}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-2xl p-12 text-center admin-glass">
                <p className="text-sm text-gray-500 dark:text-white/40">Select a message to view details.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
