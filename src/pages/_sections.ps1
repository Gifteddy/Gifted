import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { LiquidGlass } from '@/components/ui/LiquidGlass'
import { useTheme } from '@/store/theme'
import { cn } from '@/lib/utils'
import { img, preload } from '@/lib/images'

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' } as const,
  transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
}

function ProgressiveImage({ src, alt, className, containerClassName }: {
  src: string; alt: string; className?: string; containerClassName?: string
}) {
  const [loaded, setLoaded] = useState(false)
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect() } },
      { rootMargin: '200px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className={cn('relative overflow-hidden', containerClassName)}>
      {inView && (
        <>
          <div className={cn('absolute inset-0 bg-gray-200 dark:bg-white/5', !loaded && 'animate-pulse')} />
          <img
            src={src}
            alt={alt}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className={cn(
              'w-full h-full object-cover transition-all duration-1000',
              loaded ? 'opacity-100 blur-0' : 'opacity-0 blur-xl scale-105',
              className,
            )}
          />
        </>
      )}
    </div>
  )
}

function FloatingOrbs({ dark }: { dark: boolean }) {
  const orbs = Array.from({ length: 4 }, (_, i) => ({
    size: 200 + Math.random() * 400,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: i * 2,
    duration: 8 + Math.random() * 8,
    colors: [
      adial-gradient(circle,  0%, transparent 70%),
      adial-gradient(circle,  0%, transparent 70%),
      adial-gradient(circle,  0%, transparent 70%),
      adial-gradient(circle,  0%, transparent 70%),
    ][i],
  }))

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ width: orb.size, height: orb.size, background: orb.colors, filter: 'blur(60px)' }}
          animate={{
            x: [orb.x, orb.x + (Math.random() - 0.5) * 30, orb.x],
            y: [orb.y, orb.y + (Math.random() - 0.5) * 30, orb.y],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: orb.duration, repeat: Infinity, delay: orb.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

function ScrollIndicator() {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.05], [1, 0])

  return (
    <motion.div style={{ opacity }} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
      <span className="text-[10px] tracking-[0.2em] uppercase text-gray-400 dark:text-white/40 font-medium">Scroll</span>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="w-[1px] h-8 bg-gradient-to-b from-gray-400 to-transparent dark:from-white/40"
      />
    </motion.div>
  )
}

function ParallaxLayer({ children, speed = 0.5, className }: { children: React.ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 100])

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  )
}

function HeroPortrait({ dark }: { dark: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const scale = useTransform(scrollYProgress, [0, 1], [1.1, 1.3])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.3])
  const y = useTransform(scrollYProgress, [0, 1], [0, 80])

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <motion.div className="absolute inset-0" style={{ scale, opacity, y }}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent dark:from-black/70 dark:via-black/40 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent dark:from-[#0a0a0f] z-10" />
        <img
          src={img(1)}
          alt="Gifted portrait"
          className="h-full w-full object-cover"
          style={{ objectPosition: '50% 30%' }}
        />
      </motion.div>
    </div>
  )
}

