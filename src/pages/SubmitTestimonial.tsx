import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

export default function SubmitTestimonial() {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [company, setCompany] = useState('')
  const [content, setContent] = useState('')
  const [rating, setRating] = useState(5)
  const [avatar, setAvatar] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !content.trim()) { setError('Name and testimonial are required.'); return }
    setSaving(true)
    setError('')
    try {
      const { error: err } = await supabase.from('testimonials').insert({
        name: name.trim(), role: role.trim(), company: company.trim(),
        content: content.trim(), avatar, rating, featured: false,
      })
      if (err) { setError(err.message); setSaving(false); return }
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  const handleUploadAvatar = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '')
        const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`, { method: 'POST', body: formData })
        const data = await res.json()
        if (data.secure_url) setAvatar(data.secure_url)
      } catch { /* silent */ }
    }
    input.click()
  }

  if (submitted) {
    return (
      <section className="relative flex min-h-screen items-center justify-center px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-brand-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gold-500/10 blur-3xl" />
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-3xl">✓</div>
          <h1 className="font-display text-3xl font-bold">Thank You!</h1>
          <p className="mt-3 text-text-muted-light dark:text-text-muted-dark">Your testimonial has been submitted for review. I appreciate your kind words!</p>
        </motion.div>
      </section>
    )
  }

  return (
    <section className="relative min-h-screen px-4 pt-28 pb-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gold-500/10 blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <span className="mb-3 block text-xs font-semibold tracking-widest uppercase text-brand-500 dark:text-brand-400">Share Your Experience</span>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Leave a <span className="text-gradient">Testimonial</span></h1>
          <p className="mt-3 text-sm text-text-muted-light dark:text-text-muted-dark">Your feedback helps others know what to expect. Thank you!</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-border-light dark:border-border-dark bg-white/60 p-6 backdrop-blur-xl dark:bg-white/[0.03] sm:p-8">
          {error && <p className="mb-4 rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-500">{error}</p>}

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-white/70">Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
                className="w-full rounded-xl border border-border-light bg-white/50 px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-500/50 dark:border-border-dark dark:bg-white/5 dark:text-white/90" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-white/70">Role</label>
                <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="CEO"
                  className="w-full rounded-xl border border-border-light bg-white/50 px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-500/50 dark:border-border-dark dark:bg-white/5 dark:text-white/90" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-white/70">Company</label>
                <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name"
                  className="w-full rounded-xl border border-border-light bg-white/50 px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-500/50 dark:border-border-dark dark:bg-white/5 dark:text-white/90" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-white/70">Testimonial *</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} placeholder="Share your experience working with me..."
                className="w-full rounded-xl border border-border-light bg-white/50 px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-500/50 dark:border-border-dark dark:bg-white/5 dark:text-white/90" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-white/70">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(v => (
                  <button key={v} type="button" onClick={() => setRating(v)}
                    className={`text-2xl transition-colors ${v <= rating ? 'text-amber-400' : 'text-gray-300 dark:text-white/20'}`}>
                    {v <= rating ? '★' : '☆'}
                  </button>
                ))}
                <span className="ml-2 text-xs text-text-muted-light dark:text-text-muted-dark">({rating}/5)</span>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-white/70">Photo (optional)</label>
              <div className="flex items-center gap-3">
                {avatar ? (
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
                    <img src={avatar} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => setAvatar('')} className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">✕</button>
                  </div>
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black/[0.03] text-lg text-gray-400 dark:bg-white/[0.03] dark:text-white/30">📷</div>
                )}
                <button type="button" onClick={handleUploadAvatar} className="rounded-xl border border-border-light px-3 py-2 text-xs font-medium transition-colors hover:bg-black/5 dark:border-border-dark dark:hover:bg-white/5">
                  {avatar ? 'Change Photo' : 'Upload Photo'}
                </button>
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="mt-6 w-full rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-600 disabled:opacity-50">
            {saving ? 'Submitting...' : 'Submit Testimonial'}
          </button>
        </form>
      </motion.div>
    </section>
  )
}
