import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { useTheme } from '@/store/theme'
import type { CategoryConfig } from '@/lib/categories'

export function CategoryHero({ category }: { category: CategoryConfig }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden px-4 pb-24 pt-24">
      <div className={`pointer-events-none absolute inset-0 ${isDark ? '' : 'bg-white'}`} />
      <div className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${isDark ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: category.heroGradient }}
      />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 -right-48 h-96 w-96 rounded-full blur-[150px] transition-all duration-700"
          style={{ background: category.accentColor, opacity: isDark ? 0.2 : 0.08 }}
        />
        <div className="absolute -bottom-48 -left-48 h-96 w-96 rounded-full blur-[150px] transition-all duration-700"
          style={{ background: category.accentColor, opacity: isDark ? 0.15 : 0.05 }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl w-full">
        <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}>
            <span className="mb-6 inline-flex items-center gap-3 rounded-full border px-4 py-1.5 text-xs font-medium tracking-widest uppercase"
              style={{
                borderColor: `${category.accentColor}44`,
                backgroundColor: `${category.accentColor}1a`,
                color: category.accentColor,
              }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: category.accentColor }} />
              {category.name}
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            className={`font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            {category.name}
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className={`mt-6 max-w-2xl text-lg leading-relaxed ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            {category.shortDescription}
          </motion.p>

          <div className="mt-8 flex flex-wrap gap-3">
            {category.features.map((f, i) => (
              <motion.span key={f} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.08 }}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
                style={{
                  backgroundColor: `${category.accentColor}12`,
                  color: isDark ? `${category.accentColor}cc` : category.accentColor,
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {f}
              </motion.span>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Button href="/contact">Start a Project</Button>
            <Button href="#projects" variant="secondary">View Projects</Button>
          </motion.div>
        </div>

        <div className="relative">
          <motion.img
            src={category.heroImage}
            alt={category.name}
            className="h-auto w-full max-w-lg"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </div>
    </section>
  )
}
