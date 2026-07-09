import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LiquidGlass } from '@/components/ui/LiquidGlass'
import { Skeleton } from '@/components/ui/Skeleton'
import { getOrderWithItems } from '@/lib/commerce-queries'
import { validateDownloadToken, getSignedDownloadUrl, incrementDownloadCount } from '@/lib/storage'
import { logDownload } from '@/lib/commerce-queries'
import { formatCurrency } from '@/lib/currency'
import type { Order, OrderItem } from '@/lib/commerce-types'

export default function OrderSuccess() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<(Order & { items: OrderItem[] }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)
  useEffect(() => {
    if (!id) return
    getOrderWithItems(id)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleDownload = async (item: OrderItem) => {
    if (!item.download_token || !item.id) return
    setDownloading(item.id)
    try {
      const validation = await validateDownloadToken(item.id, item.download_token)
      if (!validation.valid || !validation.filePath) {
        alert(validation.error || 'Download link is invalid or expired')
        setDownloading(null)
        return
      }
      const { url, error } = await getSignedDownloadUrl(validation.filePath)
      if (error || !url) {
        alert('Failed to generate download link. Please try again.')
        setDownloading(null)
        return
      }
      await Promise.all([
        incrementDownloadCount(item.id),
        logDownload(item.id, '', navigator.userAgent),
      ])
      window.open(url, '_blank')
    } catch {
      alert('Download failed. Please try again.')
    }
    setDownloading(null)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-surface-light dark:bg-surface-dark px-6 pt-32">
        <div className="mx-auto max-w-lg space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-surface-light dark:bg-surface-dark flex items-center justify-center px-6 pt-32">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold mb-4">Order Not Found</h1>
          <Link to="/shop" className="text-brand-500 dark:text-brand-400 hover:underline">Back to Shop</Link>
        </div>
      </main>
    )
  }

  const digitalItems = order.items.filter(i => i.product_type === 'digital' && i.download_token)

  return (
    <main className="min-h-screen bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark px-6 pt-28 pb-20">
      <div className="mx-auto max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <svg className="h-8 w-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <h1 className="font-display text-3xl font-bold sm:text-4xl mb-2">Thank You!</h1>
            <p className="text-text-muted-light dark:text-text-muted-dark">Your order is confirmed</p>
          </div>

          <LiquidGlass className="rounded-2xl p-6 mb-6" intensity="subtle">
            <p className="text-xs text-text-muted-light dark:text-text-muted-dark mb-1">Order Reference</p>
            <p className="font-mono text-sm font-semibold">{order.payment_reference}</p>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-text-muted-light dark:text-text-muted-dark">Status</p>
                <p className="font-medium capitalize">{order.status.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted-light dark:text-text-muted-dark">Total</p>
                <p className="font-medium">{formatCurrency(order.total)}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted-light dark:text-text-muted-dark">Payment</p>
                <p className="font-medium capitalize">{order.payment_status}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted-light dark:text-text-muted-dark">Date</p>
                <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            {order.tracking_number && (
              <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                <p className="text-xs text-text-muted-light dark:text-text-muted-dark">Tracking</p>
                <p className="font-medium text-sm">{order.tracking_number} {order.shipping_carrier && `via ${order.shipping_carrier}`}</p>
              </div>
            )}
          </LiquidGlass>

          <LiquidGlass className="rounded-2xl p-6 mb-6" intensity="subtle">
            <h2 className="font-display text-lg font-semibold mb-4">Items</h2>
            <div className="space-y-3">
              {order.items.map(item => {
                return (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b border-border-light dark:border-border-dark last:border-0">
                    <div>
                      <p className="text-sm font-medium">{item.product_title}</p>
                      <p className="text-xs text-text-muted-light dark:text-text-muted-dark">Qty: {item.quantity} × {formatCurrency(item.unit_price)}</p>
                    </div>
                    <p className="text-sm font-semibold">{formatCurrency(item.total_price)}</p>
                  </div>
                )
              })}
            </div>
          </LiquidGlass>

          {digitalItems.length > 0 && (
            <LiquidGlass className="rounded-2xl p-6" intensity="subtle">
              <h2 className="font-display text-lg font-semibold mb-4">Downloads</h2>
              <div className="space-y-3">
                {digitalItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b border-border-light dark:border-border-dark last:border-0">
                    <div>
                      <p className="text-sm font-medium">{item.product_title}</p>
                      <p className="text-xs text-text-muted-light dark:text-text-muted-dark">
                        Downloaded {item.download_count} time{item.download_count !== 1 ? 's' : ''}
                        {item.download_limit ? ` · ${item.download_limit} max` : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownload(item)}
                      disabled={downloading === item.id}
                      className="rounded-full bg-brand-500 px-5 py-2 text-xs font-semibold text-white hover:bg-brand-600 transition-colors disabled:opacity-50"
                    >
                      {downloading === item.id ? 'Preparing...' : 'Download'}
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-text-muted-light/60 dark:text-text-muted-dark/60">
                Secure download links expire in 7 days. Files are delivered via encrypted connection.
              </p>
            </LiquidGlass>
          )}

          <div className="mt-8 text-center">
            <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-brand-500 dark:text-brand-400 hover:underline">
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
