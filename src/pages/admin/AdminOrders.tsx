import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate, cn } from '@/lib/utils'
import { updateOrderShipping } from '@/lib/commerce-queries'
import { useToast } from '@/components/ui/Toast'
import type { Order, OrderItem, Customer } from '@/lib/commerce-types'

interface OrderWithRelations extends Order {
  items: OrderItem[]
  customer: Customer | null
}

const ORDER_STATUSES = ['pending', 'paid', 'in_production', 'ready_to_ship', 'shipped', 'delivered', 'cancelled', 'refunded']
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded']

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editTracking, setEditTracking] = useState<string | null>(null)
  const [trackingForm, setTrackingForm] = useState({ tracking_number: '', shipping_carrier: '' })
  const toast = useToast(s => s.add)

  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*), customer:customers(*)')
        .order('created_at', { ascending: false })
        .limit(500)
      if (error) throw error
      setOrders((data || []) as OrderWithRelations[])
    } catch (e) {
      toast('error', 'Failed to load orders.')
    }
    setLoading(false)
  }, [toast])

  useEffect(() => { loadOrders() }, [loadOrders])

  const handleStatusUpdate = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) { toast('error', 'Failed to update status.'); return }
    toast('success', `Order status updated to ${status.replace(/_/g, ' ')}.`)
    loadOrders()
  }

  const handlePaymentStatusUpdate = async (id: string, payment_status: string) => {
    const { error } = await supabase.from('orders').update({ payment_status, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) { toast('error', 'Failed to update payment status.'); return }
    toast('success', `Payment status updated to ${payment_status}.`)
    loadOrders()
  }

  const handleTrackingUpdate = async (id: string) => {
    try {
      await updateOrderShipping(id, {
        tracking_number: trackingForm.tracking_number,
        shipping_carrier: trackingForm.shipping_carrier,
        shipping_status: 'shipped',
        status: 'shipped',
      })
      setEditTracking(null)
      toast('success', 'Tracking info updated.')
      loadOrders()
    } catch {
      toast('error', 'Failed to update tracking.')
    }
  }

  const filtered = orders.filter(o => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (o.customer?.name || '').toLowerCase().includes(q) ||
      (o.customer?.email || '').toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q) ||
      (o.tracking_number || '').toLowerCase().includes(q)
    )
  })

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      paid: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      in_production: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      ready_to_ship: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      refunded: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    }
    return colors[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Orders</h1>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..." className="w-64 rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-light dark:border-border-dark p-12 text-center">
          <p className="text-text-muted-light dark:text-text-muted-dark text-sm">{search ? 'No matches.' : 'No orders yet.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <div key={order.id} className="rounded-2xl border border-border-light dark:border-border-dark overflow-hidden">
              <div className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{order.customer?.name || 'Unknown'}</span>
                      <span className="text-xs text-text-muted-light dark:text-text-muted-dark">{order.customer?.email}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-text-muted-light dark:text-text-muted-dark">
                      <span>₦{order.total.toLocaleString()}</span>
                      <span>·</span>
                      <span>{formatDate(order.created_at)}</span>
                      <span>·</span>
                      <span className="text-[10px]">#{order.id.slice(0, 8)}</span>
                    </div>
                    {order.tracking_number && (
                      <p className="mt-1 text-[10px] text-text-muted-light/60 dark:text-text-muted-dark/60">
                        Tracking: {order.tracking_number} {order.shipping_carrier ? `(${order.shipping_carrier})` : ''}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2 flex-wrap">
                    <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-medium', statusBadge(order.status))}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-medium', statusBadge(order.payment_status))}>
                      {order.payment_status}
                    </span>
                    <select value={order.status} onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      className="rounded-lg px-2 py-1.5 text-xs border border-border-light dark:border-border-dark bg-white/50 dark:bg-white/5 outline-none">
                      {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                    <select value={order.payment_status} onChange={(e) => handlePaymentStatusUpdate(order.id, e.target.value)}
                      className="rounded-lg px-2 py-1.5 text-xs border border-border-light dark:border-border-dark bg-white/50 dark:bg-white/5 outline-none">
                      {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {order.items.some(i => i.product_type === 'physical') && (
                      <button onClick={() => {
                        setEditTracking(editTracking === order.id ? null : order.id)
                        setTrackingForm({ tracking_number: order.tracking_number || '', shipping_carrier: order.shipping_carrier || '' })
                      }} className="rounded-lg px-2.5 py-1.5 text-xs text-brand-500 hover:bg-brand-500/10 transition-colors">
                        {order.tracking_number ? 'Update' : 'Track'}
                      </button>
                    )}
                    <button onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                      className="rounded-lg px-2.5 py-1.5 text-xs text-text-muted-light dark:text-text-muted-dark hover:bg-black/5 dark:hover:bg-white/5">
                      {expandedId === order.id ? '▲' : '▼'}
                    </button>
                  </div>
                </div>

                {editTracking === order.id && (
                  <div className="mt-3 pt-3 border-t border-border-light dark:border-border-dark flex gap-2">
                    <input value={trackingForm.tracking_number} onChange={e => setTrackingForm(f => ({ ...f, tracking_number: e.target.value }))}
                      placeholder="Tracking number" className="flex-1 rounded-lg border border-border-light dark:border-border-dark bg-white/50 dark:bg-white/5 px-3 py-2 text-xs outline-none" />
                    <input value={trackingForm.shipping_carrier} onChange={e => setTrackingForm(f => ({ ...f, shipping_carrier: e.target.value }))}
                      placeholder="Carrier (e.g. GIG)" className="w-32 rounded-lg border border-border-light dark:border-border-dark bg-white/50 dark:bg-white/5 px-3 py-2 text-xs outline-none" />
                    <button onClick={() => handleTrackingUpdate(order.id)} className="rounded-lg bg-brand-500 px-4 py-2 text-xs font-medium text-white">Save</button>
                  </div>
                )}
              </div>

              {expandedId === order.id && (
                <div className="border-t border-border-light dark:border-border-dark px-4 py-3">
                  {order.items.length === 0 ? (
                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark">No items.</p>
                  ) : (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-text-muted-light dark:text-text-muted-dark border-b border-border-light dark:border-border-dark">
                          <th className="pb-2 text-left font-medium">Product</th>
                          <th className="pb-2 text-left font-medium">Variant</th>
                          <th className="pb-2 text-left font-medium">Type</th>
                          <th className="pb-2 text-right font-medium">Qty</th>
                          <th className="pb-2 text-right font-medium">Price</th>
                          <th className="pb-2 text-right font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map(item => (
                          <tr key={item.id} className="border-b border-border-light/50 dark:border-border-dark/50">
                            <td className="py-2">{item.product_title}</td>
                            <td className="py-2 text-text-muted-light dark:text-text-muted-dark">
                              {[item.size, item.color].filter(Boolean).join(' / ')}
                              {item.options && Object.keys(item.options).length > 0 && (
                                <>{[item.size, item.color].filter(Boolean).length > 0 ? ', ' : ''}
                                {Object.entries(item.options).map(([, v]) => `${v}`).join(', ')}</>
                              )}
                              {!item.size && !item.color && (!item.options || Object.keys(item.options).length === 0) && '—'}
                            </td>
                            <td className="py-2 text-text-muted-light dark:text-text-muted-dark">{item.product_type}</td>
                            <td className="py-2 text-right">{item.quantity}</td>
                            <td className="py-2 text-right">₦{item.unit_price.toLocaleString()}</td>
                            <td className="py-2 text-right">₦{item.total_price.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr><td colSpan={5} className="pt-2 text-right text-text-muted-light dark:text-text-muted-dark">Subtotal</td>
                          <td className="pt-2 text-right">₦{order.subtotal.toLocaleString()}</td></tr>
                        {order.discount > 0 && (
                          <tr><td colSpan={5} className="text-right text-red-500">Discount</td>
                            <td className="text-right text-red-500">-₦{order.discount.toLocaleString()}</td></tr>
                        )}
                        <tr><td colSpan={5} className="text-right font-medium">Total</td>
                          <td className="text-right font-medium">₦{order.total.toLocaleString()}</td></tr>
                      </tfoot>
                    </table>
                  )}
                  {order.payment_reference && <p className="mt-2 text-[10px] text-text-muted-light/60">Ref: {order.payment_reference}</p>}
                  {order.discount_code && <p className="text-[10px] text-text-muted-light/60">Discount: {order.discount_code}</p>}
                  {order.shipping_address && (
                    <div className="mt-2 text-[10px] text-text-muted-light/60">
                      <p>Ship to: {JSON.stringify(order.shipping_address)}</p>
                      {order.shipping_city && <p>{order.shipping_city}, {order.shipping_state} {order.shipping_zip}</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
