import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate, cn } from '@/lib/utils'
import type { Testimonial } from '@/lib/types'

type EditorMode = 'create' | 'edit' | null

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [editorMode, setEditorMode] = useState<EditorMode>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const loadTestimonials = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false })
      setTestimonials((data || []) as Testimonial[])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadTestimonials() }, [loadTestimonials])

  const handleDelete = async (id: string) => {
    await supabase.from('testimonials').delete().eq('id', id)
    setDeleteId(null)
    loadTestimonials()
  }

  const handleToggleFeatured = async (t: Testimonial) => {
    await supabase.from('testimonials').update({ featured: !t.featured }).eq('id', t.id)
    loadTestimonials()
  }

  const filtered = testimonials.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.company.toLowerCase().includes(search.toLowerCase())
  )

  const featuredCount = testimonials.filter(t => t.featured).length

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white/90">Testimonials</h1>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-white/40">{testimonials.length} total · {featuredCount} featured</p>
        </div>
        <button onClick={() => { setEditorMode('create'); setEditId(null) }} className="w-full sm:w-auto admin-btn-primary">
          New Testimonial
        </button>
      </div>

      <div className="mb-4">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or company..." className="w-full sm:max-w-xs admin-input" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7700ff] border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center rounded-2xl p-12 text-center admin-glass">
          <p className="text-sm text-gray-500 dark:text-white/40">
            {search ? 'No testimonials match your search.' : 'No testimonials yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(t => (
            <div key={t.id} className="rounded-2xl p-4 transition-all hover:scale-[1.002] admin-glass">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {t.avatar ? (
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full">
                      <img src={t.avatar} alt="" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7700ff]/10 text-sm font-medium text-[#7700ff] dark:text-[#ad66ff]">
                      {t.name[0]}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-gray-900 dark:text-white/90">{t.name}</span>
                      {t.featured && (
                        <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Featured</span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500 dark:text-white/40">
                      <span>{t.role}{t.company ? ` at ${t.company}` : ''}</span>
                      <span>·</span>
                      <span>{formatDate(t.created_at)}</span>
                      <span>·</span>
                      <span className="text-amber-500">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-gray-400 dark:text-white/30">{t.content}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button onClick={() => handleToggleFeatured(t)}
                    className={cn('rounded-lg px-2.5 py-1.5 text-xs transition-colors',
                      t.featured
                        ? 'text-amber-600 hover:bg-amber-500/10 dark:text-amber-400'
                        : 'text-gray-500 hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5'
                    )}
                    title={t.featured ? 'Unfeature' : 'Feature'}>
                    {t.featured ? '★' : '☆'}
                  </button>
                  <button onClick={() => { setEditorMode('edit'); setEditId(t.id) }}
                    className="rounded-lg px-2.5 py-1.5 text-xs text-gray-500 transition-colors hover:bg-black/5 hover:text-gray-700 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white/80">Edit</button>
                  <button onClick={() => setDeleteId(t.id)}
                    className="rounded-lg px-2.5 py-1.5 text-xs text-red-500 transition-colors hover:bg-red-500/10">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editorMode && (
        <TestimonialEditor testimonialId={editId} onClose={() => { setEditorMode(null); setEditId(null) }}
          onSaved={() => { setEditorMode(null); setEditId(null); loadTestimonials() }} />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-sm rounded-2xl p-6 admin-glass-strong">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white/90">Delete Testimonial</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-white/40">Are you sure? This cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="rounded-xl px-4 py-2 text-sm text-gray-500 transition-colors hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TestimonialEditor({ testimonialId, onClose, onSaved }: { testimonialId: string | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [company, setCompany] = useState('')
  const [content, setContent] = useState('')
  const [avatar, setAvatar] = useState('')
  const [rating, setRating] = useState(5)
  const [featured, setFeatured] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (testimonialId) {
      supabase.from('testimonials').select('*').eq('id', testimonialId).single().then(({ data }) => {
        if (!data) return
        setName(data.name || '')
        setRole(data.role || '')
        setCompany(data.company || '')
        setContent(data.content || '')
        setAvatar(data.avatar || '')
        setRating(data.rating || 5)
        setFeatured(data.featured || false)
      })
    }
  }, [testimonialId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !content.trim()) return
    setSaving(true)
    const payload = {
      name: name.trim(), role: role.trim(), company: company.trim(),
      content: content.trim(), avatar, rating, featured,
    }
    if (testimonialId) {
      await supabase.from('testimonials').update(payload).eq('id', testimonialId)
    } else {
      await supabase.from('testimonials').insert({ ...payload, created_at: new Date().toISOString() })
    }
    setSaving(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-8">
      <div className="relative w-full max-w-2xl rounded-2xl p-6 admin-glass-strong">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white/90">
            {testimonialId ? 'Edit Testimonial' : 'New Testimonial'}
          </h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-500 hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full admin-input" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Avatar</label>
              <div className="flex gap-2">
                <input type="text" value={avatar} onChange={(e) => setAvatar(e.target.value)} className="flex-1 admin-input" placeholder="Image URL or upload" />
                <button type="button" onClick={async () => { try { const { uploadToCloudinary } = await import('@/lib/utils'); const url = await uploadToCloudinary(); if (url) setAvatar(url) } catch { /* silent */ } }} className="shrink-0 rounded-xl bg-[#7700ff] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[#9900ff]">Upload</button>
              </div>
              {avatar && (
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full">
                    <img src={avatar} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  </div>
                  <span className="truncate text-xs text-gray-500 dark:text-white/40">{avatar}</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Role</label>
              <input type="text" value={role} onChange={(e) => setRole(e.target.value)} className="w-full admin-input" placeholder="CEO" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Company</label>
              <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full admin-input" placeholder="Acme Inc." />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Content</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} className="w-full admin-input" placeholder="Testimonial content..." />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button" onClick={() => setRating(n)}
                    className={cn('text-lg transition-colors', n <= rating ? 'text-amber-500' : 'text-gray-300 dark:text-white/20')}>
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[#7700ff] focus:ring-[#7700ff] dark:border-white/20" />
                <span className="text-sm text-gray-700 dark:text-white/70">Featured</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm text-gray-500 transition-colors hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5">Cancel</button>
            <button type="submit" disabled={saving || !name.trim() || !content.trim()} className="admin-btn-primary">
              {saving ? 'Saving...' : testimonialId ? 'Save Changes' : 'Create Testimonial'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
