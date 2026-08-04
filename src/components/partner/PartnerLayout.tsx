import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePartnerStore } from '@/store/partner'
import { useTheme } from '@/store/theme'
import { cn } from '@/lib/utils'
import { PARTNER_LEVELS } from '@/modules/partner/constants'
import PartnerNotificationBell from '@/components/partner/PartnerNotificationBell'
import { Meta } from '@/lib/meta'
import type { PartnerLevel } from '@/modules/partner/types'

function PartnerSvg({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg className={cn('shrink-0', className)} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  )
}

const PartnerIcons = {
  home: (c?: string) => <PartnerSvg className={c}><path d="M2 9l7-6 7 6" /><path d="M4 7.5V15a1 1 0 001 1h3v-4h2v4h3a1 1 0 001-1V7.5" /></PartnerSvg>,
  link: (c?: string) => <PartnerSvg className={c}><path d="M7.5 7l3-3a3 3 0 014.2 4.2l-2 2M10.5 11l-3 3a3 3 0 01-4.2-4.2l2-2" /></PartnerSvg>,
  box: (c?: string) => <PartnerSvg className={c}><path d="M2 5l7-3 7 3v9l-7 3-7-3V5z" /><path d="M9 7.5l7-3M9 7.5v10.5M9 7.5L2 4.5" /></PartnerSvg>,
  chart: (c?: string) => <PartnerSvg className={c}><rect x="3" y="8" width="3" height="7" rx=".5" /><rect x="7.5" y="5" width="3" height="10" rx=".5" /><rect x="12" y="2" width="3" height="13" rx=".5" /></PartnerSvg>,
  bell: (c?: string) => <PartnerSvg className={c}><path d="M14 6.5a5 5 0 00-10 0c0 5-2 6.5-2 6.5h14s-2-1.5-2-6.5" /><path d="M10.5 15a1.5 1.5 0 01-3 0" /></PartnerSvg>,
  star: (c?: string) => <PartnerSvg className={c}><polygon points="9,2 11.5,6.5 16.5,7.2 13,10.5 14,15.5 9,13 4,15.5 5,10.5 1.5,7.2 6.5,6.5" /></PartnerSvg>,
  folder: (c?: string) => <PartnerSvg className={c}><path d="M2 5a2 2 0 012-2h3l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" /></PartnerSvg>,
  user: (c?: string) => <PartnerSvg className={c}><circle cx="9" cy="6" r="3" /><path d="M3 16c0-3.3 2.7-6 6-6s6 2.7 6 6" /></PartnerSvg>,
  wallet: (c?: string) => <PartnerSvg className={c}><rect x="2" y="5" width="14" height="10" rx="1.5" /><path d="M2 7h14" /><circle cx="13" cy="10" r="1" /></PartnerSvg>,
  gear: (c?: string) => <PartnerSvg className={c}><circle cx="9" cy="9" r="2.5" /><path d="M9 2v2M9 14v2M2 9h2M14 9h2M4.2 4.2l1.4 1.4M12.4 12.4l1.4 1.4M4.2 13.8l1.4-1.4M12.4 5.6l1.4-1.4" /></PartnerSvg>,
  store: (c?: string) => <PartnerSvg className={c}><path d="M2 4l2-2h12l2 2" /><path d="M3 4v10a1 1 0 001 1h10a1 1 0 001-1V4" /><path d="M7 8h4" /></PartnerSvg>,
}

const navItems = [
  { to: '/shop/partners/dashboard', label: 'Dashboard', icon: PartnerIcons.home },
  { to: '/shop/partners/referrals', label: 'Referral Centre', icon: PartnerIcons.link },
  { to: '/shop/partners/products', label: 'Products', icon: PartnerIcons.box },
  { to: '/shop/partners/analytics', label: 'Analytics', icon: PartnerIcons.chart },
  { to: '/shop/partners/notifications', label: 'Notifications', icon: PartnerIcons.bell },
  { to: '/shop/partners/achievements', label: 'Achievements', icon: PartnerIcons.star },
  { to: '/shop/partners/resources', label: 'Resources', icon: PartnerIcons.folder },
  { to: '/shop/partners/profile', label: 'Profile', icon: PartnerIcons.user },
  { to: '/shop/partners/payouts', label: 'Payouts', icon: PartnerIcons.wallet },
]

