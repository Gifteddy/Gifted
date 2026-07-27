import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate, cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/currency'
import { useToast } from '@/components/ui/Toast'
import {
  suspendPartner,
  banPartner,
  getAllPartners,
  getPendingApplications,
  getAdminPartnerOverview,
} from '@/modules/partner/queries'
import type { Partner } from '@/modules/partner/types'
import { PARTNER_LEVELS } from '@/modules/partner/constants'
import { sendPushNotification } from '@/lib/push'

type Tab = 'applications' | 'all' | 'overview'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  suspended: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  banned: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  rejected: 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400',
}

export default function AdminPartners() {
  const [tab, setTab] = useState<Tab>('applications')
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<Partner[]>([])
  const [allPartners, setAllPartners] = useState<Partner[]>([])
  const [overview, setOverview] = useState<{
    totalPartners: number
    pendingApplications: number
    approvedPartners: number
    totalRevenue: number
    partnerRevenue: number
    totalCommissions: number
    pendingPayouts: number
  } | null>(null)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const toast = useToast(s => s.add)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [apps, all, ov] = await Promise.all([
        getPendingApplications(),
        getAllPartners(),
        getAdminPartnerOverview(),
      ])
      setApplications(apps)
      setAllPartners(all)
      setOverview(ov)
    } catch {
      toast('error', 'Failed to load partner data.')
    }
    setLoading(false)
  }, [toast])

  useEffect(() => { loadData() }, [loadData])

  const handleApprove = async (partner: Partner) => {
    setProcessingId(partner.id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/partner-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({ action: 'approve', partner_id: partner.id }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(err.error || 'API error')
      }
      sendPushNotification({
        userId: partner.auth_user_id || undefined,
        role: 'partner',
        title: 'Application Approved!',
        body: `Congratulations ${partner.name}! Your partner application has been approved.`,
        url: '/shop/partners/dashboard',
        tag: 'partner-approved',
      }).catch(() => {})
      toast('success', `${partner.name} has been approved.`)
      loadData()
    } catch (e) {
      toast('error', e instanceof Error ? e.message : 'Failed to approve partner.')
    }
    setProcessingId(null)
  }

  const handleReject = async (partner: Partner) => {
    setProcessingId(partner.id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/partner-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({ action: 'reject', partner_id: partner.id }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(err.error || 'API error')
      }
      toast('success', `${partner.name}'s application has been rejected.`)
      loadData()
    } catch (e) {
      toast('error', e instanceof Error ? e.message : 'Failed to reject partner.')
    }
    setProcessingId(null)
  }

  const handleSuspend = async (partner: Partner) => {
    setProcessingId(partner.id)
    try {
      await suspendPartner(partner.id)
      toast('success', `${partner.name} has been suspended.`)
      loadData()
    } catch {
      toast('error', 'Failed to suspend partner.')
    }
    setProcessingId(null)
  }

  const handleBan = async (partner: Partner) => {
    setProcessingId(partner.id)
    try {
      await banPartner(partner.id)
      toast('success', `${partner.name} has been banned.`)
      loadData()
    } catch {
      toast('error', 'Failed to ban partner.')
    }
    setProcessingId(null)
  }

  const handleDelete = async (partner: Partner) => {
    setProcessingId(partner.id)
    try {
      await supabase.from('partners').delete().eq('id', partner.id)
      toast('success', `${partner.name} has been deleted.`)
      loadData()
    } catch {
      toast('error', 'Failed to delete partner.')
    }
    setProcessingId(null)
  }

  const socialLinksSummary = (p: Partner) => {
    const links: string[] = []
    if (p.website) links.push('Website')
    if (p.instagram) links.push('Instagram')
    if (p.tiktok) links.push('TikTok')
    if (p.youtube) links.push('YouTube')
    if (p.twitter) links.push('Twitter')
    if (p.linkedin) links.push('LinkedIn')
    return links.length ? links.join(', ') : 'None'
  }

  const filtered = allPartners.filter(p => {
    if (!search) return true
    const q = search.toLowerCase()
    return p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
  })

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'applications', label: 'Applications', count: applications.length },
    { key: 'all', label: 'All Partners', count: allPartners.length },
    { key: 'overview', label: 'Overview' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white/90">Partners</h1>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-white/40">
          Manage partner applications, accounts, and performance
        </p>
      </div>

      <div className="mb-6 flex gap-1 rounded-2xl p-1 admin-glass">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex-1 rounded-xl px-4 py-2.5 text-xs font-medium transition-all',
              tab === t.key
                ? 'bg-white shadow-sm dark:bg-white/[0.08] text-gray-900 dark:text-white/90'
                : 'text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/60'
            )}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={cn(
                'ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                tab === t.key
                  ? 'bg-[#7700ff]/10 text-[#7700ff]'
                  : 'bg-black/5 dark:bg-white/5'
              )}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7700ff] border-t-transparent" />
        </div>
      ) : tab === 'applications' ? (
        <ApplicationsTab
          applications={applications}
          processingId={processingId}
          onApprove={handleApprove}
          onReject={handleReject}
          socialLinksSummary={socialLinksSummary}
        />
      ) : tab === 'all' ? (
        <AllPartnersTab
          partners={filtered}
          search={search}
          onSearch={setSearch}
          expandedId={expandedId}
          onToggleExpand={(id) => setExpandedId(expandedId === id ? null : id)}
          processingId={processingId}
          onSuspend={handleSuspend}
          onBan={handleBan}
          onDelete={handleDelete}
        />
      ) : (
        <OverviewTab overview={overview} topPartners={allPartners.slice().sort((a, b) => b.total_revenue_generated - a.total_revenue_generated).slice(0, 5)} />
      )}
    </div>
  )
}

