export type AffiliateStatus = 'pending' | 'approved' | 'rejected' | 'suspended'
export type PayoutStatus = 'pending' | 'approved' | 'paid' | 'rejected'

export interface Affiliate {
  id: string
  name: string
  email: string
  phone: string | null
  social_links: string
  reason: string
  audience_description: string
  status: AffiliateStatus
  referral_code: string
  account_name: string | null
  account_number: string | null
  bank_name: string | null
  total_clicks: number
  total_sales: number
  total_earnings: number
  paid_earnings: number
  pending_earnings: number
  created_at: string
}

export interface AffiliateClick {
  id: string
  affiliate_id: string
  order_id: string | null
  ip_address: string
  user_agent: string
  converted: boolean
  created_at: string
}

export interface AffiliateCommission {
  id: string
  affiliate_id: string
  order_id: string
  order_item_id: string
  product_id: string
  product_type: string
  rate: number
  amount: number
  status: 'pending' | 'approved' | 'paid' | 'cancelled'
  created_at: string
}

export interface AffiliatePayout {
  id: string
  affiliate_id: string
  amount: number
  status: PayoutStatus
  payment_method: string
  account_name: string | null
  account_number: string | null
  bank_name: string | null
  notes: string
  processed_at: string | null
  recipient_code: string | null
  paystack_reference: string | null
  created_at: string
}

export interface AffiliateApplication {
  name: string
  email: string
  phone?: string
  social_links: string
  reason: string
  audience_description: string
}

export interface PartnerNotification {
  id: string
  partner_id: string
  type: 'sale' | 'commission' | 'payout_approved' | 'payout_sent' | 'new_product' | 'campaign' | 'achievement' | 'status_change'
  title: string
  message: string
  read: boolean
  link: string | null
  created_at: string
}

export interface PartnerAchievement {
  id: string
  partner_id: string
  achievement_key: 'first_sale' | 'ten_sales' | 'hundred_clicks' | 'top_performer' | 'bundle_seller' | 'milestone_earnings'
  title: string
  description: string
  icon: string
  achieved_at: string
  metadata: Record<string, unknown> | null
}

export interface MarketingAsset {
  id: string
  title: string
  type: 'banner' | 'image' | 'mockup' | 'copy' | 'caption' | 'campaign'
  file_url: string | null
  content: string | null
  description: string
  product_id: string | null
  downloadable: boolean
  created_at: string
}

export type DashboardTab = 'overview' | 'link' | 'products' | 'analytics' | 'marketing' | 'payouts' | 'achievements' | 'account'
