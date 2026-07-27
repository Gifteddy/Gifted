import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate, cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/currency'
import { useToast } from '@/components/ui/Toast'
import type { PartnerPayout } from '@/modules/partner/types'
import { createPartnerNotification } from '@/modules/partner/queries'
import { sendPushNotification } from '@/lib/push'

type PayoutWithPartner = PartnerPayout & { partner_name?: string; partner_email?: string }
type StatusFilter = 'all' | 'pending' | 'processing' | 'approved' | 'paid' | 'rejected'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  approved: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState<PayoutWithPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [modalAction, setModalAction] = useState<{ type: 'pay' | 'reject'; payout: PayoutWithPartner } | null>(null)
  const [payReference, setPayReference] = useState('')
  const [rejectNotes, setRejectNotes] = useState('')
  const toast = useToast(s => s.add)

  const loadPayouts = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('partner_payouts')
        .select('*, partner:partners(name, email)')
        .order('created_at', { ascending: false })

      if (error) throw error

      const rows = (data || []).map((row: Record<string, unknown>) => {
        const partner = row.partner as { name?: string; email?: string } | null
        return {
          ...(row as unknown as PartnerPayout),
          partner_name: partner?.name,
          partner_email: partner?.email,
        }
      })

      setPayouts(rows)
    } catch {
      toast('error', 'Failed to load payouts.')
    }
    setLoading(false)
  }, [toast])

  useEffect(() => { loadPayouts() }, [loadPayouts])

  const handleApprove = async (payout: PayoutWithPartner) => {
    setProcessingId(payout.id)
    try {
      await supabase
        .from('partner_payouts')
        .update({ status: 'approved', processed_at: new Date().toISOString() })
        .eq('id', payout.id)

      await createPartnerNotification({
        partner_id: payout.partner_id,
        title: 'Payout Approved',
        message: `Your payout request of ${formatCurrency(payout.amount)} has been approved and is being processed.`,
        type: 'payout',
      })

      sendPushNotification({
        userId: payout.partner_id,
        role: 'partner',
        title: 'Payout Approved',
        body: `Your payout of ${formatCurrency(payout.amount)} has been approved.`,
        url: '/shop/partners/payouts',
        tag: 'payout-approved',
      }).catch(() => {})

      toast('success', `Payout for ${payout.partner_name || 'partner'} approved.`)
      loadPayouts()
    } catch {
      toast('error', 'Failed to approve payout.')
    }
    setProcessingId(null)
  }

  const handleMarkPaid = async () => {
    if (!modalAction || modalAction.type !== 'pay' || !payReference.trim()) return
    const payout = modalAction.payout
    setProcessingId(payout.id)
    try {
      await supabase
        .from('partner_payouts')
        .update({
          status: 'paid',
          reference: payReference.trim(),
          processed_at: new Date().toISOString(),
        })
        .eq('id', payout.id)

      const { data: partner } = await supabase
        .from('partners')
        .select('paid_commission')
        .eq('id', payout.partner_id)
        .single()

      if (partner) {
        await supabase
          .from('partners')
          .update({ paid_commission: (partner.paid_commission || 0) + payout.amount })
          .eq('id', payout.partner_id)
      }

      await createPartnerNotification({
        partner_id: payout.partner_id,
        title: 'Payout Completed',
        message: `Your payout of ${formatCurrency(payout.amount)} has been sent. Reference: ${payReference.trim()}`,
        type: 'payout',
      })

      sendPushNotification({
        userId: payout.partner_id,
        role: 'partner',
        title: 'Payout Sent!',
        body: `Your payout of ${formatCurrency(payout.amount)} has been sent. Ref: ${payReference.trim()}`,
        url: '/shop/partners/payouts',
        tag: 'payout-sent',
      }).catch(() => {})

      toast('success', 'Payout marked as paid.')
      setModalAction(null)
      setPayReference('')
      loadPayouts()
    } catch {
      toast('error', 'Failed to mark payout as paid.')
    }
    setProcessingId(null)
  }

  const handleReject = async () => {
    if (!modalAction || modalAction.type !== 'reject') return
    const payout = modalAction.payout
    setProcessingId(payout.id)
    try {
      await supabase
        .from('partner_payouts')
        .update({ status: 'rejected', notes: rejectNotes.trim() || null })
        .eq('id', payout.id)

      const { data: partner } = await supabase
        .from('partners')
        .select('pending_commission')
        .eq('id', payout.partner_id)
        .single()

      if (partner) {
        await supabase
          .from('partners')
          .update({ pending_commission: (partner.pending_commission || 0) + payout.amount })
          .eq('id', payout.partner_id)
      }

      await createPartnerNotification({
        partner_id: payout.partner_id,
        title: 'Payout Rejected',
        message: `Your payout request of ${formatCurrency(payout.amount)} has been rejected.${rejectNotes.trim() ? ` Reason: ${rejectNotes.trim()}` : ''}`,
        type: 'payout',
      })

      sendPushNotification({
        userId: payout.partner_id,
        role: 'partner',
        title: 'Payout Rejected',
        body: `Your payout request of ${formatCurrency(payout.amount)} was rejected.${rejectNotes.trim() ? ` Reason: ${rejectNotes.trim()}` : ''}`,
        url: '/shop/partners/payouts',
        tag: 'payout-rejected',
      }).catch(() => {})

      toast('success', 'Payout rejected.')
      setModalAction(null)
      setRejectNotes('')
      loadPayouts()
    } catch {
      toast('error', 'Failed to reject payout.')
    }
    setProcessingId(null)
  }

  const filtered = payouts.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        (p.partner_name || '').toLowerCase().includes(q) ||
        (p.partner_email || '').toLowerCase().includes(q)
      )
    }
    return true
  })

  const totalRequested = payouts.reduce((sum, p) => sum + (p.amount || 0), 0)
  const pendingAmount = payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0)
  const approvedAmount = payouts.filter(p => p.status === 'approved').reduce((sum, p) => sum + (p.amount || 0), 0)
  const paidAmount = payouts.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0)

  const stats = [
    { label: 'Total Requested', value: formatCurrency(totalRequested) },
    { label: 'Pending', value: formatCurrency(pendingAmount) },
    { label: 'Approved', value: formatCurrency(approvedAmount) },
    { label: 'Paid', value: formatCurrency(paidAmount) },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white/90">Payouts</h1>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-white/40">{payouts.length} total payout requests</p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-2xl p-4 admin-glass">
            <p className="text-[10px] font-medium text-gray-500 dark:text-white/40 uppercase tracking-wider">{s.label}</p>
            <p className="mt-1 text-lg font-bold tabular-nums text-gray-900 dark:text-white/90">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by partner name or email..."
          className="w-full sm:max-w-xs admin-input"
        />
        <div className="flex gap-1 rounded-xl p-1 admin-glass overflow-x-auto">
          {(['all', 'pending', 'processing', 'approved', 'paid', 'rejected'] as StatusFilter[]).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all capitalize whitespace-nowrap',
                statusFilter === s
                  ? 'bg-white shadow-sm dark:bg-white/[0.08] text-gray-900 dark:text-white/90'
                  : 'text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/60'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7700ff] border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center rounded-2xl p-12 text-center admin-glass">
          <p className="text-sm text-gray-500 dark:text-white/40">
            {search || statusFilter !== 'all' ? 'No payouts match your filters.' : 'No payout requests yet.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl admin-glass">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-black/[0.06] dark:border-white/[0.08]">
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-white/40">Partner</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-white/40">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-white/40">Bank Details</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-white/40">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-white/40">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-white/40">Ref</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-white/40">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr
                    key={p.id}
                    className="border-b border-black/[0.04] dark:border-white/[0.04] hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white/90">{p.partner_name || 'Unknown'}</p>
                        <p className="text-[10px] text-gray-400 dark:text-white/30">{p.partner_email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-gray-900 dark:text-white/90">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3">
                      <div className="text-[10px] text-gray-500 dark:text-white/40">
                        {p.bank_name && <p>{p.bank_name}</p>}
                        {p.bank_account_number && <p className="font-mono">{p.bank_account_number}</p>}
                        {p.bank_account_name && <p>{p.bank_account_name}</p>}
                        {!p.bank_name && !p.bank_account_number && <span>—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', STATUS_COLORS[p.status] || STATUS_COLORS.pending)}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-white/40">{formatDate(p.created_at)}</td>
                    <td className="px-4 py-3">
                      {p.reference ? (
                        <span className="font-mono text-[10px] text-gray-500 dark:text-white/40">{p.reference}</span>
                      ) : (
                        <span className="text-gray-300 dark:text-white/20">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {(p.status === 'pending' || p.status === 'processing') && (
                          <>
                            <button
                              disabled={processingId === p.id}
                              onClick={() => handleApprove(p)}
                              className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              disabled={processingId === p.id}
                              onClick={() => { setModalAction({ type: 'pay', payout: p }); setPayReference('') }}
                              className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 transition-colors disabled:opacity-50"
                            >
                              Mark Paid
                            </button>
                          </>
                        )}
                        {p.status !== 'paid' && p.status !== 'rejected' && (
                          <button
                            disabled={processingId === p.id}
                            onClick={() => { setModalAction({ type: 'reject', payout: p }); setRejectNotes('') }}
                            className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalAction?.type === 'pay' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl p-6 admin-glass-strong">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white/90">Mark as Paid</h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-white/40">
              {formatCurrency(modalAction.payout.amount)} to {modalAction.payout.partner_name}
            </p>
            <div className="mt-4">
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Payment Reference</label>
              <input
                type="text"
                value={payReference}
                onChange={(e) => setPayReference(e.target.value)}
                className="w-full admin-input font-mono"
                placeholder="e.g. TXN-12345"
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setModalAction(null)} className="rounded-xl px-4 py-2 text-sm text-gray-500 transition-colors hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5">Cancel</button>
              <button
                disabled={!payReference.trim() || processingId === modalAction.payout.id}
                onClick={handleMarkPaid}
                className="admin-btn-primary disabled:opacity-50"
              >
                {processingId === modalAction.payout.id ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalAction?.type === 'reject' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl p-6 admin-glass-strong">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white/90">Reject Payout</h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-white/40">
              {formatCurrency(modalAction.payout.amount)} from {modalAction.payout.partner_name}
            </p>
            <div className="mt-4">
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Reason (optional)</label>
              <textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                className="w-full admin-input resize-none"
                rows={3}
                placeholder="Why is this payout being rejected?"
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setModalAction(null)} className="rounded-xl px-4 py-2 text-sm text-gray-500 transition-colors hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5">Cancel</button>
              <button
                disabled={processingId === modalAction.payout.id}
                onClick={handleReject}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
              >
                {processingId === modalAction.payout.id ? 'Processing...' : 'Reject Payout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
