import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAdminStore } from '@/store/admin'
import { useTheme } from '@/store/theme'
import NotificationBell from '@/components/admin/NotificationBell'
import useRealtimeNotifications from '@/hooks/useRealtimeNotifications'
import { useState, useEffect, useRef } from 'react'

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: '◈' },
  { to: '/admin/projects', label: 'Projects', icon: '◇' },
  { to: '/admin/media', label: 'Media', icon: '▣' },
  { to: '/admin/blog', label: 'Blog', icon: '◇' },
  { to: '/admin/testimonials', label: 'Testimonials', icon: '★' },
  { to: '/admin/file-uploads', label: 'File Uploads', icon: '↗' },
  { to: '/admin/file-shares', label: 'Client Shares', icon: '⊕' },
  { to: '/admin/messages', label: 'Messages', icon: '□' },
  { to: '/admin/settings', label: 'Settings', icon: '△' },
]

export default function AdminLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAdminStore()
  const { theme, setTheme } = useTheme()
  useRealtimeNotifications()
  const [showMenu, setShowMenu] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    if (showMenu) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showMenu])

  const handleSignOut = async () => {
    setShowMenu(false)
    await signOut()
    navigate('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-[#F7F8FA] dark:bg-[#0A0A0F]">
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r sm:translate-x-0 transition-all duration-300 ease-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'bg-white/80 backdrop-blur-2xl dark:bg-[#0A0A0F]/90',
        'border-black/[0.06] dark:border-white/[0.06]'
      )}
      >
        <div className="flex h-14 items-center gap-3 border-b px-4 border-black/[0.04] dark:border-white/[0.04]">
          <Link to="/admin" className="flex shrink-0 items-center gap-2.5">
            <img src="/logo-G.png" alt="Gifted" className="h-7 w-7 rounded-lg object-contain" />
            <span className="text-sm font-semibold tracking-tight text-gray-800 dark:text-white/90">Admin</span>
          </Link>
          <Link to="/" className="ml-auto flex h-7 items-center rounded-lg px-2.5 text-[11px] font-medium text-gray-400 transition-colors hover:bg-black/[0.04] hover:text-gray-600 dark:text-white/40 dark:hover:bg-white/[0.06] dark:hover:text-white/60">
            View Site
          </Link>
        </div>

        <nav className="flex flex-col gap-0.5 p-3 flex-1 overflow-y-auto admin-scroll">
          {adminLinks.map(link => {
            const isActive = pathname === link.to || (link.to !== '/admin' && pathname.startsWith(link.to))
            return (
              <Link key={link.to} to={link.to} onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-[#7700ff]/10 text-[#7700ff] shadow-sm dark:bg-[#9233ff]/18 dark:text-[#ad66ff]'
                    : 'text-gray-400 hover:bg-black/[0.04] hover:text-gray-600 dark:text-white/40 dark:hover:bg-white/[0.06] dark:hover:text-white/70'
                )}
              >
                <span className="text-[15px] leading-none">{link.icon}</span>
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t p-3 border-black/[0.04] dark:border-white/[0.04]">
          {user && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-gray-400 transition-colors hover:bg-black/[0.04] hover:text-gray-600 dark:text-white/40 dark:hover:bg-white/[0.06] dark:hover:text-white/70"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7700ff]/10 text-[11px] font-medium text-[#7700ff] dark:text-[#ad66ff]">
                  {user.email?.[0].toUpperCase()}
                </span>
                <span className="truncate">{user.email}</span>
                <svg className={cn('ml-auto h-3 w-3 transition-transform', showMenu && 'rotate-180')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
              </button>
              {showMenu && (
                <div className="absolute bottom-full left-0 right-0 z-20 mb-2 overflow-hidden rounded-xl admin-glass-strong p-1.5 shadow-lg">
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-red-500 transition-colors hover:bg-red-500/10"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm sm:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex min-w-0 flex-1 flex-col sm:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4 border-black/[0.06] bg-[#F7F8FA]/80 backdrop-blur-lg dark:bg-[#0A0A0F]/80 dark:border-white/[0.06]">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-black/[0.04] sm:hidden dark:text-white/40 dark:hover:bg-white/[0.06]"
            aria-label="Toggle sidebar"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-1">
            <NotificationBell />
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-black/[0.04] dark:text-white/40 dark:hover:bg-white/[0.06]"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
