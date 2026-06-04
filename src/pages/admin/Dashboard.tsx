import { Link } from 'react-router-dom'
import { useAdminStore } from '@/store/admin'
import { useState } from 'react'

const links = [
  { to: '/admin/projects', label: 'Projects', icon: '◇', desc: 'Create and manage portfolio projects' },
  { to: '/admin/media', label: 'Media', icon: '▣', desc: 'Upload and manage images, videos & files' },
  { to: '/admin/blog', label: 'Blog', icon: '◇', desc: 'Write and manage blog posts' },
  { to: '/admin/messages', label: 'Messages', icon: '□', desc: 'View and respond to inquiries' },
  { to: '/admin/settings', label: 'Settings', icon: '△', desc: 'Account and system configuration' },
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

  return (
    <div className="max-w-4xl">
      <div className="mb-10">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white/90">
          Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
        </h1>
        <p className="mt-1.5 text-sm text-gray-400 dark:text-white/40">
          Manage your portfolio from here.
        </p>
      </div>

      <div className="mb-8 rounded-2xl p-5 admin-glass">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white/90">Testimonial Submission Link</h3>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-white/40">Share this link with clients to collect testimonials</p>
          </div>
          <button onClick={copyLink}
            className="w-full sm:w-auto shrink-0 rounded-xl bg-[#7700ff] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#9900ff]">
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
        <div className="mt-3 rounded-xl bg-black/[0.03] px-3 py-2 text-xs text-gray-500 dark:bg-white/[0.03] dark:text-white/40 font-mono truncate">
          {testimonialUrl}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {links.map(link => (
          <Link key={link.to} to={link.to}
            className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] admin-glass"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#7700ff]/10 text-sm text-[#7700ff] dark:text-[#ad66ff]">
              {link.icon}
            </span>
            <h3 className="mt-3 text-sm font-medium text-gray-900 dark:text-white/90">{link.label}</h3>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-white/40">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
