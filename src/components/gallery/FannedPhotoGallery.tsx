import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Dispatch, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, SetStateAction } from 'react'
import { CARD_IMG_OPS, LIGHTBOX_IMG_OPS, cdnImage } from '@/lib/image'

interface FannedPhotoGalleryProps {
  images: string[]
  title: string
  categories?: string[]
  lbIndex: number | null
  onLbIndexChange: Dispatch<SetStateAction<number | null>>
}

interface FanPose {
  x: number
  r: number
  s: number
  b: number
  o: number
}

const SPREAD_X = [45, 90, 135, 180]
const FAN_ROT = [8, 16, 24, 35]
const FAN_SCALE = [0.93, 0.86, 0.79, 0.72]
const FAN_BLUR = [1, 3, 5, 7]
const FAN_OPACITY = [0.85, 0.6, 0.4, 0.2]

const MAX_SIDE = SPREAD_X.length
const MIN_ZOOM = 0.5
const MAX_ZOOM = 4
const CARD_WIDTH = 'min(400px, 85vw)'

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

function circularOffset(index: number, active: number, total: number) {
  let diff = index - active
  const half = total / 2
  if (diff > half) diff -= total
  else if (diff < -half) diff += total
  return diff
}

const STYLE = `
@keyframes fpgFloatA { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(50px, -36px) scale(1.14); } }
@keyframes fpgFloatB { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-44px, 30px) scale(1.1); } }
@keyframes fpgFloatC { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(34px, -26px) scale(1.18); } }
@keyframes fpgEnter { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: none; } }
@keyframes fpgBob { 0%, 100% { transform: translateY(0); opacity: 0.45; } 50% { transform: translateY(7px); opacity: 1; } }
.fpg-enter { animation: fpgEnter 700ms cubic-bezier(0.22, 1, 0.36, 1) both; }
.fpg-cue { animation: fpgBob 2.2s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .fpg-orb { animation: none !important; }
  .fpg-enter { animation-duration: 1ms; }
  .fpg-cue { animation: none !important; }
}
`

const ORBS = [
  { size: 540, pos: { left: '-10%', top: '-14%' }, anim: 'fpgFloatA 22s ease-in-out infinite', dark: 'rgba(139,26,79,0.55)', light: 'rgba(139,26,79,0.16)' },
  { size: 470, pos: { right: '-7%', top: '16%' }, anim: 'fpgFloatB 26s ease-in-out infinite', dark: 'rgba(255,201,74,0.38)', light: 'rgba(255,201,74,0.30)' },
  { size: 400, pos: { left: '28%', bottom: '-16%' }, anim: 'fpgFloatC 30s ease-in-out infinite', dark: 'rgba(190,24,93,0.32)', light: 'rgba(190,24,93,0.13)' },
  { size: 260, pos: { left: '6%', bottom: '8%' }, anim: 'fpgFloatA 34s ease-in-out infinite reverse', dark: 'rgba(255,201,74,0.22)', light: 'rgba(255,201,74,0.22)' },
]

interface LightboxViewProps {
  src: string
  previewSrc: string
  alt: string
}

