import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getProductsByType } from '@/lib/commerce-queries'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/commerce-types'
import ProductCard from '@/components/shop/ProductCard'
import { SEOBreadcrumbs } from '@/components/ui/SEOBreadcrumbs'
import { Meta } from '@/lib/meta'

const label = 'text-[11px] font-semibold tracking-[0.2em] uppercase'
const heading = 'font-display text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl'

export default function Bundles() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProductsByType('bundle')
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen bg-surface-light text-text-light dark:bg-surface-dark dark:text-text-dark overflow-hidden">
      <Meta
        title="Bundles"
        description="Curated product bundles from Gifted — digital and physical products at an exclusive discount. Save big with creative bundles."
        keywords={['bundles', 'discount bundles', 'creative bundles', 'product bundles', 'gifted bundles', 'save']}
        breadcrumbs={[
          { name: 'Shop', path: '/shop' },
          { name: 'Bundles', path: '/shop/bundles' },
        ]}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Curated Bundles — Gifted Store',
          description: 'Curated collections of digital and physical products at an exclusive discount.',
          url: 'https://giftedcreates.com/shop/bundles',
        }}
      />

      <section className="relative flex min-h-[50vh] items-center justify-center overflow-hidden px-6 pt-24">
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            className="absolute top-1/2 left-1/3 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-brand-500/8 blur-[120px]"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/3 h-[300px] w-[300px] rounded-full bg-gold-500/8 blur-[100px]"
            animate={{ scale: [1.1, 1, 1.1] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="relative z-10 w-full max-w-3xl mx-auto text-center">
          <SEOBreadcrumbs
            items={[
              { name: 'Shop', path: '/shop' },
              { name: 'Bundles', path: '/shop/bundles' },
            ]}
            className="mb-6"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className={cn(label, 'text-brand-500 dark:text-brand-400')}>Bundles</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.12, ease: [0.25, 0.1, 0.25, 1] }}
            className={cn(heading, 'mt-4')}
          >
            Curated <span className="text-gradient">Bundles</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-3 text-sm leading-relaxed text-text-muted-light dark:text-text-muted-dark"
          >
            Curated collections of digital and physical products at an exclusive discount.
          </motion.p>
        </div>
      </section>

      <section className="relative px-6 py-20 sm:py-28">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-light dark:via-border-dark to-transparent" />

        <div className="mx-auto max-w-6xl">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <svg className="mb-4 h-16 w-16 text-text-muted-light/30 dark:text-text-muted-dark/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              <h3 className="font-display text-xl font-bold">No bundles yet</h3>
              <p className="mt-2 text-sm text-text-muted-light dark:text-text-muted-dark">Bundles are being curated.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
