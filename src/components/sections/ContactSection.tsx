import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { LiquidGlass } from '@/components/ui/LiquidGlass'
import { useTheme } from '@/store/theme'
import { img } from '@/lib/images'
export function ContactSection() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const contactRef = useRef<HTMLDivElement>(null)
  const contactBtnRef = useRef<HTMLButtonElement>(null)
  const contactDropdownRef = useRef<HTMLDivElement>(null)
  const [contactPos, setContactPos] = useState({ top: 0, left: 0 })
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(''); setLoading(true)
    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      subject: (form.elements.namedItem('subject') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
      preferred_contact: ((form.elements.namedItem('contact') as HTMLInputElement)?.value || 'email') as 'email' | 'whatsapp',
    }
    try {
      await (await import('@/lib/queries')).createContactMessage(data)
      setSent(true); form.reset(); setTimeout(() => setSent(false), 3000)
    } catch { setError('Failed to send message. Please try again.') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (!contactOpen) return
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      const insideButton = contactRef.current?.contains(target)
      const insideDropdown = contactDropdownRef.current?.contains(target)
      if (!insideButton && !insideDropdown) {
        setContactOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContactOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [contactOpen])

  return (
    <section className="relative px-6 py-32 lg:py-44">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-light dark:via-border-dark to-transparent" />

      <div className="mx-auto max-w-6xl">
          <div className="relative grid overflow-hidden rounded-3xl lg:grid-cols-5 lg:h-[500px]">
          <div className="relative lg:col-span-2 order-2 lg:order-1">
            <LiquidGlass intensity="pronounced" className="h-full rounded-none p-10 sm:p-16 lg:p-20">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <h2 className="font-display text-3xl font-bold leading-[1.1] sm:text-4xl lg:text-5xl">
                  Let&apos;s Build{' '}
                  <span className="text-gradient">Something</span> Remarkable.
                </h2>
                <p className="mt-6 max-w-lg text-sm leading-relaxed text-text-muted-light dark:text-text-muted-dark">
                  Great ideas deserve exceptional execution. Whether you&apos;re building a brand, telling a story, creating a product, or shaping an experience, let&apos;s create something people won&apos;t forget.
                </p>
                <div className="mt-10 flex flex-wrap gap-4">
                  <div ref={contactRef} className="relative">
                    <button ref={contactBtnRef} onClick={() => {
                        if (!contactOpen && contactBtnRef.current) {
                          const r = contactBtnRef.current.getBoundingClientRect()
                          setContactPos({ top: r.bottom + 8, left: r.left })
                        }
                        setContactOpen(!contactOpen)
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-7 py-3.5 text-sm font-semibold text-white transition-all duration-500 hover:shadow-xl hover:shadow-brand-500/30 hover:scale-[1.02]">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                      Get in Touch
                    </button>
                  </div>
                </div>
              </motion.div>
            </LiquidGlass>
          </div>
          <div className="relative lg:col-span-2 order-3 lg:order-2 min-h-full">
            <LiquidGlass intensity="pronounced" className="h-full rounded-none p-10 lg:p-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
              >
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input type="text" name="name" placeholder="Your Name" required
                      className="w-full rounded-xl border border-border-light bg-surface-secondary-light px-4 py-3 text-sm text-text-light placeholder:text-text-muted-light/60 focus:border-brand-500/50 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-text-dark dark:placeholder:text-text-muted-dark/50" />
                    <input type="email" name="email" placeholder="Your Email" required
                      className="w-full rounded-xl border border-border-light bg-surface-secondary-light px-4 py-3 text-sm text-text-light placeholder:text-text-muted-light/60 focus:border-brand-500/50 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-text-dark dark:placeholder:text-text-muted-dark/50" />
                  </div>
                  <input type="text" name="subject" placeholder="Subject" required
                    className="w-full rounded-xl border border-border-light bg-surface-secondary-light px-4 py-3 text-sm text-text-light placeholder:text-text-muted-light/60 focus:border-brand-500/50 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-text-dark dark:placeholder:text-text-muted-dark/50" />
                  <textarea name="message" placeholder="Your Message" rows={4} required
                    className="w-full resize-none rounded-xl border border-border-light bg-surface-secondary-light px-4 py-3 text-sm text-text-light placeholder:text-text-muted-light/60 focus:border-brand-500/50 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-text-dark dark:placeholder:text-text-muted-dark/50" />
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Sending...' : sent ? '✓ Message Sent!' : 'Send Message'}
                  </Button>
                </form>
              </motion.div>
            </LiquidGlass>
          </div>
          <div className="relative lg:col-span-1 order-1 lg:order-3 min-h-[200px] lg:min-h-full overflow-hidden">
            <img
              src={img(1)}
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-[50%_10%]"
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {contactOpen && (
          <motion.div ref={contactDropdownRef}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed w-64 overflow-hidden rounded-2xl border shadow-2xl z-50"
            style={{
              top: contactPos.top,
              left: contactPos.left,
              borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)',
              background: isDark
                ? 'linear-gradient(135deg, rgba(15,15,22,0.96), rgba(10,10,18,0.94))'
                : 'rgba(255,255,255,0.95)',
              backdropFilter: isDark ? 'blur(16px) saturate(120%)' : 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: isDark ? 'blur(16px) saturate(120%)' : 'blur(24px) saturate(180%)',
            }}
          >
            <div className="p-1.5">
              <a href="mailto:ibiamiheanyi@gmail.com"
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                  isDark ? 'text-gray-400 hover:bg-white/5 hover:text-gray-100' : 'text-gray-700 hover:bg-black/5 hover:text-gray-900'
                }`}>
                <svg className="h-5 w-5 shrink-0 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>
                ibiamiheanyi@gmail.com
              </a>
              <a href="https://wa.me/2347043881207" target="_blank" rel="noopener noreferrer"
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                  isDark ? 'text-gray-400 hover:bg-white/5 hover:text-gray-100' : 'text-gray-700 hover:bg-black/5 hover:text-gray-900'
                }`}>
                <svg className="h-5 w-5 shrink-0 text-brand-500" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                +234 704 388 1207
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
