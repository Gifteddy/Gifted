import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { FileUploadLink } from '@/lib/types'

type UploadFile = { file: File; id: string }

const FILE_ICONS: Record<string, string> = {
  'application/pdf': '📄',
  'application/zip': '📦',
  'application/x-rar-compressed': '📦',
  'image/': '🖼️',
  'video/': '🎬',
  'audio/': '🎵',
  'text/': '📝',
  'application/msword': '📝',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'application/vnd.ms-excel': '📊',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
}

function fileIcon(type: string) {
  for (const [key, icon] of Object.entries(FILE_ICONS)) {
    if (type.startsWith(key)) return icon
  }
  return '📎'
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FileUpload() {
  const { token } = useParams<{ token: string }>()
  const [link, setLink] = useState<FileUploadLink | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [linkFull, setLinkFull] = useState(false)
  const [senderName, setSenderName] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState<UploadFile[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!token) { setLoading(false); setError('Invalid link.'); return }
    supabase
      .from('file_upload_links')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single()
      .then(({ data, error: err }) => {
        setLoading(false)
        if (err || !data) { setError('This link is invalid or has expired.'); return }
        const d = data as FileUploadLink
        if (d.max_total_uploads && (d.upload_count || 0) >= d.max_total_uploads) { setLinkFull(true); return }
        setLink(d)
      })
  }, [token])

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    if (!link) return
    const maxFiles = link.max_files_per_upload
    const maxSize = link.max_file_size
    const allowed = link.allowed_extensions

    setFiles(prev => {
      const remaining = maxFiles - prev.length
      const list = Array.from(newFiles).slice(0, remaining)
      const valid = list.filter(f => {
        if (f.size > maxSize) return false
        if (allowed) {
          const ext = '.' + f.name.split('.').pop()?.toLowerCase()
          if (!allowed.split(',').map(e => e.trim().toLowerCase()).includes(ext)) return false
        }
        return true
      })
      return [...prev, ...valid.map(f => ({ file: f, id: crypto.randomUUID() }))]
    })
  }, [link])

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!link || !token || files.length === 0) return
    setSubmitting(true)
    setError('')

    const { data: fresh } = await supabase
      .from('file_upload_links')
      .select('upload_count, max_total_uploads')
      .eq('id', link.id)
      .single()
    if (fresh?.max_total_uploads && (fresh.upload_count || 0) >= fresh.max_total_uploads) {
      setLinkFull(true); setSubmitting(false); return
    }

    try {
      const uploaded: { name: string; url: string; size: number; type: string }[] = []

      for (const { file } of files) {
        const ext = file.name.split('.').pop()
        const fileName = `${crypto.randomUUID()}.${ext}`
        const filePath = `${token}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('file-uploads')
          .upload(filePath, file)

        if (uploadError) throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`)

        const { data: urlData } = supabase.storage
          .from('file-uploads')
          .getPublicUrl(filePath)

        uploaded.push({
          name: file.name,
          url: urlData.publicUrl,
          size: file.size,
          type: file.type,
        })
      }

      const { error: insertError } = await supabase
        .from('file_uploads')
        .insert([{
          link_id: link.id,
          sender_name: senderName,
          sender_email: senderEmail,
          message,
          files: uploaded,
        }])

      if (insertError) throw new Error(insertError.message)

      await supabase.from('file_upload_links').update({ upload_count: (fresh?.upload_count || 0) + 1 }).eq('id', link.id)

      setSuccess(true)
      setSenderName('')
      setSenderEmail('')
      setMessage('')
      setFiles([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-light dark:bg-surface-dark">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7700ff] border-t-transparent" />
      </div>
    )
  }

  if (linkFull) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface-light p-4 dark:bg-surface-dark">
        <div className="w-full max-w-md rounded-2xl border border-border-light p-8 text-center dark:border-border-dark admin-glass-strong">
          <span className="text-4xl">🔒</span>
          <h1 className="mt-4 text-lg font-semibold text-text-light dark:text-text-dark">Link is Full</h1>
          <p className="mt-2 text-sm text-text-muted-light dark:text-text-muted-dark">This upload link has reached its maximum number of uploads and is no longer accepting files.</p>
          <Link to="/" className="mt-6 inline-flex rounded-xl bg-[#7700ff] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#9900ff]">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  if (error && !link) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface-light p-4 dark:bg-surface-dark">
        <div className="w-full max-w-md rounded-2xl border border-border-light p-8 text-center dark:border-border-dark admin-glass-strong">
          <span className="text-4xl">🔗</span>
          <h1 className="mt-4 text-lg font-semibold text-text-light dark:text-text-dark">Link Expired or Invalid</h1>
          <p className="mt-2 text-sm text-text-muted-light dark:text-text-muted-dark">{error}</p>
          <Link to="/" className="mt-6 inline-flex rounded-xl bg-[#7700ff] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#9900ff]">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface-light p-4 dark:bg-surface-dark">
        <div className="w-full max-w-md rounded-2xl border border-border-light p-8 text-center dark:border-border-dark admin-glass-strong">
          <span className="text-4xl">✅</span>
          <h1 className="mt-4 text-lg font-semibold text-text-light dark:text-text-dark">Files Uploaded!</h1>
          <p className="mt-2 text-sm text-text-muted-light dark:text-text-muted-dark">Your files and message have been sent successfully.</p>
          <button onClick={() => setSuccess(false)}
            className="mt-6 inline-flex rounded-xl bg-[#7700ff] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#9900ff]">
            Upload More
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface-light dark:bg-surface-dark">
      <div className="flex items-center justify-between border-b border-border-light px-6 py-4 dark:border-border-dark">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo-G.png" alt="Gifted" className="h-7 w-7 rounded-lg object-contain" />
          <span className="text-sm font-semibold text-text-light dark:text-text-dark">Gifted</span>
        </Link>
      </div>

      <div className="flex flex-1 items-start justify-center p-4 pt-12 sm:p-8 sm:pt-20">
        <div className="w-full max-w-lg rounded-2xl border border-border-light p-6 dark:border-border-dark sm:p-8 admin-glass-strong">
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-text-light dark:text-text-dark">Upload Files</h1>
            <p className="mt-1 text-sm text-text-muted-light dark:text-text-muted-dark">
              {link?.label || 'Share your files with a message'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input type="text" value={senderName} onChange={e => setSenderName(e.target.value)}
                placeholder="Your Name" required
                className="w-full rounded-xl border border-border-light bg-surface-secondary-light px-4 py-2.5 text-sm text-text-light placeholder:text-text-muted-light/50 focus:border-[#7700ff]/50 focus:outline-none dark:border-border-dark dark:bg-surface-secondary-dark/50 dark:text-text-dark dark:placeholder:text-text-muted-dark/60" />
              <input type="email" value={senderEmail} onChange={e => setSenderEmail(e.target.value)}
                placeholder="Your Email" required
                className="w-full rounded-xl border border-border-light bg-surface-secondary-light px-4 py-2.5 text-sm text-text-light placeholder:text-text-muted-light/50 focus:border-[#7700ff]/50 focus:outline-none dark:border-border-dark dark:bg-surface-secondary-dark/50 dark:text-text-dark dark:placeholder:text-text-muted-dark/60" />
            </div>

            <textarea value={message} onChange={e => setMessage(e.target.value)}
              placeholder="Add a message..." rows={3}
              className="w-full resize-none rounded-xl border border-border-light bg-surface-secondary-light px-4 py-2.5 text-sm text-text-light placeholder:text-text-muted-light/50 focus:border-[#7700ff]/50 focus:outline-none dark:border-border-dark dark:bg-surface-secondary-dark/50 dark:text-text-dark dark:placeholder:text-text-muted-dark/60" />

            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files) }}
              onClick={() => inputRef.current?.click()}
              className={cn(
                'flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-8 transition-colors',
                dragOver ? 'border-[#7700ff] bg-[#7700ff]/5' : 'border-border-light hover:border-text-muted-light/40 dark:border-border-dark dark:hover:border-text-muted-dark/40'
              )}
            >
              <span className="text-2xl">📁</span>
              <p className="text-sm text-text-muted-light dark:text-text-muted-dark">Drop files here or click to browse</p>
              <p className="text-xs text-text-muted-light/70 dark:text-text-muted-dark/60">
                Max {link?.max_files_per_upload || 5} files · {link ? formatSize(link.max_file_size) : '50 MB'} each
              </p>
            </div>

            <input ref={inputRef} type="file" multiple
              onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = '' }}
              className="hidden" />

            {files.length > 0 && (
              <div className="space-y-1.5">
                {files.map(f => (
                  <div key={f.id} className="flex items-center gap-3 rounded-lg border border-border-light bg-black/[0.02] px-3 py-2 dark:border-border-dark dark:bg-white/[0.03]">
                    <span className="text-base leading-none">{fileIcon(f.file.type)}</span>
                    <span className="min-w-0 flex-1 truncate text-sm text-text-light/80 dark:text-text-dark/80">{f.file.name}</span>
                    <span className="shrink-0 text-xs text-text-muted-light dark:text-text-muted-dark">{formatSize(f.file.size)}</span>
                    <button type="button" onClick={() => removeFile(f.id)}
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-text-muted-light/50 hover:bg-black/5 hover:text-text-light dark:text-text-muted-dark/60 dark:hover:bg-white/10 dark:hover:text-text-dark">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
            )}

            <button type="submit" disabled={submitting || files.length === 0}
              className="w-full rounded-xl bg-[#7700ff] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#9900ff] disabled:opacity-50">
              {submitting ? 'Uploading...' : `Upload ${files.length > 0 ? `(${files.length} file${files.length > 1 ? 's' : ''})` : ''}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}