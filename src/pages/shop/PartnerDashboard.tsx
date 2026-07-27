import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/currency'
import { cn } from '@/lib/utils'
import { usePartnerStore } from '@/store/partner'
import {
  DASHBOARD_TABS, ACHIEVEMENT_DEFS,
  getPartnerNotifications, getPartnerAchievements,
  getMarketingAssets, getCommissionsByMonth, getTopPerformingProducts,
} from '@/modules/affiliate'
import { StatusBadge } from '@/modules/affiliate/components/StatusBadge'
import { NotificationPanel } from '@/modules/affiliate/components/NotificationPanel'
import { BankDetailsForm } from '@/modules/affiliate/components/BankDetailsForm'
import { ReferralLinkCard } from '@/modules/affiliate/components/ReferralLinkCard'
import { MonthlyEarningsChart } from '@/modules/affiliate/components/MonthlyEarningsChart'
import { AccountTab } from '@/modules/affiliate/components/AccountTab'
import type { Affiliate, AffiliateCommission, AffiliatePayout, AffiliateClick, PartnerAchievement, MarketingAsset, PartnerNotification, DashboardTab } from '@/modules/affiliate/types'
import type { Product } from '@/lib/commerce-types'

export default function PartnerDashboard() {
  const { user, loading: authLoading, initialized, initialize, signIn, signOut } = usePartnerStore()
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginSubmitting, setLoginSubmitting] = useState(false)
  const [loginTouched, setLoginTouched] = useState({ email: false, password: false })
  const [partner, setPartner] = useState<Affiliate | null>(null)
  const [commissions, setCommissions] = useState<AffiliateCommission[]>([])
  const [clicks, setClicks] = useState<AffiliateClick[]>([])
  const [payouts, setPayouts] = useState<AffiliatePayout[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [notifications, setNotifications] = useState<PartnerNotification[]>([])
  const [achievements, setAchievements] = useState<PartnerAchievement[]>([])
  const [assets, setAssets] = useState<MarketingAsset[]>([])
  const [monthlyData, setMonthlyData] = useState<{ month: string; earnings: number; sales: number }[]>([])
  const [topProducts, setTopProducts] = useState<{ productId: string; sales: number; earnings: number }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<DashboardTab>('overview')
  const [copied, setCopied] = useState(false)

  useEffect(() => { initialize() }, [initialize])

  const loadPartner = async (aff: Affiliate) => {
    setPartner(aff)
    const [commData, clickData, payoutData, prodData, notifData, achieveData, assetData, monthData, topData] = await Promise.all([
      supabase.from('affiliate_commissions').select('id, amount, status, created_at, product_type, product_title, rate').eq('affiliate_id', aff.id).order('created_at', { ascending: false }),
      supabase.from('affiliate_clicks').select('id, created_at').eq('affiliate_id', aff.id).order('created_at', { ascending: false }),
      supabase.from('affiliate_payouts').select('id, amount, status, payment_method, notes, created_at, account_name, account_number, bank_name').eq('affiliate_id', aff.id).order('created_at', { ascending: false }),
      supabase.from('products').select('id, title, slug, type, price, sale_price, thumbnail, category:product_categories(name)').eq('published', true).order('display_order', { ascending: true }),
      getPartnerNotifications(aff.id).catch(() => []),
      getPartnerAchievements(aff.id).catch(() => []),
      getMarketingAssets().catch(() => []),
      getCommissionsByMonth(aff.id).catch(() => []),
      getTopPerformingProducts(aff.id).catch(() => []),
    ])
    setCommissions(commData.data as unknown as AffiliateCommission[] || [])
    setClicks(clickData.data as AffiliateClick[] || [])
    setPayouts(payoutData.data as AffiliatePayout[] || [])
    setProducts(prodData.data as unknown as Product[] || [])
    setNotifications(notifData)
    setAchievements(achieveData)
    setAssets(assetData)
    setMonthlyData(monthData)
    setTopProducts(topData)
  }

  useEffect(() => {
    if (!initialized) return
    if (!user) return
    setLoading(true)
    ;(async () => {
      try {
        const { data: aff } = await supabase
          .from('affiliates').select('id, name, email, phone, referral_code, status, total_clicks, total_sales, total_earnings, pending_earnings, created_at, social_links, bank_name, account_name, account_number').eq('email', user!.email!).eq('status', 'approved').single()
        if (aff) {
          await loadPartner(aff as Affiliate)
        } else {
          setError('No partner account found. Your account may still be pending approval.')
        }
      } catch { setError('Failed to load dashboard') }
      setLoading(false)
    })()
  }, [user, initialized])

  const handleLogin = async () => {
    setLoginTouched({ email: true, password: true })
    if (!loginEmail.trim() || !loginPassword.trim()) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail.trim())) {
      setLoginError('Please enter a valid email address')
      return
    }
    setLoginSubmitting(true); setLoginError('')
    try {
      const { error: signInError } = await signIn(loginEmail.trim(), loginPassword)
      if (signInError) { setLoginError(signInError) }
    } catch { setLoginError('Failed to sign in') }
    setLoginSubmitting(false)
  }

  const loginEmailError = loginTouched.email && !loginEmail.trim() ? 'Email is required' : loginTouched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail.trim()) ? 'Invalid email format' : ''
  const loginPasswordError = loginTouched.password && !loginPassword.trim() ? 'Password is required' : ''

  const handleSignOut = async () => {
    setPartner(null)
    setCommissions([])
    setClicks([])
    setPayouts([])
    setProducts([])
    setNotifications([])
    setAchievements([])
    setAssets([])
    setMonthlyData([])
    setTopProducts([])
    await signOut()
  }

  const handleNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const pendingEarnings = useMemo(() => commissions.filter(c => c.status === 'pending' || c.status === 'approved').reduce((s, c) => s + c.amount, 0), [commissions])
  const approvedEarnings = useMemo(() => commissions.filter(c => c.status === 'approved').reduce((s, c) => s + c.amount, 0), [commissions])
  const paidEarnings = useMemo(() => commissions.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0), [commissions])
  const lifetimeEarnings = useMemo(() => commissions.reduce((s, c) => s + c.amount, 0), [commissions])
  const conversionRate = useMemo(() => clicks.length > 0 ? ((commissions.length / clicks.length) * 100).toFixed(1) : '0.0', [commissions, clicks])
  const monthEarnings = useMemo(() => commissions
    .filter(c => new Date(c.created_at).getMonth() === new Date().getMonth() && new Date(c.created_at).getFullYear() === new Date().getFullYear())
    .reduce((s, c) => s + c.amount, 0), [commissions])
  const referralRevenue = lifetimeEarnings

  const referralLink = `${import.meta.env.VITE_SITE_URL || window.location.origin}/shop?ref=${partner?.referral_code || ''}`
  const unlockedKeys: string[] = achievements.map(a => a.achievement_key)

  const partnerTier = lifetimeEarnings >= 500000 ? 'Premium' : lifetimeEarnings >= 100000 ? 'Elite' : lifetimeEarnings >= 1 ? 'Active' : 'New'
  const partnerTierIcon = lifetimeEarnings >= 500000 ? '\uD83D\uDC51' : lifetimeEarnings >= 100000 ? '\uD83D\uDE80' : '\uD83C\uDF1F'

  if (authLoading || (!initialized)) {
    return (
      <main className="min-h-screen bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark flex items-center justify-center px-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-brand-500/8 blur-[120px]" />
        </div>
        <div className="w-full max-w-sm mx-auto relative z-10 text-center">
          <svg className="mx-auto h-6 w-6 animate-spin text-brand-500" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="4" className="opacity-75" /></svg>
        </div>
      </main>
    )
  }

  if (!partner && user) {
    return (
      <main className="min-h-screen bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark flex items-center justify-center px-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-brand-500/8 blur-[120px]" />
        </div>
        <div className="w-full max-w-sm mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
              <svg className="h-8 w-8 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">Account Not Found</h1>
            <p className="text-sm text-text-muted-light dark:text-text-muted-dark">{error || 'Your partner account could not be found. It may still be pending approval.'}</p>
            <button onClick={handleSignOut} className="mt-6 text-xs text-brand-500 hover:underline">Sign out and try again</button>
          </motion.div>
        </div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark flex items-center justify-center px-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-brand-500/8 blur-[120px]" />
        </div>
        <div className="w-full max-w-sm mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10">
              <svg className="h-7 w-7 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            </div>
            <h1 className="font-display text-2xl font-bold">Partner Dashboard</h1>
            <p className="text-sm text-text-muted-light dark:text-text-muted-dark mt-1">Sign in with your partner account</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6 sm:p-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-white/60">Email Address <span className="text-red-400">*</span></label>
                  <input value={loginEmail} onChange={e => { setLoginEmail(e.target.value); if (!loginTouched.email) setLoginTouched(t => ({ ...t, email: true })) }} type="email" placeholder="you@example.com"
                    autoComplete="email" required
                    className={cn('w-full rounded-xl border bg-white/50 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none transition-all',
                      loginEmailError ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/10' : 'border-black/[0.06] dark:border-white/[0.08] focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10'
                    )} />
                  {loginEmailError && <p className="mt-1 text-[11px] text-red-400">{loginEmailError}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-white/60">Password <span className="text-red-400">*</span></label>
                  <input value={loginPassword} onChange={e => { setLoginPassword(e.target.value); if (!loginTouched.password) setLoginTouched(t => ({ ...t, password: true })) }} type="password" placeholder="Your password"
                    autoComplete="current-password" required
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    className={cn('w-full rounded-xl border bg-white/50 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none transition-all',
                      loginPasswordError ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/10' : 'border-black/[0.06] dark:border-white/[0.08] focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10'
                    )} />
                  {loginPasswordError && <p className="mt-1 text-[11px] text-red-400">{loginPasswordError}</p>}
                  <div className="mt-1.5 text-right">
                    <Link to="/forgot-password?returnTo=/shop/partners/dashboard" className="text-[10px] text-brand-500 hover:underline">Forgot Password?</Link>
                  </div>
                </div>
                {loginError && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{loginError}</p>}
                <button onClick={handleLogin} disabled={loginSubmitting}
                  className="w-full rounded-full bg-brand-500 py-3.5 text-sm font-semibold text-white transition-all duration-500 hover:shadow-xl hover:shadow-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]">
                  {loginSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="4" className="opacity-75" /></svg>
                      Signing in...
                    </span>
                  ) : 'Sign In'}
                </button>
              </div>
            </div>
          </motion.div>
          <p className="text-center mt-6">
            <Link to="/shop/partners" className="text-xs text-brand-500 hover:text-brand-600 transition-colors">Not registered? Apply now</Link>
          </p>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark flex items-center justify-center px-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-brand-500/8 blur-[120px]" />
        </div>
        <div className="w-full max-w-sm mx-auto relative z-10 text-center">
          <svg className="mx-auto h-6 w-6 animate-spin text-brand-500" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="4" className="opacity-75" /></svg>
          <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-3">Loading your dashboard...</p>
        </div>
      </main>
    )
  }

  if (!partner) return null

  const productCommissionRate = (type: string) => type === 'physical' ? '10%' : '30%'
  const productCommissionLabel = (type: string) => type === 'physical' ? 'Merch' : 'Digital'

  return (
    <main className="min-h-screen bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark overflow-hidden">

      {/* ── Top Bar ── */}
      <div className="fixed top-0 left-0 right-0 z-40 border-b border-black/[0.04] dark:border-white/[0.06] bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-sm font-bold">Partner Dashboard</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500 font-medium">{partnerTier} {partnerTierIcon}</span>
          </div>
          <div className="flex items-center gap-3">
            <NotificationPanel
              notifications={notifications}
              partnerId={partner.id}
              onNotificationsRead={handleNotificationsRead}
            />
            <button onClick={handleSignOut} className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors" title="Sign out">
              <svg className="h-4 w-4 text-gray-500 dark:text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
            </button>
            <span className="text-xs text-text-muted-light dark:text-text-muted-dark hidden sm:block">{partner.name}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-24 pb-20">

        {/* ── Tabs ── */}
        <div className="flex gap-1 mb-8 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] p-1 w-fit overflow-x-auto overscroll-contain -mx-6 px-6 sm:mx-0 sm:px-0">
          {DASHBOARD_TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn(
                'whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-medium transition-all duration-200 flex items-center gap-1.5',
                tab === t.id
                  ? 'bg-white dark:bg-surface-dark shadow-sm text-gray-900 dark:text-white/90'
                  : 'text-text-muted-light dark:text-text-muted-dark hover:text-text-light dark:hover:text-text-dark'
              )}>
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d={t.icon} /></svg>
              {t.label}
            </button>
          ))}
        </div>

        {/* ════════════ OVERVIEW ════════════ */}
        {tab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white/90">Welcome back, {partner.name.split(' ')[0]}</h2>
              <p className="text-sm text-text-muted-light dark:text-text-muted-dark">Here is your performance summary</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { value: formatCurrency(lifetimeEarnings), label: 'Total Earnings', sub: 'lifetime', color: 'text-brand-500' },
                { value: formatCurrency(pendingEarnings), label: 'Pending', sub: 'awaiting approval', color: 'text-amber-500' },
                { value: formatCurrency(paidEarnings), label: 'Paid', sub: 'received', color: 'text-green-500' },
                { value: partner.total_sales?.toString() || '0', label: 'Total Sales', sub: 'converted referrals', color: 'text-blue-500' },
              ].map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <div className="rounded-2xl border border-black/[0.04] dark:border-white/[0.06] bg-white/40 dark:bg-white/[0.02] p-4 sm:p-5 transition-all duration-300 hover:border-black/[0.08] dark:hover:border-white/[0.1]">
                    <p className={`text-xl sm:text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs font-medium text-text-muted-light dark:text-text-muted-dark mt-1">{stat.label}</p>
                    <p className="text-[10px] text-text-muted-light/60 dark:text-text-muted-dark/60 mt-0.5">{stat.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { value: clicks.length.toLocaleString(), label: 'Total Clicks', sub: 'all time', icon: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5' },
                { value: `${conversionRate}%`, label: 'Conversion Rate', sub: 'click \u2192 sale', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
                { value: formatCurrency(monthEarnings), label: 'This Month', sub: `${new Date().toLocaleString('default', { month: 'long' })} earnings`, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2' },
                { value: formatCurrency(referralRevenue), label: 'Referral Revenue', sub: 'total from referrals', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z' },
              ].map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
                  <div className="rounded-2xl border border-black/[0.04] dark:border-white/[0.06] bg-white/30 dark:bg-white/[0.01] p-4 sm:p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xl sm:text-2xl font-bold tabular-nums text-gradient">{stat.value}</p>
                        <p className="text-xs font-medium text-text-muted-light dark:text-text-muted-dark mt-1">{stat.label}</p>
                        <p className="text-[10px] text-text-muted-light/60 dark:text-text-muted-dark/60 mt-0.5">{stat.sub}</p>
                      </div>
                      <svg className="h-5 w-5 text-text-muted-light/30 dark:text-text-muted-dark/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d={stat.icon} /></svg>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-black/[0.04] dark:border-white/[0.06] bg-white/30 dark:bg-white/[0.01] p-5 sm:p-6">
                <h2 className="font-display text-sm font-semibold mb-4 text-gray-900 dark:text-white/90">Recent Commissions</h2>
                {commissions.length === 0 ? (
                  <div className="py-8 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/[0.03] dark:bg-white/[0.04]">
                      <svg className="h-5 w-5 text-text-muted-light dark:text-text-muted-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                    </div>
                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark">No commissions yet. Start sharing your link!</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {commissions.slice(0, 8).map((c, i) => (
                      <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                        className="flex items-center justify-between py-2.5 px-3 -mx-3 rounded-xl hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/[0.03] dark:bg-white/[0.04]">
                            <span className="font-mono text-xs font-bold text-text-muted-light dark:text-text-muted-dark">\u20A6</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white/90 tabular-nums">{formatCurrency(c.amount)}</p>
                            <p className="text-[10px] text-text-muted-light dark:text-text-muted-dark capitalize">{c.product_type} &middot; {new Date(c.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <StatusBadge status={c.status} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <MonthlyEarningsChart monthlyData={monthlyData} />
            </div>

            {topProducts.length > 0 && (
              <div className="rounded-2xl border border-black/[0.04] dark:border-white/[0.06] bg-white/30 dark:bg-white/[0.01] p-5 sm:p-6">
                <h2 className="font-display text-sm font-semibold mb-4 text-gray-900 dark:text-white/90">Top Performing Products</h2>
                <div className="space-y-2">
                  {topProducts.map((p, i) => (
                    <div key={p.productId} className="flex items-center justify-between py-2 px-3 -mx-3 rounded-xl hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-text-muted-light/50 dark:text-text-muted-dark/50 w-4">{i + 1}</span>
                        <span className="text-sm font-medium capitalize">{p.productId}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-text-muted-light dark:text-text-muted-dark">{p.sales} sale{p.sales !== 1 ? 's' : ''}</span>
                        <span className="text-sm font-semibold tabular-nums text-brand-500">{formatCurrency(p.earnings)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ════════════ PARTNER LINK ════════════ */}
        {tab === 'link' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white/90">Your Partner Link</h2>
              <p className="text-sm text-text-muted-light dark:text-text-muted-dark">Share this link to start earning commissions</p>
            </div>
            <ReferralLinkCard referralLink={referralLink} />
          </motion.div>
        )}

        {/* ════════════ PRODUCTS ════════════ */}
        {tab === 'products' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white/90">Products to Promote</h2>
              <p className="text-sm text-text-muted-light dark:text-text-muted-dark">Browse products and copy your personalized partner links</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.length === 0 ? (
                <div className="col-span-full py-12 text-center">
                  <p className="text-sm text-text-muted-light dark:text-text-muted-dark">No products available yet.</p>
                </div>
              ) : products.map((p, i) => {
                const prodLink = `${import.meta.env.VITE_SITE_URL || window.location.origin}/shop/product/${p.slug}?ref=${partner.referral_code}`
                return (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="rounded-2xl border border-black/[0.04] dark:border-white/[0.06] bg-white/30 dark:bg-white/[0.01] p-4 transition-all duration-300 hover:border-brand-500/15 hover:shadow-sm">
                    {p.thumbnail && (
                      <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-black/[0.03] dark:bg-white/[0.03]">
                        <img src={p.thumbnail} alt={p.title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-display text-sm font-bold text-gray-900 dark:text-white/90">{p.title}</h3>
                      <span className="text-[10px] shrink-0 px-2 py-0.5 rounded-full bg-brand-500/8 text-brand-500 font-medium">{productCommissionRate(p.type)}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold tabular-nums">{formatCurrency(p.sale_price || p.price)}</span>
                      <span className="text-[9px] text-text-muted-light dark:text-text-muted-dark capitalize">{productCommissionLabel(p.type)}</span>
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(prodLink); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                      className="w-full rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 py-2 text-[11px] font-semibold hover:bg-brand-500/20 transition-all active:scale-[0.98]">
                      {copied ? 'Copied!' : 'Copy Partner Link'}
                    </button>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* ════════════ ANALYTICS ════════════ */}
        {tab === 'analytics' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white/90">Analytics</h2>
              <p className="text-sm text-text-muted-light dark:text-text-muted-dark">Your performance metrics at a glance</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { value: clicks.length.toLocaleString(), label: 'Clicks', sub: 'link clicks' },
                { value: commissions.length.toLocaleString(), label: 'Sales', sub: 'conversions' },
                { value: `${conversionRate}%`, label: 'Conversion Rate', sub: 'click \u2192 sale' },
                { value: formatCurrency(lifetimeEarnings), label: 'Revenue', sub: 'total earned' },
              ].map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <div className="rounded-2xl border border-black/[0.04] dark:border-white/[0.06] bg-white/40 dark:bg-white/[0.02] p-4 sm:p-5">
                    <p className="text-xl sm:text-2xl font-bold tabular-nums text-gradient">{stat.value}</p>
                    <p className="text-xs font-medium text-text-muted-light dark:text-text-muted-dark mt-1">{stat.label}</p>
                    <p className="text-[10px] text-text-muted-light/60 dark:text-text-muted-dark/60 mt-0.5">{stat.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-black/[0.04] dark:border-white/[0.06] bg-white/30 dark:bg-white/[0.01] p-5 sm:p-6">
                <h2 className="font-display text-sm font-semibold mb-4 text-gray-900 dark:text-white/90">Commission Trends</h2>
                <div className="flex items-end gap-2 h-32">
                  {monthlyData.length === 0 ? (
                    <div className="w-full flex items-center justify-center h-full">
                      <p className="text-xs text-text-muted-light dark:text-text-muted-dark">No data yet</p>
                    </div>
                  ) : monthlyData.map((m) => {
                    const maxSales = Math.max(...monthlyData.map(x => x.sales), 1)
                    return (
                      <div key={m.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                        <div className="w-full rounded-sm bg-gradient-to-t from-brand-500/60 to-brand-500/30"
                          style={{ height: `${Math.max((m.sales / maxSales) * 100, 4)}%` }} />
                        <span className="text-[8px] text-text-muted-light/50 dark:text-text-muted-dark/50">{m.month}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-black/[0.04] dark:border-white/[0.06] bg-white/30 dark:bg-white/[0.01] p-5 sm:p-6">
                <h2 className="font-display text-sm font-semibold mb-4 text-gray-900 dark:text-white/90">Top Performing Links</h2>
                {topProducts.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark">No data yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {topProducts.map((p, i) => (
                      <div key={p.productId} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-text-muted-light/40 dark:text-text-muted-dark/40 w-3">{i + 1}</span>
                          <span className="text-xs font-medium capitalize">{p.productId === 'physical' ? 'Merch' : p.productId === 'digital' ? 'Digital' : p.productId === 'bundle' ? 'Bundle' : p.productId}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-text-muted-light dark:text-text-muted-dark">{p.sales} sale{p.sales !== 1 ? 's' : ''}</span>
                          <span className="text-xs font-semibold tabular-nums text-brand-500">{formatCurrency(p.earnings)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-black/[0.04] dark:border-white/[0.06] bg-white/30 dark:bg-white/[0.01] p-5 sm:p-6">
              <h2 className="font-display text-sm font-semibold mb-4 text-gray-900 dark:text-white/90">Conversion Funnel</h2>
              <div className="space-y-3">
                {(() => {
                  const totalClicks = clicks.length
                  const totalSales = commissions.length
                  const funnelSteps = [
                    { label: 'Link Clicks', value: totalClicks, color: 'from-brand-500/80 to-brand-500/60', width: 100 },
                    { label: 'Conversions', value: totalSales, color: 'from-emerald-500/80 to-emerald-500/60', width: totalClicks > 0 ? Math.max((totalSales / totalClicks) * 100, 8) : 8 },
                    { label: 'Conversion Rate', value: parseFloat(conversionRate), color: 'from-gold-500/80 to-gold-500/60', width: Math.min(parseFloat(conversionRate) * 3, 100), isPercent: true },
                  ]
                  return funnelSteps.map(step => (
                    <div key={step.label} className="flex items-center gap-4">
                      <span className="text-[11px] text-text-muted-light dark:text-text-muted-dark w-24 shrink-0">{step.label}</span>
                      <div className="flex-1 h-8 bg-black/[0.03] dark:bg-white/[0.04] rounded-lg overflow-hidden">
                        <div className={`h-full rounded-lg bg-gradient-to-r ${step.color} transition-all duration-700 flex items-center justify-end px-3`}
                          style={{ width: `${Math.max(step.width, 8)}%` }}>
                          <span className="text-[11px] font-semibold text-white whitespace-nowrap">
                            {step.isPercent ? `${step.value}%` : step.value.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                })()}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-black/[0.02] dark:bg-white/[0.03] p-3 text-center">
                  <p className="text-lg font-bold text-gradient tabular-nums">{clicks.length}</p>
                  <p className="text-[10px] text-text-muted-light dark:text-text-muted-dark">Total Clicks</p>
                </div>
                <div className="rounded-xl bg-black/[0.02] dark:bg-white/[0.03] p-3 text-center">
                  <p className="text-lg font-bold text-gradient tabular-nums">{commissions.length}</p>
                  <p className="text-[10px] text-text-muted-light dark:text-text-muted-dark">Conversions</p>
                </div>
                <div className="rounded-xl bg-black/[0.02] dark:bg-white/[0.03] p-3 text-center">
                  <p className="text-lg font-bold text-gradient tabular-nums">{conversionRate}%</p>
                  <p className="text-[10px] text-text-muted-light dark:text-text-muted-dark">Conv. Rate</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ════════════ MARKETING ════════════ */}
        {tab === 'marketing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white/90">Marketing Center</h2>
              <p className="text-sm text-text-muted-light dark:text-text-muted-dark">Resources to help you promote effectively</p>
            </div>

            {assets.length === 0 ? (
              <div className="rounded-2xl border border-black/[0.04] dark:border-white/[0.06] bg-white/30 dark:bg-white/[0.01] p-8 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/[0.03] dark:bg-white/[0.04]">
                  <svg className="h-5 w-5 text-text-muted-light dark:text-text-muted-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <p className="text-xs text-text-muted-light dark:text-text-muted-dark">Marketing assets will appear here once added by the admin.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {assets.map((a, i) => (
                  <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="rounded-2xl border border-black/[0.04] dark:border-white/[0.06] bg-white/30 dark:bg-white/[0.01] p-4 transition-all duration-300 hover:border-brand-500/15">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/8 text-brand-500 font-medium capitalize">{a.type}</span>
                    </div>
                    <h3 className="font-display text-sm font-bold text-gray-900 dark:text-white/90">{a.title}</h3>
                    {a.description && <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1">{a.description}</p>}
                    {a.content && <p className="text-[11px] text-text-muted-light dark:text-text-muted-dark mt-2 italic">&ldquo;{a.content}&rdquo;</p>}
                    {a.file_url && (
                      <a href={a.file_url} target="_blank" rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 px-3 py-1.5 text-[10px] font-semibold hover:bg-brand-500/20 transition-all">
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                        Download
                      </a>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            <div className="rounded-2xl border border-black/[0.04] dark:border-white/[0.06] bg-white/30 dark:bg-white/[0.01] p-5 sm:p-6">
              <h2 className="font-display text-sm font-semibold mb-4 text-gray-900 dark:text-white/90">Suggested Promotional Copy</h2>
              <div className="space-y-3">
                {[
                  { platform: 'Instagram', text: 'Just discovered some amazing creative tools at @gifted_store! If you are into design, photography, or video production, you need to check these out. Use my link to explore \u2728' },
                  { platform: 'Twitter/X', text: 'Been using @gifted_store products for a while now. High quality creative resources that actually make a difference. If you create, you need these in your toolkit.' },
                  { platform: 'YouTube', text: 'Links to the products I use in my creative workflow are in the description below. Gifted Store has some of the best resources for creators.' },
                  { platform: 'TikTok', text: 'POV: you finally found creative tools that match your vibe \u2728 Check out Gifted Store \u2014 link in bio!' },
                ].map((s) => (
                  <div key={s.platform} className="rounded-xl bg-black/[0.02] dark:bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-500">{s.platform}</span>
                      <button onClick={() => { navigator.clipboard.writeText(s.text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                        className="text-[10px] text-brand-500 hover:underline flex items-center gap-1">
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                        Copy
                      </button>
                    </div>
                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark italic">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ════════════ PAYOUTS ════════════ */}
        {tab === 'payouts' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white/90">Payouts</h2>
              <p className="text-sm text-text-muted-light dark:text-text-muted-dark">Track your earnings and payment history</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { value: formatCurrency(pendingEarnings), label: 'Pending', color: 'text-amber-500', bg: 'bg-amber-500/[0.03] border-amber-500/10' },
                { value: formatCurrency(approvedEarnings), label: 'Approved', color: 'text-blue-500', bg: 'bg-blue-500/[0.03] border-blue-500/10' },
                { value: formatCurrency(paidEarnings), label: 'Paid', color: 'text-green-500', bg: 'bg-green-500/[0.03] border-green-500/10' },
                { value: formatCurrency(lifetimeEarnings), label: 'Lifetime', color: 'text-brand-500', bg: 'bg-brand-500/[0.03] border-brand-500/10' },
              ].map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className={`rounded-2xl border ${stat.bg} p-4 sm:p-5`}>
                  <p className={`text-xl sm:text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs font-medium text-text-muted-light dark:text-text-muted-dark mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            <BankDetailsForm partner={partner} onPartnerUpdated={setPartner} />

            <div className="rounded-2xl border border-black/[0.04] dark:border-white/[0.06] bg-white/30 dark:bg-white/[0.01] p-5 sm:p-6">
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
                      <StatusBadge status={p.status} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ════════════ ACHIEVEMENTS ════════════ */}
        {tab === 'achievements' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white/90">Achievements</h2>
              <p className="text-sm text-text-muted-light dark:text-text-muted-dark">Milestones you have unlocked on your partner journey</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ACHIEVEMENT_DEFS.map((a, i) => {
                const unlocked = unlockedKeys.includes(a.key)
                return (
                  <motion.div key={a.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className={cn(
                      'rounded-2xl border p-5 transition-all duration-300',
                      unlocked
                        ? 'border-brand-500/20 bg-brand-500/[0.03]'
                        : 'border-black/[0.04] dark:border-white/[0.06] bg-white/30 dark:bg-white/[0.01] opacity-50'
                    )}>
                    <div className={cn('text-3xl mb-3', unlocked ? 'opacity-100' : 'grayscale opacity-30')}>{a.icon}</div>
                    <h3 className="font-display text-sm font-bold">{a.title}</h3>
                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1">{a.desc}</p>
                    <div className="mt-3 flex items-center gap-1.5">
                      {unlocked ? (
                        <>
                          <svg className="h-3.5 w-3.5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                          <span className="text-[10px] text-green-500 font-medium">Unlocked</span>
                        </>
                      ) : (
                        <span className="text-[10px] text-text-muted-light/60 dark:text-text-muted-dark/60">Locked</span>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <div className="rounded-2xl border border-black/[0.04] dark:border-white/[0.06] bg-white/30 dark:bg-white/[0.01] p-5 sm:p-6">
              <h2 className="font-display text-sm font-semibold mb-4 text-gray-900 dark:text-white/90">Your Progress</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'Achievements Unlocked', value: `${achievements.length}/${ACHIEVEMENT_DEFS.length}` },
                  { label: 'Total Sales', value: commissions.length.toString() },
                  { label: 'Partner Tier', value: partnerTier },
                ].map(s => (
                  <div key={s.label} className="rounded-xl bg-black/[0.02] dark:bg-white/[0.03] p-4 text-center">
                    <p className="text-xl font-bold tabular-nums text-gradient">{s.value}</p>
                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
           </motion.div>
        )}

        {/* ════════════ ACCOUNT ════════════ */}
        {tab === 'account' && partner && (
          <AccountTab partner={partner} onPartnerUpdated={setPartner} onSignOut={async () => { await signOut() }} />
        )}
      </div>
    </main>
  )
}
