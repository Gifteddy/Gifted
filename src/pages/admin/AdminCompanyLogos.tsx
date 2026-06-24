import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { CompanyLogo } from '@/lib/types'

export default function AdminCompanyLogos() {
  const [logos, setLogos] = useState<CompanyLogo[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)

  const loadLogos = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('company_logos')
        .select('*')
        .order('sort_order', { ascending: true })
      setLogos((data || []) as CompanyLogo[])
    } catch { } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadLogos() }, [loadLogos])

  const handleDelete = async (id: string) => {
    await supabase.from('company_logos').delete().eq('id', id)
    setDeleteId(null)
    loadLogos()
  }

  const handleDragStart = (id: string) => setDragId(id)

  const handleDrop = async (targetId: string) => {
    if (!dragId || dragId === targetId) { setDragId(null); return }
    const fromIndex = logos.findIndex(l => l.id === dragId)
    const toIndex = logos.findIndex(l => l.id === targetId)
    if (fromIndex === -1 || toIndex === -1) { setDragId(null); return }
    const reordered = [...logos]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, moved)
    const updated = reordered.map((l, i) => ({ ...l, sort_order: i }))
    setLogos(updated)
    setDragId(null)
    await supabase.from('company_logos').upsert(updated.map(l => ({ id: l.id, sort_order: l.sort_order })))
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white/90">Company Logos</h1>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-white/40">{logos.length} logos</p>
        </div>
        <button onClick={() => { setShowEditor(true); setEditId(null) }} className="w-full sm:w-auto admin-btn-primary">
          Add Logo
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7700ff] border-t-transparent" />
        </div>
      ) : logos.length === 0 ? (
        <div className="flex items-center justify-center rounded-2xl p-12 text-center admin-glass">
          <p className="text-sm text-gray-500 dark:text-white/40">No company logos yet. Add your first one!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logos.map(logo => (
            <div
              key={logo.id}
              draggable
              onDragStart={() => handleDragStart(logo.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(logo.id)}
              className={`rounded-2xl p-4 transition-all hover:scale-[1.002] admin-glass ${dragId === logo.id ? 'opacity-50' : ''}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <span className="cursor-grab text-gray-400 dark:text-white/30 text-sm">⠿</span>
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white/50 dark:bg-white/10 flex items-center justify-center p-1.5">
                    <img src={logo.url} alt={logo.name} className="h-full w-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white/90">{logo.name}</span>
                    <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-white/40">{logo.url}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button onClick={() => { setShowEditor(true); setEditId(logo.id) }}
                    className="rounded-lg px-2.5 py-1.5 text-xs text-gray-500 transition-colors hover:bg-black/5 hover:text-gray-700 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white/80">Edit</button>
                  <button onClick={() => setDeleteId(logo.id)}
                    className="rounded-lg px-2.5 py-1.5 text-xs text-red-500 transition-colors hover:bg-red-500/10">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showEditor && (
        <LogoEditor logoId={editId} onClose={() => { setShowEditor(false); setEditId(null) }}
          onSaved={() => { setShowEditor(false); setEditId(null); loadLogos() }} />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-sm rounded-2xl p-6 admin-glass-strong">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white/90">Delete Logo</h3>
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

function LogoEditor({ logoId, onClose, onSaved }: { logoId: string | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (logoId) {
      supabase.from('company_logos').select('*').eq('id', logoId).single().then(({ data }) => {
        if (!data) return
        setName(data.name || '')
        setUrl(data.url || '')
      })
    }
  }, [logoId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !url.trim()) return
    setSaving(true)
    if (logoId) {
      await supabase.from('company_logos').update({ name: name.trim(), url: url.trim() }).eq('id', logoId)
    } else {
      const { data: max } = await supabase.from('company_logos').select('sort_order').order('sort_order', { ascending: false }).limit(1).single()
      const nextOrder = (max?.sort_order ?? -1) + 1
      await supabase.from('company_logos').insert({ name: name.trim(), url: url.trim(), sort_order: nextOrder })
    }
    setSaving(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-8">
      <div className="relative w-full max-w-lg rounded-2xl p-6 admin-glass-strong">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white/90">
            {logoId ? 'Edit Logo' : 'Add Logo'}
          </h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-500 hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Company Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full admin-input" placeholder="Acme Corp" required />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Logo URL</label>
            <div className="flex gap-2">
              <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1 admin-input" placeholder="https://example.com/logo.png" required />
              <button type="button" onClick={async () => { try { const { uploadToCloudinary } = await import('@/lib/utils'); const url = await uploadToCloudinary(); if (url) setUrl(url) } catch { } }} className="shrink-0 rounded-xl bg-[#7700ff] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[#9900ff]">Upload</button>
            </div>
            {url && (
              <div className="mt-2 flex items-center gap-3">
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-white/50 dark:bg-white/10 flex items-center justify-center p-1">
                  <img src={url} alt="" className="h-full w-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </div>
                <span className="truncate text-xs text-gray-500 dark:text-white/40">{url}</span>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm text-gray-500 transition-colors hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5">Cancel</button>
            <button type="submit" disabled={saving || !name.trim() || !url.trim()} className="admin-btn-primary">
              {saving ? 'Saving...' : logoId ? 'Save Changes' : 'Add Logo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}