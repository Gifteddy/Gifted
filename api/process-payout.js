const { createClient } = require('@supabase/supabase-js')
const { handleCors, checkRateLimit, validateUuid } = require('./_security')

const PAYSTACK_API = 'https://api.paystack.co'

module.exports = async (req, res) => {
  const corsResult = handleCors(req, res)
  if (corsResult) return corsResult
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const rateLimitRes = checkRateLimit(req, res, { windowMs: 60000, max: 10 })
  if (rateLimitRes) return rateLimitRes

  try {
    const { payout_id } = req.body
    const idErr = validateUuid(payout_id, 'payout_id')
    if (idErr) return res.status(400).json({ error: idErr })

    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY on server' })
    }

    // Verify requester is admin
    const authHeader = req.headers.authorization || ''
    if (!authHeader.startsWith('Bearer ') || !anonKey) {
      return res.status(401).json({ error: 'Unauthorized: missing auth token' })
    }
    const jwt = authHeader.slice(7)
    const anonSupabase = createClient(supabaseUrl, anonKey)
    const { data: { user }, error: authErr } = await anonSupabase.auth.getUser(jwt)
    if (authErr || !user) return res.status(401).json({ error: 'Unauthorized: invalid token' })

    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'admin') return res.status(403).json({ error: 'Forbidden: admin access required' })

    // Get payout record
    const { data: payout, error: payoutErr } = await supabase
      .from('affiliate_payouts')
      .select('*, affiliates!affiliate_id(name, email, account_name, account_number, bank_name)')
      .eq('id', payout_id)
      .single()

    if (payoutErr || !payout) return res.status(404).json({ error: 'Payout not found' })
    if (payout.status !== 'pending' && payout.status !== 'approved') {
      return res.status(400).json({ error: `Payout status is "${payout.status}", expected "pending" or "approved"` })
    }

    // Get Paystack secret key from store_settings
    const { data: settings } = await supabase.from('store_settings').select('paystack_secret_key, payment_gateway').single()
    const secretKey = settings?.paystack_secret_key
    if (!secretKey) {
      return res.status(400).json({ error: 'Paystack secret key not configured in Store Settings' })
    }

    // Get affiliate bank details (prefer payout-specific, fallback to affiliate record)
    const affiliate = payout.affiliates
    const accountName = payout.account_name || affiliate?.account_name
    const accountNumber = payout.account_number || affiliate?.account_number
    const bankName = payout.bank_name || affiliate?.bank_name

    if (!accountNumber || !bankName) {
      return res.status(400).json({ error: 'Partner has no bank account details on file' })
    }

    // Step 1: Create or get Paystack Transfer Recipient
    // Paystack requires a recipient_code to send transfers
    let recipientCode = payout.recipient_code || null

    if (!recipientCode) {
      // First, we need the bank code. Paystack uses specific bank codes.
      // For now, we'll use the bank name to look up common Nigerian banks
      const bankCode = getBankCode(bankName)
      if (!bankCode) {
        return res.status(400).json({ error: `Could not find Paystack bank code for "${bankName}". Please update the partner's bank details.` })
      }

      const recipientRes = await fetch(`${PAYSTACK_API}/transferrecipient`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'nuban',
          name: accountName || affiliate?.name || 'Partner',
          account_number: accountNumber,
          bank_code: bankCode,
          currency: 'NGN',
        }),
      })

      const recipientData = await recipientRes.json()
      if (!recipientData.status) {
        return res.status(400).json({ error: `Paystack recipient error: ${recipientData.message}` })
      }
      recipientCode = recipientData.data.recipient_code

      // Save recipient_code on the payout record for future use
      await supabase.from('affiliate_payouts').update({ recipient_code: recipientCode }).eq('id', payout_id)
    }

    // Step 2: Initiate Transfer
    const transferRes = await fetch(`${PAYSTACK_API}/transfer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'balance',
        amount: Math.round(payout.amount * 100), // Paystack uses kobo (smallest unit)
        recipient: recipientCode,
        reason: `Partner payout - ${affiliate?.name || payout.affiliate_id}`,
        reference: `payout_${payout_id.slice(0, 8)}_${Date.now()}`,
      }),
    })

    const transferData = await transferRes.json()
    if (!transferData.status) {
      return res.status(400).json({ error: `Paystack transfer error: ${transferData.message}` })
    }

    // Step 3: Update payout record
    await supabase.from('affiliate_payouts').update({
      status: 'paid',
      processed_at: new Date().toISOString(),
      paystack_reference: transferData.data.reference,
      recipient_code: recipientCode,
    }).eq('id', payout_id)

    // Step 4: Create notification for the partner
    await supabase.from('partner_notifications').insert({
      affiliate_id: payout.affiliate_id,
      title: 'Payout Processed',
      message: `Your payout of ₦${payout.amount.toLocaleString()} has been processed. It should arrive in your bank account within 1-24 hours.`,
      type: 'payout_sent',
    })

    // Audit log
    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      actor_email: user.email,
      action: 'payout_processed',
      target_type: 'affiliate_payout',
      target_id: payout_id,
      details: { amount: payout.amount, reference: transferData.data.reference, affiliate_id: payout.affiliate_id },
    })

    // Step 5: Send payout processed email
    const RESEND_API = 'https://api.resend.com'
    const resendKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY
    const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.VITE_RESEND_FROM_EMAIL || 'noreply@gifted.ng'
    if (resendKey && affiliate?.email) {
      try {
        await fetch(`${RESEND_API}/emails`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: affiliate.email,
            subject: `Payout of ₦${payout.amount.toLocaleString()} processed!`,
            html: buildPayoutEmailHtml({
              name: affiliate.name,
              amount: payout.amount,
              reference: transferData.data.reference,
              method: payout.payment_method || 'bank_transfer',
            }),
          }),
        })
      } catch (emailErr) {
        console.error('[Process Payout] Email failed:', emailErr)
      }
    }

    return res.status(200).json({
      success: true,
      transfer_reference: transferData.data.reference,
      amount: payout.amount,
    })
  } catch (err) {
    console.error('[Process Payout] Error:', err)
    return res.status(500).json({ error: err.message })
  }
}

// Common Nigerian bank codes for Paystack
function getBankCode(bankName) {
  const banks = {
    'access bank': '044',
    'citibank': '023',
    'ecobank nigeria': '050',
    'fidelity bank': '070',
    'first bank of nigeria': '011',
    'first city monument bank': '214',
    'globus bank': '00100',
    'guaranty trust bank': '058',
    'heritage bank': '030',
    'keystone bank': '082',
    'kuda bank': '090267',
    'opay': '999991',
    'paga': '100002',
    'polaris bank': '076',
    'providus bank': '101',
    'stanbic ibtc bank': '221',
    'standard chartered bank': '068',
    'sterling bank': '232',
    'suntrust bank': '100',
    'titan trust bank': '102',
    'united bank for africa': '033',
    'unity bank': '215',
    'v bank': '100053',
    'wema bank': '035',
    'zenith bank': '057',
  }
  const normalized = (bankName || '').toLowerCase().trim()
  return banks[normalized] || null
}

function escapeHtml(str) {
  if (!str) return ''
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function buildPayoutEmailHtml({ name, amount, reference, method }) {
  const firstName = (name || 'Partner').split(' ')[0]
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
<td style="padding-left:10px;font-size:18px;font-weight:700;color:#1a1a1a;letter-spacing:-0.3px">ifted Partners</td>
</tr></table>
</td></tr>
<tr><td style="background:#fff;border-radius:16px;padding:40px 32px;box-shadow:0 1px 3px rgba(0,0,0,.04)">
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px">
    <tr><td style="width:64px;height:64px;background:#ecfdf5;border-radius:50%;text-align:center;vertical-align:middle;line-height:64px;font-size:28px">&#x2705;</td></tr>
  </table>
  <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1a1a1a;text-align:center">Payout Processed!</h1>
  <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;text-align:center">
    Hi ${escapeHtml(firstName)}, your payout has been sent to your bank account.
  </p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#ecfdf5,#d1fae5);border-radius:12px;margin-bottom:24px">
    <tr><td style="padding:24px;text-align:center">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#059669;text-transform:uppercase;letter-spacing:1px">Amount Sent</p>
      <p style="margin:0;font-size:36px;font-weight:800;color:#047857;font-family:monospace">&#x20A6;${amount.toLocaleString()}</p>
    </td></tr>
  </table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f5;border-radius:10px;margin-bottom:24px">
    <tr><td style="padding:16px 20px">
      <p style="margin:0;font-size:13px;color:#666;line-height:1.8">
        <strong>Payment method:</strong> ${escapeHtml(method.replace('_', ' '))}<br>
        <strong>Reference:</strong> <span style="font-family:monospace;background:#fff;padding:2px 6px;border-radius:4px;border:1px solid #e5e5e0">${escapeHtml(reference)}</span><br>
        <strong>Processing time:</strong> 1-24 hours
      </p>
    </td></tr>
  </table>
  <p style="margin:0;font-size:13px;color:#999;text-align:center">If you don't see the funds within 24 hours, please contact support.</p>
</td></tr>
<tr><td style="padding-top:32px;border-top:1px solid #e5e5e0;text-align:center">
<p style="margin:0;font-size:12px;color:#999;line-height:1.6">Gifted &mdash; Creator Commerce Platform</p>
</td></tr>
</table></td></tr></table></body></html>`
}
