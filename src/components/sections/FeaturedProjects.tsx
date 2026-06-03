import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { LiquidGlass } from '@/components/ui/LiquidGlass'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Project } from '@/lib/types'

export function FeaturedProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try { setProjects(await (await import('@/lib/queries')).getFeaturedProjects()) }
      catch { /* silent */ } finally { setLoading(false) }
    }
    load()
  }, [])

  return (
    <section className="relative overflow-hidden px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.6 }}
          className="mb-12 flex items-end justify-between">
          <div>
            <span className="mb-4 block text-xs font-semibold tracking-widest uppercase text-brand-500 dark:text-brand-400">Portfolio</span>
            <h2 className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl">Featured <span className="text-gradient">Work</span></h2>
          </div>
          <Button href="/projects" variant="ghost" className="hidden sm:flex">View All Projects</Button>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-border-light dark:border-border-dark">
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="p-5 space-y-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-5 w-40" /></div>
            </div>
          )) : projects.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}>
              <Link to={`/projects/${p.slug}`}>
                <LiquidGlass className="group overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02]" intensity="medium">
                  <div className="aspect-[4/3] bg-gradient-to-br from-brand-500/10 to-gold-500/10 flex items-center justify-center">
                    {p.thumbnail ? <img src={p.thumbnail} alt={p.title} className="h-full w-full object-cover" />
                      : <span className="text-4xl opacity-30">🚀</span>}
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-medium text-brand-500 dark:text-brand-400">{p.categories?.[0]?.name || 'Project'}</span>
                    <h3 className="mt-1 text-lg font-semibold transition-colors group-hover:text-brand-500">{p.title}</h3>
                  </div>
                </LiquidGlass>
              </Link>
            </motion.div>
          ))}
        </div>

        {!loading && projects.length === 0 && (
          <p className="text-center text-text-muted-light dark:text-text-muted-dark">No featured projects yet.</p>
        )}

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-8 text-center sm:hidden">
          <Button href="/projects" variant="secondary">View All Projects</Button>
        </motion.div>
      </div>
    </section>
  )
}
