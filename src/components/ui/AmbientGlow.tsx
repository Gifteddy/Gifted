import { useEffect, useRef } from 'react'
import { useTheme } from '@/store/theme'

export function AmbientGlow() {
  const { theme } = useTheme()
    const isDark = theme === 'dark'
  const ref = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: 0.5, y: 0.5 })
  const smooth = useRef({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => { pos.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight } }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useEffect(() => {
    let frame: number
    const animate = () => {
      smooth.current.x += (pos.current.x - smooth.current.x) * 0.05
      smooth.current.y += (pos.current.y - smooth.current.y) * 0.05
      if (ref.current) {
        ref.current.style.background = `radial-gradient(600px at ${smooth.current.x * 100}% ${smooth.current.y * 100}%, ${
          isDark ? 'rgba(119,0,255,0.08) 0%, transparent 70%' : 'rgba(119,0,255,0.04) 0%, transparent 70%'
        })`
      }
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [isDark])

  return <div ref={ref} className="pointer-events-none fixed inset-0 z-0" style={{ opacity: isDark ? 1 : 0.6 }} />
}
