import type { Plugin } from 'vite'
import { createRequire } from 'node:module'
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

function makeExpressRes(res: any) {
  let ended = false
  const wrapper: any = {
    setHeader: (k: string, v: string) => {
      if (!ended) try { res.setHeader(k, v) } catch {}
      return wrapper
    },
    getHeader: (k: string) => {
      try { return res.getHeader(k) } catch { return undefined }
    },
    removeHeader: (k: string) => {
      if (!ended) try { res.removeHeader(k) } catch {}
      return wrapper
    },
    status: (code: number) => {
      if (!ended) try { res.statusCode = code } catch {}
      return wrapper
    },
    writeHead: (code: number, headers?: any) => {
      if (!ended) try {
        res.statusCode = code
        if (headers) Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v as string))
      } catch {}
      return wrapper
    },
    write: (chunk: any) => {
      if (!ended) try { res.write(chunk) } catch {}
      return wrapper
    },
    end: (data?: any) => {
      if (!ended) {
        ended = true
        try { res.end(data) } catch {}
      }
      return wrapper
    },
    json: (data: any) => {
      if (!ended) {
        ended = true
        try {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(data))
        } catch {}
      }
      return wrapper
    },
  }
  return wrapper
}

function sendJson(res: any, status: number, body: any) {
  if (res.writableEnded) return
  try {
    res.statusCode = status
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(body))
  } catch {}
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
        if (req.method !== 'POST') { sendJson(res, 405, { error: 'Method not allowed' }); return }

        await parseBody(req)

        const nodemailer = require_('nodemailer')
        const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env

        if (!SMTP_HOST) {
          sendJson(res, 500, { error: 'SMTP not configured (missing SMTP_HOST)' })
          return
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
            sendJson(res, 400, { error: 'Missing required fields: to, subject, html' })
            return
          }

          await transporter.sendMail({
            from: from || SMTP_FROM || SMTP_USER,
            to,
            subject,
            html,
            ...(replyTo ? { replyTo } : {}),
          })

          console.log(`[Dev API] Email sent to ${to}`)
          sendJson(res, 200, { success: true })
        } catch (err: any) {
          console.error('[Dev API] send-email error:', err)
          sendJson(res, 500, { error: err.message })
        }
      })

      // --- send-push ---
      server.middlewares.use('/api/send-push', async (req: any, res: any) => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
        if (req.method === 'OPTIONS') { res.statusCode = 200; return res.end() }
        if (req.method !== 'POST') { sendJson(res, 405, { error: 'Method not allowed' }); return }

        await parseBody(req)

        const webPush = require_('web-push')
        const { createClient } = require_('@supabase/supabase-js')

        const SUPABASE_URL = process.env.VITE_SUPABASE_URL
        const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
        const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
        const VAPID_EMAIL = process.env.VAPID_EMAIL || 'ibiamiheanyi@gmail.com'

        if (!VAPID_PRIVATE_KEY) {
          sendJson(res, 500, { error: 'Push not configured (missing VAPID_PRIVATE_KEY)' })
          return
        }
        if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
          sendJson(res, 500, { error: 'Supabase not configured' })
          return
        }

        webPush.setVapidDetails(
          `mailto:${VAPID_EMAIL}`,
          process.env.VITE_VAPID_PUBLIC_KEY || '',
          VAPID_PRIVATE_KEY,
        )

        const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        const { userId, role, title, body: pushBody, url, tag } = req.body || {}

        if (!title || !pushBody) {
          sendJson(res, 400, { error: 'Missing required fields: title, body' })
          return
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
            sendJson(res, 500, { error: 'Failed to fetch subscriptions' })
            return
          }
          if (!subs || subs.length === 0) {
            sendJson(res, 200, { sent: 0, message: 'No active subscriptions' })
            return
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
          sendJson(res, 200, { sent, failed: subs.length - sent })
        } catch (err: any) {
          console.error('[Dev API] send-push error:', err)
          sendJson(res, 500, { error: err.message })
        }
      })

      // --- partner-auth (approve/reject with auth user creation) ---
      server.middlewares.use('/api/partner-auth', async (req: any, res: any) => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        if (req.method === 'OPTIONS') { res.statusCode = 200; return res.end() }
        if (req.method !== 'POST') { sendJson(res, 405, { error: 'Method not allowed' }); return }

        await parseBody(req)

        try {
          const { pathToFileURL } = await import('node:url')
          const handlerPath = pathToFileURL(path.join(__dirname, 'api', 'partner-auth.js')).href
          const mod = await import(handlerPath)
          const handler = mod.default || mod

          if (typeof handler !== 'function') {
            console.error('[Dev API] partner-auth: loaded module is not a function, got:', typeof handler)
            sendJson(res, 500, { error: 'Handler not a function' })
            return
          }

          const expressRes = makeExpressRes(res)
          await handler(req, expressRes)
        } catch (err: any) {
          console.error('[Dev API] partner-auth error:', err.message || err)
          console.error('[Dev API] partner-auth stack:', err.stack)
          sendJson(res, 500, { error: err.message || 'Internal server error' })
        }
      })

      // --- partner-set-password (verify token + set password) ---
      server.middlewares.use('/api/partner-set-password', async (req: any, res: any) => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
        if (req.method === 'OPTIONS') { res.statusCode = 200; return res.end() }
        if (req.method !== 'POST') { sendJson(res, 405, { error: 'Method not allowed' }); return }

        await parseBody(req)

        try {
          const { pathToFileURL } = await import('node:url')
          const handlerPath = pathToFileURL(path.join(__dirname, 'api', 'partner-set-password.js')).href
          const mod = await import(handlerPath)
          const handler = mod.default || mod

          if (typeof handler !== 'function') {
            sendJson(res, 500, { error: 'Handler not a function' })
            return
          }

          const expressRes = makeExpressRes(res)
          await handler(req, expressRes)
        } catch (err: any) {
          console.error('[Dev API] partner-set-password error:', err.message || err)
          sendJson(res, 500, { error: err.message || 'Internal server error' })
        }
      })
    },
  }
}
