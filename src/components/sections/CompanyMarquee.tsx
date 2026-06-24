import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/Skeleton'
import type { CompanyLogo } from '@/lib/types'

export function CompanyMarquee() {
  const [logos, setLogos] = useState<CompanyLogo[]>([])
  const [loading, setLoading] = useState(true)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    async function load() {
      try { const d = await (await import('@/lib/queries')).getCompanyLogos(); setLogos(d) }
      catch { setLogos([]) } finally { setLoading(false) }
    }
    load()
  }, [])

  if (!loading && logos.length === 0) return null

  return (
    <section className="relative overflow-hidden px-4 py-20 sm:py-28">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-500/[0.03] to-transparent" />
      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <span className="mb-4 block text-xs font-semibold tracking-widest uppercase text-brand-500 dark:text-brand-400">
            Trusted By
          </span>
          <h2 className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
            Companies I&apos;ve <span className="text-gradient">Worked With</span>
          </h2>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center gap-10">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-32 rounded-lg" />
            ))}
          </div>
        ) : (
          <div
            className="overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              className="flex items-center gap-16 w-max"
              style={{
                animation: `marquee 30s linear infinite`,
                animationPlayState: isPaused ? 'paused' : 'running',
              }}
            >
              {[...logos, ...logos].map((logo, i) => (
                <div
                  key={`${logo.id}-${i}`}
                  className="flex h-16 w-44 shrink-0 items-center justify-center px-4"
                  title={logo.name}
                >
                  <img
                    src={logo.url}
                    alt={logo.name}
                    className="max-h-full max-w-full object-contain opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}