import type { Plugin } from 'vite'
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require_ = createRequire(import.meta.url)

function parseBody(req: any): Promise<void> {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk: Buffer) => (body += chunk))
    req.on('end', () => {
      try { req.body = JSON.parse(body) } catch { req.body = {} }
      resolve()
    })
  })
}

export default function apiPlugin(): Plugin {
  return {
    name: 'vite-plugin-api-routes',
    configureServer(server) {
      // --- send-email ---
      server.middlewares.use('/api/send-email', async (req: any, res: any) => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
        if (req.method === 'OPTIONS') { res.statusCode = 200; return res.end() }
        if (req.method !== 'POST') { res.statusCode = 405; return res.end(JSON.stringify({ error: 'Method not allowed' })) }

        await parseBody(req)

        // Load nodemailer via createRequire (CJS compat)
        const nodemailer = require_('nodemailer')
        const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env

        if (!SMTP_HOST) {
          res.statusCode = 500
          return res.end(JSON.stringify({ error: 'SMTP not configured (missing SMTP_HOST)' }))
        }

        try {
          const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT) || 587,
            secure: Number(SMTP_PORT) === 465,
            auth: { user: SMTP_USER, pass: SMTP_PASS },
          })

          const { to, subject, html, from, replyTo } = req.body || {}
          if (!to || !subject || !html) {
            res.statusCode = 400
            return res.end(JSON.stringify({ error: 'Missing required fields: to, subject, html' }))
          }

          await transporter.sendMail({
            from: from || SMTP_FROM || SMTP_USER,
            to,
            subject,
            html,
            ...(replyTo ? { replyTo } : {}),
          })

          console.log(`[Dev API] Email sent to ${to}`)
          res.statusCode = 200
          return res.end(JSON.stringify({ success: true }))
        } catch (err: any) {
          console.error('[Dev API] send-email error:', err)
          res.statusCode = 500
          return res.end(JSON.stringify({ error: err.message }))
        }
      })

      // --- send-push ---
      server.middlewares.use('/api/send-push', async (req: any, res: any) => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
        if (req.method === 'OPTIONS') { res.statusCode = 200; return res.end() }
        if (req.method !== 'POST') { res.statusCode = 405; return res.end(JSON.stringify({ error: 'Method not allowed' })) }

        await parseBody(req)

        const webPush = require_('web-push')
        const { createClient } = require_('@supabase/supabase-js')

        const SUPABASE_URL = process.env.VITE_SUPABASE_URL
        const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
        const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
        const VAPID_EMAIL = process.env.VAPID_EMAIL || 'ibiamiheanyi@gmail.com'

        if (!VAPID_PRIVATE_KEY) {
          res.statusCode = 500
          return res.end(JSON.stringify({ error: 'Push not configured (missing VAPID_PRIVATE_KEY)' }))
        }
        if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
          res.statusCode = 500
          return res.end(JSON.stringify({ error: 'Supabase not configured' }))
        }

        webPush.setVapidDetails(
          `mailto:${VAPID_EMAIL}`,
          process.env.VITE_VAPID_PUBLIC_KEY || '',
          VAPID_PRIVATE_KEY,
        )

        const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        const { userId, role, title, body: pushBody, url, tag } = req.body || {}

        if (!title || !pushBody) {
          res.statusCode = 400
          return res.end(JSON.stringify({ error: 'Missing required fields: title, body' }))
        }

        try {
          let query = adminClient
            .from('push_subscriptions')
            .select('endpoint, p256dh, auth_key')
            .eq('is_active', true)

          if (userId) query = query.eq('user_id', userId)
          else if (role) query = query.eq('role', role)

          const { data: subs, error } = await query
          if (error) {
            res.statusCode = 500
            return res.end(JSON.stringify({ error: 'Failed to fetch subscriptions' }))
          }
          if (!subs || subs.length === 0) {
            res.statusCode = 200
            return res.end(JSON.stringify({ sent: 0, message: 'No active subscriptions' }))
          }

          const payload = JSON.stringify({
            title,
            body: pushBody,
            tag: tag || 'gifted-notification',
            data: { url: url || '/shop/partners/dashboard' },
          })

          const results = await Promise.allSettled(
            subs.map(async (sub: any) => {
              try {
                await webPush.sendNotification(
                  { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
                  payload,
                )
                return { success: true }
              } catch (err: any) {
                if (err.statusCode === 410 || err.statusCode === 404) {
                  await adminClient.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
                }
                return { success: false }
              }
            }),
          )

          const sent = results.filter(r => r.status === 'fulfilled' && (r as any).value?.success).length
          console.log(`[Dev API] Push sent: ${sent}/${subs.length}`)
          res.statusCode = 200
          return res.end(JSON.stringify({ sent, failed: subs.length - sent }))
        } catch (err: any) {
          console.error('[Dev API] send-push error:', err)
          res.statusCode = 500
          return res.end(JSON.stringify({ error: err.message }))
        }
      })

      // --- partner-auth (approve/reject with auth user creation) ---
      server.middlewares.use('/api/partner-auth', async (req: any, res: any) => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        if (req.method === 'OPTIONS') { res.statusCode = 200; return res.end() }
        if (req.method !== 'POST') { res.statusCode = 405; return res.end(JSON.stringify({ error: 'Method not allowed' })) }

        await parseBody(req)

        // Forward headers (Authorization)
        req.headers = req.headers || {}
        try {
          const mod = await import(path.join(__dirname, 'api', 'partner-auth.js'))
          // partner-auth.js expects raw Node req/res — simulate enough
          const fakeReq = { ...req, body: req.body, headers: req.headers, method: 'POST', socket: {} }
          const fakeRes = {
            status(code: number) { res.statusCode = code; return this },
            json(data: any) { res.end(JSON.stringify(data)); return this },
            setHeader() { return this },
          }
          await mod.default(fakeReq, fakeRes)
        } catch (err: any) {
          console.error('[Dev API] partner-auth error:', err)
          res.statusCode = 500
          res.end(JSON.stringify({ error: err.message }))
        }
      })
    },
  }
}
