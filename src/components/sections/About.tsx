import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/Skeleton'

export function About() {
  const [bio, setBio] = useState<string | null>(null)
  const [stats, setStats] = useState<{ value: string; label: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { supabase } = await import('@/lib/supabase')
        const { data } = await supabase.from('site_settings').select('key, value').in('key', ['about_bio', 'stats'])
        if (data) {
          const bioS = data.find(s => s.key === 'about_bio')
          const statsS = data.find(s => s.key === 'stats')
          if (bioS) setBio(bioS.value)
          if (statsS) setStats(JSON.parse(statsS.value))
        }
      } catch { /* silent */ } finally { setLoading(false) }
    }
    load()
  }, [])

  return (
    <section className="relative overflow-hidden px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}>
            <span className="mb-4 block text-xs font-semibold tracking-widest uppercase text-brand-500 dark:text-brand-400">About</span>
            <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">Crafting Digital<br /><span className="text-gradient">Experiences</span></h2>
            {loading ? (
              <div className="mt-6 space-y-3"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></div>
            ) : (
              <p className="mt-6 leading-relaxed text-text-muted-light dark:text-text-muted-dark">
                {bio || 'I bridge the gap between design and engineering, creating digital experiences that are as functional as they are beautiful.'}
              </p>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }} className="grid grid-cols-2 gap-4">
            {loading ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border-light dark:border-border-dark bg-surface-secondary-light dark:bg-surface-secondary-dark p-6 text-center">
                <Skeleton className="mx-auto h-8 w-16" /><Skeleton className="mx-auto mt-2 h-3 w-20" />
              </div>
            )) : stats.map(stat => (
              <div key={stat.label} className="rounded-2xl border border-border-light dark:border-border-dark bg-surface-secondary-light dark:bg-surface-secondary-dark p-6 text-center">
                <div className="font-display text-3xl font-bold text-gradient sm:text-4xl">{stat.value}</div>
                <div className="mt-1 text-xs text-text-muted-light dark:text-text-muted-dark">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
