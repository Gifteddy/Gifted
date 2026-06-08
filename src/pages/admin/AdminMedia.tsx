import { useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

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
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<CloudinaryResource | null>(null)
  const [deleting, setDeleting] = useState<Set<string>>(new Set())
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [batchDeleteConfirm, setBatchDeleteConfirm] = useState(false)

  const notify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3500)
  }

  const toggleSelect = (publicId: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(publicId)) next.delete(publicId)
      else next.add(publicId)
      return next
    })
  }

  const selectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map(m => m.public_id)))
    }
  }

  const clearSelection = () => setSelected(new Set())

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

  const confirmDelete = (item: CloudinaryResource) => {
    setDeleteConfirmItem(item)
  }

  const destroyFile = async (publicId: string, resourceType: string): Promise<boolean> => {
    const rt = resourceType || 'image'
    const res = await fetch(`/api/cloudinary/${rt}/destroy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_id: publicId, type: 'upload' }),
    })
    return res.ok
  }

  const handleDelete = async () => {
    const item = deleteConfirmItem
    if (!item) return
    setDeleting(prev => new Set(prev).add(item.public_id))
    try {
      const ok = await destroyFile(item.public_id, item.resource_type)
      if (ok) {
        notify('success', `"${item.public_id.split('/').pop()}" deleted`)
        setDeleteConfirmItem(null)
        setSelected(prev => { const n = new Set(prev); n.delete(item.public_id); return n })
        loadMedia()
      } else {
        notify('error', 'Failed to delete file')
      }
    } catch {
      notify('error', 'Network error — could not delete file')
    } finally {
      setDeleting(prev => {
        const next = new Set(prev)
        next.delete(item.public_id)
        return next
      })
    }
  }

  const handleBatchDelete = async () => {
    const ids = Array.from(selected)
    if (!ids.length) return
    setBatchDeleteConfirm(false)
    for (const id of ids) setDeleting(prev => new Set(prev).add(id))
    try {
      let deleted = 0
      for (const id of ids) {
        const item = media.find(m => m.public_id === id)
        const ok = await destroyFile(id, item?.resource_type || 'image')
        if (ok) deleted++
      }
      if (deleted > 0) {
        notify('success', `${deleted} file${deleted !== 1 ? 's' : ''} deleted`)
        setSelected(new Set())
        loadMedia()
      }
      if (deleted !== ids.length) {
        notify('error', `${ids.length - deleted} file${ids.length - deleted !== 1 ? 's' : ''} failed to delete`)
      }
    } catch {
      notify('error', 'Network error — could not delete files')
    } finally {
      setDeleting(new Set())
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

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search media..." className="w-full sm:max-w-xs admin-input" />
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 dark:text-white/30">{filtered.length} file{filtered.length !== 1 ? 's' : ''}</span>
          {filtered.length > 0 && (
            <button onClick={selectAll} className="text-xs text-gray-400 transition-colors hover:text-[#7700ff] dark:text-white/40 dark:hover:text-[#ad66ff]">
              {selected.size === filtered.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>
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
        <>
        {selected.size > 0 && (
          <div className="mb-3 flex items-center gap-3 rounded-2xl bg-[#7700ff]/10 px-4 py-2.5 text-sm dark:bg-[#9233ff]/15">
            <span className="text-xs font-medium text-[#7700ff] dark:text-[#ad66ff]">{selected.size} selected</span>
            <div className="flex-1" />
            <button onClick={() => setBatchDeleteConfirm(true)}
              className="flex items-center gap-1.5 rounded-xl bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-600">
              Delete Selected
            </button>
            <button onClick={clearSelection}
              className="rounded-xl px-3 py-1.5 text-xs text-gray-400 transition-colors hover:bg-black/[0.04] dark:text-white/40 dark:hover:bg-white/[0.06]">
              Clear
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map(item => {
            const isSelected = selected.has(item.public_id)
            return (
            <div key={item.public_id} className={cn('group relative', isSelected && 'ring-2 ring-[#7700ff] rounded-xl dark:ring-[#ad66ff]')}>
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

              <button onClick={(e) => { e.stopPropagation(); toggleSelect(item.public_id) }}
                className={cn(
                  'absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-lg border-2 backdrop-blur-sm transition-all',
                  isSelected
                    ? 'border-[#7700ff] bg-[#7700ff] dark:border-[#ad66ff] dark:bg-[#ad66ff]'
                    : 'border-white/60 bg-black/20 hover:border-white'
                )}>
                {isSelected && (
                  <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                )}
              </button>

              <div className="absolute right-2 top-2 flex gap-1 max-sm:opacity-100 opacity-0 transition-opacity group-hover:opacity-100">
                {isVideo(item) && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setPreviewItem(item); setCoverPickerOpen(true) }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7700ff]/80 text-xs text-white backdrop-blur-sm hover:bg-[#7700ff]"
                    title="Set Cover Image">🖼</button>
                )}
                <button onClick={(e) => { e.stopPropagation(); confirmDelete(item) }} disabled={deleting.has(item.public_id)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/80 text-xs text-white backdrop-blur-sm hover:bg-red-500 disabled:opacity-40"
                  title="Delete">{deleting.has(item.public_id) ? '⋯' : '✕'}</button>
              </div>
              <p className="mt-1 truncate px-1 text-xs text-gray-500 dark:text-white/40">{item.public_id.split('/').pop()}</p>
              <div className="flex items-center gap-1.5 px-1">
                <span className="text-[10px] uppercase text-gray-400 dark:text-white/30">{item.format}</span>
                <span className="text-[10px] text-gray-300 dark:text-white/20">·</span>
                <span className="text-[10px] text-gray-400 dark:text-white/30">{formatBytes(item.bytes)}</span>
              </div>
              <p className="px-1 text-[10px] text-gray-400 dark:text-white/30">{formatDate(item.created_at)}</p>
            </div>
            )
          })}
        </div>
        </>
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

      {deleteConfirmItem && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={() => !deleting.has(deleteConfirmItem.public_id) && setDeleteConfirmItem(null)}>
          <div className="w-full max-w-md overflow-hidden rounded-2xl admin-glass-strong" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white/90">Delete Media</h3>
              <p className="text-sm text-gray-500 dark:text-white/50">
                Are you sure you want to delete <span className="font-medium text-gray-700 dark:text-white/80">&ldquo;{deleteConfirmItem.public_id.split('/').pop()}&rdquo;</span>?
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-white/30">This action cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-2 border-t border-white/10 p-4">
              <button onClick={() => setDeleteConfirmItem(null)} disabled={deleting.has(deleteConfirmItem.public_id)}
                className="rounded-xl px-4 py-2 text-xs text-gray-500 transition-colors hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5 disabled:opacity-40">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting.has(deleteConfirmItem.public_id)}
                className="rounded-xl bg-red-500 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50">
                {deleting.has(deleteConfirmItem.public_id) ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {batchDeleteConfirm && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/50 p-4" onClick={() => !deleting.size && setBatchDeleteConfirm(false)}>
          <div className="w-full max-w-md overflow-hidden rounded-2xl admin-glass-strong" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white/90">Delete {selected.size} file{selected.size !== 1 ? 's' : ''}</h3>
              <p className="text-sm text-gray-500 dark:text-white/50">
                Are you sure you want to delete the {selected.size} selected file{selected.size !== 1 ? 's' : ''}?
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-white/30">This action cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-2 border-t border-white/10 p-4">
              <button onClick={() => setBatchDeleteConfirm(false)} disabled={!!deleting.size}
                className="rounded-xl px-4 py-2 text-xs text-gray-500 transition-colors hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5 disabled:opacity-40">
                Cancel
              </button>
              <button onClick={handleBatchDelete} disabled={!!deleting.size}
                className="rounded-xl bg-red-500 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50">
                {deleting.size ? 'Deleting...' : `Delete ${selected.size}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div className={cn(
          'fixed bottom-6 right-6 z-[80] rounded-2xl px-5 py-3 text-sm font-medium shadow-lg backdrop-blur-md transition-all',
          notification.type === 'success'
            ? 'bg-green-500/90 text-white'
            : 'bg-red-500/90 text-white'
        )}>
          {notification.message}
        </div>
      )}
    </div>
  )
}
