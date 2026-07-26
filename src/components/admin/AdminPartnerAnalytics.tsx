import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { getAdminPartnerAnalytics } from '@/modules/affiliate/queries'

interface AnalyticsData {
  totalPartners: number
  activePartners: number
  pendingApplications: number
  suspendedPartners: number
  totalCommissions: number
  pendingPayouts: number
  totalClicks: number
  conversionRate: number
  monthlyCommissionsThisMonth: number
  monthlyClicksThisMonth: number
  monthlyTrend: { month: string; commissions: number; clicks: number; signups: number }[]
  topEarners: { id: string; name: string; email: string; total_earnings: number; total_sales: number; total_clicks: number }[]
}

export function AdminPartnerAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminPartnerAnalytics().then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-[#7700ff] border-t-transparent" /></div>
  }
  if (!data) return null

  const maxTrendCommissions = Math.max(...data.monthlyTrend.map(t => t.commissions), 1)
  const maxTrendClicks = Math.max(...data.monthlyTrend.map(t => t.clicks), 1)

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Active Partners', value: data.activePartners.toString(), color: 'text-[#7700ff]' },
          { label: 'Pending Applications', value: data.pendingApplications.toString(), color: 'text-amber-500' },
          { label: 'Total Commissions', value: `₦${data.totalCommissions.toLocaleString()}`, color: 'text-emerald-500' },
          { label: 'Platform Conversion', value: `${data.conversionRate.toFixed(1)}%`, color: 'text-blue-500' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 admin-glass text-center">
            <p className={cn('text-xl font-bold', s.color)}>{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-white/40 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Monthly Trend Chart */}
      <div className="rounded-2xl p-6 admin-glass">
        <h3 className="text-sm font-semibold mb-4 text-gray-900 dark:text-white/90">6-Month Trend</h3>
        <div className="flex items-end gap-2 h-40">
          {data.monthlyTrend.map((t, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex gap-0.5 items-end" style={{ height: '120px' }}>
                <div className="flex-1 rounded-t bg-[#7700ff]/80 transition-all" style={{ height: `${(t.commissions / maxTrendCommissions) * 100}%`, minHeight: t.commissions > 0 ? '4px' : '0' }} />
                <div className="flex-1 rounded-t bg-[#7700ff]/30 transition-all" style={{ height: `${(t.clicks / maxTrendClicks) * 100}%`, minHeight: t.clicks > 0 ? '4px' : '0' }} />
              </div>
              <span className="text-[10px] text-gray-400 dark:text-white/30">{t.month}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 mt-3">
          <span className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-white/40">
            <span className="h-2 w-2 rounded-sm bg-[#7700ff]/80" /> Commissions
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-white/40">
            <span className="h-2 w-2 rounded-sm bg-[#7700ff]/30" /> Clicks
          </span>
        </div>
      </div>

      {/* Top Earners */}
      <div className="rounded-2xl p-6 admin-glass">
        <h3 className="text-sm font-semibold mb-4 text-gray-900 dark:text-white/90">Top Earning Partners</h3>
        {data.topEarners.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-white/40 text-center py-6">No data yet.</p>
        ) : (
          <div className="space-y-2">
            {data.topEarners.map((a, i) => (
              <div key={a.id} className="flex items-center justify-between py-2 px-3 -mx-3 rounded-xl hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-gray-400 w-4">{i + 1}</span>
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white/90">{a.name}</span>
                    <span className="text-xs text-gray-500 dark:text-white/40 ml-2">{a.total_sales || 0} sales</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-white/70">₦{(a.total_earnings || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* This Month */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl p-4 admin-glass text-center">
          <p className="text-xl font-bold text-[#7700ff]">₦{data.monthlyCommissionsThisMonth.toLocaleString()}</p>
          <p className="text-xs text-gray-500 dark:text-white/40 mt-1">Commissions This Month</p>
        </div>
        <div className="rounded-2xl p-4 admin-glass text-center">
          <p className="text-xl font-bold text-[#7700ff]">{data.monthlyClicksThisMonth.toLocaleString()}</p>
          <p className="text-xs text-gray-500 dark:text-white/40 mt-1">Clicks This Month</p>
        </div>
      </div>
    </div>
  )
}
