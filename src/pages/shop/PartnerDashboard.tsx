import { useEffect, useState, useCallback } from 'react'
import { usePartnerStore } from '@/store/partner'
import { getPartnerDashboard, buildReferralUrl } from '@/modules/partner/queries'
import { PARTNER_LEVELS, MIN_PAYOUT_AMOUNT } from '@/modules/partner/constants'
import { formatCurrency } from '@/lib/currency'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/Skeleton'
import type { PartnerDashboardData, PartnerLevel, ConversionStatus } from '@/modules/partner/types'

const LEVEL_ORDER: PartnerLevel[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond']

const ALL_ACHIEVEMENTS = [
  { key: 'first_sale', title: 'First Sale', description: 'Made your first successful referral', icon: '🎉' },
  { key: 'ten_sales', title: 'Rising Star', description: 'Reached 10 successful referrals', icon: '⭐' },
  { key: 'fifty_sales', title: 'Power Partner', description: 'Reached 50 successful referrals', icon: '🔥' },
  { key: 'hundred_sales', title: 'Century Club', description: 'Reached 100 successful referrals', icon: '💯' },
  { key: 'revenue_100k', title: 'Revenue Maker', description: 'Generated ₦100,000 in sales', icon: '💰' },
  { key: 'revenue_500k', title: 'Big Earner', description: 'Generated ₦500,000 in sales', icon: '🏆' },
  { key: 'revenue_1m', title: 'Million Generator', description: 'Generated ₦1,000,000 in sales', icon: '👑' },
  { key: 'hundred_clicks', title: 'Traffic Driver', description: 'Generated 100 clicks', icon: '📈' },
  { key: 'thousand_clicks', title: 'Click Master', description: 'Generated 1,000 clicks', icon: '🚀' },
  { key: 'five_thousand_clicks', title: 'Viral Force', description: 'Generated 5,000 clicks', icon: '⚡' },
  { key: 'level_silver', title: 'Silver Partner', description: 'Reached Silver tier', icon: '🥈' },
  { key: 'level_gold', title: 'Gold Partner', description: 'Reached Gold tier', icon: '🥇' },
  { key: 'level_platinum', title: 'Platinum Partner', description: 'Reached Platinum tier', icon: '💎' },
  { key: 'level_diamond', title: 'Diamond Partner', description: 'Reached Diamond tier', icon: '👑' },
  { key: 'first_payout', title: 'First Payout', description: 'Received your first payout', icon: '💸' },
]

const STATUS_STYLES: Record<ConversionStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', label: 'Pending' },
  approved: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400', label: 'Approved' },
  paid: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', label: 'Paid' },
  cancelled: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', label: 'Cancelled' },
}

function getNextLevel(currentLevel: PartnerLevel): PartnerLevel | null {
  const idx = LEVEL_ORDER.indexOf(currentLevel)
  if (idx < LEVEL_ORDER.length - 1) return LEVEL_ORDER[idx + 1]
  return null
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(dateStr)
}

