import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LiquidGlass } from './LiquidGlass'
import { cn } from '@/lib/utils'

export type Treatment = 'color' | 'monochrome' | 'duotone' | 'soft-grain' | 'depth-blur' | 'light-bloom'

const treatments: Record<Treatment, string> = {
  color: '',
  monochrome: 'grayscale(100%) contrast(1.15) brightness(0.9)',
  duotone: 'sepia(0.3) saturate(2) hue-rotate(220deg) brightness(0.85) contrast(1.1)',
  'soft-grain': 'contrast(1.05) brightness(1.02)',
  'depth-blur': 'blur(2px) saturate(0.8) contrast(1.1)',
  'light-bloom': 'brightness(1.08) contrast(0.95) saturate(1.1)',
}

interface PortraitCardProps {
  src: string
  alt: string
  liquidGlass?: boolean
  glassIntensity?: 'subtle' | 'medium' | 'pronounced'
  className?: string
  priority?: boolean
  hover?: boolean
  rotate?: number
  onClick?: () => void
  treatment?: Treatment
  zoomDrift?: boolean
}

export function PortraitCard({
  src,
  alt,
  liquidGlass = false,
  glassIntensity = 'subtle',
  className,
  priority = false,
  hover = false,
  rotate = 0,
  onClick,
  treatment = 'color',
  zoomDrift = false,
}: PortraitCardProps) {
  const [loaded, setLoaded] = useState(false)
  const [inView, setInView] = useState(priority)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (priority) return
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          obs.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [priority])

  const imgEl = (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      onLoad={() => setLoaded(true)}
      className={cn(
        'w-full h-full object-cover transition-all duration-1000',
        loaded ? 'opacity-100 blur-0' : 'opacity-0 blur-lg',
      )}
      style={{ objectPosition: '50% 30%', filter: treatments[treatment] }}
    />
  )

  const image = zoomDrift ? (
    <motion.div
      initial={{ opacity: 0, scale: 1.05, y: 10 }}
      animate={inView && loaded ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn('relative overflow-hidden rounded-2xl', className)}
      style={{ rotate: rotate !== 0 ? `${rotate}deg` : undefined, willChange: 'transform' }}
    >
      {!loaded && <div className="absolute inset-0 bg-gray-200 dark:bg-white/5 animate-pulse rounded-2xl" />}
      <motion.div
        animate={{ scale: [1, 1.05, 1], x: [0, 8, 0], y: [0, -4, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="w-full h-full"
      >
        {imgEl}
      </motion.div>
    </motion.div>
  ) : (
    <motion.div
      initial={{ opacity: 0, scale: 1.05, y: 10 }}
      animate={inView && loaded ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn('relative overflow-hidden rounded-2xl', className)}
      style={{ rotate: rotate !== 0 ? `${rotate}deg` : undefined, willChange: 'transform' }}
    >
      {!loaded && <div className="absolute inset-0 bg-gray-200 dark:bg-white/5 animate-pulse rounded-2xl" />}
      {imgEl}
    </motion.div>
  )

  if (liquidGlass) {
    return (
      <div ref={ref} className={cn('group', onClick && 'cursor-pointer')} onClick={onClick}>
        <LiquidGlass intensity={glassIntensity} className="overflow-hidden rounded-2xl p-0">
          <motion.div
            className="relative"
            whileHover={hover ? { y: -4 } : {}}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className={cn('relative overflow-hidden rounded-2xl', className)} style={{ rotate: rotate !== 0 ? `${rotate}deg` : undefined }}>
              {!loaded && <div className="absolute inset-0 bg-gray-200 dark:bg-white/5 animate-pulse rounded-2xl" />}
              {imgEl}
            </div>
          </motion.div>
        </LiquidGlass>
      </div>
    )
  }

  return (
    <div ref={ref} className={cn('group', onClick && 'cursor-pointer')} onClick={onClick}>
      {hover ? (
        <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}>
          {image}
        </motion.div>
      ) : (
        image
      )}
    </div>
  )
}
