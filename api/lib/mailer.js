const nodemailer = require('nodemailer')

let cachedTransport = null

function getTransport() {
  if (cachedTransport) return cachedTransport

  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    console.warn('[Mailer] SMTP not configured (SMTP_HOST/SMTP_USER/SMTP_PASS missing).')
    return null
  }

  cachedTransport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })

  return cachedTransport
}

function getFromEmail() {
  return process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@gifted.ng'
}

async function sendMail({ to, subject, html, replyTo }) {
  const transport = getTransport()
  if (!transport) {
    console.warn('[Mailer] Skipping email — no transport configured.')
    return false
  }

  const addresses = Array.isArray(to) ? to : [to]

  try {
    await transport.sendMail({
      from: getFromEmail(),
      to: addresses.join(', '),
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    })
    return true
  } catch (err) {
    console.error('[Mailer] Send failed:', err)
    return false
  }
}

module.exports = { sendMail, getTransport }