function LevelBadge({ level }: { level: PartnerLevel }) {
  const config = PARTNER_LEVELS[level]
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none"
      style={{
        backgroundColor: `${config.color}18`,
        color: config.color,
        boxShadow: `0 0 8px ${config.color}15`,
      }}
    >
      {config.icon} {config.label}
    </span>
  )
}

export default function PartnerLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, partner, signOut } = usePartnerStore()
  const { theme, setTheme } = useTheme()
  const [showMenu, setShowMenu] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
    navigate('/shop/partners/login')
  }

  return (
    <div className="flex min-h-screen bg-[#f4f2f0] dark:bg-[#06060c]">
      <Meta title="Partner Dashboard" description="Gifted Partners dashboard." noindex nofollow />
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
          <Link to="/shop/partners/dashboard" className="relative flex shrink-0 items-center gap-2.5">
            <div className="relative">
              <img src="https://res.cloudinary.com/dr4fjf3a1/image/upload/f_auto,q_auto,w_28,h_28,c_fit/v1781723693/logo_u7assw.png" alt="Gifted" className="relative h-7 w-7 rounded-lg object-contain" />
              <div className="pointer-events-none absolute -inset-1 rounded-lg bg-brand-500/10 blur-sm dark:bg-brand-400/15" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-gray-800 dark:text-white/90">Partners</span>
          </Link>
          <Link to="/shop" className="relative ml-auto flex h-7 items-center rounded-lg px-2.5 text-[11px] font-medium text-gray-400 transition-colors hover:bg-black/[0.04] hover:text-gray-600 dark:text-white/30 dark:hover:bg-white/[0.06] dark:hover:text-white/50">
            View Store
          </Link>
        </div>

        {partner && (
          <div className="relative border-b px-4 py-3 border-black/[0.04] dark:border-white/[0.03]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-xs font-semibold text-brand-600 dark:text-brand-300">
                {partner.name?.[0]?.toUpperCase() || partner.email[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">{partner.name}</p>
                <LevelBadge level={partner.level} />
              </div>
            </div>
          </div>
        )}

        <nav className="flex flex-col gap-0.5 p-3 flex-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = pathname === item.to || pathname.startsWith(item.to + '/')
            return (
              <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-brand-500/10 text-brand-600 dark:bg-brand-400/12 dark:text-brand-300 shadow-[0_0_20px_-8px_rgba(119,0,255,0.15)] dark:shadow-[0_0_24px_-8px_rgba(146,51,255,0.12)]'
                    : 'text-gray-400 hover:bg-black/[0.04] hover:text-gray-600 dark:text-white/30 dark:hover:bg-white/[0.05] dark:hover:text-white/60'
                )}
              >
                <span className={cn(
                  'transition-transform duration-200',
                  isActive ? 'scale-110' : 'group-hover:scale-110'
                )}>
                  {item.icon('h-4 w-4')}
                </span>
                {item.label}
              </Link>
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
                  {partner?.name?.[0]?.toUpperCase() || user.email?.[0].toUpperCase()}
                </span>
                <span className="truncate">{partner?.name || user.email}</span>
                <svg className={cn('ml-auto h-3 w-3 transition-transform duration-200', showMenu && 'rotate-180')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
              </button>
              {showMenu && (
                <div className="absolute bottom-full left-0 right-0 z-20 mb-2 overflow-hidden rounded-xl bg-white/90 dark:bg-[#0a0a14]/90 backdrop-blur-2xl p-1.5 shadow-lg shadow-black/[0.08] dark:shadow-black/[0.3] border border-black/[0.04] dark:border-white/[0.04]">
                  <Link
                    to="/shop/partners/settings"
                    onClick={() => setShowMenu(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-gray-600 transition-colors hover:bg-black/[0.04] dark:text-white/50 dark:hover:bg-white/[0.05]"
                  >
                    {PartnerIcons.gear('h-3.5 w-3.5')}
                    Settings
                  </Link>
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
            <PartnerNotificationBell />
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
            <Link
              to="/shop"
              className="relative flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-black/[0.04] dark:text-white/30 dark:hover:bg-white/[0.05]"
              aria-label="View Store"
            >
              {PartnerIcons.store('h-4 w-4')}
            </Link>
          </div>
        </header>

        <main className="relative flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}
