import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate, cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/currency'
import type { PartnerConversion } from '@/modules/partner/types'

type ConversionWithPartner = PartnerConversion & { partner_name?: string; partner_email?: string }
type StatusFilter = 'all' | 'pending' | 'approved' | 'cancelled' | 'paid'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400',
  paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}

export default function AdminCommissions() {
  const [conversions, setConversions] = useState<ConversionWithPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const loadConversions = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('partner_conversions')
        .select('*, partner:partners(name, email)')
        .order('created_at', { ascending: false })
        .limit(500)

      if (error) throw error

      const rows = (data || []).map((row: Record<string, unknown>) => {
        const partner = row.partner as { name?: string; email?: string } | null
        return {
          ...(row as unknown as PartnerConversion),
          partner_name: partner?.name,
          partner_email: partner?.email,
        }
      })

      setConversions(rows)
    } catch {
      // silent
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadConversions() }, [loadConversions])

  const handleStatusUpdate = async (id: string, status: string) => {
    setUpdatingId(id)
    try {
      await supabase
        .from('partner_conversions')
        .update({ status })
        .eq('id', id)
      loadConversions()
    } catch {
      // silent
    }
    setUpdatingId(null)
  }

  const filtered = conversions.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        (c.partner_name || '').toLowerCase().includes(q) ||
        (c.partner_email || '').toLowerCase().includes(q)
      )
    }
    return true
  })

  const totalCommissions = conversions.reduce((sum, c) => sum + (c.commission_amount || 0), 0)
  const pendingCommissions = conversions.filter(c => c.status === 'pending').reduce((sum, c) => sum + (c.commission_amount || 0), 0)
  const approvedCommissions = conversions.filter(c => c.status === 'approved').reduce((sum, c) => sum + (c.commission_amount || 0), 0)
  const paidCommissions = conversions.filter(c => c.status === 'paid').reduce((sum, c) => sum + (c.commission_amount || 0), 0)

  const stats = [
    { label: 'Total Commissions', value: formatCurrency(totalCommissions) },
    { label: 'Pending', value: formatCurrency(pendingCommissions) },
    { label: 'Approved', value: formatCurrency(approvedCommissions) },
    { label: 'Paid', value: formatCurrency(paidCommissions) },
  ]

  const exportCsv = () => {
    const headers = ['Date', 'Partner', 'Email', 'Product Type', 'Sale Amount', 'Commission Rate', 'Commission', 'Status']
    const rows = filtered.map(c => [
      new Date(c.created_at).toLocaleDateString(),
      c.partner_name || '',
      c.partner_email || '',
      c.product_type || '',
      String(c.sale_amount),
      `${(c.commission_rate * 100).toFixed(1)}%`,
      String(c.commission_amount),
      c.status,
    ])

    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `commissions-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white/90">Commissions</h1>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-white/40">{conversions.length} total conversions</p>
        </div>
        <button onClick={exportCsv} className="w-full sm:w-auto admin-btn-primary">
          Export CSV
        </button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-2xl p-4 admin-glass">
            <p className="text-[10px] font-medium text-gray-500 dark:text-white/40 uppercase tracking-wider">{s.label}</p>
            <p className="mt-1 text-lg font-bold tabular-nums text-gray-900 dark:text-white/90">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by partner name or email..."
          className="w-full sm:max-w-xs admin-input"
        />
        <div className="flex gap-1 rounded-xl p-1 admin-glass">
          {(['all', 'pending', 'approved', 'cancelled', 'paid'] as StatusFilter[]).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all capitalize',
                statusFilter === s
                  ? 'bg-white shadow-sm dark:bg-white/[0.08] text-gray-900 dark:text-white/90'
                  : 'text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/60'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7700ff] border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center rounded-2xl p-12 text-center admin-glass">
          <p className="text-sm text-gray-500 dark:text-white/40">
            {search || statusFilter !== 'all' ? 'No commissions match your filters.' : 'No commissions yet.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl admin-glass">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-black/[0.06] dark:border-white/[0.08]">
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-white/40">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-white/40">Partner</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-white/40">Type</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-white/40">Sale</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-white/40">Rate</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-white/40">Commission</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-white/40">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-white/40"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr
                    key={c.id}
                    className="border-b border-black/[0.04] dark:border-white/[0.04] hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-500 dark:text-white/40">{formatDate(c.created_at)}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white/90">{c.partner_name || 'Unknown'}</p>
                        <p className="text-[10px] text-gray-400 dark:text-white/30">{c.partner_email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-white/40 capitalize">{c.product_type || '—'}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(c.sale_amount)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{(c.commission_rate * 100).toFixed(1)}%</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-gray-900 dark:text-white/90">{formatCurrency(c.commission_amount)}</td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', STATUS_COLORS[c.status] || STATUS_COLORS.pending)}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <select
                        value={c.status}
                        disabled={updatingId === c.id}
                        onChange={(e) => handleStatusUpdate(c.id, e.target.value)}
                        className="rounded-lg px-2 py-1.5 text-[11px] border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] outline-none text-gray-700 dark:text-white/70 disabled:opacity-50"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="paid">Paid</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
