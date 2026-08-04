import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { getProductBySlug, getProductsByType } from '@/lib/commerce-queries'
import { useCart } from '@/store/cart'
import { CLOUDINARY_BASE } from '@/lib/images'
import { getCategoryConfig } from '@/lib/product-attributes'
import type { Product, ProductVariant } from '@/lib/commerce-types'
import ProductCard from '@/components/shop/ProductCard'
import { Meta, buildProductSchema } from '@/lib/meta'
import { SEOBreadcrumbs } from '@/components/ui/SEOBreadcrumbs'

const heading = 'font-display text-3xl font-bold leading-[1.1] sm:text-4xl lg:text-5xl'
const sectionHeading = 'font-display text-2xl font-bold leading-[1.15] sm:text-3xl lg:text-4xl'

const trustIndicators = [
  { label: 'Instant Download', icon: '↓' },
  { label: 'Lifetime Access', icon: '∞' },
  { label: 'Updates Included', icon: '↻' },
  { label: 'Secure Checkout', icon: '◈' },
]

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const addItem = useCart(s => s.addItem)
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState(0)
  const [added, setAdded] = useState(false)
  const [categorySlug, setCategorySlug] = useState('')
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError('')
    setCategorySlug('')
    setSelectedVariant(null)
    setQuantity(1)
    getProductBySlug(slug)
      .then((p) => {
        setProduct(p)
        setSelectedImage(0)
        if (p.category_id) {
          supabase.from('product_categories').select('slug').eq('id', p.category_id).single().then(({ data }) => {
            if (data) setCategorySlug(data.slug)
          })
        }
        return getProductsByType(p.type)
      })
      .then((all) => {
        setRelated(all.filter((p) => p.slug !== slug).slice(0, 4))
      })
      .catch(() => setError('Product not found'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <main className="min-h-screen bg-surface-light dark:bg-surface-dark overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pt-32">
          <div className="grid gap-12 lg:grid-cols-2">
            <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
            <div className="space-y-5">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-12 w-44" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-surface-light dark:bg-surface-dark flex items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/8">
            <svg className="h-10 w-10 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </div>
          <h1 className={cn(heading, 'mb-3')}>Product Not Found</h1>
          <p className="text-gray-500 dark:text-white/50 mb-8">{error || 'The product you are looking for does not exist.'}</p>
          <Link to="/shop" className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-7 py-3.5 text-sm font-semibold text-white transition-all duration-500 hover:shadow-xl hover:shadow-brand-500/30">
            Back to Shop
          </Link>
        </div>
      </main>
    )
  }

  const gallery = product.gallery?.length ? product.gallery : [product.thumbnail]
  const mainImage = gallery[selectedImage]?.startsWith('http')
    ? gallery[selectedImage].replace('/upload/', '/upload/f_auto,q_auto/')
    : `${CLOUDINARY_BASE}/f_auto,q_auto/${gallery[selectedImage]}`

  const isDigital = product.type === 'digital'
  const cfg = categorySlug ? getCategoryConfig(categorySlug) : undefined
  const displayAttrs = cfg?.attributes.filter(a => a.key !== 'shipping_required' && a.key !== 'weight') ?? []
  const attrs = product.attributes as Record<string, unknown> | null

  return (
    <main className="min-h-screen bg-surface-light text-text-light dark:bg-surface-dark dark:text-text-dark overflow-hidden">

      <Meta
        title={product.title}
        description={product.short_description || product.description?.slice(0, 160)}
        image={product.thumbnail}
        type="product"
        keywords={[product.title, ...(product.tags ?? []), product.type, 'shop', 'gifted'].filter(Boolean)}
        breadcrumbs={[
          { name: 'Shop', path: '/shop' },
          ...(cfg ? [{ name: cfg.name, path: `/shop/${cfg.type === 'physical' ? 'merch' : 'digital-products'}` }] : []),
          { name: product.title, path: `/shop/${slug}` },
        ]}
        jsonLd={buildProductSchema({
          title: product.title,
          description: product.short_description || product.description || '',
          image: product.thumbnail,
          price: product.price,
          salePrice: product.sale_price,
          currency: 'NGN',
          url: `https://giftedcreates.com/shop/${slug}`,
        })}
      />

      {/* ── Breadcrumb ── */}
      <section className="px-6 pt-28 pb-2">
        <div className="mx-auto max-w-6xl">
          <SEOBreadcrumbs
            items={[
              { name: 'Shop', path: '/shop' },
              ...(cfg ? [{ name: cfg.name, path: `/shop/${cfg.type === 'physical' ? 'merch' : 'digital-products'}` }] : []),
              { name: product.title, path: `/shop/${slug}` },
            ]}
          />
        </div>
      </section>

      {/* ── Hero Section ── */}
      <section className="relative px-6 py-10 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            {/* Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="overflow-hidden rounded-3xl bg-white/50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06]">
                <img
                  src={mainImage}
                  alt={product.title}
                  className="w-full aspect-[4/3] object-cover"
                  decoding="async"
                  loading="eager"
                />
              </div>
              {gallery.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                  {gallery.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={cn(
                        'shrink-0 h-16 w-16 rounded-xl overflow-hidden border-2 transition-all',
                        i === selectedImage
                          ? 'border-brand-500 dark:border-brand-400 opacity-100'
                          : 'border-transparent opacity-50 hover:opacity-80',
                      )}
                    >
                      <img
                        src={img.startsWith('http') ? img.replace('/upload/', '/upload/f_auto,q_auto/') : `${CLOUDINARY_BASE}/f_auto,q_auto/${img}`}
                        alt={`${product.title} thumbnail ${i + 1}`}
                        className="h-full w-full object-cover"
                        decoding="async"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex flex-col justify-center"
            >
              {product.tags?.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-brand-500/8 dark:bg-brand-400/8 px-3 py-1 text-[10px] font-semibold tracking-wider uppercase text-brand-600 dark:text-brand-400">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <h1 className={cn('font-display text-3xl font-bold sm:text-4xl lg:text-5xl', heading)}>
                {product.title}
              </h1>

              {product.short_description && (
                <p className="mt-3 text-base leading-relaxed text-gray-500 dark:text-white/50">
                  {product.short_description}
                </p>
              )}

              <div className="mt-6 flex items-baseline gap-3">
                {product.sale_price ? (
                  <>
                    <span className="font-display text-3xl font-bold text-brand-600 dark:text-brand-400">
                      ₦{product.sale_price.toLocaleString()}
                    </span>
                    <span className="text-lg text-gray-400 dark:text-white/30 line-through">
                      ₦{product.price.toLocaleString()}
                    </span>
                    <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-[10px] font-bold text-red-500">
                      Save ₦{(product.price - product.sale_price).toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="font-display text-3xl font-bold text-gray-900 dark:text-white/90">
                    ₦{product.price.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Trust badges for digital */}
              {isDigital && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {trustIndicators.map(t => (
                    <div key={t.label} className="flex items-center gap-1.5 rounded-full bg-black/[0.03] dark:bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-gray-600 dark:text-white/60">
                      <span className="text-brand-500 dark:text-brand-400">{t.icon}</span>
                      {t.label}
                    </div>
                  ))}
                </div>
              )}

              {/* Dynamic Attributes */}
              {displayAttrs.length > 0 && attrs && (
                <div className="mt-6 space-y-4">
                  {displayAttrs.map(a => {
                    const val = attrs[a.key]
                    if (!val || (Array.isArray(val) && val.length === 0)) return null
                    return (
                      <div key={a.key}>
                        <p className="text-xs font-medium text-gray-500 dark:text-white/50 mb-1.5">{a.label}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {Array.isArray(val) ? (
                            val.map(v => (
                              <span key={v as string} className="rounded-lg bg-black/[0.04] dark:bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-white/70">
                                {v as string}
                              </span>
                            ))
                          ) : a.type === 'boolean' ? (
                            <span className={cn('text-sm font-medium', val ? 'text-green-500' : 'text-gray-400')}>
                              {val ? 'Yes' : 'No'}
                            </span>
                          ) : a.type === 'url' ? (
                            <a href={val as string} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline">
                              {val as string}
                              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" /></svg>
                            </a>
                          ) : (
                            <span className="text-sm font-medium text-gray-900 dark:text-white/90">{val as string}</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Variant Selector */}
              {categorySlug && getCategoryConfig(categorySlug)?.hasVariants && product.variants && product.variants.length > 0 && (() => {
                const sizes = [...new Set(product.variants!.map(v => v.size).filter(Boolean))] as string[]
                const colors = [...new Set(product.variants!.map(v => v.color).filter(Boolean))] as string[]
                const currentSize = selectedVariant?.size
                const currentColor = selectedVariant?.color

                const availableColorsForSize = currentSize
                  ? product.variants!.filter(v => v.size === currentSize && v.stock > 0).map(v => v.color).filter(Boolean) as string[]
                  : colors
                const availableSizesForColor = currentColor
                  ? product.variants!.filter(v => v.color === currentColor && v.stock > 0).map(v => v.size).filter(Boolean) as string[]
                  : sizes

                const selectVariant = (size?: string, color?: string) => {
                  const match = product.variants!.find(v =>
                    (size ? v.size === size : !v.size) &&
                    (color ? v.color === color : !v.color)
                  )
                  setSelectedVariant(match || null)
                }

                return (
                  <div className="mt-6 space-y-5">
                    {sizes.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-white/50 mb-2">Size</p>
                        <div className="flex flex-wrap gap-2">
                          {sizes.map(s => {
                            const disabled = currentColor ? !availableSizesForColor.includes(s) : false
                            return (
                              <button key={s} onClick={() => { selectVariant(s, currentColor); if (!currentColor) setQuantity(1) }}
                                disabled={disabled}
                                className={cn('rounded-xl px-4 py-2 text-xs font-medium transition-all border',
                                  currentSize === s
                                    ? 'border-brand-500 bg-brand-500/8 text-brand-600 dark:text-brand-400 dark:border-brand-400'
                                    : disabled
                                      ? 'border-black/[0.04] dark:border-white/[0.06] opacity-30 cursor-not-allowed'
                                      : 'border-black/[0.06] dark:border-white/[0.08] hover:border-brand-500/30 dark:hover:border-brand-400/30'
                                )}>
                                {s}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    {colors.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-white/50 mb-2">Color</p>
                        <div className="flex flex-wrap gap-2">
                          {colors.map(c => {
                            const disabled = currentSize ? !availableColorsForSize.includes(c) : false
                            return (
                              <button key={c} onClick={() => { selectVariant(currentSize, c); if (!currentSize) setQuantity(1) }}
                                disabled={disabled}
                                className={cn('rounded-xl px-4 py-2 text-xs font-medium transition-all border',
                                  currentColor === c
                                    ? 'border-brand-500 bg-brand-500/8 text-brand-600 dark:text-brand-400 dark:border-brand-400'
                                    : disabled
                                      ? 'border-black/[0.04] dark:border-white/[0.06] opacity-30 cursor-not-allowed'
                                      : 'border-black/[0.06] dark:border-white/[0.08] hover:border-brand-500/30 dark:hover:border-brand-400/30'
                                )}>
                                {c}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    {selectedVariant && (
                      <p className="text-xs text-gray-500 dark:text-white/50">
                        {selectedVariant.stock > 0 ? (
                          <span className="text-green-500">{selectedVariant.stock} in stock</span>
                        ) : (
                          <span className="text-red-400">Out of stock</span>
                        )}
                        {selectedVariant.sku && <span className="ml-3">SKU: {selectedVariant.sku}</span>}
                      </p>
                    )}
                  </div>
                )
              })()}

              {/* Quantity + Add to Cart */}
              <div className="mt-8 border-t border-black/[0.06] dark:border-white/[0.08] pt-8">
                {categorySlug && getCategoryConfig(categorySlug)?.hasVariants && product.variants && product.variants.length > 0 && (
                  <div className="mb-4">
                    <label className="text-xs font-medium text-gray-500 dark:text-white/50">Quantity</label>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/[0.06] dark:border-white/[0.08] text-sm hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors">−</button>
                      <span className="w-8 text-center text-sm font-medium tabular-nums">{quantity}</span>
                      <button type="button" onClick={() => setQuantity(q => q + 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/[0.06] dark:border-white/[0.08] text-sm hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors">+</button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      const variantInfo = selectedVariant ? `${selectedVariant.size ? selectedVariant.size + ' / ' : ''}${selectedVariant.color || ''}`.trim().replace(/\/\s*$/, '') : ''
                      const title = variantInfo ? `${product.title} (${variantInfo})` : product.title
                      const price = selectedVariant?.price_override ?? product.sale_price ?? product.price
                      addItem({ productId: product.id, title, price, type: product.type, thumbnail: product.thumbnail })
                      setAdded(true)
                      setTimeout(() => setAdded(false), 2000)
                    }}
                    className="flex-1 rounded-full border border-black/[0.08] dark:border-white/[0.1] px-7 py-3.5 text-sm font-semibold transition-all duration-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] active:scale-[0.98]"
                  >
                    {added ? (
                      <span className="inline-flex items-center gap-1.5">
                        <svg className="h-4 w-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                        Added to Cart
                      </span>
                    ) : (
                      'Add to Cart'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      const variantInfo = selectedVariant ? `${selectedVariant.size ? selectedVariant.size + ' / ' : ''}${selectedVariant.color || ''}`.trim().replace(/\/\s*$/, '') : ''
                      const title = variantInfo ? `${product.title} (${variantInfo})` : product.title
                      const price = selectedVariant?.price_override ?? product.sale_price ?? product.price
                      addItem({ productId: product.id, title, price, type: product.type, thumbnail: product.thumbnail })
                      navigate('/shop/checkout')
                    }}
                    className="flex-1 rounded-full bg-brand-500 px-7 py-3.5 text-sm font-semibold text-white transition-all duration-500 hover:shadow-xl hover:shadow-brand-500/30 active:scale-[0.98]"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Description Section ── */}
      {product.description && (
        <section className="relative px-6 py-20 sm:py-28">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-light dark:via-border-dark to-transparent" />
          <div className="mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
            >
              <h2 className={sectionHeading}>
                About This{' '}
                <span className="text-gradient">Product</span>
              </h2>
              <div className="mt-6 text-base leading-relaxed text-gray-600 dark:text-white/60 whitespace-pre-line">
                {product.description}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── Technical Details ── */}
      {displayAttrs.length > 0 && attrs && (
        <section className="relative px-6 py-20 sm:py-28 bg-surface-secondary-light dark:bg-surface-secondary-dark">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-light dark:via-border-dark to-transparent" />

          <div className="mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
            >
              <h2 className={sectionHeading}>
                Technical{' '}
                <span className="text-gradient">Details</span>
              </h2>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {displayAttrs.filter(a => a.key !== 'download_type').map(a => {
                  const val = attrs[a.key]
                  if (!val || (Array.isArray(val) && val.length === 0)) return null
                  return (
                    <div key={a.key} className="rounded-2xl bg-white/50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] p-5">
                      <p className="text-xs font-medium text-gray-400 dark:text-white/40 uppercase tracking-wider">{a.label}</p>
                      <p className="mt-1.5 text-sm font-semibold text-gray-900 dark:text-white/90">
                        {Array.isArray(val) ? val.join(', ') : String(val)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── Related Products ── */}
      {related.length > 0 && (
        <section className="relative px-6 py-24 sm:py-32 bg-surface-secondary-light dark:bg-surface-secondary-dark">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-light dark:via-border-dark to-transparent" />

          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              className="mb-14"
            >
              <h2 className={sectionHeading}>
                You May Also{' '}
                <span className="text-gradient">Like</span>
              </h2>
            </motion.div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
