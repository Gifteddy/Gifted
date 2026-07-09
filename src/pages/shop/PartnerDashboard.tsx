import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/currency'
import { LiquidGlass } from '@/components/ui/LiquidGlass'
import { cn } from '@/lib/utils'
import { usePartnerStore } from '@/store/partner'
import {
  getPartnerNotifications, getPartnerAchievements,
  getMarketingAssets,
  getCommissionsByMonth, getTopPerformingProducts,
  updatePartnerBankDetails,
} from '@/lib/commerce-queries'
import type { Affiliate, AffiliateCommission, AffiliatePayout, AffiliateClick, PartnerAchievement, MarketingAsset, PartnerNotification, Product } from '@/lib/commerce-types'

type Tab = 'overview' | 'link' | 'products' | 'analytics' | 'marketing' | 'payouts' | 'achievements'

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'link', label: 'Partner Link', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
  { id: 'products', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { id: 'analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'marketing', label: 'Marketing', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'payouts', label: 'Payouts', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'achievements', label: 'Achievements', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
]

const achievementDefs: { key: string; title: string; desc: string; icon: string }[] = [
  { key: 'first_sale', title: 'First Sale', desc: 'Made your first sale as a partner', icon: '\uD83C\uDF1F' },
  { key: 'ten_sales', title: '10 Sales', desc: 'Reached 10 successful sales', icon: '\uD83D\uDE80' },
  { key: 'hundred_clicks', title: '100 Clicks', desc: 'Generated 100 referral clicks', icon: '\uD83D\uDCA5' },
  { key: 'top_performer', title: 'Top Performer', desc: 'Highest monthly earnings', icon: '\uD83C\uDFC6' },
  { key: 'bundle_seller', title: 'Bundle Seller', desc: 'Sold a product bundle', icon: '\uD83D\uDCE6' },
  { key: 'milestone_earnings', title: 'Earnings Milestone', desc: 'Reached a significant earnings milestone', icon: '\u2B50' },
]

export default function PartnerDashboard() {
  const { user, loading: authLoading, initialized, initialize, signIn, signOut } = usePartnerStore()
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginSubmitting, setLoginSubmitting] = useState(false)
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
  const [tab, setTab] = useState<Tab>('overview')
  const [copied, setCopied] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showQR, setShowQR] = useState(false)

  const [utmSource, setUtmSource] = useState('')
  const [utmMedium, setUtmMedium] = useState('')
  const [utmCampaign, setUtmCampaign] = useState('')

  const [bankName, setBankName] = useState('')
  const [accountName, setAccountName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [bankSaving, setBankSaving] = useState(false)

  const [customAlias, setCustomAlias] = useState('')
  const [customLink, setCustomLink] = useState('')

  useEffect(() => { initialize() }, [initialize])

  const loadPartner = async (aff: Affiliate) => {
    setPartner(aff)
    const [commData, clickData, payoutData, prodData, notifData, achieveData, assetData, monthData, topData] = await Promise.all([
      supabase.from('affiliate_commissions').select('*').eq('affiliate_id', aff.id).order('created_at', { ascending: false }),
      supabase.from('affiliate_clicks').select('*').eq('affiliate_id', aff.id).order('created_at', { ascending: false }),
      supabase.from('affiliate_payouts').select('*').eq('affiliate_id', aff.id).order('created_at', { ascending: false }),
      supabase.from('products').select('*').eq('published', true).order('display_order', { ascending: true }),
      getPartnerNotifications(aff.id).catch(() => []),
      getPartnerAchievements(aff.id).catch(() => []),
      getMarketingAssets().catch(() => []),
      getCommissionsByMonth(aff.id).catch(() => []),
      getTopPerformingProducts(aff.id).catch(() => []),
    ])
    setCommissions(commData.data as AffiliateCommission[] || [])
    setClicks(clickData.data as AffiliateClick[] || [])
    setPayouts(payoutData.data as AffiliatePayout[] || [])
    setProducts(prodData.data as Product[] || [])
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
          .from('affiliates').select('*').eq('email', user!.email!).eq('status', 'approved').single()
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
    if (!loginEmail.trim() || !loginPassword.trim()) return
    setLoginSubmitting(true); setLoginError('')
    try {
      const { error: signInError } = await signIn(loginEmail.trim(), loginPassword)
      if (signInError) { setLoginError(signInError); setLoginSubmitting(false) }
    } catch { setLoginError('Failed to sign in'); setLoginSubmitting(false) }
  }

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

  const pendingEarnings = commissions.filter(c => c.status === 'pending' || c.status === 'approved').reduce((s, c) => s + c.amount, 0)
  const approvedEarnings = commissions.filter(c => c.status === 'approved').reduce((s, c) => s + c.amount, 0)
  const paidEarnings = commissions.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0)
  const lifetimeEarnings = commissions.reduce((s, c) => s + c.amount, 0)
  const conversionRate = clicks.length > 0 ? ((commissions.length / clicks.length) * 100).toFixed(1) : '0.0'
  const monthEarnings = commissions
    .filter(c => new Date(c.created_at).getMonth() === new Date().getMonth() && new Date(c.created_at).getFullYear() === new Date().getFullYear())
    .reduce((s, c) => s + c.amount, 0)
  const referralRevenue = lifetimeEarnings

  const referralLink = `${import.meta.env.VITE_SITE_URL || window.location.origin}/shop?ref=${partner?.referral_code || ''}`
  const unlockedKeys: string[] = achievements.map(a => a.achievement_key)
  const unreadNotifs = notifications.filter(n => !n.read).length

  const partnerTier = lifetimeEarnings >= 500000 ? 'Premium' : lifetimeEarnings >= 100000 ? 'Elite' : lifetimeEarnings >= 1 ? 'Active' : 'New'
  const partnerTierIcon = lifetimeEarnings >= 500000 ? '\uD83D\uDC51' : lifetimeEarnings >= 100000 ? '\uD83D\uDE80' : '\uD83C\uDF1F'

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-green-500/10 text-green-500',
      approved: 'bg-blue-500/10 text-blue-500',
      pending: 'bg-amber-500/10 text-amber-500',
      rejected: 'bg-red-500/10 text-red-500',
      cancelled: 'bg-gray-500/10 text-gray-500',
    }
    return (
      <span className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full capitalize ${colors[status] || 'bg-gray-500/10 text-gray-500'}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${status === 'paid' ? 'bg-green-500' : status === 'approved' ? 'bg-blue-500' : status === 'pending' ? 'bg-amber-500' : status === 'rejected' ? 'bg-red-500' : 'bg-gray-500'}`} />
        {status}
      </span>
    )
  }

  const handleSaveBank = async () => {
    if (!partner || !bankName || !accountName || !accountNumber) return
    setBankSaving(true)
    try {
      const updated = await updatePartnerBankDetails(partner.id, { account_name: accountName, account_number: accountNumber, bank_name: bankName })
      setPartner(updated)
    } catch { }
    setBankSaving(false)
  }

  const generateUtmLink = () => {
    const url = new URL(referralLink)
    if (utmSource) url.searchParams.set('utm_source', utmSource)
    if (utmMedium) url.searchParams.set('utm_medium', utmMedium)
    if (utmCampaign) url.searchParams.set('utm_campaign', utmCampaign)
    return url.toString()
  }

  const generateCustomLink = () => {
    if (!customAlias.trim()) return
    setCustomLink(`${import.meta.env.VITE_SITE_URL || window.location.origin}/r/${customAlias.trim()}`)
  }

  const productCommissionRate = (type: string) => type === 'physical' ? '10%' : '30%'
  const productCommissionLabel = (type: string) => type === 'physical' ? 'Merch' : 'Digital'

  const maxEarnings = Math.max(...monthlyData.map(m => m.earnings), 1)

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
                  <label className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-white/60">Email Address</label>
                  <input value={loginEmail} onChange={e => setLoginEmail(e.target.value)} type="email" placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-white/60">Password</label>
                  <input value={loginPassword} onChange={e => setLoginPassword(e.target.value)} type="password" placeholder="Your password"
                    autoComplete="current-password"
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    className="w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 transition-all" />
                </div>
                {loginError && <p className="text-xs text-red-400">{loginError}</p>}
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
            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative flex h-8 w-8 items-center justify-center rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors">
                <svg className="h-4 w-4 text-gray-500 dark:text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
                {unreadNotifs > 0 && <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[8px] font-bold text-white flex items-center justify-center">{unreadNotifs}</span>}
              </button>
              {showNotifications && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 top-10 w-80 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-surface-dark shadow-xl shadow-black/[0.04] dark:shadow-black/[0.2] overflow-hidden z-50">
                  <div className="p-3 border-b border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
                    <p className="text-xs font-semibold">Notifications</p>
                    {unreadNotifs > 0 && (
                      <button onClick={() => supabase.from('partner_notifications').update({ read: true }).eq('partner_id', partner.id).eq('read', false).then(() => {
                        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
                      })} className="text-[10px] text-brand-500 hover:underline">Mark all read</button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center">
                        <p className="text-xs text-text-muted-light dark:text-text-muted-dark">No notifications yet</p>
                      </div>
                    ) : notifications.slice(0, 10).map(n => (
                      <div key={n.id} className={cn('px-4 py-3 border-b border-black/[0.02] dark:border-white/[0.04] hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors', !n.read && 'bg-brand-500/[0.02]')}>
                        <p className="text-xs font-medium text-gray-900 dark:text-white/90">{n.title}</p>
                        <p className="text-[10px] text-text-muted-light dark:text-text-muted-dark mt-0.5">{n.message}</p>
                        <p className="text-[9px] text-text-muted-light/50 dark:text-text-muted-dark/50 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
            {/* Sign out */}
            <button onClick={handleSignOut} className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors" title="Sign out">
              <svg className="h-4 w-4 text-gray-500 dark:text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
            </button>
            {/* Partner name */}
            <span className="text-xs text-text-muted-light dark:text-text-muted-dark hidden sm:block">{partner.name}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-24 pb-20">

        {/* ── Tabs ── */}
        <div className="flex gap-1 mb-8 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] p-1 w-fit overflow-x-auto">
          {tabs.map(t => (
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

            {/* Welcome */}
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white/90">Welcome back, {partner.name.split(' ')[0]}</h2>
              <p className="text-sm text-text-muted-light dark:text-text-muted-dark">Here is your performance summary</p>
            </div>

            {/* Primary Stats */}
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

            {/* Secondary Stats */}
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

            {/* Recent Commissions + Monthly Chart */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent Commissions */}
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
                        {statusBadge(c.status)}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Monthly Earnings Chart */}
              <div className="rounded-2xl border border-black/[0.04] dark:border-white/[0.06] bg-white/30 dark:bg-white/[0.01] p-5 sm:p-6">
                <h2 className="font-display text-sm font-semibold mb-4 text-gray-900 dark:text-white/90">Monthly Earnings</h2>
                <div className="flex items-end gap-2 h-40">
                  {monthlyData.length === 0 ? (
                    <div className="w-full flex items-center justify-center h-full">
                      <p className="text-xs text-text-muted-light dark:text-text-muted-dark">No data yet</p>
                    </div>
                  ) : monthlyData.map((m, _i) => (
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
                      <span className="text-[8px] text-text-muted-light/50 dark:text-text-muted-dark/50">{m.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Products */}
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

            {/* Main Link Card */}
            <LiquidGlass intensity="subtle" className="rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-brand-500 mb-2">Partner Link</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm bg-white/50 dark:bg-white/[0.06] px-4 py-3 rounded-xl text-brand-500 font-mono border border-brand-500/10 truncate">{referralLink}</code>
                    <button onClick={() => { navigator.clipboard.writeText(referralLink); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white hover:bg-brand-600 transition-all active:scale-90">
                      {copied ? (
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                      ) : (
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
                  <button onClick={() => { if (navigator.share) navigator.share({ title: 'Gifted Store', url: referralLink }) }}
                    className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium text-gray-700 dark:text-white/70 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" /></svg>
                    Share
                  </button>
                  <button onClick={() => setShowQR(!showQR)}
                    className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium text-gray-700 dark:text-white/70 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                    QR Code
                  </button>
                </div>

                {showQR && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex justify-center pt-2">
                    <div className="rounded-xl bg-white p-4 shadow-sm">
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(referralLink)}`} alt="QR Code" className="h-36 w-36" />
                    </div>
                  </motion.div>
                )}
              </div>
            </LiquidGlass>

            {/* UTM Builder */}
            <LiquidGlass intensity="subtle" className="rounded-2xl p-6 sm:p-8">
              <h3 className="font-display text-sm font-semibold mb-4 text-gray-900 dark:text-white/90">UTM Link Builder</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-[10px] font-medium mb-1 text-text-muted-light dark:text-text-muted-dark">Source</label>
                  <input value={utmSource} onChange={e => setUtmSource(e.target.value)} placeholder="e.g. instagram"
                    className="w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-3 py-2.5 text-xs outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-medium mb-1 text-text-muted-light dark:text-text-muted-dark">Medium</label>
                  <input value={utmMedium} onChange={e => setUtmMedium(e.target.value)} placeholder="e.g. social"
                    className="w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-3 py-2.5 text-xs outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-medium mb-1 text-text-muted-light dark:text-text-muted-dark">Campaign</label>
                  <input value={utmCampaign} onChange={e => setUtmCampaign(e.target.value)} placeholder="e.g. summer_promo"
                    className="w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-3 py-2.5 text-xs outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 transition-all" />
                </div>
              </div>
              {(utmSource || utmMedium || utmCampaign) && (
                <div className="mt-4">
                  <p className="text-[10px] font-medium text-text-muted-light dark:text-text-muted-dark mb-1.5">Generated Link</p>
                  <code className="block text-[11px] bg-white/50 dark:bg-white/[0.06] px-3 py-2 rounded-xl text-brand-500 font-mono border border-brand-500/10 break-all">{generateUtmLink()}</code>
                  <button onClick={() => { navigator.clipboard.writeText(generateUtmLink()); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                    className="mt-2 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[10px] font-medium text-brand-500 hover:bg-brand-500/10 transition-all">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                    Copy UTM Link
                  </button>
                </div>
              )}
            </LiquidGlass>

            {/* Custom Link Builder */}
            <LiquidGlass intensity="subtle" className="rounded-2xl p-6 sm:p-8">
              <h3 className="font-display text-sm font-semibold mb-4 text-gray-900 dark:text-white/90">Custom Short Link</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted-light dark:text-text-muted-dark whitespace-nowrap">{import.meta.env.VITE_SITE_URL || window.location.origin}/r/</span>
                <input value={customAlias} onChange={e => setCustomAlias(e.target.value)} placeholder="your-name"
                  className="flex-1 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-3 py-2.5 text-xs outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 transition-all" />
                <button onClick={generateCustomLink} disabled={!customAlias.trim()}
                  className="rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-brand-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  Generate
                </button>
              </div>
              {customLink && (
                <div className="mt-3">
                  <code className="block text-[11px] bg-white/50 dark:bg-white/[0.06] px-3 py-2 rounded-xl text-brand-500 font-mono border border-brand-500/10">{customLink}</code>
                </div>
              )}
            </LiquidGlass>
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
                        <img src={p.thumbnail} alt={p.title} className="h-full w-full object-cover" />
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

            {/* Key Metrics */}
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
              {/* Monthly Sales Chart */}
              <div className="rounded-2xl border border-black/[0.04] dark:border-white/[0.06] bg-white/30 dark:bg-white/[0.01] p-5 sm:p-6">
                <h2 className="font-display text-sm font-semibold mb-4 text-gray-900 dark:text-white/90">Commission Trends</h2>
                <div className="flex items-end gap-2 h-32">
                  {monthlyData.length === 0 ? (
                    <div className="w-full flex items-center justify-center h-full">
                      <p className="text-xs text-text-muted-light dark:text-text-muted-dark">No data yet</p>
                    </div>
                  ) : monthlyData.map((m, _i) => {
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

              {/* Top Products */}
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

            {/* Referral Stats */}
            <div className="rounded-2xl border border-black/[0.04] dark:border-white/[0.06] bg-white/30 dark:bg-white/[0.01] p-5 sm:p-6">
              <h2 className="font-display text-sm font-semibold mb-4 text-gray-900 dark:text-white/90">Referral Analytics</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-black/[0.02] dark:bg-white/[0.03] p-4 text-center">
                  <p className="text-2xl font-bold text-gradient tabular-nums">{clicks.length}</p>
                  <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1">Total Clicks</p>
                </div>
                <div className="rounded-xl bg-black/[0.02] dark:bg-white/[0.03] p-4 text-center">
                  <p className="text-2xl font-bold text-gradient tabular-nums">{commissions.length}</p>
                  <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1">Conversions</p>
                </div>
                <div className="rounded-xl bg-black/[0.02] dark:bg-white/[0.03] p-4 text-center">
                  <p className="text-2xl font-bold text-gradient tabular-nums">{conversionRate}%</p>
                  <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1">Conversion Rate</p>
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

            {/* Suggested Copy */}
            <div className="rounded-2xl border border-black/[0.04] dark:border-white/[0.06] bg-white/30 dark:bg-white/[0.01] p-5 sm:p-6">
              <h2 className="font-display text-sm font-semibold mb-4 text-gray-900 dark:text-white/90">Suggested Promotional Copy</h2>
              <div className="space-y-3">
                {[
                  { platform: 'Instagram', text: 'Just discovered some amazing creative tools at @gifted_store! If you are into design, photography, or video production, you need to check these out. Use my link to explore \u2728' },
                  { platform: 'Twitter/X', text: 'Been using @gifted_store products for a while now. High quality creative resources that actually make a difference. If you create, you need these in your toolkit.' },
                  { platform: 'YouTube', text: 'Links to the products I use in my creative workflow are in the description below. Gifted Store has some of the best resources for creators.' },
                  { platform: 'TikTok', text: 'POV: you finally found creative tools that match your vibe \u2728 Check out Gifted Store \u2014 link in bio!' },
                ].map((s, _i) => (
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

            {/* Earnings Grid */}
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

            {/* Bank Details */}
            <LiquidGlass intensity="subtle" className="rounded-2xl p-6 sm:p-8">
              <h3 className="font-display text-sm font-semibold mb-4 text-gray-900 dark:text-white/90">Bank Details for Payouts</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-[10px] font-medium mb-1 text-text-muted-light dark:text-text-muted-dark">Bank Name</label>
                  <input value={bankName || partner.bank_name || ''} onChange={e => setBankName(e.target.value)} placeholder="e.g. Access Bank"
                    className="w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-3 py-2.5 text-xs outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-medium mb-1 text-text-muted-light dark:text-text-muted-dark">Account Name</label>
                  <input value={accountName || partner.account_name || ''} onChange={e => setAccountName(e.target.value)} placeholder="Full account name"
                    className="w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-3 py-2.5 text-xs outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-medium mb-1 text-text-muted-light dark:text-text-muted-dark">Account Number</label>
                  <input value={accountNumber || partner.account_number || ''} onChange={e => setAccountNumber(e.target.value)} placeholder="0123456789"
                    className="w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-3 py-2.5 text-xs outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 transition-all" />
                </div>
              </div>
              <button onClick={handleSaveBank} disabled={bankSaving || !bankName || !accountName || !accountNumber}
                className="mt-4 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                {bankSaving ? 'Saving...' : 'Save Bank Details'}
              </button>
            </LiquidGlass>

            {/* Payout History */}
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
                      {statusBadge(p.status)}
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
              {achievementDefs.map((a, i) => {
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

            {/* Stats Summary */}
            <div className="rounded-2xl border border-black/[0.04] dark:border-white/[0.06] bg-white/30 dark:bg-white/[0.01] p-5 sm:p-6">
              <h2 className="font-display text-sm font-semibold mb-4 text-gray-900 dark:text-white/90">Your Progress</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'Achievements Unlocked', value: `${achievements.length}/${achievementDefs.length}` },
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
      </div>
    </main>
  )
}
