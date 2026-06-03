import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { LiquidGlass } from '@/components/ui/LiquidGlass'
import { Skeleton } from '@/components/ui/Skeleton'
import { useTheme } from '@/store/theme'
import type { Project } from '@/lib/types'
import type { CategoryConfig } from '@/lib/categories'

export function CategoryProjects({ category }: { category: CategoryConfig }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { getProjects } = await import('@/lib/queries')
        const all = await getProjects()
        const filtered = all.filter(p =>
          p.categories?.some(c => c?.name?.toLowerCase() === category.slug.replace(/-/g, ' ')) ||
          p.category?.toLowerCase() === category.slug ||
          p.tags?.some(t => t.toLowerCase().includes(category.slug.replace(/-/g, '')))
        )
        setProjects(filtered)
      } catch {
        setProjects([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [category.slug])

  return (
    <section className={`relative overflow-hidden px-4 py-24 sm:py-32 transition-colors duration-500 ${isDark ? '' : 'bg-white'}`}>
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.6 }}
          className="mb-12">
          <span className="mb-4 block text-xs font-semibold tracking-widest uppercase" style={{ color: category.accentColor }}>Portfolio</span>
          <h2 className={`font-display text-3xl font-bold sm:text-4xl lg:text-5xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Featured <span className="text-gradient">Projects</span></h2>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`overflow-hidden rounded-2xl border ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="p-5 space-y-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-5 w-40" /></div>
            </div>
          )) : projects.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}>
              <Link to={`/projects/${p.slug}`}>
                <LiquidGlass className="group overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1" intensity="subtle">
                  <div className="relative aspect-[4/3] flex items-center justify-center overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${category.accentColor}18, ${category.accentColor}08)` }}>
                    {p.thumbnail ? (
                      <><img src={p.thumbnail} alt={p.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        {(p.categories?.some(c => c.name?.toLowerCase().includes('video') || c.slug?.includes('video')) || p.category?.includes('video')) && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-transform group-hover:scale-110">
                              <svg className="ml-0.5 h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-6xl font-bold opacity-15" style={{ color: category.accentColor }}>{category.name[0]}</span>
                    )}
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-medium" style={{ color: category.accentColor }}>{category.name}</span>
                    <h3 className={`mt-1 text-lg font-semibold transition-colors group-hover:text-brand-500 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{p.title}</h3>
                  </div>
                </LiquidGlass>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
