import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LiquidGlass } from '@/components/ui/LiquidGlass'
import { Skeleton } from '@/components/ui/Skeleton'
import { useTheme } from '@/store/theme'
import type { Testimonial } from '@/lib/types'
import type { CategoryConfig } from '@/lib/categories'

export function CategoryTestimonials({ category }: { category: CategoryConfig }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [selected, setSelected] = useState<Testimonial | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      try {
        const { getTestimonials } = await import('@/lib/queries')
        const data = await getTestimonials()
        setTestimonials(data)
      } catch {
        setTestimonials([])
      } finally {
        setLoading(false)
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const items = testimonials

  return (
    <section className={`relative overflow-hidden px-4 py-24 sm:py-32 transition-colors duration-500 ${isDark ? '' : 'bg-gray-50/80'}`}>
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.6 }}
          className="mb-16 text-center">
          <span className="mb-4 block text-xs font-semibold tracking-widest uppercase" style={{ color: category.accentColor }}>Testimonials</span>
          <h2 className={`font-display text-3xl font-bold sm:text-4xl lg:text-5xl ${isDark ? 'text-white' : 'text-gray-900'}`}>What Clients <span className="text-gradient">Say</span></h2>
        </motion.div>

        {loading ? (
          <div className="flex gap-6 overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`w-[320px] shrink-0 rounded-2xl p-6 border ${isDark ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-white'}`}>
                <Skeleton className="mb-3 h-4 w-full" /><Skeleton className="mb-3 h-4 w-3/4" /><Skeleton className="h-4 w-1/2" />
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
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <span key={j} className="text-sm" style={{ color: category.accentColor }}>★</span>
                      ))}
                    </div>
                    <p className={`mb-6 text-sm leading-relaxed line-clamp-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      &ldquo;{t.content}&rdquo;
                    </p>
                    <div className="mt-auto">
                      <p className={`text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{t.name}</p>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{t.role}, {t.company}</p>
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
                <div className={`rounded-2xl p-8 backdrop-blur-xl ${isDark ? 'bg-surface-dark/80' : 'bg-white/80'}`}>
                <button
                  onClick={() => setSelected(null)}
                  className={`absolute top-4 right-4 h-8 w-8 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'text-gray-100 hover:bg-white/10' : 'text-gray-800 hover:bg-black/10'}`}
                  aria-label="Close"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: selected.rating }).map((_, j) => <span key={j} className="text-lg" style={{ color: category.accentColor }}>★</span>)}
                </div>
                <p className={`text-base leading-relaxed ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                  &ldquo;{selected.content}&rdquo;
                </p>
                <div className={`mt-6 pt-6 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                  <div className={`text-base font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{selected.name}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{selected.role}, {selected.company}</div>
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
