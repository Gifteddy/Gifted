import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Meta } from '@/lib/meta'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/currency'
import { COMMISSION_RATES, PARTNER_LEVELS } from '@/modules/partner/constants'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const } }),
}

const label = 'text-[11px] font-semibold tracking-[0.2em] uppercase'

const stats = [
  { value: '15%', label: 'Digital Commission' },
  { value: '10%', label: 'Physical Commission' },
  { value: 'Instant', label: 'Click Tracking' },
  { value: 'Weekly', label: 'Regular Payouts' },
]

const steps = [
  { number: '01', title: 'Apply', description: 'Complete a quick application and tell us about your audience.' },
  { number: '02', title: 'Promote', description: 'Get your unique referral link and share Gifted products with your community.' },
  { number: '03', title: 'Earn', description: 'Track your performance in real-time and receive regular payouts.' },
]

const benefits = [
  { icon: '💰', title: 'Competitive Commissions', description: `Earn up to ${Math.round(COMMISSION_RATES.digital * 100)}% on digital products and ${Math.round(COMMISSION_RATES.physical * 100)}% on physical goods.` },
  { icon: '📊', title: 'Real-Time Tracking', description: 'Monitor clicks, conversions, and earnings in your personal dashboard.' },
  { icon: '💸', title: 'Regular Payouts', description: 'Request payouts anytime with a low minimum threshold.' },
  { icon: '🎨', title: 'Marketing Resources', description: 'Access professional assets, banners, and copy to boost your promotions.' },
  { icon: '🏆', title: 'Level Up', description: 'Advance through partner tiers and unlock higher commission rates.' },
  { icon: '🤝', title: 'Dedicated Support', description: 'Get help when you need it from our partner success team.' },
]

const earningsData = [
  { sales: 10, revenue: 50000 },
  { sales: 50, revenue: 250000 },
  { sales: 100, revenue: 500000 },
]

const partnerLevels = Object.entries(PARTNER_LEVELS).map(([key, val]) => ({ key, ...val }))

const faqs = [
  { q: 'How do I become a Gifted Partner?', a: 'Click "Apply Now" and fill out the short application. Our team reviews applications within 48 hours. Once approved, you\'ll get access to your partner dashboard and unique referral links.' },
  { q: 'How much can I earn?', a: `There's no cap on earnings. You earn ${Math.round(COMMISSION_RATES.digital * 100)}% commission on every digital product sale and ${Math.round(COMMISSION_RATES.physical * 100)}% on physical products you refer. As you advance through partner tiers, your commission rates increase.` },
  { q: 'How do I get paid?', a: 'You can request a payout once you reach the minimum threshold. Payments are processed via bank transfer within 3-5 business days. You can track all payouts in your dashboard.' },
  { q: 'What products can I promote?', a: 'You can promote any product in the Gifted Store — digital downloads, physical merch, and bundles. Your referral link works across the entire store, so any purchase made through your link earns you a commission.' },
  { q: 'Is there a minimum payout?', a: 'Yes, the minimum payout amount is ₦5,000. Once your earned commissions reach this threshold, you can request a withdrawal.' },
  { q: 'How are clicks and sales tracked?', a: 'When someone clicks your referral link, we set a cookie that tracks their session. Any purchase made within that session is credited to your account. You can see all clicks, conversions, and earnings in real-time on your dashboard.' },
]

