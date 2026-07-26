import { supabase } from '@/lib/supabase'
import type {
  Affiliate, AffiliateClick, AffiliateCommission, AffiliatePayout,
  PartnerNotification, PartnerAchievement, MarketingAsset,
} from './types'
import type { Product } from '@/lib/commerce-types'

export async function getAffiliates() {
  const { data, error } = await supabase
    .from('affiliates')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Affiliate[]
}

export async function getAffiliateByReferralCode(code: string) {
  const { data, error } = await supabase
    .from('affiliates')
    .select('*')
    .eq('referral_code', code)
    .eq('status', 'approved')
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data as Affiliate | null
}

export async function getAffiliateDashboard(affiliateId: string) {
  const { data: affiliate, error } = await supabase
    .from('affiliates')
    .select('*')
    .eq('id', affiliateId)
    .single()
  if (error) throw error

  const { data: commissions, error: commError } = await supabase
    .from('affiliate_commissions')
    .select('*')
    .eq('affiliate_id', affiliateId)
    .order('created_at', { ascending: false })
  if (commError) throw commError

  const { data: clicks, error: clickError } = await supabase
    .from('affiliate_clicks')
    .select('*')
    .eq('affiliate_id', affiliateId)
    .order('created_at', { ascending: false })
  if (clickError) throw clickError

  return {
    affiliate: affiliate as Affiliate,
    commissions: commissions as AffiliateCommission[],
    clicks: clicks as AffiliateClick[],
  }
}

export async function createAffiliateApplication(application: {
  name: string
  email: string
  phone?: string
  social_links: string
  reason: string
  audience_description: string
}) {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase()

  const { error } = await supabase
    .from('affiliates')
    .insert([{
      ...application,
      referral_code: code,
      status: 'pending',
    }])

  if (error) throw error
}

export async function updateAffiliateStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from('affiliates')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Affiliate
}

