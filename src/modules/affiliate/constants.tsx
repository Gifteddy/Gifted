import type { DashboardTab } from './types'

export const DASHBOARD_TABS: { id: DashboardTab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'link', label: 'Partner Link', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
  { id: 'products', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { id: 'analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'marketing', label: 'Marketing', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'payouts', label: 'Payouts', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'achievements', label: 'Achievements', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
  { id: 'account', label: 'Account', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
]

export const ACHIEVEMENT_DEFS: { key: string; title: string; desc: string; icon: string }[] = [
  { key: 'first_sale', title: 'First Sale', desc: 'Made your first sale as a partner', icon: '\uD83C\uDF1F' },
  { key: 'ten_sales', title: '10 Sales', desc: 'Reached 10 successful sales', icon: '\uD83D\uDE80' },
  { key: 'hundred_clicks', title: '100 Clicks', desc: 'Generated 100 referral clicks', icon: '\uD83D\uDCA5' },
  { key: 'top_performer', title: 'Top Performer', desc: 'Highest monthly earnings', icon: '\uD83C\uDFC6' },
  { key: 'bundle_seller', title: 'Bundle Seller', desc: 'Sold a product bundle', icon: '\uD83D\uDCE6' },
  { key: 'milestone_earnings', title: 'Earnings Milestone', desc: 'Reached a significant earnings milestone', icon: '\u2B50' },
]

export const PARTNER_BENEFITS = [
  {
    title: 'Commission Earnings',
    desc: 'Earn 30% on digital products and 10% on physical merch. No caps, no minimums.',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
  },
  {
    title: 'Partner Dashboard',
    desc: 'Real-time analytics, earnings tracking, and performance insights. Everything you need in one place.',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
  },
  {
    title: 'Performance Tracking',
    desc: 'Monitor clicks, conversions, and commissions in real time. Know what works and optimize.',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>,
  },
  {
    title: 'Marketing Assets',
    desc: 'Product images, banners, mockups, and suggested copy. Everything you need to promote effectively.',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>,
  },
  {
    title: 'Exclusive Promotions',
    desc: 'Early access to new product launches, partner-only discounts, and special campaigns.',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  },
  {
    title: 'Priority Support',
    desc: 'Dedicated support channel for partners. We help you succeed with personalized assistance.',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  },
]

export const PARTNER_STEPS = [
  { num: '01', title: 'Apply', desc: 'Submit your application. Tell us about your audience and why you want to join.' },
  { num: '02', title: 'Get Approved', desc: 'Our team reviews your application within 3\u20135 business days.' },
  { num: '03', title: 'Receive Your Link', desc: 'Get your unique partner referral link and access to the dashboard.' },
  { num: '04', title: 'Share Products', desc: 'Share products you genuinely love with your audience across any platform.' },
  { num: '05', title: 'Earn Commissions', desc: 'Earn on every sale you drive. Track everything from your partner dashboard.' },
  { num: '06', title: 'Get Paid', desc: 'Receive monthly payouts. No minimum threshold, no hidden fees.' },
]

export const PARTNER_RATES = [
  { type: 'Digital Products', rate: 30, suffix: '%', color: 'text-brand-500 dark:text-brand-400' },
  { type: 'Physical Merch', rate: 10, suffix: '%', color: 'text-gold-500 dark:text-gold-400' },
]

export const PARTNER_ACHIEVEMENTS_PREVIEW = [
  { key: 'first_sale', title: 'First Sale', desc: 'Made your first sale', icon: '\uD83C\uDF1F' },
  { key: 'ten_sales', title: '10 Sales', desc: 'Reached 10 sales', icon: '\uD83D\uDE80' },
  { key: 'hundred_clicks', title: '100 Clicks', desc: 'Generated 100 clicks', icon: '\uD83D\uDCA5' },
  { key: 'top_performer', title: 'Top Performer', desc: 'Highest earnings in a month', icon: '\uD83C\uDFC6' },
  { key: 'bundle_seller', title: 'Bundle Seller', desc: 'Sold a product bundle', icon: '\uD83D\uDCE6' },
  { key: 'milestone_earnings', title: 'Milestone', desc: 'Reached earnings milestone', icon: '\u2B50' },
]

export const PARTNER_FORM_STEPS = [
  { id: 'personal', label: 'Personal Details' },
  { id: 'audience', label: 'Audience Info' },
  { id: 'social', label: 'Social Presence' },
  { id: 'motivation', label: 'Motivation' },
  { id: 'review', label: 'Review & Submit' },
]