export default function PartnerDashboard() {
  const { partner } = usePartnerStore()
  const [data, setData] = useState<PartnerDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showProductLinkForm, setShowProductLinkForm] = useState(false)
  const [productSlug, setProductSlug] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [productLinkCopied, setProductLinkCopied] = useState(false)

  const loadDashboard = useCallback(async () => {
    if (!partner) return
    try {
      setLoading(true)
      setError(null)
      const dashboardData = await getPartnerDashboard(partner.id)
      setData(dashboardData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [partner])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [])

  const handleShare = useCallback(async (url: string) => {
    if (navigator.share) {
      try { await navigator.share({ title: 'Check this out!', url }) } catch { /* user cancelled */ }
    } else {
      handleCopy(url)
    }
  }, [handleCopy])

  const handleGenerateProductLink = useCallback(() => {
    if (!partner || !productSlug.trim()) return
    setGeneratedLink(buildReferralUrl(partner.referral_code, productSlug.trim()))
    setProductLinkCopied(false)
  }, [partner, productSlug])

  const handleCopyProductLink = useCallback(async () => {
    if (!generatedLink) return
    try {
      await navigator.clipboard.writeText(generatedLink)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = generatedLink
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setProductLinkCopied(true)
    setTimeout(() => setProductLinkCopied(false), 2000)
  }, [generatedLink])

  if (!partner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <p className="text-gray-500 dark:text-gray-400">Please sign in to view your dashboard.</p>
      </div>
    )
  }

  const referralUrl = buildReferralUrl(partner.referral_code)
  const conversionRate = data ? (data.todayClicks > 0 ? ((data.todayConversions / data.todayClicks) * 100).toFixed(1) : '0.0') : '0.0'
  const nextLevel = getNextLevel(partner.level)
  const currentLevelData = PARTNER_LEVELS[partner.level]
  const nextLevelData = nextLevel ? PARTNER_LEVELS[nextLevel] : null
  const levelProgress = nextLevelData
    ? Math.min(100, (partner.total_revenue_generated / nextLevelData.minRevenue) * 100)
    : 100
  const unlockedKeys = new Set((data?.achievements || []).map((a) => a.achievement_key))

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {partner.name?.split(' ')[0] || 'Partner'}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {"Here's your performance overview for today."}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/10 p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <button onClick={loadDashboard} className="mt-2 text-sm font-medium text-red-600 dark:text-red-400 underline underline-offset-2 hover:no-underline">
              Try again
            </button>
          </div>
        )}

        {/* Row 1 — Today's Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {loading ? (
            <><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></>
          ) : (
            <>
              <StatCard label="Today's Clicks" value={data?.todayClicks ?? 0} gradient="from-brand-500/10 to-blue-500/5 dark:from-brand-500/20 dark:to-blue-500/10"
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" /></svg>} />
              <StatCard label="Today's Conversions" value={data?.todayConversions ?? 0} gradient="from-green-500/10 to-emerald-500/5 dark:from-green-500/20 dark:to-emerald-500/10"
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>} />
              <StatCard label="Today's Earnings" value={formatCurrency(data?.todayCommission ?? 0)} gradient="from-amber-500/10 to-yellow-500/5 dark:from-amber-500/20 dark:to-yellow-500/10"
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
              <StatCard label="Conversion Rate" value={`${conversionRate}%`} gradient="from-violet-500/10 to-purple-500/5 dark:from-violet-500/20 dark:to-purple-500/10"
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>} />
            </>
          )}
        </div>

        {/* Row 2 — Earnings Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? (
            <><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></>
          ) : (
            <>
              <StatCard label="Pending Earnings" value={formatCurrency(partner.pending_commission ?? 0)} accent="amber" gradient="from-amber-500/10 to-orange-500/5 dark:from-amber-500/20 dark:to-orange-500/10"
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
              <StatCard label="Paid Earnings" value={formatCurrency(partner.paid_commission ?? 0)} accent="green" gradient="from-green-500/10 to-emerald-500/5 dark:from-green-500/20 dark:to-emerald-500/10"
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>} />
              <StatCard label="Total Earnings" value={formatCurrency(partner.total_commission_earned ?? 0)} gradient="from-brand-500/10 to-blue-500/5 dark:from-brand-500/20 dark:to-blue-500/10"
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" /></svg>} />
              <StatCard label="Lifetime Revenue" value={formatCurrency(partner.total_revenue_generated ?? 0)} gradient="from-gray-500/10 to-slate-500/5 dark:from-gray-500/20 dark:to-slate-500/10"
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" /></svg>} />
            </>
          )}
        </div>

        {/* Row 3 — Referral Link + Partner Level */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {loading ? (
            <><CardSkeleton /><CardSkeleton /></>
          ) : (
            <>
              {/* Referral Link Card */}
              <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Referral Link</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0 rounded-xl border border-gray-200 dark:border-white/[0.1] bg-gray-50 dark:bg-white/[0.03] px-4 py-2.5">
                      <p className="text-sm text-gray-700 dark:text-gray-300 truncate font-mono">{referralUrl}</p>
                    </div>
                    <button onClick={() => handleCopy(referralUrl)} className={cn('shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200', copied ? 'bg-green-500 text-white' : 'bg-brand-500 text-white hover:bg-brand-600 active:scale-95')}>
                      {copied ? (
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                          Copied
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>
                          Copy
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button onClick={() => handleShare(referralUrl)} className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.06] transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
                      Share
                    </button>
                    <button onClick={() => setShowProductLinkForm(!showProductLinkForm)} className="flex items-center gap-2 rounded-xl border border-brand-200 dark:border-brand-800/40 bg-brand-50 dark:bg-brand-900/20 px-4 py-2.5 text-sm font-medium text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                      Product Link
                    </button>
                  </div>

                  {showProductLinkForm && (
                    <div className="rounded-xl border border-brand-200 dark:border-brand-800/40 bg-brand-50/50 dark:bg-brand-900/10 p-4 space-y-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Enter product slug</label>
                      <div className="flex gap-2">
                        <input type="text" value={productSlug} onChange={(e) => { setProductSlug(e.target.value); setGeneratedLink(''); }} placeholder="e.g. digital-toolkit" className="flex-1 rounded-xl border border-gray-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.04] px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40" />
                        <button onClick={handleGenerateProductLink} disabled={!productSlug.trim()} className="shrink-0 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Generate</button>
                      </div>
                      {generatedLink && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 min-w-0 rounded-lg border border-gray-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.03] px-3 py-2">
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate font-mono">{generatedLink}</p>
                          </div>
                          <button onClick={handleCopyProductLink} className={cn('shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-all', productLinkCopied ? 'bg-green-500 text-white' : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90')}>
                            {productLinkCopied ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="rounded-xl border border-dashed border-gray-300 dark:border-white/[0.1] bg-gray-50 dark:bg-white/[0.02] p-6 flex flex-col items-center justify-center gap-2">
                    <div className="w-24 h-24 rounded-lg bg-gray-200 dark:bg-white/[0.06] flex items-center justify-center">
                      <svg className="w-10 h-10 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">QR Code</p>
                  </div>
                </div>
              </div>

              {/* Partner Level Card */}
              <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Partner Level</h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${currentLevelData.color}15`, color: currentLevelData.color }}>
                      {currentLevelData.icon}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Current Level</p>
                      <p className="text-xl font-bold" style={{ color: currentLevelData.color }}>{currentLevelData.label}</p>
                    </div>
                  </div>

                  {nextLevel && nextLevelData ? (
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Progress to {nextLevelData.label}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{Math.round(levelProgress)}%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${levelProgress}%`, background: `linear-gradient(90deg, ${currentLevelData.color}, ${nextLevelData.color})` }} />
                      </div>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Revenue: {formatCurrency(partner.total_revenue_generated)} / {formatCurrency(nextLevelData.minRevenue)} needed
                      </p>
                      {nextLevelData.minConversions > 0 && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Conversions: {partner.total_conversions} / {nextLevelData.minConversions} needed
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl bg-gradient-to-r from-gray-50 to-white dark:from-white/[0.04] dark:to-white/[0.02] border border-gray-200 dark:border-white/[0.08] p-4 text-center">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{"You've reached the highest level!"}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Maximum commission bonus of {Math.round(currentLevelData.commissionBonus * 100)}% unlocked
                      </p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Level Benefits</h3>
                    <div className="space-y-2">
                      {[
                        `Base commission rate: ${Math.round(currentLevelData.commissionBonus * 100)}% bonus`,
                        `Min payout: ${formatCurrency(MIN_PAYOUT_AMOUNT)}`,
                        'Priority support & early access',
                      ].map((benefit, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                          <div className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center shrink-0">
                            <svg className="w-3 h-3 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                          </div>
                          <span className="text-gray-600 dark:text-gray-400">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Row 4 — Recent Conversions + Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {loading ? (
            <><CardSkeleton /><CardSkeleton /></>
          ) : (
            <>
              {/* Recent Conversions */}
              <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Conversions</h2>
                  <a href="/partner/analytics" className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline underline-offset-2">View All</a>
                </div>
                {(data?.recentConversions ?? []).length === 0 ? (
                  <div className="py-10 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">No conversions yet</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Share your referral link to start earning!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(data?.recentConversions ?? []).map((conversion) => {
                      const statusStyle = STATUS_STYLES[conversion.status]
                      return (
                        <div key={conversion.id} className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 dark:border-white/[0.05] bg-gray-50/50 dark:bg-white/[0.02] p-3.5">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{conversion.product_type || 'Product'}</p>
                              <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide', statusStyle.bg, statusStyle.text)}>{statusStyle.label}</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {formatDate(conversion.created_at)} at {formatTime(conversion.created_at)}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(conversion.sale_amount)}</p>
                            <p className="text-xs text-green-600 dark:text-green-400">+{formatCurrency(conversion.commission_amount)}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Recent Notifications */}
              <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
                  <a href="/partner/notifications" className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline underline-offset-2">View All</a>
                </div>
                {(data?.recentNotifications ?? []).length === 0 ? (
                  <div className="py-10 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">No notifications</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{"You're all caught up!"}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(data?.recentNotifications ?? []).slice(0, 5).map((notification) => (
                      <div key={notification.id} className={cn('flex items-start gap-3 rounded-xl p-3.5 transition-colors', notification.read ? 'bg-gray-50/50 dark:bg-white/[0.02]' : 'bg-brand-50/50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-800/30')}>
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5', notification.read ? 'bg-gray-100 dark:bg-white/[0.04]' : 'bg-brand-100 dark:bg-brand-800/30')}>
                          {notification.type === 'achievement' ? <span className="text-sm">🏆</span> : notification.type === 'payout' ? <span className="text-sm">💸</span> : notification.type === 'conversion' ? <span className="text-sm">💰</span> : <span className="text-sm">📢</span>}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className={cn('text-sm font-medium truncate', notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white')}>{notification.title}</p>
                            {!notification.read && <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{notification.message}</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{timeAgo(notification.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Row 5 — Achievements */}
        <div className="mb-8">
          {loading ? (
            <CardSkeleton />
          ) : (
            <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Achievements</h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {unlockedKeys.size} / {ALL_ACHIEVEMENTS.length} unlocked
                </span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                {ALL_ACHIEVEMENTS.map((achievement) => {
                  const isUnlocked = unlockedKeys.has(achievement.key)
                  return (
                    <div key={achievement.key} className={cn('shrink-0 w-36 rounded-xl border p-4 text-center transition-all', isUnlocked ? 'border-brand-200 dark:border-brand-800/40 bg-gradient-to-b from-brand-50/50 to-transparent dark:from-brand-900/20 dark:to-transparent' : 'border-gray-200 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02] opacity-50 grayscale')}>
                      <div className={cn('w-12 h-12 rounded-2xl mx-auto mb-2 flex items-center justify-center text-2xl', isUnlocked ? 'bg-brand-100 dark:bg-brand-800/30' : 'bg-gray-200 dark:bg-white/[0.04]')}>
                        {achievement.icon}
                      </div>
                      <p className={cn('text-xs font-semibold', isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600')}>{achievement.title}</p>
                      <p className={cn('text-[10px] mt-1 leading-tight', isUnlocked ? 'text-gray-500 dark:text-gray-400' : 'text-gray-300 dark:text-gray-700')}>{achievement.description}</p>
                      {isUnlocked && (
                        <div className="mt-2">
                          <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-[9px] font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide">Unlocked</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-8 w-28" />
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6">
      <Skeleton className="h-5 w-40 mb-6" />
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton variant="circular" width={36} height={36} />
            <div className="flex-1">
              <Skeleton className="h-3 w-32 mb-2" />
              <Skeleton className="h-2.5 w-20" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, gradient, accent }: {
  label: string
  value: string | number
  icon: React.ReactNode
  gradient: string
  accent?: 'amber' | 'green'
}) {
  return (
    <div className="relative rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6 overflow-hidden">
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-60', gradient)} />
      <div className="relative">
        <div className="flex items-center gap-3 mb-3">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', accent === 'amber' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' : accent === 'green' ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400')}>
            {icon}
          </div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
        </div>
        <p className={cn('text-2xl font-bold', accent === 'amber' ? 'text-amber-700 dark:text-amber-300' : accent === 'green' ? 'text-green-700 dark:text-green-300' : 'text-gray-900 dark:text-white')}>
          {value}
        </p>
      </div>
    </div>
  )
}
