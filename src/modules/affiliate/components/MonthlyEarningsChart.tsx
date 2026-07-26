import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/currency'

interface MonthlyEarningsChartProps {
  monthlyData: { month: string; earnings: number; sales: number }[]
}

export function MonthlyEarningsChart({ monthlyData }: MonthlyEarningsChartProps) {
  const maxEarnings = Math.max(...monthlyData.map(m => m.earnings), 1)

  return (
    <div className="rounded-2xl border border-black/[0.04] dark:border-white/[0.06] bg-white/30 dark:bg-white/[0.01] p-5 sm:p-6">
      <h2 className="font-display text-sm font-semibold mb-4 text-gray-900 dark:text-white/90">Monthly Earnings</h2>
      <div className="flex items-end gap-2 h-40">
        {monthlyData.length === 0 ? (
          <div className="w-full flex items-center justify-center h-full">
            <p className="text-xs text-text-muted-light dark:text-text-muted-dark">No data yet</p>
          </div>
        ) : monthlyData.map((m) => (
          <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
            <div className="relative w-full flex flex-col items-center group">
              <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-900 dark:bg-white/10 text-white dark:text-white/90 text-[9px] px-2 py-1 rounded-md whitespace-nowrap">
                {formatCurrency(m.earnings)}
              </div>
              <div
                className="w-full rounded-sm bg-gradient-to-t from-brand-500/60 to-brand-500/30 dark:from-brand-400/50 dark:to-brand-400/20 transition-all duration-500"
                style={{ height: `${Math.max((m.earnings / maxEarnings) * 100, 4)}%` }}
              />
            </div>
            <span className="text-[10px] text-text-muted-light/60 dark:text-text-muted-dark/60">{m.month}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
