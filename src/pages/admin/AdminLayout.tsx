import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Icons } from '@/lib/admin-icons'
import { useAdminStore } from '@/store/admin'
import { useTheme } from '@/store/theme'
import NotificationBell from '@/components/admin/NotificationBell'
import React, { useState, useEffect, useRef } from 'react'

type NavItem = {
  to: string
  label: string
  icon: (className?: string) => React.ReactNode
}
type NavGroup = { label: string; icon: (className?: string) => React.ReactNode; items: NavItem[] }

const navGroups: NavGroup[] = [
  {
    label: 'Content',
    icon: Icons.folder,
    items: [
      { to: '/admin/projects', label: 'Projects', icon: Icons.folder },
      { to: '/admin/media', label: 'Media', icon: Icons.play },
      { to: '/admin/blog', label: 'Blog', icon: Icons.pencil },
      { to: '/admin/testimonials', label: 'Testimonials', icon: Icons.star },
      { to: '/admin/categories', label: 'Categories', icon: Icons.tag },
      { to: '/admin/company-logos', label: 'Company Logos', icon: Icons.image },
    ],
  },
  {
    label: 'Files',
    icon: Icons.upload,
    items: [
      { to: '/admin/file-uploads', label: 'File Uploads', icon: Icons.upload },
      { to: '/admin/file-shares', label: 'Client Shares', icon: Icons.share },
    ],
  },
  {
    label: 'Shop',
    icon: Icons.cart,
    items: [
      { to: '/admin/products', label: 'Products', icon: Icons.box },
      { to: '/admin/inventory', label: 'Inventory', icon: Icons.clipboard },
      { to: '/admin/orders', label: 'Orders', icon: Icons.receipt },
      { to: '/admin/customers', label: 'Customers', icon: Icons.users },
      { to: '/admin/discounts', label: 'Discounts', icon: Icons.percent },
      { to: '/admin/affiliates', label: 'Partners', icon: Icons.handshake },
      { to: '/admin/store-settings', label: 'Store', icon: Icons.sliders },
    ],
  },
  {
    label: 'Communications',
    icon: Icons.chat,
    items: [
      { to: '/admin/messages', label: 'Messages', icon: Icons.mail },
    ],
  },
  {
    label: 'System',
    icon: Icons.gear,
    items: [
      { to: '/admin/analytics', label: 'Analytics', icon: Icons.chart },
      { to: '/admin/settings', label: 'Settings', icon: Icons.gear },
    ],
  },
]

