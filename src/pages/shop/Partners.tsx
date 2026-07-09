import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LiquidGlass } from '@/components/ui/LiquidGlass'
import { CountUp } from '@/components/ui/CountUp'
import { cn } from '@/lib/utils'
import { createAffiliateApplication } from '@/lib/commerce-queries'

const label = 'text-[11px] font-semibold tracking-[0.2em] uppercase'
const heading = 'font-display text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl'

const benefits = [
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

const steps = [
  { num: '01', title: 'Apply', desc: 'Submit your application. Tell us about your audience and why you want to join.' },
  { num: '02', title: 'Get Approved', desc: 'Our team reviews your application within 3\u20135 business days.' },
  { num: '03', title: 'Receive Your Link', desc: 'Get your unique partner referral link and access to the dashboard.' },
  { num: '04', title: 'Share Products', desc: 'Share products you genuinely love with your audience across any platform.' },
  { num: '05', title: 'Earn Commissions', desc: 'Earn on every sale you drive. Track everything from your partner dashboard.' },
  { num: '06', title: 'Get Paid', desc: 'Receive monthly payouts. No minimum threshold, no hidden fees.' },
]

const rates = [
  { type: 'Digital Products', rate: 30, suffix: '%', color: 'text-brand-500 dark:text-brand-400' },
  { type: 'Physical Merch', rate: 10, suffix: '%', color: 'text-gold-500 dark:text-gold-400' },
]

const achievements = [
  { key: 'first_sale', title: 'First Sale', desc: 'Made your first sale', icon: '\uD83C\uDF1F' },
  { key: 'ten_sales', title: '10 Sales', desc: 'Reached 10 sales', icon: '\uD83D\uDE80' },
  { key: 'hundred_clicks', title: '100 Clicks', desc: 'Generated 100 clicks', icon: '\uD83D\uDCA5' },
  { key: 'top_performer', title: 'Top Performer', desc: 'Highest earnings in a month', icon: '\uD83C\uDFC6' },
  { key: 'bundle_seller', title: 'Bundle Seller', desc: 'Sold a product bundle', icon: '\uD83D\uDCE6' },
  { key: 'milestone_earnings', title: 'Milestone', desc: 'Reached earnings milestone', icon: '\u2B50' },
]

const formSteps = [
  { id: 'personal', label: 'Personal Details' },
  { id: 'audience', label: 'Audience Info' },
  { id: 'social', label: 'Social Presence' },
  { id: 'motivation', label: 'Motivation' },
  { id: 'review', label: 'Review & Submit' },
]

export default function Partners() {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    audience_size: '', niche: '',
    social_links: '', website: '',
    reason: '', audience_description: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const nextStep = () => { if (step < formSteps.length - 1) setStep(s => s + 1) }
  const prevStep = () => { if (step > 0) setStep(s => s - 1) }

  const handleSubmit = async () => {
    setSubmitting(true); setError('')
    try {
      await createAffiliateApplication({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        social_links: formData.social_links || formData.website || '',
        reason: formData.reason,
        audience_description: formData.audience_description,
      })
      setSuccess(true)
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  if (success) {
    return (
      <main className="min-h-screen bg-surface-light text-text-light dark:bg-surface-dark dark:text-text-dark flex items-center justify-center px-6">
        <div className="pointer-events-none absolute inset-0">
          <motion.div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-brand-500/10 blur-[140px]"
            animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 max-w-lg mx-auto text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-500/10">
            <svg className="h-10 w-10 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h1 className={cn(heading, 'mb-4')}>Application <span className="text-gradient">Submitted</span></h1>
          <p className="text-sm leading-relaxed text-text-muted-light dark:text-text-muted-dark">
            Thank you for applying to join the Gifted Partner Network. We will review your application and get back to you within 3&ndash;5 business days.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/shop/partners/dashboard" className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-xl hover:shadow-brand-500/30 active:scale-[0.97]">
              Partner Dashboard
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </motion.div>
      </main>
    )
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 tracking-wide">Full Name</label>
              <input name="name" type="text" required value={formData.name} onChange={handleChange}
                className="w-full rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-black/30 px-4 py-3 text-sm placeholder:text-text-muted-light/50 dark:placeholder:text-text-muted-dark/50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 tracking-wide">Email Address</label>
              <input name="email" type="email" required value={formData.email} onChange={handleChange}
                className="w-full rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-black/30 px-4 py-3 text-sm placeholder:text-text-muted-light/50 dark:placeholder:text-text-muted-dark/50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 tracking-wide">Phone Number <span className="text-text-muted-light/50 dark:text-text-muted-dark/50">(optional)</span></label>
              <input name="phone" type="tel" value={formData.phone} onChange={handleChange}
                className="w-full rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-black/30 px-4 py-3 text-sm placeholder:text-text-muted-light/50 dark:placeholder:text-text-muted-dark/50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                placeholder="+234 800 000 0000" />
            </div>
          </div>
        )
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 tracking-wide">Audience Size</label>
              <select name="audience_size" value={formData.audience_size} onChange={handleChange}
                className="w-full rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-black/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all">
                <option value="">Select size...</option>
                <option value="1k">Under 1,000</option>
                <option value="10k">1,000 - 10,000</option>
                <option value="50k">10,000 - 50,000</option>
                <option value="100k">50,000 - 100,000</option>
                <option value="500k">100,000 - 500,000</option>
                <option value="1m">500,000+</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 tracking-wide">Your Niche</label>
              <input name="niche" type="text" value={formData.niche} onChange={handleChange}
                className="w-full rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-black/30 px-4 py-3 text-sm placeholder:text-text-muted-light/50 dark:placeholder:text-text-muted-dark/50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                placeholder="e.g. Photography, Design, Tech, Lifestyle" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 tracking-wide">Describe Your Audience</label>
              <textarea name="audience_description" required rows={3} value={formData.audience_description} onChange={handleChange}
                className="w-full rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-black/30 px-4 py-3 text-sm placeholder:text-text-muted-light/50 dark:placeholder:text-text-muted-dark/50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all resize-none"
                placeholder="Who follows you? What is your content about? Why would they be interested in our products?" />
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 tracking-wide">Social Links</label>
              <input name="social_links" type="text" value={formData.social_links} onChange={handleChange}
                className="w-full rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-black/30 px-4 py-3 text-sm placeholder:text-text-muted-light/50 dark:placeholder:text-text-muted-dark/50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                placeholder="Instagram, YouTube, TikTok, X, etc." />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 tracking-wide">Website / Blog <span className="text-text-muted-light/50 dark:text-text-muted-dark/50">(optional)</span></label>
              <input name="website" type="url" value={formData.website} onChange={handleChange}
                className="w-full rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-black/30 px-4 py-3 text-sm placeholder:text-text-muted-light/50 dark:placeholder:text-text-muted-dark/50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                placeholder="https://yourwebsite.com" />
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 tracking-wide">Why do you want to join the Gifted Partner Network?</label>
              <textarea name="reason" required rows={4} value={formData.reason} onChange={handleChange}
                className="w-full rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-black/30 px-4 py-3 text-sm placeholder:text-text-muted-light/50 dark:placeholder:text-text-muted-dark/50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all resize-none"
                placeholder="Tell us why you are interested in promoting our products and how your audience would benefit..." />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 tracking-wide">How do you plan to promote our products?</label>
              <textarea rows={3} value={formData.audience_description} onChange={e => {
                const el = e.target
                setFormData(prev => ({ ...prev, audience_description: el.value }))
              }}
                className="w-full rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-black/30 px-4 py-3 text-sm placeholder:text-text-muted-light/50 dark:placeholder:text-text-muted-dark/50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all resize-none"
                placeholder="Social media posts, YouTube reviews, blog articles, email newsletters, etc." />
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-4">
            <div className="rounded-xl bg-brand-500/[0.04] dark:bg-brand-400/[0.04] border border-brand-500/10 p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted-light dark:text-text-muted-dark">Name</span>
                <span className="font-medium text-gray-900 dark:text-white/90">{formData.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted-light dark:text-text-muted-dark">Email</span>
                <span className="font-medium text-gray-900 dark:text-white/90">{formData.email}</span>
              </div>
              {formData.phone && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted-light dark:text-text-muted-dark">Phone</span>
                  <span className="font-medium text-gray-900 dark:text-white/90">{formData.phone}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-text-muted-light dark:text-text-muted-dark">Audience Size</span>
                <span className="font-medium text-gray-900 dark:text-white/90">{formData.audience_size || 'Not specified'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted-light dark:text-text-muted-dark">Niche</span>
                <span className="font-medium text-gray-900 dark:text-white/90">{formData.niche || 'Not specified'}</span>
              </div>
              {formData.social_links && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted-light dark:text-text-muted-dark">Social</span>
                  <span className="font-medium text-gray-900 dark:text-white/90 truncate max-w-[200px]">{formData.social_links}</span>
                </div>
              )}
              <div className="border-t border-brand-500/10 pt-3">
                <p className="text-xs font-semibold text-text-muted-light dark:text-text-muted-dark mb-1">Why you want to join</p>
                <p className="text-sm text-gray-900 dark:text-white/90">{formData.reason}</p>
              </div>
            </div>
            <div className="rounded-xl bg-amber-500/[0.04] border border-amber-500/10 p-3">
              <p className="text-xs text-amber-600 dark:text-amber-400">
                By submitting, you agree to our partner terms and conditions. We will review your application within 3&ndash;5 business days.
              </p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <main className="min-h-screen bg-surface-light text-text-light dark:bg-surface-dark dark:text-text-dark overflow-hidden">

      {/* ── Hero ── */}
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-6 pt-24">
        <div className="pointer-events-none absolute inset-0">
          <motion.div className="absolute top-1/4 left-1/3 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-brand-500/8 blur-[160px]"
            animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute bottom-1/4 right-1/3 h-[400px] w-[400px] rounded-full bg-gold-500/6 blur-[120px]"
            animate={{ scale: [1.1, 1, 1.1] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
        </div>

        <div className="relative z-10 w-full max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className={cn(label, 'text-brand-500 dark:text-brand-400')}>Gifted Partners</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.12, ease: [0.25, 0.1, 0.25, 1] }}
            className={cn(heading, 'mt-6')}>
            Join The Gifted{' '}
            <span className="text-gradient">Partner Network</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-4 max-w-xl mx-auto text-base leading-relaxed text-text-muted-light dark:text-text-muted-dark">
            Earn commissions by recommending products you genuinely believe in. Join an exclusive network of creators and get paid for sharing what you love.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="#apply"
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-8 py-4 text-sm font-semibold text-white transition-all duration-500 hover:shadow-2xl hover:shadow-brand-500/30 active:scale-[0.97]">
              Apply Now
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
            </a>
            <a href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] dark:border-white/[0.1] px-8 py-4 text-sm font-medium text-gray-700 dark:text-white/70 transition-all duration-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]">
              Learn How It Works
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-16 flex justify-center gap-8 sm:gap-12">
            {[
              { value: 30, suffix: '%', label: 'Digital Commission' },
              { value: 10, suffix: '%', label: 'Merch Commission' },
              { value: null, label: 'Payout Schedule', text: 'Monthly' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="font-display text-xl sm:text-2xl font-bold text-gradient">
                  {s.value != null ? <CountUp end={s.value} suffix={s.suffix} duration={1200} /> : s.text}
                </p>
                <p className="text-[10px] text-text-muted-light dark:text-text-muted-dark mt-0.5">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="relative px-6 py-20 sm:py-28 bg-surface-secondary-light dark:bg-surface-secondary-dark">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-light dark:via-border-dark to-transparent" />
        <div className="mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: '-100px' }} className="mb-14 text-center">
            <span className={cn(label, 'text-gold-500 dark:text-gold-400')}>Benefits</span>
            <h2 className={cn(heading, 'mt-4')}>Everything You <span className="text-gradient">Need to Succeed</span></h2>
            <p className="mt-3 text-sm text-text-muted-light dark:text-text-muted-dark max-w-lg mx-auto">
              Tools, insights, and support designed to help you earn more with less effort.
            </p>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b, i) => (
              <motion.div key={b.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.06 }}>
                <LiquidGlass intensity="subtle" className="relative overflow-hidden rounded-2xl p-6 h-full transition-all duration-500 hover:shadow-lg hover:-translate-y-0.5">
                  <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-brand-500/10 blur-[50px]" />
                  <div className="relative z-10">
                    <div className="mb-4 text-brand-500 dark:text-brand-400">{b.icon}</div>
                    <h3 className="font-display text-lg font-bold">{b.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-muted-light dark:text-text-muted-dark">{b.desc}</p>
                  </div>
                </LiquidGlass>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Commission Rates ── */}
      <section className="relative px-6 py-20 sm:py-28">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-light dark:via-border-dark to-transparent" />
        <div className="mx-auto max-w-3xl">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: '-100px' }} className="mb-12 text-center">
            <span className={cn(label, 'text-brand-500 dark:text-brand-400')}>Commission Rates</span>
            <h2 className={cn(heading, 'mt-4')}>Simple, Fair <span className="text-gradient">Pricing</span></h2>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2">
            {rates.map((r) => (
              <motion.div key={r.type} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4 }}>
                <LiquidGlass intensity="medium" className="rounded-2xl p-8 text-center">
                  <span className={cn('font-display text-6xl font-bold', r.color)}>
                    <CountUp end={r.rate} suffix={r.suffix} duration={1200} />
                  </span>
                  <p className="mt-3 font-display text-lg font-bold">{r.type}</p>
                </LiquidGlass>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="relative px-6 py-20 sm:py-28 bg-surface-secondary-light dark:bg-surface-secondary-dark">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-light dark:via-border-dark to-transparent" />
        <div className="mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: '-100px' }} className="mb-14 text-center">
            <span className={cn(label, 'text-brand-500 dark:text-brand-400')}>How It Works</span>
            <h2 className={cn(heading, 'mt-4')}>Your Journey to <span className="text-gradient">Earning</span></h2>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-6">
            {steps.map((s, i) => (
              <motion.div key={s.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.06 }} className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500 font-display text-lg font-bold">
                  {s.num}
                </div>
                <h3 className="font-display text-sm font-bold mb-1">{s.title}</h3>
                <p className="text-[10px] leading-relaxed text-text-muted-light dark:text-text-muted-dark">{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden sm:block mt-2 text-text-muted-light/30 dark:text-text-muted-dark/30">
                    <svg className="mx-auto h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Achievements Preview ── */}
      <section className="relative px-6 py-20 sm:py-28">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-light dark:via-border-dark to-transparent" />
        <div className="mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: '-100px' }} className="mb-14 text-center">
            <span className={cn(label, 'text-brand-500 dark:text-brand-400')}>Achievements</span>
            <h2 className={cn(heading, 'mt-4')}>Earn Badges as You <span className="text-gradient">Grow</span></h2>
            <p className="mt-3 text-sm text-text-muted-light dark:text-text-muted-dark max-w-lg mx-auto">
              Unlock achievements as you hit milestones. Premium recognition, not childish gamification.
            </p>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {achievements.map((a, i) => (
              <motion.div key={a.key} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-2xl border border-black/[0.04] dark:border-white/[0.06] bg-white/30 dark:bg-white/[0.01] p-4 text-center transition-all duration-300 hover:border-brand-500/20 hover:shadow-sm">
                <span className="text-2xl block mb-2">{a.icon}</span>
                <h3 className="font-display text-xs font-bold">{a.title}</h3>
                <p className="text-[10px] text-text-muted-light dark:text-text-muted-dark mt-0.5">{a.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Application Form (Multi-Step) ── */}
      <section id="apply" className="relative px-6 py-20 sm:py-28 bg-surface-secondary-light dark:bg-surface-secondary-dark">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-light dark:via-border-dark to-transparent" />
        <div className="mx-auto max-w-xl">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: '-100px' }} className="mb-10 text-center">
            <span className={cn(label, 'text-brand-500 dark:text-brand-400')}>Apply Now</span>
            <h2 className={cn(heading, 'mt-4')}>Become A <span className="text-gradient">Partner</span></h2>
            <p className="mt-3 text-sm text-text-muted-light dark:text-text-muted-dark">
              Step {step + 1} of {formSteps.length} &mdash; {formSteps[step].label}
            </p>
          </motion.div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {formSteps.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold transition-all duration-300',
                  i < step ? 'bg-brand-500 text-white' :
                    i === step ? 'bg-brand-500/15 text-brand-500 border border-brand-500/30' :
                      'bg-black/[0.03] dark:bg-white/[0.04] text-text-muted-light/50 dark:text-text-muted-dark/50'
                )}>
                  {i < step ? (
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : i + 1}
                </div>
                {i < formSteps.length - 1 && (
                  <div className={cn('h-px w-6 transition-colors', i < step ? 'bg-brand-500/50' : 'bg-black/[0.06] dark:bg-white/[0.08]')} />
                )}
              </div>
            ))}
          </div>

          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            <LiquidGlass intensity="pronounced" className="rounded-2xl p-6 sm:p-8">
              {renderStep()}

              {error && (
                <div className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</div>
              )}

              <div className="mt-6 flex items-center justify-between">
                <button onClick={prevStep} disabled={step === 0}
                  className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-medium text-gray-600 dark:text-white/60 transition-all hover:bg-black/[0.04] dark:hover:bg-white/[0.04] disabled:opacity-30 disabled:cursor-not-allowed">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                  Back
                </button>

                {step < formSteps.length - 1 ? (
                  <button onClick={nextStep}
                    disabled={step === 0 && !formData.name || step === 0 && !formData.email}
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-6 py-2.5 text-xs font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/25 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]">
                    Continue
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                  </button>
                ) : (
                  <button onClick={handleSubmit} disabled={submitting}
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-6 py-2.5 text-xs font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/25 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]">
                    {submitting ? (
                      <><svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="4" className="opacity-75" /></svg> Submitting...</>
                    ) : (
                      <>Submit Application <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg></>
                    )}
                  </button>
                )}
              </div>
            </LiquidGlass>
          </motion.div>
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section className="relative px-6 py-20 sm:py-28 text-center">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-light dark:via-border-dark to-transparent" />
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className={cn(heading, 'mb-4')}>Ready to <span className="text-gradient">Start Earning</span>?</h2>
          <p className="text-sm text-text-muted-light dark:text-text-muted-dark mb-6 max-w-md mx-auto">
            Join the Gifted Partner Network. No minimums, no hidden fees.
          </p>
          <div className="flex justify-center gap-3">
            <a href="#apply"
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-7 py-3.5 text-sm font-semibold text-white transition-all duration-500 hover:shadow-xl hover:shadow-brand-500/30 active:scale-[0.97]">
              Apply Now
            </a>
            <Link to="/shop/partners/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] dark:border-white/[0.1] px-7 py-3.5 text-sm font-medium text-gray-700 dark:text-white/70 transition-all duration-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]">
              Partner Dashboard
            </Link>
          </div>
        </motion.div>
      </section>

    </main>
  )
}
