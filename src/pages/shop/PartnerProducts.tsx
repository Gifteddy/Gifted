import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/currency'
import { Meta } from '@/lib/meta'
import { supabase } from '@/lib/supabase'
import { usePartnerStore } from '@/store/partner'
import { buildReferralUrl } from '@/modules/partner/queries'
import { COMMISSION_RATES } from '@/modules/partner/constants'
import { CLOUDINARY_BASE } from '@/lib/images'
import type { Product } from '@/lib/commerce-types'

const typeBadge: Record<string, { label: string; color: string }> = {
  digital: { label: 'Digital', color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' },
  physical: { label: 'Physical', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' },
  bundle: { label: 'Bundle', color: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400' },
}

export default function PartnerProducts() {
  const partner = usePartnerStore((s) => s.partner)
  const loading = usePartnerStore((s) => s.loading)

  const [products, setProducts] = useState<Product[]>([])
  const [fetching, setFetching] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setFetching(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('published', true)
        .order('display_order')
      if (!error && data) setProducts(data as Product[])
      setFetching(false)
    }
    load()
  }, [])

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase())
    const matchType = !filterType || p.type === filterType
    return matchSearch && matchType
  })

  const copyLink = async (product: Product) => {
    if (!partner) return
    const url = buildReferralUrl(partner.referral_code, product.slug)
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const el = document.createElement('textarea')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopiedId(product.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const shareProduct = async (product: Product) => {
    if (!partner) return
    const url = buildReferralUrl(partner.referral_code, product.slug)
    if (navigator.share) {
      try {
        await navigator.share({ title: product.title, text: `Check out ${product.title} on Gifted!`, url })
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url)
      setCopiedId(product.id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const getThumb = (p: Product) => {
    if (p.thumbnail) {
      if (p.thumbnail.startsWith('http')) return p.thumbnail
      return `${CLOUDINARY_BASE}/f_auto,q_auto,w_400/${p.thumbnail}`
    }
    return null
  }

  if (loading || fetching) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="text-4xl">📦</div>
        <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white/90">Partner Account Required</h2>
        <p className="max-w-sm text-sm text-gray-500 dark:text-white/50">Join the partner programme to start promoting products.</p>
      </div>
    )
  }

  return (
    <>
      <Meta title="Products to Promote" description="Browse products and generate referral links" />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white/90 sm:text-3xl">Products to Promote</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-white/50">Browse the catalogue and generate product-specific referral links</p>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 dark:focus:border-brand-400/50 dark:focus:ring-brand-400/10 transition-all text-gray-900 dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-white/30"
            />
          </div>
          <div className="flex gap-2">
            {['', 'digital', 'physical', 'bundle'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={cn(
                  'rounded-xl px-4 py-2 text-xs font-medium transition-all',
                  filterType === t
                    ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/25'
                    : 'border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/[0.06]'
                )}
              >
                {t || 'All'}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/[0.1] dark:border-white/[0.1] py-16 text-center">
            <div className="text-4xl">🔍</div>
            <p className="mt-3 font-display text-lg font-semibold text-gray-900 dark:text-white/90">No products found</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-white/50">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product) => {
              const thumb = getThumb(product)
              const rate = COMMISSION_RATES[product.type] || 0.10
              const commission = product.price * rate
              const badge = typeBadge[product.type] || typeBadge.digital

              return (
                <div
                  key={product.id}
                  className="group rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-4 transition-all hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20"
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 dark:bg-white/[0.03]">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={product.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-4xl">📦</span>
                      </div>
                    )}
                    <span className={cn('absolute left-2 top-2 rounded-lg px-2 py-0.5 text-[10px] font-semibold', badge.color)}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="mt-3">
                    <h3 className="font-display text-sm font-semibold text-gray-900 dark:text-white/90 line-clamp-1">{product.title}</h3>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900 dark:text-white/90">{formatCurrency(product.price)}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-gray-500 dark:text-white/40">
                      <span>{Math.round(rate * 100)}% commission</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        Earn {formatCurrency(commission)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => copyLink(product)}
                      className={cn(
                        'flex-1 rounded-xl py-2 text-xs font-medium transition-all',
                        copiedId === product.id
                          ? 'bg-green-500 text-white'
                          : 'bg-brand-500 text-white hover:bg-brand-600 active:scale-[0.97]'
                      )}
                    >
                      {copiedId === product.id ? '✓ Link Copied' : 'Generate Link'}
                    </button>
                    <button
                      onClick={() => shareProduct(product)}
                      className="shrink-0 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-3 py-2 text-xs font-medium text-gray-600 dark:text-white/60 transition-all hover:bg-gray-100 dark:hover:bg-white/[0.06]"
                    >
                      Share
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
