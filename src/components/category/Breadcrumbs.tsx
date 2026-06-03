import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '@/store/theme'

export function Breadcrumbs({ category }: { category: string }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <nav className="flex items-center gap-2 text-sm pt-24 sm:pt-28 lg:pt-32 px-4 max-w-7xl mx-auto">
      <Link to="/" className={`transition-colors ${
        isDark ? 'text-gray-400 hover:text-brand-400' : 'text-gray-500 hover:text-brand-600'
      }`}>Home</Link>
      <span className={`${isDark ? 'text-gray-600' : 'text-gray-300'}`}>/</span>
      <motion.span
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        className="font-medium text-brand-600 dark:text-brand-400"
      >
        {category}
      </motion.span>
    </nav>
  )
}
