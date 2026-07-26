import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '@/store/cart'
import { loadPaystackScript, openPaystack, type PaystackResponse } from '@/lib/paystack'
import { upsertCustomer, createFullOrder, validateDiscountCode, incrementDiscountUses, getAffiliateByRefFromCookie, checkUrlForAffiliate } from '@/lib/commerce-queries'
import { formatCurrency } from '@/lib/currency'
import { sendEmail, purchaseConfirmationEmail, newOrderOwnerEmail } from '@/lib/email'
import { CLOUDINARY_BASE } from '@/lib/images'
import type { ShippingAddress } from '@/lib/commerce-types'
import { Meta } from '@/lib/meta'

type Step = 'review' | 'paying' | 'complete' | 'error'

export default function Checkout() {
  const navigate = useNavigate()
  const { items, subtotal, clearCart, removeItem, updateQuantity } = useCart()
  const [step, setStep] = useState<Step>('review')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [discountCode, setDiscountCode] = useState('')
  const [discount, setDiscount] = useState<{ type: string; value: number; id: string } | null>(null)
  const [discountError, setDiscountError] = useState('')
  const [error, setError] = useState('')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [affiliateId, setAffiliateId] = useState<string | null>(null)
  const [shipAddr, setShipAddr] = useState<ShippingAddress>({ line1: '', city: '', state: '', country: 'Nigeria', zip: '' })
  const [showShipping, setShowShipping] = useState(false)

  const hasPhysical = items.some(i => i.type === 'physical' || i.type === 'bundle')

  useEffect(() => {
    checkUrlForAffiliate()
    getAffiliateByRefFromCookie().then(a => { if (a) setAffiliateId(a.id) })
  }, [])

  useEffect(() => {
    if (items.length === 0 && step !== 'complete') navigate('/shop')
  }, [items, navigate, step])

  const subtotalNgn = subtotal()
  const total = discount
    ? (discount.type === 'percentage'
      ? subtotalNgn - (subtotalNgn * discount.value / 100)
      : Math.max(0, subtotalNgn - discount.value))
    : subtotalNgn

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return
    setDiscountError('')
    try {
      const d = await validateDiscountCode(discountCode.trim())
      if (!d) { setDiscountError('Invalid or expired code'); return }
      setDiscount({ type: d.type, value: d.value, id: d.code })
    } catch { setDiscountError('Failed to validate code') }
  }

  const handleCheckout = async () => {
    if (!name.trim() || !email.trim()) { setError('Please fill in your name and email'); return }
    if (hasPhysical && showShipping && !shipAddr.city.trim()) { setError('Please fill in shipping address'); return }
    setError('')
    setStep('paying')

    try {
      const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string || ''
      if (!paystackKey) { setError('Payment not configured. Contact support.'); setStep('review'); return }

      const customer = await upsertCustomer(email.trim(), name.trim(), phone.trim() || undefined)
      const ref = `GFT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

      await loadPaystackScript()

      openPaystack({
        key: paystackKey,
        email: email.trim(),
        amount: Math.round(total * 100),
        ref,
        metadata: { customer_id: customer.id, discount: discount ? { code: discount.id, type: discount.type, value: discount.value } : null },
        onSuccess: async (response: PaystackResponse) => {
          try {
            const shipAddrToSave = hasPhysical && showShipping ? shipAddr : null
            const result = await createFullOrder({
              customer_id: customer.id,
              subtotal: subtotalNgn,
              discount: subtotalNgn - total,
              total,
              currency: 'NGN',
              affiliate_id: affiliateId,
              discount_code: discount?.id || null,
              shipping_address: shipAddrToSave,
              payment_reference: response.reference,
              items: items.map(i => ({
                product_id: i.productId,
                product_title: i.title,
                product_type: i.type,
                quantity: i.quantity,
                unit_price: i.price,
                total_price: i.price * i.quantity,
              })),
            })
            if (discount) incrementDiscountUses(discount.id).catch(() => {})
            clearCart()
            setOrderId(result.order.id)
            setStep('complete')

            sendEmail({
              to: email.trim(),
              subject: 'Order Confirmed \u2014 Gifted',
              html: purchaseConfirmationEmail({
                name: name.trim(),
                items: items.map(i => ({ title: i.title, type: i.type, quantity: i.quantity })),
                total,
                orderId: result.order.id,
              }),
            }).catch(() => {})

            sendEmail({
              to: import.meta.env.VITE_ADMIN_EMAIL || 'ibiamiheanyi@gmail.com',
              subject: `New Order \u2014 \u20a6${total.toLocaleString()}`,
              html: newOrderOwnerEmail({
                orderId: result.order.id,
                customerName: name.trim(),
                customerEmail: email.trim(),
                items: items.map(i => ({
                  title: i.title,
                  type: i.type,
                  quantity: i.quantity,
                  unit_price: i.price,
                })),
                total,
                paymentReference: response.reference,
                shippingAddress: hasPhysical && showShipping ? shipAddr : null,
              }),
            }).catch(() => {})
          } catch {
            setError('Order creation failed. Contact support with ref: ' + ref)
            setStep('error')
          }
        },
        onCancel: () => { setStep('review') },
      })
    } catch (e: any) {
      setError(e?.message || 'Something went wrong')
      setStep('review')
    }
  }

  if (step === 'complete' && orderId) {
    return (
      <main className="min-h-screen bg-surface-light dark:bg-surface-dark flex items-center justify-center px-6 pt-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-green-500/10">
            <svg className="h-10 w-10 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl mb-2">Payment Successful!</h1>
          <p className="text-gray-500 dark:text-white/50 mb-8">Your order has been placed. Check your email for confirmation.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to={`/shop/success/${orderId}`} className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-7 py-3.5 text-sm font-semibold text-white transition-all duration-500 hover:shadow-xl hover:shadow-brand-500/30">
              View Order
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
            </Link>
            <Link to="/shop" className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] dark:border-white/[0.1] px-7 py-3.5 text-sm font-semibold text-gray-700 dark:text-white/80 transition-all hover:bg-black/[0.04] dark:hover:bg-white/[0.04]">
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark px-6 pt-28 pb-20">
      <Meta title="Checkout" description="Complete your purchase at Gifted." />
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">Checkout</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-white/50">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
          </div>
          <Link to="/shop" className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline">Back to Shop</Link>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-2xl bg-red-500/8 border border-red-500/20 px-5 py-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </motion.div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left Column — Customer Details */}
          <div className="space-y-6">
            {/* Contact */}
            <div className="rounded-3xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6 sm:p-8">
              <h2 className="font-display text-lg font-semibold mb-5 text-gray-900 dark:text-white/90">Contact</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-white/60">Full Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
                    className="w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 dark:focus:border-brand-400/50 dark:focus:ring-brand-400/10 transition-all" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-white/60">Email Address</label>
                    <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com"
                      className="w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 dark:focus:border-brand-400/50 dark:focus:ring-brand-400/10 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-white/60">Phone (optional)</label>
                    <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234 800 000 0000"
                      className="w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 dark:focus:border-brand-400/50 dark:focus:ring-brand-400/10 transition-all" />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping */}
            {hasPhysical && (
              <div className="rounded-3xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6 sm:p-8">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display text-lg font-semibold text-gray-900 dark:text-white/90">Shipping</h2>
                  <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                    <input type="checkbox" checked={showShipping} onChange={e => setShowShipping(e.target.checked)}
                      className="h-4 w-4 rounded border-black/[0.15] dark:border-white/[0.2] text-brand-500 focus:ring-brand-500/30" />
                    <span className="text-gray-600 dark:text-white/60">Ship to me</span>
                  </label>
                </div>
                {showShipping && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
                    <input value={shipAddr.line1} onChange={e => setShipAddr(s => ({ ...s, line1: e.target.value }))} placeholder="Street Address"
                      className="w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 dark:focus:border-brand-400/50 dark:focus:ring-brand-400/10 transition-all" />
                    <div className="grid grid-cols-2 gap-3">
                      <input value={shipAddr.city} onChange={e => setShipAddr(s => ({ ...s, city: e.target.value }))} placeholder="City"
                        className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 dark:focus:border-brand-400/50 dark:focus:ring-brand-400/10 transition-all" />
                      <input value={shipAddr.state} onChange={e => setShipAddr(s => ({ ...s, state: e.target.value }))} placeholder="State"
                        className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 dark:focus:border-brand-400/50 dark:focus:ring-brand-400/10 transition-all" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input value={shipAddr.country} onChange={e => setShipAddr(s => ({ ...s, country: e.target.value }))} placeholder="Country"
                        className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 dark:focus:border-brand-400/50 dark:focus:ring-brand-400/10 transition-all" />
                      <input value={shipAddr.zip} onChange={e => setShipAddr(s => ({ ...s, zip: e.target.value }))} placeholder="Zip Code"
                        className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 dark:focus:border-brand-400/50 dark:focus:ring-brand-400/10 transition-all" />
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Right Column — Order Summary */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6 sm:p-8">
              <h2 className="font-display text-lg font-semibold mb-5 text-gray-900 dark:text-white/90">Order Summary</h2>

              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.productId} className="flex items-start gap-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-black/[0.03] dark:bg-white/[0.03]">
                      <img
                        src={item.thumbnail.startsWith('http') ? item.thumbnail.replace('/upload/', '/upload/f_auto,q_auto,w_56,h_56,c_fit/') : `${CLOUDINARY_BASE}/f_auto,q_auto,w_56,h_56,c_fit/${item.thumbnail}`}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white/90 truncate">{item.title}</p>
                      <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5">{formatCurrency(item.price)} each</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-lg border border-black/[0.06] dark:border-white/[0.08] text-xs hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors">−</button>
                        <span className="w-6 text-center text-xs font-medium tabular-nums">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-lg border border-black/[0.06] dark:border-white/[0.08] text-xs hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors">+</button>
                      </div>
                      <button onClick={() => removeItem(item.productId)} className="text-[10px] text-red-400 hover:text-red-500 transition-colors">Remove</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-5 border-t border-black/[0.06] dark:border-white/[0.08]">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-white/50 uppercase tracking-wider mb-3">Discount Code</h3>
                <div className="flex gap-2">
                  <input value={discountCode} onChange={e => setDiscountCode(e.target.value)} placeholder="Enter code"
                    className="flex-1 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-3 py-2.5 text-xs outline-none focus:border-brand-500/50 transition-all" />
                  <button onClick={handleApplyDiscount}
                    className="rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-brand-600 transition-all active:scale-[0.97]">Apply</button>
                </div>
                {discountError && <p className="mt-1.5 text-xs text-red-400">{discountError}</p>}
                {discount && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1.5 text-xs text-green-500">
                    Code applied — {discount.type === 'percentage' ? `${discount.value}% off` : `${formatCurrency(discount.value)} off`}
                  </motion.p>
                )}
              </div>

              <div className="mt-5 pt-5 border-t border-black/[0.06] dark:border-white/[0.08] space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-white/50">Subtotal</span>
                  <span className="font-medium text-gray-900 dark:text-white/90">{formatCurrency(subtotalNgn)}</span>
                </div>
                {discount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-500">Discount</span>
                    <span className="font-medium text-green-500">-{formatCurrency(subtotalNgn - total)}</span>
                  </div>
                )}
                {affiliateId && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-white/50">Partner Referral</span>
                    <span className="text-xs text-brand-500">Applied</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
                  <span className="text-gray-900 dark:text-white/90">Total</span>
                  <span className="text-gray-900 dark:text-white/90">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={step === 'paying'}
              className="w-full rounded-full bg-brand-500 py-4 text-sm font-semibold text-white transition-all duration-500 hover:shadow-xl hover:shadow-brand-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === 'paying' ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="4" className="opacity-75" /></svg>
                  Processing...
                </span>
              ) : (
                `Pay ${formatCurrency(total)}`
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 dark:text-white/30">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="8" width="20" height="12" rx="2"/><path d="M6 8V6a4 4 0 0 1 8 0v2"/></svg>
              Secured by Paystack
              <span className="mx-1.5">·</span>
              All prices in ₦
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
