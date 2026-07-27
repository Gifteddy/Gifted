import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Meta } from '@/lib/meta'
import { createPartnerApplication, generateReferralCode } from '@/modules/partner/queries'
import { APPLICATION_STEPS, AUDIENCE_SIZES, CONTENT_TYPES, PLATFORMS, COUNTRIES } from '@/modules/partner/constants'
import type { PartnerApplication } from '@/modules/partner/types'

const inputClass =
  'w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 dark:focus:border-brand-400/50 dark:focus:ring-brand-400/10 transition-all text-gray-900 dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-white/30'

const selectClass =
  'w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 dark:focus:border-brand-400/50 dark:focus:ring-brand-400/10 transition-all text-gray-900 dark:text-white/90 appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%2712%27%20height%3D%2712%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27%236b7280%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%3E%3Cpath%20d%3D%27m6%209%206%206%206-6%27%2F%3E%3C%2Fsvg%3E")] bg-[length:16px] bg-[right_12px_center] bg-no-repeat'

const labelClass = 'block text-xs font-medium mb-1.5 text-gray-500 dark:text-white/50'

const stepVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -80 : 80, opacity: 0 }),
}

export default function PartnerApply() {
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [agreedCommission, setAgreedCommission] = useState(false)
  const [agreedPrivacy, setAgreedPrivacy] = useState(false)

  const [form, setForm] = useState<PartnerApplication>({
    name: '',
    email: '',
    phone: '',
    country: '',
    payment_method: 'bank_transfer',
    website: '',
    instagram: '',
    tiktok: '',
    youtube: '',
    twitter: '',
    linkedin: '',
    portfolio_url: '',
    audience_size: '',
    primary_platform: '',
    content_type: '',
    motivation: '',
  })

  const update = (field: keyof PartnerApplication, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const isStep1Valid = form.name.trim() !== '' && form.email.trim() !== ''
  const isStep3Valid = form.motivation.trim().length >= 50
  const isStep4Valid = agreedTerms && agreedCommission && agreedPrivacy

  const canContinue =
    (step === 1 && isStep1Valid) ||
    (step === 2) ||
    (step === 3 && isStep3Valid) ||
    (step === 4 && isStep4Valid)

  const goNext = () => {
    if (!canContinue) return
    setDirection(1)
    setStep((s) => Math.min(s + 1, 4))
  }

  const goBack = () => {
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 1))
  }

  const handleSubmit = async () => {
    if (!isStep4Valid || submitting) return
    setSubmitting(true)
    setError('')
    try {
      const referralCode = generateReferralCode()
      await createPartnerApplication({ ...form, referral_code: referralCode })
      setSubmitted(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const progress = ((step - 1) / (APPLICATION_STEPS.length - 1)) * 100

  if (submitted) {
    return (
      <main className="min-h-screen bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark flex items-center justify-center px-6 pt-32 pb-20">
        <Meta title="Application Received" description="Your partner application has been submitted." />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-lg text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-500/10"
          >
            <motion.svg
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
              className="h-12 w-12 text-green-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path
                d="M20 6L9 17l-5-5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              />
            </motion.svg>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display text-3xl font-bold sm:text-4xl mb-3"
          >
            Application Received!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="text-gray-500 dark:text-white/50 mb-10 text-sm leading-relaxed max-w-sm mx-auto"
          >
            We'll review your application shortly. Check your email for updates on your partnership status.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Link
              to="/partners"
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-8 py-3.5 text-sm font-semibold text-white transition-all duration-500 hover:shadow-xl hover:shadow-brand-500/30 active:scale-[0.97]"
            >
              Return to Gifted Partners
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
            </Link>
          </motion.div>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark px-6 pt-28 pb-20">
      <Meta title="Apply as Partner" description="Join the Gifted Partners program. Earn commissions by sharing products you love." />

      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl font-bold sm:text-4xl mb-2">Become a Partner</h1>
          <p className="text-sm text-gray-500 dark:text-white/50">Join our exclusive program and start earning</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            {APPLICATION_STEPS.map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300',
                    step > s.id
                      ? 'bg-brand-500 text-white'
                      : step === s.id
                        ? 'bg-brand-500/15 text-brand-600 dark:text-brand-400 ring-2 ring-brand-500/30'
                        : 'bg-black/[0.04] dark:bg-white/[0.06] text-gray-400 dark:text-white/30'
                  )}
                >
                  {step > s.id ? (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                  ) : (
                    s.id
                  )}
                </div>
                <span className={cn(
                  'text-xs font-medium hidden sm:block transition-colors',
                  step >= s.id ? 'text-gray-900 dark:text-white/80' : 'text-gray-400 dark:text-white/30'
                )}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
          <div className="h-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-brand-500"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mb-6 rounded-2xl bg-red-500/8 border border-red-500/20 px-5 py-4 text-sm text-red-600 dark:text-red-400"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Card */}
        <div className="rounded-3xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] backdrop-blur-sm p-6 sm:p-8 overflow-hidden">
          <div className="relative min-h-[320px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Step 1: Personal Information */}
                {step === 1 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="font-display text-lg font-semibold mb-1 text-gray-900 dark:text-white/90">Personal Information</h2>
                      <p className="text-xs text-gray-500 dark:text-white/40">Tell us who you are</p>
                    </div>

                    <div>
                      <label className={labelClass}>Full Name *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => update('name', e.target.value)}
                        placeholder="Your full name"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Email Address *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                        placeholder="you@example.com"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Phone Number</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => update('phone', e.target.value)}
                        placeholder="+234 800 000 0000"
                        className={inputClass}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>Country</label>
                        <select value={form.country} onChange={(e) => update('country', e.target.value)} className={selectClass}>
                          <option value="">Select country</option>
                          {COUNTRIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={labelClass}>Preferred Payment</label>
                        <select value={form.payment_method} onChange={(e) => update('payment_method', e.target.value)} className={selectClass}>
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="paypal">PayPal</option>
                          <option value="mobile_money">Mobile Money</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Online Presence */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="font-display text-lg font-semibold mb-1 text-gray-900 dark:text-white/90">Online Presence</h2>
                      <p className="text-xs text-gray-500 dark:text-white/40">Share what you have — nothing is required</p>
                    </div>

                    <div>
                      <label className={labelClass}>Website URL</label>
                      <input
                        type="url"
                        value={form.website}
                        onChange={(e) => update('website', e.target.value)}
                        placeholder="https://yoursite.com"
                        className={inputClass}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>Instagram</label>
                        <input
                          type="text"
                          value={form.instagram}
                          onChange={(e) => update('instagram', e.target.value)}
                          placeholder="@username"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>TikTok</label>
                        <input
                          type="text"
                          value={form.tiktok}
                          onChange={(e) => update('tiktok', e.target.value)}
                          placeholder="@username"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>YouTube</label>
                        <input
                          type="text"
                          value={form.youtube}
                          onChange={(e) => update('youtube', e.target.value)}
                          placeholder="Channel URL or handle"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>X / Twitter</label>
                        <input
                          type="text"
                          value={form.twitter}
                          onChange={(e) => update('twitter', e.target.value)}
                          placeholder="@username"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>LinkedIn</label>
                        <input
                          type="text"
                          value={form.linkedin}
                          onChange={(e) => update('linkedin', e.target.value)}
                          placeholder="Profile URL"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Portfolio URL</label>
                        <input
                          type="url"
                          value={form.portfolio_url}
                          onChange={(e) => update('portfolio_url', e.target.value)}
                          placeholder="https://portfolio.com"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Your Audience */}
                {step === 3 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="font-display text-lg font-semibold mb-1 text-gray-900 dark:text-white/90">Your Audience</h2>
                      <p className="text-xs text-gray-500 dark:text-white/40">Help us understand your reach</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>Audience Size</label>
                        <select value={form.audience_size} onChange={(e) => update('audience_size', e.target.value)} className={selectClass}>
                          <option value="">Select size</option>
                          {AUDIENCE_SIZES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={labelClass}>Primary Platform</label>
                        <select value={form.primary_platform} onChange={(e) => update('primary_platform', e.target.value)} className={selectClass}>
                          <option value="">Select platform</option>
                          {PLATFORMS.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Content Type</label>
                      <select value={form.content_type} onChange={(e) => update('content_type', e.target.value)} className={selectClass}>
                        <option value="">Select type</option>
                        {CONTENT_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>Why do you want to join Gifted Partners? *</label>
                      <textarea
                        value={form.motivation}
                        onChange={(e) => update('motivation', e.target.value)}
                        placeholder="Tell us what excites you about this partnership..."
                        rows={4}
                        className={cn(inputClass, 'resize-none')}
                      />
                      <div className="flex justify-between mt-1.5">
                        <p className="text-[11px] text-gray-400 dark:text-white/30">Minimum 50 characters</p>
                        <p className={cn(
                          'text-[11px] tabular-nums',
                          form.motivation.length >= 50 ? 'text-green-500' : 'text-gray-400 dark:text-white/30'
                        )}>
                          {form.motivation.length}/50
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Agreement & Submit */}
                {step === 4 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="font-display text-lg font-semibold mb-1 text-gray-900 dark:text-white/90">Agreement & Submit</h2>
                      <p className="text-xs text-gray-500 dark:text-white/40">Review and confirm your application</p>
                    </div>

                    <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02] p-5 space-y-4">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white/80">Terms & Conditions Summary</h3>
                      <ul className="space-y-2 text-xs text-gray-600 dark:text-white/50 leading-relaxed">
                        <li className="flex gap-2">
                          <span className="text-brand-500 mt-0.5 shrink-0">&#8226;</span>
                          <span>You will earn commissions on qualifying sales generated through your unique referral links.</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-brand-500 mt-0.5 shrink-0">&#8226;</span>
                          <span>Commissions are paid monthly once your balance reaches the minimum payout threshold.</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-brand-500 mt-0.5 shrink-0">&#8226;</span>
                          <span>You must disclose your affiliate relationship when promoting Gifted products.</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-brand-500 mt-0.5 shrink-0">&#8226;</span>
                          <span>Gifted reserves the right to suspend partners who violate our terms or engage in fraudulent activity.</span>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={agreedTerms}
                          onChange={(e) => setAgreedTerms(e.target.checked)}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-black/[0.15] dark:border-white/[0.2] text-brand-500 focus:ring-brand-500/30"
                        />
                        <span className="text-sm text-gray-700 dark:text-white/60 group-hover:text-gray-900 dark:group-hover:text-white/80 transition-colors">
                          I agree to the Partner Terms & Conditions *
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={agreedCommission}
                          onChange={(e) => setAgreedCommission(e.target.checked)}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-black/[0.15] dark:border-white/[0.2] text-brand-500 focus:ring-brand-500/30"
                        />
                        <span className="text-sm text-gray-700 dark:text-white/60 group-hover:text-gray-900 dark:group-hover:text-white/80 transition-colors">
                          I understand the commission structure *
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={agreedPrivacy}
                          onChange={(e) => setAgreedPrivacy(e.target.checked)}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-black/[0.15] dark:border-white/[0.2] text-brand-500 focus:ring-brand-500/30"
                        />
                        <span className="text-sm text-gray-700 dark:text-white/60 group-hover:text-gray-900 dark:group-hover:text-white/80 transition-colors">
                          I agree to the Data Privacy Policy *
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-black/[0.06] dark:border-white/[0.08]">
            {step > 1 ? (
              <button
                onClick={goBack}
                className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] dark:border-white/[0.1] px-6 py-3 text-sm font-medium text-gray-700 dark:text-white/70 transition-all hover:bg-black/[0.04] dark:hover:bg-white/[0.04] active:scale-[0.97]"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                Back
              </button>
            ) : (
              <Link
                to="/partners"
                className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] dark:border-white/[0.1] px-6 py-3 text-sm font-medium text-gray-700 dark:text-white/70 transition-all hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                Back
              </Link>
            )}

            {step < 4 ? (
              <button
                onClick={goNext}
                disabled={!canContinue}
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-7 py-3 text-sm font-semibold text-white transition-all duration-500 hover:shadow-xl hover:shadow-brand-500/30 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                Continue
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isStep4Valid || submitting}
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-8 py-3 text-sm font-semibold text-white transition-all duration-500 hover:shadow-xl hover:shadow-brand-500/30 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                {submitting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="4" className="opacity-75" /></svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-gray-400 dark:text-white/25 mt-8">
          Applications are typically reviewed within 2-3 business days.
        </p>
      </div>
    </main>
  )
}
