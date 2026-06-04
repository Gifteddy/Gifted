import { useState, useEffect, useRef } from 'react'
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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [scrollPos, setScrollPos] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

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

  const isVideoProject = project.categories?.some(c => c.name?.toLowerCase().includes('video') || c.slug?.includes('video')) || project.category?.includes('video')

  const scrollGallery = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth * 0.8
    scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  const handleScroll = () => {
    if (!scrollRef.current) return
    setScrollPos(scrollRef.current.scrollLeft)
  }

  return (
    <section className="relative min-h-screen pb-24">
      {isVideoProject && project.project_url ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="relative h-screen w-full overflow-hidden">
          <video src={project.project_url} controls className="h-full w-full object-contain bg-black" poster={project.thumbnail || undefined}>
            Your browser does not support the video tag.
          </video>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-8 left-4 sm:bottom-12 sm:left-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Link to="/projects" className="pointer-events-auto mb-4 inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Back to Projects
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="mb-2 flex flex-wrap gap-2">
                {project.categories?.map(cat => (
                  <span key={cat.name} className="pointer-events-auto rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">{cat.name}</span>
                ))}
                {(!project.categories || project.categories.length === 0) && project.category && (
                  <span className="pointer-events-auto rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">{project.category.replace(/-/g, ' ')}</span>
                )}
              </div>
              <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl">{project.title}</h1>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <div className="mx-auto max-w-4xl px-4 pt-32">
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
              {(!project.categories || project.categories.length === 0) && project.category && (
                <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-500 dark:text-brand-400">{project.category.replace(/-/g, ' ')}</span>
              )}
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">{project.title}</h1>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="mt-8 overflow-hidden rounded-2xl border border-border-light dark:border-border-dark">
            {project.thumbnail ? (
              <div className="relative">
                <img src={project.thumbnail} alt={project.title} className="w-full object-cover" />
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-brand-500/10 to-gold-500/10">
                <span className="text-6xl opacity-30">🚀</span>
              </div>
            )}
          </motion.div>
        </div>
      )}

      <div className="mx-auto mt-12 max-w-4xl px-4">
        <div className="grid gap-8 lg:grid-cols-3">
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

        {!isVideoProject && project.gallery && project.gallery.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="mt-12">
            <h2 className="mb-6 text-2xl font-bold font-display">Gallery</h2>
            <div className="relative group">
              <div ref={scrollRef} onScroll={handleScroll}
                className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {project.gallery.map((img, i) => (
                  <button key={i} onClick={() => setLightboxIndex(i)}
                    className="snap-start shrink-0 overflow-hidden rounded-2xl border border-border-light dark:border-border-dark
                      w-[80vw] sm:w-auto sm:h-96 transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                    <img src={img} alt={`${project.title} - ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
              {project.gallery.length > 1 && (
                <>
                  <button onClick={() => scrollGallery('left')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow-lg opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white dark:bg-gray-900/80 dark:text-white dark:hover:bg-gray-900">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <button onClick={() => scrollGallery('right')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow-lg opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white dark:bg-gray-900/80 dark:text-white dark:hover:bg-gray-900">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </>
              )}
            </div>
            {project.gallery.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                {project.gallery.map((_, i) => (
                  <button key={i} onClick={() => { scrollRef.current?.children[i]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' }) }}
                    className="h-1.5 rounded-full transition-all bg-gray-300 dark:bg-gray-700 data-[active]:w-4 data-[active]:bg-brand-500"
                    data-active={i === Math.round(scrollPos / (scrollRef.current?.clientWidth || 1)) ? '' : undefined} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {lightboxIndex !== null && project.gallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setLightboxIndex(null)}>
          <button onClick={() => setLightboxIndex(null)}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
          {project.gallery.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => prev === 0 ? project.gallery.length - 1 : prev! - 1) }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => prev === project.gallery.length - 1 ? 0 : prev! + 1) }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </>
          )}
          <motion.img key={lightboxIndex} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            src={project.gallery[lightboxIndex]} alt={`${project.title} - ${lightboxIndex + 1}`}
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
            {lightboxIndex + 1} / {project.gallery.length}
          </div>
        </div>
      )}
    </section>
  )
}
