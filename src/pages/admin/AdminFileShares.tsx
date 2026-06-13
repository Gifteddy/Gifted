import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate, cn } from '@/lib/utils'
import type { FileShare, FileShareItem } from '@/lib/types'

const DURATION_PRESETS = [
  { label: '1 Hour', minutes: 60 },
  { label: '6 Hours', minutes: 360 },
  { label: '24 Hours', minutes: 1440 },
  { label: '3 Days', minutes: 4320 },
  { label: '7 Days', minutes: 10080 },
  { label: '30 Days', minutes: 43200 },
]

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function AdminFileShares() {
  const [shares, setShares] = useState<FileShare[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const loadShares = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase.from('file_shares').select('*').order('created_at', { ascending: false })
      setShares((data || []) as FileShare[])
    } catch { /* silent */ } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadShares() }, [loadShares])

  const handleDelete = async (id: string) => {
    await supabase.from('file_shares').delete().eq('id', id)
    setDeleteId(null)
    loadShares()
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white/90">Client Shares</h1>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-white/40">{shares.length} share{shares.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="w-full sm:w-auto admin-btn-primary">New Share</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7700ff] border-t-transparent" />
        </div>
      ) : shares.length === 0 ? (
        <div className="flex items-center justify-center rounded-2xl p-12 text-center admin-glass">
          <div className="max-w-sm">
            <p className="text-3xl mb-3">📤</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white/90">No shares yet</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-white/40">Send files to clients for review and feedback.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {shares.map(share => {
            const isExpired = new Date(share.expires_at) <= new Date()
            const url = `${window.location.origin}/share/${share.token}`
            return (
              <ShareCard key={share.id} share={share} url={url} isExpired={isExpired}
                onDelete={() => setDeleteId(share.id)} />
            )
          })}
        </div>
      )}

      {showCreate && (
        <CreateShareModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); loadShares() }} />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-sm rounded-2xl p-6 admin-glass-strong">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white/90">Delete Share</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-white/40">This will remove all shared files. Are you sure?</p>
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

