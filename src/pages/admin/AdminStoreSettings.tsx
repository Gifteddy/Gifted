import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/Toast'
import type { StoreSettings } from '@/lib/commerce-types'

export default function AdminStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const toast = useToast(s => s.add)
  const [digitalCommissionRate, setDigitalCommissionRate] = useState('')
  const [physicalCommissionRate, setPhysicalCommissionRate] = useState('')
  const [paymentGateway, setPaymentGateway] = useState('paystack')
  const [paystackSecretKey, setPaystackSecretKey] = useState('')
  const [paystackPublicKey, setPaystackPublicKey] = useState('')
  const [minPayoutAmount, setMinPayoutAmount] = useState('0')
  const [autoApprovePayouts, setAutoApprovePayouts] = useState(false)
  const [payoutSchedule, setPayoutSchedule] = useState('manual')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const { data } = await supabase
          .from('store_settings')
          .select('*')
          .single()
        if (data) {
          const s = data as StoreSettings
          setSettings(s)
          setDigitalCommissionRate(String(s.digital_commission_rate ?? ''))
          setPhysicalCommissionRate(String(s.physical_commission_rate ?? ''))
          setPaymentGateway(s.payment_gateway || 'paystack')
          setPaystackSecretKey(s.paystack_secret_key || '')
          setPaystackPublicKey(s.paystack_public_key || '')
          setMinPayoutAmount(String(s.min_payout_amount ?? '0'))
          setAutoApprovePayouts(s.auto_approve_payouts ?? false)
          setPayoutSchedule(s.payout_schedule || 'manual')
        }
      } catch {
        toast('error', 'Failed to load store settings.')
      }
      setLoading(false)
    }
    load()
  }, [toast])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload: Record<string, unknown> = {
      digital_commission_rate: digitalCommissionRate ? parseFloat(digitalCommissionRate) : 0,
      physical_commission_rate: physicalCommissionRate ? parseFloat(physicalCommissionRate) : 0,
      currency: 'NGN',
      payment_gateway: paymentGateway,
      paystack_secret_key: paystackSecretKey || null,
      paystack_public_key: paystackPublicKey || null,
      min_payout_amount: minPayoutAmount ? parseFloat(minPayoutAmount) : 0,
      auto_approve_payouts: autoApprovePayouts,
      payout_schedule: payoutSchedule,
      updated_at: new Date().toISOString(),
    }
    try {
      if (settings?.id) {
        await supabase.from('store_settings').update(payload).eq('id', settings.id)
      } else {
        await supabase.from('store_settings').insert({ ...payload, created_at: new Date().toISOString() })
      }
      toast('success', 'Settings saved successfully.')
    } catch {
      toast('error', 'Failed to save settings.')
    }
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
        {/* Commission Rates */}
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

        {/* Payment Gateway */}
        <div className="rounded-2xl border border-border-light dark:border-border-dark p-6">
          <h2 className="text-sm font-semibold mb-4">Payment Gateway</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-text-muted-light dark:text-text-muted-dark">Gateway</label>
              <select value={paymentGateway} onChange={(e) => setPaymentGateway(e.target.value)} className="w-full rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-brand-500">
                <option value="paystack">Paystack</option>
                <option value="manual">Manual (Bank Transfer)</option>
              </select>
            </div>
            {paymentGateway === 'paystack' && (
              <>
                <div>
                  <label className="block text-xs font-medium mb-1 text-text-muted-light dark:text-text-muted-dark">Paystack Secret Key</label>
                  <input type="password" value={paystackSecretKey} onChange={(e) => setPaystackSecretKey(e.target.value)} className="w-full rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-brand-500" placeholder="sk_live_..." />
                  <p className="mt-1 text-[10px] text-text-muted-light dark:text-text-muted-dark">Used for payout transfers. Never share this key.</p>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-text-muted-light dark:text-text-muted-dark">Paystack Public Key</label>
                  <input type="text" value={paystackPublicKey} onChange={(e) => setPaystackPublicKey(e.target.value)} className="w-full rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-brand-500" placeholder="pk_live_..." />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Payout Settings */}
        <div className="rounded-2xl border border-border-light dark:border-border-dark p-6">
          <h2 className="text-sm font-semibold mb-4">Payout Settings</h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium mb-1 text-text-muted-light dark:text-text-muted-dark">Minimum Payout Amount (NGN)</label>
                <input type="number" step="100" value={minPayoutAmount} onChange={(e) => setMinPayoutAmount(e.target.value)} className="w-full rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-brand-500" placeholder="0" />
                <p className="mt-1 text-[10px] text-text-muted-light dark:text-text-muted-dark">Partners must reach this before payout. 0 = no minimum.</p>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-text-muted-light dark:text-text-muted-dark">Payout Schedule</label>
                <select value={payoutSchedule} onChange={(e) => setPayoutSchedule(e.target.value)} className="w-full rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-brand-500">
                  <option value="manual">Manual (Admin initiates)</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input type="checkbox" checked={autoApprovePayouts} onChange={(e) => setAutoApprovePayouts(e.target.checked)} className="sr-only" />
                <div className={`block h-5 w-9 rounded-full transition-colors ${autoApprovePayouts ? 'bg-brand-500' : 'bg-black/10 dark:bg-white/10'}`} />
                <div className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${autoApprovePayouts ? 'translate-x-4' : ''}`} />
              </div>
              <div>
                <span className="text-xs font-medium">Auto-approve payouts</span>
                <p className="text-[10px] text-text-muted-light dark:text-text-muted-dark">Automatically approve payout requests when they meet the minimum threshold</p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
