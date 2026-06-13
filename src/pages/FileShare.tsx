import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { FileShare, FileShareItem } from '@/lib/types'

async function sha256(password: string): Promise<string> {
  const data = new TextEncoder().encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

type MediaItem = FileShareItem & { mediaType: 'image' | 'video' | 'document' | 'other' }

function classifyItem(item: FileShareItem): MediaItem['mediaType'] {
  const t = item.type
  if (t.startsWith('image/')) return 'image'
  if (t.startsWith('video/')) return 'video'
  if (t.startsWith('text/') || t.includes('pdf') || t.includes('document') || t.includes('sheet') || t.includes('presentation')) return 'document'
  const ext = item.name.split('.').pop()?.toLowerCase()
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'json', 'xml', 'md'].includes(ext || '')) return 'document'
  return 'other'
}

function fileIcon(item: MediaItem): string {
  if (item.mediaType === 'image') return '🖼️'
  if (item.mediaType === 'video') return '🎬'
  if (item.mediaType === 'document') return '📄'
  return '📎'
}

export default function FileShareViewer() {
  const { token } = useParams<{ token: string }>()
  const [share, setShare] = useState<FileShare | null>(null)
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [pwError, setPwError] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(-1)
  const [checkingPw, setCheckingPw] = useState(false)
  const [testimonial, setTestimonial] = useState({ name: '', role: '', company: '', content: '', rating: 5 })
  const [testimonialSent, setTestimonialSent] = useState(false)
  const [testimonialSubmitting, setTestimonialSubmitting] = useState(false)

  useEffect(() => {
    if (!token) { setLoading(false); setError('Invalid link.'); return }
    const stored = sessionStorage.getItem(`share_${token}`)
    if (stored) setUnlocked(true)
    loadShare()
  }, [token])

  const loadShare = async () => {
    if (!token) return
    try {
      const { data, error: err } = await supabase
        .from('file_shares')
        .select('*')
        .eq('token', token)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .single()
      if (err || !data) { setError('This link is invalid or has expired.'); setLoading(false); return }
      setShare(data as FileShare)
      if (!data.password_hash) setUnlocked(true)
      const { data: itemsData } = await supabase
        .from('file_share_items')
        .select('*')
        .eq('share_id', data.id)
        .order('sort_order', { ascending: true })
      setItems((itemsData || []).map(i => ({ ...i, mediaType: classifyItem(i as FileShareItem) })) as MediaItem[])
    } catch { setError('Failed to load share.') }
    finally { setLoading(false) }
  }

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!share || !token) return
    setCheckingPw(true); setPwError('')
    const hash = await sha256(password)
    const { data } = await supabase
      .from('file_shares')
      .select('id')
      .eq('token', token)
      .eq('password_hash', hash)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single()
    if (data) { setUnlocked(true); sessionStorage.setItem(`share_${token}`, '1') }
    else setPwError('Incorrect password.')
    setCheckingPw(false)
  }

  const handleTestimonial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!testimonial.name.trim() || !testimonial.content.trim()) return
    setTestimonialSubmitting(true)
    try {
      await supabase.from('testimonials').insert([{
        name: testimonial.name.trim(),
        role: testimonial.role.trim(),
        company: testimonial.company.trim(),
        content: testimonial.content.trim(),
        rating: testimonial.rating,
        featured: false,
      }])
      setTestimonialSent(true)
      if (token) sessionStorage.setItem(`testimonial_${token}`, '1')
    } catch { /* silent */ }
    finally { setTestimonialSubmitting(false) }
  }

  const hasSubmitted = token ? sessionStorage.getItem(`testimonial_${token}`) : null
  const images = items.filter(i => i.mediaType === 'image')
  const videos = items.filter(i => i.mediaType === 'video')
  const documents = items.filter(i => i.mediaType === 'document' || i.mediaType === 'other')

  const lightboxImages = images
  const currentImage = lightboxIndex >= 0 ? lightboxImages[lightboxIndex] : null

  const goNext = useCallback(() => {
    setLightboxIndex(i => Math.min(i + 1, lightboxImages.length - 1))
  }, [lightboxImages.length])

  const goPrev = useCallback(() => {
    setLightboxIndex(i => Math.max(i - 1, 0))
  }, [])

  useEffect(() => {
    if (lightboxIndex < 0) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(-1)
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxIndex, goNext, goPrev])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-light dark:bg-surface-dark">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7700ff] border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface-light p-4 dark:bg-surface-dark">
        <div className="w-full max-w-md rounded-2xl border border-border-light p-8 text-center dark:border-border-dark admin-glass-strong">
          <span className="text-4xl">🔗</span>
          <h1 className="mt-4 text-lg font-semibold text-text-light dark:text-text-dark">Link Expired or Invalid</h1>
          <p className="mt-2 text-sm text-text-muted-light dark:text-text-muted-dark">{error}</p>
          <Link to="/" className="mt-6 inline-flex rounded-xl bg-[#7700ff] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#9900ff]">Go Home</Link>
        </div>
      </div>
    )
  }

  if (!unlocked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface-light p-4 dark:bg-surface-dark">
        <div className="w-full max-w-sm rounded-2xl border border-border-light p-8 dark:border-border-dark admin-glass-strong">
          <div className="text-center">
            <span className="text-4xl">🔒</span>
            <h1 className="mt-4 text-lg font-semibold text-text-light dark:text-text-dark">Password Required</h1>
            <p className="mt-1 text-sm text-text-muted-light dark:text-text-muted-dark">Enter the password to access these files.</p>
          </div>
          <form onSubmit={handlePassword} className="mt-6 space-y-4">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password" autoFocus
              className="w-full rounded-xl border border-border-light bg-surface-secondary-light px-4 py-2.5 text-sm text-text-light placeholder:text-text-muted-light/50 focus:border-[#7700ff]/50 focus:outline-none dark:border-border-dark dark:bg-surface-secondary-dark/50 dark:text-text-dark dark:placeholder:text-text-muted-dark/60" />
            {pwError && <p className="text-sm text-red-500 dark:text-red-400">{pwError}</p>}
            <button type="submit" disabled={checkingPw || !password}
              className="w-full rounded-xl bg-[#7700ff] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#9900ff] disabled:opacity-50">
              {checkingPw ? 'Checking...' : 'Unlock'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
      <div className="flex items-center justify-between border-b border-border-light px-6 py-4 dark:border-border-dark">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo-G.png" alt="Gifted" className="h-7 w-7 rounded-lg object-contain" />
          <span className="text-sm font-semibold text-text-light dark:text-text-dark">Gifted</span>
        </Link>
        {share?.label && <span className="truncate pl-4 text-xs text-text-muted-light dark:text-text-muted-dark">{share.label}</span>}
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        {images.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">Photos ({images.length})</h2>
            <div className={cn(
              'grid gap-1.5',
              images.length === 1 ? 'grid-cols-1' :
              images.length === 2 ? 'grid-cols-2' :
              images.length === 3 ? 'grid-cols-2' :
              'grid-cols-2 sm:grid-cols-3'
            )}>
              {images.slice(0, 5).map((img, i) => (
                <button key={img.id} onClick={() => { setLightboxIndex(i); document.body.style.overflow = 'hidden' }}
                  className={cn(
                    'group relative overflow-hidden bg-black/[0.03] dark:bg-white/[0.03]',
                    images.length === 3 && i === 0 ? 'row-span-2 col-span-1' : '',
                    images.length > 5 && i === 4 ? 'relative' : ''
                  )}
                  style={{ aspectRatio: images.length === 1 ? '16/9' : i === 0 && images.length === 3 ? undefined : '1' }}
                >
                  <img src={img.url} alt={img.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  {images.length > 5 && i === 4 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-lg font-semibold text-white">
                      +{images.length - 5}
                    </div>
                  )}
                </button>
              ))}
            </div>
            {images.length > 5 && (
              <div className="mt-1.5 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {images.slice(5).map(img => (
                  <button key={img.id} onClick={() => { const idx = images.indexOf(img); setLightboxIndex(idx); document.body.style.overflow = 'hidden' }}
                    className="group relative overflow-hidden bg-black/[0.03] dark:bg-white/[0.03]" style={{ aspectRatio: '1' }}>
                    <img src={img.url} alt={img.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {videos.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">Videos ({videos.length})</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {videos.map(v => (
                <div key={v.id} className="group relative overflow-hidden rounded-xl bg-black" style={{ aspectRatio: '16/9' }}>
                  <video src={v.url} controls className="h-full w-full" poster={v.url + '#t=0.1'}>
                    <source src={v.url} type={v.type} />
                  </video>
                </div>
              ))}
            </div>
          </section>
        )}

        {documents.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">Files ({documents.length})</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {documents.map(d => (
                <a key={d.id} href={d.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-border-light bg-black/[0.02] p-4 transition-colors hover:bg-black/[0.04] dark:border-border-dark dark:bg-white/[0.03] dark:hover:bg-white/[0.06]">
                  <span className="text-xl">{fileIcon(d)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-text-light/80 dark:text-text-dark/80">{d.name}</p>
                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark">{formatSize(d.size)}</p>
                  </div>
                  <svg className="h-4 w-4 shrink-0 text-text-muted-light dark:text-text-muted-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                </a>
              ))}
            </div>
          </section>
        )}

        {!hasSubmitted && (
          <section className="border-t border-border-light pt-10 dark:border-border-dark">
            <div className="mx-auto max-w-lg text-center">
              <span className="text-3xl">💬</span>
              <h2 className="mt-3 text-lg font-semibold text-text-light dark:text-text-dark">Enjoyed the Files?</h2>
              <p className="mt-1 text-sm text-text-muted-light dark:text-text-muted-dark">Leave a review — it helps others know what to expect.</p>
            </div>
            {testimonialSent ? (
              <div className="mx-auto mt-6 max-w-lg rounded-xl border border-border-light bg-black/[0.02] p-6 text-center dark:border-border-dark dark:bg-white/[0.03]">
                <span className="text-2xl">🙏</span>
                <p className="mt-2 text-sm font-medium text-text-light dark:text-text-dark">Thank you for your review!</p>
              </div>
            ) : (
              <form onSubmit={handleTestimonial} className="mx-auto mt-6 max-w-lg space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <input type="text" value={testimonial.name} onChange={e => setTestimonial(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your Name *" required
                    className="w-full rounded-xl border border-border-light bg-surface-secondary-light px-4 py-2.5 text-sm text-text-light placeholder:text-text-muted-light/50 focus:border-[#7700ff]/50 focus:outline-none dark:border-border-dark dark:bg-surface-secondary-dark/50 dark:text-text-dark dark:placeholder:text-text-muted-dark/60" />
                  <input type="text" value={testimonial.role} onChange={e => setTestimonial(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="Your Role (optional)"
                    className="w-full rounded-xl border border-border-light bg-surface-secondary-light px-4 py-2.5 text-sm text-text-light placeholder:text-text-muted-light/50 focus:border-[#7700ff]/50 focus:outline-none dark:border-border-dark dark:bg-surface-secondary-dark/50 dark:text-text-dark dark:placeholder:text-text-muted-dark/60" />
                </div>
                <input type="text" value={testimonial.company} onChange={e => setTestimonial(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Company (optional)"
                  className="w-full rounded-xl border border-border-light bg-surface-secondary-light px-4 py-2.5 text-sm text-text-light placeholder:text-text-muted-light/50 focus:border-[#7700ff]/50 focus:outline-none dark:border-border-dark dark:bg-surface-secondary-dark/50 dark:text-text-dark dark:placeholder:text-text-muted-dark/60" />
                <textarea value={testimonial.content} onChange={e => setTestimonial(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Your review *" required rows={3}
                  className="w-full resize-none rounded-xl border border-border-light bg-surface-secondary-light px-4 py-2.5 text-sm text-text-light placeholder:text-text-muted-light/50 focus:border-[#7700ff]/50 focus:outline-none dark:border-border-dark dark:bg-surface-secondary-dark/50 dark:text-text-dark dark:placeholder:text-text-muted-dark/60" />
                <div className="flex items-center justify-center gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} type="button" onClick={() => setTestimonial(prev => ({ ...prev, rating: n }))}
                      className={cn('text-xl transition-colors', n <= testimonial.rating ? 'text-amber-500' : 'text-text-muted-light/30 dark:text-text-muted-dark/30')}>
                      ★
                    </button>
                  ))}
                </div>
                <button type="submit" disabled={testimonialSubmitting || !testimonial.name.trim() || !testimonial.content.trim()}
                  className="w-full rounded-xl bg-[#7700ff] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#9900ff] disabled:opacity-50">
                  {testimonialSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </section>
        )}
      </div>

      {lightboxIndex >= 0 && currentImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => { setLightboxIndex(-1); document.body.style.overflow = '' }}>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(-1); document.body.style.overflow = '' }}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
          {lightboxIndex > 0 && (
            <button onClick={(e) => { e.stopPropagation(); goPrev() }}
              className="absolute left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
          )}
          {lightboxIndex < lightboxImages.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); goNext() }}
              className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              style={{ right: '4rem' }}>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          )}
          <img src={currentImage.url} alt={currentImage.name}
            className="max-h-[90vh] max-w-full rounded-lg object-contain" onClick={e => e.stopPropagation()} />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-xs text-white/80">
            {lightboxIndex + 1} / {lightboxImages.length}
          </div>
        </div>
      )}
    </div>
  )
}