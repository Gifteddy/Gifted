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
    title: 'Generous Commissions',
    desc: 'Earn 30% on every digital product sale and 10% on physical merch. No caps, no thresholds.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    title: 'Real-Time Dashboard',
    desc: 'Monitor clicks, conversions, and commissions as they happen. No more guessing.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    title: 'Unique Referral Link',
    desc: 'Get a custom referral code and link to share with your audience in seconds.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    title: 'Monthly Payouts',
    desc: 'Get paid every month. No minimum threshold, no hidden fees, no delays.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <rect x="2" y="8" width="20" height="12" rx="2" /><path d="M6 8V6a4 4 0 0 1 8 0v2" /><circle cx="12" cy="14" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
]

const rates = [
  { type: 'Digital Products', rate: 30, suffix: '%', color: 'text-brand-500 dark:text-brand-400' },
  { type: 'Physical Merch', rate: 10, suffix: '%', color: 'text-gold-500 dark:text-gold-400' },
]

const creatorLogos = [
  { name: 'Designers', glyph: 'D' },
  { name: 'Developers', glyph: '{}' },
  { name: 'Video', glyph: '▶' },
  { name: 'Audio', glyph: '♫' },
  { name: 'Writers', glyph: 'W' },
  { name: 'Artists', glyph: 'A' },
]

