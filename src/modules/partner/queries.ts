import { supabase } from '@/lib/supabase'
import type {
  Partner,
  PartnerClick,
  PartnerConversion,
  PartnerPayout,
  PartnerNotification,
  PartnerAchievement,
  MarketingAsset,
  PartnerCampaign,
  PartnerDashboardData,
  PartnerAnalyticsPeriod,
  PartnerApplication,
} from './types'

// ==================== APPLICATION ====================

export async function createPartnerApplication(
  app: PartnerApplication & { referral_code: string }
): Promise<Partner> {
  const { data, error } = await supabase
    .from('partners')
    .insert({
      name: app.name,
      email: app.email,
      phone: app.phone,
      country: app.country,
      payment_method: app.payment_method,
      website: app.website || null,
      instagram: app.instagram || null,
      tiktok: app.tiktok || null,
      youtube: app.youtube || null,
      twitter: app.twitter || null,
      linkedin: app.linkedin || null,
      portfolio_url: app.portfolio_url || null,
      audience_size: app.audience_size || null,
      primary_platform: app.primary_platform || null,
      content_type: app.content_type || null,
      motivation: app.motivation || null,
      referral_code: app.referral_code,
      status: 'pending',
      level: 'bronze',
    })
    .select()
    .single()

  if (error) throw error
  return data as Partner
}

export async function getPartnerByReferralCode(code: string): Promise<Partner | null> {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .eq('referral_code', code)
    .maybeSingle()

  if (error) throw error
  return data as Partner | null
}

export async function getPartnerByEmail(email: string): Promise<Partner | null> {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .eq('email', email)
    .maybeSingle()

  if (error) throw error
  return data as Partner | null
}

export async function getPartnerByAuthUserId(userId: string): Promise<Partner | null> {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .eq('auth_user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data as Partner | null
}

// ==================== PARTNER PROFILE ====================

export async function updatePartnerProfile(
  id: string,
  updates: Partial<Partner>
): Promise<Partner> {
  const { data, error } = await supabase
    .from('partners')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Partner
}

export async function getPartner(id: string): Promise<Partner> {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Partner
}

// ==================== ADMIN: APPLICATION MANAGEMENT ====================

export async function getPendingApplications(): Promise<Partner[]> {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) throw error
  return (data || []) as Partner[]
}

export async function getAllPartners(): Promise<Partner[]> {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) throw error
  return (data || []) as Partner[]
}

export async function approvePartner(id: string): Promise<Partner> {
  const { data, error } = await supabase
    .from('partners')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Partner
}

export async function rejectPartner(id: string): Promise<Partner> {
  const { data, error } = await supabase
    .from('partners')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Partner
}

