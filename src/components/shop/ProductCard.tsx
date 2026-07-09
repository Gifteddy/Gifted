import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { CLOUDINARY_BASE } from '@/lib/images'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/commerce-types'

interface ProductCardProps {
  product: Product
  index?: number
  featured?: boolean
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [categoryName, setCategoryName] = useState('')

  useEffect(() => {
    if (!product.category_id) return
    supabase.from('product_categories').select('name').eq('id', product.category_id).single().then(({ data }) => {
      if (data) setCategoryName(data.name)
    })
  }, [product.category_id])

  const thumbnailUrl = product.thumbnail?.startsWith('http')
    ? product.thumbnail.replace('/upload/', '/upload/f_auto,q_auto/')
    : `${CLOUDINARY_BASE}/f_auto,q_auto/${product.thumbnail}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Link to={`/shop/product/${product.slug}`} className="group block">
        <div className="relative overflow-hidden rounded-3xl bg-white/50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] transition-all duration-500 hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_8px_40px_-12px_rgba(119,0,255,0.15)] hover:-translate-y-0.5">
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={thumbnailUrl}
              alt={product.title}
              className="h-full w-full object-cover transition-all duration-700 group-hover:scale-[1.03]"
              loading="lazy"
            />
          </div>
          <div className="p-4 sm:p-5">
            <div className="mb-1.5 flex items-center gap-2">
              <span className={cn(
                'rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize',
                product.type === 'physical'
                  ? 'bg-gold-500/10 text-gold-600 dark:text-gold-400'
                  : product.type === 'bundle'
                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    : 'bg-brand-500/8 text-brand-600 dark:text-brand-400/70'
              )}>
                {product.type === 'physical' ? 'Merch' : product.type === 'bundle' ? 'Bundle' : 'Digital'}
              </span>
              {categoryName && (
                <span className="text-[10px] text-gray-400 dark:text-white/40 truncate">{categoryName}</span>
              )}
            </div>
            <h3 className="font-display text-sm font-bold leading-snug text-gray-900 dark:text-white/90 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {product.title}
            </h3>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-baseline gap-1.5">
                {product.sale_price ? (
                  <>
                    <span className="font-display text-base font-bold text-brand-600 dark:text-brand-400">
                      ₦{product.sale_price.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-white/30 line-through">
                      ₦{product.price.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="font-display text-base font-bold text-gray-900 dark:text-white/90">
                    ₦{product.price.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
