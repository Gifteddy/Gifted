const { createClient } = require('@supabase/supabase-js')
const { sendMail } = require('./lib/mailer')

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

const SITE_URL = process.env.VITE_SITE_URL || 'https://gifted-beige.vercel.app'

function getCorsOrigin(req) {
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)
  const origin = req.headers.origin || ''
  if (allowed.length === 0) return origin || '*'
  return allowed.includes(origin) ? origin : allowed[0]
}

function setCorsHeaders(req, res) {
  const origin = getCorsOrigin(req)
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Max-Age', '86400')
}

function json(res, status, body) {
  return res.status(status).json(body)
}

function validateUuid(value, name) {
  if (!value || typeof value !== 'string') return `Missing ${name}`
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) return `Invalid ${name} format`
  return null
}

function validateEmail(email) {
  if (!email || typeof email !== 'string') return 'Missing email'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format'
  return null
}

function generateSecurePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  const bytes = require('crypto').randomBytes(16)
  let pw = ''
  for (let i = 0; i < 16; i++) pw += chars[bytes[i] % chars.length]
  return pw.slice(0, -3) + 'A1!'
}

function generateToken() {
  return require('crypto').randomBytes(32).toString('hex')
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function emailWrap(body) {
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

function approvalEmail(name, referralCode, setupUrl) {
  return emailWrap(`
    <tr><td style="background:#fff;border-radius:16px;padding:40px 32px">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px">
        <tr><td style="width:48px;height:48px;background:#dcfce7;border-radius:50%;text-align:center;vertical-align:middle;line-height:48px;font-size:24px">&#10004;</td></tr>
      </table>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#1a1a1a;text-align:center">Welcome to Gifted Partners!</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;text-align:center">
        Hi ${escapeHtml(name)}, congratulations! Your partner application has been approved.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border-radius:12px;margin-bottom:24px">
        <tr><td style="padding:20px 24px;text-align:center">
          <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#7c3aed;text-transform:uppercase;letter-spacing:0.5px">Your Referral Code</p>
          <p style="margin:0;font-size:24px;font-weight:700;color:#5b21b6;font-family:monospace;letter-spacing:2px">${escapeHtml(referralCode)}</p>
        </td></tr>
      </table>
      <p style="margin:0 0 24px;font-size:14px;color:#555;line-height:1.7;text-align:center">
        Click below to set your password and access your partner dashboard. This link expires in 24 hours.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px">
        <tr><td style="border-radius:10px;background:#7c3aed;padding:14px 36px">
          <a href="${setupUrl}" style="display:inline-block;font-size:15px;font-weight:600;color:#fff;text-decoration:none">Set Your Password</a>
        </td></tr>
      </table>
      <p style="margin:0 0 0;font-size:12px;color:#999;line-height:1.6;text-align:center">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${setupUrl}" style="color:#7c3aed;text-decoration:none;word-break:break-all">${setupUrl}</a>
      </p>
    </td></tr>
  `)
}

function rejectionEmail(name) {
  return emailWrap(`
    <tr><td style="background:#fff;border-radius:16px;padding:40px 32px">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px">
        <tr><td style="width:48px;height:48px;background:#fef2f2;border-radius:50%;text-align:center;vertical-align:middle;line-height:48px;font-size:24px">&#10006;</td></tr>
      </table>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#1a1a1a;text-align:center">Application Update</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;text-align:center">
        Hi ${escapeHtml(name)}, thank you for your interest in the Gifted Partner program.
      </p>
      <p style="margin:0 0 24px;font-size:14px;color:#555;line-height:1.7;text-align:center">
        After reviewing your application, we're unable to approve it at this time. You're welcome to apply again in the future.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto">
        <tr><td style="border-radius:10px;background:#7c3aed;padding:14px 36px">
          <a href="${SITE_URL}/shop/partners/apply" style="display:inline-block;font-size:15px;font-weight:600;color:#fff;text-decoration:none">Reapply</a>
        </td></tr>
      </table>
    </td></tr>
  `)
}

module.exports = async (req, res) => {
  setCorsHeaders(req, res)
  if (req.method === 'OPTIONS') return json(res, 200, { ok: true })
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !SUPABASE_ANON_KEY) {
    console.error('[Partner Auth] Missing Supabase environment variables')
    return json(res, 500, { error: 'Server configuration error' })
  }

  try {
    const authHeader = req.headers.authorization || ''
    if (!authHeader.startsWith('Bearer ')) {
      return json(res, 401, { error: 'Missing authorization token' })
    }
    const jwt = authHeader.slice(7)

    // Create a client scoped to this JWT to verify the user
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    })

    const { data: { user }, error: authError } = await userClient.auth.getUser()
    if (authError || !user) {
      return json(res, 401, { error: 'Invalid or expired token' })
    }

    // Verify admin role
    const { data: profile, error: profileError } = await userClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return json(res, 403, { error: 'Admin access required' })
    }

    // Parse and validate body
    const { action, partner_id, name, email, referral_code } = req.body || {}

    const validActions = ['approve', 'reject', 'suspend', 'ban']
    if (!action || !validActions.includes(action)) {
      return json(res, 400, { error: `Invalid action. Must be: ${validActions.join(', ')}` })
    }
    const idErr = validateUuid(partner_id, 'partner_id')
    if (idErr) return json(res, 400, { error: idErr })
    if (!name || typeof name !== 'string') return json(res, 400, { error: 'Missing name' })
    const emailErr = validateEmail(email)
    if (emailErr) return json(res, 400, { error: emailErr })
    if (!referral_code || typeof referral_code !== 'string') return json(res, 400, { error: 'Missing referral_code' })

    // Service-role client for privileged operations
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Fetch current partner record
    const { data: partner, error: fetchErr } = await adminClient
      .from('partners')
      .select('id, status, auth_user_id, referral_code')
      .eq('id', partner_id)
      .single()

    if (fetchErr || !partner) {
      return json(res, 404, { error: 'Partner not found' })
    }

    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'

    if (action === 'approve') {
      // Prevent re-approving
      if (partner.status === 'approved' && partner.auth_user_id) {
        return json(res, 400, { error: 'Partner is already approved' })
      }

      let userId = partner.auth_user_id

      // Create Supabase auth user if one doesn't exist
      if (!userId) {
        const tempPassword = generateSecurePassword()
        const { data: authUser, error: createErr } = await adminClient.auth.admin.createUser({
          email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: { name, role: 'partner' },
        })

        if (createErr) {
          // If user already exists (email unique constraint), look it up
          if (createErr.message?.includes('already') || createErr.code === '23505') {
            const { data: existingUsers } = await adminClient.auth.admin.listUsers({ filter: `email eq ${email}` })
            const existing = existingUsers?.users?.find(u => u.email === email)
            if (existing) {
              userId = existing.id
            } else {
              console.error('[Partner Auth] Failed to create auth user:', createErr)
              return json(res, 500, { error: 'Failed to create partner account' })
            }
          } else {
            console.error('[Partner Auth] Failed to create auth user:', createErr)
            return json(res, 500, { error: 'Failed to create partner account' })
          }
        } else {
          userId = authUser.user.id
        }
      }

      // Generate password setup token
      const setupToken = generateToken()
      const setupExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

      // Update partner record with token
      const { error: updateErr } = await adminClient
        .from('partners')
        .update({
          auth_user_id: userId,
          status: 'approved',
          password_setup_token: setupToken,
          password_setup_expires: setupExpires,
        })
        .eq('id', partner_id)

      if (updateErr) {
        console.error('[Partner Auth] Failed to update partner status:', updateErr)
        return json(res, 500, { error: 'Failed to update partner status' })
      }

      // Send approval email with direct setup link
      const setupUrl = `${SITE_URL}/shop/partners/set-password?token=${setupToken}&email=${encodeURIComponent(email)}`
      const emailSent = await sendMail({
        to: email,
        subject: 'Your Partner Application is Approved! \u2014 Gifted',
        html: approvalEmail(name, referral_code, setupUrl),
      }).catch(() => false)

      // Audit log
      await adminClient.from('partner_audit_log').insert({
        partner_id,
        action: 'approved',
        details: { admin_id: user.id, auth_user_id: userId },
        ip_address: ip,
        actor_id: user.id,
      }).catch(() => {})

      return json(res, 200, {
        success: true,
        message: 'Partner approved successfully',
        userId,
        emailSent: !!emailSent,
      })
    }

    if (action === 'reject') {
      if (partner.status === 'rejected') {
        return json(res, 400, { error: 'Partner is already rejected' })
      }

      const { error: updateErr } = await adminClient
        .from('partners')
        .update({ status: 'rejected' })
        .eq('id', partner_id)

      if (updateErr) {
        console.error('[Partner Auth] Failed to reject partner:', updateErr)
        return json(res, 500, { error: 'Failed to reject partner' })
      }

      // If an auth user was created, remove them
      if (partner.auth_user_id) {
        await adminClient.auth.admin.deleteUser(partner.auth_user_id).catch(() => {})
        await adminClient
          .from('partners')
          .update({ auth_user_id: null })
          .eq('id', partner_id)
          .catch(() => {})
      }

      const emailSent = await sendMail({
        to: email,
        subject: 'Partner Application Update \u2014 Gifted',
        html: rejectionEmail(name),
      }).catch(() => false)

      await adminClient.from('partner_audit_log').insert({
        partner_id,
        action: 'rejected',
        details: { admin_id: user.id },
        ip_address: ip,
        actor_id: user.id,
      }).catch(() => {})

      return json(res, 200, {
        success: true,
        message: 'Partner rejected',
        emailSent: !!emailSent,
      })
    }

    // suspend / ban
    const statusMap = { suspend: 'suspended', ban: 'banned' }
    const newStatus = statusMap[action]

    if (partner.status === newStatus) {
      return json(res, 400, { error: `Partner is already ${newStatus}` })
    }

    const { error: updateErr } = await adminClient
      .from('partners')
      .update({ status: newStatus })
      .eq('id', partner_id)

    if (updateErr) {
      console.error(`[Partner Auth] Failed to ${action} partner:`, updateErr)
      return json(res, 500, { error: `Failed to ${action} partner` })
    }

    await adminClient.from('partner_audit_log').insert({
      partner_id,
      action: newStatus,
      details: { admin_id: user.id },
      ip_address: ip,
      actor_id: user.id,
    }).catch(() => {})

    return json(res, 200, {
      success: true,
      message: `Partner ${newStatus}`,
    })
  } catch (err) {
    console.error('[Partner Auth] Unexpected error:', err)
    return json(res, 500, { error: 'Internal server error' })
  }
}
