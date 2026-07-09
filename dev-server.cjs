const http = require('http')
const { createClient } = require('@supabase/supabase-js')
const nodemailer = require('nodemailer')

const PORT = process.env.DEV_API_PORT || 3001

function getTransporter() {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD
  if (user && pass) {
    return nodemailer.createTransport({ service: 'gmail', auth: { user, pass } })
  }
  return null
}

function wrapHtml(body) {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{margin:0;padding:0;background:#f5f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}</style>
</head><body style="margin:0;padding:0;background:#f5f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0">
<tr><td align="center" style="padding:40px 16px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
<tr><td align="center" style="padding-bottom:32px">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="width:40px;height:40px;background:linear-gradient(135deg,#7c3aed,#a78bfa);border-radius:12px;text-align:center;vertical-align:middle;line-height:40px;color:#fff;font-size:20px;font-weight:700">G</td>
<td style="padding-left:10px;font-size:18px;font-weight:700;color:#1a1a1a">ifted Partners</td>
</tr></table>
</td></tr>
${body}
<tr><td style="padding-top:32px;border-top:1px solid #e5e5e0;text-align:center">
<p style="margin:0;font-size:12px;color:#999">Gifted &mdash; Creator Commerce Platform<br>Questions? Reply to this email</p>
</td></tr>
</table></td></tr></table></body></html>`
}

function buildApprovalHtml({ name, email, referralCode, tempPassword, siteUrl }) {
  const firstName = (name || email).split(' ')[0]
  const link = `${siteUrl}/shop?ref=${referralCode}`
  return wrapHtml(`
<tr><td style="background:#fff;border-radius:16px;padding:40px 32px">
<h1 style="margin:0 0 24px;font-size:28px;font-weight:700;color:#1a1a1a;text-align:center">Welcome to Gifted Partners${name ? `, <span style="color:#7c3aed">${firstName}</span>` : ''}!</h1>
<p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;text-align:center">Your application has been <strong style="color:#16a34a">approved</strong>. You're now part of the Gifted Partner Network.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#f5f3ff,#ede9fe);border-radius:12px;margin-bottom:24px"><tr><td style="padding:24px;text-align:center">
<p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:1px">Your Referral Code</p>
<p style="margin:0;font-size:36px;font-weight:800;color:#5b21b6;letter-spacing:3px;font-family:monospace">${referralCode}</p>
<p style="margin:10px 0 0;font-size:13px;color:#6d28d9;word-break:break-all">${link}</p>
</td></tr></table>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 28px"><tr><td style="border-radius:10px;background:#7c3aed;padding:14px 36px">
<a href="${siteUrl}/shop/partners/dashboard" target="_blank" style="display:inline-block;font-size:15px;font-weight:600;color:#fff;text-decoration:none">Go to Your Dashboard</a>
</td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f5;border-radius:10px"><tr><td style="padding:16px 20px">
<p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#999;text-transform:uppercase">Your Account</p>
<p style="margin:0;font-size:13px;color:#1a1a1a;line-height:1.7">Email: <strong>${email}</strong><br>Password: <strong style="font-family:monospace;background:#fff;padding:2px 8px;border-radius:4px;border:1px solid #e5e5e0;font-size:14px">${tempPassword}</strong></p>
<p style="margin:8px 0 0;font-size:12px;color:#999">Change your password after logging in.</p>
</td></tr></table>
<h2 style="margin:32px 0 16px;font-size:16px;font-weight:600;color:#1a1a1a">What happens next</h2>
<p style="font-size:14px;color:#666;line-height:1.8"><span style="color:#7c3aed;font-weight:600">1.</span> Explore your dashboard<br><span style="color:#7c3aed;font-weight:600">2.</span> Share your referral link<br><span style="color:#7c3aed;font-weight:600">3.</span> Check the Marketing Center<br><span style="color:#7c3aed;font-weight:600">4.</span> Earn commissions &amp; get paid</p>
</td></tr>`)
}

function buildRejectionHtml({ name, email }) {
  const displayName = name || email.split('@')[0]
  return wrapHtml(`
<tr><td style="background:#fff;border-radius:16px;padding:40px 32px;text-align:center">
<div style="width:64px;height:64px;background:#fef2f2;border-radius:50%;margin:0 auto 24px;line-height:64px;font-size:28px">&#x1F4AC;</div>
<h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1a1a1a">Application Update</h1>
<p style="margin:0 0 8px;font-size:15px;color:#555;line-height:1.7">Hi ${displayName},</p>
<p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7">Thank you for your interest. After careful review, we're unable to move forward at this time.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f5;border-radius:12px;margin-bottom:16px"><tr><td style="padding:20px 24px;text-align:left">
<p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#1a1a1a">What this means</p>
<p style="margin:0;font-size:13px;color:#666;line-height:1.5">This doesn't close the door permanently. You're welcome to reapply as your audience grows.</p>
</td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border-radius:12px"><tr><td style="padding:20px 24px;text-align:left">
<p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#7c3aed">Tips for reapplying</p>
<ul style="margin:0;padding-left:16px;font-size:13px;color:#555;line-height:1.8">
<li>Continue growing your audience engagement</li>
<li>Share content aligned with our product categories</li>
<li>Build a stronger social media presence</li>
</ul>
</td></tr></table>
<p style="margin:28px 0 0;font-size:14px;color:#999;font-style:italic">We wish you the best in your content journey.</p>
</td></tr>`)
}

async function handleRequest(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'OPTIONS') return res.end()
  if (req.method !== 'POST' || !req.url.startsWith('/api/partner-auth')) {
    res.statusCode = 404
    return res.end(JSON.stringify({ error: 'Not found' }))
  }

  let body = ''
  req.on('data', chunk => body += chunk)
  req.on('end', async () => {
    try {
      const { action, affiliate_id, name, email, referral_code } = JSON.parse(body)
      if (!action || !affiliate_id || !email) {
        res.statusCode = 400
        return res.end(JSON.stringify({ error: 'Missing required fields' }))
      }

      const supabaseUrl = process.env.VITE_SUPABASE_URL
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (!supabaseUrl || !serviceRoleKey) {
        res.statusCode = 500
        return res.end(JSON.stringify({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' }))
      }

      const supabase = createClient(supabaseUrl, serviceRoleKey)
      const siteUrl = process.env.VITE_SITE_URL || 'http://localhost:5173'

      if (action === 'approve') {
        const tempPassword = Math.random().toString(36).slice(-10) + 'G1' + Math.random().toString(36).slice(-4)

        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email, password: tempPassword, email_confirm: true,
          user_metadata: { name, role: 'affiliate' },
        })
        if (authError) throw authError

        await supabase.from('affiliates').update({ auth_user_id: authUser.user.id }).eq('id', affiliate_id)

        const transporter = getTransporter()
        if (transporter) {
          await transporter.sendMail({
            from: `"Gifted Partners" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: 'Welcome to Gifted Partners \u2014 your application was approved!',
            html: buildApprovalHtml({ name, email, referralCode: referral_code, tempPassword, siteUrl }),
          })
        }

        return res.end(JSON.stringify({ success: true, userId: authUser.user.id, emailSent: !!transporter }))
      }

      if (action === 'reject') {
        const transporter = getTransporter()
        if (transporter) {
          await transporter.sendMail({
            from: `"Gifted Partners" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: 'Update on your Gifted Partner application',
            html: buildRejectionHtml({ name, email }),
          })
        }
        return res.end(JSON.stringify({ success: true, emailSent: !!transporter }))
      }

      res.statusCode = 400
      res.end(JSON.stringify({ error: 'Invalid action' }))
    } catch (err) {
      res.statusCode = 500
      res.end(JSON.stringify({ error: err.message }))
    }
  })
}

const server = http.createServer(handleRequest)
server.listen(PORT, () => {
  console.log(`\n  Partner Auth API running at http://localhost:${PORT}/api/partner-auth`)
  console.log(`  Make sure Vite proxy targets this port.\n`)
})
