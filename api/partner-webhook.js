const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET

// Default commission rates (overridden by store_settings)
const DEFAULT_DIGITAL_RATE = 0.30
const DEFAULT_PHYSICAL_RATE = 0.10

function getCorsOrigin(req) {
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)
  const origin = req.headers.origin || ''
  if (allowed.length === 0) return origin || '*'
  return allowed.includes(origin) ? origin : allowed[0]
}

function json(res, status, body) {
  return res.status(status).json(body)
}

function verifyPaystackSignature(body, signature) {
  const secret = PAYSTACK_WEBHOOK_SECRET || PAYSTACK_SECRET
  if (!secret) {
    console.error('[Partner Webhook] No Paystack secret configured')
    return false
  }
  const hmac = crypto.createHmac('sha512', secret)
  hmac.update(body)
  const expected = hmac.digest('hex')
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function emailWrap(body) {
  const SITE_URL = process.env.VITE_SITE_URL || 'https://gifted-beige.vercel.app'
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{margin:0;padding:0;background:#f5f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}table{border-collapse:collapse}</style>
</head><body style="margin:0;padding:0;background:#f5f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0">
<tr><td align="center" style="padding:40px 16px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
<tr><td align="center" style="padding-bottom:32px">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="width:40px;height:40px;background:linear-gradient(135deg,#7c3aed,#a78bfa);border-radius:12px;text-align:center;vertical-align:middle;line-height:40px;color:#fff;font-size:20px;font-weight:700">G</td>
<td style="padding-left:10px;font-size:18px;font-weight:700;color:#1a1a1a">ifted</td>
</tr></table>
</td></tr>
${body}
<tr><td style="padding-top:32px;border-top:1px solid #e5e5e0;text-align:center">
<p style="margin:0;font-size:12px;color:#999;line-height:1.6">Gifted &mdash; Creator Commerce Platform<br><a href="${SITE_URL}" style="color:#7c3aed;text-decoration:none">${SITE_URL.replace('https://', '')}</a></p>
</td></tr>
</table></td></tr></table></body></html>`
}

function commissionEmail(partnerName, saleAmount, commissionAmount, productTitle) {
  const SITE_URL = process.env.VITE_SITE_URL || 'https://gifted-beige.vercel.app'
  return emailWrap(`
    <tr><td style="background:#fff;border-radius:16px;padding:40px 32px">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px">
        <tr><td style="width:48px;height:48px;background:#dcfce7;border-radius:50%;text-align:center;vertical-align:middle;line-height:48px;font-size:24px">&#128176;</td></tr>
      </table>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#1a1a1a;text-align:center">New Commission Earned!</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;text-align:center">
        Hi ${escapeHtml(partnerName)}, a sale was made through your referral link.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border-radius:12px;margin-bottom:24px">
        <tr><td style="padding:20px 24px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:8px 0;font-size:13px;color:#666">Product</td>
              <td style="padding:8px 0;font-size:13px;color:#1a1a1a;font-weight:600;text-align:right">${escapeHtml(productTitle || 'Product')}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:13px;color:#666">Sale Amount</td>
              <td style="padding:8px 0;font-size:13px;color:#1a1a1a;text-align:right">&#8358;${Number(saleAmount).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-top:1px solid #e5e5e0;font-size:14px;font-weight:600;color:#1a1a1a">Your Commission</td>
              <td style="padding:8px 0;border-top:1px solid #e5e5e0;font-size:18px;font-weight:700;color:#7c3aed;text-align:right">&#8358;${Number(commissionAmount).toLocaleString()}</td>
            </tr>
          </table>
        </td></tr>
      </table>

      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto">
        <tr><td style="border-radius:10px;background:#7c3aed;padding:14px 36px">
          <a href="${SITE_URL}/partner/dashboard" style="display:inline-block;font-size:15px;font-weight:600;color:#fff;text-decoration:none">View Dashboard</a>
        </td></tr>
      </table>
    </td></tr>
  `)
}

async function sendPartnerEmail(to, subject, html) {
  try {
    const { sendMail } = require('./lib/mailer')
    await sendMail({ to, subject, html })
  } catch (err) {
    console.error('[Partner Webhook] Failed to send partner email:', err.message)
  }
}

// Achievement definitions checked on each conversion
const ACHIEVEMENT_DEFS = [
  { key: 'first_sale', title: 'First Sale', desc: 'Made your first referral sale', icon: 'star', check: (p) => p.total_conversions >= 1 },
  { key: 'five_sales', title: 'Rising Star', desc: 'Made 5 referral sales', icon: 'rocket', check: (p) => p.total_conversions >= 5 },
  { key: 'ten_sales', title: 'Power Partner', desc: 'Made 10 referral sales', icon: 'bolt', check: (p) => p.total_conversions >= 10 },
  { key: 'fifty_sales', title: 'Elite Partner', desc: 'Made 50 referral sales', icon: 'crown', check: (p) => p.total_conversions >= 50 },
  { key: 'hundred_sales', title: 'Legendary Partner', desc: 'Made 100 referral sales', icon: 'diamond', check: (p) => p.total_conversions >= 100 },
  { key: 'revenue_10k', title: 'Revenue Champion', desc: 'Generated ₦10,000+ in sales', icon: 'trophy', check: (p) => p.total_revenue_generated >= 10000 },
  { key: 'revenue_50k', title: 'Revenue Star', desc: 'Generated ₦50,000+ in sales', icon: 'star', check: (p) => p.total_revenue_generated >= 50000 },
  { key: 'revenue_100k', title: 'Revenue Master', desc: 'Generated ₦100,000+ in sales', icon: 'crown', check: (p) => p.total_revenue_generated >= 100000 },
  { key: 'revenue_500k', title: 'Revenue Mogul', desc: 'Generated ₦500,000+ in sales', icon: 'diamond', check: (p) => p.total_revenue_generated >= 500000 },
  { key: 'commission_10k', title: 'Commission King', desc: 'Earned ₦10,000+ in commissions', icon: 'trophy', check: (p) => p.total_commission_earned >= 10000 },
  { key: 'commission_50k', title: 'Commission Legend', desc: 'Earned ₦50,000+ in commissions', icon: 'crown', check: (p) => p.total_commission_earned >= 50000 },
]

async function checkAndAwardAchievements(adminClient, partnerId, partner) {
  // Fetch existing achievements
  const { data: existing } = await adminClient
    .from('partner_achievements')
    .select('achievement_key')
    .eq('partner_id', partnerId)

  const ownedKeys = new Set((existing || []).map(a => a.achievement_key))
  const newAchievements = []

  for (const def of ACHIEVEMENT_DEFS) {
    if (!ownedKeys.has(def.key) && def.check(partner)) {
      newAchievements.push({
        partner_id: partnerId,
        achievement_key: def.key,
        title: def.title,
        description: def.desc,
        icon: def.icon,
      })
    }
  }

  if (newAchievements.length > 0) {
    await adminClient.from('partner_achievements').insert(newAchievements).catch(() => {})

    // Notify partner about new achievements
    for (const ach of newAchievements) {
      await adminClient.from('partner_notifications').insert({
        partner_id: partnerId,
        title: `Achievement Unlocked: ${ach.title}`,
        message: ach.description,
        type: 'achievement',
        link: '/partner/dashboard',
      }).catch(() => {})
    }
  }
}

module.exports = async (req, res) => {
  // Always return 200 for webhook receipt — Paystack retries on non-200
  const origin = getCorsOrigin(req)
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Paystack-Signature')

  if (req.method === 'OPTIONS') return json(res, 200, { ok: true })
  if (req.method !== 'POST') return json(res, 200, { ok: true })

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.error('[Partner Webhook] Missing Supabase env vars')
      return json(res, 200, { ok: true })
    }

    if (!PAYSTACK_SECRET && !PAYSTACK_WEBHOOK_SECRET) {
      console.error('[Partner Webhook] Missing Paystack secret')
      return json(res, 200, { ok: true })
    }

    // Read raw body for signature verification
    const rawBody = typeof req.body === 'string'
      ? req.body
      : JSON.stringify(req.body)

    // If we received a parsed object, reconstruct the exact JSON for signature check
    // Paystack signs the raw bytes, so we need the original string
    // For Vercel serverless, the body is pre-parsed. We store it on req for verification.
    let bodyStr = rawBody
    if (req._rawBody) {
      bodyStr = req._rawBody
    }

    const signature = req.headers['x-paystack-signature'] || ''
    if (!signature) {
      console.error('[Partner Webhook] Missing x-paystack-signature header')
      return json(res, 200, { ok: true })
    }

    if (!verifyPaystackSignature(bodyStr, signature)) {
      console.error('[Partner Webhook] Invalid webhook signature')
      return json(res, 200, { ok: true })
    }

    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body

    // Only handle successful charges
    if (event.event !== 'charge.success') {
      return json(res, 200, { ok: true })
    }

    const data = event.data || {}
    const reference = data.reference
    if (!reference) {
      console.error('[Partner Webhook] No reference in event data')
      return json(res, 200, { ok: true })
    }

    const metadata = data.metadata || {}
    const referralCode = metadata.gifted_ref || metadata.partner_referral_code || metadata.referral_code
    if (!referralCode) {
      // No referral associated — nothing to do for partner system
      return json(res, 200, { ok: true })
    }

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Verify payment with Paystack API
    if (PAYSTACK_SECRET) {
      try {
        const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
          headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
        })
        const verifyData = await verifyRes.json()
        if (!verifyData.status || verifyData.data?.status !== 'success') {
          console.error('[Partner Webhook] Payment verification failed:', reference)
          return json(res, 200, { ok: true })
        }
      } catch (err) {
        console.error('[Partner Webhook] Paystack verify error:', err.message)
        // Continue anyway — Paystack already sent the event
      }
    }

    // Find order by payment reference
    const { data: order, error: orderErr } = await adminClient
      .from('orders')
      .select('id, customer_id, total, status, payment_status, currency')
      .eq('payment_reference', reference)
      .single()

    if (orderErr || !order) {
      console.error('[Partner Webhook] Order not found for reference:', reference)
      return json(res, 200, { ok: true })
    }

    // Idempotency: check if conversion already exists for this order + referral code combo
    const { data: existingConversion } = await adminClient
      .from('partner_conversions')
      .select('id')
      .eq('order_id', order.id)
      .limit(1)
      .maybeSingle()

    if (existingConversion) {
      return json(res, 200, { ok: true })
    }

    // Find partner by referral code
    const { data: partner, error: partnerErr } = await adminClient
      .from('partners')
      .select('id, name, email, auth_user_id, status, total_conversions, total_revenue_generated, total_commission_earned, pending_commission, referral_code')
      .eq('referral_code', referralCode)
      .single()

    if (partnerErr || !partner) {
      console.error('[Partner Webhook] Partner not found for referral code:', referralCode)
      return json(res, 200, { ok: true })
    }

    // Only active partners earn commissions
    if (partner.status !== 'approved') {
      console.error('[Partner Webhook] Partner not approved:', partner.id, partner.status)
      return json(res, 200, { ok: true })
    }

    // Prevent self-referral
    if (order.customer_id) {
      const { data: customer } = await adminClient
        .from('customers')
        .select('email')
        .eq('id', order.customer_id)
        .single()

      if (customer && customer.email === partner.email) {
        console.error('[Partner Webhook] Self-referral blocked for partner:', partner.id)
        return json(res, 200, { ok: true })
      }
    }

    // Get commission rates from store settings
    let digitalRate = DEFAULT_DIGITAL_RATE
    let physicalRate = DEFAULT_PHYSICAL_RATE
    try {
      const { data: settings } = await adminClient
        .from('store_settings')
        .select('digital_commission_rate, physical_commission_rate')
        .limit(1)
        .maybeSingle()

      if (settings) {
        digitalRate = Number(settings.digital_commission_rate) || DEFAULT_DIGITAL_RATE
        physicalRate = Number(settings.physical_commission_rate) || DEFAULT_PHYSICAL_RATE
      }
    } catch {
      // Use defaults
    }

    // Get order items to calculate per-item commission
    const { data: orderItems } = await adminClient
      .from('order_items')
      .select('id, product_id, product_title, product_type, quantity, unit_price, total_price')
      .eq('order_id', order.id)

    if (!orderItems || orderItems.length === 0) {
      console.error('[Partner Webhook] No order items found for order:', order.id)
      return json(res, 200, { ok: true })
    }

    const saleAmount = Number(order.total)
    let totalCommission = 0
    const conversions = []

    for (const item of orderItems) {
      const rate = item.product_type === 'digital' ? digitalRate : physicalRate
      const itemTotal = Number(item.total_price)
      const commission = Math.round(itemTotal * rate * 100) / 100

      totalCommission += commission

      conversions.push({
        partner_id: partner.id,
        order_id: order.id,
        order_item_id: item.id,
        product_id: item.product_id,
        product_type: item.product_type,
        sale_amount: itemTotal,
        commission_rate: rate,
        commission_amount: commission,
        status: 'pending',
      })
    }

    // Insert all conversion records
    if (conversions.length > 0) {
      const { error: convErr } = await adminClient
        .from('partner_conversions')
        .insert(conversions)

      if (convErr) {
        console.error('[Partner Webhook] Failed to insert conversions:', convErr)
        return json(res, 200, { ok: true })
      }
    }

    // Update partner stats
    const { error: statsErr } = await adminClient
      .from('partners')
      .update({
        total_conversions: partner.total_conversions + 1,
        total_revenue_generated: partner.total_revenue_generated + saleAmount,
        total_commission_earned: partner.total_commission_earned + totalCommission,
        pending_commission: partner.pending_commission + totalCommission,
        last_conversion_at: new Date().toISOString(),
      })
      .eq('id', partner.id)

    if (statsErr) {
      console.error('[Partner Webhook] Failed to update partner stats:', statsErr)
    }

    // Create partner notification
    const firstProductTitle = orderItems[0]?.product_title || 'Product'
    const productLabel = orderItems.length > 1
      ? `${firstProductTitle} + ${orderItems.length - 1} more`
      : firstProductTitle

    await adminClient
      .from('partner_notifications')
      .insert({
        partner_id: partner.id,
        title: 'New Commission Earned',
        message: `You earned ₦${totalCommission.toLocaleString()} commission from a ${saleAmount.toLocaleString()} sale (${productLabel}).`,
        type: 'commission',
        link: '/partner/dashboard',
      })
      .catch(() => {})

    // Send email notification
    if (partner.email) {
      sendPartnerEmail(
        partner.email,
        `New Commission: ₦${totalCommission.toLocaleString()} \u2014 Gifted Partners`,
        commissionEmail(partner.name, saleAmount, totalCommission, productLabel)
      )
    }

    // Check and award achievements
    // Re-fetch partner to get updated stats
    const { data: updatedPartner } = await adminClient
      .from('partners')
      .select('total_conversions, total_revenue_generated, total_commission_earned')
      .eq('id', partner.id)
      .single()

    if (updatedPartner) {
      await checkAndAwardAchievements(adminClient, partner.id, updatedPartner)
    }

    return json(res, 200, { ok: true })
  } catch (err) {
    console.error('[Partner Webhook] Unexpected error:', err)
    // Always return 200 for webhooks
    return json(res, 200, { ok: true })
  }
}
