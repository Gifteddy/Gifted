const RESEND_API = 'https://api.resend.com'

function getCorsOrigin(req) {
  const allowed = (process.env.ALLOWED_ORIGINS || process.env.VERCEL_URL || '').split(',').map(s => s.trim()).filter(Boolean)
  const origin = req.headers.origin || ''
  if (allowed.length === 0) return origin || '*'
  return allowed.includes(origin) ? origin : allowed[0]
}

module.exports = async (req, res) => {
  const origin = getCorsOrigin(req)
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { to, subject, html, from, replyTo } = req.body
    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, html' })
    }

    const apiKey = process.env.RESEND_API_KEY
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@gifted.ng'
    if (!apiKey) {
      return res.status(500).json({ error: 'RESEND_API_KEY not configured on server' })
    }

    const res2 = await fetch(`${RESEND_API}/emails`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: from || fromEmail,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    })

    if (!res2.ok) {
      const body = await res2.text().catch(() => '')
      console.error(`[Send Email] Resend error ${res2.status}:`, body)
      return res.status(res2.status).json({ error: `Resend error: ${body}` })
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('[Send Email] Error:', err)
    return res.status(500).json({ error: err.message })
  }
}
