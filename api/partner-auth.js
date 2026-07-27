const { createClient } = require('@supabase/supabase-js')
const { handleCors, checkRateLimit, validateUuid, validateEmail, validateAction, generateSecurePassword } = require('./_security')
const { sendMail } = require('./lib/mailer')

function escapeHtml(str) {
  if (!str) return ''
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function emailWrap(body, siteUrl) {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
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
${body}
<tr><td style="padding-top:32px;border-top:1px solid #e5e5e0;text-align:center">
<p style="margin:0;font-size:12px;color:#999;line-height:1.6">Gifted &mdash; Creator Commerce Platform<br>Questions? Reply to this email</p>
</td></tr>
</table></td></tr></table></body></html>`
}

function buildApprovalHtml({ name, email, referralCode, tempPassword, siteUrl }) {
  const firstName = (name || email).split(' ')[0]
  const link = `${siteUrl}/shop?ref=${referralCode}`
  const dashboardUrl = `${siteUrl}/shop/partners/dashboard`

  return emailWrap(`
    <tr><td style="background:#fff;border-radius:16px;padding:40px 32px;box-shadow:0 1px 3px rgba(0,0,0,.04)">
      <h1 style="margin:0 0 24px;font-size:28px;font-weight:700;color:#1a1a1a;letter-spacing:-0.5px;text-align:center">
        Welcome to Gifted Partners${name ? `, <span style="color:#7c3aed">${escapeHtml(firstName)}</span>` : ''}!
      </h1>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;text-align:center">
        Your application has been reviewed and <strong style="color:#16a34a">approved</strong>.<br>
        You're now part of the Gifted Partner Network.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#f5f3ff,#ede9fe);border-radius:12px;margin-bottom:24px">
        <tr><td style="padding:24px">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:1px;text-align:center">Your Referral Code</p>
          <p style="margin:0;font-size:36px;font-weight:800;color:#5b21b6;letter-spacing:3px;font-family:monospace;text-align:center">${escapeHtml(referralCode)}</p>
          <p style="margin:10px 0 0;font-size:13px;color:#6d28d9;text-align:center;word-break:break-all">${escapeHtml(link)}</p>
        </td></tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f5;border-radius:10px;margin-bottom:20px">
        <tr><td style="padding:16px 20px">
          <p style="margin:0 0 2px;font-size:12px;color:#666;line-height:1.6">
            <strong style="color:#1a1a1a">Commission rates:</strong>
            <span style="color:#7c3aed;font-weight:600">30%</span> digital &middot;
            <span style="color:#7c3aed;font-weight:600">10%</span> physical
          </p>
        </td></tr>
      </table>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 28px">
        <tr><td style="border-radius:10px;background:#7c3aed;padding:14px 36px">
          <a href="${escapeHtml(dashboardUrl)}" target="_blank" style="display:inline-block;font-size:15px;font-weight:600;color:#fff;text-decoration:none;line-height:1">Go to Your Dashboard</a>
        </td></tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f5;border-radius:10px">
        <tr><td style="padding:16px 20px">
          <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.5px">Your Account</p>
          <p style="margin:0;font-size:13px;color:#1a1a1a;line-height:1.7">
            Email: <strong>${escapeHtml(email)}</strong><br>
            Password: <strong style="font-family:monospace;background:#fff;padding:2px 8px;border-radius:4px;border:1px solid #e5e5e0;font-size:14px">${escapeHtml(tempPassword)}</strong>
          </p>
          <p style="margin:8px 0 0;font-size:12px;color:#999">Change your password after logging in.</p>
        </td></tr>
      </table>
      <h2 style="margin:32px 0 16px;font-size:16px;font-weight:600;color:#1a1a1a">What happens next</h2>
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr><td style="padding-bottom:8px;font-size:14px;color:#666;line-height:1.6"><span style="color:#7c3aed;font-weight:600">1.</span> Explore your dashboard &mdash; track clicks, sales, and commissions</td></tr>
        <tr><td style="padding-bottom:8px;font-size:14px;color:#666;line-height:1.6"><span style="color:#7c3aed;font-weight:600">2.</span> Grab your referral link and start sharing with your audience</td></tr>
        <tr><td style="padding-bottom:8px;font-size:14px;color:#666;line-height:1.6"><span style="color:#7c3aed;font-weight:600">3.</span> Check the Marketing Center for banners, images, and suggested copy</td></tr>
        <tr><td style="font-size:14px;color:#666;line-height:1.6"><span style="color:#7c3aed;font-weight:600">4.</span> Earn commissions and get paid &mdash; no minimum threshold</td></tr>
      </table>
    </td></tr>
  `, siteUrl)
}

function buildWelcomeBackHtml({ name, email, referralCode, resetUrl, siteUrl }) {
  const firstName = (name || email).split(' ')[0]
  const dashboardUrl = `${siteUrl}/shop/partners/dashboard`

  return emailWrap(`
    <tr><td style="background:#fff;border-radius:16px;padding:40px 32px;box-shadow:0 1px 3px rgba(0,0,0,.04)">
      <h1 style="margin:0 0 24px;font-size:28px;font-weight:700;color:#1a1a1a;text-align:center">Welcome Back${name ? `, <span style="color:#7c3aed">${escapeHtml(firstName)}</span>` : ''}!</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;text-align:center">Your Gifted Partner application has been <strong style="color:#16a34a">approved</strong>. You already have an account, so just set a new password to get started.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#f5f3ff,#ede9fe);border-radius:12px;margin-bottom:24px"><tr><td style="padding:24px;text-align:center">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:1px">Your Referral Code</p>
        <p style="margin:0;font-size:36px;font-weight:800;color:#5b21b6;letter-spacing:3px;font-family:monospace">${escapeHtml(referralCode)}</p>
      </td></tr></table>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 28px"><tr><td style="border-radius:10px;background:#7c3aed;padding:14px 36px">
        <a href="${escapeHtml(resetUrl)}" target="_blank" style="display:inline-block;font-size:15px;font-weight:600;color:#fff;text-decoration:none">Set Your Password</a>
      </td></tr></table>
      <p style="font-size:14px;color:#666;line-height:1.7;text-align:center">Or sign in at <a href="${escapeHtml(dashboardUrl)}" style="color:#7c3aed">${escapeHtml(dashboardUrl).replace('https://', '')}</a> and use <strong>Forgot Password</strong>.</p>
    </td></tr>
  `, siteUrl)
}

function buildRejectionHtml({ name, email, siteUrl }) {
  const displayName = name || email.split('@')[0]

  return emailWrap(`
    <tr><td style="background:#fff;border-radius:16px;padding:40px 32px;box-shadow:0 1px 3px rgba(0,0,0,.04)">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px">
        <tr><td style="width:64px;height:64px;background:#fef2f2;border-radius:50%;text-align:center;vertical-align:middle;line-height:64px;font-size:28px">&#x1F4AC;</td></tr>
      </table>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1a1a1a;letter-spacing:-0.3px;text-align:center">Application Update</h1>
      <p style="margin:0 0 8px;font-size:15px;color:#555;line-height:1.7;text-align:center">Hi ${escapeHtml(displayName)},</p>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;text-align:center">Thank you for your interest in the Gifted Partner Network. After careful review, we're unable to move forward with your application at this time.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f5;border-radius:12px;margin-bottom:16px"><tr><td style="padding:20px 24px">
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#1a1a1a">What this means</p>
        <p style="margin:0;font-size:13px;color:#666;line-height:1.5">This doesn't close the door permanently. We review applications on a rolling basis, and you're welcome to reapply in the future as your audience grows.</p>
      </td></tr></table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border-radius:12px"><tr><td style="padding:20px 24px">
        <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#7c3aed">Tips for reapplying</p>
        <ul style="margin:0;padding-left:16px;font-size:13px;color:#555;line-height:1.8">
          <li>Continue growing your audience engagement</li>
          <li>Share content aligned with our product categories</li>
          <li>Build a stronger social media presence</li>
        </ul>
      </td></tr></table>
      <p style="margin:28px 0 0;font-size:14px;color:#999;font-style:italic;text-align:center">We wish you the best in your content journey.</p>
    </td></tr>
  `, siteUrl)
}

module.exports = async (req, res) => {
  const corsResult = handleCors(req, res)
  if (corsResult) return corsResult
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const rateLimitRes = checkRateLimit(req, res, { windowMs: 60000, max: 20 })
  if (rateLimitRes) return rateLimitRes

  try {
    const { action, affiliate_id, name, email, referral_code } = req.body

    const actionErr = validateAction(action)
    if (actionErr) return res.status(400).json({ error: actionErr })
    const idErr = validateUuid(affiliate_id, 'affiliate_id')
    if (idErr) return res.status(400).json({ error: idErr })
    const emailErr = validateEmail(email)
    if (emailErr) return res.status(400).json({ error: emailErr })

    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY on server' })
    }

    const authHeader = req.headers.authorization || ''
    if (!authHeader.startsWith('Bearer ') || !anonKey) {
      return res.status(401).json({ error: 'Unauthorized: missing auth token' })
    }
    const jwt = authHeader.slice(7)
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const anonSupabase = createClient(supabaseUrl, anonKey)
    const { data: { user }, error: authErr } = await anonSupabase.auth.getUser(jwt)
    if (authErr || !user) {
      return res.status(401).json({ error: 'Unauthorized: invalid token' })
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (!profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: admin access required' })
    }

    const siteUrl = process.env.VITE_SITE_URL || 'https://gifted-beige.vercel.app'

    if (action === 'approve') {
      let authUserId
      let isExistingUser = false
      let tempPassword = ''

      try {
        tempPassword = generateSecurePassword()
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: { name, role: 'affiliate' },
        })
        if (authError) throw authError
        authUserId = authUser.user.id
      } catch (createErr) {
        if (createErr.message && (createErr.message.includes('already been registered') || createErr.message.includes('already exists'))) {
          const { data: userList } = await supabase.auth.admin.listUsers()
          const existing = userList?.users?.find(u => u.email === email)
          if (!existing) throw new Error('User already registered but could not be found')
          authUserId = existing.id
          isExistingUser = true
        } else {
          throw createErr
        }
      }

      const { error: updateError } = await supabase
        .from('affiliates')
        .update({ auth_user_id: authUserId, status: 'approved' })
        .eq('id', affiliate_id)
      if (updateError) throw updateError

      await supabase.from('audit_logs').insert({
        actor_id: user.id,
        actor_email: user.email,
        action: 'partner_approved',
        target_type: 'affiliate',
        target_id: affiliate_id,
        details: { email, is_existing_user: isExistingUser },
      })

      let emailSent = false

      if (isExistingUser) {
        const { data: linkData } = await supabase.auth.admin.generateLink({ type: 'recovery', email })
        const resetUrl = linkData?.properties?.action_link || `${siteUrl}/shop/partners/dashboard`
        emailSent = await sendMail({
          to: email,
          subject: 'Your Gifted Partners account is ready!',
          html: buildWelcomeBackHtml({ name, email, referralCode: referral_code, resetUrl, siteUrl }),
        })
      } else {
        emailSent = await sendMail({
          to: email,
          subject: 'Welcome to Gifted Partners \u2014 your application was approved!',
          html: buildApprovalHtml({ name, email, referralCode: referral_code, tempPassword, siteUrl }),
        })
      }

      return res.status(200).json({
        success: true,
        userId: authUserId,
        emailSent,
        isExistingUser,
      })
    }

    if (action === 'reject') {
      await supabase.from('affiliates').update({ status: 'rejected' }).eq('id', affiliate_id)

      await supabase.from('audit_logs').insert({
        actor_id: user.id,
        actor_email: user.email,
        action: 'partner_rejected',
        target_type: 'affiliate',
        target_id: affiliate_id,
        details: { email },
      })

      const emailSent = await sendMail({
        to: email,
        subject: 'Update on your Gifted Partner application',
        html: buildRejectionHtml({ name, email, siteUrl }),
      })

      return res.status(200).json({
        success: true,
        emailSent,
      })
    }

    return res.status(400).json({ error: 'Invalid action. Must be "approve" or "reject"' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
