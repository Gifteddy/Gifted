import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { LiquidGlass } from '@/components/ui/LiquidGlass'

interface EventCount {
  event_type: string
  count: number
}

export default function AdminAnalytics() {
  const [events, setEvents] = useState<EventCount[]>([])
  const [totalEvents, setTotalEvents] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data: allData } = await supabase
          .from('analytics')
          .select('event_type')

        const all = allData || []
        setTotalEvents(all.length)

        const counts: Record<string, number> = {}
        all.forEach(e => {
          counts[e.event_type] = (counts[e.event_type] || 0) + 1
        })

        setEvents(
          Object.entries(counts)
            .map(([event_type, count]) => ({ event_type, count }))
            .sort((a, b) => b.count - a.count)
        )

        const { data: chatsData } = await supabase
          .from('chat_logs')
          .select('id', { count: 'exact', head: true })

        setEvents(prev => [
          ...prev,
          { event_type: 'chat_interaction', count: chatsData?.length ?? 0 },
        ])
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const maxCount = Math.max(...events.map(e => e.count), 1)

  const getEventLabel = (type: string) => {
    const labels: Record<string, string> = {
      page_view: 'Page Views',
      project_view: 'Project Views',
      chat_open: 'Chat Opens',
      message_sent: 'Messages Sent',
      contact_request: 'Contact Requests',
      chat_interaction: 'Chat Interactions',
    }
    return labels[type] || type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      page_view: 'bg-brand-500',
      project_view: 'bg-gold-500',
      chat_open: 'bg-emerald-500',
      message_sent: 'bg-blue-500',
      contact_request: 'bg-purple-500',
      chat_interaction: 'bg-rose-500',
    }
    return colors[type] || 'bg-brand-500'
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Analytics</h1>
        <p className="mt-1 text-xs text-text-muted-light dark:text-text-muted-dark">
          {totalEvents} total events tracked
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : events.length === 0 ? (
        <LiquidGlass className="rounded-2xl p-12 text-center" intensity="subtle">
          <p className="text-text-muted-light dark:text-text-muted-dark">
            No analytics data yet. Events will appear as visitors interact with the site.
          </p>
        </LiquidGlass>
      ) : (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map(e => (
              <LiquidGlass key={e.event_type} className="rounded-2xl p-5" intensity="subtle">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gradient">{e.count}</div>
                    <div className="mt-1 text-xs text-text-muted-light dark:text-text-muted-dark">
                      {getEventLabel(e.event_type)}
                    </div>
                  </div>
                  <div className={`h-3 w-3 rounded-full ${getEventColor(e.event_type)} opacity-60`} />
                </div>
              </LiquidGlass>
            ))}
          </div>

          {/* Bar chart */}
          <LiquidGlass className="rounded-2xl p-6" intensity="subtle">
            <h2 className="mb-6 text-sm font-semibold">Event Distribution</h2>
            <div className="space-y-4">
              {events.map(e => (
                <div key={e.event_type}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-text-muted-light dark:text-text-muted-dark">
                      {getEventLabel(e.event_type)}
                    </span>
                    <span className="font-medium">{e.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-secondary-light dark:bg-surface-secondary-dark">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getEventColor(e.event_type)}`}
                      style={{ width: `${(e.count / maxCount) * 100}%`, opacity: 0.7 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </LiquidGlass>
        </div>
      )}
    </div>
  )
}
