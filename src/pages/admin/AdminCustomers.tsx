import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getCustomers, getCustomerOrders } from '@/lib/commerce-queries'
import type { Customer, Order, OrderItem } from '@/lib/commerce-types'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerOrders, setCustomerOrders] = useState<(Order & { items: OrderItem[] })[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const c = await getCustomers()
      setCustomers(c)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function viewCustomer(c: Customer) {
    setSelectedCustomer(c)
    setOrdersLoading(true)
    try {
      const orders = await getCustomerOrders(c.id)
      setCustomerOrders(orders as any)
    } catch (e) { console.error(e) }
    setOrdersLoading(false)
  }

  const filtered = customers.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.id.includes(search)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Customers</h1>
          <p className="text-sm text-text-muted-light dark:text-text-muted-dark mt-1">{customers.length} total customers</p>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..."
          className="w-64 rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-light dark:border-border-dark p-12 text-center">
          <p className="text-text-muted-light dark:text-text-muted-dark">No customers yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
          <div className="overflow-x-auto rounded-2xl border border-border-light dark:border-border-dark">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-light dark:border-border-dark bg-black/[0.02] dark:bg-white/[0.02]">
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Phone</th>
                  <th className="px-4 py-3 text-right font-medium">Orders</th>
                  <th className="px-4 py-3 text-right font-medium">Spent</th>
                  <th className="px-4 py-3 text-right font-medium">Joined</th>
                  <th className="px-4 py-3 text-right font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-border-light dark:border-border-dark last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer"
                    onClick={() => viewCustomer(c)}
                  >
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-text-muted-light dark:text-text-muted-dark">{c.email}</td>
                    <td className="px-4 py-3 text-xs text-text-muted-light dark:text-text-muted-dark">{c.phone || '—'}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{c.total_orders}</td>
                    <td className="px-4 py-3 text-right tabular-nums">₦{c.total_spent.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-xs text-text-muted-light dark:text-text-muted-dark">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-brand-500 text-xs">View</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedCustomer && (
            <div className="rounded-2xl border border-border-light dark:border-border-dark p-5 space-y-4">
              <div>
                <h2 className="font-display text-lg font-semibold">{selectedCustomer.name}</h2>
                <p className="text-sm text-text-muted-light dark:text-text-muted-dark">{selectedCustomer.email}</p>
                {selectedCustomer.phone && <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1">{selectedCustomer.phone}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-black/[0.03] dark:bg-white/[0.05] p-3 text-center">
                  <p className="text-2xl font-bold tabular-nums">{selectedCustomer.total_orders}</p>
                  <p className="text-xs text-text-muted-light dark:text-text-muted-dark">Orders</p>
                </div>
                <div className="rounded-xl bg-black/[0.03] dark:bg-white/[0.05] p-3 text-center">
                  <p className="text-2xl font-bold tabular-nums">₦{selectedCustomer.total_spent.toLocaleString()}</p>
                  <p className="text-xs text-text-muted-light dark:text-text-muted-dark">Spent</p>
                </div>
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold mb-2">Order History</h3>
                {ordersLoading ? (
                  <div className="flex justify-center py-4"><div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" /></div>
                ) : customerOrders.length === 0 ? (
                  <p className="text-xs text-text-muted-light dark:text-text-muted-dark">No orders yet.</p>
                ) : (
                  <div className="space-y-2">
                    {customerOrders.slice(0, 5).map(o => (
                      <div key={o.id} className="flex items-center justify-between rounded-lg bg-black/[0.02] dark:bg-white/[0.03] px-3 py-2">
                        <div>
                          <p className="text-xs font-medium">#{o.id.slice(0, 8)}</p>
                          <p className="text-[10px] text-text-muted-light dark:text-text-muted-dark">{new Date(o.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium">₦{o.total.toLocaleString()}</p>
                          <p className="text-[10px] capitalize text-text-muted-light dark:text-text-muted-dark">{o.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
