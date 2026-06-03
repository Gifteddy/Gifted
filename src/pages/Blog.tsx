import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { LiquidGlass } from '@/components/ui/LiquidGlass'
import { Skeleton } from '@/components/ui/Skeleton'
import type { BlogPost } from '@/lib/types'
import { formatDate } from '@/lib/utils'

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { getBlogPosts } = await import('@/lib/queries')
        const data = await getBlogPosts()
        setPosts(data)
      } catch { /* silent */ } finally { setLoading(false) }
    }
    load()
  }, [])

  return (
    <section className="relative min-h-screen px-4 pt-32 pb-24">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="mb-12 text-center">
          <span className="mb-4 block text-xs font-semibold tracking-widest uppercase text-brand-500 dark:text-brand-400">Blog</span>
          <h1 className="font-display text-4xl font-bold sm:text-5xl lg:text-6xl">Thoughts & <span className="text-gradient">Insights</span></h1>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-border-light dark:border-border-dark">
              <Skeleton className="aspect-video w-full" />
              <div className="space-y-2 p-5"><Skeleton className="h-3 w-24" /><Skeleton className="h-5 w-full" /><Skeleton className="h-4 w-4/5" /></div>
            </div>
          )) : posts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.05 }}>
              <Link to={`/blog/${post.slug}`}>
                <LiquidGlass className="group overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02]" intensity="medium">
                  <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-brand-500/10 to-gold-500/10">
                    {post.cover_image ? <img src={post.cover_image} alt={post.title} className="h-full w-full object-cover" />
                      : <span className="text-4xl opacity-30">📝</span>}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 text-xs text-text-muted-light dark:text-text-muted-dark">
                      <span>{formatDate(post.created_at)}</span>
                      {post.reading_time && <span>· {post.reading_time} min read</span>}
                    </div>
                    <h3 className="mt-2 text-lg font-semibold transition-colors group-hover:text-brand-500">{post.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-text-muted-light dark:text-text-muted-dark">{post.excerpt}</p>
                  </div>
                </LiquidGlass>
              </Link>
            </motion.div>
          ))}
        </div>

        {!loading && posts.length === 0 && (
          <div className="text-center">
            <p className="text-text-muted-light dark:text-text-muted-dark">No blog posts yet. Check back soon!</p>
          </div>
        )}
      </div>
    </section>
  )
}
