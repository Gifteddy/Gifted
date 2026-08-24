import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LiquidGlass } from '@/components/ui/LiquidGlass'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { SEOBreadcrumbs } from '@/components/ui/SEOBreadcrumbs'
import { FannedPhotoGallery } from '@/components/gallery/FannedPhotoGallery'
import { CARD_IMG_OPS, cdnImage } from '@/lib/image'
import { Meta } from '@/lib/meta'
import { SITE_URL, resolveOgImage } from '@/lib/seo'
import type { Project } from '@/lib/types'

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [photoLbIndex, setPhotoLbIndex] = useState<number | null>(null)
  const [scrollPos, setScrollPos] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      if (!slug) return
      try {
        const { getProjectBySlug } = await import('@/lib/queries')
        const data = await getProjectBySlug(slug)
        setProject(data)
        setPhotoLbIndex(null)
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

  const projectUrl = `${SITE_URL}/projects/${project.slug}`
  const projectName = project.title
  const projectDesc = project.description || `View ${projectName} by Gifted — a creative project spanning design, development, and visual storytelling.`
  const projectImage = project.thumbnail || project.gallery?.[0]

  const categoryNames = project.categories?.map(c => (c as any)?.category?.name || (c as any)?.name) || []

  const isVideoProject = project.categories?.some(c => ((c as any)?.category?.name ?? (c as any)?.name)?.toLowerCase().includes('video') || ((c as any)?.category?.slug ?? (c as any)?.slug)?.includes('video')) || project.category?.includes('video')
  const isDevProject = project.categories?.some(c => ((c as any)?.category?.slug ?? (c as any)?.slug) === 'development') || project.category === 'development'

  interface NestedCategoryRef { category?: { name?: unknown; slug?: unknown } | null; name?: unknown; slug?: unknown }
  const catRefs = (project.categories ?? []) as unknown as NestedCategoryRef[]
  const catNameList = catRefs.map(c => String(c.category?.name ?? c.name ?? '').toLowerCase())
  const catSlugList = catRefs.map(c => String(c.category?.slug ?? c.slug ?? '').toLowerCase())
  const isPhotoProject =
    catNameList.some(n => n === 'photography' || n === 'photo editing') ||
    catSlugList.some(s => s === 'photography' || s === 'photo-editing') ||
    project.category === 'photography' ||
    project.category === 'photo-editing'

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
      <Meta
        title={projectName}
        description={projectDesc}
        image={projectImage}
        url={projectUrl}
        keywords={[projectName, ...(project.tags || []), ...categoryNames, 'portfolio', 'creative project']}
        breadcrumbs={[
          { name: 'Projects', path: '/projects' },
          { name: projectName, path: `/projects/${project.slug}` },
        ]}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CreativeWork',
          name: projectName,
          description: projectDesc,
          url: projectUrl,
          image: resolveOgImage(projectImage).url,
          author: {
            '@type': 'Person',
            name: 'Ibiam Iheanyi Victory',
            url: SITE_URL,
          },
          dateCreated: project.created_at,
          dateModified: project.updated_at,
          keywords: project.tags?.join(', '),
          genre: categoryNames.join(', ') || 'Creative',
        }}
      />

      {isVideoProject && project.project_url ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="relative h-screen w-full overflow-hidden">
          <video src={project.project_url} controls className="h-full w-full object-contain bg-black" poster={project.thumbnail || undefined}>
            <track kind="captions" src="" label="English" />
            Your browser does not support the video tag.
          </video>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-8 left-4 sm:bottom-12 sm:left-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Link to="/projects" className="pointer-events-auto mb-4 inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Back to Projects
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="mb-2 flex flex-wrap gap-2">
                {project.categories?.map(cat => (
                  <span key={(cat as any)?.category?.slug ?? (cat as any)?.slug ?? (cat as any)?.name} className="pointer-events-auto rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">{(cat as any)?.category?.name ?? (cat as any)?.name}</span>
                ))}
                {(!project.categories || project.categories.length === 0) && project.category && (
                  <span className="pointer-events-auto rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">{project.category.replace(/-/g, ' ')}</span>
                )}
              </div>
              <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl">{projectName}</h1>
            </motion.div>
          </div>
        </motion.div>
      ) : isPhotoProject && project.gallery && project.gallery.length > 0 ? (
        <FannedPhotoGallery
          key={project.id}
          images={project.gallery}
          title={projectName}
          categories={categoryNames.length > 0 ? categoryNames : project.category ? [project.category.replace(/-/g, ' ')] : []}
          lbIndex={photoLbIndex}
          onLbIndexChange={setPhotoLbIndex}
        />
      ) : (
        <div className="mx-auto max-w-4xl px-4 pt-32">
          <SEOBreadcrumbs
            items={[
              { name: 'Projects', path: '/projects' },
              { name: projectName, path: `/projects/${project.slug}` },
            ]}
            className="mb-6"
          />

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link to="/projects" className="mb-8 inline-flex items-center gap-2 text-sm text-text-muted-light transition-colors hover:text-brand-500 dark:text-text-muted-dark dark:hover:text-brand-400">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back to Projects
            </Link>
          </motion.div>

          {!isPhotoProject && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="mb-2 flex flex-wrap gap-2">
                {project.categories?.map(cat => (
                  <span key={(cat as any)?.category?.slug ?? (cat as any)?.slug ?? (cat as any)?.name} className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-500 dark:text-brand-400">{(cat as any)?.category?.name ?? (cat as any)?.name}</span>
                ))}
                {(!project.categories || project.categories.length === 0) && project.category && (
                  <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-500 dark:text-brand-400">{project.category.replace(/-/g, ' ')}</span>
                )}
              </div>
              <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">{projectName}</h1>
            </motion.div>
          )}

          {!isPhotoProject && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="mt-8 overflow-hidden rounded-2xl border border-border-light dark:border-border-dark">
              {project.thumbnail ? (
                <div className="relative">
                  <img src={project.thumbnail} alt={projectName} loading="eager" decoding="async" width="1200" height="675" className="w-full object-cover" />
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-brand-500/10 to-gold-500/10">
                  <span className="text-6xl opacity-30" aria-hidden="true">🚀</span>
                </div>
              )}
            </motion.div>
          )}
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

              {isDevProject && (project.project_url || project.github_url) && (
                <div className="mt-6 space-y-2">
                  {project.project_url && (
                    <a href={project.project_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-white/5 px-4 py-2.5 text-sm font-medium transition-all hover:border-brand-500/50 hover:bg-brand-500/5">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      <span>Live Site</span>
                      <svg className="ml-auto h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
                    </a>
                  )}
                  {project.github_url && (
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-white/5 px-4 py-2.5 text-sm font-medium transition-all hover:border-brand-500/50 hover:bg-brand-500/5">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true"><path d="M12 2C6.5 2 2 6.5 2 12c0 4.4 2.9 8.2 6.9 9.5.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.4-3.4-1.4-.5-1.2-1.2-1.5-1.2-1.5-1-.7 0-.7 0-.7 1 .1 1.6 1.1 1.6 1.1.9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1.1-2.7-.1-.3-.5-1.3.1-2.7 0 0 .9-.3 2.9 1.1A10 10 0 0 1 12 7c1 0 2 .1 2.8.3 2-1.4 2.9-1.1 2.9-1.1.6 1.4.2 2.4.1 2.7.7.7 1.1 1.6 1.1 2.7 0 3.9-2.4 4.7-4.6 4.9.4.3.7 1 .7 1.9v2.8c0 .3.2.6.7.5C19.1 20.2 22 16.4 22 12c0-5.5-4.5-10-10-10z"/></svg>
                      <span>GitHub</span>
                      <svg className="ml-auto h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
                    </a>
                  )}
                </div>
              )}

              {project.external_links && project.external_links.length > 0 && (
                <div className="mt-6 space-y-2">
                  {project.external_links.map(link => (
                    <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-white/5 px-4 py-2.5 text-sm font-medium transition-all hover:border-brand-500/50 hover:bg-brand-500/5">
                      <span>{link.label}</span>
                      <svg className="ml-auto h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
                    </a>
                  ))}
                </div>
              )}
            </LiquidGlass>
          </motion.div>
        </div>

        {!isVideoProject && !isPhotoProject && project.gallery && project.gallery.length > 0 && (
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
                    <img src={img} alt={`${projectName} — Gallery image ${i + 1}`} className="h-full w-full object-cover" loading="lazy" decoding="async" width="400" height="384" />
                  </button>
                ))}
              </div>
              {project.gallery.length > 1 && (
                <>
                  <button onClick={() => scrollGallery('left')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow-lg opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white dark:bg-gray-900/80 dark:text-white dark:hover:bg-gray-900"
                    aria-label="Previous image">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <button onClick={() => scrollGallery('right')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow-lg opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white dark:bg-gray-900/80 dark:text-white dark:hover:bg-gray-900"
                    aria-label="Next image">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </>
              )}
            </div>
            {project.gallery.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4" role="group" aria-label="Gallery navigation">
                {project.gallery.map((_, i) => (
                  <button key={i} onClick={() => { scrollRef.current?.children[i]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' }) }}
                    className="h-1.5 rounded-full transition-all bg-gray-300 dark:bg-gray-700 data-[active]:w-4 data-[active]:bg-brand-500"
                    aria-label={`View image ${i + 1}`}
                    data-active={i === Math.round(scrollPos / (scrollRef.current?.clientWidth || 1)) ? '' : undefined} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {isPhotoProject && project.gallery && project.gallery.length > 0 && (
        <div className="mx-auto mt-12 max-w-6xl px-4">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold">Gallery</h2>
            <span className="text-sm tabular-nums text-text-muted-light dark:text-text-muted-dark">{project.gallery.length} photos</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
            {project.gallery.map((img, i) => (
              <button key={i} type="button" onClick={() => setPhotoLbIndex(i)}
                aria-label={`Open ${projectName} image ${i + 1}`}
                className="group relative overflow-hidden rounded-2xl border border-border-light transition-transform duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-border-dark">
                <img src={cdnImage(img, CARD_IMG_OPS)} alt={`${projectName} — Gallery image ${i + 1}`} loading="lazy" decoding="async" width="600" height="600"
                  className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {lightboxIndex !== null && project.gallery && !isPhotoProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setLightboxIndex(null)} role="dialog" aria-label="Image lightbox" aria-modal="true">
          <button onClick={() => setLightboxIndex(null)}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Close lightbox">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
          {project.gallery.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => prev === 0 ? project.gallery.length - 1 : prev! - 1) }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="Previous image">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => prev === project.gallery.length - 1 ? 0 : prev! + 1) }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="Next image">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </>
          )}
          <motion.img key={lightboxIndex} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            src={project.gallery[lightboxIndex]} alt={`${projectName} — Gallery image ${lightboxIndex + 1}`}
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
            {lightboxIndex + 1} / {project.gallery.length}
          </div>
        </div>
      )}
    </section>
  )
}
