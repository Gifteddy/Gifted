import { useState } from 'react'
import { LiquidGlass } from '@/components/ui/LiquidGlass'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

export function ChangePasswordCard() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [touched, setTouched] = useState({ new: false, confirm: false })
  const toast = useToast(s => s.add)

  const tooShort = touched.new && newPassword.length > 0 && newPassword.length < 6
  const noMatch = touched.confirm && confirmPassword.length > 0 && newPassword !== confirmPassword
  const isEmpty = !newPassword || !confirmPassword

  const handleSave = async () => {
    setTouched({ new: true, confirm: true })
    if (isEmpty) return
    if (newPassword.length < 6) {
      toast('error', 'Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      toast('error', 'Passwords do not match.')
      return
    }
    setSaving(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
      if (updateError) {
        toast('error', updateError.message)
      } else {
        toast('success', 'Password updated successfully.')
        setNewPassword('')
        setConfirmPassword('')
        setTouched({ new: false, confirm: false })
      }
    } catch {
      toast('error', 'Failed to update password. Please try again.')
    }
    setSaving(false)
  }

  return (
    <LiquidGlass intensity="subtle" className="rounded-2xl p-6 sm:p-8">
      <h3 className="font-display text-sm font-semibold mb-4 text-gray-900 dark:text-white/90">Change Password</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium mb-1 text-text-muted-light dark:text-text-muted-dark">New Password <span className="text-red-400">*</span></label>
          <input type="password" value={newPassword} onChange={e => { setNewPassword(e.target.value); if (!touched.new) setTouched(t => ({ ...t, new: true })) }} placeholder="At least 6 characters"
            autoComplete="new-password" required
            className={cn('w-full rounded-xl border bg-white/50 dark:bg-white/[0.03] px-3 py-3 text-xs outline-none transition-all',
              tooShort ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/10' : 'border-black/[0.06] dark:border-white/[0.08] focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10'
            )} />
          {tooShort && <p className="mt-1 text-[10px] text-red-400">Minimum 6 characters</p>}
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-text-muted-light dark:text-text-muted-dark">Confirm Password <span className="text-red-400">*</span></label>
          <input type="password" value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); if (!touched.confirm) setTouched(t => ({ ...t, confirm: true })) }} placeholder="Repeat password"
            autoComplete="new-password" required
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            className={cn('w-full rounded-xl border bg-white/50 dark:bg-white/[0.03] px-3 py-3 text-xs outline-none transition-all',
              noMatch ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/10' : 'border-black/[0.06] dark:border-white/[0.08] focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10'
            )} />
          {noMatch && <p className="mt-1 text-[10px] text-red-400">Passwords do not match</p>}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button onClick={handleSave} disabled={saving || isEmpty || newPassword !== confirmPassword}
          className="rounded-xl bg-brand-500 px-5 py-3 text-xs font-semibold text-white hover:bg-brand-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
          {saving ? 'Saving...' : 'Update Password'}
        </button>
      </div>
    </LiquidGlass>
  )
}