function LightboxView({ src, previewSrc, alt }: LightboxViewProps) {
  const [zoom, setZoom] = useState(1)
  const [zoomMode, setZoomMode] = useState<'fit' | 'one'>('fit')
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [naturalW, setNaturalW] = useState<number | null>(null)
  const [activePointers, setActivePointers] = useState(0)
  const [useHiRes, setUseHiRes] = useState(false)

  useEffect(() => {
    let alive = true
    const im = new window.Image()
    im.src = src
    const done = () => { if (alive) setUseHiRes(true) }
    if (typeof im.decode === 'function') im.decode().then(done).catch(() => {})
    else im.onload = done
    return () => { alive = false }
  }, [src])

  const imgRef = useRef<HTMLImageElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const pointersRef = useRef(new Map<number, { x: number; y: number }>())
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null)
  const panStartRef = useRef({ x: 0, y: 0 })
  const zoomRef = useRef(1)

  useEffect(() => {
    zoomRef.current = zoom
  }, [zoom])

  const zoomBy = useCallback(
    (factor: number) => setZoom(z => clamp(z * factor, MIN_ZOOM, MAX_ZOOM)),
    [],
  )
  const resetZoom = useCallback(() => {
    setZoom(1)
    setZoomMode('fit')
    setPan({ x: 0, y: 0 })
  }, [])

  const toggleZoomMode = useCallback(() => {
    if (zoomMode === 'fit') {
      const rect = imgRef.current?.getBoundingClientRect()
      const fitted = rect ? rect.width / zoom : null
      setZoom(fitted && naturalW ? clamp(naturalW / fitted, MIN_ZOOM, MAX_ZOOM) : 2)
      setZoomMode('one')
      setPan({ x: 0, y: 0 })
    } else {
      setZoom(1)
      setZoomMode('fit')
      setPan({ x: 0, y: 0 })
    }
  }, [zoomMode, zoom, naturalW])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      setZoom(z => clamp(z * (e.deltaY < 0 ? 1.12 : 1 / 1.12), MIN_ZOOM, MAX_ZOOM))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomBy(1.25) }
      else if (e.key === '-') { e.preventDefault(); zoomBy(1 / 1.25) }
      else if (e.key === '0') { e.preventDefault(); resetZoom() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoomBy, resetZoom])

  const onPointerDown = (e: ReactPointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    setActivePointers(pointersRef.current.size)
    if (pointersRef.current.size === 2) {
      const [a, b] = [...pointersRef.current.values()]
      pinchRef.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom: zoomRef.current }
    } else {
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
    }
  }

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!pointersRef.current.has(e.pointerId)) return
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pinchRef.current && pointersRef.current.size >= 2) {
      const [a, b] = [...pointersRef.current.values()]
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      if (pinchRef.current.dist > 0) {
        setZoom(clamp((pinchRef.current.zoom * dist) / pinchRef.current.dist, MIN_ZOOM, MAX_ZOOM))
      }
    } else if (pointersRef.current.size === 1 && zoom > 1) {
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      })
    }
  }

  const onPointerUp = (e: ReactPointerEvent) => {
    pointersRef.current.delete(e.pointerId)
    setActivePointers(pointersRef.current.size)
    if (pointersRef.current.size < 2) pinchRef.current = null
  }

  return (
    <>
      <div
        ref={wrapRef}
        className="relative flex max-h-full max-w-full items-center justify-center"
        style={{ touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={e => e.stopPropagation()}
      >
        <img
          ref={imgRef}
          src={useHiRes ? src : previewSrc}
          alt={alt}
          draggable={false}
          onLoad={e => setNaturalW(e.currentTarget.naturalWidth)}
          className="max-h-[88vh] max-w-[88vw] select-none rounded-2xl object-contain shadow-2xl"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transition: activePointers > 0 ? 'none' : 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)',
            ...(zoomMode === 'one' && naturalW
              ? { width: naturalW, maxWidth: 'none', maxHeight: 'none' }
              : {}),
          }}
        />
      </div>

      <div className="absolute bottom-5 left-5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => zoomBy(1.25)}
          aria-label="Zoom in (+)"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg leading-none text-white backdrop-blur-sm transition-colors hover:bg-white/20"
        >+</button>
        <button
          type="button"
          onClick={() => zoomBy(1 / 1.25)}
          aria-label="Zoom out (-)"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg leading-none text-white backdrop-blur-sm transition-colors hover:bg-white/20"
        >−</button>
        <button
          type="button"
          onClick={toggleZoomMode}
          aria-label={zoomMode === 'fit' ? 'View at 1:1 pixel size' : 'Fit image to screen'}
          className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
        >
          {zoomMode === 'fit' ? '1:1' : 'Fit'}
        </button>
      </div>

      <div className="absolute bottom-5 right-5 rounded-full bg-white/10 px-3 py-1.5 text-xs tabular-nums text-white/80 backdrop-blur-sm">
        {Math.round(zoom * 100)}%
      </div>
    </>
  )
}

