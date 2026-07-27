import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import type { IncomingMessage, ServerResponse } from 'http'

const RESEND_API_URL = 'https://api.resend.com'

async function sendResendEmail(env: Record<string, string>, { to, subject, html }: { to: string; subject: string; html: string }) {
  const apiKey = env.RESEND_API_KEY || env.VITE_RESEND_API_KEY
  if (!apiKey) {
    console.warn('[Email] Resend not configured (RESEND_API_KEY missing). Skipping.')
    return false
  }
  try {
    const fromEmail = env.RESEND_FROM_EMAIL || env.VITE_RESEND_FROM_EMAIL || 'noreply@gifted.ng'
    const res = await fetch(`${RESEND_API_URL}/emails`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: fromEmail, to: [to], subject, html }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error(`[Email] Resend error ${res.status}:`, body)
      return false
    }
    return true
  } catch (err) {
    console.error('[Email] Failed to send:', err)
    return false
  }
}

function escapeHtml(str: string): string {
  if (!str) return ''
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function emailWrap(body: string, _siteUrl?: string) {
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
<td style="padding-left:10px;font-size:18px;font-weight:700;color:#1a1a1a">ifted Partners</td>
</tr></table>
</td></tr>
${body}
<tr><td style="padding-top:32px;border-top:1px solid #e5e5e0;text-align:center">
<p style="margin:0;font-size:12px;color:#999">Gifted &mdash; Creator Commerce Platform<br>Questions? Reply to this email</p>
</td></tr>
</table></td></tr></table></body></html>`
}

function buildApprovalHtmlDev(name: string, email: string, referralCode: string, tempPassword: string, siteUrl: string) {
  const firstName = (name || email).split(' ')[0]
  const link = `${siteUrl}/shop?ref=${referralCode}`
  return emailWrap(`
<tr><td style="background:#fff;border-radius:16px;padding:40px 32px">
<h1 style="margin:0 0 24px;font-size:28px;font-weight:700;color:#1a1a1a;text-align:center">Welcome to Gifted Partners${name ? `, <span style="color:#7c3aed">${escapeHtml(firstName)}</span>` : ''}!</h1>
<p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;text-align:center">Your application has been <strong style="color:#16a34a">approved</strong>. You're now part of the Gifted Partner Network.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#f5f3ff,#ede9fe);border-radius:12px;margin-bottom:24px"><tr><td style="padding:24px;text-align:center">
<p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:1px">Your Referral Code</p>
<p style="margin:0;font-size:36px;font-weight:800;color:#5b21b6;letter-spacing:3px;font-family:monospace">${escapeHtml(referralCode)}</p>
<p style="margin:10px 0 0;font-size:13px;color:#6d28d9;word-break:break-all">${escapeHtml(link)}</p>
</td></tr></table>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 28px"><tr><td style="border-radius:10px;background:#7c3aed;padding:14px 36px">
<a href="${siteUrl}/shop/partners/dashboard" target="_blank" style="display:inline-block;font-size:15px;font-weight:600;color:#fff;text-decoration:none">Go to Your Dashboard</a>
</td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f5;border-radius:10px"><tr><td style="padding:16px 20px">
<p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#999;text-transform:uppercase">Your Account</p>
<p style="margin:0;font-size:13px;color:#1a1a1a;line-height:1.7">Email: <strong>${escapeHtml(email)}</strong><br>Password: <strong style="font-family:monospace;background:#fff;padding:2px 8px;border-radius:4px;border:1px solid #e5e5e0;font-size:14px">${escapeHtml(tempPassword)}</strong></p>
<p style="margin:8px 0 0;font-size:12px;color:#999">Change your password after logging in.</p>
</td></tr></table>
<h2 style="margin:32px 0 16px;font-size:16px;font-weight:600;color:#1a1a1a">What happens next</h2>
<p style="font-size:14px;color:#666;line-height:1.8"><span style="color:#7c3aed;font-weight:600">1.</span> Explore your dashboard<br><span style="color:#7c3aed;font-weight:600">2.</span> Share your referral link<br><span style="color:#7c3aed;font-weight:600">3.</span> Check the Marketing Center<br><span style="color:#7c3aed;font-weight:600">4.</span> Earn commissions &amp; get paid</p>
</td></tr>`, siteUrl)
}

function buildWelcomeBackHtmlDev(name: string, email: string, referralCode: string, resetUrl: string, siteUrl: string) {
  const firstName = (name || email).split(' ')[0]
  return emailWrap(`
<tr><td style="background:#fff;border-radius:16px;padding:40px 32px">
<h1 style="margin:0 0 24px;font-size:28px;font-weight:700;color:#1a1a1a;text-align:center">Welcome Back${name ? `, <span style="color:#7c3aed">${escapeHtml(firstName)}</span>` : ''}!</h1>
<p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;text-align:center">Your Gifted Partner application has been <strong style="color:#16a34a">approved</strong>. You already have an account, so just set a new password to get started.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#f5f3ff,#ede9fe);border-radius:12px;margin-bottom:24px"><tr><td style="padding:24px;text-align:center">
<p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:1px">Your Referral Code</p>
<p style="margin:0;font-size:36px;font-weight:800;color:#5b21b6;letter-spacing:3px;font-family:monospace">${escapeHtml(referralCode)}</p>
</td></tr></table>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 28px"><tr><td style="border-radius:10px;background:#7c3aed;padding:14px 36px">
<a href="${escapeHtml(resetUrl)}" target="_blank" style="display:inline-block;font-size:15px;font-weight:600;color:#fff;text-decoration:none">Set Your Password</a>
</td></tr></table>
<p style="font-size:14px;color:#666;line-height:1.7;text-align:center">Or sign in at <a href="${siteUrl}/shop/partners/dashboard" style="color:#7c3aed">${siteUrl.replace('https://', '')}/shop/partners/dashboard</a> and use <strong>Forgot Password</strong>.</p>
</td></tr>`, siteUrl)
}

function buildRejectionHtmlDev(name: string, email: string) {
  const displayName = name || email.split('@')[0]
  return emailWrap(`
<tr><td style="background:#fff;border-radius:16px;padding:40px 32px;text-align:center">
<div style="width:64px;height:64px;background:#fef2f2;border-radius:50%;margin:0 auto 24px;line-height:64px;font-size:28px">&#x1F4AC;</div>
<h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1a1a1a">Application Update</h1>
<p style="margin:0 0 8px;font-size:15px;color:#555;line-height:1.7">Hi ${escapeHtml(displayName)},</p>
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

async function handlePartnerAuth(req: IncomingMessage, res: ServerResponse, env: Record<string, string>) {
  const allowedOrigins = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)
  const origin = (req.headers.origin || '')
  const corsOrigin = allowedOrigins.length > 0 ? (allowedOrigins.includes(origin) ? origin : allowedOrigins[0]) : origin || '*'
  res.setHeader('Access-Control-Allow-Origin', corsOrigin)
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Max-Age', '86400')
  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'OPTIONS') { res.statusCode = 200; return res.end() }
  if (req.method !== 'POST') { res.statusCode = 405; return res.end(JSON.stringify({ error: 'Method not allowed' })) }

  const supabaseUrl = env.VITE_SUPABASE_URL
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = env.VITE_SUPABASE_ANON_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    res.statusCode = 500
    return res.end(JSON.stringify({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY in .env' }))
  }

  let body = ''
  for await (const chunk of req) body += chunk

  try {
    const { action, affiliate_id, name, email, referral_code } = JSON.parse(body)
    if (!action || !affiliate_id || !email) {
      res.statusCode = 400
      return res.end(JSON.stringify({ error: 'Missing required fields: action, affiliate_id, email' }))
    }

    // Verify requester is an admin
    const authHeader = req.headers.authorization || ''
    if (!authHeader.startsWith('Bearer ') || !anonKey) {
      res.statusCode = 401
      return res.end(JSON.stringify({ error: 'Unauthorized: missing auth token' }))
    }
    const jwt = authHeader.slice(7)
    const anonSupabase = createClient(supabaseUrl, anonKey)
    const { data: { user }, error: authErr } = await anonSupabase.auth.getUser(jwt)
    if (authErr || !user) {
      res.statusCode = 401
      return res.end(JSON.stringify({ error: 'Unauthorized: invalid token' }))
    }
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (!profile || profile.role !== 'admin') {
      res.statusCode = 403
      return res.end(JSON.stringify({ error: 'Forbidden: admin access required' }))
    }

    const siteUrl = env.VITE_SITE_URL || 'http://localhost:5173'

    if (action === 'approve') {
      let authUserId: string
      let isExistingUser = false
      let tempPassword = ''

      try {
        tempPassword = (() => { const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'; const a = new Uint8Array(16); crypto.getRandomValues(a); let p = ''; for (let i = 0; i < 16; i++) p += c[a[i] % c.length]; return p.slice(0, -3) + 'A1!' })()
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email, password: tempPassword, email_confirm: true,
          user_metadata: { name, role: 'affiliate' },
        })
        if (authError) throw authError
        authUserId = authUser.user.id
      } catch (createErr: any) {
        if (createErr.message?.includes?.('already been registered') || createErr.message?.includes?.('already exists')) {
          const { data: userList } = await supabase.auth.admin.listUsers()
          const existing = userList?.users?.find(u => u.email === email)
          if (!existing) throw new Error('User already registered but could not be found')
          authUserId = existing.id
          isExistingUser = true
        } else {
          throw createErr
        }
      }

      await supabase.from('affiliates').update({ auth_user_id: authUserId, status: 'approved' }).eq('id', affiliate_id)

      let emailSent = false
      if (isExistingUser) {
        const { data: linkData } = await supabase.auth.admin.generateLink({ type: 'recovery', email })
        const resetUrl = linkData?.properties?.action_link || `${siteUrl}/shop/partners/dashboard`
        emailSent = await sendResendEmail(env, {
          to: email,
          subject: 'Your Gifted Partners account is ready!',
          html: buildWelcomeBackHtmlDev(name, email, referral_code, resetUrl, siteUrl),
        })
      } else {
        emailSent = await sendResendEmail(env, {
          to: email,
          subject: 'Welcome to Gifted Partners \u2014 your application was approved!',
          html: buildApprovalHtmlDev(name, email, referral_code, tempPassword, siteUrl),
        })
      }

      res.statusCode = 200
      return res.end(JSON.stringify({ success: true, userId: authUserId, emailSent, isExistingUser }))
    }

    if (action === 'reject') {
      await supabase.from('affiliates').update({ status: 'rejected' }).eq('id', affiliate_id)

      const emailSent = await sendResendEmail(env, {
        to: email,
        subject: 'Update on your Gifted Partner application',
        html: buildRejectionHtmlDev(name, email),
      })

      res.statusCode = 200
      return res.end(JSON.stringify({ success: true, emailSent }))
    }

    res.statusCode = 400
    return res.end(JSON.stringify({ error: 'Invalid action' }))
  } catch (err: any) {
    res.statusCode = 500
    return res.end(JSON.stringify({ error: err.message || 'Internal server error' }))
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    server: {
      allowedHosts: ['localhost', 'moneybags-scribble-urgency.ngrok-free.dev'],
      proxy: {
        '/api/chat': {
          target: 'https://openrouter.ai/api/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/chat/, '/chat/completions'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const key = env.OPENROUTER_API_KEY || env.VITE_OPENROUTER_API_KEY
              if (key) {
                proxyReq.setHeader('Authorization', `Bearer ${key}`)
              }
              proxyReq.setHeader('HTTP-Referer', 'https://gifted.com')
              proxyReq.setHeader('X-Title', 'Gifted Portfolio')
            })
          },
        },
        '/api/cloudinary': {
          target: `https://api.cloudinary.com/v1_1/${env.VITE_CLOUDINARY_CLOUD_NAME || ''}`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/cloudinary/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const key = env.CLOUDINARY_API_KEY
              const secret = env.CLOUDINARY_API_SECRET
              if (key && secret) {
                const auth = Buffer.from(`${key}:${secret}`).toString('base64')
                proxyReq.setHeader('Authorization', `Basic ${auth}`)
              }
            })
          },
        },
      },
    },
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'partner-auth',
        configureServer(server) {
          server.middlewares.use('/api/partner-auth', (req, res, next) => {
            handlePartnerAuth(req, res, env).catch(next)
          })
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
