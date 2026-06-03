import { motion } from 'framer-motion'
import { useTheme } from '@/store/theme'
import type { CategoryConfig } from '@/lib/categories'

export function CategoryProcess({ category }: { category: CategoryConfig }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <section className={`relative overflow-hidden px-4 py-24 sm:py-32 transition-colors duration-500 ${isDark ? '' : 'bg-gray-50/80'}`}>
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.6 }}
          className="mb-16 text-center">
          <span className="mb-4 block text-xs font-semibold tracking-widest uppercase" style={{ color: category.accentColor }}>How We Work</span>
          <h2 className={`font-display text-3xl font-bold sm:text-4xl lg:text-5xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Our <span className="text-gradient">Process</span></h2>
        </motion.div>

        <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="pointer-events-none absolute top-12 left-[12.5%] right-[12.5%] hidden h-px lg:block"
            style={{
              background: `linear-gradient(90deg, transparent, ${category.accentColor}66, transparent)`,
            }}
          />

          {category.process.map((step, i) => (
            <motion.div key={step.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold transition-all duration-500 hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${category.accentColor}18, ${category.accentColor}08)`,
                  color: category.accentColor,
                  border: `2px solid ${category.accentColor}44`,
                  boxShadow: `0 0 24px ${category.accentColor}15`,
                }}
              >
                {i + 1}
              </div>
              <h3 className={`mb-2 text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{step.title}</h3>
              <p className={`max-w-xs text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
