import type { Partner, PartnerLevel } from './types'

export const PARTNER_LEVELS: Record<PartnerLevel, { label: string; minRevenue: number; minConversions: number; commissionBonus: number; color: string; icon: string }> = {
  bronze: { label: 'Bronze', minRevenue: 0, minConversions: 0, commissionBonus: 0, color: '#cd7f32', icon: '🥉' },
  silver: { label: 'Silver', minRevenue: 50000, minConversions: 10, commissionBonus: 0.02, color: '#c0c0c0', icon: '🥈' },
  gold: { label: 'Gold', minRevenue: 200000, minConversions: 50, commissionBonus: 0.05, color: '#ffd700', icon: '🥇' },
  platinum: { label: 'Platinum', minRevenue: 500000, minConversions: 150, commissionBonus: 0.08, color: '#e5e4e2', icon: '💎' },
  diamond: { label: 'Diamond', minRevenue: 1000000, minConversions: 500, commissionBonus: 0.10, color: '#b9f2ff', icon: '👑' },
}

export const ACHIEVEMENTS = [
  { key: 'first_sale', title: 'First Sale', description: 'Made your first successful referral', icon: '🎉', condition: (p: Partner) => p.total_conversions >= 1 },
  { key: 'ten_sales', title: 'Rising Star', description: 'Reached 10 successful referrals', icon: '⭐', condition: (p: Partner) => p.total_conversions >= 10 },
  { key: 'fifty_sales', title: 'Power Partner', description: 'Reached 50 successful referrals', icon: '🔥', condition: (p: Partner) => p.total_conversions >= 50 },
  { key: 'hundred_sales', title: 'Century Club', description: 'Reached 100 successful referrals', icon: '💯', condition: (p: Partner) => p.total_conversions >= 100 },
  { key: 'revenue_100k', title: 'Revenue Maker', description: 'Generated ₦100,000 in sales', icon: '💰', condition: (p: Partner) => p.total_revenue_generated >= 100000 },
  { key: 'revenue_500k', title: 'Big Earner', description: 'Generated ₦500,000 in sales', icon: '🏆', condition: (p: Partner) => p.total_revenue_generated >= 500000 },
  { key: 'revenue_1m', title: 'Million Generator', description: 'Generated ₦1,000,000 in sales', icon: '👑', condition: (p: Partner) => p.total_revenue_generated >= 1000000 },
  { key: 'hundred_clicks', title: 'Traffic Driver', description: 'Generated 100 clicks', icon: '📈', condition: (p: Partner) => p.total_clicks >= 100 },
  { key: 'thousand_clicks', title: 'Click Master', description: 'Generated 1,000 clicks', icon: '🚀', condition: (p: Partner) => p.total_clicks >= 1000 },
  { key: 'five_thousand_clicks', title: 'Viral Force', description: 'Generated 5,000 clicks', icon: '⚡', condition: (p: Partner) => p.total_clicks >= 5000 },
  { key: 'level_silver', title: 'Silver Partner', description: 'Reached Silver tier', icon: '🥈', condition: (p: Partner) => p.level === 'silver' || p.level === 'gold' || p.level === 'platinum' || p.level === 'diamond' },
  { key: 'level_gold', title: 'Gold Partner', description: 'Reached Gold tier', icon: '🥇', condition: (p: Partner) => p.level === 'gold' || p.level === 'platinum' || p.level === 'diamond' },
  { key: 'level_platinum', title: 'Platinum Partner', description: 'Reached Platinum tier', icon: '💎', condition: (p: Partner) => p.level === 'platinum' || p.level === 'diamond' },
  { key: 'level_diamond', title: 'Diamond Partner', description: 'Reached Diamond tier', icon: '👑', condition: (p: Partner) => p.level === 'diamond' },
  { key: 'first_payout', title: 'First Payout', description: 'Received your first payout', icon: '💸', condition: (p: Partner) => p.paid_commission > 0 },
]

export const COMMISSION_RATES = {
  digital: 0.15,
  physical: 0.10,
  bundle: 0.12,
}

export const MIN_PAYOUT_AMOUNT = 5000

export const APPLICATION_STEPS = [
  { id: 1, title: 'Personal Information', description: 'Tell us about yourself' },
  { id: 2, title: 'Online Presence', description: 'Where can we find you?' },
  { id: 3, title: 'Your Audience', description: 'Tell us about your reach' },
  { id: 4, title: 'Agreement', description: 'Review and submit' },
] as const

export const AUDIENCE_SIZES = [
  'Under 1,000',
  '1,000 - 5,000',
  '5,000 - 10,000',
  '10,000 - 50,000',
  '50,000 - 100,000',
  '100,000 - 500,000',
  '500,000+',
]

export const CONTENT_TYPES = [
  'Photography',
  'Videography',
  'Graphic Design',
  'Blogging',
  'Social Media',
  'Podcasting',
  'Tech Reviews',
  'Lifestyle',
  'Fashion',
  'Education',
  'Business',
  'Other',
]

export const PLATFORMS = [
  'Instagram',
  'TikTok',
  'YouTube',
  'X (Twitter)',
  'LinkedIn',
  'Blog/Website',
  'Facebook',
  'Pinterest',
  'Other',
]

export const MARKETPLACE_CATEGORIES = [
  { id: 'images', label: 'Product Images', icon: '🖼' },
  { id: 'videos', label: 'Videos', icon: '🎬' },
  { id: 'banners', label: 'Banners', icon: '🎨' },
  { id: 'logos', label: 'Brand Logos', icon: '✨' },
  { id: 'guidelines', label: 'Brand Guidelines', icon: '📋' },
  { id: 'captions', label: 'Suggested Captions', icon: '💬' },
  { id: 'email_copy', label: 'Email Copy', icon: '📧' },
  { id: 'launch_assets', label: 'Launch Assets', icon: '🚀' },
]

export const COUNTRIES = [
  'Nigeria', 'United States', 'United Kingdom', 'Canada', 'Ghana', 'Kenya', 'South Africa',
  'Germany', 'France', 'Australia', 'India', 'Brazil', 'Japan', 'Other',
]
