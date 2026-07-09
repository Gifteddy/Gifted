import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { StoreSettings } from '@/lib/commerce-types'

export default function AdminStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [digitalCommissionRate, setDigitalCommissionRate] = useState('')
  const [physicalCommissionRate, setPhysicalCommissionRate] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const { data } = await supabase
          .from('store_settings')
          .select('*')
          .single()
        if (data) {
          setSettings(data as StoreSettings)
          setDigitalCommissionRate(String((data as StoreSettings).digital_commission_rate ?? ''))
          setPhysicalCommissionRate(String((data as StoreSettings).physical_commission_rate ?? ''))
        }
      } catch { /* silent */ }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    const payload: Record<string, unknown> = {
      digital_commission_rate: digitalCommissionRate ? parseFloat(digitalCommissionRate) : 0,
      physical_commission_rate: physicalCommissionRate ? parseFloat(physicalCommissionRate) : 0,
      currency: 'NGN',
      updated_at: new Date().toISOString(),
    }
    try {
      if (settings?.id) {
        await supabase.from('store_settings').update(payload).eq('id', settings.id)
      } else {
        await supabase.from('store_settings').insert({ ...payload, created_at: new Date().toISOString() })
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch { /* silent */ }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Store Settings</h1>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        <div className="rounded-2xl border border-border-light dark:border-border-dark p-6">
          <h2 className="text-sm font-semibold mb-4">Commission Rates</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium mb-1 text-text-muted-light dark:text-text-muted-dark">Digital Commission Rate (%)</label>
              <input type="number" step="0.01" value={digitalCommissionRate} onChange={(e) => setDigitalCommissionRate(e.target.value)} className="w-full rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-brand-500" placeholder="30" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-text-muted-light dark:text-text-muted-dark">Physical Commission Rate (%)</label>
              <input type="number" step="0.01" value={physicalCommissionRate} onChange={(e) => setPhysicalCommissionRate(e.target.value)} className="w-full rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-brand-500" placeholder="10" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {saved && <span className="text-xs text-emerald-500 font-medium">Saved!</span>}
        </div>
      </form>
    </div>
  )
}