export default function AdminLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAdminStore()
  const { theme, setTheme } = useTheme()
  const [showMenu, setShowMenu] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const active = new Set<string>()
    for (const group of navGroups) {
      if (group.items.some(item => pathname === item.to || pathname.startsWith(item.to + '/'))) {
        active.add(group.label)
      }
    }
    return active
  })

  useEffect(() => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      for (const group of navGroups) {
        if (group.items.some(item => pathname === item.to || pathname.startsWith(item.to + '/'))) {
          next.add(group.label)
        }
      }
      return next
    })
  }, [pathname])

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
    <div className="flex min-h-screen bg-[#f4f2f0] dark:bg-[#06060c]">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(119,0,255,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(119,0,255,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-brand-500/5 blur-[120px] dark:bg-brand-400/8" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gold-500/5 blur-[120px] dark:bg-gold-400/6" />
      </div>

      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r sm:translate-x-0 transition-all duration-300 ease-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'bg-white/70 dark:bg-[#08080e]/92',
        'backdrop-blur-2xl',
        'border-black/[0.04] dark:border-white/[0.03]'
      )}
      >
        <div className="relative flex h-14 items-center gap-3 border-b px-4 border-black/[0.04] dark:border-white/[0.03]">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-500/[0.02] to-transparent dark:from-brand-400/[0.03]" />
          <Link to="/admin" className="relative flex shrink-0 items-center gap-2.5">
            <div className="relative">
              <img src="https://res.cloudinary.com/dr4fjf3a1/image/upload/f_auto,q_auto,w_28,h_28,c_fit/v1781723693/logo_u7assw.png" alt="Gifted" className="relative h-7 w-7 rounded-lg object-contain" />
              <div className="pointer-events-none absolute -inset-1 rounded-lg bg-brand-500/10 blur-sm dark:bg-brand-400/15" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-gray-800 dark:text-white/90">Admin</span>
          </Link>
          <Link to="/" className="relative ml-auto flex h-7 items-center rounded-lg px-2.5 text-[11px] font-medium text-gray-400 transition-colors hover:bg-black/[0.04] hover:text-gray-600 dark:text-white/30 dark:hover:bg-white/[0.06] dark:hover:text-white/50">
            View Site
          </Link>
        </div>

        <nav className="flex flex-col gap-0.5 p-3 flex-1 overflow-y-auto admin-scroll">
          <Link to="/admin" onClick={() => setSidebarOpen(false)}
            className={cn(
              'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
              pathname === '/admin'
                ? 'bg-brand-500/10 text-brand-600 dark:bg-brand-400/12 dark:text-brand-300 shadow-[0_0_20px_-8px_rgba(119,0,255,0.15)] dark:shadow-[0_0_24px_-8px_rgba(146,51,255,0.12)]'
                : 'text-gray-400 hover:bg-black/[0.04] hover:text-gray-600 dark:text-white/30 dark:hover:bg-white/[0.05] dark:hover:text-white/60'
            )}
          >
            {Icons.dashboard('h-4 w-4')}
            Dashboard
          </Link>

          {navGroups.map(group => {
            const isGroupActive = group.items.some(
              item => pathname === item.to || pathname.startsWith(item.to + '/')
            )
            const isExpanded = expandedGroups.has(group.label)

            return (
              <div key={group.label}>
                <button
                  onClick={() => {
                    setExpandedGroups(prev => {
                      const next = new Set(prev)
                      if (next.has(group.label)) next.delete(group.label)
                      else next.add(group.label)
                      return next
                    })
                  }}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isGroupActive
                      ? 'text-brand-600 dark:text-brand-300'
                      : 'text-gray-400 hover:bg-black/[0.04] hover:text-gray-600 dark:text-white/30 dark:hover:bg-white/[0.05] dark:hover:text-white/60'
                  )}
                >
                  <span className={cn(
                    'transition-transform duration-200',
                    isGroupActive ? 'scale-110' : 'group-hover:scale-110'
                  )}>
                    {group.icon('h-4 w-4')}
                  </span>
                  <span className="flex-1 text-left">{group.label}</span>
                  <svg className={cn(
                    'h-3 w-3 transition-all duration-200',
                    isExpanded ? 'rotate-180 opacity-100' : 'opacity-40 group-hover:opacity-70'
                  )} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="ml-3 mt-0.5 space-y-0.5 border-l border-black/[0.06] pl-2.5 dark:border-white/[0.04]">
                    {group.items.map((item, idx) => {
                      const isActive = pathname === item.to || pathname.startsWith(item.to + '/')
                      return (
                        <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                            isActive
                              ? 'bg-brand-500/10 text-brand-600 dark:bg-brand-400/12 dark:text-brand-300 shadow-[0_0_16px_-8px_rgba(119,0,255,0.1)] dark:shadow-[0_0_20px_-8px_rgba(146,51,255,0.1)]'
                              : 'text-gray-400 hover:bg-black/[0.04] hover:text-gray-600 dark:text-white/30 dark:hover:bg-white/[0.05] dark:hover:text-white/60'
                          )}
                          style={{ animationDelay: `${idx * 30}ms` }}
                        >
                          {item.icon('h-3.5 w-3.5')}
                          {item.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="relative border-t p-3 border-black/[0.04] dark:border-white/[0.03]">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-500/[0.015] to-transparent dark:from-brand-400/[0.02]" />
          {user && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-gray-400 transition-colors hover:bg-black/[0.04] hover:text-gray-600 dark:text-white/30 dark:hover:bg-white/[0.05] dark:hover:text-white/60"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-[11px] font-medium text-brand-600 dark:text-brand-300">
                  {user.email?.[0].toUpperCase()}
                </span>
                <span className="truncate">{user.email}</span>
                <svg className={cn('ml-auto h-3 w-3 transition-transform duration-200', showMenu && 'rotate-180')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
              </button>
              {showMenu && (
                <div className="absolute bottom-full left-0 right-0 z-20 mb-2 overflow-hidden rounded-xl bg-white/90 dark:bg-[#0a0a14]/90 backdrop-blur-2xl p-1.5 shadow-lg shadow-black/[0.08] dark:shadow-black/[0.3] border border-black/[0.04] dark:border-white/[0.04]">
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
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-md sm:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="relative z-10 flex min-w-0 flex-1 flex-col sm:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4 border-black/[0.04] bg-[#f4f2f0]/60 backdrop-blur-xl dark:bg-[#06060c]/60 dark:border-white/[0.03]">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 to-transparent dark:from-white/[0.02]" />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="relative flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-black/[0.04] sm:hidden dark:text-white/30 dark:hover:bg-white/[0.05]"
            aria-label="Toggle sidebar"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>

          <div className="relative flex-1" />

          <div className="relative flex items-center gap-1">
            <NotificationBell />
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-black/[0.04] dark:text-white/30 dark:hover:bg-white/[0.05]"
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

        <main className="relative flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="relative">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
