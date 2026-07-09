import { useState, useEffect, useRef } from 'react'
import { useInView } from 'framer-motion'

export function useCounter(end: number, duration = 1500, startOnView = true) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const startedRef = useRef(false)
  const rafRef = useRef<number>()

  useEffect(() => {
    if (startOnView && !inView) return
    if (startedRef.current) return
    startedRef.current = true

    const startTime = performance.now()
    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * end))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [inView, startOnView, end, duration])

  return { value, ref }
}