function ShareCard({ share, url, isExpired, onDelete }: { share: FileShare; url: string; isExpired: boolean; onDelete: () => void }) {
  const [items, setItems] = useState<FileShareItem[] | null>(null)
  const [expanded, setExpanded] = useState(false)

  const toggleExpand = async () => {
    if (expanded) { setExpanded(false); return }
    setExpanded(true)
    if (!items) {
      const { data } = await supabase.from('file_share_items').select('*').eq('share_id', share.id).order('sort_order', { ascending: true })
      setItems((data || []) as FileShareItem[])
    }
  }

  return (
    <div className="rounded-2xl overflow-hidden admin-glass">
      <div className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium text-gray-900 dark:text-white/90">
                {share.label || 'Untitled Share'}
              </span>
              {isExpired ? (
                <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">Expired</span>
              ) : (
                <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</span>
              )}
              {share.password_hash && (
                <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Password</span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-white/40">
              <span>Expires {formatDate(share.expires_at)}</span>
              <span>·</span>
              <span>{share.file_count} file{share.file_count !== 1 ? 's' : ''}</span>
              <span>·</span>
              <span>Created {formatDate(share.created_at)}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 truncate rounded-lg bg-black/[0.03] px-2.5 py-1.5 text-xs text-gray-500 dark:bg-white/[0.03] dark:text-white/40 font-mono">{url}</code>
              <button onClick={() => { navigator.clipboard.writeText(url) }}
                className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#7700ff] transition-colors hover:bg-[#7700ff]/10 dark:text-[#ad66ff] dark:hover:bg-[#ad66ff]/10">Copy</button>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button onClick={toggleExpand}
              className="rounded-lg px-2.5 py-1.5 text-xs text-gray-500 transition-colors hover:bg-black/5 hover:text-gray-700 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white/80">
              {expanded ? 'Hide' : items ? `View (${items.length})` : 'View'}
            </button>
            <button onClick={onDelete}
              className="rounded-lg px-2.5 py-1.5 text-xs text-red-500 transition-colors hover:bg-red-500/10">Delete</button>
          </div>
        </div>
      </div>

      {expanded && items && (
        <div className="border-t border-black/[0.04] dark:border-white/[0.04]">
          {items.length === 0 ? (
            <div className="px-4 pb-4 pt-3"><p className="text-center text-xs text-gray-500 dark:text-white/30">No files in this share.</p></div>
          ) : (
            <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
              {items.map(item => (
                <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                  {item.type.startsWith('image/') ? (
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-black/[0.05] dark:bg-white/[0.05]">
                      <img src={item.url} alt="" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black/[0.05] text-sm dark:bg-white/[0.05] dark:text-white/60">
                      {item.type.startsWith('video/') ? '🎬' : '📄'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-gray-900 dark:text-white/90">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-white/40">{formatSize(item.size)} · {item.type || 'unknown'}</p>
                  </div>
                  <svg className="h-3.5 w-3.5 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" /></svg>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CreateShareModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [label, setLabel] = useState('')
  const [duration, setDuration] = useState(1440)
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [files, setFiles] = useState<{ file: File; id: string; preview?: string }[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const urlInputRef = useRef<HTMLInputElement>(null)

  const addFiles = (newFiles: FileList | File[]) => {
    const list = Array.from(newFiles)
    setFiles(prev => [...prev, ...list.map(f => ({
      file: f, id: crypto.randomUUID(),
      preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
    }))])
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const addUrl = () => {
    const url = urlInputRef.current?.value.trim()
    if (!url) return
    const name = url.split('/').pop() || url
    setFiles(prev => [...prev, {
      file: new File([], name),
      id: crypto.randomUUID(),
      preview: url,
    }])
    if (urlInputRef.current) urlInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (files.length === 0) { setError('Add at least one file.'); return }
    setSaving(true); setError('')

    let passwordHash: string | null = null
    if (password) {
      const data = new TextEncoder().encode(password)
      const hash = await crypto.subtle.digest('SHA-256', data)
      passwordHash = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
    }

    try {
      const token = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + duration * 60000).toISOString()

      const { data: share, error: shareErr } = await supabase.from('file_shares').insert([{
        label: label.trim() || 'Untitled Share',
        token,
        password_hash: passwordHash,
        expires_at: expiresAt,
      }]).select().single()

      if (shareErr || !share) throw new Error(shareErr?.message || 'Failed to create share')

      const items: { name: string; url: string; type: string; size: number; sort_order: number }[] = []

      for (let i = 0; i < files.length; i++) {
        const { file, preview } = files[i]

        if (preview && file.size === 0) {
          items.push({ name: file.name, url: preview, type: '', size: 0, sort_order: i })
          continue
        }

        const ext = file.name.split('.').pop()
        const fileName = `${crypto.randomUUID()}.${ext}`
        const filePath = `${token}/${fileName}`

        const { error: uploadErr } = await supabase.storage
          .from('file-shares')
          .upload(filePath, file)

        if (uploadErr) throw new Error(`Failed to upload ${file.name}: ${uploadErr.message}`)

        const { data: urlData } = supabase.storage
          .from('file-shares')
          .getPublicUrl(filePath)

        items.push({
          name: file.name,
          url: urlData.publicUrl,
          type: file.type,
          size: file.size,
          sort_order: i,
        })
      }

      const { error: itemsErr } = await supabase.from('file_share_items').insert(
        items.map(item => ({ ...item, share_id: share.id }))
      )

      if (itemsErr) throw new Error(itemsErr.message)

      await supabase.from('file_shares').update({ file_count: items.length }).eq('id', share.id)

      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create share.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-8">
      <div className="relative w-full max-w-2xl rounded-2xl p-6 admin-glass-strong">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white/90">New Client Share</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-500 hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Label</label>
            <input type="text" value={label} onChange={e => setLabel(e.target.value)}
              className="w-full admin-input" placeholder="e.g. Wedding Photos - John & Sarah" />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Expires After</label>
            <div className="flex flex-wrap gap-1.5">
              {DURATION_PRESETS.map(p => (
                <button key={p.minutes} type="button" onClick={() => setDuration(p.minutes)}
                  className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                    duration === p.minutes
                      ? 'bg-[#7700ff] text-white'
                      : 'bg-black/[0.04] text-gray-600 hover:bg-black/[0.08] dark:bg-white/[0.06] dark:text-white/60 dark:hover:bg-white/[0.1]'
                  )}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Password (optional)</label>
            <input type="text" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full admin-input" placeholder="Leave blank for no password" />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Files</label>

            <div className="flex gap-2 mb-2">
              <input ref={urlInputRef} type="text" className="flex-1 admin-input" placeholder="Or paste a file URL..." />
              <button type="button" onClick={addUrl} className="shrink-0 rounded-xl bg-black/[0.04] px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-black/[0.08] dark:bg-white/[0.06] dark:text-white/60 dark:hover:bg-white/[0.1]">Add URL</button>
            </div>

            <div
              onClick={() => inputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-black/[0.08] p-6 transition-colors hover:border-[#7700ff]/50 dark:border-white/[0.08] dark:hover:border-[#7700ff]/50"
            >
              <span className="text-2xl">📁</span>
              <p className="text-sm text-gray-500 dark:text-white/60">Click to upload files</p>
              <p className="text-xs text-gray-400 dark:text-white/30">Images, videos, documents — any file type</p>
            </div>

            <input ref={inputRef} type="file" multiple
              onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = '' }}
              className="hidden" />

            {files.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {files.map(f => (
                  <div key={f.id} className="flex items-center gap-3 rounded-lg border border-black/[0.04] bg-black/[0.02] px-3 py-2 dark:border-white/[0.04] dark:bg-white/[0.02]">
                    {f.preview && f.file.type.startsWith('image/') ? (
                      <img src={f.preview} alt="" className="h-8 w-8 shrink-0 rounded object-cover" />
                    ) : (
                      <span className="text-base leading-none shrink-0">
                        {f.file.type.startsWith('video/') ? '🎬' : f.file.type.startsWith('image/') ? '🖼️' : '📄'}
                      </span>
                    )}
                    <span className="min-w-0 flex-1 truncate text-xs text-gray-700 dark:text-white/70">{f.file.name}</span>
                    <span className="shrink-0 text-xs text-gray-400 dark:text-white/40">{f.file.size > 0 ? formatSize(f.file.size) : 'URL'}</span>
                    <button type="button" onClick={() => removeFile(f.id)}
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-gray-400 hover:bg-black/5 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-white/70">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm text-gray-500 transition-colors hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5">Cancel</button>
            <button type="submit" disabled={saving || files.length === 0} className="admin-btn-primary">
              {saving ? 'Creating...' : `Create Share (${files.length} file${files.length !== 1 ? 's' : ''})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}