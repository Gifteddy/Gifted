import { motion } from 'framer-motion'

const bio = 'I bridge the gap between design and engineering, creating digital experiences that are as functional as they are beautiful.'

const stats = [
  { value: '5+', label: 'Years Experience' },
  { value: '50+', label: 'Projects Delivered' },
  { value: '30+', label: 'Happy Clients' },
  { value: '10+', label: 'Industries Served' },
]

export function About() {
  return (
    <section className="relative overflow-hidden px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}>
            <span className="mb-4 block text-xs font-semibold tracking-widest uppercase text-brand-500 dark:text-brand-400">About</span>
            <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">Crafting Digital<br /><span className="text-gradient">Experiences</span></h2>
            <p className="mt-6 leading-relaxed text-text-muted-light dark:text-text-muted-dark">{bio}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }} className="grid grid-cols-2 gap-4">
            {stats.map(stat => (
              <div key={stat.label} className="rounded-2xl border border-border-light dark:border-border-dark bg-surface-secondary-light dark:bg-surface-secondary-dark p-6 text-center">
                <div className="font-display text-3xl font-bold text-gradient sm:text-4xl">{stat.value}</div>
                <div className="mt-1 text-xs text-text-muted-light dark:text-text-muted-dark">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
