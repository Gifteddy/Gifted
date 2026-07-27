import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/currency'
import { Meta } from '@/lib/meta'
import { usePartnerStore } from '@/store/partner'
import { getPartnerAnalytics } from '@/modules/partner/queries'
import type { PartnerAnalyticsPeriod } from '@/modules/partner/types'

const periods = [
  { key: 'day' as const, label: 'Today' },
  { key: 'week' as const, label: 'This Week' },
  { key: 'month' as const, label: 'This Month' },
  { key: 'year' as const, label: 'This Year' },
]

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-white/40">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-gray-900 dark:text-white/90">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-400 dark:text-white/30">{sub}</p>}
    </div>
  )
}

export default function PartnerAnalytics() {
  const partner = usePartnerStore((s) => s.partner)
  const loading = usePartnerStore((s) => s.loading)

  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month')
  const [data, setData] = useState<PartnerAnalyticsPeriod | null>(null)
  const [fetching, setFetching] = useState(true)

  const fetchData = useCallback(async () => {
    if (!partner) return
    setFetching(true)
    try {
      const result = await getPartnerAnalytics(partner.id, period)
      setData(result)
    } catch {
      /* silent */
    }
    setFetching(false)
  }, [partner, period])

  useEffect(() => {
    fetchData()
  }, [fetchData])

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
        <div className="text-4xl">📊</div>
        <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white/90">Partner Account Required</h2>
        <p className="max-w-sm text-sm text-gray-500 dark:text-white/50">Join the partner programme to view your analytics.</p>
      </div>
    )
  }

  const maxDailyClicks = data ? Math.max(...data.daily.map((d) => d.clicks), 1) : 1
  const maxDailyRevenue = data ? Math.max(...data.daily.map((d) => d.revenue), 1) : 1

  return (
    <>
      <Meta title="Analytics" description="Track your referral performance" />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white/90 sm:text-3xl">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-white/50">Track your performance across all time periods</p>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={cn(
                'shrink-0 rounded-xl px-5 py-2 text-xs font-medium transition-all',
                period === p.key
                  ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/25'
                  : 'border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/[0.06]'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {fetching ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
        ) : data ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <StatCard label="Clicks" value={data.clicks.toLocaleString()} />
              <StatCard label="Conversions" value={data.conversions.toLocaleString()} />
              <StatCard label="Revenue" value={formatCurrency(data.revenue)} />
              <StatCard label="Commission" value={formatCurrency(data.commission)} />
              <StatCard label="Conversion Rate" value={`${data.conversionRate}%`} />
            </div>

            <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50">Daily Clicks</h2>
              {data.daily.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400 dark:text-white/30">No data for this period</p>
              ) : (
                <div className="flex items-end gap-1 overflow-x-auto pb-2" style={{ minHeight: 120 }}>
                  {data.daily.map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-1" style={{ minWidth: Math.max(28, 100 / data.daily.length) + '%' }}>
                      <div
                        className="w-full rounded-t bg-brand-500/80 transition-all"
                        style={{ height: `${(day.clicks / maxDailyClicks) * 100}px`, minHeight: day.clicks > 0 ? 4 : 0 }}
                      />
                      <span className="text-[9px] text-gray-400 dark:text-white/30 whitespace-nowrap">
                        {day.date.slice(5)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50">Daily Revenue</h2>
              {data.daily.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400 dark:text-white/30">No data for this period</p>
              ) : (
                <div className="flex items-end gap-1 overflow-x-auto pb-2" style={{ minHeight: 120 }}>
                  {data.daily.map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-1" style={{ minWidth: Math.max(28, 100 / data.daily.length) + '%' }}>
                      <div
                        className="w-full rounded-t bg-emerald-500/80 transition-all"
                        style={{ height: `${(day.revenue / maxDailyRevenue) * 100}px`, minHeight: day.revenue > 0 ? 4 : 0 }}
                      />
                      <span className="text-[9px] text-gray-400 dark:text-white/30 whitespace-nowrap">
                        {day.date.slice(5)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50">Daily Breakdown</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-black/[0.06] dark:border-white/[0.08]">
                      <th className="pb-2 pr-4 font-medium text-gray-500 dark:text-white/40">Date</th>
                      <th className="pb-2 pr-4 font-medium text-gray-500 dark:text-white/40">Clicks</th>
                      <th className="pb-2 pr-4 font-medium text-gray-500 dark:text-white/40">Conversions</th>
                      <th className="pb-2 pr-4 font-medium text-gray-500 dark:text-white/40">Revenue</th>
                      <th className="pb-2 font-medium text-gray-500 dark:text-white/40">Commission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.daily.filter((d) => d.clicks > 0 || d.conversions > 0).slice(-14).reverse().map((day, i) => (
                      <tr key={i} className="border-b border-black/[0.03] dark:border-white/[0.03]">
                        <td className="py-2 pr-4 font-medium text-gray-700 dark:text-white/70">{day.date}</td>
                        <td className="py-2 pr-4 text-gray-600 dark:text-white/60">{day.clicks}</td>
                        <td className="py-2 pr-4 text-gray-600 dark:text-white/60">{day.conversions}</td>
                        <td className="py-2 pr-4 text-gray-600 dark:text-white/60">{formatCurrency(day.revenue)}</td>
                        <td className="py-2 text-green-600 dark:text-green-400">{formatCurrency(day.commission)}</td>
                      </tr>
                    ))}
                    {data.daily.filter((d) => d.clicks > 0 || d.conversions > 0).length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-400 dark:text-white/30">No activity for this period</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/[0.1] dark:border-white/[0.1] py-16 text-center">
            <div className="text-4xl">📈</div>
            <p className="mt-3 font-display text-lg font-semibold text-gray-900 dark:text-white/90">No data yet</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-white/50">Start sharing your referral link to see analytics</p>
          </div>
        )}
      </div>
    </>
  )
}
