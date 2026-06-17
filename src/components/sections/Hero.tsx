import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { FloatingIcons } from '@/components/ui/FloatingIcons'

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden px-4 pt-40 sm:pt-36 lg:pt-32">
      <FloatingIcons fixed={false} />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-brand-500/15 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gold-500/15 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative z-10">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}>
              <span className="mb-6 inline-block rounded-full border border-brand-500/20 bg-brand-500/10 px-4 py-1.5 text-xs font-medium tracking-widest uppercase text-brand-500 dark:text-brand-400">
                Creative Technologist
              </span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              className="font-display text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
              Design.{' '}<span className="text-gradient">Develop.</span><br /><span className="text-gradient">Storytell.</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="mt-6 max-w-lg text-lg leading-relaxed text-text-muted-light dark:text-text-muted-dark">
              Multidisciplinary creative technologist combining visual storytelling, design engineering, and digital experiences into one cohesive craft.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="mt-8 flex flex-wrap gap-4">
              <Button href="/projects">View Projects</Button>
              <Button href="/contact" variant="secondary">Get in Touch</Button>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative">
            <motion.img
              src="https://res.cloudinary.com/dr4fjf3a1/image/upload/f_auto,q_auto/v1781724436/heo_avdylx.png" alt="Gifted" loading="eager" decoding="async" fetchPriority="high"
              className="ml-auto h-auto max-w-lg w-full"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2 text-xs text-text-muted-light dark:text-text-muted-dark">
          <span className="tracking-widest uppercase">Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }} className="h-8 w-[1px] bg-current" />
        </div>
      </motion.div>
    </section>
  )
}
