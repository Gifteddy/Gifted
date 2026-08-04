import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/Skeleton'
import { LiquidGlass } from '@/components/ui/LiquidGlass'
import { Button } from '@/components/ui/Button'
import { SEOBreadcrumbs } from '@/components/ui/SEOBreadcrumbs'
import { Meta } from '@/lib/meta'
import { buildArticleSchema, SITE_URL } from '@/lib/seo'
import { formatDate } from '@/lib/utils'
import type { BlogPost as BlogPostType } from '@/lib/types'

function CustomHtmlPage({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const shadow = containerRef.current.shadowRoot || containerRef.current.attachShadow({ mode: 'open' })
    shadow.innerHTML = `<div style="width:100%">${html}</div>`

    const handleClick = (e: Event) => {
      const target = (e.target as HTMLElement).closest('a[href^="#"]')
      if (!target) return
      const id = target.getAttribute('href')?.slice(1)
      if (!id) return
      const el = shadow.getElementById(id)
      if (el) {
        e.preventDefault()
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
    shadow.addEventListener('click', handleClick)
    return () => shadow.removeEventListener('click', handleClick)
  }, [html])

  return <div ref={containerRef} className="w-full" />
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<BlogPostType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!slug) return
      try {
        const { getBlogPostBySlug } = await import('@/lib/queries')
        const data = await getBlogPostBySlug(slug)
        setPost(data)
      } catch { /* silent */ } finally { setLoading(false) }
    }
    load()
  }, [slug])

  if (loading) {
    return (
      <section className="relative min-h-screen px-4 pt-32 pb-24">
        <div className="mx-auto max-w-3xl">
          <Skeleton className="mb-6 h-6 w-32" />
          <Skeleton className="mb-4 h-12 w-3/4" />
          <Skeleton className="mb-4 h-4 w-48" />
          <Skeleton className="mb-8 aspect-video w-full rounded-2xl" />
          <div className="space-y-3"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /><Skeleton className="h-4 w-4/6" /></div>
        </div>
      </section>
    )
  }

  if (!post) {
    return (
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-20">
        <h1 className="font-display text-4xl font-bold">Post Not Found</h1>
        <p className="mt-4 text-text-muted-light dark:text-text-muted-dark">The blog post you&apos;re looking for doesn&apos;t exist.</p>
        <Button href="/blog" className="mt-8">Back to Blog</Button>
      </section>
    )
  }

  const postUrl = `${SITE_URL}/blog/${post.slug}`
  const articleSchema = buildArticleSchema({
    title: post.title,
    description: post.excerpt,
    image: post.cover_image,
    url: postUrl,
    publishedAt: post.created_at,
    modifiedAt: post.updated_at,
    author: 'Ibiam Iheanyi Victory',
  })

  if (post.custom_html) {
    return (
      <>
        <Meta
          title={post.title}
          description={post.excerpt}
          image={post.cover_image}
          url={postUrl}
          type="article"
          publishedAt={post.created_at}
          modifiedAt={post.updated_at}
          author="Ibiam Iheanyi Victory"
          keywords={post.tags || []}
          breadcrumbs={[
            { name: 'Blog', path: '/blog' },
            { name: post.title, path: `/blog/${post.slug}` },
          ]}
          jsonLd={articleSchema}
        />
        <CustomHtmlPage html={post.custom_html} />
      </>
    )
  }

  return (
    <article className="relative min-h-screen px-4 pt-32 pb-24">
      <Meta
        title={post.title}
        description={post.excerpt}
        image={post.cover_image}
        url={postUrl}
        type="article"
        publishedAt={post.created_at}
        modifiedAt={post.updated_at}
        author="Ibiam Iheanyi Victory"
        keywords={post.tags || []}
        breadcrumbs={[
          { name: 'Blog', path: '/blog' },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
        jsonLd={articleSchema}
      />
      <div className="mx-auto max-w-3xl">
        <SEOBreadcrumbs
          items={[
            { name: 'Blog', path: '/blog' },
            { name: post.title, path: `/blog/${post.slug}` },
          ]}
          className="mb-6"
        />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/blog" className="mb-8 inline-flex items-center gap-2 text-sm text-text-muted-light transition-colors hover:text-brand-500 dark:text-text-muted-dark dark:hover:text-brand-400">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Blog
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="mb-4 flex flex-wrap gap-2">
            {post.tags?.map((tag: string) => (
              <span key={tag} className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-500 dark:text-brand-400">{tag}</span>
            ))}
          </div>
          <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">{post.title}</h1>
          <div className="mt-4 flex items-center gap-4 text-sm text-text-muted-light dark:text-text-muted-dark">
            <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
            {post.reading_time && (
              <>
                <span aria-hidden="true">·</span>
                <span>{post.reading_time} min read</span>
              </>
            )}
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">By Ibiam Iheanyi Victory</span>
          </div>
        </motion.div>

        {post.cover_image && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="mt-8 overflow-hidden rounded-2xl border border-border-light dark:border-border-dark">
            <img src={post.cover_image} alt={post.title} loading="eager" decoding="async" width="1200" height="630" className="w-full object-cover" />
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-12">
          <LiquidGlass className="rounded-2xl p-6 sm:p-8" intensity="subtle">
            <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed text-text-muted-light dark:text-text-muted-dark whitespace-pre-line">
              {post.content}
            </div>
          </LiquidGlass>
        </motion.div>

        {/* Related reading links */}
        <div className="mt-12 border-t border-border-light dark:border-border-dark pt-8">
          <p className="text-sm font-semibold text-text-muted-light dark:text-text-muted-dark mb-4">Share this article</p>
          <div className="flex gap-3">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(postUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border-light dark:border-border-dark px-4 py-2 text-xs font-medium transition-colors hover:bg-surface-secondary-light dark:hover:bg-surface-secondary-dark"
              aria-label="Share on X"
            >
              X / Twitter
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border-light dark:border-border-dark px-4 py-2 text-xs font-medium transition-colors hover:bg-surface-secondary-light dark:hover:bg-surface-secondary-dark"
              aria-label="Share on LinkedIn"
            >
              LinkedIn
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${post.title} ${postUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border-light dark:border-border-dark px-4 py-2 text-xs font-medium transition-colors hover:bg-surface-secondary-light dark:hover:bg-surface-secondary-dark"
              aria-label="Share on WhatsApp"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}