export async function suspendPartner(id: string): Promise<Partner> {
  const { data, error } = await supabase
    .from('partners')
    .update({ status: 'suspended', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Partner
}

export async function banPartner(id: string): Promise<Partner> {
  const { data, error } = await supabase
    .from('partners')
    .update({ status: 'banned', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Partner
}

// ==================== ADMIN: OVERVIEW ====================

export async function getAdminPartnerOverview(): Promise<{
  totalPartners: number
  pendingApplications: number
  approvedPartners: number
  totalRevenue: number
  partnerRevenue: number
  totalCommissions: number
  pendingPayouts: number
}> {
  const [totalRes, pendingRes, approvedRes, revenueRes, commissionRes, payoutRes] =
    await Promise.all([
      supabase
        .from('partners')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('partners')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase
        .from('partners')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'approved'),
      supabase
        .from('partners')
        .select('total_revenue_generated'),
      supabase
        .from('partners')
        .select('total_commission_earned'),
      supabase
        .from('partner_payouts')
        .select('amount')
        .eq('status', 'pending'),
    ])

  const totalPartners = totalRes.count ?? 0
  const pendingApplications = pendingRes.count ?? 0
  const approvedPartners = approvedRes.count ?? 0

  const revenueRows = (revenueRes.data || []) as Pick<Partner, 'total_revenue_generated'>[]
  const totalRevenue = revenueRows.reduce((sum, r) => sum + (r.total_revenue_generated || 0), 0)

  const commissionRows = (commissionRes.data || []) as Pick<Partner, 'total_commission_earned'>[]
  const totalCommissions = commissionRows.reduce((sum, r) => sum + (r.total_commission_earned || 0), 0)

  const payoutRows = (payoutRes.data || []) as Pick<PartnerPayout, 'amount'>[]
  const pendingPayouts = payoutRows.reduce((sum, r) => sum + (r.amount || 0), 0)

  return {
    totalPartners,
    pendingApplications,
    approvedPartners,
    totalRevenue,
    partnerRevenue: totalRevenue,
    totalCommissions,
    pendingPayouts,
  }
}

// ==================== CLICK TRACKING ====================

export async function logPartnerClick(data: {
  partner_id: string
  product_id?: string
  ip_address?: string
  user_agent?: string
  referrer?: string
  campaign?: string
  source?: string
}): Promise<PartnerClick> {
  const now = new Date().toISOString()

  const { data: click, error: clickError } = await supabase
    .from('partner_clicks')
    .insert({
      partner_id: data.partner_id,
      product_id: data.product_id || null,
      ip_address: data.ip_address || null,
      user_agent: data.user_agent || null,
      referrer: data.referrer || null,
      campaign: data.campaign || null,
      source: data.source || null,
    })
    .select()
    .single()

  if (clickError) throw clickError

  const { data: partner } = await supabase
    .from('partners')
    .select('total_clicks, lifetime_clicks')
    .eq('id', data.partner_id)
    .single()

  if (partner) {
    await supabase
      .from('partners')
      .update({
        total_clicks: (partner.total_clicks || 0) + 1,
        lifetime_clicks: (partner.lifetime_clicks || 0) + 1,
        last_click_at: now,
      })
      .eq('id', data.partner_id)
  }

  return click as PartnerClick
}

export async function getPartnerClicks(
  partnerId: string,
  days?: number
): Promise<PartnerClick[]> {
  let query = supabase
    .from('partner_clicks')
    .select('*')
    .eq('partner_id', partnerId)

  if (days) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    query = query.gte('created_at', since)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as PartnerClick[]
}

// ==================== CONVERSIONS ====================

export async function createConversion(data: {
  partner_id: string
  click_id?: string
  order_id: string
  order_item_id: string
  product_id: string
  product_type: string
  sale_amount: number
  commission_rate: number
}): Promise<PartnerConversion> {
  const commissionAmount = Math.round(data.sale_amount * data.commission_rate * 100) / 100
  const now = new Date().toISOString()

  const { data: conversion, error: convError } = await supabase
    .from('partner_conversions')
    .insert({
      partner_id: data.partner_id,
      click_id: data.click_id || null,
      order_id: data.order_id,
      order_item_id: data.order_item_id,
      product_id: data.product_id,
      product_type: data.product_type,
      sale_amount: data.sale_amount,
      commission_rate: data.commission_rate,
      commission_amount: commissionAmount,
      status: 'pending',
    })
    .select()
    .single()

  if (convError) throw convError

  const { data: partner } = await supabase
    .from('partners')
    .select('total_conversions, total_revenue_generated, total_commission_earned, pending_commission')
    .eq('id', data.partner_id)
    .single()

  if (partner) {
    await supabase
      .from('partners')
      .update({
        total_conversions: (partner.total_conversions || 0) + 1,
        total_revenue_generated: (partner.total_revenue_generated || 0) + data.sale_amount,
        lifetime_revenue: (partner.total_revenue_generated || 0) + data.sale_amount,
        total_commission_earned: (partner.total_commission_earned || 0) + commissionAmount,
        pending_commission: (partner.pending_commission || 0) + commissionAmount,
        last_conversion_at: now,
      })
      .eq('id', data.partner_id)
  }

  return conversion as PartnerConversion
}

export async function getPartnerConversions(
  partnerId: string,
  days?: number
): Promise<PartnerConversion[]> {
  let query = supabase
    .from('partner_conversions')
    .select('*')
    .eq('partner_id', partnerId)

  if (days) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    query = query.gte('created_at', since)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as PartnerConversion[]
}

export async function getAdminAllConversions(): Promise<
  (PartnerConversion & { partner_name?: string; partner_email?: string })[]
> {
  const { data, error } = await supabase
    .from('partner_conversions')
    .select('*, partner:partners(name, email)')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) throw error

  return (data || []).map((row: Record<string, unknown>) => {
    const partner = row.partner as { name?: string; email?: string } | null
    return {
      ...(row as unknown as PartnerConversion),
      partner_name: partner?.name,
      partner_email: partner?.email,
    }
  })
}

// ==================== PAYOUTS ====================

export async function requestPayout(
  partnerId: string,
  amount: number,
  bankDetails: {
    bank_name: string
    bank_account_number: string
    bank_account_name: string
    payment_method: string
  }
): Promise<PartnerPayout> {
  const { data: partner } = await supabase
    .from('partners')
    .select('pending_commission')
    .eq('id', partnerId)
    .single()

  if (!partner || (partner.pending_commission || 0) < amount) {
    throw new Error('Insufficient pending commission')
  }

  const { data: payout, error: payoutError } = await supabase
    .from('partner_payouts')
    .insert({
      partner_id: partnerId,
      amount,
      currency: 'NGN',
      status: 'pending',
      payment_method: bankDetails.payment_method,
      bank_name: bankDetails.bank_name,
      bank_account_number: bankDetails.bank_account_number,
      bank_account_name: bankDetails.bank_account_name,
    })
    .select()
    .single()

  if (payoutError) throw payoutError

  await supabase
    .from('partners')
    .update({
      pending_commission: (partner.pending_commission || 0) - amount,
    })
    .eq('id', partnerId)

  return payout as PartnerPayout
}

export async function getPartnerPayouts(partnerId: string): Promise<PartnerPayout[]> {
  const { data, error } = await supabase
    .from('partner_payouts')
    .select('*')
    .eq('partner_id', partnerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as PartnerPayout[]
}

export async function getAllPendingPayouts(): Promise<
  (PartnerPayout & { partner_name?: string; partner_email?: string })[]
> {
  const { data, error } = await supabase
    .from('partner_payouts')
    .select('*, partner:partners(name, email)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) throw error

  return (data || []).map((row: Record<string, unknown>) => {
    const partner = row.partner as { name?: string; email?: string } | null
    return {
      ...(row as unknown as PartnerPayout),
      partner_name: partner?.name,
      partner_email: partner?.email,
    }
  })
}

export async function approvePayout(id: string): Promise<PartnerPayout> {
  const { data, error } = await supabase
    .from('partner_payouts')
    .update({ status: 'approved', processed_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as PartnerPayout
}

export async function rejectPayout(id: string, notes?: string): Promise<PartnerPayout> {
  const payout = await supabase
    .from('partner_payouts')
    .select('partner_id, amount')
    .eq('id', id)
    .single()

  if (payout.error) throw payout.error

  const { data, error } = await supabase
    .from('partner_payouts')
    .update({ status: 'rejected', notes: notes || null })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  if (payout.data) {
    const { data: partner } = await supabase
      .from('partners')
      .select('pending_commission')
      .eq('id', payout.data.partner_id)
      .single()

    if (partner) {
      await supabase
        .from('partners')
        .update({
          pending_commission: (partner.pending_commission || 0) + payout.data.amount,
        })
        .eq('id', payout.data.partner_id)
    }
  }

  return data as PartnerPayout
}

export async function markPayoutPaid(id: string, reference: string): Promise<PartnerPayout> {
  const { data, error } = await supabase
    .from('partner_payouts')
    .update({
      status: 'paid',
      reference,
      processed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  const payout = data as PartnerPayout

  const { data: partner } = await supabase
    .from('partners')
    .select('paid_commission')
    .eq('id', payout.partner_id)
    .single()

  if (partner) {
    await supabase
      .from('partners')
      .update({
        paid_commission: (partner.paid_commission || 0) + payout.amount,
      })
      .eq('id', payout.partner_id)
  }

  return payout
}

// ==================== NOTIFICATIONS ====================

export async function getPartnerNotifications(partnerId: string): Promise<PartnerNotification[]> {
  const { data, error } = await supabase
    .from('partner_notifications')
    .select('*')
    .eq('partner_id', partnerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as PartnerNotification[]
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase
    .from('partner_notifications')
    .update({ read: true })
    .eq('id', id)

  if (error) throw error
}

export async function markAllNotificationsRead(partnerId: string): Promise<void> {
  const { error } = await supabase
    .from('partner_notifications')
    .update({ read: true })
    .eq('partner_id', partnerId)
    .eq('read', false)

  if (error) throw error
}

export async function createPartnerNotification(data: {
  partner_id: string
  title: string
  message: string
  type: string
  link?: string
}): Promise<PartnerNotification> {
  const { data: notification, error } = await supabase
    .from('partner_notifications')
    .insert({
      partner_id: data.partner_id,
      title: data.title,
      message: data.message,
      type: data.type,
      link: data.link || null,
      read: false,
    })
    .select()
    .single()

  if (error) throw error
  return notification as PartnerNotification
}

// ==================== ACHIEVEMENTS ====================

export async function getPartnerAchievements(partnerId: string): Promise<PartnerAchievement[]> {
  const { data, error } = await supabase
    .from('partner_achievements')
    .select('*')
    .eq('partner_id', partnerId)
    .order('unlocked_at', { ascending: false })

  if (error) throw error
  return (data || []) as PartnerAchievement[]
}

export async function checkAndAwardAchievements(
  partnerId: string
): Promise<PartnerAchievement[]> {
  const { data: partner, error: partnerError } = await supabase
    .from('partners')
    .select('*')
    .eq('id', partnerId)
    .single()

  if (partnerError || !partner) throw partnerError || new Error('Partner not found')

  const { data: existing } = await supabase
    .from('partner_achievements')
    .select('achievement_key')
    .eq('partner_id', partnerId)

  const earnedKeys = new Set((existing || []).map((a) => a.achievement_key))

  const achievements: {
    achievement_key: string
    title: string
    description: string
    icon: string
    condition: boolean
  }[] = [
    {
      achievement_key: 'first_click',
      title: 'First Click',
      description: 'Your referral link was clicked for the first time',
      icon: '🎯',
      condition: (partner as Partner).total_clicks >= 1,
    },
    {
      achievement_key: 'first-sale',
      title: 'First Sale',
      description: 'You made your first conversion',
      icon: '💰',
      condition: (partner as Partner).total_conversions >= 1,
    },
    {
      achievement_key: 'click-master',
      title: 'Click Master',
      description: 'Reached 100 clicks',
      icon: '🖱️',
      condition: (partner as Partner).total_clicks >= 100,
    },
    {
      achievement_key: 'conversion-king',
      title: 'Conversion King',
      description: 'Reached 10 conversions',
      icon: '👑',
      condition: (partner as Partner).total_conversions >= 10,
    },
    {
      achievement_key: 'revenue-star',
      title: 'Revenue Star',
      description: 'Generated ₦1,000 in revenue',
      icon: '⭐',
      condition: (partner as Partner).total_revenue_generated >= 1000,
    },
    {
      achievement_key: 'big-earner',
      title: 'Big Earner',
      description: 'Earned ₦500 in commissions',
      icon: '💎',
      condition: (partner as Partner).total_commission_earned >= 500,
    },
    {
      achievement_key: 'hundred-clicks',
      title: 'Century',
      description: 'Reached 100 clicks',
      icon: '💯',
      condition: (partner as Partner).total_clicks >= 100,
    },
    {
      achievement_key: 'five-hundred-clicks',
      title: 'Traffic Driver',
      description: 'Reached 500 clicks',
      icon: '🚀',
      condition: (partner as Partner).total_clicks >= 500,
    },
    {
      achievement_key: 'thousand-clicks',
      title: 'Click Champion',
      description: 'Reached 1,000 clicks',
      icon: '🏆',
      condition: (partner as Partner).total_clicks >= 1000,
    },
    {
      achievement_key: 'fifty-conversions',
      title: 'Conversion Machine',
      description: 'Reached 50 conversions',
      icon: '⚡',
      condition: (partner as Partner).total_conversions >= 50,
    },
    {
      achievement_key: 'revenue-5000',
      title: 'Revenue Rocket',
      description: 'Generated ₦5,000 in revenue',
      icon: '🔥',
      condition: (partner as Partner).total_revenue_generated >= 5000,
    },
    {
      achievement_key: 'revenue-10000',
      title: 'Revenue Mogul',
      description: 'Generated ₦10,000 in revenue',
      icon: '🌟',
      condition: (partner as Partner).total_revenue_generated >= 10000,
    },
  ]

  const newAchievements = achievements.filter(
    (a) => a.condition && !earnedKeys.has(a.achievement_key)
  )

  if (newAchievements.length === 0) return []

  const inserts = newAchievements.map((a) => ({
    partner_id: partnerId,
    achievement_key: a.achievement_key,
    title: a.title,
    description: a.description,
    icon: a.icon,
    unlocked_at: new Date().toISOString(),
  }))

  const { data: inserted, error: insertError } = await supabase
    .from('partner_achievements')
    .insert(inserts)
    .select()

  if (insertError) throw insertError

  for (const achievement of newAchievements) {
    await createPartnerNotification({
      partner_id: partnerId,
      title: `Achievement Unlocked: ${achievement.title}`,
      message: achievement.description,
      type: 'achievement',
    })
  }

  return (inserted || []) as PartnerAchievement[]
}

// ==================== CAMPAIGNS ====================

export async function createCampaign(
  partnerId: string,
  campaign: {
    name: string
    slug?: string
    url?: string
    medium?: string
    source?: string
  }
): Promise<PartnerCampaign> {
  const { data, error } = await supabase
    .from('partner_campaigns')
    .insert({
      partner_id: partnerId,
      name: campaign.name,
      slug: campaign.slug || null,
      url: campaign.url || null,
      medium: campaign.medium || null,
      source: campaign.source || null,
      is_active: true,
    })
    .select()
    .single()

  if (error) throw error
  return data as PartnerCampaign
}

export async function getPartnerCampaigns(partnerId: string): Promise<PartnerCampaign[]> {
  const { data, error } = await supabase
    .from('partner_campaigns')
    .select('*')
    .eq('partner_id', partnerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as PartnerCampaign[]
}

export async function updateCampaign(
  id: string,
  updates: Partial<PartnerCampaign>
): Promise<PartnerCampaign> {
  const { data, error } = await supabase
    .from('partner_campaigns')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as PartnerCampaign
}

export async function deleteCampaign(id: string): Promise<void> {
  const { error } = await supabase
    .from('partner_campaigns')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ==================== MARKETING ASSETS ====================

export async function getMarketingAssets(category?: string): Promise<MarketingAsset[]> {
  let query = supabase
    .from('marketing_assets')
    .select('*')
    .eq('is_active', true)

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as MarketingAsset[]
}

// ==================== ANALYTICS ====================

export async function getPartnerAnalytics(
  partnerId: string,
  period: 'day' | 'week' | 'month' | 'year'
): Promise<PartnerAnalyticsPeriod> {
  const now = new Date()
  let startDate: Date

  switch (period) {
    case 'day':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case 'week': {
      const day = now.getDay()
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day)
      break
    }
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1)
      break
  }

  const since = startDate.toISOString()

  const [clicksRes, conversionsRes] = await Promise.all([
    supabase
      .from('partner_clicks')
      .select('created_at')
      .eq('partner_id', partnerId)
      .gte('created_at', since),
    supabase
      .from('partner_conversions')
      .select('created_at, sale_amount, commission_amount')
      .eq('partner_id', partnerId)
      .gte('created_at', since),
  ])

  const clicks = (clicksRes.data || []) as { created_at: string }[]
  const conversions = (conversionsRes.data || []) as {
    created_at: string
    sale_amount: number
    commission_amount: number
  }[]

  const totalClicks = clicks.length
  const totalConversions = conversions.length
  const totalRevenue = conversions.reduce((sum, c) => sum + (c.sale_amount || 0), 0)
  const totalCommission = conversions.reduce((sum, c) => sum + (c.commission_amount || 0), 0)
  const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0

  const dayMap = new Map<
    string,
    { date: string; clicks: number; conversions: number; revenue: number; commission: number }
  >()

  const dayMs = 24 * 60 * 60 * 1000
  const totalDays = Math.ceil((now.getTime() - startDate.getTime()) / dayMs) + 1

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate.getTime() + i * dayMs)
    const key = d.toISOString().slice(0, 10)
    dayMap.set(key, { date: key, clicks: 0, conversions: 0, revenue: 0, commission: 0 })
  }

  for (const c of clicks) {
    const key = c.created_at.slice(0, 10)
    const entry = dayMap.get(key)
    if (entry) entry.clicks += 1
  }

  for (const c of conversions) {
    const key = c.created_at.slice(0, 10)
    const entry = dayMap.get(key)
    if (entry) {
      entry.conversions += 1
      entry.revenue += c.sale_amount || 0
      entry.commission += c.commission_amount || 0
    }
  }

  return {
    clicks: totalClicks,
    conversions: totalConversions,
    revenue: totalRevenue,
    commission: totalCommission,
    conversionRate: Math.round(conversionRate * 100) / 100,
    daily: Array.from(dayMap.values()),
  }
}

// ==================== DASHBOARD ====================

export async function getPartnerDashboard(partnerId: string): Promise<PartnerDashboardData> {
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
  const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay()).toISOString()
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()

  const [partnerRes, todayClicksRes, weekClicksRes, monthClicksRes, monthConversionsRes, recentClicksRes, recentConversionsRes, notificationsRes, achievementsRes] =
    await Promise.all([
      supabase.from('partners').select('*').eq('id', partnerId).single(),
      supabase.from('partner_clicks').select('id', { count: 'exact', head: true }).eq('partner_id', partnerId).gte('created_at', todayStart),
      supabase.from('partner_clicks').select('id', { count: 'exact', head: true }).eq('partner_id', partnerId).gte('created_at', weekStart),
      supabase.from('partner_clicks').select('id', { count: 'exact', head: true }).eq('partner_id', partnerId).gte('created_at', monthStart),
      supabase.from('partner_conversions').select('*').eq('partner_id', partnerId).gte('created_at', monthStart),
      supabase.from('partner_clicks').select('*').eq('partner_id', partnerId).order('created_at', { ascending: false }).limit(5),
      supabase.from('partner_conversions').select('*').eq('partner_id', partnerId).order('created_at', { ascending: false }).limit(5),
      supabase.from('partner_notifications').select('*').eq('partner_id', partnerId).order('created_at', { ascending: false }).limit(10),
      supabase.from('partner_achievements').select('*').eq('partner_id', partnerId).order('unlocked_at', { ascending: false }),
    ])

  if (partnerRes.error) throw partnerRes.error

  const monthConversions = (monthConversionsRes.data || []) as PartnerConversion[]
  const todayClicks = todayClicksRes.count ?? 0
  const weekClicks = weekClicksRes.count ?? 0
  const monthClicks = monthClicksRes.count ?? 0
  const monthConversionsCount = monthConversions.length
  const monthRevenue = monthConversions.reduce((sum, c) => sum + (c.sale_amount || 0), 0)
  const monthCommission = monthConversions.reduce((sum, c) => sum + (c.commission_amount || 0), 0)

  const todayConversions = monthConversions.filter((c) => c.created_at >= todayStart).length
  const todayRevenue = monthConversions
    .filter((c) => c.created_at >= todayStart)
    .reduce((sum, c) => sum + (c.sale_amount || 0), 0)
  const todayCommission = monthConversions
    .filter((c) => c.created_at >= todayStart)
    .reduce((sum, c) => sum + (c.commission_amount || 0), 0)

  return {
    partner: partnerRes.data as Partner,
    todayClicks,
    todayConversions,
    todayRevenue,
    todayCommission,
    weekClicks,
    weekConversions: monthConversions.filter((c) => c.created_at >= weekStart).length,
    monthClicks,
    monthConversions: monthConversionsCount,
    monthRevenue,
    monthCommission,
    recentClicks: (recentClicksRes.data || []) as PartnerClick[],
    recentConversions: (recentConversionsRes.data || []) as PartnerConversion[],
    recentNotifications: (notificationsRes.data || []) as PartnerNotification[],
    achievements: (achievementsRes.data || []) as PartnerAchievement[],
  }
}

// ==================== UTILITY ====================

export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// ==================== REFERRAL COOKIE ====================

export function setPartnerCookie(referralCode: string): void {
  document.cookie = `gifted_ref=${referralCode};path=/;max-age=${30 * 24 * 60 * 60};SameSite=Lax`
}

export function getPartnerFromCookie(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)gifted_ref=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

export async function getPartnerByRefFromCookie(): Promise<Partner | null> {
  const code = getPartnerFromCookie()
  if (!code) return null
  return getPartnerByReferralCode(code)
}

export function buildReferralUrl(
  partnerCode: string,
  productSlug?: string,
  campaign?: string
): string {
  const base = (import.meta.env.VITE_SITE_URL as string | undefined) || 'https://www.giftedcreates.com'
  let url: string

  if (productSlug) {
    url = `${base}/shop/product/${productSlug}?ref=${partnerCode}`
  } else {
    url = `${base}/shop?ref=${partnerCode}`
  }

  if (campaign) {
    url += `&campaign=${encodeURIComponent(campaign)}`
  }

  return url
}
