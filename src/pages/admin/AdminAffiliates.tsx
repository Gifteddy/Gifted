import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate, cn } from '@/lib/utils'
import { useAdminStore } from '@/store/admin'
import { PartnerDetailModal } from '@/components/admin/PartnerDetailModal'
import { AdminPartnerAnalytics } from '@/components/admin/AdminPartnerAnalytics'
import type { Affiliate, AffiliatePayout, AffiliateCommission } from '@/lib/commerce-types'

type TabKey = 'applications' | 'active' | 'commissions' | 'payouts' | 'performance'

export default function AdminAffiliates() {
  const { user: _user } = useAdminStore()
  const [tab, setTab] = useState<TabKey>('applications')
  const [affiliates, setAffiliates] = useState<Affiliate[]>([])
  const [payouts, setPayouts] = useState<AffiliatePayout[]>([])
  const [commissions, setCommissions] = useState<AffiliateCommission[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [detailAffiliate, setDetailAffiliate] = useState<Affiliate | null>(null)
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [payoutAffiliateId, setPayoutAffiliateId] = useState('')
  const [payoutAmount, setPayoutAmount] = useState('')
  const [payoutMethod, setPayoutMethod] = useState('bank_transfer')
  const [payoutNotes, setPayoutNotes] = useState('')
  const [payoutSaving, setPayoutSaving] = useState(false)

  const [showAssetModal, setShowAssetModal] = useState(false)
  const [assetTitle, setAssetTitle] = useState('')
  const [assetType, setAssetType] = useState('image')
  const [assetDesc, setAssetDesc] = useState('')
  const [assetContent, setAssetContent] = useState('')
  const [assetFileUrl, setAssetFileUrl] = useState('')
  const [assetSaving, setAssetSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [processingPayout, setProcessingPayout] = useState<string | null>(null)

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 5000)
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [affRes, payRes, commRes] = await Promise.all([
        supabase.from('affiliates').select('id, name, email, phone, referral_code, status, total_clicks, total_sales, total_earnings, pending_earnings, created_at, social_links, bank_name, account_name, account_number, auth_user_id').order('created_at', { ascending: false }),
        supabase.from('affiliate_payouts').select('id, affiliate_id, amount, status, payment_method, notes, created_at, processed_at, paystack_reference').order('created_at', { ascending: false }),
        supabase.from('affiliate_commissions').select('id, affiliate_id, amount, status, product_type, rate, created_at, product_title').order('created_at', { ascending: false }),
      ])
      setAffiliates((affRes.data || []) as unknown as Affiliate[])
      setPayouts((payRes.data || []) as unknown as AffiliatePayout[])
      setCommissions((commRes.data || []) as unknown as AffiliateCommission[])
    } catch {
      showToast('error', 'Failed to load partner data.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handlePartnerAuth = async (action: string, aff: Affiliate) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }
      const res = await fetch('/api/partner-auth', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action,
          affiliate_id: aff.id,
          name: aff.name,
          email: aff.email,
          referral_code: aff.referral_code,
        }),
      })
      if (!res.ok) {
        if (res.status === 404) {
          return 'API route not deployed. Deploy to Vercel to enable auth user creation and email.'
        }
        const text = await res.text().catch(() => '')
        const data = text ? JSON.parse(text) : {}
        return data.error || `Server returned ${res.status}`
      }
      const data = await res.json()
      if (!data.emailSent) {
        return 'Auth user created but email not sent (set RESEND_API_KEY on server)'
      }
      return null
    } catch {
      return 'Could not reach the partner auth API. Deploy to Vercel first.'
    }
  }

  const handleApprove = async (id: string) => {
    const aff = affiliates.find(a => a.id === id)
    if (!aff) return
    const err = await handlePartnerAuth('approve', aff)
    if (err) { showToast('error', err); return }
    showToast('success', `Approved! Auth user created. Email sent to ${aff.email}`)
    loadData()
  }

  const handleReject = async (id: string) => {
    const aff = affiliates.find(a => a.id === id)
    if (!aff) return
    const err = await handlePartnerAuth('reject', aff)
    if (err) { showToast('error', err); return }
    showToast('success', `Rejected. Email sent to ${aff.email}`)
    loadData()
  }

  const handleSuspend = async (id: string) => {
    await supabase.from('affiliates').update({ status: 'suspended' }).eq('id', id)
    showToast('success', 'Partner suspended.')
    loadData()
  }

  const handleReactivate = async (id: string) => {
    await supabase.from('affiliates').update({ status: 'approved' }).eq('id', id)
    showToast('success', 'Partner reactivated.')
    loadData()
  }

  const handlePayoutStatus = async (id: string, status: string) => {
    await supabase.from('affiliate_payouts').update({
      status,
      processed_at: status === 'paid' || status === 'rejected' ? new Date().toISOString() : null,
    }).eq('id', id)
    loadData()
  }

  const handleProcessPayout = async (id: string) => {
    setProcessingPayout(id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`
      const res = await fetch('/api/process-payout', {
        method: 'POST',
        headers,
        body: JSON.stringify({ payout_id: id }),
      })
      const data = await res.json()
      if (!res.ok) {
        showToast('error', data.error || 'Failed to process payout')
      } else {
        showToast('success', `Payout of ₦${data.amount?.toLocaleString()} processed successfully. Ref: ${data.transfer_reference}`)
        loadData()
      }
    } catch {
      showToast('error', 'Could not reach the payout API. Make sure the server is deployed.')
    }
    setProcessingPayout(null)
  }

  const handleCommissionStatus = async (id: string, status: string) => {
    await supabase.from('affiliate_commissions').update({ status }).eq('id', id)
    loadData()
  }

  const handleCreatePayout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!payoutAffiliateId || !payoutAmount) return
    setPayoutSaving(true)
    await supabase.from('affiliate_payouts').insert({
      affiliate_id: payoutAffiliateId,
      amount: parseFloat(payoutAmount),
      payment_method: payoutMethod,
      notes: payoutNotes.trim(),
      status: 'pending',
    }).select()
    setPayoutSaving(false)
    setShowPayoutModal(false)
    setPayoutAffiliateId('')
    setPayoutAmount('')
    setPayoutMethod('bank_transfer')
    setPayoutNotes('')
    loadData()
  }

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assetTitle) return
    setAssetSaving(true)
    await supabase.from('marketing_assets').insert({
      title: assetTitle,
      type: assetType,
      description: assetDesc,
      content: assetContent || null,
      file_url: assetFileUrl || null,
      downloadable: true,
    })
    setAssetSaving(false)
    setShowAssetModal(false)
    setAssetTitle('')
    setAssetType('image')
    setAssetDesc('')
    setAssetContent('')
    setAssetFileUrl('')
  }

  const exportCSV = (rows: Record<string, unknown>[], filename: string) => {
    if (!rows.length) return
    const headers = Object.keys(rows[0])
    const csv = [
      headers.join(','),
      ...rows.map(row => headers.map(h => {
        const val = String(row[h] ?? '')
        return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val
      }).join(','))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'applications', label: 'Applications' },
    { key: 'active', label: 'Active' },
    { key: 'commissions', label: 'Commissions' },
    { key: 'payouts', label: 'Payouts' },
    { key: 'performance', label: 'Performance' },
  ]

  const applications = affiliates.filter(a => a.status === 'pending')
  const activeAffiliates = affiliates.filter(a => a.status === 'approved')
  const suspendedAffiliates = affiliates.filter(a => a.status === 'suspended')

  const filteredApplications = applications.filter(a =>
    !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase()) || a.referral_code?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredActive = activeAffiliates.filter(a =>
    !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase()) || a.referral_code?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredCommissions = commissions.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (!search) return true
    const aff = affiliates.find(a => a.id === c.affiliate_id)
    return aff?.name.toLowerCase().includes(search.toLowerCase()) || aff?.email.toLowerCase().includes(search.toLowerCase())
  })

  const filteredPayouts = payouts.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    if (!search) return true
    const aff = affiliates.find(a => a.id === p.affiliate_id)
    return aff?.name.toLowerCase().includes(search.toLowerCase()) || aff?.email.toLowerCase().includes(search.toLowerCase())
  })

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      suspended: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    }
    return colors[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
  }

  const statusOptions = ['all', 'pending', 'approved', 'paid', 'rejected', 'cancelled', 'suspended']

  return (
    <div>
      {toast && (
        <div className={cn('mb-4 rounded-xl px-4 py-3 text-xs font-medium', toast.type === 'success' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400')}>
          {toast.message}
        </div>
      )}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white/90">Partners</h1>
        <button onClick={() => setShowAssetModal(true)}
          className="rounded-xl bg-[#7700ff] px-4 py-2 text-xs font-medium text-white hover:bg-[#9900ff] transition-colors">
          Add Marketing Asset
        </button>
      </div>

      <div className="mb-4 flex items-center gap-3 overflow-x-auto">
        <div className="flex items-center gap-1 rounded-xl bg-black/[0.03] p-0.5 dark:bg-white/[0.03]">
          {tabs.map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setSearch(''); setStatusFilter('all') }}
              className={cn('rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors',
                tab === t.key
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-[#1a1a2e] dark:text-white/90'
                  : 'text-gray-500 hover:text-gray-700 dark:text-white/50 dark:hover:text-white/80'
              )}>
              {t.label}
              {t.key === 'applications' && applications.length > 0 && (
                <span className="ml-1.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] text-red-600 dark:bg-red-900/30 dark:text-red-400">{applications.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Search + Filter bar (shown on most tabs) */}
      {tab !== 'performance' && (
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={tab === 'applications' ? 'Search applications...' : tab === 'active' ? 'Search partners...' : tab === 'commissions' ? 'Search by partner name...' : 'Search by partner name...'}
            className="w-full sm:max-w-xs admin-input" />
          {(tab === 'commissions' || tab === 'payouts') && (
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="admin-input w-full sm:w-auto">
              {statusOptions.map(s => (
                <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          )}
          {tab === 'commissions' && filteredCommissions.length > 0 && (
            <button onClick={() => exportCSV(filteredCommissions.map(c => {
              const aff = affiliates.find(a => a.id === c.affiliate_id)
              return { partner: aff?.name || c.affiliate_id, email: aff?.email || '', amount: c.amount, status: c.status, product_type: c.product_type, rate: c.rate, date: c.created_at }
            }), 'commissions')}
              className="rounded-xl border border-gray-200 dark:border-white/10 px-3 py-2 text-xs font-medium text-gray-600 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 transition-colors whitespace-nowrap">
              Export CSV
            </button>
          )}
          {tab === 'payouts' && filteredPayouts.length > 0 && (
            <button onClick={() => exportCSV(filteredPayouts.map(p => {
              const aff = affiliates.find(a => a.id === p.affiliate_id)
              return { partner: aff?.name || p.affiliate_id, email: aff?.email || '', amount: p.amount, status: p.status, payment_method: p.payment_method, notes: p.notes || '', date: p.created_at }
            }), 'payouts')}
              className="rounded-xl border border-gray-200 dark:border-white/10 px-3 py-2 text-xs font-medium text-gray-600 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 transition-colors whitespace-nowrap">
              Export CSV
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7700ff] border-t-transparent" />
        </div>
      ) : tab === 'applications' ? (
        filteredApplications.length === 0 ? (
          <div className="flex items-center justify-center rounded-2xl p-12 text-center admin-glass">
            <p className="text-sm text-gray-500 dark:text-white/40">{search ? 'No applications match your search.' : 'No pending applications.'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredApplications.map(a => (
              <div key={a.id} className="rounded-2xl p-4 transition-all hover:scale-[1.002] admin-glass">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white/90">{a.name}</span>
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', statusBadge(a.status))}>{a.status}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-gray-500 dark:text-white/40">{a.email}</div>
                    {a.reason && <p className="mt-1 text-xs text-gray-400 dark:text-white/30 line-clamp-2">{a.reason}</p>}
                    {a.audience_description && <p className="text-xs text-gray-400 dark:text-white/30 line-clamp-1">Audience: {a.audience_description}</p>}
                    {a.social_links && <p className="text-xs text-gray-400 dark:text-white/30">Social: {a.social_links}</p>}
                    <p className="mt-1 text-[10px] text-gray-400 dark:text-white/30">{formatDate(a.created_at)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button onClick={() => setDetailAffiliate(a)}
                      className="rounded-xl border border-gray-200 dark:border-white/10 px-3 py-2 text-xs font-medium text-gray-600 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">View</button>
                    <button onClick={() => handleApprove(a.id)}
                      className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-600">Approve</button>
                    <button onClick={() => handleReject(a.id)}
                      className="rounded-xl bg-red-500 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-red-600">Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : tab === 'active' ? (
        filteredActive.length === 0 ? (
          <div className="flex items-center justify-center rounded-2xl p-12 text-center admin-glass">
            <p className="text-sm text-gray-500 dark:text-white/40">{search ? 'No partners match your search.' : 'No active partners yet.'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredActive.map(a => (
              <div key={a.id} className="rounded-2xl p-4 transition-all hover:scale-[1.002] admin-glass">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white/90">{a.name}</span>
                      <span className="text-xs text-gray-500 dark:text-white/40">{a.email}</span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-white/40">
                      <span>Code: <strong className="text-gray-700 dark:text-white/70">{a.referral_code}</strong></span>
                      <span className="hidden sm:inline">·</span>
                      <span>{a.total_clicks || 0} clicks</span>
                      <span>·</span>
                      <span>{a.total_sales || 0} sales</span>
                      <span>·</span>
                      <span>Earned: ₦{(a.total_earnings || 0).toLocaleString()}</span>
                      <span>·</span>
                      <span>Pending: ₦{(a.pending_earnings || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button onClick={() => setDetailAffiliate(a)}
                      className="rounded-xl border border-gray-200 dark:border-white/10 px-3 py-2 text-xs font-medium text-gray-600 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">Details</button>
                    <button onClick={() => { setPayoutAffiliateId(a.id); setShowPayoutModal(true) }}
                      className="rounded-xl bg-[#7700ff] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#9900ff]">Create Payout</button>
                    <button onClick={() => handleSuspend(a.id)}
                      className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 transition-colors hover:bg-red-500/20">Suspend</button>
                  </div>
                </div>
              </div>
            ))}
            {/* Suspended partners section */}
            {suspendedAffiliates.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-white/40 mb-2">Suspended ({suspendedAffiliates.length})</h3>
                <div className="space-y-2">
                  {suspendedAffiliates.filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase())).map(a => (
                    <div key={a.id} className="rounded-2xl p-4 admin-glass opacity-60">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white/90">{a.name}</span>
                            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', statusBadge('suspended'))}>suspended</span>
                          </div>
                          <div className="mt-0.5 text-xs text-gray-500 dark:text-white/40">{a.email}</div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <button onClick={() => setDetailAffiliate(a)}
                            className="rounded-xl border border-gray-200 dark:border-white/10 px-3 py-2 text-xs font-medium text-gray-600 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">Details</button>
                          <button onClick={() => handleReactivate(a.id)}
                            className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-600">Reactivate</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      ) : tab === 'commissions' ? (
        filteredCommissions.length === 0 ? (
          <div className="flex items-center justify-center rounded-2xl p-12 text-center admin-glass">
            <p className="text-sm text-gray-500 dark:text-white/40">{search || statusFilter !== 'all' ? 'No commissions match your filters.' : 'No commissions yet.'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredCommissions.slice(0, 50).map(c => {
              const aff = affiliates.find(a => a.id === c.affiliate_id)
              return (
                <div key={c.id} className="rounded-2xl p-4 transition-all hover:scale-[1.002] admin-glass">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white/90">{aff?.name || c.affiliate_id}</span>
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', statusBadge(c.status))}>{c.status}</span>
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-white/40">
                        <span>Amount: <strong>₦{(c.amount || 0).toLocaleString()}</strong></span>
                        <span>·</span>
                        <span className="capitalize">{c.product_type}</span>
                        <span>·</span>
                        <span>Rate: {(c.rate * 100).toFixed(0)}%</span>
                        <span>·</span>
                        <span>{formatDate(c.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {c.status === 'pending' && (
                        <>
                          <button onClick={() => handleCommissionStatus(c.id, 'approved')}
                            className="rounded-xl bg-blue-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-600">Approve</button>
                          <button onClick={() => handleCommissionStatus(c.id, 'cancelled')}
                            className="rounded-xl bg-red-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-red-600">Reject</button>
                        </>
                      )}
                      {c.status === 'approved' && (
                        <button onClick={() => handleCommissionStatus(c.id, 'paid')}
                          className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-600">Mark Paid</button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : tab === 'payouts' ? (
        filteredPayouts.length === 0 ? (
          <div className="flex items-center justify-center rounded-2xl p-12 text-center admin-glass">
            <p className="text-sm text-gray-500 dark:text-white/40">{search || statusFilter !== 'all' ? 'No payouts match your filters.' : 'No payouts yet.'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredPayouts.map(p => {
              const affiliate = affiliates.find(a => a.id === p.affiliate_id)
              return (
                <div key={p.id} className="rounded-2xl p-4 transition-all hover:scale-[1.002] admin-glass">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white/90">{affiliate?.name || p.affiliate_id}</span>
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', statusBadge(p.status))}>{p.status}</span>
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-white/40">
                        <span>Amount: <strong>₦{(p.amount || 0).toLocaleString()}</strong></span>
                        <span>·</span>
                        <span>{p.payment_method}</span>
                        {p.notes && <span>· {p.notes}</span>}
                        <span>·</span>
                        <span>{formatDate(p.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {p.status === 'pending' && (
                        <>
                          <button onClick={() => handlePayoutStatus(p.id, 'approved')}
                            className="rounded-xl bg-blue-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-600">Approve</button>
                          <button onClick={() => handlePayoutStatus(p.id, 'paid')}
                            className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-600">Mark Paid</button>
                          <button onClick={() => handlePayoutStatus(p.id, 'rejected')}
                            className="rounded-xl bg-red-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-red-600">Reject</button>
                        </>
                      )}
                      {p.status === 'approved' && (
                        <button onClick={() => handleProcessPayout(p.id)} disabled={processingPayout === p.id}
                          className="rounded-xl bg-[#7700ff] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[#9900ff] disabled:opacity-50">
                          {processingPayout === p.id ? 'Processing...' : 'Pay via Paystack'}
                        </button>
                      )}
                      {p.paystack_reference && (
                        <span className="text-[10px] text-gray-400 dark:text-white/30">Ref: {p.paystack_reference}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : (
        /* Performance Tab */
        <AdminPartnerAnalytics />
      )}

      {/* Partner Detail Modal */}
      {detailAffiliate && (
        <PartnerDetailModal affiliate={detailAffiliate} onClose={() => setDetailAffiliate(null)} />
      )}

      {/* Create Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl p-6 admin-glass-strong">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white/90">Create Payout</h3>
            <form onSubmit={handleCreatePayout} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Partner</label>
                <select value={payoutAffiliateId} onChange={(e) => setPayoutAffiliateId(e.target.value)} className="w-full admin-input" required>
                  <option value="">Select partner...</option>
                  {activeAffiliates.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Amount</label>
                <input type="number" step="0.01" value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)} className="w-full admin-input" placeholder="0.00" required />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Payment Method</label>
                <select value={payoutMethod} onChange={(e) => setPayoutMethod(e.target.value)} className="w-full admin-input">
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="paypal">PayPal</option>
                  <option value="mobile_money">Mobile Money</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Notes</label>
                <input type="text" value={payoutNotes} onChange={(e) => setPayoutNotes(e.target.value)} className="w-full admin-input" placeholder="Optional notes" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowPayoutModal(false)} className="rounded-xl px-4 py-2 text-sm text-gray-500 transition-colors hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5">Cancel</button>
                <button type="submit" disabled={payoutSaving || !payoutAffiliateId || !payoutAmount} className="admin-btn-primary">
                  {payoutSaving ? 'Saving...' : 'Create Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Marketing Asset Modal */}
      {showAssetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl p-6 admin-glass-strong">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white/90">Add Marketing Asset</h3>
            <form onSubmit={handleCreateAsset} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Title</label>
                <input type="text" value={assetTitle} onChange={(e) => setAssetTitle(e.target.value)} className="w-full admin-input" placeholder="Asset title" required />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Type</label>
                <select value={assetType} onChange={(e) => setAssetType(e.target.value)} className="w-full admin-input">
                  <option value="image">Image</option>
                  <option value="banner">Banner</option>
                  <option value="mockup">Mockup</option>
                  <option value="copy">Copy</option>
                  <option value="caption">Caption</option>
                  <option value="campaign">Campaign</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Description</label>
                <input type="text" value={assetDesc} onChange={(e) => setAssetDesc(e.target.value)} className="w-full admin-input" placeholder="Short description" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Content <span className="text-gray-400">(for copy/captions)</span></label>
                <textarea value={assetContent} onChange={(e) => setAssetContent(e.target.value)} rows={3} className="w-full admin-input resize-none" placeholder="Suggested copy or caption text" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">File URL <span className="text-gray-400">(for images/banners)</span></label>
                <input type="url" value={assetFileUrl} onChange={(e) => setAssetFileUrl(e.target.value)} className="w-full admin-input" placeholder="https://example.com/image.png" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAssetModal(false)} className="rounded-xl px-4 py-2 text-sm text-gray-500 transition-colors hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5">Cancel</button>
                <button type="submit" disabled={assetSaving || !assetTitle} className="admin-btn-primary">
                  {assetSaving ? 'Saving...' : 'Add Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