function ApplicationsTab({
  applications,
  processingId,
  onApprove,
  onReject,
  socialLinksSummary,
}: {
  applications: Partner[]
  processingId: string | null
  onApprove: (p: Partner) => void
  onReject: (p: Partner) => void
  socialLinksSummary: (p: Partner) => string
}) {
  if (applications.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-2xl p-12 text-center admin-glass">
        <p className="text-sm text-gray-500 dark:text-white/40">No pending applications.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {applications.map(p => (
        <div key={p.id} className="rounded-2xl p-5 admin-glass">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7700ff]/10 text-sm font-bold text-[#7700ff]">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white/90">{p.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-white/40">{p.email}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-white/40">
                {p.phone && <span>{p.phone}</span>}
                {p.country && <span>{p.country}</span>}
                {p.primary_platform && <span>{p.primary_platform}</span>}
                {p.audience_size && <span>{p.audience_size} audience</span>}
                <span>Social: {socialLinksSummary(p)}</span>
              </div>
              {p.motivation && (
                <p className="mt-2 max-w-lg text-xs text-gray-500 dark:text-white/40 line-clamp-2">
                  "{p.motivation}"
                </p>
              )}
              <p className="mt-2 text-[10px] text-gray-400 dark:text-white/30">Applied {formatDate(p.created_at)}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                disabled={processingId === p.id}
                onClick={() => onApprove(p)}
                className="rounded-xl px-4 py-2 text-xs font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                {processingId === p.id ? '...' : 'Approve'}
              </button>
              <button
                disabled={processingId === p.id}
                onClick={() => onReject(p)}
                className="rounded-xl px-4 py-2 text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
              >
                Reject
              </button>
              <button
                disabled={processingId === p.id}
                onClick={() => onReject(p)}
                className="rounded-xl px-4 py-2 text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
              >
                More Info
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function AllPartnersTab({
  partners,
  search,
  onSearch,
  expandedId,
  onToggleExpand,
  processingId,
  onSuspend,
  onBan,
  onDelete,
}: {
  partners: Partner[]
  search: string
  onSearch: (s: string) => void
  expandedId: string | null
  onToggleExpand: (id: string) => void
  processingId: string | null
  onSuspend: (p: Partner) => void
  onBan: (p: Partner) => void
  onDelete: (p: Partner) => void
}) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  return (
    <>
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full sm:max-w-xs admin-input"
        />
      </div>

      {partners.length === 0 ? (
        <div className="flex items-center justify-center rounded-2xl p-12 text-center admin-glass">
          <p className="text-sm text-gray-500 dark:text-white/40">
            {search ? 'No partners match your search.' : 'No partners yet.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl admin-glass">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-black/[0.06] dark:border-white/[0.08]">
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-white/40">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-white/40">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-white/40">Level</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-white/40">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-white/40">Revenue</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-white/40">Conv.</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-white/40">Joined</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-white/40"></th>
                </tr>
              </thead>
              <tbody>
                {partners.map(p => (
                  <>
                    <tr
                      key={p.id}
                      className="border-b border-black/[0.04] dark:border-white/[0.04] hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer transition-colors"
                      onClick={() => onToggleExpand(p.id)}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white/90">{p.name}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-white/40">{p.email}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium">
                          <span>{PARTNER_LEVELS[p.level].icon}</span>
                          <span style={{ color: PARTNER_LEVELS[p.level].color }}>{PARTNER_LEVELS[p.level].label}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', STATUS_COLORS[p.status] || STATUS_COLORS.pending)}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(p.total_revenue_generated)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{p.total_conversions}</td>
                      <td className="px-4 py-3 text-right text-gray-500 dark:text-white/40">{formatDate(p.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-gray-400 dark:text-white/30">{expandedId === p.id ? '▲' : '▼'}</span>
                      </td>
                    </tr>
                    {expandedId === p.id && (
                      <tr key={`${p.id}-expanded`}>
                        <td colSpan={8} className="px-4 py-4 bg-black/[0.01] dark:bg-white/[0.01]">
                          <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                              <p className="text-[10px] font-medium text-gray-400 dark:text-white/30 uppercase tracking-wider mb-1">Stats</p>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between"><span className="text-gray-500 dark:text-white/40">Clicks</span><span className="tabular-nums">{p.total_clicks.toLocaleString()}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500 dark:text-white/40">Conversions</span><span className="tabular-nums">{p.total_conversions.toLocaleString()}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500 dark:text-white/40">Revenue</span><span className="tabular-nums">{formatCurrency(p.total_revenue_generated)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500 dark:text-white/40">Commission Earned</span><span className="tabular-nums">{formatCurrency(p.total_commission_earned)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500 dark:text-white/40">Pending</span><span className="tabular-nums">{formatCurrency(p.pending_commission)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500 dark:text-white/40">Paid</span><span className="tabular-nums">{formatCurrency(p.paid_commission)}</span></div>
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] font-medium text-gray-400 dark:text-white/30 uppercase tracking-wider mb-1">Profile</p>
                              <div className="space-y-1 text-xs">
                                {p.phone && <div className="flex justify-between"><span className="text-gray-500 dark:text-white/40">Phone</span><span>{p.phone}</span></div>}
                                {p.country && <div className="flex justify-between"><span className="text-gray-500 dark:text-white/40">Country</span><span>{p.country}</span></div>}
                                {p.primary_platform && <div className="flex justify-between"><span className="text-gray-500 dark:text-white/40">Platform</span><span>{p.primary_platform}</span></div>}
                                {p.audience_size && <div className="flex justify-between"><span className="text-gray-500 dark:text-white/40">Audience</span><span>{p.audience_size}</span></div>}
                                <div className="flex justify-between"><span className="text-gray-500 dark:text-white/40">Referral Code</span><span className="font-mono">{p.referral_code}</span></div>
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] font-medium text-gray-400 dark:text-white/30 uppercase tracking-wider mb-1">Actions</p>
                              <div className="space-y-2 mt-2">
                                {p.status !== 'suspended' && (
                                  <button
                                    disabled={processingId === p.id}
                                    onClick={(e) => { e.stopPropagation(); onSuspend(p) }}
                                    className="w-full rounded-xl px-3 py-2 text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
                                  >
                                    Suspend
                                  </button>
                                )}
                                {p.status !== 'banned' && (
                                  <button
                                    disabled={processingId === p.id}
                                    onClick={(e) => { e.stopPropagation(); onBan(p) }}
                                    className="w-full rounded-xl px-3 py-2 text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                  >
                                    Ban
                                  </button>
                                )}
                                <button
                                  disabled={processingId === p.id}
                                  onClick={(e) => { e.stopPropagation(); setDeleteConfirm(p.id) }}
                                  className="w-full rounded-xl px-3 py-2 text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl p-6 admin-glass-strong">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white/90">Delete Partner</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-white/40">This action cannot be undone. The partner will be permanently removed.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="rounded-xl px-4 py-2 text-sm text-gray-500 transition-colors hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5">Cancel</button>
              <button
                onClick={() => {
                  const p = partners.find(x => x.id === deleteConfirm)
                  if (p) onDelete(p)
                  setDeleteConfirm(null)
                }}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function OverviewTab({
  overview,
  topPartners,
}: {
  overview: {
    totalPartners: number
    pendingApplications: number
    approvedPartners: number
    totalRevenue: number
    partnerRevenue: number
    totalCommissions: number
    pendingPayouts: number
  } | null
  topPartners: Partner[]
}) {
  if (!overview) return null

  const stats = [
    { label: 'Total Partners', value: overview.totalPartners },
    { label: 'Pending Applications', value: overview.pendingApplications },
    { label: 'Approved Partners', value: overview.approvedPartners },
  ]

  const financials = [
    { label: 'Total Revenue', value: formatCurrency(overview.totalRevenue) },
    { label: 'Partner Revenue', value: formatCurrency(overview.partnerRevenue) },
    { label: 'Total Commissions', value: formatCurrency(overview.totalCommissions) },
    { label: 'Pending Payouts', value: formatCurrency(overview.pendingPayouts) },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map(s => (
          <div key={s.label} className="rounded-2xl p-5 admin-glass">
            <p className="text-xs text-gray-500 dark:text-white/40">{s.label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900 dark:text-white/90">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {financials.map(s => (
          <div key={s.label} className="rounded-2xl p-5 admin-glass">
            <p className="text-xs text-gray-500 dark:text-white/40">{s.label}</p>
            <p className="mt-1 text-lg font-bold tabular-nums text-gray-900 dark:text-white/90">{s.value}</p>
          </div>
        ))}
      </div>

      {topPartners.length > 0 && (
        <div className="rounded-2xl p-5 admin-glass">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white/90 mb-4">Top 5 Partners by Revenue</h3>
          <div className="space-y-3">
            {topPartners.map((p, i) => (
              <div key={p.id} className="flex items-center gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#7700ff]/10 text-xs font-bold text-[#7700ff]">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white/90">{p.name}</span>
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', STATUS_COLORS[p.status] || STATUS_COLORS.pending)}>
                      {p.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-white/40">{p.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums text-gray-900 dark:text-white/90">{formatCurrency(p.total_revenue_generated)}</p>
                  <p className="text-[10px] text-gray-500 dark:text-white/40">{p.total_conversions} conversions</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
