import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { cn, formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { COMMISSION_RATES, PARTNER_LEVELS, MIN_PAYOUT_AMOUNT } from '@/modules/partner/constants'
import type { PartnerLevel } from '@/modules/partner/types'

interface PartnerSettings {
  id?: string
  digital_commission_rate: number
  physical_commission_rate: number
  bundle_commission_rate: number
  min_payout_amount: number
  auto_approve_payouts: boolean
  level_bronze_revenue: number
  level_silver_revenue: number
  level_gold_revenue: number
  level_platinum_revenue: number
  level_diamond_revenue: number
  auto_reject_days: number
  require_email_verification: boolean
  auto_approve_partners: boolean
  max_pending_conversions: number
  updated_at?: string
}

const DEFAULT_SETTINGS: PartnerSettings = {
  digital_commission_rate: COMMISSION_RATES.digital * 100,
  physical_commission_rate: COMMISSION_RATES.physical * 100,
  bundle_commission_rate: COMMISSION_RATES.bundle * 100,
  min_payout_amount: MIN_PAYOUT_AMOUNT,
  auto_approve_payouts: false,
  level_bronze_revenue: PARTNER_LEVELS.bronze.minRevenue,
  level_silver_revenue: PARTNER_LEVELS.silver.minRevenue,
  level_gold_revenue: PARTNER_LEVELS.gold.minRevenue,
  level_platinum_revenue: PARTNER_LEVELS.platinum.minRevenue,
  level_diamond_revenue: PARTNER_LEVELS.diamond.minRevenue,
  auto_reject_days: 30,
  require_email_verification: true,
  auto_approve_partners: false,
  max_pending_conversions: 50,
}

export default function AdminPartnerSettings() {
  const [settings, setSettings] = useState<PartnerSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const toast = useToast(s => s.add)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const { data } = await supabase
          .from('store_settings')
          .select('*')
          .single()

        if (data) {
          setSettings({
            id: data.id,
            digital_commission_rate: data.digital_commission_rate ?? DEFAULT_SETTINGS.digital_commission_rate,
            physical_commission_rate: data.physical_commission_rate ?? DEFAULT_SETTINGS.physical_commission_rate,
            bundle_commission_rate: data.bundle_commission_rate ?? DEFAULT_SETTINGS.bundle_commission_rate,
            min_payout_amount: data.min_payout_amount ?? DEFAULT_SETTINGS.min_payout_amount,
            auto_approve_payouts: data.auto_approve_payouts ?? DEFAULT_SETTINGS.auto_approve_payouts,
            level_bronze_revenue: data.level_bronze_revenue ?? DEFAULT_SETTINGS.level_bronze_revenue,
            level_silver_revenue: data.level_silver_revenue ?? DEFAULT_SETTINGS.level_silver_revenue,
            level_gold_revenue: data.level_gold_revenue ?? DEFAULT_SETTINGS.level_gold_revenue,
            level_platinum_revenue: data.level_platinum_revenue ?? DEFAULT_SETTINGS.level_platinum_revenue,
            level_diamond_revenue: data.level_diamond_revenue ?? DEFAULT_SETTINGS.level_diamond_revenue,
            auto_reject_days: data.auto_reject_days ?? DEFAULT_SETTINGS.auto_reject_days,
            require_email_verification: data.require_email_verification ?? DEFAULT_SETTINGS.require_email_verification,
            auto_approve_partners: data.auto_approve_partners ?? DEFAULT_SETTINGS.auto_approve_partners,
            max_pending_conversions: data.max_pending_conversions ?? DEFAULT_SETTINGS.max_pending_conversions,
          })
        }
      } catch {
        toast('error', 'Failed to load partner settings.')
      }
      setLoading(false)
    }
    load()
  }, [toast])

  const update = <K extends keyof PartnerSettings>(key: K, value: PartnerSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload: Record<string, unknown> = {
      digital_commission_rate: settings.digital_commission_rate,
      physical_commission_rate: settings.physical_commission_rate,
      bundle_commission_rate: settings.bundle_commission_rate,
      min_payout_amount: settings.min_payout_amount,
      auto_approve_payouts: settings.auto_approve_payouts,
      level_bronze_revenue: settings.level_bronze_revenue,
      level_silver_revenue: settings.level_silver_revenue,
      level_gold_revenue: settings.level_gold_revenue,
      level_platinum_revenue: settings.level_platinum_revenue,
      level_diamond_revenue: settings.level_diamond_revenue,
      auto_reject_days: settings.auto_reject_days,
      require_email_verification: settings.require_email_verification,
      auto_approve_partners: settings.auto_approve_partners,
      max_pending_conversions: settings.max_pending_conversions,
      updated_at: new Date().toISOString(),
    }

    try {
      if (settings.id) {
        await supabase.from('store_settings').update(payload).eq('id', settings.id)
      } else {
        await supabase.from('store_settings').insert({
          ...payload,
          created_at: new Date().toISOString(),
        })
      }
      toast('success', 'Partner settings saved successfully.')
    } catch {
      toast('error', 'Failed to save partner settings.')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7700ff] border-t-transparent" />
      </div>
    )
  }

  const levelEntries = (Object.keys(PARTNER_LEVELS) as PartnerLevel[]).map(key => ({
    key,
    ...PARTNER_LEVELS[key],
    revenueKey: `level_${key}_revenue` as keyof PartnerSettings,
  }))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white/90">Partner Settings</h1>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-white/40">
          Configure commission rates, payout thresholds, and partner levels
        </p>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        {/* Commission Rates */}
        <div className="rounded-2xl p-6 admin-glass">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white/90 mb-4">Commission Rates</h2>
          <p className="text-xs text-gray-500 dark:text-white/40 mb-4">Base commission percentages for each product type.</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Digital (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={settings.digital_commission_rate}
                onChange={(e) => update('digital_commission_rate', parseFloat(e.target.value) || 0)}
                className="w-full admin-input"
              />
              <p className="mt-1 text-[10px] text-gray-400 dark:text-white/30">
                Default: {(COMMISSION_RATES.digital * 100).toFixed(0)}%
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Physical (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={settings.physical_commission_rate}
                onChange={(e) => update('physical_commission_rate', parseFloat(e.target.value) || 0)}
                className="w-full admin-input"
              />
              <p className="mt-1 text-[10px] text-gray-400 dark:text-white/30">
                Default: {(COMMISSION_RATES.physical * 100).toFixed(0)}%
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Bundle (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={settings.bundle_commission_rate}
                onChange={(e) => update('bundle_commission_rate', parseFloat(e.target.value) || 0)}
                className="w-full admin-input"
              />
              <p className="mt-1 text-[10px] text-gray-400 dark:text-white/30">
                Default: {(COMMISSION_RATES.bundle * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

        {/* Payout Settings */}
        <div className="rounded-2xl p-6 admin-glass">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white/90 mb-4">Payout Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Minimum Payout Amount (NGN)</label>
              <input
                type="number"
                step="100"
                min="0"
                value={settings.min_payout_amount}
                onChange={(e) => update('min_payout_amount', parseFloat(e.target.value) || 0)}
                className="w-full sm:max-w-xs admin-input"
              />
              <p className="mt-1 text-[10px] text-gray-400 dark:text-white/30">
                Partners must accumulate at least this amount before requesting a payout.
              </p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={settings.auto_approve_payouts}
                  onChange={(e) => update('auto_approve_payouts', e.target.checked)}
                  className="sr-only"
                />
                <div className={cn('block h-5 w-9 rounded-full transition-colors', settings.auto_approve_payouts ? 'bg-[#7700ff]' : 'bg-black/10 dark:bg-white/10')} />
                <div className={cn('absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform', settings.auto_approve_payouts ? 'translate-x-4' : '')} />
              </div>
              <div>
                <span className="text-xs font-medium text-gray-900 dark:text-white/90">Auto-approve payouts</span>
                <p className="text-[10px] text-gray-500 dark:text-white/40">Automatically approve payout requests meeting the minimum threshold</p>
              </div>
            </label>
          </div>
        </div>

        {/* Partner Level Thresholds */}
        <div className="rounded-2xl p-6 admin-glass">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white/90 mb-4">Partner Level Thresholds</h2>
          <p className="text-xs text-gray-500 dark:text-white/40 mb-4">
            Revenue requirements for each partner tier. Partners are auto-upgraded when thresholds are met.
          </p>
          <div className="space-y-3">
            {levelEntries.map(level => (
              <div key={level.key} className="flex items-center gap-4">
                <div className="flex items-center gap-2 w-32 shrink-0">
                  <span className="text-base">{level.icon}</span>
                  <span className="text-xs font-medium" style={{ color: level.color }}>{level.label}</span>
                </div>
                <div className="flex-1 max-w-xs">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-white/30">NGN</span>
                    <input
                      type="number"
                      step="1000"
                      min="0"
                      value={settings[level.revenueKey] as number}
                      onChange={(e) => update(level.revenueKey, parseFloat(e.target.value) || 0)}
                      className="w-full pl-10 admin-input"
                    />
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 dark:text-white/30">+{(level.commissionBonus * 100).toFixed(0)}% bonus</span>
              </div>
            ))}
          </div>
        </div>

        {/* Application Settings */}
        <div className="rounded-2xl p-6 admin-glass">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white/90 mb-4">Application Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Auto-reject after (days)</label>
              <input
                type="number"
                min="1"
                max="365"
                value={settings.auto_reject_days}
                onChange={(e) => update('auto_reject_days', parseInt(e.target.value) || 30)}
                className="w-full sm:max-w-xs admin-input"
              />
              <p className="mt-1 text-[10px] text-gray-400 dark:text-white/30">
                Automatically reject applications not reviewed within this period.
              </p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={settings.require_email_verification}
                  onChange={(e) => update('require_email_verification', e.target.checked)}
                  className="sr-only"
                />
                <div className={cn('block h-5 w-9 rounded-full transition-colors', settings.require_email_verification ? 'bg-[#7700ff]' : 'bg-black/10 dark:bg-white/10')} />
                <div className={cn('absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform', settings.require_email_verification ? 'translate-x-4' : '')} />
              </div>
              <div>
                <span className="text-xs font-medium text-gray-900 dark:text-white/90">Require email verification</span>
                <p className="text-[10px] text-gray-500 dark:text-white/40">Partners must verify their email before accessing the dashboard</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={settings.auto_approve_partners}
                  onChange={(e) => update('auto_approve_partners', e.target.checked)}
                  className="sr-only"
                />
                <div className={cn('block h-5 w-9 rounded-full transition-colors', settings.auto_approve_partners ? 'bg-[#7700ff]' : 'bg-black/10 dark:bg-white/10')} />
                <div className={cn('absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform', settings.auto_approve_partners ? 'translate-x-4' : '')} />
              </div>
              <div>
                <span className="text-xs font-medium text-gray-900 dark:text-white/90">Auto-approve partner applications</span>
                <p className="text-[10px] text-gray-500 dark:text-white/40">Automatically approve new partner applications without manual review</p>
              </div>
            </label>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Max pending conversions</label>
              <input
                type="number"
                min="0"
                value={settings.max_pending_conversions}
                onChange={(e) => update('max_pending_conversions', parseInt(e.target.value) || 0)}
                className="w-full sm:max-w-xs admin-input"
              />
              <p className="mt-1 text-[10px] text-gray-400 dark:text-white/30">
                Maximum pending conversions before a partner is flagged for review.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving} className="admin-btn-primary">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {settings.updated_at && (
            <p className="text-[10px] text-gray-400 dark:text-white/30">
              Last saved {formatDate(settings.updated_at)}
            </p>
          )}
        </div>
      </form>
    </div>
  )
}
