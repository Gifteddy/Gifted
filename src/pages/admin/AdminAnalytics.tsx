import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { getAnalytics } from '@/lib/commerce-queries'
import { LiquidGlass } from '@/components/ui/LiquidGlass'

interface EventCount { event_type: string; count: number }

export default function AdminAnalytics() {
  const [events, setEvents] = useState<EventCount[]>([])
  const [totalEvents, setTotalEvents] = useState(0)
  const [commerce, setCommerce] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [analyticsData, countsRes, chatsRes] = await Promise.all([
          getAnalytics(days),
          supabase.rpc('get_event_counts'),
          supabase.from('chat_logs').select('id', { count: 'exact', head: true }),
        ])
        setCommerce(analyticsData)

        let rows: { event_type: string; count: number }[] = []
        if (countsRes.data) {
          rows = countsRes.data as { event_type: string; count: number }[]
          setTotalEvents(rows.reduce((s, r) => s + r.count, 0))
        } else {
          const { data } = await supabase.from('analytics').select('event_type').limit(10000)
          const counts: Record<string, number> = {}
          ;(data || []).forEach((e: any) => { counts[e.event_type] = (counts[e.event_type] || 0) + 1 })
          rows = Object.entries(counts).map(([event_type, count]) => ({ event_type, count }))
          setTotalEvents(rows.reduce((s, r) => s + r.count, 0))
        }

        const chatCount = chatsRes.count ?? 0
        setEvents(
          rows
            .concat([{ event_type: 'chat_interaction', count: chatCount }])
            .sort((a, b) => b.count - a.count)
        )
      } catch { /* silent */ }
      setLoading(false)
    }
    load()
  }, [days])

  const maxCount = Math.max(...events.map(e => e.count), 1)
  const getEventColor = (type: string) => ({
    page_view: 'bg-brand-500', project_view: 'bg-gold-500', chat_open: 'bg-emerald-500',
    message_sent: 'bg-blue-500', contact_request: 'bg-purple-500', chat_interaction: 'bg-rose-500',
  }[type] || 'bg-brand-500')
  const getEventLabel = (type: string) => ({
    page_view: 'Page Views', project_view: 'Project Views', chat_open: 'Chat Opens',
    message_sent: 'Messages Sent', contact_request: 'Contact Requests', chat_interaction: 'Chat Interactions',
  }[type] || type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Analytics</h1>
          <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1">{totalEvents} total events</p>
        </div>
        <select value={days} onChange={e => setDays(Number(e.target.value))}
          className="rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-white/5 px-3 py-2 text-xs outline-none focus:border-brand-500">
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" /></div>
      ) : (
        <>
          {/* Commerce Summary */}
          {commerce && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <LiquidGlass className="rounded-2xl p-5" intensity="subtle">
                <p className="text-2xl font-bold text-gradient">₦{commerce.totalRevenue.toLocaleString()}</p>
                <p className="mt-1 text-xs text-text-muted-light dark:text-text-muted-dark">Revenue</p>
              </LiquidGlass>
              <LiquidGlass className="rounded-2xl p-5" intensity="subtle">
                <p className="text-2xl font-bold text-gradient">{commerce.totalOrders}</p>
                <p className="mt-1 text-xs text-text-muted-light dark:text-text-muted-dark">Orders</p>
              </LiquidGlass>
              <LiquidGlass className="rounded-2xl p-5" intensity="subtle">
                <p className="text-2xl font-bold text-gradient">₦{commerce.avgOrderValue.toLocaleString()}</p>
                <p className="mt-1 text-xs text-text-muted-light dark:text-text-muted-dark">Avg Order Value</p>
              </LiquidGlass>
              <LiquidGlass className="rounded-2xl p-5" intensity="subtle">
                <p className="text-2xl font-bold text-gradient">{commerce.daily.length}</p>
                <p className="mt-1 text-xs text-text-muted-light dark:text-text-muted-dark">Active Days</p>
              </LiquidGlass>
            </div>
          )}

          {/* Revenue Chart */}
          {commerce?.daily?.length > 0 && (
            <LiquidGlass className="rounded-2xl p-6" intensity="subtle">
              <h2 className="text-sm font-semibold mb-4">Daily Revenue</h2>
              <div className="flex items-end gap-1 h-32">
                {commerce.daily.slice().reverse().map((d: any, i: number) => {
                  const maxRev = Math.max(...commerce.daily.map((x: any) => x.revenue), 1)
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                        ₦{d.revenue.toLocaleString()}
                      </div>
                      <motion.div
                        initial={{ height: 0 }} animate={{ height: `${(d.revenue / maxRev) * 100}%` }}
                        className="w-full rounded-t bg-brand-500/60 hover:bg-brand-500/80 transition-colors cursor-pointer"
                        style={{ maxHeight: '100%' }}
                      />
                    </div>
                  )
                })}
              </div>
            </LiquidGlass>
          )}

          {/* Top Products */}
          {commerce?.topSelling?.length > 0 && (
            <LiquidGlass className="rounded-2xl p-6" intensity="subtle">
              <h2 className="text-sm font-semibold mb-4">Top Selling Products</h2>
              <div className="space-y-3">
                {commerce.topSelling.map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs text-text-muted-light dark:text-text-muted-dark w-5 text-right">{i + 1}.</span>
                      <span className="truncate">{p.title}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-text-muted-light dark:text-text-muted-dark">
                      <span>{p.qty} sold</span>
                      <span className="font-medium text-text-light dark:text-text-dark">₦{p.rev.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </LiquidGlass>
          )}

          {/* Site Events */}
          {events.length > 0 && (
            <LiquidGlass className="rounded-2xl p-6" intensity="subtle">
              <h2 className="text-sm font-semibold mb-4">Site Events</h2>
              <div className="space-y-3">
                {events.map(e => (
                  <div key={e.event_type}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-text-muted-light dark:text-text-muted-dark">{getEventLabel(e.event_type)}</span>
                      <span className="font-medium">{e.count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-secondary-light dark:bg-surface-secondary-dark">
                      <div className={`h-full rounded-full transition-all duration-500 ${getEventColor(e.event_type)}`}
                        style={{ width: `${(e.count / maxCount) * 100}%`, opacity: 0.7 }} />
                    </div>
                  </div>
                ))}
              </div>
            </LiquidGlass>
          )}
        </>
      )}
    </div>
  )
}
