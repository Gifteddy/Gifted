import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ThemeToggle } from './ThemeToggle'
import { useTheme } from '@/store/theme'

interface ServiceItem {
  title: string
  href: string
  icon: React.ReactNode
}

const serviceItems: ServiceItem[] = [
  {
    title: 'Photography',
    href: '/photography',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  },
  {
    title: 'Video Production',
    href: '/video-production',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
  },
  {
    title: 'Graphic Design',
    href: '/graphic-design',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 19V5m0 0-7 7m7-7 7 7"/><path d="M12 3a9 9 0 1 0 9 9"/></svg>,
  },
  {
    title: 'Development',
    href: '/development',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  },
  {
    title: 'Photo Editing',
    href: '/photo-editing',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  },
]

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
]

function Chevron({ open: isOpen }: { open: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className="h-3.5 w-3.5"
      animate={{ rotate: isOpen ? 180 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <polyline points="6 9 12 15 18 9" />
    </motion.svg>
  )
}

export function Nav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [desktopServicesOpen, setDesktopServicesOpen] = useState(false)
  const { pathname } = useLocation()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const desktopServicesRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
    setServicesOpen(false)
    setDesktopServicesOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onPointerDown = (e: PointerEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    const timer = setTimeout(() => {
      window.addEventListener('pointerdown', onPointerDown)
    }, 0)
    return () => {
      window.removeEventListener('keydown', onKey)
      clearTimeout(timer)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  useEffect(() => {
    if (!desktopServicesOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDesktopServicesOpen(false)
    }
    const onPointerDown = (e: PointerEvent) => {
      if (desktopServicesRef.current && !desktopServicesRef.current.contains(e.target as Node)) {
        setDesktopServicesOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [desktopServicesOpen])

  const isActive = (to: string) => {
    if (to === '/') return pathname === '/'
    return pathname.startsWith(to)
  }

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[100] h-16 transition-all duration-500 ${
        scrolled
          ? 'bg-surface-light/75 dark:bg-surface-dark/75 backdrop-blur-2xl shadow-sm'
          : 'bg-surface-light/60 dark:bg-surface-dark/60 backdrop-blur-xl'
      }`}>
        <nav className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="relative z-10 flex items-center">
            <img src="https://res.cloudinary.com/dr4fjf3a1/image/upload/f_auto,q_auto/v1781723693/logo_u7assw.png" alt="Gifted" className="h-12 w-auto" />
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <Link to="/"
              className={`relative rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                isActive('/') && pathname === '/'
                  ? 'text-brand-500 dark:text-brand-400'
                  : 'text-text-muted-light dark:text-text-muted-dark hover:text-text-light dark:hover:text-text-dark'
              }`}
            >
              Home
              {isActive('/') && pathname === '/' && (
                <motion.div layoutId="nav-indicator" className="absolute inset-0 rounded-xl bg-brand-500/10 dark:bg-brand-500/15"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </Link>

            <li ref={desktopServicesRef} className="relative list-none">
              <button
                onClick={() => setDesktopServicesOpen(!desktopServicesOpen)}
                className={`relative flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  pathname === '/' && !navLinks.some(l => isActive(l.to))
                    ? 'text-brand-500 dark:text-brand-400'
                    : 'text-text-muted-light dark:text-text-muted-dark hover:text-text-light dark:hover:text-text-dark'
                }`}
              >
                Services
                <Chevron open={desktopServicesOpen} />
              </button>
              <AnimatePresence>
                {desktopServicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute top-full mt-2 w-56 overflow-hidden rounded-2xl border shadow-2xl"
                    style={{
                      borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)',
                      background: isDark
                        ? 'linear-gradient(135deg, rgba(15,15,22,0.96), rgba(10,10,18,0.94))'
                        : 'rgba(255,255,255,0.95)',
                      backdropFilter: isDark ? 'blur(16px) saturate(120%)' : 'blur(24px) saturate(180%)',
                      WebkitBackdropFilter: isDark ? 'blur(16px) saturate(120%)' : 'blur(24px) saturate(180%)',
                    }}
                  >
                    <div className="max-h-[70vh] overflow-y-auto p-2">
                      {serviceItems.map(s => (
                        <Link key={s.title} to={s.href}
                          onClick={() => setDesktopServicesOpen(false)}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                            isDark
                              ? 'text-white/70 hover:bg-white/10 hover:text-white'
                              : 'text-gray-700 hover:bg-black/5 hover:text-gray-900'
                          }`}
                        >
                          <span className={`shrink-0 ${isDark ? 'text-brand-400' : 'text-brand-500'}`}>{s.icon}</span>
                          {s.title}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>

            {navLinks.slice(1).map(link => (
              <Link key={link.to + link.label} to={link.to}
                className={`relative rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'text-brand-500 dark:text-brand-400'
                    : 'text-text-muted-light dark:text-text-muted-dark hover:text-text-light dark:hover:text-text-dark'
                }`}
              >
                {link.label}
                {isActive(link.to) && (
                  <motion.div layoutId="nav-indicator" className="absolute inset-0 rounded-xl bg-brand-500/10 dark:bg-brand-500/15"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button ref={buttonRef}
              className="relative z-10 flex h-9 w-9 items-center justify-center rounded-xl md:hidden hover:bg-black/5 dark:hover:bg-white/5"
              onClick={() => setOpen(!open)} aria-label="Menu"
            >
              <div className="flex w-5 flex-col gap-1.5">
                <motion.span className="block h-0.5 w-full rounded-full bg-current" animate={open ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }} />
                <motion.span className="block h-0.5 w-full rounded-full bg-current" animate={open ? { opacity: 0 } : { opacity: 1 }} />
                <motion.span className="block h-0.5 w-full rounded-full bg-current" animate={open ? { rotate: -45, y: -8, width: '100%' } : { rotate: 0, y: 0 }} />
              </div>
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed z-[90] md:hidden"
            style={{ top: 80, left: 16, right: 16, width: 'calc(100vw - 32px)', maxWidth: 420 }}
          >
            <div
              className="relative overflow-hidden p-5"
              style={{
                borderRadius: 32,
                background: isDark
                  ? 'linear-gradient(135deg, rgba(0,0,0,0.94), rgba(0,0,0,0.88))'
                  : 'rgba(255,255,255,0.92)',
                boxShadow: isDark
                  ? '0px 16px 70px rgba(0,0,0,0.75), inset 0 0 0 0.5px rgba(255,255,255,0.10)'
                  : '0px 4px 30px rgba(0,0,0,0.08), inset 0 0 0 0.5px rgba(255,255,255,0.6)',
                backdropFilter: isDark ? 'blur(28px) saturate(170%)' : 'blur(20px) saturate(150%)',
                WebkitBackdropFilter: isDark ? 'blur(28px) saturate(170%)' : 'blur(20px) saturate(150%)',
              }}
            >
              <div className="flex flex-col gap-1">
                <Link to="/"
                  onClick={() => setOpen(false)}
                  className={`flex items-center min-h-[48px] rounded-2xl px-4 text-sm font-medium transition-colors duration-200 ${
                    isActive('/') && pathname === '/'
                      ? 'bg-brand-500/10 text-brand-500 dark:text-brand-400'
                      : isDark
                        ? 'text-gray-100 hover:bg-white/10'
                        : 'text-gray-800 hover:bg-black/5'
                  }`}
                >
                  Home
                </Link>

                <button
                  onClick={() => setServicesOpen(!servicesOpen)}
                  className={`flex items-center justify-between min-h-[48px] w-full rounded-2xl px-4 text-sm font-medium transition-colors duration-200 ${
                    pathname === '/' && !navLinks.some(l => isActive(l.to))
                      ? 'bg-brand-500/10 text-brand-500 dark:text-brand-400'
                      : isDark
                        ? 'text-gray-100 hover:bg-white/10'
                        : 'text-gray-800 hover:bg-black/5'
                  }`}
                >
                  <span>Services</span>
                  <Chevron open={servicesOpen} />
                </button>

                <AnimatePresence>
                  {servicesOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className={`ml-3 flex flex-col gap-0.5 pl-3 py-1 ${isDark ? 'border-l border-white/10' : 'border-l border-black/10'}`}>
                        {serviceItems.map(s => (
                          <Link key={s.title} to={s.href}
                            onClick={() => { setOpen(false); setServicesOpen(false) }}
                            className={`flex items-center gap-3 min-h-[44px] rounded-xl px-3 text-sm transition-colors ${
                              isDark
                                ? 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-black/5'
                            }`}
                          >
                            <span className={`shrink-0 ${isDark ? 'text-brand-400' : 'text-brand-500'}`}>{s.icon}</span>
                            {s.title}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {navLinks.slice(1).map(link => (
                  <Link key={link.to + link.label} to={link.to}
                    onClick={() => setOpen(false)}
                    className={`flex items-center min-h-[48px] rounded-2xl px-4 text-sm font-medium transition-colors duration-200 ${
                      isActive(link.to)
                        ? 'bg-brand-500/10 text-brand-500 dark:text-brand-400'
                        : isDark
                          ? 'text-gray-100 hover:bg-white/10'
                          : 'text-gray-800 hover:bg-black/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