export default function Affiliate() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', social_links: '', reason: '', audience_description: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true); setError('')
    try { await createAffiliateApplication(formData); setSuccess(true) }
    catch (err) { setError(err instanceof Error ? err.message : 'Something went wrong') }
    finally { setSubmitting(false) }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-surface-light text-text-light dark:bg-surface-dark dark:text-text-dark flex items-center justify-center px-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/3 left-1/4 h-[500px] w-[500px] rounded-full bg-brand-500/10 blur-[140px]" />
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 max-w-lg mx-auto text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-500/10">
            <svg className="h-10 w-10 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h1 className={cn(heading, 'mb-4')}>Application <span className="text-gradient">Submitted</span></h1>
          <p className="text-sm leading-relaxed text-text-muted-light dark:text-text-muted-dark">
            Thank you for applying. We will review your application and get back to you within 3&ndash;5 business days.
          </p>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-surface-light text-text-light dark:bg-surface-dark dark:text-text-dark overflow-hidden">

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-24">
        <div className="pointer-events-none absolute inset-0">
          <motion.div className="absolute top-1/4 left-1/4 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-brand-500/10 blur-[140px]"
            animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute bottom-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-gold-500/8 blur-[120px]"
            animate={{ scale: [1.1, 1, 1.1] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
        </div>

        <div className="relative z-10 w-full max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className={cn(label, 'text-brand-500 dark:text-brand-400')}>Creator Network</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.12, ease: [0.25, 0.1, 0.25, 1] }}
            className={cn(heading, 'mt-6')}>
            Earn While You <span className="text-gradient">Share</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-4 max-w-xl mx-auto text-base leading-relaxed text-text-muted-light dark:text-text-muted-dark">
            Join a growing network of creators earning commissions by sharing products they love. No fuss, no minimums &mdash; just fair pay for every sale you drive.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="#apply" className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-7 py-3.5 text-sm font-semibold text-white transition-all duration-500 hover:shadow-xl hover:shadow-brand-500/30 active:scale-[0.97]">
              Apply Now
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
            </a>
            <Link to="/shop/affiliate/dashboard" className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] dark:border-white/[0.1] px-7 py-3.5 text-sm font-medium text-gray-700 dark:text-white/70 transition-all duration-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]">
              Existing Affiliate? Dashboard
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Creator Badge — social proof row */}
      <section className="relative px-6 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {creatorLogos.map(c => (
              <div key={c.name} className="flex items-center gap-2 text-sm text-text-muted-light dark:text-text-muted-dark">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/[0.04] dark:bg-white/[0.06] font-mono text-xs font-bold text-gray-500 dark:text-white/50">{c.glyph}</span>
                {c.name}
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-text-muted-light dark:text-text-muted-dark">
            Trusted by creators worldwide. <span className="text-brand-500 font-semibold">Join <CountUp end={500} suffix="+" duration={1200} /> affiliates</span>
          </p>
        </motion.div>
      </section>

      {/* Benefits */}
      <section className="relative px-6 py-20 sm:py-28 bg-surface-secondary-light dark:bg-surface-secondary-dark">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-light dark:via-border-dark to-transparent" />
        <div className="mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: '-100px' }} className="mb-14 text-center">
            <span className={cn(label, 'text-gold-500 dark:text-gold-400')}>Why Join</span>
            <h2 className={cn(heading, 'mt-4')}>Everything You <span className="text-gradient">Need</span></h2>
          </motion.div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Commission Rates */}
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

      {/* Application Form */}
      <section id="apply" className="relative px-6 py-20 sm:py-28 bg-surface-secondary-light dark:bg-surface-secondary-dark">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-light dark:via-border-dark to-transparent" />
        <div className="mx-auto max-w-2xl">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: '-100px' }} className="mb-12 text-center">
            <span className={cn(label, 'text-brand-500 dark:text-brand-400')}>Apply Now</span>
            <h2 className={cn(heading, 'mt-4')}>Become an <span className="text-gradient">Affiliate</span></h2>
            <p className="mt-4 text-sm leading-relaxed text-text-muted-light dark:text-text-muted-dark">
              Fill out the form below and we&apos;ll review your application within 3&ndash;5 business days.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }}>
            <LiquidGlass intensity="pronounced" className="rounded-2xl p-6 sm:p-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-xs font-semibold mb-1.5 tracking-wide">Full Name</label>
                    <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange}
                      className="w-full rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-black/30 px-4 py-3 text-sm placeholder:text-text-muted-light/50 dark:placeholder:text-text-muted-dark/50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:focus:ring-brand-400/30 transition-all"
                      placeholder="Your full name" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold mb-1.5 tracking-wide">Email Address</label>
                    <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange}
                      className="w-full rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-black/30 px-4 py-3 text-sm placeholder:text-text-muted-light/50 dark:placeholder:text-text-muted-dark/50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:focus:ring-brand-400/30 transition-all"
                      placeholder="you@example.com" />
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold mb-1.5 tracking-wide">Phone Number</label>
                  <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange}
                    className="w-full rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-black/30 px-4 py-3 text-sm placeholder:text-text-muted-light/50 dark:placeholder:text-text-muted-dark/50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:focus:ring-brand-400/30 transition-all"
                    placeholder="+234 800 000 0000" />
                </div>
                <div>
                  <label htmlFor="social_links" className="block text-xs font-semibold mb-1.5 tracking-wide">Social / Website Links</label>
                  <input id="social_links" name="social_links" type="text" required value={formData.social_links} onChange={handleChange}
                    className="w-full rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-black/30 px-4 py-3 text-sm placeholder:text-text-muted-light/50 dark:placeholder:text-text-muted-dark/50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:focus:ring-brand-400/30 transition-all"
                    placeholder="Instagram, YouTube, TikTok, blog, etc." />
                </div>
                <div>
                  <label htmlFor="reason" className="block text-xs font-semibold mb-1.5 tracking-wide">Why do you want to join?</label>
                  <textarea id="reason" name="reason" required rows={3} value={formData.reason} onChange={handleChange}
                    className="w-full rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-black/30 px-4 py-3 text-sm placeholder:text-text-muted-light/50 dark:placeholder:text-text-muted-dark/50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:focus:ring-brand-400/30 transition-all resize-none"
                    placeholder="Tell us why you are interested in promoting our products..." />
                </div>
                <div>
                  <label htmlFor="audience_description" className="block text-xs font-semibold mb-1.5 tracking-wide">Describe Your Audience</label>
                  <textarea id="audience_description" name="audience_description" required rows={3} value={formData.audience_description} onChange={handleChange}
                    className="w-full rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-black/30 px-4 py-3 text-sm placeholder:text-text-muted-light/50 dark:placeholder:text-text-muted-dark/50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:focus:ring-brand-400/30 transition-all resize-none"
                    placeholder="Who follows you? What is your niche? Approximate size?" />
                </div>
                {error && <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</div>}
                <button type="submit" disabled={submitting}
                  className="w-full rounded-full bg-brand-500 px-7 py-3.5 text-sm font-semibold text-white transition-all duration-500 hover:shadow-xl hover:shadow-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.97]">
                  {submitting ? (
                    <><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="4" className="opacity-75" /></svg> Submitting...</>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              </form>
            </LiquidGlass>
          </motion.div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative px-6 py-20 sm:py-28 text-center">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-light dark:via-border-dark to-transparent" />
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className={cn(heading, 'mb-4')}>Ready to <span className="text-gradient">Start Earning</span>?</h2>
          <p className="text-sm text-text-muted-light dark:text-text-muted-dark mb-6 max-w-md mx-auto">
            Join hundreds of creators already earning commissions. No minimums, no hidden fees.
          </p>
          <a href="#apply"
            className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-7 py-3.5 text-sm font-semibold text-white transition-all duration-500 hover:shadow-xl hover:shadow-brand-500/30 active:scale-[0.97]">
            Apply Now
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
          </a>
        </motion.div>
      </section>

    </main>
  )
}
