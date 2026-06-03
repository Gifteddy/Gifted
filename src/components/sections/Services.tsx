import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { LiquidGlass } from '@/components/ui/LiquidGlass'
import { Skeleton } from '@/components/ui/Skeleton'

interface ServiceItem {
  title: string
  description: string
  icon: string
  glow: string
}

const bgIcons: Record<string, React.ReactNode> = {
  'Photography': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  'Video Production': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
  'Graphic Design': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5m0 0-7 7m7-7 7 7"/><path d="M12 3a9 9 0 1 0 9 9"/></svg>,
  'Development': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  'AI Enthusiast': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a8 8 0 0 0-8 8c0 4 2 5 4.5 8.5a2 2 0 0 0 3.5 0C14 15 20 14 20 10a8 8 0 0 0-8-8z"/></svg>,
  'Photo Editing': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
}

const serviceRoutes: Record<string, string> = {
  'Photography': '/photography',
  'Video Production': '/video-production',
  'Graphic Design': '/graphic-design',
  'Development': '/development',
  'AI Enthusiast': '/ai-enthusiast',
  'Photo Editing': '/photo-editing',
}

export function Services() {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { getServices } = await import('@/lib/queries')
        const data = await getServices()
        setServices(data.length > 0 ? data.map(s => ({ title: s.title, description: s.description, icon: s.icon, glow: '#4dabf7' })) : [])
      } catch { setServices([]) } finally { setLoading(false) }
    }
    load()
  }, [])

  return (
    <section id="services" className="relative overflow-hidden px-4 py-24 sm:py-32">
      <div className="absolute inset-0 bg-white dark:bg-transparent dark:bg-gradient-to-b dark:from-transparent dark:via-brand-500/5 dark:to-transparent" />
      <div className="relative mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.6 }}
          className="mb-16 text-center">
          <span className="mb-4 block text-xs font-semibold tracking-widest uppercase text-brand-500 dark:text-brand-400">Services</span>
          <h2 className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl">What I <span className="text-gradient">Do</span></h2>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-6 border border-border-light dark:border-border-dark bg-surface-secondary-light dark:bg-surface-secondary-dark">
              <Skeleton className="mb-4 h-8 w-8" /><Skeleton className="mb-2 h-5 w-32" /><Skeleton className="h-4 w-full" />
            </div>
          )) : services.map((s, i) => {
            const route = serviceRoutes[s.title]
            const card = (
              <motion.div key={s.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative rounded-2xl"
                style={{ boxShadow: `0 0 24px ${s.glow}18` }}>
                <LiquidGlass className="group rounded-2xl p-6 transition-all duration-500 hover:scale-[1.02]" intensity="subtle">
                  <div className="absolute inset-0 rounded-2xl opacity-[0.07] dark:opacity-[0.12] pointer-events-none"
                    style={{ background: `radial-gradient(circle at 50% 0%, ${s.glow}, transparent 70%)` }} />
                  <div className="absolute top-0 left-8 right-8 h-0.5 rounded-full pointer-events-none"
                    style={{ background: `linear-gradient(90deg, transparent, ${s.glow}, transparent)` }} />
                  <div className="pointer-events-none absolute top-3 right-3 select-none opacity-[0.07] dark:opacity-[0.05] w-28 h-28"
                    style={{ color: s.glow }}>{bgIcons[s.title]}</div>
                  <div className="mb-4 text-3xl relative">{s.icon}</div>
                  <h3 className="mb-2 text-lg font-semibold relative">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-text-muted-light dark:text-text-muted-dark relative">{s.description}</p>
                </LiquidGlass>
              </motion.div>
            )
            return route ? <Link key={s.title} to={route}>{card}</Link> : card
          })}
        </div>
      </div>
    </section>
  )
}
