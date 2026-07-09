import { Link } from 'react-router-dom'
import { useAdminStore } from '@/store/admin'
import { useState } from 'react'
import { Icons } from '@/lib/admin-icons'

const links = [
  { to: '/admin/projects', label: 'Projects', icon: Icons.folder, desc: 'Create and manage portfolio projects' },
  { to: '/admin/media', label: 'Media', icon: Icons.play, desc: 'Upload and manage images, videos & files' },
  { to: '/admin/blog', label: 'Blog', icon: Icons.pencil, desc: 'Write and manage blog posts' },
  { to: '/admin/file-uploads', label: 'File Uploads', icon: Icons.upload, desc: 'Generate secure file upload links for clients' },
  { to: '/admin/file-shares', label: 'Client Shares', icon: Icons.share, desc: 'Send files to clients for review' },
  { to: '/admin/messages', label: 'Messages', icon: Icons.mail, desc: 'View and respond to inquiries' },
  { to: '/admin/settings', label: 'Settings', icon: Icons.gear, desc: 'Account and system configuration' },
]

export default function AdminDashboard() {
  const { user } = useAdminStore()
  const [copied, setCopied] = useState(false)

  const testimonialUrl = `${window.location.origin}/submit-testimonial`

  const copyLink = () => {
    navigator.clipboard.writeText(testimonialUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const userInitial = user?.email?.[0]?.toUpperCase() || '?'

  return (
    <div className="mx-auto max-w-5xl">
      <div className="relative mb-10 overflow-hidden rounded-2xl border border-black/[0.04] bg-gradient-to-br from-white/80 to-white/40 p-6 backdrop-blur-xl sm:p-8 dark:border-white/[0.03] dark:from-[#0c0c18]/70 dark:to-[#0c0c18]/30">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-500/[0.03] to-gold-500/[0.02] dark:from-brand-400/[0.05] dark:to-gold-400/[0.03]" />
        <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-brand-500/5 blur-[80px] dark:bg-brand-400/8" />
        <div className="relative flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-400 text-base font-semibold text-white shadow-lg shadow-brand-500/25 dark:from-brand-400 dark:to-brand-300 dark:shadow-brand-400/20">
            {userInitial}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white/90">
              Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
            </h1>
            <p className="mt-1 text-sm text-gray-400 dark:text-white/40">
              Manage your portfolio from here.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-black/[0.04] bg-white/60 p-5 backdrop-blur-xl sm:p-6 dark:border-white/[0.03] dark:bg-[#0c0c18]/50">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
              {Icons.star('h-4 w-4')}
            </span>
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white/90">Testimonial Submission Link</h3>
              <p className="mt-0.5 text-xs text-gray-400 dark:text-white/40">Share this link with clients to collect testimonials</p>
            </div>
          </div>
          <button onClick={copyLink}
            className="relative w-full sm:w-auto shrink-0 overflow-hidden rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 px-4 py-2 text-xs font-medium text-white shadow-sm shadow-brand-500/20 transition-all duration-200 hover:translate-y-[-1px] hover:shadow-md hover:shadow-brand-500/25 active:translate-y-0 dark:from-brand-400 dark:to-brand-300 dark:shadow-brand-400/15">
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
        <div className="mt-3 rounded-xl bg-black/[0.03] px-3 py-2 text-xs text-gray-500 dark:bg-white/[0.03] dark:text-white/40 font-mono truncate">
          {testimonialUrl}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map(link => (
          <Link key={link.to} to={link.to}
            className="group relative overflow-hidden rounded-2xl border border-black/[0.04] bg-white/60 p-5 backdrop-blur-xl transition-all duration-200 hover:translate-y-[-1px] hover:shadow-md hover:shadow-brand-500/5 dark:border-white/[0.03] dark:bg-[#0c0c18]/50 dark:hover:shadow-brand-400/5"
          >
            <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-500/[0.03] to-transparent dark:from-brand-400/[0.04]" />
            </div>
            <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 transition-all duration-200 group-hover:scale-110 group-hover:bg-brand-500/15 dark:text-brand-300 dark:group-hover:bg-brand-400/15">
              {link.icon('h-4 w-4')}
            </span>
            <h3 className="relative mt-3 text-sm font-medium text-gray-900 dark:text-white/90">{link.label}</h3>
            <p className="relative mt-0.5 text-xs text-gray-400 dark:text-white/40">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
