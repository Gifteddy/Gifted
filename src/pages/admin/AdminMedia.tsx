import { useEffect, useState, useCallback } from 'react'

declare global {
  interface Window {
    cloudinary: {
      openUploadWidget: (
        options: Record<string, unknown>,
        callback: (error: unknown, result: { event: string; info: { secure_url: string; public_id: string; resource_type: string } }) => void
      ) => void
    }
  }
}

interface CloudinaryResource {
  public_id: string
  secure_url: string
  format: string
  resource_type: string
  width: number
  height: number
  bytes: number
  created_at: string
  tags: string[]
  context?: {
    custom?: {
      cover?: string
    }
  }
}

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || ''
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || ''
const JUNE_2026 = new Date('2026-06-01T00:00:00Z').getTime()

export default function AdminMedia() {
  const [media, setMedia] = useState<CloudinaryResource[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewType, setPreviewType] = useState<string>('image')
  const [previewItem, setPreviewItem] = useState<CloudinaryResource | null>(null)
  const [coverPickerOpen, setCoverPickerOpen] = useState(false)

  const loadMedia = useCallback(async () => {
    setLoading(true)
    try {
      if (!cloudName) {
        setMedia([])
        return
      }
      const types = ['image', 'video', 'raw']
      const results: CloudinaryResource[] = []
      for (const t of types) {
        const res = await fetch(`/api/cloudinary/resources/${t}?max_results=100&context=true&tags=true`)
        if (res.ok) {
          const data = await res.json()
          if (data.resources) results.push(...data.resources)
        }
      }
      results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setMedia(results)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadMedia() }, [loadMedia])

  const handleDelete = async (item: CloudinaryResource) => {
    try {
      const rt = item.resource_type || 'image'
      const res = await fetch(`/api/cloudinary/resources/${rt}/destroy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_ids: [item.public_id], type: 'upload' }),
      })
      if (res.ok) loadMedia()
    } catch {
      // silent
    }
  }

  const openUploadWidget = () => {
    if (!window.cloudinary) {
      const script = document.createElement('script')
      script.src = 'https://upload-widget.cloudinary.com/global/all.js'
      script.async = true
      script.onload = () => openWidget()
      document.body.appendChild(script)
    } else {
      openWidget()
    }
  }

  const openWidget = () => {
    if (!cloudName || !uploadPreset) return
    window.cloudinary.openUploadWidget(
      {
        cloudName,
        uploadPreset,
        sources: ['local', 'url', 'camera'],
        multiple: true,
        maxFiles: 10,
        tags: ['gifted-portfolio'],
      },
      (_error, result) => {
        if (result.event === 'success') {
          loadMedia()
        }
      }
    )
  }

  const handleSetCover = async (videoPublicId: string, coverUrl: string) => {
    try {
      await fetch('/api/cloudinary/resources/video/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_ids: [videoPublicId],
          context: `cover=${encodeURIComponent(coverUrl)}`,
          type: 'upload',
        }),
      })
      setCoverPickerOpen(false)
      setPreviewItem(null)
      setPreviewUrl(null)
      loadMedia()
    } catch {
      // silent
    }
  }

  const filtered = media.filter(m => {
    const created = new Date(m.created_at).getTime()
    if (created < JUNE_2026) return false
    if (!search) return true
    return m.public_id.toLowerCase().includes(search.toLowerCase())
  })

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const isVideo = (item: CloudinaryResource) =>
    item.resource_type === 'video' || ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(item.format)

  const isImage = (item: CloudinaryResource) =>
    item.resource_type === 'image' || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(item.format)

  const thumbnailUrl = (item: CloudinaryResource) => {
    const cover = item.context?.custom?.cover
    if (cover) return cover.replace('/upload/', '/upload/w_400/')
    if (isImage(item)) return item.secure_url.replace('/upload/', '/upload/w_400/')
    if (isVideo(item)) return item.secure_url.replace('/upload/', '/upload/w_400/so_0/')
    return ''
  }

  const images = media.filter(m => isImage(m))

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white/90">Media</h1>
        <button onClick={openUploadWidget} disabled={!cloudName || !uploadPreset} className="admin-btn-primary">
          Upload Media
        </button>
      </div>

      {!cloudName && (
        <div className="mb-6 flex items-center justify-center rounded-2xl p-6 text-center admin-glass">
          <p className="text-sm text-amber-500">Cloudinary not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env</p>
        </div>
      )}

      <div className="mb-4 flex items-center gap-3">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search media..." className="w-full max-w-xs admin-input" />
        <span className="text-xs text-gray-400 dark:text-white/30">{filtered.length} file{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7700ff] border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center rounded-2xl p-12 text-center admin-glass">
          <p className="text-sm text-gray-500 dark:text-white/40">{search ? 'No media found.' : 'No media uploaded yet.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map(item => (
            <div key={item.public_id} className="group relative">
              <button
                onClick={() => { setPreviewUrl(item.secure_url); setPreviewType(item.resource_type); setPreviewItem(item) }}
                className="block w-full overflow-hidden rounded-xl"
                style={{ border: '1px solid rgba(0,0,0,0.06)' }}
              >
                {isImage(item) ? (
                  <img src={thumbnailUrl(item)} alt={item.public_id}
                    className="aspect-square w-full object-cover transition-transform group-hover:scale-105" loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = item.secure_url }} />
                ) : isVideo(item) ? (
                  <div className="relative aspect-square w-full">
                    <img src={thumbnailUrl(item)} alt={item.public_id}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy"
                      onError={(e) => {
                        const el = e.target as HTMLImageElement
                        el.style.display = 'none'
                        const parent = el.parentElement!
                        const fallback = document.createElement('div')
                        fallback.className = 'absolute inset-0 flex items-center justify-center bg-black/10 text-3xl'
                        fallback.textContent = '▶'
                        parent.appendChild(fallback)
                      }} />
                    {!item.context?.custom?.cover && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-sm text-white backdrop-blur-sm">▶</div>
                      </div>
                    )}
                    {item.context?.custom?.cover && (
                      <div className="absolute bottom-1.5 right-1.5 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white backdrop-blur-sm">Cover ✓</div>
                    )}
                  </div>
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center bg-black/[0.02] text-3xl dark:bg-white/[0.02]">📄</div>
                )}
              </button>
              <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                {isVideo(item) && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setPreviewItem(item); setCoverPickerOpen(true) }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7700ff]/80 text-xs text-white backdrop-blur-sm hover:bg-[#7700ff]"
                    title="Set Cover Image">🖼</button>
                )}
                <button onClick={() => handleDelete(item)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/80 text-xs text-white backdrop-blur-sm hover:bg-red-500"
                  title="Delete">✕</button>
              </div>
              <p className="mt-1 truncate px-1 text-xs text-gray-500 dark:text-white/40">{item.public_id.split('/').pop()}</p>
              <div className="flex items-center gap-1.5 px-1">
                <span className="text-[10px] uppercase text-gray-400 dark:text-white/30">{item.format}</span>
                <span className="text-[10px] text-gray-300 dark:text-white/20">·</span>
                <span className="text-[10px] text-gray-400 dark:text-white/30">{formatBytes(item.bytes)}</span>
              </div>
              <p className="px-1 text-[10px] text-gray-400 dark:text-white/30">{formatDate(item.created_at)}</p>
            </div>
          ))}
        </div>
      )}

      {previewUrl && previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => { setPreviewUrl(null); setPreviewItem(null) }}>
          <div className="relative max-h-[90vh] max-w-[90vw]">
            {previewType === 'video' ? (
              <video src={previewUrl} controls autoPlay className="max-h-[85vh] max-w-full rounded-2xl" onClick={(e) => e.stopPropagation()} />
            ) : (
              <img src={previewUrl} alt="Preview" className="max-h-[85vh] rounded-2xl object-contain" onClick={(e) => e.stopPropagation()} />
            )}
            <button onClick={() => { setPreviewUrl(null); setPreviewItem(null) }}
              className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm shadow-lg dark:bg-[#121218]">✕</button>
            {isVideo(previewItem) && (
              <button onClick={(e) => { e.stopPropagation(); setCoverPickerOpen(true) }}
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-xl bg-[#7700ff] px-4 py-2 text-xs font-medium text-white shadow-lg transition-colors hover:bg-[#9900ff] whitespace-nowrap">
                {previewItem.context?.custom?.cover ? 'Change Cover Image' : 'Set Cover Image'}
              </button>
            )}
          </div>
        </div>
      )}

      {coverPickerOpen && previewItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl admin-glass-strong">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white/90">Choose Cover Image for {previewItem.public_id.split('/').pop()}</h3>
              <div className="flex items-center gap-2">
                <button onClick={async () => {
                  try {
                    const { uploadToCloudinary } = await import('@/lib/utils')
                    const url = await uploadToCloudinary()
                    if (url) handleSetCover(previewItem.public_id, url)
                  } catch { /* silent */ }
                }} className="rounded-xl bg-[#7700ff] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#9900ff]">Upload New</button>
                <button onClick={() => setCoverPickerOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-500 hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-4">
              {images.length === 0 ? (
                <p className="py-16 text-center text-sm text-gray-500 dark:text-white/40">No images available. Upload images first.</p>
              ) : (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                  {images.map(img => (
                    <button key={img.public_id} type="button" onClick={() => handleSetCover(previewItem.public_id, img.secure_url)}
                      className="group relative aspect-square overflow-hidden rounded-xl bg-black/10 transition-all hover:ring-2 hover:ring-[#7700ff] dark:bg-white/5">
                      <img src={img.secure_url.replace('/upload/', '/upload/w_200/')} alt="" className="h-full w-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-white/10 p-4">
              <span className="text-xs text-gray-500 dark:text-white/40">{images.length} image{images.length !== 1 ? 's' : ''}</span>
              <div className="flex gap-2">
                <button onClick={() => setCoverPickerOpen(false)} className="rounded-xl px-3 py-1.5 text-xs text-gray-500 transition-colors hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5">Cancel</button>
                <button onClick={() => {
                  // Remove cover: set empty context
                  fetch('/api/cloudinary/resources/video/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ public_ids: [previewItem.public_id], context: '', type: 'upload' }),
                  }).then(() => { setCoverPickerOpen(false); setPreviewItem(null); setPreviewUrl(null); loadMedia() })
                }} className="rounded-xl px-3 py-1.5 text-xs text-red-500 transition-colors hover:bg-red-500/10">Remove Cover</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