function IdentityTransition({ activeIndex }: { activeIndex: number }) {
  const images = [img(2), img(3), img(4), img(5)]
  const labels = ['Creator', 'Designer', 'Developer', 'Storyteller']

  return (
    <div className="relative w-full h-full">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={activeIndex}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.08, filter: 'blur(12px) brightness(0.8)' }}
          animate={{
            opacity: 1, scale: 1, filter: 'blur(0px) brightness(1)',
            transition: { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] },
          }}
          exit={{
            opacity: 0, scale: 0.95, filter: 'blur(8px) brightness(1.1)',
            transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
          }}
        >
          <div className="absolute inset-0 z-10 bg-gradient-to-tr from-black/50 via-transparent to-black/20" />
          <img
            src={images[activeIndex]}
            alt={Gifted as }
            className="h-full w-full object-cover"
            style={{ objectPosition: '50% 30%' }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function OSGallery({ activeSkill }: { activeSkill: number | null }) {
  const images = [img(6), img(7), img(8)]
  const [primary, setPrimary] = useState(0)

  useEffect(() => {
    if (activeSkill !== null) {
      setPrimary(Math.min(Math.floor(activeSkill / 4), 2))
    }
  }, [activeSkill])

  const floatingPositions = [
    { x: '60%', y: '10%', scale: 0.35, rotate: 4 },
    { x: '15%', y: '55%', scale: 0.3, rotate: -3 },
    { x: '70%', y: '65%', scale: 0.28, rotate: 5 },
  ]

  return (
    <div className="relative w-full aspect-[4/3] lg:aspect-[16/9]">
      <AnimatePresence mode="wait">
        <motion.div
          key={primary}
          className="absolute inset-0 rounded-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="absolute inset-0 z-10 rounded-2xl bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <img
            src={images[primary]}
            alt="Creative workspace"
            className="h-full w-full object-cover"
            style={{ objectPosition: '50% 30%' }}
          />
        </motion.div>
      </AnimatePresence>

      {images.map((src, i) => {
        if (i === primary) return null
        const pos = floatingPositions[i]
        const isActive = activeSkill !== null && Math.floor(activeSkill / 4) === i
        return (
          <motion.div
            key={i}
            className="absolute rounded-xl overflow-hidden shadow-2xl shadow-black/30"
            style={{
              left: pos.x, top: pos.y, width: '28%',
              aspectRatio: '3/4', rotate: pos.rotate,
              zIndex: isActive ? 20 : 5,
            }}
            animate={{ scale: isActive ? 1 : 0.9, opacity: isActive ? 1 : 0.5 }}
            transition={{ duration: 0.4 }}
          >
            <img src={src} alt="" className="h-full w-full object-cover" />
          </motion.div>
        )
      })}
    </div>
  )
}

function JourneyImage({ index }: { index: number }) {
  const images = [img(9), img(10), img(11), img(12)]
  const [loaded, setLoaded] = useState(false)
  const labels = ['Curiosity', 'Discovery', 'Creation', 'Impact']

  return (
    <motion.div
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.9, delay: index * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative aspect-[4/5] rounded-2xl overflow-hidden"
    >
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
      <div className={cn('absolute inset-0 bg-gray-200 dark:bg-white/5', !loaded && 'animate-pulse')} />
      <img
        src={images[index]}
        alt={labels[index]}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={cn(
          'h-full w-full object-cover transition-all duration-1000',
          loaded ? 'opacity-100 blur-0' : 'opacity-0 blur-xl scale-105',
        )}
        style={{ objectPosition: '50% 30%' }}
      />
      <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
        <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-white/50">
          Chapter {String(index + 1).padStart(2, '0')}
        </span>
        <h3 className="font-display text-2xl font-bold text-white mt-1">{labels[index]}</h3>
      </div>
    </motion.div>
  )
}

function PhilosophyImage({ index }: { index: number }) {
  const images = [img(13), img(14)]
  const [loaded, setLoaded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 1, delay: index * 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative aspect-square rounded-2xl overflow-hidden"
    >
      <div className={cn('absolute inset-0 bg-gray-200 dark:bg-white/5', !loaded && 'animate-pulse')} />
      <img
        src={images[index]}
        alt=""
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={cn(
          'h-full w-full object-cover transition-all duration-1000',
          loaded ? 'opacity-100 blur-0' : 'opacity-0 blur-xl scale-105',
        )}
        style={{
          objectPosition: '50% 30%',
          filter: 'grayscale(100%) contrast(1.3) brightness(0.85)',
        }}
      />
    </motion.div>
  )
}

function FutureImage({ index }: { index: number }) {
  const images = [img(15), img(16)]
  const [loaded, setLoaded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        'relative overflow-hidden rounded-2xl',
        index === 0 ? 'aspect-[4/3] lg:aspect-auto lg:h-96' : 'aspect-square lg:aspect-auto lg:h-72',
      )}
    >
      <div className={cn('absolute inset-0 bg-gray-200 dark:bg-white/5', !loaded && 'animate-pulse')} />
      <img
        src={images[index]}
        alt=""
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={cn(
          'h-full w-full object-cover transition-all duration-1000',
          loaded ? 'opacity-100 blur-0' : 'opacity-0 blur-xl scale-105',
        )}
        style={{ objectPosition: '50% 30%' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
    </motion.div>
  )
}

function AmbientPortraits() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const opacity1 = useTransform(scrollYProgress, [0.1, 0.3, 0.7, 0.9], [0, 0.06, 0.06, 0])
  const opacity2 = useTransform(scrollYProgress, [0.3, 0.5, 0.8, 0.95], [0, 0.04, 0.04, 0])

  return (
    <div ref={ref} className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      <motion.div className="absolute -right-20 top-1/4 w-96 h-128 opacity-0" style={{ opacity: opacity1 }}>
        <img src={img(19)} alt="" className="h-full w-full object-cover" />
      </motion.div>
      <motion.div className="absolute -left-20 bottom-1/4 w-80 h-112 opacity-0" style={{ opacity: opacity2 }}>
        <img src={img(20)} alt="" className="h-full w-full object-cover" />
      </motion.div>
    </div>
  )
}
