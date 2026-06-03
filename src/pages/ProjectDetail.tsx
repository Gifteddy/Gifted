import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LiquidGlass } from '@/components/ui/LiquidGlass'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import type { Project } from '@/lib/types'

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!slug) return
      try {
        const { getProjectBySlug } = await import('@/lib/queries')
        const data = await getProjectBySlug(slug)
        setProject(data)
      } catch { /* silent */ } finally { setLoading(false) }
    }
    load()
  }, [slug])

  if (loading) {
    return (
      <section className="relative min-h-screen px-4 pt-32 pb-24">
        <div className="mx-auto max-w-4xl">
          <Skeleton className="mb-6 h-6 w-32" />
          <Skeleton className="mb-4 h-12 w-3/4" />
          <Skeleton className="mb-8 aspect-video w-full rounded-2xl" />
          <div className="space-y-3"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /><Skeleton className="h-4 w-4/6" /></div>
        </div>
      </section>
    )
  }

  if (!project) {
    return (
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-20">
        <h1 className="font-display text-4xl font-bold">Project Not Found</h1>
        <p className="mt-4 text-text-muted-light dark:text-text-muted-dark">The project you&apos;re looking for doesn&apos;t exist.</p>
        <Button href="/projects" className="mt-8">Back to Projects</Button>
      </section>
    )
  }

  return (
    <section className="relative min-h-screen px-4 pt-32 pb-24">
      <div className="mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/projects" className="mb-8 inline-flex items-center gap-2 text-sm text-text-muted-light transition-colors hover:text-brand-500 dark:text-text-muted-dark dark:hover:text-brand-400">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Projects
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="mb-2 flex flex-wrap gap-2">
            {project.categories?.map(cat => (
              <span key={cat.name} className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-500 dark:text-brand-400">{cat.name}</span>
            ))}
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">{project.title}</h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="mt-8 overflow-hidden rounded-2xl border border-border-light dark:border-border-dark">
          {project.thumbnail ? (
            <div className="relative">
              <img src={project.thumbnail} alt={project.title} className="w-full object-cover" />
              {project.categories?.some(c => c.name?.toLowerCase().includes('video') || c.slug?.includes('video')) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm">
                    <svg className="ml-1 h-7 w-7" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-brand-500/10 to-gold-500/10">
              <span className="text-6xl opacity-30">🚀</span>
            </div>
          )}
        </motion.div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
            <LiquidGlass className="rounded-2xl p-6 sm:p-8" intensity="subtle">
              <h2 className="mb-4 text-xl font-semibold">About This Project</h2>
              <div className="leading-relaxed text-text-muted-light dark:text-text-muted-dark whitespace-pre-line">
                {project.description}
                {project.content && <><br /><br />{project.content}</>}
              </div>
            </LiquidGlass>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <LiquidGlass className="rounded-2xl p-6" intensity="subtle">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-500 dark:text-brand-400">Details</h3>
              <dl className="space-y-4">
                {project.client && (
                  <div><dt className="text-xs text-text-muted-light dark:text-text-muted-dark">Client</dt><dd className="text-sm font-medium">{project.client}</dd></div>
                )}
                {project.year && (
                  <div><dt className="text-xs text-text-muted-light dark:text-text-muted-dark">Year</dt><dd className="text-sm font-medium">{project.year}</dd></div>
                )}
                {project.role && (
                  <div><dt className="text-xs text-text-muted-light dark:text-text-muted-dark">Role</dt><dd className="text-sm font-medium">{project.role}</dd></div>
                )}
                {project.tools && project.tools.length > 0 && (
                  <div>
                    <dt className="text-xs text-text-muted-light dark:text-text-muted-dark">Tools</dt>
                    <dd className="mt-1 flex flex-wrap gap-1.5">
                      {project.tools.map(t => <span key={t} className="rounded-lg border border-border-light dark:border-border-dark bg-white/50 dark:bg-white/5 px-2 py-0.5 text-xs">{t}</span>)}
                    </dd>
                  </div>
                )}
              </dl>

              {project.external_links && project.external_links.length > 0 && (
                <div className="mt-6 space-y-2">
                  {project.external_links.map(link => (
                    <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-white/5 px-4 py-2.5 text-sm font-medium transition-all hover:border-brand-500/50 hover:bg-brand-500/5">
                      <span>{link.label}</span>
                      <svg className="ml-auto h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
                    </a>
                  ))}
                </div>
              )}
            </LiquidGlass>
          </motion.div>
        </div>

        {project.project_url && project.categories?.some(c => c.name?.toLowerCase().includes('video') || c.slug?.includes('video')) && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="mt-8 overflow-hidden rounded-2xl border border-border-light dark:border-border-dark">
            <video src={project.project_url} controls className="w-full" poster={project.thumbnail || undefined}>
              Your browser does not support the video tag.
            </video>
          </motion.div>
        )}

        {project.gallery && project.gallery.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="mt-12">
            <h2 className="mb-6 text-2xl font-bold font-display">Gallery</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {project.gallery.map((img, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-border-light dark:border-border-dark">
                  <img src={img} alt={`${project.title} - ${i + 1}`} className="w-full object-cover" />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
