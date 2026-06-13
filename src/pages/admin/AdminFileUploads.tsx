import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import type { FileUploadLink, FileUpload } from '@/lib/types'

const DURATION_PRESETS = [
  { label: '1 Hour', minutes: 60 },
  { label: '6 Hours', minutes: 360 },
  { label: '24 Hours', minutes: 1440 },
  { label: '3 Days', minutes: 4320 },
  { label: '7 Days', minutes: 10080 },
  { label: '30 Days', minutes: 43200 },
]

function formatExpiry(date: string) {
  const d = new Date(date)
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  if (diff <= 0) return 'Expired'
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  if (hours > 48) return `${Math.floor(hours / 24)}d remaining`
  if (hours > 0) return `${hours}h ${minutes}m remaining`
  return `${minutes}m remaining`
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(0)} MB`
}

function FileIcon({ type, name }: { type: string; name: string }) {
  if (type.startsWith('image/')) return <span className="text-sm">🖼️</span>
  if (type.startsWith('video/')) return <span className="text-sm">🎬</span>
  if (type.startsWith('audio/')) return <span className="text-sm">🎵</span>
  if (type.startsWith('text/') || type.includes('document') || name.endsWith('.doc') || name.endsWith('.docx') || name.endsWith('.pdf')) return <span className="text-sm">📄</span>
  if (type.includes('spreadsheet') || name.endsWith('.xls') || name.endsWith('.xlsx') || name.endsWith('.csv')) return <span className="text-sm">📊</span>
  if (type.includes('zip') || type.includes('rar') || type.includes('tar') || type.includes('7z')) return <span className="text-sm">📦</span>
  return <span className="text-sm">📎</span>
}

export default function AdminFileUploads() {
  const [links, setLinks] = useState<FileUploadLink[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [expandedLink, setExpandedLink] = useState<string | null>(null)
  const [uploads, setUploads] = useState<Record<string, FileUpload[]>>({})

  const loadLinks = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase.from('file_upload_links').select('*').order('created_at', { ascending: false })
      setLinks((data || []) as FileUploadLink[])
    } catch { /* silent */ } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadLinks() }, [loadLinks])

  const handleDelete = async (id: string) => {
    await supabase.from('file_upload_links').delete().eq('id', id)
    setDeleteId(null)
    loadLinks()
  }

  const toggleExpand = async (id: string) => {
    if (expandedLink === id) { setExpandedLink(null); return }
    setExpandedLink(id)
    if (!uploads[id]) {
      const { data } = await supabase.from('file_uploads').select('*').eq('link_id', id).order('created_at', { ascending: false })
      setUploads(prev => ({ ...prev, [id]: (data || []) as FileUpload[] }))
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white/90">File Uploads</h1>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-white/40">{links.length} link{links.length !== 1 ? 's' : ''} generated</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="w-full sm:w-auto admin-btn-primary">
          Generate New Link
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7700ff] border-t-transparent" />
        </div>
      ) : links.length === 0 ? (
        <div className="flex items-center justify-center rounded-2xl p-12 text-center admin-glass">
          <div className="max-w-sm">
            <p className="text-3xl mb-3">🔗</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white/90">No upload links yet</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-white/40">Generate a link to share with clients so they can send you files.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map(link => {
            const isExpired = new Date(link.expires_at) <= new Date()
            const url = `${window.location.origin}/upload/${link.token}`
            return (
              <div key={link.id} className="rounded-2xl overflow-hidden admin-glass">
                <div className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-gray-900 dark:text-white/90">
                          {link.label || 'Untitled Link'}
                        </span>
                        {isExpired ? (
                          <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">Expired</span>
                        ) : (
                          <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-white/40">
                        <span>Expires {formatDate(link.expires_at)}</span>
                        <span>·</span>
                        <span>{formatExpiry(link.expires_at)}</span>
                        <span>·</span>
                        <span>{link.upload_count} upload{link.upload_count !== 1 ? 's' : ''}{link.max_total_uploads ? `/ ${link.max_total_uploads}` : ''}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <code className="flex-1 truncate rounded-lg bg-black/[0.03] px-2.5 py-1.5 text-xs text-gray-500 dark:bg-white/[0.03] dark:text-white/40 font-mono">{url}</code>
                        <button onClick={() => { navigator.clipboard.writeText(url); const btn = document.activeElement; if (btn) { const orig = btn.textContent; btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = orig }, 1500) } }}
                          className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#7700ff] transition-colors hover:bg-[#7700ff]/10 dark:text-[#ad66ff] dark:hover:bg-[#ad66ff]/10">
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button onClick={() => toggleExpand(link.id)}
                        className="rounded-lg px-2.5 py-1.5 text-xs text-gray-500 transition-colors hover:bg-black/5 hover:text-gray-700 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white/80">
                        {expandedLink === link.id ? 'Hide' : `${(uploads[link.id]?.length ?? 0) > 0 ? `View (${uploads[link.id]!.length})` : 'View'}`}
                      </button>
                      <button onClick={() => setDeleteId(link.id)}
                        className="rounded-lg px-2.5 py-1.5 text-xs text-red-500 transition-colors hover:bg-red-500/10">Delete</button>
                    </div>
                  </div>
                </div>

                {expandedLink === link.id && (
                  <div className="border-t border-black/[0.04] dark:border-white/[0.04]">
                    <UploadList linkId={link.id} uploads={uploads[link.id]} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showCreate && (
        <CreateLinkModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); loadLinks() }} />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-sm rounded-2xl p-6 admin-glass-strong">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white/90">Delete Upload Link</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-white/40">This will also delete all uploaded files. Are you sure?</p>
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

function UploadList({ linkId, uploads: initial }: { linkId: string; uploads?: FileUpload[] }) {
  const [uploads, setUploads] = useState<FileUpload[] | undefined>(initial)
  const [loading, setLoading] = useState(!initial)

  useEffect(() => {
    if (!uploads) {
      supabase.from('file_uploads').select('*').eq('link_id', linkId).order('created_at', { ascending: false }).then(({ data }) => {
        setUploads((data || []) as FileUpload[])
        setLoading(false)
      })
    }
  }, [linkId, uploads])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#7700ff] border-t-transparent" />
      </div>
    )
  }

  if (!uploads || uploads.length === 0) {
    return (
      <div className="px-4 pb-4 pt-3">
        <p className="text-center text-xs text-gray-500 dark:text-white/30">No files uploaded yet.</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
      {uploads.map(u => (
        <div key={u.id} className="p-4">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7700ff]/10 text-xs font-medium text-[#7700ff] dark:text-[#ad66ff]">
              {u.sender_name[0]?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium text-gray-900 dark:text-white/90">{u.sender_name}</span>
                <span className="text-xs text-gray-500 dark:text-white/40">{formatDate(u.created_at)}</span>
              </div>
              {u.sender_email && (
                <a href={`mailto:${u.sender_email}`} className="text-xs text-[#7700ff] hover:underline dark:text-[#ad66ff]">{u.sender_email}</a>
              )}
            </div>
          </div>
          {u.message && (
            <p className="mt-2 text-xs text-gray-600 dark:text-white/60 line-clamp-2">{u.message}</p>
          )}
          <div className="mt-2 space-y-1">
            {(u.files as { name: string; url: string; size: number; type: string }[]).map((f, i) => (
              <a key={i} href={f.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-black/[0.04] bg-black/[0.02] px-3 py-1.5 text-xs transition-colors hover:bg-black/[0.04] dark:border-white/[0.04] dark:bg-white/[0.02] dark:hover:bg-white/[0.04]">
                <FileIcon type={f.type} name={f.name} />
                <span className="min-w-0 flex-1 truncate text-gray-700 dark:text-white/70">{f.name}</span>
                <span className="shrink-0 text-gray-400 dark:text-white/40">{formatFileSize(f.size)}</span>
                <svg className="h-3.5 w-3.5 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" /></svg>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function CreateLinkModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [label, setLabel] = useState('')
  const [duration, setDuration] = useState(1440)
  const [maxFiles, setMaxFiles] = useState(5)
  const [maxUploads, setMaxUploads] = useState('')
  const [maxSize, setMaxSize] = useState(50)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim()) { setError('Please enter a label.'); return }
    setSaving(true)
    setError('')
    try {
      const expiresAt = new Date(Date.now() + duration * 60000).toISOString()
      const { error: err } = await supabase.from('file_upload_links').insert([{
        label: label.trim(),
        token: crypto.randomUUID(),
        expires_at: expiresAt,
        max_file_size: maxSize * 1024 * 1024,
        max_files_per_upload: maxFiles,
        max_total_uploads: maxUploads ? parseInt(maxUploads) : null,
      }])
      if (err) throw err
      onCreated()
    } catch {
      setError('Failed to create link.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-8">
      <div className="relative w-full max-w-lg rounded-2xl p-6 admin-glass-strong">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white/90">Generate Upload Link</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-500 hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Label</label>
            <input type="text" value={label} onChange={e => setLabel(e.target.value)}
              className="w-full admin-input" placeholder="e.g. Client Files - John" />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Link Expires After</label>
            <div className="flex flex-wrap gap-1.5">
              {DURATION_PRESETS.map(p => (
                <button key={p.minutes} type="button" onClick={() => setDuration(p.minutes)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    duration === p.minutes
                      ? 'bg-[#7700ff] text-white'
                      : 'bg-black/[0.04] text-gray-600 hover:bg-black/[0.08] dark:bg-white/[0.06] dark:text-white/60 dark:hover:bg-white/[0.1]'
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Max Files</label>
              <input type="number" value={maxFiles} onChange={e => setMaxFiles(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full admin-input" min={1} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Max Size (MB)</label>
              <input type="number" value={maxSize} onChange={e => setMaxSize(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full admin-input" min={1} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Max Uploads</label>
              <input type="number" value={maxUploads} onChange={e => setMaxUploads(e.target.value)}
                className="w-full admin-input" placeholder="Unlimited" min={1} />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm text-gray-500 transition-colors hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5">Cancel</button>
            <button type="submit" disabled={saving} className="admin-btn-primary">
              {saving ? 'Generating...' : 'Generate Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}