import { useState } from 'react'
import { motion } from 'framer-motion'
import { LiquidGlass } from '@/components/ui/LiquidGlass'
import { cn } from '@/lib/utils'
import type { Affiliate } from '../types'
import { updatePartnerBankDetails } from '../queries'
import { ChangePasswordCard } from './ChangePasswordCard'

interface AccountTabProps {
  partner: Affiliate
  onPartnerUpdated: (partner: Affiliate) => void
  onSignOut: () => void
}

export function AccountTab({ partner, onPartnerUpdated, onSignOut }: AccountTabProps) {
  const [name, setName] = useState(partner.name)
  const [phone, setPhone] = useState(partner.phone || '')
  const [socialLinks, setSocialLinks] = useState(partner.social_links)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [emailNotifs, setEmailNotifs] = useState(true)
  const [saleNotifs, setSaleNotifs] = useState(true)
  const [payoutNotifs, setPayoutNotifs] = useState(true)
  const [productNotifs, setProductNotifs] = useState(false)

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const updated = await updatePartnerBankDetails(partner.id, {
        account_name: partner.account_name || name,
        account_number: partner.account_number || '',
        bank_name: partner.bank_name || '',
      })
      onPartnerUpdated({ ...updated, name, phone: phone || null, social_links: socialLinks })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch { }
    setSaving(false)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white/90">Account Settings</h2>
        <p className="text-sm text-text-muted-light dark:text-text-muted-dark">Manage your profile and preferences</p>
      </div>

      {/* Profile */}
      <LiquidGlass intensity="subtle" className="rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500 font-display text-xl font-bold">
            {partner.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-display text-sm font-bold text-gray-900 dark:text-white/90">{partner.name}</h3>
            <p className="text-xs text-text-muted-light dark:text-text-muted-dark">{partner.email}</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500 font-medium mt-1 inline-block">{partner.referral_code}</span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium mb-1 text-text-muted-light dark:text-text-muted-dark">Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-3 py-3 text-xs outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-text-muted-light dark:text-text-muted-dark">Email</label>
            <input value={partner.email} disabled
              className="w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.01] px-3 py-3 text-xs text-text-muted-light dark:text-text-muted-dark cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-text-muted-light dark:text-text-muted-dark">Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234 800 000 0000"
              className="w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-3 py-3 text-xs outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-text-muted-light dark:text-text-muted-dark">Social Links</label>
            <input value={socialLinks} onChange={e => setSocialLinks(e.target.value)} placeholder="Instagram, YouTube, TikTok..."
              className="w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-3 py-3 text-xs outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 transition-all" />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button onClick={handleSaveProfile} disabled={saving}
            className="rounded-xl bg-brand-500 px-5 py-3 text-xs font-semibold text-white hover:bg-brand-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
          {saved && <p className="text-xs text-green-500">Profile updated</p>}
        </div>
      </LiquidGlass>

      {/* Performance Summary */}
      <div className="rounded-2xl border border-black/[0.04] dark:border-white/[0.06] bg-white/30 dark:bg-white/[0.01] p-5 sm:p-6">
        <h2 className="font-display text-sm font-semibold mb-4 text-gray-900 dark:text-white/90">Partner Summary</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Referral Code', value: partner.referral_code },
            { label: 'Status', value: partner.status },
            { label: 'Total Sales', value: partner.total_sales?.toString() || '0' },
            { label: 'Member Since', value: new Date(partner.created_at).toLocaleDateString() },
          ].map(s => (
            <div key={s.label} className="rounded-xl bg-black/[0.02] dark:bg-white/[0.03] p-3">
              <p className="text-[10px] text-text-muted-light dark:text-text-muted-dark">{s.label}</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white/90 mt-0.5 capitalize">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="rounded-2xl border border-black/[0.04] dark:border-white/[0.06] bg-white/30 dark:bg-white/[0.01] p-5 sm:p-6">
        <h2 className="font-display text-sm font-semibold mb-4 text-gray-900 dark:text-white/90">Notification Preferences</h2>
        <div className="space-y-3">
          {[
            { label: 'Email Notifications', desc: 'Receive email updates about your account', checked: emailNotifs, onChange: setEmailNotifs },
            { label: 'Sale Alerts', desc: 'Get notified when someone makes a purchase through your link', checked: saleNotifs, onChange: setSaleNotifs },
            { label: 'Payout Updates', desc: 'Notifications about payout approvals and transfers', checked: payoutNotifs, onChange: setPayoutNotifs },
            { label: 'New Products', desc: 'Be the first to know about new products to promote', checked: productNotifs, onChange: setProductNotifs },
          ].map(pref => (
            <label key={pref.label} className="flex items-center justify-between py-2 cursor-pointer group">
              <div>
                <p className="text-xs font-medium text-gray-900 dark:text-white/90">{pref.label}</p>
                <p className="text-[10px] text-text-muted-light dark:text-text-muted-dark">{pref.desc}</p>
              </div>
              <button onClick={() => pref.onChange(!pref.checked)}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
                  pref.checked ? 'bg-brand-500' : 'bg-black/10 dark:bg-white/10'
                )}>
                <span className={cn(
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out mt-0.5',
                  pref.checked ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'
                )} />
              </button>
            </label>
          ))}
        </div>
      </div>

      {/* Change Password */}
      <ChangePasswordCard />

      {/* Danger Zone */}
      <div className="rounded-2xl border border-red-500/10 bg-red-500/[0.02] p-5 sm:p-6">
        <h2 className="font-display text-sm font-semibold mb-2 text-red-600 dark:text-red-400">Danger Zone</h2>
        <p className="text-xs text-text-muted-light dark:text-text-muted-dark mb-4">Sign out of your partner account. You can sign back in anytime.</p>
        <button onClick={onSignOut}
          className="rounded-xl border border-red-500/20 px-5 py-3 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-all">
          Sign Out
        </button>
      </div>
    </motion.div>
  )
}
