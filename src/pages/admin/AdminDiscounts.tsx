import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate, cn } from '@/lib/utils'
import type { DiscountCode } from '@/lib/commerce-types'

type EditorMode = 'create' | 'edit' | null

export default function AdminDiscounts() {
  const [codes, setCodes] = useState<DiscountCode[]>([])
  const [loading, setLoading] = useState(true)
  const [editorMode, setEditorMode] = useState<EditorMode>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const loadCodes = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('discount_codes')
        .select('*')
        .order('created_at', { ascending: false })
      setCodes((data || []) as DiscountCode[])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadCodes() }, [loadCodes])

  const handleDelete = async (id: string) => {
    await supabase.from('discount_codes').delete().eq('id', id)
    setDeleteId(null)
    loadCodes()
  }

  const handleToggleActive = async (code: DiscountCode) => {
    await supabase.from('discount_codes').update({ is_active: !code.is_active }).eq('id', code.id)
    loadCodes()
  }

  const filtered = codes.filter(c =>
    !search || c.code.toLowerCase().includes(search.toLowerCase())
  )

  const usableCount = codes.filter(c => c.is_active).length

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white/90">Discount Codes</h1>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-white/40">{codes.length} total · {usableCount} active</p>
        </div>
        <button onClick={() => { setEditorMode('create'); setEditId(null) }} className="w-full sm:w-auto admin-btn-primary">
          New Discount Code
        </button>
      </div>

      <div className="mb-4">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by code..." className="w-full sm:max-w-xs admin-input" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7700ff] border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center rounded-2xl p-12 text-center admin-glass">
          <p className="text-sm text-gray-500 dark:text-white/40">
            {search ? 'No codes match your search.' : 'No discount codes yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => (
            <div key={c.id} className="rounded-2xl p-4 transition-all hover:scale-[1.002] admin-glass">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-mono font-bold',
                    c.is_active
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-900/30 dark:text-gray-400'
                  )}>{c.code.substring(0, 3)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold tracking-wider text-gray-900 dark:text-white/90">{c.code}</span>
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium',
                        c.is_active
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-900/30 dark:text-gray-400'
                      )}>{c.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500 dark:text-white/40">
                      <span className={cn('font-semibold', c.type === 'percentage' ? 'text-blue-500' : 'text-purple-500')}>
                        {c.type === 'percentage' ? `${c.value}%` : `₦${c.value.toLocaleString()}`}
                      </span>
                      <span>off</span>
                      {c.min_order_amount && <span>· min ₦{c.min_order_amount.toLocaleString()}</span>}
                      <span>·</span>
                      <span>{c.use_count}/{c.max_uses ?? '∞'} used</span>
                      {c.expires_at && (
                        <>
                          <span>·</span>
                          <span>Expires {formatDate(c.expires_at)}</span>
                        </>
                      )}
                      <span>·</span>
                      <span>{formatDate(c.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button onClick={() => handleToggleActive(c)}
                    className={cn('rounded-lg px-2.5 py-1.5 text-xs transition-colors',
                      c.is_active
                        ? 'text-amber-500 hover:bg-amber-500/10'
                        : 'text-gray-500 hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5'
                    )}>
                    {c.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => { setEditorMode('edit'); setEditId(c.id) }}
                    className="rounded-lg px-2.5 py-1.5 text-xs text-gray-500 transition-colors hover:bg-black/5 hover:text-gray-700 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white/80">Edit</button>
                  <button onClick={() => setDeleteId(c.id)}
                    className="rounded-lg px-2.5 py-1.5 text-xs text-red-500 transition-colors hover:bg-red-500/10">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editorMode && (
        <DiscountEditor discountId={editId} onClose={() => { setEditorMode(null); setEditId(null) }}
          onSaved={() => { setEditorMode(null); setEditId(null); loadCodes() }} />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl p-6 admin-glass-strong">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white/90">Delete Discount Code</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-white/40">Are you sure? This cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="rounded-xl px-4 py-2 text-sm text-gray-500 transition-colors hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DiscountEditor({ discountId, onClose, onSaved }: { discountId: string | null; onClose: () => void; onSaved: () => void }) {
  const [code, setCode] = useState('')
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage')
  const [value, setValue] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [minOrderAmount, setMinOrderAmount] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [affiliateId, setAffiliateId] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (discountId) {
      supabase.from('discount_codes').select('*').eq('id', discountId).single().then(({ data }) => {
        if (!data) return
        setCode(data.code || '')
        setType(data.type || 'percentage')
        setValue(String(data.value || ''))
        setMaxUses(data.max_uses !== null ? String(data.max_uses) : '')
        setMinOrderAmount(data.min_order_amount !== null ? String(data.min_order_amount) : '')
        setExpiresAt(data.expires_at ? data.expires_at.slice(0, 16) : '')
        setAffiliateId(data.affiliate_id || '')
        setIsActive(data.is_active ?? true)
      })
    }
  }, [discountId])

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setCode(result)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim() || !value) return
    setSaving(true)
    const payload: Record<string, unknown> = {
      code: code.trim().toUpperCase(),
      type,
      value: parseFloat(value),
      max_uses: maxUses ? parseInt(maxUses) : null,
      min_order_amount: minOrderAmount ? parseFloat(minOrderAmount) : null,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      affiliate_id: affiliateId || null,
      is_active: isActive,
    }
    try {
      if (discountId) {
        await supabase.from('discount_codes').update(payload).eq('id', discountId)
      } else {
        await supabase.from('discount_codes').insert({ ...payload, use_count: 0, created_at: new Date().toISOString() })
      }
      setSaving(false)
      onSaved()
    } catch {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-8">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl p-6 admin-glass-strong">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white/90">
            {discountId ? 'Edit Discount Code' : 'New Discount Code'}
          </h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-500 hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Code</label>
              <div className="flex gap-2">
                <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="flex-1 admin-input font-mono" placeholder="SUMMER2024" />
                {!discountId && (
                  <button type="button" onClick={generateCode}
                    className="shrink-0 rounded-xl bg-[#7700ff]/10 px-3 py-2 text-xs font-medium text-[#7700ff] transition-colors hover:bg-[#7700ff]/20 dark:text-[#ad66ff]">Generate</button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as 'percentage' | 'fixed')} className="w-full admin-input">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (₦)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Value</label>
              <input type="number" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} className="w-full admin-input" placeholder={type === 'percentage' ? '10' : '5.00'} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Max Uses (empty = unlimited)</label>
              <input type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} className="w-full admin-input" placeholder="Unlimited" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Min Order Amount</label>
              <input type="number" step="0.01" value={minOrderAmount} onChange={(e) => setMinOrderAmount(e.target.value)} className="w-full admin-input" placeholder="0.00" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Expires At</label>
              <input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="w-full admin-input" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Affiliate ID (leave empty for general code)</label>
              <input type="text" value={affiliateId} onChange={(e) => setAffiliateId(e.target.value)} className="w-full admin-input" placeholder="affiliate id" />
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[#7700ff] focus:ring-[#7700ff] dark:border-white/20" />
                <span className="text-sm text-gray-700 dark:text-white/70">Active</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm text-gray-500 transition-colors hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5">Cancel</button>
            <button type="submit" disabled={saving || !code.trim() || !value} className="admin-btn-primary">
              {saving ? 'Saving...' : discountId ? 'Save Changes' : 'Create Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
