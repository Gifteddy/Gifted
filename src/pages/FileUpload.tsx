import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Meta } from '@/lib/meta'
import { cn, uploadFileToCloudinary } from '@/lib/utils'
import type { FileUploadLink } from '@/lib/types'

type UploadFile = { file: File; id: string; preview?: string }

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

function isImageType(type: string) {
  return type.startsWith('image/')
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
  const [rejectedFiles, setRejectedFiles] = useState<{ name: string; reason: string }[]>([])
  const [uploadStatus, setUploadStatus] = useState('')
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; percent: number } | null>(null)
  const [uploadSpeed, setUploadSpeed] = useState<number | null>(null)
  const [, setCancelled] = useState(false)
  const [failedFile, setFailedFile] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)
  const abortRef = useRef<AbortController | null>(null)
  const speedRef = useRef<{ loaded: number; time: number }[]>([])

  useEffect(() => {
    return () => {
      files.forEach(f => { if (f.preview) URL.revokeObjectURL(f.preview) })
    }
  }, [])

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
    const newRejected: { name: string; reason: string }[] = []

    setFiles(prev => {
      const remaining = maxFiles - prev.length
      const fileArray = Array.from(newFiles)
      const valid: UploadFile[] = []

      if (fileArray.length > remaining) {
        newRejected.push({
          name: `${fileArray.length - remaining} file(s)`,
          reason: `Only ${remaining} slot(s) remaining (max ${maxFiles})`
        })
      }

      for (const f of fileArray.slice(0, remaining)) {
        if (f.size > maxSize) {
          newRejected.push({ name: f.name, reason: `File exceeds ${formatSize(maxSize)} limit` })
          continue
        }
        if (allowed) {
          const ext = '.' + f.name.split('.').pop()?.toLowerCase()
          if (!allowed.split(',').map(e => e.trim().toLowerCase()).includes(ext)) {
            newRejected.push({ name: f.name, reason: 'File type not accepted' })
            continue
          }
        }
        const entry: UploadFile = { file: f, id: crypto.randomUUID() }
        if (isImageType(f.type) && f.size < 10 * 1024 * 1024) {
          entry.preview = URL.createObjectURL(f)
        }
        valid.push(entry)
      }

      return [...prev, ...valid]
    })

    if (newRejected.length > 0) {
      setRejectedFiles(prev => [...prev, ...newRejected])
    }
  }, [link])

  const removeFile = (id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id)
      if (file?.preview) URL.revokeObjectURL(file.preview)
      return prev.filter(f => f.id !== id)
    })
  }

  const cancelUpload = () => {
    abortRef.current?.abort()
    setCancelled(true)
    setSubmitting(false)
    setUploadStatus('')
    setUploadProgress(null)
    setUploadSpeed(null)
  }

  const retryUpload = () => {
    setFailedFile(null)
    setError('')
  }

  const totalSize = files.reduce((sum, f) => sum + f.file.size, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!link || !token || files.length === 0) return
    setSubmitting(true)
    setError('')
    setFailedFile(null)
    setCancelled(false)
    setUploadProgress({ current: 0, total: files.length, percent: 0 })
    setUploadStatus('Checking link validity...')
    setUploadSpeed(null)
    speedRef.current = []
    const controller = new AbortController()
    abortRef.current = controller

    const { data: fresh } = await supabase
      .from('file_upload_links')
      .select('upload_count, max_total_uploads')
      .eq('id', link.id)
      .single()
    if (fresh?.max_total_uploads && (fresh.upload_count || 0) >= fresh.max_total_uploads) {
      setLinkFull(true); setSubmitting(false); setUploadStatus(''); return
    }

    try {
      const uploaded: { name: string; url: string; size: number; type: string }[] = []

      for (let i = 0; i < files.length; i++) {
        if (controller.signal.aborted) break
        const { file } = files[i]
        setUploadStatus(`Uploading ${i + 1} of ${files.length}: ${file.name}`)
        setUploadProgress({ current: i + 1, total: files.length, percent: 0 })
        speedRef.current = []

        const url = await uploadFileToCloudinary(
          file,
          `file-uploads/${token}`,
          (percent) => {
            const now = Date.now()
            speedRef.current.push({ loaded: (percent / 100) * file.size, time: now })
            if (speedRef.current.length > 2) {
              const oldest = speedRef.current[0]
              const newest = speedRef.current[speedRef.current.length - 1]
              const elapsed = (newest.time - oldest.time) / 1000
              if (elapsed > 0) {
                const bytesPerSec = (newest.loaded - oldest.loaded) / elapsed
                setUploadSpeed(bytesPerSec)
              }
            }
            setUploadProgress({ current: i + 1, total: files.length, percent })
          },
        )

        setUploadProgress({ current: i + 1, total: files.length, percent: 100 })
        uploaded.push({
          name: file.name,
          url,
          size: file.size,
          type: file.type,
        })
      }

      if (controller.signal.aborted) return

      setUploadStatus('Saving to database...')
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

      setUploadStatus('Finalizing...')
      await supabase
        .from('file_upload_links')
        .update({ upload_count: (fresh?.upload_count || 0) + 1 })
        .eq('id', link.id)

      const { sendEmailSafe, fileUploadOwnerEmail } = await import('@/lib/email')
      sendEmailSafe({
        to: import.meta.env.VITE_ADMIN_EMAIL || 'ibiamiheanyi@gmail.com',
        subject: `Files Uploaded by ${senderName || 'Someone'}`,
        html: fileUploadOwnerEmail({
          senderName: senderName || 'Anonymous',
          senderEmail: senderEmail || '',
          message,
          fileCount: uploaded.length,
          fileNames: uploaded.map(u => u.name),
          uploadLinkId: link.id,
        }),
      }).catch(() => {})

      setUploadStatus('')
      setUploadProgress(null)
      setUploadSpeed(null)
      setSuccess(true)
      setSenderName('')
      setSenderEmail('')
      setMessage('')
      setFiles([])
      setRejectedFiles([])
    } catch (err) {
      if (controller.signal.aborted) return
      const msg = err instanceof Error ? err.message : 'Upload failed. Please try again.'
      setError(msg)
      setFailedFile(files[uploadProgress?.current ? uploadProgress.current - 1 : 0]?.file.name || null)
      setUploadStatus('')
      setUploadProgress(null)
      setUploadSpeed(null)
    } finally {
      abortRef.current = null
      if (!controller.signal.aborted) setSubmitting(false)
    }
  }

  const dismissRejected = (index: number) => {
    setRejectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const clearAllRejected = () => {
    setRejectedFiles([])
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
        <Meta title="Upload — Link is Full" description="This upload link has reached its maximum number of uploads." noindex />
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
        <Meta title="Upload — Invalid Link" description="This upload link is invalid or has expired." noindex />
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
        <Meta title="Upload — Success" description="Files uploaded successfully." noindex />
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
      <Meta
        title={`Upload — ${link?.label || 'File Upload'}`}
        description="Upload files securely with a message."
        noindex
      />
      <div className="flex items-center justify-between border-b border-border-light px-6 py-4 dark:border-border-dark">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="https://res.cloudinary.com/dr4fjf3a1/image/upload/f_auto,q_auto,w_28,h_28,c_fit/v1781723693/logo_u7assw.png" alt="Gifted" loading="lazy" decoding="async" className="h-7 w-7 rounded-lg object-contain" />
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
              onDragOver={e => { e.preventDefault(); dragCounter.current++; setDragOver(true) }}
              onDragLeave={() => { dragCounter.current--; if (dragCounter.current === 0) setDragOver(false) }}
              onDrop={e => { e.preventDefault(); dragCounter.current = 0; setDragOver(false); addFiles(e.dataTransfer.files) }}
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

            {rejectedFiles.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-900/20">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                    {rejectedFiles.length} file{rejectedFiles.length > 1 ? 's' : ''} not added
                  </p>
                  <button type="button" onClick={clearAllRejected}
                    className="text-xs text-amber-500 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300">
                    Dismiss all
                  </button>
                </div>
                <ul className="mt-1 space-y-0.5">
                  {rejectedFiles.map((r, i) => (
                    <li key={i} className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-300/80">
                      <span className="truncate">{r.name} &mdash; {r.reason}</span>
                      <button type="button" onClick={() => dismissRejected(i)}
                        className="ml-2 shrink-0 text-amber-400 hover:text-amber-600">✕</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {files.length > 0 && (
              <div className="space-y-1.5">
                {files.map(f => (
                  <div key={f.id} className="flex items-center gap-3 rounded-lg border border-border-light bg-black/[0.02] px-3 py-2 dark:border-border-dark dark:bg-white/[0.03]">
                    {f.preview ? (
                      <img src={f.preview} alt="" loading="lazy" decoding="async" className="h-8 w-8 shrink-0 rounded object-cover" />
                    ) : (
                      <span className="text-base leading-none">{fileIcon(f.file.type)}</span>
                    )}
                    <span className="min-w-0 flex-1 truncate text-sm text-text-light/80 dark:text-text-dark/80">{f.file.name}</span>
                    <span className="shrink-0 text-xs text-text-muted-light dark:text-text-muted-dark">{formatSize(f.file.size)}</span>
                    <button type="button" onClick={() => removeFile(f.id)}
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-text-muted-light/50 hover:bg-black/5 hover:text-text-light dark:text-text-muted-dark/60 dark:hover:bg-white/10 dark:hover:text-text-dark">
                      ✕
                    </button>
                  </div>
                ))}
                <p className="text-right text-xs text-text-muted-light dark:text-text-muted-dark">
                  {files.length} file{files.length > 1 ? 's' : ''} · {formatSize(totalSize)} total
                </p>
              </div>
            )}

            {uploadStatus && (
              <div className="rounded-xl border border-[#7700ff]/20 bg-[#7700ff]/5 p-4 dark:border-[#7700ff]/30 dark:bg-[#7700ff]/10">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[#7700ff] border-t-transparent" />
                  <p className="text-sm font-medium text-[#7700ff] dark:text-[#ad66ff]">{uploadStatus}</p>
                </div>
                {uploadProgress && uploadProgress.total > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-text-muted-light dark:text-text-muted-dark">
                      <span>File {uploadProgress.current} of {uploadProgress.total}</span>
                      <span>{uploadProgress.percent}%</span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
                      <div
                        className="h-full rounded-full bg-[#7700ff] transition-all duration-300"
                        style={{ width: `${uploadProgress.percent}%` }}
                      />
                    </div>
                    {uploadSpeed && uploadSpeed > 0 && (
                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-text-muted-light dark:text-text-muted-dark">
                        <span>{formatSize(Math.round(uploadSpeed))}/s</span>
                        {uploadProgress.percent > 0 && uploadProgress.percent < 100 && (
                          <span>~{Math.ceil(((100 - uploadProgress.percent) / 100) * (uploadProgress.total === 1 ? 1 : 1))}s remaining</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <button type="button" onClick={cancelUpload}
                  className="mt-3 w-full rounded-lg border border-red-200 bg-red-50 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30">
                  Cancel Upload
                </button>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-900/20">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 text-sm">❌</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">Upload failed</p>
                    <p className="mt-0.5 text-xs text-red-500 dark:text-red-300/80">{error}</p>
                    {failedFile && <p className="mt-1 text-xs text-red-400 dark:text-red-300/60">Failed on: {failedFile}</p>}
                  </div>
                </div>
                <button type="button" onClick={retryUpload}
                  className="mt-2 w-full rounded-lg bg-red-100 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50">
                  Retry Upload
                </button>
              </div>
            )}

            <button type="submit" disabled={submitting || files.length === 0}
              className="w-full rounded-xl bg-[#7700ff] py-3 text-sm font-medium text-white transition-colors hover:bg-[#9900ff] disabled:opacity-50">
              {submitting
                ? `Uploading ${uploadProgress ? `${uploadProgress.current}/${uploadProgress.total}` : ''}...`
                : files.length > 0
                  ? `Upload ${files.length} file${files.length > 1 ? 's' : ''} (${formatSize(totalSize)})`
                  : 'Select files to upload'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