export function FannedPhotoGallery({ images, title, categories, lbIndex, onLbIndexChange }: FannedPhotoGalleryProps) {
  const total = images.length
  const [active, setActive] = useState(0)
  const [hovered, setHovered] = useState<number | null>(null)
  const [dragDx, setDragDx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })
  const [vw, setVw] = useState(() => (typeof window === 'undefined' ? 1280 : window.innerWidth))

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const spread = Math.min(1.9, Math.max(1, vw / 1400))
  const fan: FanPose[] = useMemo(
    () => SPREAD_X.map((x, i) => ({ x: x * spread, r: FAN_ROT[i], s: FAN_SCALE[i], b: FAN_BLUR[i], o: FAN_OPACITY[i] })),
    [spread],
  )

  const sectionRef = useRef<HTMLElement>(null)
  const inViewRef = useRef(false)
  const movedRef = useRef(false)
  const dragRef = useRef({ down: false, startX: 0, startY: 0, axis: null as null | 'x' | 'y', dx: 0 })

  const goNext = useCallback(() => setActive(a => (a + 1) % total), [total])
  const goPrev = useCallback(() => setActive(a => (a - 1 + total) % total), [total])

  const stepLb = useCallback(
    (dir: number) => onLbIndexChange(i => (i === null ? i : (i + dir + total) % total)),
    [total, onLbIndexChange],
  )

  useEffect(() => {
    const el = sectionRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const obs = new IntersectionObserver(
      ([entry]) => { inViewRef.current = entry.isIntersecting },
      { threshold: 0.25 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      if (lbIndex !== null) {
        if (e.key === 'Escape') { e.preventDefault(); onLbIndexChange(null) }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); stepLb(-1) }
        else if (e.key === 'ArrowRight') { e.preventDefault(); stepLb(1) }
        return
      }
      if (!inViewRef.current || total < 2) return
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev() }
      else if (e.key === 'ArrowRight') { e.preventDefault(); goNext() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lbIndex, total, goNext, goPrev, stepLb, onLbIndexChange])

  useEffect(() => {
    if (lbIndex === null) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [lbIndex])

  const endDrag = useCallback(() => {
    const d = dragRef.current
    if (!d.down && !d.axis) return
    if (d.axis === 'x' && Math.abs(d.dx) > 60) {
      if (d.dx < 0) goNext()
      else goPrev()
    }
    d.down = false
    d.axis = null
    d.dx = 0
    setDragDx(0)
    setDragging(false)
    window.setTimeout(() => { movedRef.current = false }, 60)
  }, [goNext, goPrev])

  const onStagePointerDown = (e: ReactPointerEvent) => {
    if (lbIndex !== null) return
    dragRef.current = { down: true, startX: e.clientX, startY: e.clientY, axis: null, dx: 0 }
    movedRef.current = false
  }

  const onStagePointerMove = (e: ReactPointerEvent) => {
    const d = dragRef.current
    if (!d.down || lbIndex !== null) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    if (!d.axis && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      d.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
      if (d.axis === 'x') setDragging(true)
    }
    if (d.axis === 'x') {
      d.dx = dx
      setDragDx(dx)
      if (Math.abs(dx) > 8) movedRef.current = true
    }
  }

  const onCardClick = (i: number, off: number) => {
    if (movedRef.current) return
    if (off === 0) onLbIndexChange(active)
    else setActive(i)
  }

  const onActiveMouseMove = (e: ReactMouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    setTilt({ rx: -py * 10, ry: px * 12 })
  }

  const navBtn =
    'flex h-11 w-11 items-center justify-center rounded-full border border-stone-900/15 bg-black/[0.04] text-stone-700 backdrop-blur-md transition-all duration-300 hover:border-stone-900/35 hover:bg-black/10 hover:text-stone-900 active:scale-95 disabled:pointer-events-none disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/70 dark:border-white/15 dark:bg-white/5 dark:text-white/80 dark:hover:border-white/35 dark:hover:bg-white/15 dark:hover:text-white'

  return (
    <section
      ref={sectionRef}
      aria-roledescription="carousel"
      aria-label={`${title} photo gallery`}
      className="relative isolate flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#f8f2ec] py-16 sm:py-20 dark:bg-[#0a0509]"
    >
      <style>{STYLE}</style>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden dark:block">
        {ORBS.map((o, i) => (
          <div key={i} className="fpg-orb" style={{ position: 'absolute', width: o.size, height: o.size, ...o.pos, borderRadius: '9999px', filter: 'blur(85px)', background: `radial-gradient(circle at 45% 45%, ${o.dark}, transparent 70%)`, animation: o.anim }} />
        ))}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 90% at 50% 42%, transparent 42%, rgba(0,0,0,0.55) 100%)' }} />
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 dark:hidden">
        {ORBS.map((o, i) => (
          <div key={i} className="fpg-orb" style={{ position: 'absolute', width: o.size, height: o.size, ...o.pos, borderRadius: '9999px', filter: 'blur(90px)', background: `radial-gradient(circle at 45% 45%, ${o.light}, transparent 72%)`, animation: o.anim }} />
        ))}
      </div>

      <div className="fpg-enter relative z-10 flex w-full flex-1 flex-col items-center justify-center gap-7 px-4">

        <div
          className="relative grid w-full place-items-center"
          style={{ height: 'min(700px, 150vw)', touchAction: 'pan-y' }}
          onPointerDown={onStagePointerDown}
          onPointerMove={onStagePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={endDrag}
          onDragStart={e => e.preventDefault()}
        >
          {images.map((src, i) => {
            const off = circularOffset(i, active, total)
            const abs = Math.abs(off)
            const side = off < 0 ? -1 : 1
            const isActive = abs === 0
            const hidden = !isActive && abs > MAX_SIDE
            const pose = isActive ? null : fan[Math.min(abs, MAX_SIDE) - 1]
            const isHovered = hovered === i

            let sc = 1.05
            let op = 1
            let blur = 0
            let tx = 0
            let rot = 0
            let z = 100

            if (!isActive && pose) {
              tx = side * pose.x
              rot = side * pose.r
              sc = pose.s
              blur = pose.b
              op = pose.o
              z = 100 - abs * 10
              if (isHovered && !hidden) {
                sc = pose.s + 0.02
                op = 0.85
                blur = Math.max(pose.b - 1.5, 0)
              }
            } else if (isActive && isHovered && !dragging) {
              sc = 1.07
            }

            const isEngaged = isActive && (dragging || isHovered || tilt.rx !== 0 || tilt.ry !== 0)

            const transform = isActive
              ? isEngaged
                ? `translate(-50%, -50%) perspective(1100px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry + dragDx * 0.05}deg) translateX(${dragDx}px) scale(${sc})`
                : `translate(-50%, -50%) scale(${sc})`
              : `translate(-50%, -50%) translateX(${tx}px) rotate(${rot}deg) scale(${sc})`

            const boxShadow = isActive
              ? `0 40px 90px -24px rgba(0,0,0,${0.8}), 0 0 60px -10px rgba(139,26,79,${isHovered ? 0.5 : 0.28}), inset 0 0 0 1px rgba(255,255,255,0.14)`
              : isHovered && !hidden
                ? `0 24px 50px -20px rgba(0,0,0,0.7), 0 0 42px rgba(236,72,153,0.38), inset 0 0 0 1px rgba(244,114,182,0.55)`
                : `0 20px 45px -20px rgba(0,0,0,0.65), inset 0 0 0 1px rgba(255,255,255,0.08)`

            return (
              <button
                key={i}
                type="button"
                onClick={() => onCardClick(i, off)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => {
                  setHovered(h => (h === i ? null : h))
                  if (isActive) setTilt({ rx: 0, ry: 0 })
                }}
                onMouseMove={isActive ? onActiveMouseMove : undefined}
                aria-label={isActive ? `Open photo ${i + 1} of ${total}` : `Show photo ${i + 1} of ${total}`}
                aria-current={isActive}
                className="absolute left-1/2 top-1/2 select-none rounded-[24px] border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/70"
                style={{
                  width: CARD_WIDTH,
                  aspectRatio: '400 / 680',
                  cursor: 'pointer',
                  zIndex: z,
                  opacity: hidden ? 0 : op,
                  pointerEvents: hidden ? 'none' : 'auto',
                  filter: blur > 0 ? `blur(${blur}px)` : undefined,
                  boxShadow,
                  borderRadius: 24,
                  transform,
                  transition: dragging && isActive
                    ? 'none'
                    : `transform 400ms cubic-bezier(0.34, 1.35, 0.64, 1), filter 400ms cubic-bezier(0.22, 1, 0.36, 1), opacity 400ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 400ms cubic-bezier(0.22, 1, 0.36, 1)`,
                }}
              >
                <span className="block h-full w-full overflow-hidden rounded-[24px] bg-white/95 p-[5px]">
                  {abs <= MAX_SIDE + 1 ? (
                    <img
                      src={cdnImage(src, CARD_IMG_OPS)}
                      alt={`${title} — ${i + 1}`}
                      draggable={false}
                      loading={abs <= 2 ? 'eager' : 'lazy'}
                      decoding="async"
                      fetchPriority={isActive ? 'high' : 'auto'}
                      className="h-full w-full select-none object-cover"
                      style={{ borderRadius: 19 }}
                    />
                  ) : (
                    <span className="block h-full w-full" style={{ borderRadius: 19, background: 'linear-gradient(135deg, rgba(0,0,0,0.06), rgba(0,0,0,0.14))' }} />
                  )}
                </span>
              </button>
            )
          })}
        </div>

        {categories && categories.length > 0 && (
          <div className="flex max-w-full flex-wrap justify-center gap-2 px-4">
            {categories.map(name => (
              <span key={name} className="rounded-full border border-stone-900/10 bg-black/[0.04] px-3 py-1 text-xs font-medium capitalize text-stone-600 backdrop-blur-sm dark:border-white/10 dark:bg-white/10 dark:text-white/70">
                {name}
              </span>
            ))}
          </div>
        )}

        <h1 className="max-w-full px-4 text-center font-display text-3xl font-bold leading-tight text-stone-900 sm:text-4xl lg:text-5xl dark:text-white">
          {title}
        </h1>

        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-5">
            <button type="button" onClick={goPrev} disabled={total < 2} aria-label="Previous photo" className={navBtn}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <div className="min-w-[76px] rounded-full border border-stone-900/10 bg-black/[0.04] px-4 py-1.5 text-center text-sm tabular-nums text-stone-800 backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:text-white/80" role="status">
              {active + 1} / {total}
            </div>
            <button type="button" onClick={goNext} disabled={total < 2} aria-label="Next photo" className={navBtn}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
          {total > 1 && (
            <p className="text-center text-[11px] text-stone-500 dark:text-white/35">
              Click side cards to flip, center to expand · swipe or use arrow keys
            </p>
          )}
          <div aria-hidden="true" className="fpg-cue mt-1 text-stone-400 dark:text-white/30">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      {lbIndex !== null && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} image viewer`}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 sm:p-8"
          onClick={e => { if (e.target === e.currentTarget) onLbIndexChange(null) }}
        >
          <button
            type="button"
            onClick={() => onLbIndexChange(null)}
            aria-label="Close (Esc)"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); stepLb(-1) }}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:left-6"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); stepLb(1) }}
                aria-label="Next image"
                className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:right-6"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </>
          )}

          <LightboxView
            key={lbIndex}
            src={cdnImage(images[lbIndex], LIGHTBOX_IMG_OPS)}
            previewSrc={cdnImage(images[lbIndex], CARD_IMG_OPS)}
            alt={`${title} — ${lbIndex + 1}`}
          />

          <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm tabular-nums text-white backdrop-blur-sm">
            {lbIndex + 1} / {total}
          </div>
        </div>,
        document.body,
      )}
    </section>
  )
}
