import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/currency'
import { Meta } from '@/lib/meta'
import { usePartnerStore } from '@/store/partner'
import { requestPayout, getPartnerPayouts } from '@/modules/partner/queries'
import { MIN_PAYOUT_AMOUNT } from '@/modules/partner/constants'
import type { PartnerPayout } from '@/modules/partner/types'

const inputClass =
  'w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 dark:focus:border-brand-400/50 dark:focus:ring-brand-400/10 transition-all text-gray-900 dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-white/30'

const selectClass =
  'w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 dark:focus:border-brand-400/50 dark:focus:ring-brand-400/10 transition-all text-gray-900 dark:text-white/90 appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%2712%27%20height%3D%2712%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27%236b7280%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%3E%3Cpath%20d%3D%27m6%209%206%206%206-6%27%2F%3E%3C%2Fsvg%3E")] bg-[length:16px] bg-[right_12px_center] bg-no-repeat'

const labelClass = 'block text-xs font-medium mb-1.5 text-gray-500 dark:text-white/50'

const statusStyles: Record<string, { label: string; color: string }> = {
  pending: { label: 'Requested', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' },
  processing: { label: 'Under Review', color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' },
  paid: { label: 'Paid', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' },
}

const statusFlow = ['Requested', 'Under Review', 'Approved', 'Paid']

export default function PartnerPayouts() {
  const partner = usePartnerStore((s) => s.partner)
  const loading = usePartnerStore((s) => s.loading)
  const refreshPartner = usePartnerStore((s) => s.refreshPartner)

  const [payouts, setPayouts] = useState<PartnerPayout[]>([])
  const [fetching, setFetching] = useState(true)
  const [amount, setAmount] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankAccountNumber, setBankAccountNumber] = useState('')
  const [bankAccountName, setBankAccountName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      if (!partner) return
      setFetching(true)
      try {
        const data = await getPartnerPayouts(partner.id)
        setPayouts(data)
      } catch { /* silent */ }
      setFetching(false)
    }
    load()
  }, [partner])

  useEffect(() => {
    if (partner) {
      setBankName(partner.bank_name || '')
      setBankAccountNumber(partner.bank_account_number || '')
      setBankAccountName(partner.bank_account_name || '')
      setPaymentMethod(partner.payment_method || 'bank_transfer')
    }
  }, [partner])

  const handleRequest = async () => {
    if (!partner) return
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid amount')
      return
    }
    if (amt < MIN_PAYOUT_AMOUNT) {
      setError(`Minimum withdrawal is ${formatCurrency(MIN_PAYOUT_AMOUNT)}`)
      return
    }
    if (amt > (partner.pending_commission || 0)) {
      setError('Amount exceeds available balance')
      return
    }
    if (!bankName || !bankAccountNumber || !bankAccountName) {
      setError('Please fill in all bank details')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await requestPayout(partner.id, amt, {
        bank_name: bankName,
        bank_account_number: bankAccountNumber,
        bank_account_name: bankAccountName,
        payment_method: paymentMethod,
      })
      const data = await getPartnerPayouts(partner.id)
      setPayouts(data)
      await refreshPartner()
      setAmount('')
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to request payout')
    }
    setSubmitting(false)
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
        <div className="text-4xl">💸</div>
        <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white/90">Partner Account Required</h2>
        <p className="max-w-sm text-sm text-gray-500 dark:text-white/50">Join the partner programme to access payouts.</p>
      </div>
    )
  }

  const pendingBalance = partner.pending_commission || 0
  const paidBalance = partner.paid_commission || 0
  const canWithdraw = pendingBalance >= MIN_PAYOUT_AMOUNT

  return (
    <>
      <Meta title="Payouts" description="Manage your partner payouts" />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white/90 sm:text-3xl">Payouts</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-white/50">Request withdrawals and track payment history</p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-white/40">Available Balance</p>
            <p className="mt-1 font-display text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(pendingBalance)}</p>
          </div>
          <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-white/40">Pending Payouts</p>
            <p className="mt-1 font-display text-xl font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(payouts.filter((p) => p.status === 'pending' || p.status === 'processing').reduce((s, p) => s + p.amount, 0))}
            </p>
          </div>
          <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-white/40">Total Paid</p>
            <p className="mt-1 font-display text-xl font-bold text-gray-900 dark:text-white/90">{formatCurrency(paidBalance)}</p>
          </div>
          <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-white/40">Min. Withdrawal</p>
            <p className="mt-1 font-display text-xl font-bold text-gray-900 dark:text-white/90">{formatCurrency(MIN_PAYOUT_AMOUNT)}</p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50">Request Withdrawal</h2>

          {!canWithdraw && (
            <div className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
              You need a minimum balance of {formatCurrency(MIN_PAYOUT_AMOUNT)} to request a withdrawal. Your current balance is {formatCurrency(pendingBalance)}.
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className={labelClass}>Amount (₦)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={inputClass}
                placeholder={`Available: ${formatCurrency(pendingBalance)}`}
                min={MIN_PAYOUT_AMOUNT}
              />
            </div>
            <div>
              <label className={labelClass}>Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={selectClass}>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Bank Name</label>
                <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Account Name</label>
                <input type="text" value={bankAccountName} onChange={(e) => setBankAccountName(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Account Number</label>
              <input type="text" value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} className={inputClass} />
            </div>
            <button
              onClick={handleRequest}
              disabled={submitting || !canWithdraw}
              className={cn(
                'rounded-xl px-6 py-3 text-sm font-semibold transition-all',
                canWithdraw && !submitting
                  ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/25 hover:bg-brand-600 hover:shadow-brand-500/40 active:scale-[0.97]'
                  : 'cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-white/[0.05] dark:text-white/20'
              )}
            >
              {submitting ? 'Processing...' : 'Request Withdrawal'}
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50">Payout Status Flow</h2>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {statusFlow.map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-xs font-semibold text-brand-600 dark:text-brand-400">
                  {i + 1}
                </div>
                <span className="shrink-0 text-xs font-medium text-gray-700 dark:text-white/70">{step}</span>
                {i < statusFlow.length - 1 && (
                  <svg className="h-4 w-4 shrink-0 text-gray-300 dark:text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50">Payout History</h2>

          {fetching ? (
            <div className="flex h-20 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            </div>
          ) : payouts.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-3xl">💸</div>
              <p className="mt-2 text-sm font-medium text-gray-500 dark:text-white/50">No payout history yet</p>
              <p className="mt-1 text-xs text-gray-400 dark:text-white/30">Request your first withdrawal above</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-black/[0.06] dark:border-white/[0.08]">
                    <th className="pb-2 pr-4 font-medium text-gray-500 dark:text-white/40">Date</th>
                    <th className="pb-2 pr-4 font-medium text-gray-500 dark:text-white/40">Amount</th>
                    <th className="pb-2 pr-4 font-medium text-gray-500 dark:text-white/40">Status</th>
                    <th className="pb-2 pr-4 font-medium text-gray-500 dark:text-white/40">Reference</th>
                    <th className="pb-2 font-medium text-gray-500 dark:text-white/40">Processed</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout) => {
                    const status = statusStyles[payout.status] || statusStyles.pending
                    return (
                      <tr key={payout.id} className="border-b border-black/[0.03] dark:border-white/[0.03]">
                        <td className="py-3 pr-4 font-medium text-gray-700 dark:text-white/70">
                          {new Date(payout.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-3 pr-4 font-semibold text-gray-900 dark:text-white/90">{formatCurrency(payout.amount)}</td>
                        <td className="py-3 pr-4">
                          <span className={cn('inline-block rounded-lg px-2 py-0.5 text-[10px] font-semibold', status.color)}>
                            {status.label}
                          </span>
                        </td>
                        <td className="py-3 pr-4 font-mono text-gray-500 dark:text-white/40">{payout.reference || '—'}</td>
                        <td className="py-3 text-gray-500 dark:text-white/40">
                          {payout.processed_at
                            ? new Date(payout.processed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
