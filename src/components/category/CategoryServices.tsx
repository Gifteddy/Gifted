import { motion } from 'framer-motion'
import { LiquidGlass } from '@/components/ui/LiquidGlass'
import { useTheme } from '@/store/theme'
import type { CategoryConfig } from '@/lib/categories'

export function CategoryServices({ category }: { category: CategoryConfig }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <section id="services" className="relative overflow-hidden px-4 py-24 sm:py-32">
      <div className={`absolute inset-0 transition-colors duration-500 ${
        isDark ? 'bg-transparent' : 'bg-gray-50/80'
      }`} />
      <div className={`absolute inset-0 transition-opacity duration-500 ${
        isDark ? 'opacity-100' : 'opacity-0'
      }`} style={{ background: `linear-gradient(to bottom, transparent, ${category.accentColor}08, transparent)` }} />
      <div className="relative mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.6 }}
          className="mb-16 text-center">
          <span className="mb-4 block text-xs font-semibold tracking-widest uppercase" style={{ color: category.accentColor }}>What We Offer</span>
          <h2 className={`font-display text-3xl font-bold sm:text-4xl lg:text-5xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {category.name} <span className="text-gradient">Services</span>
          </h2>
          <p className={`mt-4 max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{category.description}</p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {category.subServices.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}>
              <LiquidGlass className="group rounded-2xl p-6 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1" intensity="subtle">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${category.accentColor}18`, color: category.accentColor }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className={`mb-2 text-lg font-semibold transition-colors ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{s.title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{s.description}</p>
              </LiquidGlass>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
