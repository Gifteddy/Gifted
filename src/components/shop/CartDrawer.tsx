import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart, cartKey } from '@/store/cart'
import { CLOUDINARY_BASE } from '@/lib/images'
import { formatCurrency } from '@/lib/currency'

export default function CartDrawer() {
  const navigate = useNavigate()
  const { items, drawerOpen, closeDrawer, removeItem, updateQuantity, itemCount, subtotal } = useCart()
  const count = itemCount()

  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDrawer() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [drawerOpen, closeDrawer])

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-[210] w-full max-w-md bg-surface-light dark:bg-surface-dark border-l border-black/[0.06] dark:border-white/[0.08] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.06] dark:border-white/[0.08]">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white/90">Cart</h2>
                {count > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-500/10 px-1.5 text-[10px] font-bold text-brand-600 dark:text-brand-400">
                    {count}
                  </span>
                )}
              </div>
              <button onClick={closeDrawer} className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors" aria-label="Close cart">
                <svg className="h-4 w-4 text-gray-500 dark:text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Items */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-black/[0.03] dark:bg-white/[0.04]">
                  <svg className="h-7 w-7 text-gray-300 dark:text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-white/50">Your cart is empty</p>
                <p className="mt-1 text-xs text-gray-400 dark:text-white/30">Add some products to get started.</p>
                <button onClick={() => { closeDrawer(); navigate('/shop') }}
                  className="mt-6 rounded-full bg-brand-500 px-6 py-2.5 text-xs font-semibold text-white hover:bg-brand-600 transition-colors active:scale-[0.97]">
                  Browse Shop
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {items.map(item => {
                    const key = cartKey(item)
                    return (
                      <motion.div
                        key={key}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        className="flex gap-3"
                      >
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06]">
                          <img
                            src={item.thumbnail.startsWith('http')
                              ? item.thumbnail.replace('/upload/', '/upload/f_auto,q_auto,w_64,h_64,c_fit/')
                              : `${CLOUDINARY_BASE}/f_auto,q_auto,w_64,h_64,c_fit/${item.thumbnail}`}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white/90 truncate leading-tight">{item.title}</p>
                          <p className="text-xs text-gray-500 dark:text-white/40 mt-0.5">{formatCurrency(item.price)}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1">
                              <button onClick={() => updateQuantity(key, item.quantity - 1)}
                                className="flex h-6 w-6 items-center justify-center rounded-lg border border-black/[0.06] dark:border-white/[0.08] text-xs hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors text-gray-600 dark:text-white/60">
                                −
                              </button>
                              <span className="w-6 text-center text-xs font-medium tabular-nums text-gray-900 dark:text-white/90">{item.quantity}</span>
                              <button onClick={() => updateQuantity(key, item.quantity + 1)}
                                className="flex h-6 w-6 items-center justify-center rounded-lg border border-black/[0.06] dark:border-white/[0.08] text-xs hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors text-gray-600 dark:text-white/60">
                                +
                              </button>
                            </div>
                            <span className="text-xs font-semibold text-gray-900 dark:text-white/90 tabular-nums">{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        </div>
                        <button onClick={() => removeItem(key)} className="self-start mt-0.5 flex h-6 w-6 items-center justify-center rounded-lg hover:bg-red-500/10 transition-colors group" aria-label="Remove item">
                          <svg className="h-3.5 w-3.5 text-gray-400 group-hover:text-red-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        </button>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Footer */}
                <div className="border-t border-black/[0.06] dark:border-white/[0.08] px-6 py-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-white/50">Subtotal</span>
                    <span className="text-base font-bold text-gray-900 dark:text-white/90">{formatCurrency(subtotal())}</span>
                  </div>
                  <button
                    onClick={() => { closeDrawer(); navigate('/shop/checkout') }}
                    className="w-full rounded-full bg-brand-500 py-3.5 text-sm font-semibold text-white transition-all hover:shadow-xl hover:shadow-brand-500/20 active:scale-[0.98]"
                  >
                    Checkout — {formatCurrency(subtotal())}
                  </button>
                  <button
                    onClick={() => { closeDrawer(); navigate('/shop') }}
                    className="w-full rounded-full border border-black/[0.06] dark:border-white/[0.08] py-3 text-xs font-medium text-gray-600 dark:text-white/50 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
