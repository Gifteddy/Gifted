import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Meta } from '@/lib/meta'
import { getMarketingAssets } from '@/modules/partner/queries'
import { MARKETPLACE_CATEGORIES } from '@/modules/partner/constants'
import type { MarketingAsset } from '@/modules/partner/types'

const fileTypeIcons: Record<string, string> = {
  image: '🖼️',
  video: '🎬',
  pdf: '📄',
  zip: '📦',
  doc: '📝',
  link: '🔗',
}

function getFileTypeIcon(type: string | null) {
  if (!type) return '📄'
  const lower = type.toLowerCase()
  if (lower.includes('image') || lower.includes('png') || lower.includes('jpg') || lower.includes('jpeg') || lower.includes('svg')) return fileTypeIcons.image
  if (lower.includes('video') || lower.includes('mp4') || lower.includes('mov')) return fileTypeIcons.video
  if (lower.includes('pdf')) return fileTypeIcons.pdf
  if (lower.includes('zip') || lower.includes('rar')) return fileTypeIcons.zip
  if (lower.includes('doc') || lower.includes('txt')) return fileTypeIcons.doc
  return '📄'
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function PartnerResources() {
  const [assets, setAssets] = useState<MarketingAsset[]>([])
  const [fetching, setFetching] = useState(true)
  const [activeCategory, setActiveCategory] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      setFetching(true)
      try {
        const data = await getMarketingAssets(activeCategory || undefined)
        setAssets(data)
      } catch { /* silent */ }
      setFetching(false)
    }
    load()
  }, [activeCategory])

  const filtered = assets.filter((a) =>
    !search || a.title.toLowerCase().includes(search.toLowerCase()) || (a.description || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Meta title="Marketing Resources" description="Download marketing assets for your campaigns" />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white/90 sm:text-3xl">Marketing Resources</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-white/50">Professional assets to power your promotions</p>
        </div>

        <div className="mb-6 relative">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 dark:focus:border-brand-400/50 dark:focus:ring-brand-400/10 transition-all text-gray-900 dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-white/30"
          />
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveCategory('')}
            className={cn(
              'shrink-0 rounded-xl px-4 py-2 text-xs font-medium transition-all',
              activeCategory === ''
                ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/25'
                : 'border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/[0.06]'
            )}
          >
            All
          </button>
          {MARKETPLACE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'shrink-0 rounded-xl px-4 py-2 text-xs font-medium transition-all',
                activeCategory === cat.id
                  ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/25'
                  : 'border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/[0.06]'
              )}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {fetching ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/[0.1] dark:border-white/[0.1] py-16 text-center">
            <div className="text-4xl">📁</div>
            <p className="mt-3 font-display text-lg font-semibold text-gray-900 dark:text-white/90">No resources found</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-white/50">
              {search ? 'Try a different search term' : 'Marketing assets will appear here soon'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((asset) => {
              const category = MARKETPLACE_CATEGORIES.find((c) => c.id === asset.category)
              const icon = getFileTypeIcon(asset.file_type)

              return (
                <div
                  key={asset.id}
                  className="group rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] overflow-hidden transition-all hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20"
                >
                  {asset.thumbnail_url ? (
                    <div className="aspect-video overflow-hidden bg-gray-100 dark:bg-white/[0.03]">
                      <img
                        src={asset.thumbnail_url}
                        alt={asset.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-video items-center justify-center bg-gray-50 dark:bg-white/[0.02]">
                      <span className="text-4xl">{icon}</span>
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-sm font-semibold text-gray-900 dark:text-white/90 line-clamp-1">{asset.title}</h3>
                      {category && (
                        <span className="shrink-0 rounded-lg bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                          {category.icon} {category.label}
                        </span>
                      )}
                    </div>

                    {asset.description && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-white/40 line-clamp-2">{asset.description}</p>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-white/30">
                        <span>{icon} {asset.file_type || 'File'}</span>
                        {asset.file_size && <span>· {formatFileSize(asset.file_size)}</span>}
                      </div>
                      <a
                        href={asset.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl bg-brand-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-brand-500/25 transition-all hover:bg-brand-600 hover:shadow-brand-500/40 active:scale-[0.97]"
                      >
                        Download
                      </a>
                    </div>
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
