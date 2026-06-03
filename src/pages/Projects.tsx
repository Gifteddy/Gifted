import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { LiquidGlass } from '@/components/ui/LiquidGlass'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import type { Project } from '@/lib/types'

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [{ getProjects }, { getCategories }] = await Promise.all([
          import('@/lib/queries'),
          import('@/lib/queries'),
        ])
        const [projData, catData] = await Promise.all([getProjects(), getCategories()])
        setProjects(projData)
        const catNames = catData.map(c => c.name)
        const usedCats = [...new Set([...catNames, ...projData.flatMap(p => p.category ? [p.category.replace(/-/g, ' ')] : [])])]
        setCategories(usedCats)
      } catch { /* silent */ } finally { setLoading(false) }
    }
    load()
  }, [])

  const filtered = activeCategory === 'all'
    ? projects
    : projects.filter(p => p.categories?.some(c => c.name === activeCategory) || p.category?.replace(/-/g, ' ') === activeCategory)

  return (
    <section className="relative min-h-screen px-4 pt-32 pb-24">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="mb-12 text-center">
          <span className="mb-4 block text-xs font-semibold tracking-widest uppercase text-brand-500 dark:text-brand-400">Portfolio</span>
          <h1 className="font-display text-4xl font-bold sm:text-5xl lg:text-6xl">All <span className="text-gradient">Projects</span></h1>
        </motion.div>

        {categories.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="mb-12 flex flex-wrap justify-center gap-2">
            <Button key="all" variant={activeCategory === 'all' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveCategory('all')}>All</Button>
            {categories.map(cat => (
              <Button key={cat} variant={activeCategory === cat ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveCategory(cat)}>{cat}</Button>
            ))}
          </motion.div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-border-light dark:border-border-dark">
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="space-y-2 p-5"><Skeleton className="h-3 w-20" /><Skeleton className="h-5 w-40" /></div>
            </div>
          )) : filtered.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.05 }}>
              <Link to={`/projects/${p.slug}`}>
                <LiquidGlass className="group overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02]" intensity="medium">
                  <div className="relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-brand-500/10 to-gold-500/10">
                    {p.thumbnail ? <img src={p.thumbnail} alt={p.title} className="h-full w-full object-cover" />
                      : <span className="text-4xl opacity-30">🚀</span>}
                    {(p.categories?.some(c => c.name?.toLowerCase().includes('video') || c.slug === 'video-production') || p.category === 'video-production') && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-transform group-hover:scale-110">
                          <svg className="ml-0.5 h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                      </div>
                    )}
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

        {!loading && filtered.length === 0 && (
          <p className="text-center text-text-muted-light dark:text-text-muted-dark">No projects found.</p>
        )}
      </div>
    </section>
  )
}