export async function getAffiliateCommissions(affiliateId: string) {
  const { data, error } = await supabase
    .from('affiliate_commissions')
    .select('*')
    .eq('affiliate_id', affiliateId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as AffiliateCommission[]
}

export async function getAffiliatePayouts(affiliateId: string) {
  const { data, error } = await supabase
    .from('affiliate_payouts')
    .select('*')
    .eq('affiliate_id', affiliateId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as AffiliatePayout[]
}

export async function createAffiliatePayout(payout: Omit<AffiliatePayout, 'id' | 'status' | 'processed_at' | 'created_at'>) {
  const { data, error } = await supabase
    .from('affiliate_payouts')
    .insert([{ ...payout, status: 'pending' }])
    .select()
    .single()
  if (error) throw error
  return data as AffiliatePayout
}

export async function getPartnerNotifications(partnerId: string) {
  const { data, error } = await supabase
    .from('partner_notifications')
    .select('*')
    .eq('partner_id', partnerId)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) throw error
  return data as PartnerNotification[]
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase
    .from('partner_notifications')
    .update({ read: true })
    .eq('id', id)
  if (error) throw error
}

export async function markAllNotificationsRead(partnerId: string) {
  const { error } = await supabase
    .from('partner_notifications')
    .update({ read: true })
    .eq('partner_id', partnerId)
    .eq('read', false)
  if (error) throw error
}

export async function getPartnerAchievements(partnerId: string) {
  const { data, error } = await supabase
    .from('partner_achievements')
    .select('*')
    .eq('partner_id', partnerId)
    .order('achieved_at', { ascending: false })
  if (error) throw error
  return data as PartnerAchievement[]
}

export async function getUnlockedAchievementKeys(partnerId: string): Promise<string[]> {
  const achievements = await getPartnerAchievements(partnerId)
  return achievements.map(a => a.achievement_key)
}

export async function getMarketingAssets(productId?: string) {
  let query = supabase
    .from('marketing_assets')
    .select('*')
    .order('created_at', { ascending: false })
  if (productId) {
    query = query.eq('product_id', productId)
  }
  const { data, error } = await query
  if (error) throw error
  return data as MarketingAsset[]
}

export async function getPartnerProducts(partnerId?: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('published', true)
    .order('display_order', { ascending: true })
  if (error) throw error
  const products = data as Product[]
  return products.map(p => ({
    ...p,
    commission_rate: p.type === 'physical' ? 0.1 : 0.3,
    partner_link: `${import.meta.env.VITE_SITE_URL || window.location.origin}/shop/product/${p.slug}?ref=${partnerId || ''}`,
  }))
}

export async function updatePartnerBankDetails(partnerId: string, details: {
  account_name: string
  account_number: string
  bank_name: string
}) {
  const { data, error } = await supabase
    .from('affiliates')
    .update({
      account_name: details.account_name,
      account_number: details.account_number,
      bank_name: details.bank_name,
    })
    .eq('id', partnerId)
    .select()
    .single()
  if (error) throw error
  return data as Affiliate
}

export async function getPartnerEarningsSummary(partnerId: string) {
  const { data, error } = await supabase
    .from('affiliates')
    .select('total_earnings, paid_earnings, pending_earnings, total_sales, total_clicks')
    .eq('id', partnerId)
    .single()
  if (error) throw error
  return data as { total_earnings: number; paid_earnings: number; pending_earnings: number; total_sales: number; total_clicks: number }
}

export async function getCommissionsByMonth(partnerId: string) {
  const currentYear = new Date().getFullYear()
  const { data, error } = await supabase
    .from('affiliate_commissions')
    .select('amount, created_at, status')
    .eq('affiliate_id', partnerId)
  if (error) throw error
  const commissions = data as { amount: number; created_at: string; status: string }[]
  const months = Array.from({ length: 12 }).map((_, i) => i)
  return months.map(month => {
    const monthComms = commissions.filter(c => {
      const d = new Date(c.created_at)
      return d.getMonth() === month && d.getFullYear() === currentYear
    })
    return {
      month: new Date(currentYear, month).toLocaleString('default', { month: 'short' }),
      earnings: monthComms.reduce((s, c) => s + c.amount, 0),
      sales: monthComms.length,
    }
  })
}

export async function getTopPerformingProducts(partnerId: string) {
  const { data, error } = await supabase
    .from('affiliate_commissions')
    .select('product_id, product_type, amount')
    .eq('affiliate_id', partnerId)
  if (error) throw error
  const commissions = data as { product_id: string; product_type: string; amount: number }[]
  const grouped: Record<string, { sales: number; earnings: number }> = {}
  for (const c of commissions) {
    const key = c.product_id || c.product_type
    if (!grouped[key]) grouped[key] = { sales: 0, earnings: 0 }
    grouped[key].sales++
    grouped[key].earnings += c.amount
  }
  return Object.entries(grouped)
    .map(([productId, stats]) => ({ productId, ...stats }))
    .sort((a, b) => b.earnings - a.earnings)
    .slice(0, 5)
}

export async function logAffiliateClick(affiliateId: string, ipAddress: string, userAgent: string) {
  const { data, error } = await supabase
    .from('affiliate_clicks')
    .insert([{ affiliate_id: affiliateId, ip_address: ipAddress, user_agent: userAgent, converted: false }])
    .select()
    .single()
  if (error) throw error
  const { data: aff } = await supabase
    .from('affiliates')
    .select('total_clicks')
    .eq('id', affiliateId)
    .single()
  if (aff) {
    await supabase
      .from('affiliates')
      .update({ total_clicks: (aff.total_clicks as number || 0) + 1 })
      .eq('id', affiliateId)
  }
  return data as AffiliateClick
}

export async function getAffiliateByRefFromCookie(): Promise<Affiliate | null> {
  try {
    const match = document.cookie.match(/(?:^|;\s*)gifted_ref=([^;]*)/)
    if (!match) return null
    return getAffiliateByReferralCode(match[1])
  } catch { return null }
}

export function setAffiliateCookie(ref: string) {
  document.cookie = `gifted_ref=${ref}; path=/; max-age=${60 * 60 * 24 * 30}`
}

export async function checkUrlForAffiliate() {
  try {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (!ref) return null
    const affiliate = await getAffiliateByReferralCode(ref as string)
    if (affiliate) {
      setAffiliateCookie(ref as string)
      const clickKey = `gifted_click_${affiliate.id}`
      if (!sessionStorage.getItem(clickKey)) {
        sessionStorage.setItem(clickKey, '1')
        logAffiliateClick(affiliate.id, '', navigator.userAgent).catch(() => {})
      }
    }
    return affiliate
  } catch { return null }
}

export async function getAdminPartnerAnalytics() {
  const [affRes, commRes, payRes, clickRes] = await Promise.all([
    supabase.from('affiliates').select('id, status, total_earnings, total_sales, total_clicks, pending_earnings, created_at'),
    supabase.from('affiliate_commissions').select('amount, status, created_at'),
    supabase.from('affiliate_payouts').select('amount, status, created_at'),
    supabase.from('affiliate_clicks').select('id, created_at'),
  ])

  const affiliates = (affRes.data || []) as { id: string; status: string; total_earnings: number; total_sales: number; total_clicks: number; pending_earnings: number; created_at: string }[]
  const commissions = (commRes.data || []) as { amount: number; status: string; created_at: string }[]
  const payouts = (payRes.data || []) as { amount: number; status: string; created_at: string }[]
  const clicks = (clickRes.data || []) as { id: string; created_at: string }[]

  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()

  const monthlyCommissions = commissions.filter(c => {
    const d = new Date(c.created_at)
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
  })
  const monthlyClicks = clicks.filter(c => {
    const d = new Date(c.created_at)
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
  })

  const totalRevenue = commissions.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0)
  const pendingPayouts = payouts.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)
  const activeCount = affiliates.filter(a => a.status === 'approved').length
  const conversionRate = clicks.length > 0 ? ((commissions.length / clicks.length) * 100) : 0

  // Monthly trend (last 6 months)
  const monthlyTrend: { month: string; commissions: number; clicks: number; signups: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(thisYear, thisMonth - i, 1)
    const m = d.getMonth()
    const y = d.getFullYear()
    const monthComms = commissions.filter(c => { const cd = new Date(c.created_at); return cd.getMonth() === m && cd.getFullYear() === y })
    const monthClicks = clicks.filter(c => { const cd = new Date(c.created_at); return cd.getMonth() === m && cd.getFullYear() === y })
    const monthSignups = affiliates.filter(a => { const ad = new Date(a.created_at); return ad.getMonth() === m && ad.getFullYear() === y })
    monthlyTrend.push({
      month: d.toLocaleString('default', { month: 'short' }),
      commissions: monthComms.reduce((s, c) => s + c.amount, 0),
      clicks: monthClicks.length,
      signups: monthSignups.length,
    })
  }

  return {
    totalPartners: affiliates.length,
    activePartners: activeCount,
    pendingApplications: affiliates.filter(a => a.status === 'pending').length,
    suspendedPartners: affiliates.filter(a => a.status === 'suspended').length,
    totalCommissions: totalRevenue,
    pendingPayouts,
    totalClicks: clicks.length,
    conversionRate,
    monthlyCommissionsThisMonth: monthlyCommissions.reduce((s, c) => s + c.amount, 0),
    monthlyClicksThisMonth: monthlyClicks.length,
    monthlyTrend,
    topEarners: [...affiliates].filter(a => a.status === 'approved').sort((a, b) => (b.total_earnings || 0) - (a.total_earnings || 0)).slice(0, 5),
  }
}

