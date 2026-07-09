import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getProductsByType } from '@/lib/commerce-queries'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/commerce-types'
import ProductCard from '@/components/shop/ProductCard'

const label = 'text-[11px] font-semibold tracking-[0.2em] uppercase'
const heading = 'font-display text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl'

export default function DigitalProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProductsByType('digital')
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen bg-surface-light text-text-light dark:bg-surface-dark dark:text-text-dark overflow-hidden">

      {/* Hero */}
      <section className="relative flex min-h-[50vh] items-center justify-center overflow-hidden px-6 pt-24">
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            className="absolute top-1/3 left-1/4 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-brand-500/10 blur-[120px]"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="relative z-10 w-full max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className={cn(label, 'text-brand-500 dark:text-brand-400')}>Digital Products</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.12, ease: [0.25, 0.1, 0.25, 1] }}
            className={cn(heading, 'mt-4')}
          >
            Digital <span className="text-gradient">Products</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-3 text-sm leading-relaxed text-text-muted-light dark:text-text-muted-dark"
          >
            Templates, presets, assets, and creative tools delivered instantly to your inbox.
          </motion.p>
        </div>
      </section>

      {/* Product Grid */}
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
              <svg className="mb-4 h-16 w-16 text-text-muted-light/30 dark:text-text-muted-dark/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <h3 className="font-display text-xl font-bold">No digital products yet</h3>
              <p className="mt-2 text-sm text-text-muted-light dark:text-text-muted-dark">Check back soon for new releases.</p>
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
