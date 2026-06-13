import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import JSZip from 'jszip'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { FileShare, FileShareItem, FileShareComment } from '@/lib/types'

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

async function downloadBlob(url: string, filename: string) {
  const res = await fetch(url)
  const blob = await res.blob()
  const blobUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(blobUrl), 10000)
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
  const [comments, setComments] = useState<FileShareComment[]>([])
  const [downloadingAll, setDownloadingAll] = useState(false)

  const [commentForms, setCommentForms] = useState<Record<string, { name: string; content: string }>>({})
  const [submittingComment, setSubmittingComment] = useState<string | null>(null)

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

      const [{ data: itemsData }, { data: commentsData }] = await Promise.all([
        supabase.from('file_share_items').select('*').eq('share_id', data.id).order('sort_order', { ascending: true }),
        supabase.from('file_share_comments').select('*').eq('share_id', data.id).order('created_at', { ascending: true }),
      ])
      setItems((itemsData || []).map(i => ({ ...i, mediaType: classifyItem(i as FileShareItem) })) as MediaItem[])
      setComments((commentsData || []) as FileShareComment[])
    } catch { setError('Failed to load share.') }
    finally { setLoading(false) }
  }

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!share || !token) return
    setCheckingPw(true); setPwError('')
    const hash = await sha256(password)
    const { data } = await supabase
      .from('file_shares').select('id').eq('token', token)
      .eq('password_hash', hash).eq('is_active', true)
      .gt('expires_at', new Date().toISOString()).single()
    if (data) { setUnlocked(true); sessionStorage.setItem(`share_${token}`, '1') }
    else setPwError('Incorrect password.')
    setCheckingPw(false)
  }

  const handleDownloadAll = async () => {
    setDownloadingAll(true)
    try {
      const zip = new JSZip()
      for (const item of items) {
        const res = await fetch(item.url)
        const blob = await res.blob()
        zip.file(item.name, blob)
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const zipUrl = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = zipUrl
      a.download = `${share?.label || 'files'}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(zipUrl), 10000)
    } catch { /* silent */ }
    finally { setDownloadingAll(false) }
  }

  const handleComment = async (itemId: string | null) => {
    const key = itemId ?? '_general'
    const form = commentForms[key]
    if (!share || !form?.name.trim() || !form?.content.trim()) return
    setSubmittingComment(key)
    try {
      const { error: err } = await supabase.from('file_share_comments').insert([{
        share_id: share.id,
        item_id: itemId,
        author_name: form.name.trim(),
        content: form.content.trim(),
      }])
      if (!err) {
        setComments(prev => [...prev, {
          id: crypto.randomUUID(),
          share_id: share.id,
          item_id: itemId,
          author_name: form.name.trim(),
          content: form.content.trim(),
          created_at: new Date().toISOString(),
        }])
        setCommentForms(prev => ({ ...prev, [key]: { name: prev[key]?.name || '', content: '' } }))
      }
    } catch { /* silent */ }
    finally { setSubmittingComment(null) }
  }

  const hasSubmitted = token ? sessionStorage.getItem(`testimonial_${token}`) : null

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

  const setFormField = (itemId: string | null, field: 'name' | 'content', value: string) => {
    const key = itemId ?? '_general'
    setCommentForms(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }))
  }

  const itemComments = (itemId: string) => comments.filter(c => c.item_id === itemId)
  const generalComments = comments.filter(c => !c.item_id)

  const images = items.filter(i => i.mediaType === 'image')
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
      if (e.key === 'Escape') { setLightboxIndex(-1); document.body.style.overflow = '' }
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
      <div className="flex items-center justify-between border-b border-border-light px-4 py-3 sm:px-6 sm:py-4 dark:border-border-dark">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo-G.png" alt="Gifted" className="h-7 w-7 rounded-lg object-contain" />
          <span className="text-sm font-semibold text-text-light dark:text-text-dark">Gifted</span>
        </Link>
        <div className="flex items-center gap-2">
          {share?.label && <span className="hidden sm:block truncate max-w-40 text-xs text-text-muted-light dark:text-text-muted-dark">{share.label}</span>}
          {items.length > 1 && (
            <button onClick={handleDownloadAll} disabled={downloadingAll}
              className="flex items-center gap-1.5 rounded-xl bg-[#7700ff] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#9900ff] disabled:opacity-50 sm:px-4 sm:py-2">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
              {downloadingAll ? 'Zipping...' : 'Download All'}
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        {share && (share.label || share.description) && (
          <div className="mb-8 text-center">
            {share.label && <h1 className="text-xl font-semibold text-text-light dark:text-text-dark sm:text-2xl">{share.label}</h1>}
            {share.description && <p className="mx-auto mt-2 max-w-2xl text-sm text-text-muted-light dark:text-text-muted-dark">{share.description}</p>}
          </div>
        )}

        {items.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-text-muted-light dark:text-text-muted-dark">No files in this share.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(item => (
              <FileCard
                key={item.id}
                item={item}
                comments={itemComments(item.id)}
                lightboxIndex={lightboxImages.indexOf(item as unknown as MediaItem)}
                onOpenLightbox={(idx) => { setLightboxIndex(idx); document.body.style.overflow = 'hidden' }}
                onDownload={() => downloadBlob(item.url, item.name)}
                commentForm={commentForms[item.id] || { name: '', content: '' }}
                onCommentField={(field, val) => setFormField(item.id, field, val)}
                onCommentSubmit={() => handleComment(item.id)}
                submittingComment={submittingComment === item.id}
              />
            ))}
          </div>
        )}

        <section className="mt-12 border-t border-border-light pt-8 dark:border-border-dark">
          <div className="mx-auto max-w-lg">
            <h2 className="text-center text-sm font-medium text-text-light dark:text-text-dark">Comments</h2>
            <p className="mt-1 text-center text-xs text-text-muted-light dark:text-text-muted-dark">Share your thoughts on these files.</p>
            <CommentForm
              form={commentForms['_general'] || { name: '', content: '' }}
              onField={(field, val) => setFormField(null, field, val)}
              onSubmit={() => handleComment(null)}
              submitting={submittingComment === '_general'}
            />
            {generalComments.length > 0 && (
              <div className="mt-6 space-y-3">
                {generalComments.map(c => (
                  <div key={c.id} className="rounded-xl border border-border-light bg-black/[0.02] p-4 dark:border-border-dark dark:bg-white/[0.03]">
                    <p className="text-xs font-medium text-text-light dark:text-text-dark">{c.author_name}</p>
                    <p className="mt-1 text-sm text-text-muted-light dark:text-text-muted-dark">{c.content}</p>
                    <p className="mt-1 text-[10px] text-text-muted-light/60 dark:text-text-muted-dark/50">{new Date(c.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {!hasSubmitted && (
          <section className="mt-10 border-t border-border-light pt-8 dark:border-border-dark">
            <div className="mx-auto max-w-lg text-center">
              <span className="text-3xl">⭐</span>
              <h2 className="mt-3 text-lg font-semibold text-text-light dark:text-text-dark">Enjoyed What You Saw?</h2>
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

        <div className="mt-12 rounded-2xl border border-border-light bg-gradient-to-br from-[#7700ff]/5 to-transparent p-8 text-center dark:border-border-dark dark:from-[#9233ff]/10 sm:p-12">
          <span className="text-3xl">✨</span>
          <h2 className="mt-3 text-lg font-semibold text-text-light dark:text-text-dark">Want to See More?</h2>
          <p className="mt-2 text-sm text-text-muted-light dark:text-text-muted-dark">Explore my portfolio and discover more projects like this one.</p>
          <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#7700ff] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#9900ff]">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            View My Portfolio
          </Link>
        </div>
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

function FileCard({ item, comments, lightboxIndex, onOpenLightbox, onDownload, commentForm, onCommentField, onCommentSubmit, submittingComment }: {
  item: MediaItem
  comments: FileShareComment[]
  lightboxIndex: number
  onOpenLightbox: (idx: number) => void
  onDownload: () => void
  commentForm: { name: string; content: string }
  onCommentField: (field: 'name' | 'content', value: string) => void
  onCommentSubmit: () => void
  submittingComment: boolean
}) {
  const [showComments, setShowComments] = useState(false)

  return (
    <div className="overflow-hidden rounded-2xl border border-border-light bg-black/[0.02] dark:border-border-dark dark:bg-white/[0.03]">
      <div className="aspect-[4/3] overflow-hidden bg-black/[0.03] dark:bg-white/[0.03]">
        {item.mediaType === 'image' ? (
          <button onClick={() => onOpenLightbox(lightboxIndex)} className="group relative h-full w-full">
            <img src={item.url} alt={item.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          </button>
        ) : item.mediaType === 'video' ? (
          <video src={item.url} controls className="h-full w-full" poster={item.url + '#t=0.1'}>
            <source src={item.url} type={item.type} />
          </video>
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl">{fileIcon(item)}</span>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4">
        <p className="truncate text-sm font-medium text-text-light dark:text-text-dark" title={item.name}>{item.name}</p>
        <p className="mt-0.5 text-xs text-text-muted-light dark:text-text-muted-dark">{formatSize(item.size)}</p>

        <div className="mt-3 flex items-center gap-2">
          <button onClick={onDownload}
            className="flex items-center gap-1.5 rounded-lg bg-[#7700ff]/10 px-3 py-1.5 text-xs font-medium text-[#7700ff] transition-colors hover:bg-[#7700ff]/20 dark:text-[#ad66ff] dark:hover:bg-[#ad66ff]/20">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
            Download
          </button>
          <button onClick={() => setShowComments(!showComments)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              showComments
                ? 'bg-[#7700ff]/10 text-[#7700ff] dark:text-[#ad66ff]'
                : 'bg-black/[0.04] text-text-muted-light hover:bg-black/[0.08] dark:bg-white/[0.06] dark:text-text-muted-dark dark:hover:bg-white/[0.1]'
            )}>
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
            {comments.length > 0 ? `${comments.length}` : 'Comment'}
          </button>
        </div>

        {showComments && (
          <div className="mt-3 space-y-3 border-t border-border-light pt-3 dark:border-border-dark">
            {comments.length > 0 && (
              <div className="space-y-2">
                {comments.map(c => (
                  <div key={c.id} className="rounded-lg bg-black/[0.03] p-2.5 dark:bg-white/[0.03]">
                    <p className="text-xs font-medium text-text-light dark:text-text-dark">{c.author_name}</p>
                    <p className="mt-0.5 text-xs text-text-muted-light dark:text-text-muted-dark">{c.content}</p>
                  </div>
                ))}
              </div>
            )}
            <CommentForm
              form={commentForm}
              onField={onCommentField}
              onSubmit={onCommentSubmit}
              submitting={submittingComment}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function CommentForm({ form, onField, onSubmit, submitting }: {
  form?: { name: string; content: string }
  onField: (field: 'name' | 'content', value: string) => void
  onSubmit: () => void
  submitting: boolean
}) {
  const f = { name: '', content: '', ...form }
  return (
    <div className="space-y-2">
      <input type="text" value={f.name} onChange={e => onField('name', e.target.value)}
        placeholder="Your Name" required
        className="w-full rounded-lg border border-border-light bg-surface-secondary-light px-3 py-1.5 text-xs text-text-light placeholder:text-text-muted-light/50 focus:border-[#7700ff]/50 focus:outline-none dark:border-border-dark dark:bg-surface-secondary-dark/50 dark:text-text-dark dark:placeholder:text-text-muted-dark/60" />
      <textarea value={f.content} onChange={e => onField('content', e.target.value)}
        placeholder="Write a comment..." required rows={2}
        className="w-full resize-none rounded-lg border border-border-light bg-surface-secondary-light px-3 py-1.5 text-xs text-text-light placeholder:text-text-muted-light/50 focus:border-[#7700ff]/50 focus:outline-none dark:border-border-dark dark:bg-surface-secondary-dark/50 dark:text-text-dark dark:placeholder:text-text-muted-dark/60" />
      <button onClick={onSubmit} disabled={submitting || !f.name.trim() || !f.content.trim()}
        className="w-full rounded-lg bg-[#7700ff] py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#9900ff] disabled:opacity-50">
        {submitting ? 'Posting...' : 'Post Comment'}
      </button>
    </div>
  )
}