export async function getPartnerConversionFunnel(partnerId: string) {
  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('total_clicks, total_sales, total_earnings, pending_earnings, paid_earnings')
    .eq('id', partnerId)
    .single()

  const { data: clicks } = await supabase
    .from('affiliate_clicks')
    .select('created_at')
    .eq('affiliate_id', partnerId)

  const { data: comms } = await supabase
    .from('affiliate_commissions')
    .select('amount, status, created_at')
    .eq('affiliate_id', partnerId)

  const now = new Date()
  const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const last7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const recentClicks = (clicks || []).filter(c => new Date(c.created_at) >= last30)
  const recentComms = (comms || []).filter(c => new Date(c.created_at) >= last30)
  const weekClicks = (clicks || []).filter(c => new Date(c.created_at) >= last7)
  const weekComms = (comms || []).filter(c => new Date(c.created_at) >= last7)

  const totalClicks = affiliate?.total_clicks || 0
  const totalSales = affiliate?.total_sales || 0
  const conversionRate = totalClicks > 0 ? ((totalSales / totalClicks) * 100) : 0
  const recentConversionRate = recentClicks.length > 0 ? ((recentComms.length / recentClicks.length) * 100) : 0
  const avgCommissionPerSale = totalSales > 0 ? ((affiliate?.total_earnings || 0) / totalSales) : 0

  return {
    totalClicks,
    totalSales,
    conversionRate,
    recentClicks: recentClicks.length,
    recentSales: recentComms.length,
    recentConversionRate,
    weekClicks: weekClicks.length,
    weekSales: weekComms.length,
    totalEarnings: affiliate?.total_earnings || 0,
    pendingEarnings: affiliate?.pending_earnings || 0,
    paidEarnings: affiliate?.paid_earnings || 0,
    avgCommissionPerSale,
  }
}
