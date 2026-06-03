import { useMemo } from 'react'
import { motion } from 'framer-motion'

const icons = [
  <svg key="code" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  <svg key="brush" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2 2 0 0 0 0-2.82 2 2 0 0 0-2.82 0z"/><path d="M9 8c-2 3-4 4-5 7 1.5 1.5 3 2 5 2 0-2 .5-4 2-6"/><path d="M6 16.5c-1.5 1.5-2 3.5-2 4.5 1 .5 2.5 0 4-1.5"/></svg>,
  <svg key="camera" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  <svg key="video" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
  <svg key="pen" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  <svg key="sparkles" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v4m0 10v4m-6-8H2m20 0h-4m-2.5-7.5L12 3l-3.5 3.5M12 21l3.5-3.5M4.5 4.5 7 7m10 10 2.5 2.5M4.5 19.5 7 17m10-10 2.5-2.5"/></svg>,
  <svg key="target" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  <svg key="bulb" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>,
  <svg key="music" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  <svg key="palette" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-1 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-5.5-4.5-10-10-10z"/></svg>,
  <svg key="monitor" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  <svg key="layers" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
]

const colors = ['#7700ff', '#9233ff', '#d4aa00', '#f5c800', '#ad66ff', '#a88600']

interface Particle { icon: React.ReactNode; color: string; x: number; delay: number; duration: number; size: number }

export function FloatingIcons({ fixed = true }: { fixed?: boolean }) {
  const particles = useMemo<Particle[]>(() =>
    Array.from({ length: 24 }, () => ({
      icon: icons[Math.floor(Math.random() * icons.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      x: Math.random() * 100,
      delay: Math.random() * 20,
      duration: 14 + Math.random() * 16,
      size: 0.7 + Math.random() * 0.6,
    })), [])

  return (
    <div className={`pointer-events-none ${fixed ? 'fixed' : 'absolute'} inset-0 z-0 overflow-hidden`}>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="floating-icon absolute"
          style={{
            left: `${p.x}%`, bottom: '-40px',
            width: `${p.size}rem`, height: `${p.size}rem`,
            color: p.color,
            filter: `drop-shadow(0 0 6px ${p.color}55) drop-shadow(0 0 12px ${p.color}22)`,
          }}
          animate={{
            y: [0, -1200],
            opacity: [0, 0.7, 0.5, 0],
            x: [0, (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 60],
            rotate: [0, (Math.random() - 0.5) * 60],
          }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'linear', repeatDelay: 2 }}
        >
          {p.icon}
        </motion.div>
      ))}
    </div>
  )
}
