import { useState } from 'react'
import { useAdminStore } from '@/store/admin'

export default function AdminSettings() {
  const { user, signOut } = useAdminStore()
  const [copied, setCopied] = useState(false)

  const handleCopyUserId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 text-xl font-semibold tracking-tight text-gray-900 dark:text-white/90">Settings</h1>

      <div className="space-y-4">
        <div className="rounded-2xl p-6 admin-glass">
          <h2 className="mb-4 text-sm font-medium text-gray-900 dark:text-white/90">Admin Profile</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7700ff]/10 text-sm font-medium text-[#7700ff] dark:text-[#ad66ff]">
                {user?.email?.[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white/90">{user?.email}</p>
                <p className="text-xs text-gray-500 dark:text-white/40">Administrator</p>
              </div>
            </div>

            <div className="rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.03)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-white/40">User ID</p>
                  <p className="mt-0.5 font-mono text-xs text-gray-700 dark:text-white/70">{user?.id}</p>
                </div>
                <button onClick={handleCopyUserId}
                  className="rounded-lg px-2.5 py-1.5 text-xs text-[#7700ff] transition-colors hover:bg-[#7700ff]/10 dark:text-[#ad66ff]">
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 admin-glass">
          <h2 className="mb-4 text-sm font-medium text-gray-900 dark:text-white/90">Account</h2>
          <button onClick={signOut}
            className="w-full rounded-xl px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-500/10"
            style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
            Sign Out
          </button>
        </div>

        <div className="rounded-2xl p-6 admin-glass">
          <h2 className="mb-4 text-sm font-medium text-gray-900 dark:text-white/90">System</h2>
          <div className="space-y-2 text-xs text-gray-500 dark:text-white/40">
            <div className="flex justify-between">
              <span>Supabase</span>
              <span className="font-mono text-gray-700 dark:text-white/70">
                {import.meta.env.VITE_SUPABASE_URL ? 'Configured' : 'Not set'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Cloudinary</span>
              <span className="font-mono text-gray-700 dark:text-white/70">
                {import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ? 'Configured' : 'Not set'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>OpenRouter</span>
              <span className="font-mono text-gray-700 dark:text-white/70">
                {import.meta.env.VITE_OPENROUTER_API_KEY ? 'Configured' : 'Not set'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
