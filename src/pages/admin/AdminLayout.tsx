import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAdminStore } from '@/store/admin'
import { useState } from 'react'

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: '◈' },
  { to: '/admin/projects', label: 'Projects', icon: '◇' },
  { to: '/admin/media', label: 'Media', icon: '▣' },
  { to: '/admin/blog', label: 'Blog', icon: '◇' },
  { to: '/admin/messages', label: 'Messages', icon: '□' },
  { to: '/admin/settings', label: 'Settings', icon: '△' },
]

export default function AdminLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAdminStore()
  const [showMenu, setShowMenu] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-[#F7F8FA] dark:bg-[#0A0A0F]">
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r sm:translate-x-0 transition-transform duration-300 admin-glass',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}
        style={{ borderRadius: 0, borderRight: '1px solid rgba(0,0,0,0.05)' }}
      >
        <div className="flex h-14 items-center gap-2 border-b px-5 border-black/[0.04] dark:border-white/[0.04]">
          <Link to="/admin" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7700ff] text-[11px] font-bold text-white dark:bg-[#9233ff]">A</span>
            <span className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white/90">Admin</span>
          </Link>
          <Link to="/" className="ml-auto rounded-lg px-2.5 py-1 text-[11px] font-medium text-gray-400 transition-colors hover:bg-black/[0.04] hover:text-gray-600 dark:text-white/40 dark:hover:bg-white/[0.04] dark:hover:text-white/60">
            View Site
          </Link>
        </div>
        <nav className="flex flex-col gap-0.5 p-3 flex-1">
          {adminLinks.map(link => (
            <Link key={link.to} to={link.to} onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                pathname === link.to
                  ? 'bg-[#7700ff]/10 text-[#7700ff] shadow-sm dark:bg-[#9233ff]/15 dark:text-[#ad66ff]'
                  : 'text-gray-400 hover:bg-black/[0.04] hover:text-gray-600 dark:text-white/40 dark:hover:bg-white/[0.04] dark:hover:text-white/70'
              )}
            >
              <span className="text-[15px] leading-none">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="border-t p-3 border-black/[0.04] dark:border-white/[0.04]">
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-gray-400 transition-colors hover:bg-black/[0.04] hover:text-gray-600 dark:text-white/40 dark:hover:bg-white/[0.04] dark:hover:text-white/70"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#7700ff]/10 text-[11px] font-medium text-[#7700ff] dark:text-[#ad66ff]">
                  {user.email?.[0].toUpperCase()}
                </span>
                <span className="truncate">{user.email}</span>
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute bottom-full left-0 right-0 z-20 mb-2 overflow-hidden rounded-xl admin-glass-strong p-1.5 shadow-lg">
                    <button
                      onClick={() => { setShowMenu(false); handleSignOut() }}
                      className="w-full rounded-lg px-3 py-2 text-left text-xs text-red-500 transition-colors hover:bg-red-500/10"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm sm:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex flex-1 flex-col sm:pl-56">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4 border-black/[0.04] bg-[#F7F8FA]/80 backdrop-blur-lg dark:bg-[#0A0A0F]/80 dark:border-white/[0.04]">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-black/[0.04] sm:hidden dark:text-white/40 dark:hover:bg-white/[0.04]"
            aria-label="Toggle sidebar"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <div className="flex-1" />
          {user && (
            <span className="text-[11px] text-gray-400 dark:text-white/40">{user.email}</span>
          )}
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
