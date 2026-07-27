import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { Affiliate, AffiliateCommission, AffiliatePayout, AffiliateClick } from '@/lib/commerce-types'

interface PartnerDetailModalProps {
  affiliate: Affiliate
  onClose: () => void
}

export function PartnerDetailModal({ affiliate, onClose }: PartnerDetailModalProps) {
  const [commissions, setCommissions] = useState<AffiliateCommission[]>([])
  const [payouts, setPayouts] = useState<AffiliatePayout[]>([])
  const [clicks, setClicks] = useState<AffiliateClick[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [commRes, payRes, clickRes] = await Promise.all([
        supabase.from('affiliate_commissions').select('*').eq('affiliate_id', affiliate.id).order('created_at', { ascending: false }),
        supabase.from('affiliate_payouts').select('*').eq('affiliate_id', affiliate.id).order('created_at', { ascending: false }),
        supabase.from('affiliate_clicks').select('*').eq('affiliate_id', affiliate.id).order('created_at', { ascending: false }).limit(50),
      ])
      setCommissions((commRes.data || []) as AffiliateCommission[])
      setPayouts((payRes.data || []) as AffiliatePayout[])
      setClicks((clickRes.data || []) as AffiliateClick[])
      setLoading(false)
    }
    load()
  }, [affiliate.id])

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      suspended: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    }
    return colors[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
  }

  const totalCommission = commissions.reduce((s, c) => s + (c.status === 'paid' ? c.amount : 0), 0)
  const totalPayout = payouts.reduce((s, p) => s + (p.status === 'paid' ? p.amount : 0), 0)
  const conversionRate = affiliate.total_clicks ? ((affiliate.total_sales || 0) / affiliate.total_clicks * 100).toFixed(1) : '0.0'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl p-6 admin-glass-strong" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#7700ff]/10 text-[#7700ff] font-semibold text-sm">
              {affiliate.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white/90">{affiliate.name}</h2>
              <p className="text-xs text-gray-500 dark:text-white/40">{affiliate.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', statusBadge(affiliate.status))}>{affiliate.status}</span>
                <span className="text-[10px] text-gray-400 dark:text-white/30">Code: {affiliate.referral_code}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white/60 transition-colors">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#7700ff] border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Clicks', value: (affiliate.total_clicks || 0).toLocaleString() },
                { label: 'Total Sales', value: (affiliate.total_sales || 0).toLocaleString() },
                { label: 'Conversion Rate', value: `${conversionRate}%` },
                { label: 'Lifetime Earnings', value: `₦${(affiliate.total_earnings || 0).toLocaleString()}` },
              ].map(s => (
                <div key={s.label} className="rounded-xl bg-black/[0.03] dark:bg-white/[0.04] p-3 text-center">
                  <p className="text-sm font-bold text-[#7700ff]">{s.value}</p>
                  <p className="text-[10px] text-gray-500 dark:text-white/40 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Contact Info */}
            <div className="rounded-xl bg-black/[0.02] dark:bg-white/[0.03] p-4">
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white/90 mb-3">Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-400 dark:text-white/30">Phone</p>
                  <p className="text-gray-700 dark:text-white/70">{affiliate.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-gray-400 dark:text-white/30">Social Links</p>
                  <p className="text-gray-700 dark:text-white/70">{affiliate.social_links || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-gray-400 dark:text-white/30">Audience Description</p>
                  <p className="text-gray-700 dark:text-white/70">{affiliate.audience_description || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-gray-400 dark:text-white/30">Reason for Joining</p>
                  <p className="text-gray-700 dark:text-white/70 line-clamp-2">{affiliate.reason || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-gray-400 dark:text-white/30">Bank Name</p>
                  <p className="text-gray-700 dark:text-white/70">{affiliate.bank_name || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-gray-400 dark:text-white/30">Account Number</p>
                  <p className="text-gray-700 dark:text-white/70">{affiliate.account_number || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-gray-400 dark:text-white/30">Account Name</p>
                  <p className="text-gray-700 dark:text-white/70">{affiliate.account_name || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-gray-400 dark:text-white/30">Joined</p>
                  <p className="text-gray-700 dark:text-white/70">{new Date(affiliate.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Commissions */}
            <div className="rounded-xl bg-black/[0.02] dark:bg-white/[0.03] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-900 dark:text-white/90">Commission History</h3>
                <span className="text-[10px] text-gray-400 dark:text-white/30">Total earned: ₦{totalCommission.toLocaleString()}</span>
              </div>
              {commissions.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-white/30 text-center py-4">No commissions yet.</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {commissions.map(c => (
                    <div key={c.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                      <div className="flex items-center gap-2">
                        <span className={cn('rounded-full px-1.5 py-0.5 text-[9px] font-medium', statusBadge(c.status))}>{c.status}</span>
                        <span className="text-xs text-gray-700 dark:text-white/70 capitalize">{c.product_type}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-white/40">
                        <span>₦{c.amount.toLocaleString()}</span>
                        <span>{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payouts */}
            <div className="rounded-xl bg-black/[0.02] dark:bg-white/[0.03] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-900 dark:text-white/90">Payout History</h3>
                <span className="text-[10px] text-gray-400 dark:text-white/30">Total paid: ₦{totalPayout.toLocaleString()}</span>
              </div>
              {payouts.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-white/30 text-center py-4">No payouts yet.</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {payouts.map(p => (
                    <div key={p.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                      <div className="flex items-center gap-2">
                        <span className={cn('rounded-full px-1.5 py-0.5 text-[9px] font-medium', statusBadge(p.status))}>{p.status}</span>
                        <span className="text-xs text-gray-700 dark:text-white/70 capitalize">{p.payment_method?.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-white/40">
                        <span>₦{p.amount.toLocaleString()}</span>
                        <span>{new Date(p.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Clicks */}
            <div className="rounded-xl bg-black/[0.02] dark:bg-white/[0.03] p-4">
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white/90 mb-3">Recent Clicks (Last 50)</h3>
              {clicks.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-white/30 text-center py-4">No clicks recorded yet.</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {clicks.map(cl => (
                    <div key={cl.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-black/[0.02] dark:hover:bg-white/[0.02] text-xs">
                      <span className="text-gray-700 dark:text-white/70">Click #{cl.id.slice(0, 8)}</span>
                      <span className="text-gray-400 dark:text-white/30">{new Date(cl.created_at).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
