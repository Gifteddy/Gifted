import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LiquidGlass } from '@/components/ui/LiquidGlass'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Testimonial } from '@/lib/types'

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [selected, setSelected] = useState<Testimonial | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      try { const d = await (await import('@/lib/queries')).getTestimonials(); setTestimonials(d) }
      catch { setTestimonials([]) } finally { setLoading(false) }
    }
    load()
  }, [])

  const items = testimonials

  return (
    <section className="relative overflow-hidden px-4 py-24 sm:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-500/5 to-transparent" />
      <div className="relative mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.6 }}
          className="mb-16 text-center">
          <span className="mb-4 block text-xs font-semibold tracking-widest uppercase text-brand-500 dark:text-brand-400">Testimonials</span>
          <h2 className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl">What Clients <span className="text-gradient">Say</span></h2>
        </motion.div>

        {loading ? (
          <div className="flex gap-6 overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-[320px] shrink-0 rounded-2xl border border-border-light dark:border-border-dark bg-surface-secondary-light dark:bg-surface-secondary-dark p-6">
                <Skeleton className="mb-4 h-4 w-24" /><Skeleton className="mb-6 h-16 w-full" /><Skeleton className="mb-1 h-4 w-32" /><Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        ) : (
          <div
            className="overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              ref={trackRef}
              className="flex gap-6 w-max"
              style={{
                animation: `marquee-reverse 40s linear infinite`,
                animationPlayState: isPaused ? 'paused' : 'running',
              }}
            >
              {[...items, ...items].map((t, i) => (
                <div
                  key={`${t.name}-${t.company}-${i}`}
                  className="w-[300px] sm:w-[360px] shrink-0 cursor-pointer"
                  onClick={() => setSelected(t)}
                >
                  <LiquidGlass className="rounded-2xl p-6 h-full transition-all duration-300 hover:scale-[1.02]" intensity="subtle">
                    <div className="mb-4 flex gap-1">
                      {Array.from({ length: t.rating }).map((_, j) => <span key={j} className="text-gold-400">★</span>)}
                    </div>
                    <p className="mb-6 text-sm leading-relaxed text-text-muted-light dark:text-text-muted-dark line-clamp-4">
                      &ldquo;{t.content}&rdquo;
                    </p>
                    <div className="mt-auto">
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className="text-xs text-text-muted-light dark:text-text-muted-dark">{t.role}, {t.company}</div>
                    </div>
                  </LiquidGlass>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full max-w-lg"
              onClick={e => e.stopPropagation()}
            >
              <LiquidGlass className="relative rounded-2xl p-0" intensity="pronounced">
                <div className="rounded-2xl bg-surface-light/80 dark:bg-surface-dark/80 p-8 backdrop-blur-xl">
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 h-8 w-8 rounded-xl flex items-center justify-center text-text-light dark:text-text-dark hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: selected.rating }).map((_, j) => <span key={j} className="text-gold-400 text-lg">★</span>)}
                </div>
                <p className="text-base leading-relaxed text-text-light dark:text-text-dark">
                  &ldquo;{selected.content}&rdquo;
                </p>
                <div className="mt-6 pt-6 border-t border-border-light dark:border-border-dark">
                  <div className="text-base font-semibold text-text-light dark:text-text-dark">{selected.name}</div>
                  <div className="text-sm text-text-muted-light dark:text-text-muted-dark">{selected.role}, {selected.company}</div>
                </div>
                </div>
              </LiquidGlass>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
