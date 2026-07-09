import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { getAllInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } from '@/lib/commerce-queries'
import { cn } from '@/lib/utils'
import type { InventoryItem } from '@/lib/commerce-types'

const COLORS = ['Black', 'White', 'Navy', 'Red', 'Blue', 'Green', 'Grey', 'Yellow', 'Purple', 'Orange']
const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']

export default function AdminInventory() {
  const [items, setItems] = useState<(InventoryItem & { product: any })[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<InventoryItem | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [form, setForm] = useState({ product_id: '', variant_label: '', color: '', size: '', stock: 1, sku: '' })
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const [inv, prods] = await Promise.all([
        getAllInventory(),
        supabase.from('products').select('id, title, type').eq('published', true).order('title').then(r => r.data || []),
      ])
      setItems(inv)
      setProducts(prods)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  function openCreate() {
    setEditItem(null)
    setForm({ product_id: products[0]?.id || '', variant_label: '', color: '', size: '', stock: 1, sku: '' })
    setShowModal(true)
  }

  function openEdit(item: InventoryItem) {
    setEditItem(item)
    setForm({
      product_id: item.product_id,
      variant_label: item.variant_label,
      color: item.color || '',
      size: item.size || '',
      stock: item.stock,
      sku: item.sku || '',
    })
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.product_id || (!form.variant_label && !form.color && !form.size)) return
    setSaving(true)
    try {
      const label = form.variant_label || [form.color, form.size].filter(Boolean).join(' - ') || 'Default'
      if (editItem) {
        await updateInventoryItem(editItem.id, { ...form, variant_label: label } as any)
      } else {
        await createInventoryItem({ ...form, variant_label: label } as any)
      }
      setShowModal(false)
      load()
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this inventory item?')) return
    try { await deleteInventoryItem(id); load() } catch (e) { console.error(e) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Inventory</h1>
          <p className="text-sm text-text-muted-light dark:text-text-muted-dark mt-1">Manage merch stock by color and size</p>
        </div>
        <button onClick={openCreate} className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-colors">
          + Add Variant
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-light dark:border-border-dark p-12 text-center">
          <p className="text-text-muted-light dark:text-text-muted-dark">No inventory items yet. Add variants to your physical products.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border-light dark:border-border-dark">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light dark:border-border-dark bg-black/[0.02] dark:bg-white/[0.02]">
                <th className="px-4 py-3 text-left font-medium">Product</th>
                <th className="px-4 py-3 text-left font-medium">Variant</th>
                <th className="px-4 py-3 text-left font-medium">Color</th>
                <th className="px-4 py-3 text-left font-medium">Size</th>
                <th className="px-4 py-3 text-left font-medium">SKU</th>
                <th className="px-4 py-3 text-right font-medium">Stock</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-border-light dark:border-border-dark last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3">{item.product?.title || 'Unknown'}</td>
                  <td className="px-4 py-3 font-medium">{item.variant_label}</td>
                  <td className="px-4 py-3"><span className="inline-block rounded-md bg-black/[0.04] dark:bg-white/[0.06] px-2 py-0.5 text-xs">{item.color || '—'}</span></td>
                  <td className="px-4 py-3">{item.size || '—'}</td>
                  <td className="px-4 py-3 text-xs text-text-muted-light dark:text-text-muted-dark">{item.sku || '—'}</td>
                  <td className={cn('px-4 py-3 text-right font-medium tabular-nums', item.stock <= 3 ? 'text-red-500' : item.stock <= 10 ? 'text-amber-500' : '')}>
                    {item.stock}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(item)} className="text-xs text-brand-500 hover:text-brand-600 mr-3">Edit</button>
                    <button onClick={() => handleDelete(item.id)} className="text-xs text-red-400 hover:text-red-500">Delete</button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-surface-dark p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="font-display text-lg font-semibold mb-4">{editItem ? 'Edit Variant' : 'Add Variant'}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-text-muted-light dark:text-text-muted-dark mb-1 block">Product</label>
                <select value={form.product_id} onChange={e => setForm(p => ({ ...p, product_id: e.target.value }))}
                  className="w-full rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-brand-500">
                  {products.map(p => <option key={p.id} value={p.id}>{p.title} ({p.type})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-text-muted-light dark:text-text-muted-dark mb-1 block">Color</label>
                  <select value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} className="w-full rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-brand-500">
                    <option value="">—</option>
                    {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-text-muted-light dark:text-text-muted-dark mb-1 block">Size</label>
                  <select value={form.size} onChange={e => setForm(p => ({ ...p, size: e.target.value }))} className="w-full rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-brand-500">
                    <option value="">—</option>
                    {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-text-muted-light dark:text-text-muted-dark mb-1 block">Variant Label (optional)</label>
                <input value={form.variant_label} onChange={e => setForm(p => ({ ...p, variant_label: e.target.value }))} placeholder="e.g. Black Tee - M" className="w-full rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-brand-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-text-muted-light dark:text-text-muted-dark mb-1 block">Stock Quantity</label>
                  <input type="number" min="0" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: parseInt(e.target.value) || 0 }))} className="w-full rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-brand-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-muted-light dark:text-text-muted-dark mb-1 block">SKU (optional)</label>
                  <input value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))} className="w-full rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-brand-500" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50">
                {saving ? 'Saving...' : editItem ? 'Update' : 'Create'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