function Accordion({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-black/[0.06] dark:border-white/[0.08]">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between py-5 text-left">
        <span className="pr-4 font-display text-base font-semibold text-gray-900 dark:text-white/90">{q}</span>
        <motion.svg
          className="h-5 w-5 shrink-0 text-gray-400 dark:text-white/40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-gray-500 dark:text-white/50">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Partners() {
  return (
    <main className="min-h-screen bg-surface-light text-text-light dark:bg-surface-dark dark:text-text-dark overflow-hidden">
      <Meta
        title="Gifted Partners"
        description="Join the Gifted Partner Network. Share products you love, earn commissions, and grow with a brand that values creators."
      />

      {/* ── Hero ── */}
      <section className="relative px-6 pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-1/4 left-1/3 h-[400px] w-[400px] rounded-full bg-brand-500/[0.07] blur-[120px]"
            animate={{ scale: [1, 1.15, 1], x: [0, 40, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-purple-500/[0.05] blur-[100px]"
            animate={{ scale: [1.1, 1, 1.1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <span className={cn(label, 'inline-block rounded-full border border-brand-500/20 bg-brand-500/[0.06] px-4 py-1.5 text-brand-600 dark:text-brand-400 mb-8')}>
              Gifted Partners
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          >
            Turn Your Influence{' '}
            <span className="text-gradient">Into Income</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="mx-auto mt-6 max-w-2xl text-lg text-gray-500 dark:text-white/50"
          >
            Join the exclusive Gifted Partner Network. Share products you love, earn commissions, and grow with a brand that values creators.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              to="/partners/apply"
              className="rounded-full bg-brand-500 px-8 py-3.5 text-sm font-semibold text-white transition-all duration-500 hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-500/30"
            >
              Apply Now
            </Link>
            <a
              href="#how-it-works"
              className="rounded-full border border-black/[0.08] dark:border-white/[0.12] px-8 py-3.5 text-sm font-semibold text-gray-700 transition-all duration-500 hover:bg-black/[0.03] dark:text-white/70 dark:hover:bg-white/[0.04]"
            >
              Learn More
            </a>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="mx-auto mt-16 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-black/[0.06] dark:border-white/[0.08] sm:grid-cols-4"
          >
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={cn(
                  'bg-white/50 px-5 py-5 dark:bg-white/[0.02]',
                  i < 2 && 'border-r border-black/[0.04] dark:border-white/[0.06]',
                  i === 0 || i === 1 ? 'sm:border-r' : '',
                )}
              >
                <p className="font-display text-2xl font-bold text-gray-900 dark:text-white/90">{s.value}</p>
                <p className="mt-1 text-xs text-gray-400 dark:text-white/40">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="px-6 py-20 bg-surface-light dark:bg-surface-dark">
        <div className="mx-auto max-w-5xl">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="text-center">
            <span className={cn(label, 'text-brand-500 dark:text-brand-400')}>How It Works</span>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              Three Steps to Start Earning
            </h2>
          </motion.div>

          <div className="relative mt-16 grid gap-8 sm:grid-cols-3">
            {/* Connecting line */}
            <div className="absolute top-8 left-0 right-0 hidden h-px bg-gradient-to-r from-transparent via-brand-500/20 to-transparent sm:block" />

            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                custom={i}
                className="relative text-center"
              >
                <div className="relative z-10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-white/[0.04]">
                  <span className="font-display text-lg font-bold text-brand-500">{step.number}</span>
                </div>
                <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white/90">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-white/50">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="px-6 py-20 bg-black/[0.02] dark:bg-white/[0.02]">
        <div className="mx-auto max-w-5xl">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="text-center">
            <span className={cn(label, 'text-brand-500 dark:text-brand-400')}>Benefits</span>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              Why Partner With Gifted
            </h2>
          </motion.div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                custom={i}
                className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/[0.08] text-lg">
                  {b.icon}
                </div>
                <h3 className="font-display text-base font-bold text-gray-900 dark:text-white/90">{b.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-500 dark:text-white/50">{b.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Example Earnings ── */}
      <section className="px-6 py-20 bg-surface-light dark:bg-surface-dark">
        <div className="mx-auto max-w-3xl">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="text-center">
            <span className={cn(label, 'text-brand-500 dark:text-brand-400')}>Earnings</span>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              See What You Could Earn
            </h2>
            <p className="mt-4 text-sm text-gray-500 dark:text-white/50">
              Based on the standard digital commission rate of {Math.round(COMMISSION_RATES.digital * 100)}%
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            custom={1}
            className="mt-12 overflow-hidden rounded-2xl border border-black/[0.06] dark:border-white/[0.08]"
          >
            {/* Table header */}
            <div className="grid grid-cols-4 bg-white/50 dark:bg-white/[0.03] px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-white/40">
              <span>Sales</span>
              <span>Price Each</span>
              <span>Revenue</span>
              <span className="text-right">Your Commission</span>
            </div>

            {earningsData.map((row, i) => {
              const commission = Math.round(row.revenue * COMMISSION_RATES.digital)
              return (
                <div
                  key={row.sales}
                  className={cn(
                    'grid grid-cols-4 items-center px-6 py-5 text-sm',
                    i !== earningsData.length - 1 && 'border-t border-black/[0.04] dark:border-white/[0.06]',
                  )}
                >
                  <span className="font-medium text-gray-900 dark:text-white/90">{row.sales} Sales</span>
                  <span className="text-gray-500 dark:text-white/50">{formatCurrency(5000)}</span>
                  <span className="text-gray-500 dark:text-white/50">{formatCurrency(row.revenue)}</span>
                  <span className="text-right font-display text-base font-bold text-brand-500">
                    {formatCurrency(commission)}
                  </span>
                </div>
              )
            })}
          </motion.div>

          <p className="mt-4 text-center text-xs text-gray-400 dark:text-white/30">
            Earnings increase as you advance through partner tiers
          </p>
        </div>
      </section>

      {/* ── Partner Levels ── */}
      <section className="px-6 py-20 bg-black/[0.02] dark:bg-white/[0.02]">
        <div className="mx-auto max-w-5xl">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="text-center">
            <span className={cn(label, 'text-brand-500 dark:text-brand-400')}>Levels</span>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              Grow Through the Ranks
            </h2>
            <p className="mt-4 text-sm text-gray-500 dark:text-white/50">
              As you generate more revenue and conversions, you advance through partner tiers and earn bonus commissions.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-4 sm:grid-cols-5">
            {partnerLevels.map((level, i) => (
              <motion.div
                key={level.key}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                custom={i}
                className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-5 text-center"
              >
                <span className="text-2xl">{level.icon}</span>
                <h3 className="mt-2 font-display text-sm font-bold" style={{ color: level.color }}>
                  {level.label}
                </h3>
                <p className="mt-1.5 text-xs text-gray-400 dark:text-white/40">
                  {level.minRevenue === 0 ? 'Starting tier' : `${formatCurrency(level.minRevenue)}+ revenue`}
                </p>
                <p className="mt-1 text-xs text-gray-400 dark:text-white/40">
                  +{Math.round(level.commissionBonus * 100)}% bonus
                </p>
                {i < partnerLevels.length - 1 && (
                  <div className="mt-3 hidden sm:block">
                    <svg className="mx-auto h-4 w-4 text-gray-300 dark:text-white/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12l7 7 7-7" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-6 py-20 bg-surface-light dark:bg-surface-dark">
        <div className="mx-auto max-w-2xl">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="text-center">
            <span className={cn(label, 'text-brand-500 dark:text-brand-400')}>FAQ</span>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            custom={1}
            className="mt-12"
          >
            {faqs.map((faq) => (
              <Accordion key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative px-6 py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-500/[0.04] via-transparent to-transparent" />
          <motion.div
            className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/[0.06] blur-[150px]"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="relative mx-auto max-w-2xl text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
            <h2 className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
              Ready to Start <span className="text-gradient">Earning</span>?
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-gray-500 dark:text-white/50">
              Join hundreds of creators already earning with Gifted Partners. Your audience is waiting.
            </p>
            <Link
              to="/partners/apply"
              className="mt-10 inline-block rounded-full bg-brand-500 px-10 py-4 text-sm font-semibold text-white transition-all duration-500 hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-500/30"
            >
              Apply Now
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
