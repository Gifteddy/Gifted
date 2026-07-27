const { sendMail } = require('./lib/mailer')

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

    const host = process.env.SMTP_HOST
    if (!host) {
      return res.status(500).json({ error: 'SMTP not configured on server (missing SMTP_HOST)' })
    }

    const ok = await sendMail({ to, subject, html, from, replyTo })
    if (!ok) {
      return res.status(500).json({ error: 'Failed to send email' })
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('[Send Email] Error:', err)
    return res.status(500).json({ error: err.message })
  }
}
