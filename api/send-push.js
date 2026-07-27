const { createClient } = require('@supabase/supabase-js')
const webPush = require('web-push')

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'ibiamiheanyi@gmail.com'

if (VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(
    `mailto:${VAPID_EMAIL}`,
    process.env.VITE_VAPID_PUBLIC_KEY || '',
    VAPID_PRIVATE_KEY,
  )
}

function getCorsOrigin(req) {
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)
  const origin = req.headers.origin || ''
  return allowed.length > 0 ? (allowed.includes(origin) ? origin : allowed[0]) : origin || '*'
}

module.exports = async function handler(req, res) {
  const corsOrigin = getCorsOrigin(req)
  res.setHeader('Access-Control-Allow-Origin', corsOrigin)
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Max-Age', '86400')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  if (!VAPID_PRIVATE_KEY) {
    return res.status(500).json({ error: 'Push notifications not configured (missing VAPID_PRIVATE_KEY)' })
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Supabase not configured' })
  }

  const { userId, role, title, body, url, tag } = req.body || {}

  if (!title || !body) {
    return res.status(400).json({ error: 'Missing required fields: title, body' })
  }

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  try {
    let query = adminClient
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth_key, user_id')
      .eq('is_active', true)

    if (userId) {
      query = query.eq('user_id', userId)
    } else if (role) {
      query = query.eq('role', role)
    }

    const { data: subscriptions, error: fetchError } = await query

    if (fetchError) {
      console.error('[Push] Fetch subscriptions error:', fetchError)
      return res.status(500).json({ error: 'Failed to fetch subscriptions' })
    }

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(200).json({ sent: 0, message: 'No active subscriptions' })
    }

    const payload = JSON.stringify({
      title,
      body,
      tag: tag || 'gifted-notification',
      data: { url: url || '/shop/partners/dashboard' },
      icon: 'https://res.cloudinary.com/dr4fjf3a1/image/upload/f_auto,q_auto,w_192,h_192,c_fit/v1781723693/logo_u7assw.png',
    })

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth_key },
          }
          await webPush.sendNotification(pushSubscription, payload)
          return { success: true, endpoint: sub.endpoint }
        } catch (err) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await adminClient
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', sub.endpoint)
          }
          return { success: false, endpoint: sub.endpoint, error: err.message }
        }
      }),
    )

    const sent = results.filter(r => r.status === 'fulfilled' && r.value?.success).length
    const failed = results.length - sent

    return res.status(200).json({ sent, failed, total: results.length })
  } catch (err) {
    console.error('[Push] Send error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
