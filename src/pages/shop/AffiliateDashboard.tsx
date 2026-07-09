import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/currency'
import { CountUp } from '@/components/ui/CountUp'
import type { Affiliate, AffiliateCommission, AffiliatePayout, AffiliateClick } from '@/lib/commerce-types'

type Tab = 'overview' | 'commissions' | 'payouts'

const tabs: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'commissions', label: 'Commissions' },
  { id: 'payouts', label: 'Payouts' },
]

export default function AffiliateDashboard() {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null)
  const [commissions, setCommissions] = useState<AffiliateCommission[]>([])
  const [clicks, setClicks] = useState<AffiliateClick[]>([])
  const [payouts, setPayouts] = useState<AffiliatePayout[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('overview')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) setEmail(ref)
  }, [searchParams])

  const handleLookup = async () => {
    if (!email.trim()) return
    setLoading(true); setError('')
    try {
      const { data: aff } = await supabase
        .from('affiliates').select('*').eq('email', email.trim()).eq('status', 'approved').single()
      if (!aff) { setError('No affiliate found with that email'); setLoading(false); return }
      setAffiliate(aff as Affiliate)
      const [commData, clickData, payoutData] = await Promise.all([
        supabase.from('affiliate_commissions').select('*').eq('affiliate_id', aff.id).order('created_at', { ascending: false }),
        supabase.from('affiliate_clicks').select('*').eq('affiliate_id', aff.id).order('created_at', { ascending: false }),
        supabase.from('affiliate_payouts').select('*').eq('affiliate_id', aff.id).order('created_at', { ascending: false }),
      ])
      setCommissions(commData.data as AffiliateCommission[] || [])
      setClicks(clickData.data as AffiliateClick[] || [])
      setPayouts(payoutData.data as AffiliatePayout[] || [])
    } catch { setError('Failed to load dashboard') }
    setLoading(false)
  }

  const pendingEarnings = commissions.filter(c => c.status === 'pending' || c.status === 'approved').reduce((s, c) => s + c.amount, 0)
  const paidEarnings = commissions.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0)
  const conversionRate = clicks.length > 0 ? ((commissions.length / clicks.length) * 100).toFixed(1) : '0.0'
  const monthEarnings = commissions
    .filter(c => new Date(c.created_at).getMonth() === new Date().getMonth())
    .reduce((s, c) => s + c.amount, 0)

  const referralLink = `${import.meta.env.VITE_SITE_URL || window.location.origin}/shop?ref=${affiliate?.referral_code || ''}`

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-green-500/10 text-green-500',
      approved: 'bg-blue-500/10 text-blue-500',
      pending: 'bg-amber-500/10 text-amber-500',
      rejected: 'bg-red-500/10 text-red-500',
    }
    return (
      <span className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full capitalize ${colors[status] || 'bg-gray-500/10 text-gray-500'}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${status === 'paid' ? 'bg-green-500' : status === 'approved' ? 'bg-blue-500' : status === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`} />
        {status}
      </span>
    )
  }

  if (!affiliate) {
    return (
      <main className="min-h-screen bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark flex items-center justify-center px-6">
        <div className="w-full max-w-sm mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <h1 className="font-display text-3xl font-bold">Affiliate Dashboard</h1>
            <p className="text-sm text-text-muted-light dark:text-text-muted-dark mt-1">Enter the email you used to register</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="rounded-3xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6 sm:p-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-white/60">Email Address</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com"
                    className="w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 dark:focus:border-brand-400/50 dark:focus:ring-brand-400/10 transition-all" />
                </div>
                {error && <p className="text-xs text-red-400">{error}</p>}
                <button onClick={handleLookup} disabled={loading}
                  className="w-full rounded-full bg-brand-500 py-3.5 text-sm font-semibold text-white transition-all duration-500 hover:shadow-xl hover:shadow-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]">
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="4" className="opacity-75" /></svg>
                      Loading...
                    </span>
                  ) : 'View Dashboard'}
                </button>
              </div>
            </div>
          </motion.div>
          <p className="text-center mt-6">
            <Link to="/shop/affiliate" className="text-xs text-brand-500 hover:text-brand-600 transition-colors">Not registered? Apply now</Link>
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark px-6 pt-28 pb-20">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="font-display text-3xl font-bold">Dashboard</h1>
            <p className="text-sm text-text-muted-light dark:text-text-muted-dark mt-1">Welcome back, {affiliate.name}</p>
          </div>
          <div className="flex-shrink-0">
            <p className="text-[10px] uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark mb-1.5 font-semibold">Your Referral Link</p>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-black/[0.04] dark:bg-white/[0.06] px-3 py-1.5 rounded-lg text-brand-500 font-mono truncate max-w-[240px]">{referralLink}</code>
              <button onClick={() => { navigator.clipboard.writeText(referralLink); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500 hover:bg-brand-500/20 transition-all active:scale-90">
                {copied ? (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                ) : (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[
            { raw: clicks.length, label: 'Total Clicks', sub: 'all time' },
            { raw: commissions.length, label: 'Total Sales', sub: 'converted' },
            { raw: parseFloat(conversionRate), label: 'Conversion Rate', sub: 'click → sale', suffix: '%', decimals: 1 },
            { raw: monthEarnings, label: 'This Month', prefix: '\u20A6', sub: `${new Date().toLocaleString('default', { month: 'long' })} earnings` },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="rounded-2xl border border-black/[0.04] dark:border-white/[0.06] bg-white/40 dark:bg-white/[0.02] p-4 sm:p-5 transition-all duration-300 hover:border-black/[0.08] dark:hover:border-white/[0.1]">
                <p className="text-xl sm:text-2xl font-bold text-gradient tabular-nums">
                  <CountUp end={stat.raw} suffix={stat.suffix || ''} prefix={stat.prefix || ''} decimals={stat.decimals || 0} />
                </p>
                <p className="text-xs font-medium text-text-muted-light dark:text-text-muted-dark mt-1">{stat.label}</p>
                <p className="text-[10px] text-text-muted-light/60 dark:text-text-muted-dark/60 mt-0.5">{stat.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Earnings Breakdown */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="rounded-2xl border border-amber-500/10 bg-amber-500/[0.03] p-4 sm:p-5">
              <p className="text-xs text-amber-500 font-medium">Pending</p>
              <p className="text-xl sm:text-2xl font-bold text-amber-500 tabular-nums mt-1">
                <CountUp end={pendingEarnings} prefix="₦" />
              </p>
              <p className="text-[10px] text-amber-500/60 mt-0.5">Awaiting approval</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="rounded-2xl border border-green-500/10 bg-green-500/[0.03] p-4 sm:p-5">
              <p className="text-xs text-green-500 font-medium">Paid</p>
              <p className="text-xl sm:text-2xl font-bold text-green-500 tabular-nums mt-1">
                <CountUp end={paidEarnings} prefix="₦" />
              </p>
              <p className="text-[10px] text-green-500/60 mt-0.5">Received</p>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] p-1 w-fit">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`rounded-lg px-4 py-2 text-xs font-medium transition-all duration-200 ${
                tab === t.id
                  ? 'bg-white dark:bg-surface-dark shadow-sm text-gray-900 dark:text-white/90'
                  : 'text-text-muted-light dark:text-text-muted-dark hover:text-text-light dark:hover:text-text-dark'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl border border-black/[0.04] dark:border-white/[0.06] bg-white/30 dark:bg-white/[0.01] p-5 sm:p-6">
            <h2 className="font-display text-sm font-semibold mb-4 text-gray-900 dark:text-white/90">Recent Commissions</h2>
            {commissions.length === 0 ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/[0.03] dark:bg-white/[0.04]">
                  <svg className="h-5 w-5 text-text-muted-light dark:text-text-muted-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                </div>
                <p className="text-xs text-text-muted-light dark:text-text-muted-dark">No commissions yet. Start sharing your link!</p>
              </div>
            ) : (
              <div className="space-y-1">
                {commissions.slice(0, 10).map((c, i) => (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                    className="flex items-center justify-between py-3 px-3 -mx-3 rounded-xl hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/[0.03] dark:bg-white/[0.04]">
                        <span className="font-mono text-xs font-bold text-text-muted-light dark:text-text-muted-dark">₦</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white/90 tabular-nums">{formatCurrency(c.amount)}</p>
                        <p className="text-[10px] text-text-muted-light dark:text-text-muted-dark capitalize">{c.product_type} &middot; {new Date(c.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {statusBadge(c.status)}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {tab === 'commissions' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl border border-black/[0.04] dark:border-white/[0.06] bg-white/30 dark:bg-white/[0.01] p-5 sm:p-6">
            <h2 className="font-display text-sm font-semibold mb-4 text-gray-900 dark:text-white/90">All Commissions</h2>
            {commissions.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-xs text-text-muted-light dark:text-text-muted-dark">No commissions yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-5 sm:-mx-6">
                <div className="inline-block min-w-full align-middle px-5 sm:px-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-black/[0.06] dark:border-white/[0.06]">
                        <th className="pb-3 text-left text-[10px] font-semibold uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">Amount</th>
                        <th className="pb-3 text-left text-[10px] font-semibold uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">Type</th>
                        <th className="pb-3 text-left text-[10px] font-semibold uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark hidden sm:table-cell">Rate</th>
                        <th className="pb-3 text-left text-[10px] font-semibold uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">Status</th>
                        <th className="pb-3 text-left text-[10px] font-semibold uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark hidden sm:table-cell">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commissions.map((c) => (
                        <tr key={c.id} className="border-b border-black/[0.03] dark:border-white/[0.03] hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 text-sm font-semibold tabular-nums text-gray-900 dark:text-white/90">{formatCurrency(c.amount)}</td>
                          <td className="py-3 text-xs capitalize text-text-muted-light dark:text-text-muted-dark">{c.product_type}</td>
                          <td className="py-3 text-xs text-text-muted-light dark:text-text-muted-dark hidden sm:table-cell tabular-nums">{(c.rate * 100).toFixed(0)}%</td>
                          <td className="py-3">{statusBadge(c.status)}</td>
                          <td className="py-3 text-xs text-text-muted-light dark:text-text-muted-dark hidden sm:table-cell">{new Date(c.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {tab === 'payouts' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl border border-black/[0.04] dark:border-white/[0.06] bg-white/30 dark:bg-white/[0.01] p-5 sm:p-6">
            <h2 className="font-display text-sm font-semibold mb-4 text-gray-900 dark:text-white/90">Payout History</h2>
            {payouts.length === 0 ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/[0.03] dark:bg-white/[0.04]">
                  <svg className="h-5 w-5 text-text-muted-light dark:text-text-muted-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="8" width="20" height="12" rx="2" /><path d="M6 8V6a4 4 0 0 1 8 0v2" /></svg>
                </div>
                <p className="text-xs text-text-muted-light dark:text-text-muted-dark">No payouts processed yet.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {payouts.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                    className="flex items-center justify-between py-3 px-3 -mx-3 rounded-xl hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/[0.03] dark:bg-white/[0.04]">
                        <svg className="h-4 w-4 text-text-muted-light dark:text-text-muted-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="8" width="20" height="12" rx="2" /><path d="M6 8V6a4 4 0 0 1 8 0v2" /></svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white/90 tabular-nums">{formatCurrency(p.amount)}</p>
                        <p className="text-[10px] text-text-muted-light dark:text-text-muted-dark">{p.payment_method} &middot; {new Date(p.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {statusBadge(p.status)}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </main>
  )
}
