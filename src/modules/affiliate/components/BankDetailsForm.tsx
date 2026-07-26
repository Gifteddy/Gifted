import { useState } from 'react'
import { LiquidGlass } from '@/components/ui/LiquidGlass'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import type { Affiliate } from '../types'
import { updatePartnerBankDetails } from '../queries'

interface BankDetailsFormProps {
  partner: Affiliate
  onPartnerUpdated: (partner: Affiliate) => void
}

export function BankDetailsForm({ partner, onPartnerUpdated }: BankDetailsFormProps) {
  const [bankName, setBankName] = useState('')
  const [accountName, setAccountName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [bankSaving, setBankSaving] = useState(false)
  const [touched, setTouched] = useState({ bank: false, name: false, number: false })
  const toast = useToast(s => s.add)

  const effectiveBank = bankName || partner.bank_name || ''
  const effectiveName = accountName || partner.account_name || ''
  const effectiveNumber = accountNumber || partner.account_number || ''

  const bankError = touched.bank && !bankName && !partner.bank_name ? 'Bank name is required' : ''
  const nameError = touched.name && !accountName && !partner.account_name ? 'Account name is required' : ''
  const numberError = touched.number && !accountNumber && !partner.account_number
    ? 'Account number is required'
    : touched.number && accountNumber && !/^\d{10}$/.test(accountNumber)
    ? 'Must be exactly 10 digits'
    : ''

  const canSave = (bankName || partner.bank_name) && (accountName || partner.account_name) && (accountNumber || partner.account_number)

  const handleSave = async () => {
    setTouched({ bank: true, name: true, number: true })
    if (!canSave) return
    if (accountNumber && !/^\d{10}$/.test(accountNumber)) {
      toast('error', 'Account number must be exactly 10 digits.')
      return
    }
    setBankSaving(true)
    try {
      const updated = await updatePartnerBankDetails(partner.id, { account_name: effectiveName, account_number: effectiveNumber, bank_name: effectiveBank })
      onPartnerUpdated(updated)
      toast('success', 'Bank details saved successfully.')
    } catch {
      toast('error', 'Failed to save bank details. Please try again.')
    }
    setBankSaving(false)
  }

  return (
    <LiquidGlass intensity="subtle" className="rounded-2xl p-6 sm:p-8">
      <h3 className="font-display text-sm font-semibold mb-4 text-gray-900 dark:text-white/90">Bank Details for Payouts</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium mb-1 text-text-muted-light dark:text-text-muted-dark">Bank Name <span className="text-red-400">*</span></label>
          <input value={bankName || partner.bank_name || ''} onChange={e => { setBankName(e.target.value); if (!touched.bank) setTouched(t => ({ ...t, bank: true })) }} placeholder="e.g. Access Bank" required
            className={cn('w-full rounded-xl border bg-white/50 dark:bg-white/[0.03] px-3 py-3 text-xs outline-none transition-all',
              bankError ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/10' : 'border-black/[0.06] dark:border-white/[0.08] focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10'
            )} />
          {bankError && <p className="mt-1 text-[10px] text-red-400">{bankError}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-text-muted-light dark:text-text-muted-dark">Account Name <span className="text-red-400">*</span></label>
          <input value={accountName || partner.account_name || ''} onChange={e => { setAccountName(e.target.value); if (!touched.name) setTouched(t => ({ ...t, name: true })) }} placeholder="Full account name" required
            className={cn('w-full rounded-xl border bg-white/50 dark:bg-white/[0.03] px-3 py-3 text-xs outline-none transition-all',
              nameError ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/10' : 'border-black/[0.06] dark:border-white/[0.08] focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10'
            )} />
          {nameError && <p className="mt-1 text-[10px] text-red-400">{nameError}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-text-muted-light dark:text-text-muted-dark">Account Number <span className="text-red-400">*</span></label>
          <input value={accountNumber || partner.account_number || ''} onChange={e => { setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10)); if (!touched.number) setTouched(t => ({ ...t, number: true })) }} placeholder="0123456789" required maxLength={10}
            className={cn('w-full rounded-xl border bg-white/50 dark:bg-white/[0.03] px-3 py-3 text-xs outline-none transition-all',
              numberError ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/10' : 'border-black/[0.06] dark:border-white/[0.08] focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10'
            )} />
          {numberError && <p className="mt-1 text-[10px] text-red-400">{numberError}</p>}
        </div>
      </div>
      <button onClick={handleSave} disabled={bankSaving || !canSave}
        className="mt-4 rounded-xl bg-brand-500 px-5 py-3 text-xs font-semibold text-white hover:bg-brand-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
        {bankSaving ? 'Saving...' : 'Save Bank Details'}
      </button>
    </LiquidGlass>
  )
}
