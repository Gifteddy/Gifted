// Partner levels
export type PartnerLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
export type PartnerStatus = 'pending' | 'approved' | 'suspended' | 'banned' | 'rejected'
export type ConversionStatus = 'pending' | 'approved' | 'cancelled' | 'paid'
export type PayoutStatus = 'pending' | 'processing' | 'approved' | 'paid' | 'rejected'

export interface Partner {
  id: string
  auth_user_id: string | null
  email: string
  name: string
  phone: string | null
  country: string | null
  bio: string | null
  avatar_url: string | null
  referral_code: string
  status: PartnerStatus
  level: PartnerLevel
  website: string | null
  instagram: string | null
  tiktok: string | null
  youtube: string | null
  twitter: string | null
  linkedin: string | null
  portfolio_url: string | null
  audience_size: string | null
  primary_platform: string | null
  content_type: string | null
  motivation: string | null
  payment_method: string
  bank_name: string | null
  bank_account_number: string | null
  bank_account_name: string | null
  total_clicks: number
  total_conversions: number
  total_revenue_generated: number
  total_commission_earned: number
  pending_commission: number
  paid_commission: number
  lifetime_clicks: number
  lifetime_revenue: number
  last_click_at: string | null
  last_conversion_at: string | null
  notification_preferences: { email: boolean; browser: boolean }
  created_at: string
  updated_at: string
}

export interface PartnerClick {
  id: string
  partner_id: string
  product_id: string | null
  ip_address: string | null
  user_agent: string | null
  referrer: string | null
  country: string | null
  device_type: string | null
  campaign: string | null
  source: string | null
  created_at: string
}

export interface PartnerConversion {
  id: string
  partner_id: string
  click_id: string | null
  order_id: string | null
  order_item_id: string | null
  product_id: string | null
  product_type: string | null
  sale_amount: number
  commission_rate: number
  commission_amount: number
  status: ConversionStatus
  created_at: string
}

export interface PartnerPayout {
  id: string
  partner_id: string
  amount: number
  currency: string
  status: PayoutStatus
  payment_method: string | null
  bank_name: string | null
  bank_account_number: string | null
  bank_account_name: string | null
  reference: string | null
  notes: string | null
  processed_at: string | null
  created_at: string
}

export interface PartnerNotification {
  id: string
  partner_id: string
  title: string
  message: string
  type: string
  read: boolean
  link: string | null
  created_at: string
}

export interface PartnerAchievement {
  id: string
  partner_id: string
  achievement_key: string
  title: string
  description: string | null
  icon: string | null
  unlocked_at: string
}

export interface MarketingAsset {
  id: string
  title: string
  description: string | null
  category: string
  file_url: string
  file_type: string | null
  file_size: number | null
  thumbnail_url: string | null
  tags: string[] | null
  is_active: boolean
  created_at: string
}

export interface PartnerCampaign {
  id: string
  partner_id: string
  name: string
  slug: string | null
  url: string | null
  medium: string | null
  source: string | null
  clicks: number
  conversions: number
  revenue: number
  is_active: boolean
  created_at: string
}

export interface PartnerAuditLog {
  id: string
  partner_id: string | null
  action: string
  details: Record<string, unknown> | null
  ip_address: string | null
  actor_id: string | null
  created_at: string
}

// Application form types
export interface PartnerApplication {
  name: string
  email: string
  phone: string
  country: string
  payment_method: string
  website: string
  instagram: string
  tiktok: string
  youtube: string
  twitter: string
  linkedin: string
  portfolio_url: string
  audience_size: string
  primary_platform: string
  content_type: string
  motivation: string
}

// Dashboard summary type
export interface PartnerDashboardData {
  partner: Partner
  todayClicks: number
  todayConversions: number
  todayRevenue: number
  todayCommission: number
  weekClicks: number
  weekConversions: number
  monthClicks: number
  monthConversions: number
  monthRevenue: number
  monthCommission: number
  recentClicks: PartnerClick[]
  recentConversions: PartnerConversion[]
  recentNotifications: PartnerNotification[]
  achievements: PartnerAchievement[]
}

// Analytics types
export interface PartnerAnalyticsPeriod {
  clicks: number
  conversions: number
  revenue: number
  commission: number
  conversionRate: number
  daily: { date: string; clicks: number; conversions: number; revenue: number; commission: number }[]
}

// Admin types
export interface AdminPartnerOverview {
  totalPartners: number
  pendingApplications: number
  approvedPartners: number
  totalRevenue: number
  partnerRevenue: number
  totalCommissions: number
  pendingPayouts: number
  recentApplications: Partner[]
  topPartners: Partner[]
}
