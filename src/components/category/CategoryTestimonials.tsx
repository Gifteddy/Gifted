import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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

  const display = testimonials

  return (
    <section className={`relative overflow-hidden px-4 py-24 sm:py-32 transition-colors duration-500 ${isDark ? '' : 'bg-gray-50/80'}`}>
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.6 }}
          className="mb-16 text-center">
          <span className="mb-4 block text-xs font-semibold tracking-widest uppercase" style={{ color: category.accentColor }}>Testimonials</span>
          <h2 className={`font-display text-3xl font-bold sm:text-4xl lg:text-5xl ${isDark ? 'text-white' : 'text-gray-900'}`}>What Clients <span className="text-gradient">Say</span></h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {loading ? Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`rounded-2xl p-6 border ${isDark ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-white'}`}>
              <Skeleton className="mb-3 h-4 w-full" /><Skeleton className="mb-3 h-4 w-3/4" /><Skeleton className="h-4 w-1/2" />
            </div>
          )) : display.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}>
              <LiquidGlass className="rounded-2xl p-6" intensity="subtle">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j} className="text-sm" style={{ color: category.accentColor }}>★</span>
                  ))}
                </div>
                <p className={`mb-4 text-sm leading-relaxed italic ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>"{t.content}"</p>
                <div>
                  <p className={`text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{t.name}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{t.role}, {t.company}</p>
                </div>
              </LiquidGlass>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
