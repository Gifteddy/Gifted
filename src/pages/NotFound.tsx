import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { useTheme } from '@/store/theme'

const icons = [
  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15 9 22 9 16 14 18 22 12 17 6 22 8 14 2 9 9 9"/></svg>, x: 8, y: 15, depth: 0.5, anim: 0, dur: 22, size: 16 },
  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/></svg>, x: 84, y: 20, depth: 0.35, anim: 1, dur: 18, size: 12 },
  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12h14"/></svg>, x: 76, y: 76, depth: 0.3, anim: 2, dur: 26, size: 14 },
  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 22 12 12 22 2 12"/></svg>, x: 20, y: 82, depth: 0.6, anim: 0, dur: 20, size: 18 },
  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/></svg>, x: 50, y: 4, depth: 0.45, anim: 1, dur: 24, size: 14 },
  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 6l12 12M18 6l-12 12"/></svg>, x: 34, y: 92, depth: 0.2, anim: 2, dur: 16, size: 12 },
  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="4 17 10 11 14 15 20 9"/><polyline points="14 9 20 9 20 15"/></svg>, x: 92, y: 50, depth: 0.5, anim: 0, dur: 28, size: 16 },
  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 12h20M12 2v20"/></svg>, x: 62, y: 94, depth: 0.55, anim: 1, dur: 21, size: 14 },
  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4l16 16M20 4L4 20"/></svg>, x: 14, y: 48, depth: 0.3, anim: 2, dur: 19, size: 12 },
  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>, x: 45, y: 96, depth: 0.4, anim: 0, dur: 25, size: 16 },
  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>, x: 68, y: 30, depth: 0.45, anim: 1, dur: 23, size: 14 },
  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>, x: 30, y: 24, depth: 0.25, anim: 2, dur: 17, size: 12 },
]

const orbitDefs = [
  { name: 'orbit-a', x: [30, -20, -30, 20], y: [-15, -25, 15, 25] },
  { name: 'orbit-b', x: [20, -25, -20, 25], y: [-25, -10, 25, 10] },
  { name: 'orbit-c', x: [25, -30, -25, 30], y: [-10, -30, 10, 30] },
]

const orbitKeyframes = orbitDefs.map((o) => {
  const steps = o.x.map((_, j) => `${j * 25}% { transform: translate(${o.x[j]}px, ${o.y[j]}px); }`).join('\n')
  return `@keyframes ${o.name} { ${steps} 100% { transform: translate(${o.x[0]}px, ${o.y[0]}px); } }`
}).join('\n')

function rand(n: number) {
  return Math.floor(Math.random() * n)
}

function glitchKf(name: string, steps = 20) {
  const frames: string[] = []
  for (let i = 0; i <= steps; i++) {
    const top = rand(160)
    const bot = rand(160)
    frames.push(`${((i / steps) * 100).toFixed(1)}% { clip: rect(${top}px, 600px, ${bot}px, 30px); }`)
  }
  return `@keyframes ${name} { ${frames.join(' ')} }`
}

export default function NotFound() {
  const ref = useRef<HTMLDivElement>(null)
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 })
  const [hovered, setHovered] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      setMouse({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <section ref={ref} className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-20 overflow-hidden bg-surface-light dark:bg-surface-dark">
      <style>{orbitKeyframes}</style>
      <style>{glitchKf('g1') + glitchKf('g2')}</style>

      <div className="pointer-events-none absolute inset-0">
        {icons.map((s, i) => {
          const dx = (mouse.x - 0.5) * 40 * s.depth
          const dy = (mouse.y - 0.5) * 40 * s.depth
          const def = orbitDefs[s.anim]
          return (
            <div key={i} className="absolute" style={{ left: `${s.x}%`, top: `${s.y}%` }}>
              <div
                className="text-brand-500/55 dark:text-white/40"
                style={{
                  width: `${s.size}px`, height: `${s.size}px`,
                  animation: `${def.name} ${s.dur}s ease-in-out infinite`,
                  animationDelay: `-${i * 1.5}s`,
                }}
              >
                <div style={{ transform: `translate(${dx}px, ${dy}px)`, transition: 'transform 0.2s ease-out', willChange: 'transform' }}>
                  {s.icon}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative text-center"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className="relative inline-block select-none overflow-hidden"
          style={{ padding: '30px' }}
        >
          <span className="block font-display text-8xl font-bold text-gradient sm:text-9xl leading-none">
            404
          </span>

          <span
            aria-hidden="true"
            className="absolute inset-0 font-display text-8xl font-bold sm:text-9xl leading-none pointer-events-none"
            style={{
              padding: '30px',
              color: isDark ? 'white' : '#1a1a1a',
              fontWeight: 800,
              background: isDark ? 'black' : 'white',
              overflow: 'hidden',
              left: '3px',
              textShadow: '-2px 0 red',
              clip: 'auto',
              animation: hovered ? 'g1 2s linear infinite alternate-reverse' : 'none',
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.15s',
            }}
          >
            404
          </span>

          <span
            aria-hidden="true"
            className="absolute inset-0 font-display text-8xl font-bold sm:text-9xl leading-none pointer-events-none"
            style={{
              padding: '30px',
              color: isDark ? 'white' : '#1a1a1a',
              fontWeight: 800,
              background: isDark ? 'black' : 'white',
              overflow: 'hidden',
              left: '-3px',
              textShadow: '-2px 0 blue',
              clip: 'auto',
              animation: hovered ? 'g2 2s linear infinite alternate-reverse' : 'none',
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.15s',
            }}
          >
            404
          </span>
        </div>

        <h1 className="mt-4 font-display text-2xl font-bold sm:text-3xl"
          style={hovered ? { color: isDark ? 'white' : '#1a1a1a' } : undefined}
        >
          Page Not Found
        </h1>
        <p className="mt-4 text-text-muted-light dark:text-text-muted-dark">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button href="/">Go Home</Button>
          <Button href="/projects" variant="secondary">View Projects</Button>
        </div>
      </motion.div>
    </section>
  )
}
