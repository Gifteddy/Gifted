import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Nav } from './Nav'
import { Footer } from './Footer'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const } },
}

export function AnimatedLayout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div key={pathname} variants={pageVariants} initial="initial" animate="enter" exit="exit">
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
