import { useState, useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Skeleton } from '@/components/ui/Skeleton'
import { SEOBreadcrumbs } from '@/components/ui/SEOBreadcrumbs'
import { cn } from '@/lib/utils'
import { getProducts, getFeaturedProducts, getProductsByType } from '@/lib/commerce-queries'
import type { Product } from '@/lib/commerce-types'
import ProductCard from '@/components/shop/ProductCard'
import { Meta } from '@/lib/meta'
import { SITE_URL } from '@/lib/seo'

const label = 'text-[11px] font-semibold tracking-[0.2em] uppercase'

const filterCategories = [
  { slug: 'all', label: 'All Products' },
  { slug: 'digital', label: 'Digital' },
  { slug: 'physical', label: 'Merch' },
  { slug: 'bundle', label: 'Bundles' },
]

const services = [
  'Photography',
  'Photo Editing',
  'Video Production',
  'Graphic Design',
  'Development',
  'AI Enthusiast',
]

export default function Shop() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [bundles, setBundles] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const bannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([
      getFeaturedProducts(),
      getProducts(),
      getProductsByType('bundle').catch(() => [] as Product[]),
    ])
      .then(([featuredData, allData, bundleData]) => {
        setFeatured(featuredData)
        setAllProducts(allData.filter(p => !p.featured))
        setBundles(bundleData)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const bestSellers = useMemo(() => {
    let filtered = allProducts
    if (filter !== 'all') filtered = filtered.filter(p => p.type === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || p.short_description?.toLowerCase().includes(q))
    }
    return filtered.slice(0, 4)
  }, [allProducts, filter, search])

  const newReleases = useMemo(() => {
    let items = [...allProducts]
    items.sort((a, b) => {
      const da = a.created_at ? new Date(a.created_at).getTime() : 0
      const db = b.created_at ? new Date(b.created_at).getTime() : 0
      return db - da
    })
    if (filter !== 'all') items = items.filter(p => p.type === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(p => p.title.toLowerCase().includes(q) || p.short_description?.toLowerCase().includes(q))
    }
    return items.slice(0, 4)
  }, [allProducts, filter, search])

  const filteredBundles = useMemo(() => {
    if (filter !== 'all' && filter !== 'bundle') return []
    if (search.trim()) {
      const q = search.toLowerCase()
      return bundles.filter(p => p.title.toLowerCase().includes(q))
    }
    return bundles.slice(0, 3)
  }, [bundles, filter, search])

  const hasResults = bestSellers.length > 0 || newReleases.length > 0 || filteredBundles.length > 0

  return (
    <main className="min-h-screen bg-surface-light text-text-light dark:bg-surface-dark dark:text-text-dark overflow-hidden">

      <Meta
        title="Shop"
        description="Discover digital products, merch, and bundles from Gifted. Premium creative assets, templates, and tools for creators."
        keywords={['shop', 'digital products', 'merch', 'templates', 'creative assets', 'bundles', 'gifted store']}
        breadcrumbs={[{ name: 'Shop', path: '/shop' }]}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Gifted Store',
          description: 'Digital products, merch, and bundles from Gifted.',
          url: `${SITE_URL}/shop`,
        }}
      />

      {/* ── Minimal Header ── */}
      <section className="px-6 pt-28 pb-6">
        <div className="mx-auto max-w-6xl">
          <SEOBreadcrumbs items={[{ name: 'Shop', path: '/shop' }]} className="mb-4" />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl font-bold sm:text-5xl lg:text-6xl">
              Gifted <span className="text-gradient">Store</span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-gray-500 dark:text-white/50">
              Creative Tools, Resources &amp; Merch
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Search & Filter Bar ── */}
      <section className="sticky top-0 z-30 border-b border-black/[0.04] dark:border-white/[0.06] bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] pl-9 pr-4 py-2.5 text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 transition-all"
              />
            </div>
            <div className="flex gap-1 overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
              {filterCategories.map(c => (
                <button
                  key={c.slug}
                  onClick={() => setFilter(c.slug)}
                  className={cn(
                    'whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-medium transition-all',
                    filter === c.slug
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-gray-500 dark:text-white/50 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className={cn(label, 'text-amber-500 dark:text-amber-400')}>Featured</span>
              <h2 className="font-display text-xl font-bold sm:text-2xl mt-1 text-gray-900 dark:text-white/90">
                Editor&apos;s Picks
              </h2>
            </div>
            {featured.length > 0 && (
              <Link to="/shop/digital-products" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                View All
              </Link>
            )}
          </div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/8 text-brand-500">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                </div>
                <p className="text-sm text-gray-500 dark:text-white/50">No featured products yet.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Animated Services Banner ── */}
      <section ref={bannerRef} className="relative overflow-hidden h-[140px] sm:h-[160px] bg-black/[0.02] dark:bg-white/[0.02] border-y border-black/[0.04] dark:border-white/[0.06]">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0">
          <motion.div className="absolute top-1/2 left-1/4 h-[200px] w-[200px] rounded-full bg-brand-500/8 blur-[100px]"
            animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute top-1/2 right-1/4 h-[150px] w-[150px] rounded-full bg-gold-500/6 blur-[80px]"
            animate={{ scale: [1.1, 1, 1.1], x: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
        </div>

        <div className="relative z-10 h-full flex items-center px-6 sm:px-10">
          <div className="mx-auto max-w-6xl w-full flex items-center justify-between gap-6">
            {/* Left: Headline */}
            <div className="shrink-0">
              <p className="text-xs font-semibold text-gray-400 dark:text-white/40 uppercase tracking-[0.15em] mb-0.5">Need Something Custom?</p>
              <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900 dark:text-white/90 whitespace-nowrap">
                I Build <span className="text-gradient">Anything</span>
              </h3>
            </div>

            {/* Center: Rotating service names */}
            <div className="flex-1 overflow-hidden">
              <motion.div
                className="flex gap-6 sm:gap-10"
                animate={{ x: ['0%', '-50%'] }}
                transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
              >
                {[...services, ...services].map((s, i) => (
                  <span
                    key={`${s}-${i}`}
                    className="whitespace-nowrap font-display text-sm sm:text-base font-bold text-gray-300 dark:text-white/[0.12] tracking-wide hover:text-brand-500/40 dark:hover:text-brand-400/40 transition-colors duration-300 cursor-default select-none"
                  >
                    {s}
                    <span className="mx-6 sm:mx-10 text-gray-200 dark:text-white/[0.06]">/</span>
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right: CTA */}
            <div className="shrink-0">
              <Link
                to="/projects"
                className="group inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 dark:bg-brand-400/10 px-4 py-2 text-xs font-semibold text-brand-600 dark:text-brand-400 transition-all duration-300 hover:bg-brand-500/20 dark:hover:bg-brand-400/20 hover:shadow-sm active:scale-[0.97]"
              >
                View Projects
                <svg className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Subtle bottom accent line */}
        <motion.div className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-brand-500/30 dark:via-brand-400/30 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{ width: '60%' }}
        />
      </section>

      {/* ── New Arrivals ── */}
      {newReleases.length > 0 && (
        <section className="px-6 py-14">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6">
              <span className={cn(label, 'text-brand-500 dark:text-brand-400')}>New</span>
              <h2 className="font-display text-xl font-bold sm:text-2xl mt-1 text-gray-900 dark:text-white/90">
                New Arrivals
              </h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {newReleases.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Best Sellers ── */}
      {bestSellers.length > 0 && (
        <section className="px-6 py-14 bg-surface-secondary-light dark:bg-surface-secondary-dark">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6">
              <span className={cn(label, 'text-brand-500 dark:text-brand-400')}>Popular</span>
              <h2 className="font-display text-xl font-bold sm:text-2xl mt-1 text-gray-900 dark:text-white/90">
                Best Sellers
              </h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {bestSellers.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Bundles ── */}
      {filteredBundles.length > 0 && (
        <section className="px-6 py-14">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6">
              <span className={cn(label, 'text-purple-500 dark:text-purple-400')}>Value</span>
              <h2 className="font-display text-xl font-bold sm:text-2xl mt-1 text-gray-900 dark:text-white/90">
                Bundles
              </h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBundles.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── No Results ── */}
      {!loading && !hasResults && (search || filter !== 'all') && (
        <div className="px-6 py-20 text-center">
          <p className="text-sm text-gray-500 dark:text-white/50">No products match your search.</p>
        </div>
      )}

      {/* ── Partner Programme CTA ── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="rounded-3xl border border-brand-500/10 bg-gradient-to-br from-brand-500/[0.04] via-transparent to-brand-500/[0.02] p-10 sm:p-14">
            <span className={cn(label, 'text-brand-600 dark:text-brand-400')}>Earn with Gifted</span>
            <h2 className="font-display text-2xl font-bold sm:text-3xl mt-2 text-gray-900 dark:text-white/90">
              Join the Partner Programme
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-gray-600 dark:text-white/50">
              Earn up to 20% commission on every sale. Get your referral link, share it with your audience, and start earning today.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/shop/partners/apply"
                className="rounded-full bg-brand-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600 hover:shadow-brand-500/30"
              >
                Become a Partner
              </Link>
              <Link
                to="/shop/partners"
                className="rounded-full border border-brand-500/20 bg-brand-500/[0.06] px-8 py-3 text-sm font-semibold text-brand-600 dark:text-brand-400 transition hover:bg-brand-500/10"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
