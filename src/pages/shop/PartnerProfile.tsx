import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Meta } from '@/lib/meta'
import { usePartnerStore } from '@/store/partner'
import { updatePartnerProfile } from '@/modules/partner/queries'
import { COUNTRIES } from '@/modules/partner/constants'
import { uploadToCloudinary } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import type { Partner } from '@/modules/partner/types'

const inputClass =
  'w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 dark:focus:border-brand-400/50 dark:focus:ring-brand-400/10 transition-all text-gray-900 dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-white/30'

const selectClass =
  'w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 dark:focus:border-brand-400/50 dark:focus:ring-brand-400/10 transition-all text-gray-900 dark:text-white/90 appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%2712%27%20height%3D%2712%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27%236b7280%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%3E%3Cpath%20d%3D%27m6%209%206%206%206-6%27%2F%3E%3C%2Fsvg%3E")] bg-[length:16px] bg-[right_12px_center] bg-no-repeat'

const labelClass = 'block text-xs font-medium mb-1.5 text-gray-500 dark:text-white/50'

const btnPrimary =
  'rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-500/25 transition-all hover:bg-brand-600 hover:shadow-brand-500/40 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed'

export default function PartnerProfile() {
  const partner = usePartnerStore((s) => s.partner)
  const loading = usePartnerStore((s) => s.loading)
  const refreshPartner = usePartnerStore((s) => s.refreshPartner)

  const [saving, setSaving] = useState('')
  const [message, setMessage] = useState({ type: '' as 'success' | 'error', text: '' })

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  const [website, setWebsite] = useState('')
  const [instagram, setInstagram] = useState('')
  const [tiktok, setTiktok] = useState('')
  const [youtube, setYoutube] = useState('')
  const [twitter, setTwitter] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')

  const [paymentMethod, setPaymentMethod] = useState('bank_transfer')
  const [bankName, setBankName] = useState('')
  const [bankAccountNumber, setBankAccountNumber] = useState('')
  const [bankAccountName, setBankAccountName] = useState('')

  const [emailNotif, setEmailNotif] = useState(true)
  const [browserNotif, setBrowserNotif] = useState(true)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (partner) {
      setName(partner.name || '')
      setPhone(partner.phone || '')
      setCountry(partner.country || '')
      setBio(partner.bio || '')
      setAvatarUrl(partner.avatar_url || '')
      setWebsite(partner.website || '')
      setInstagram(partner.instagram || '')
      setTiktok(partner.tiktok || '')
      setYoutube(partner.youtube || '')
      setTwitter(partner.twitter || '')
      setLinkedin(partner.linkedin || '')
      setPortfolioUrl(partner.portfolio_url || '')
      setPaymentMethod(partner.payment_method || 'bank_transfer')
      setBankName(partner.bank_name || '')
      setBankAccountNumber(partner.bank_account_number || '')
      setBankAccountName(partner.bank_account_name || '')
      setEmailNotif(partner.notification_preferences?.email ?? true)
      setBrowserNotif(partner.notification_preferences?.browser ?? true)
    }
  }, [partner])

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: 'success', text: '' }), 3000)
  }

  const saveSection = async (section: string, updates: Partial<Partner>) => {
    if (!partner) return
    setSaving(section)
    try {
      await updatePartnerProfile(partner.id, updates)
      await refreshPartner()
      showMsg('success', 'Saved successfully')
    } catch (e) {
      showMsg('error', e instanceof Error ? e.message : 'Failed to save')
    }
    setSaving('')
  }

  const handleAvatarUpload = async () => {
    if (!partner) return
    try {
      const url = await uploadToCloudinary('image/*')
      setAvatarUrl(url)
      await updatePartnerProfile(partner.id, { avatar_url: url })
      await refreshPartner()
      showMsg('success', 'Avatar updated')
    } catch { /* cancelled */ }
  }

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      showMsg('error', 'Password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      showMsg('error', 'Passwords do not match')
      return
    }
    setSaving('password')
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setNewPassword('')
      setConfirmPassword('')
      showMsg('success', 'Password updated')
    } catch (e) {
      showMsg('error', e instanceof Error ? e.message : 'Failed to update password')
    }
    setSaving('')
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="text-4xl">👤</div>
        <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white/90">Partner Account Required</h2>
        <p className="max-w-sm text-sm text-gray-500 dark:text-white/50">Join the partner programme to edit your profile.</p>
      </div>
    )
  }

  return (
    <>
      <Meta title="Profile" description="Manage your partner profile" />

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white/90 sm:text-3xl">Profile Settings</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-white/50">Manage your account details and preferences</p>
        </div>

        {message.text && (
          <div className={cn(
            'mb-6 rounded-xl px-4 py-3 text-sm font-medium',
            message.type === 'success'
              ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400'
              : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
          )}>
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50">Avatar</h2>
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.05]">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl text-gray-400 dark:text-white/30">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <button onClick={handleAvatarUpload} className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-4 py-2 text-xs font-medium text-gray-600 dark:text-white/60 transition-all hover:bg-gray-100 dark:hover:bg-white/[0.06]">
                Change Photo
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50">Personal Information</h2>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" value={partner.email} readOnly className={cn(inputClass, 'cursor-not-allowed opacity-60')} />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Phone</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Country</label>
                  <select value={country} onChange={(e) => setCountry(e.target.value)} className={selectClass}>
                    <option value="">Select country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className={inputClass} placeholder="Tell us about yourself..." />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => saveSection('personal', { name, phone, country, bio })}
                  disabled={saving === 'personal'}
                  className={btnPrimary}
                >
                  {saving === 'personal' ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50">Social Links</h2>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Website</label>
                <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className={inputClass} placeholder="https://..." />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Instagram</label>
                  <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} className={inputClass} placeholder="@username" />
                </div>
                <div>
                  <label className={labelClass}>TikTok</label>
                  <input type="text" value={tiktok} onChange={(e) => setTiktok(e.target.value)} className={inputClass} placeholder="@username" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>YouTube</label>
                  <input type="text" value={youtube} onChange={(e) => setYoutube(e.target.value)} className={inputClass} placeholder="Channel URL" />
                </div>
                <div>
                  <label className={labelClass}>Twitter / X</label>
                  <input type="text" value={twitter} onChange={(e) => setTwitter(e.target.value)} className={inputClass} placeholder="@username" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>LinkedIn</label>
                  <input type="text" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className={inputClass} placeholder="Profile URL" />
                </div>
                <div>
                  <label className={labelClass}>Portfolio</label>
                  <input type="url" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} className={inputClass} placeholder="https://..." />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => saveSection('socials', { website, instagram, tiktok, youtube, twitter, linkedin, portfolio_url: portfolioUrl })}
                  disabled={saving === 'socials'}
                  className={btnPrimary}
                >
                  {saving === 'socials' ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50">Payment Details</h2>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Payment Method</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={selectClass}>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="paypal">PayPal</option>
                  <option value="crypto">Cryptocurrency</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Bank Name</label>
                <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Account Number</label>
                  <input type="text" value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Account Name</label>
                  <input type="text" value={bankAccountName} onChange={(e) => setBankAccountName(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => saveSection('payment', { payment_method: paymentMethod, bank_name: bankName, bank_account_number: bankAccountNumber, bank_account_name: bankAccountName })}
                  disabled={saving === 'payment'}
                  className={btnPrimary}
                >
                  {saving === 'payment' ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50">Notification Preferences</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white/90">Email Notifications</p>
                  <p className="text-xs text-gray-500 dark:text-white/40">Receive updates via email</p>
                </div>
                <button
                  onClick={() => setEmailNotif(!emailNotif)}
                  className={cn(
                    'relative h-6 w-11 rounded-full transition-colors',
                    emailNotif ? 'bg-brand-500' : 'bg-gray-300 dark:bg-white/10'
                  )}
                >
                  <span className={cn(
                    'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                    emailNotif ? 'left-[22px]' : 'left-0.5'
                  )} />
                </button>
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white/90">Browser Notifications</p>
                  <p className="text-xs text-gray-500 dark:text-white/40">Get push notifications in your browser</p>
                </div>
                <button
                  onClick={() => setBrowserNotif(!browserNotif)}
                  className={cn(
                    'relative h-6 w-11 rounded-full transition-colors',
                    browserNotif ? 'bg-brand-500' : 'bg-gray-300 dark:bg-white/10'
                  )}
                >
                  <span className={cn(
                    'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                    browserNotif ? 'left-[22px]' : 'left-0.5'
                  )} />
                </button>
              </label>
              <div className="flex justify-end">
                <button
                  onClick={() => saveSection('notifications', { notification_preferences: { email: emailNotif, browser: browserNotif } })}
                  disabled={saving === 'notifications'}
                  className={btnPrimary}
                >
                  {saving === 'notifications' ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50">Change Password</h2>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} placeholder="Minimum 6 characters" />
              </div>
              <div>
                <label className={labelClass}>Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} placeholder="Confirm your new password" />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleChangePassword}
                  disabled={saving === 'password' || !newPassword}
                  className={btnPrimary}
                >
                  {saving === 'password' ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
