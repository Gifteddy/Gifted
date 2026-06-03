import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { LiquidGlass } from '@/components/ui/LiquidGlass'
import { useTheme } from '@/store/theme'
import type { CategoryConfig } from '@/lib/categories'

export function CategoryCTA({ category }: { category: CategoryConfig }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <section className="relative overflow-hidden px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.6 }}>
          <LiquidGlass className={`relative overflow-hidden rounded-3xl p-8 sm:p-12 text-center transition-colors duration-500`} intensity="pronounced">
            <div className="pointer-events-none absolute inset-0 opacity-[0.12] dark:opacity-[0.18]"
              style={{ background: `radial-gradient(circle at 50% 0%, ${category.accentColor}, transparent 70%)` }} />
            <h2 className={`font-display text-3xl font-bold sm:text-4xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Let's Work Together</h2>
            <p className={`mt-4 max-w-xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Ready to bring your {category.name.toLowerCase()} project to life? Let's create something extraordinary together.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to="/contact"
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:brightness-110 shadow-lg"
                style={{ background: category.accentColor }}
              >
                Book a Project
              </Link>
              <a href="mailto:hello@gifted.com"
                className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300 hover:scale-105 border ${
                  isDark ? 'border-gray-700 text-gray-300 hover:bg-white/5' : 'border-gray-300 text-gray-700 hover:bg-black/5'
                }`}
              >
                Email Us
              </a>
              <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300 hover:scale-105 border ${
                  isDark ? 'border-gray-700 text-gray-300 hover:bg-white/5' : 'border-gray-300 text-gray-700 hover:bg-black/5'
                }`}
              >
                WhatsApp
              </a>
            </div>
          </LiquidGlass>
        </motion.div>
      </div>
    </section>
  )
}
