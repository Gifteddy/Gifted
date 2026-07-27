const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://gifted-beige.vercel.app'
const FROM_EMAIL = import.meta.env.VITE_SMTP_FROM || import.meta.env.VITE_RESEND_FROM_EMAIL || 'ibiamiheanyi@gmail.com'

export interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
}

function isEmailAvailable(): boolean {
  return typeof window !== 'undefined'
}

async function callSendEmail(params: SendEmailParams): Promise<boolean> {
  const res = await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: params.to,
      subject: params.subject,
      html: params.html,
      from: params.from || FROM_EMAIL,
      ...(params.replyTo ? { replyTo: params.replyTo } : {}),
    }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.error(`[Email] Server relay error ${res.status}:`, body)
    return false
  }
  return true
}

export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  if (!isEmailAvailable()) {
    console.warn('[Email] Not available (client-side). Skipping email.')
    return false
  }
  try {
    return await callSendEmail(params)
  } catch (err) {
    console.error('[Email] Failed to send:', err)
    return false
  }
}

export async function sendEmailSafe(params: SendEmailParams): Promise<boolean> {
  try {
    return await sendEmail(params)
  } catch {
    return false
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function emailWrap(body: string): string {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<style>body{margin:0;padding:0;background:#f5f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}table{border-collapse:collapse}img{border:0;height:auto;line-height:100%;outline:none;text-decoration:none}</style>
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

// ---- CUSTOMER TEMPLATES ----

export function purchaseConfirmationEmail(params: {
  name: string
  items: { title: string; type: string; quantity?: number }[]
  total: number
  orderId: string
  downloadLinks?: { title: string; url: string }[]
}): string {
  const rows = params.items.map(i =>
    `<tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#1a1a1a">${escapeHtml(i.title)}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#666;text-transform:capitalize;text-align:center">${escapeHtml(i.type)}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#666;text-align:center">${i.quantity || 1}</td>
    </tr>`
  ).join('')

  const downloadsHtml = params.downloadLinks?.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;background:#f5f3ff;border-radius:12px">
        <tr><td style="padding:20px 24px">
          <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#7c3aed;text-transform:uppercase;letter-spacing:0.5px">Your Downloads</p>
          ${params.downloadLinks.map(d => `<p style="margin:6px 0"><a href="${d.url}" style="display:inline-block;padding:10px 20px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600">Download ${escapeHtml(d.title)}</a></p>`).join('')}
        </td></tr>
      </table>`
    : ''

  return emailWrap(`
    <tr><td style="background:#fff;border-radius:16px;padding:40px 32px">
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#1a1a1a;text-align:center">Order Confirmed!</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;text-align:center">
        Hi ${escapeHtml(params.name)}, thank you for your order.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f5;border-radius:10px;margin-bottom:20px">
        <tr><td style="padding:16px 20px">
          <p style="margin:0;font-size:13px;color:#666">Order <strong style="color:#1a1a1a;font-family:monospace">#${escapeHtml(params.orderId.slice(0, 8))}</strong></p>
        </td></tr>
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px">
        <tr>
          <td style="padding:8px 0;border-bottom:2px solid #e5e5e0;font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.5px">Item</td>
          <td style="padding:8px 0;border-bottom:2px solid #e5e5e0;font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.5px;text-align:center">Type</td>
          <td style="padding:8px 0;border-bottom:2px solid #e5e5e0;font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.5px;text-align:center">Qty</td>
        </tr>
        ${rows}
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:16px 0;border-top:2px solid #1a1a1a">
          <p style="margin:0;font-size:20px;font-weight:700;color:#1a1a1a;text-align:right">Total: &#8358;${params.total.toLocaleString()}</p>
        </td></tr>
      </table>

      ${downloadsHtml}

      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 0">
        <tr><td style="border-radius:10px;background:#7c3aed;padding:14px 36px">
          <a href="${SITE_URL}/shop" target="_blank" style="display:inline-block;font-size:15px;font-weight:600;color:#fff;text-decoration:none">Continue Shopping</a>
        </td></tr>
      </table>
    </td></tr>
  `)
}

export function orderShippingUpdateEmail(params: {
  name: string
  orderId: string
  status: string
  trackingNumber?: string
  carrier?: string
}): string {
  return emailWrap(`
    <tr><td style="background:#fff;border-radius:16px;padding:40px 32px">
      <h1 style="margin:0 0 24px;font-size:26px;font-weight:700;color:#1a1a1a;text-align:center">Order Update</h1>
      <p style="margin:0 0 16px;font-size:15px;color:#555;line-height:1.7;text-align:center">
        Hi ${escapeHtml(params.name)}, your order <strong style="color:#1a1a1a;font-family:monospace">#${escapeHtml(params.orderId.slice(0, 8))}</strong> has been updated.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border-radius:12px;margin-bottom:24px">
        <tr><td style="padding:20px 24px;text-align:center">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#7c3aed;text-transform:uppercase;letter-spacing:0.5px">New Status</p>
          <p style="margin:0;font-size:22px;font-weight:700;color:#5b21b6;text-transform:capitalize">${escapeHtml(params.status.replace(/_/g, ' '))}</p>
        </td></tr>
      </table>
      ${params.trackingNumber ? `<p style="margin:0 0 8px;font-size:14px;color:#555;text-align:center">Tracking: <strong style="color:#1a1a1a;font-family:monospace">${escapeHtml(params.trackingNumber)}</strong></p>` : ''}
      ${params.carrier ? `<p style="margin:0 0 8px;font-size:14px;color:#555;text-align:center">Carrier: <strong>${escapeHtml(params.carrier)}</strong></p>` : ''}
    </td></tr>
  `)
}

// ---- ADMIN/OWNER NOTIFICATION TEMPLATES ----

export function newOrderOwnerEmail(params: {
  orderId: string
  customerName: string
  customerEmail: string
  items: { title: string; type: string; quantity: number; unit_price: number }[]
  total: number
  paymentReference: string
  shippingAddress?: { line1: string; city: string; state: string; country: string } | null
}): string {
  const rows = params.items.map(i =>
    `<tr>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#1a1a1a">${escapeHtml(i.title)}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#666;text-align:center">${i.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#666;text-align:right">&#8358;${i.unit_price.toLocaleString()}</td>
    </tr>`
  ).join('')

  return emailWrap(`
    <tr><td style="background:#fff;border-radius:16px;padding:40px 32px">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px">
        <tr><td style="width:48px;height:48px;background:#dcfce7;border-radius:50%;text-align:center;vertical-align:middle;line-height:48px;font-size:24px">&#128176;</td></tr>
      </table>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1a1a1a;text-align:center">New Order Received</h1>
      <p style="margin:0 0 24px;font-size:14px;color:#666;text-align:center">Payment confirmed via Paystack</p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f5;border-radius:10px;margin-bottom:20px">
        <tr><td style="padding:16px 20px">
          <p style="margin:0 0 4px;font-size:12px;color:#999">Order ID</p>
          <p style="margin:0;font-size:14px;color:#1a1a1a;font-family:monospace">#${escapeHtml(params.orderId.slice(0, 8))}</p>
        </td></tr>
        <tr><td style="padding:12px 20px;border-top:1px solid #eee">
          <p style="margin:0 0 4px;font-size:12px;color:#999">Customer</p>
          <p style="margin:0;font-size:14px;color:#1a1a1a">${escapeHtml(params.customerName)} &lt;${escapeHtml(params.customerEmail)}&gt;</p>
        </td></tr>
        <tr><td style="padding:12px 20px;border-top:1px solid #eee">
          <p style="margin:0 0 4px;font-size:12px;color:#999">Payment Reference</p>
          <p style="margin:0;font-size:14px;color:#1a1a1a;font-family:monospace">${escapeHtml(params.paymentReference)}</p>
        </td></tr>
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px">
        <tr>
          <td style="padding:6px 0;font-size:11px;font-weight:600;color:#999;text-transform:uppercase">Item</td>
          <td style="padding:6px 0;font-size:11px;font-weight:600;color:#999;text-transform:uppercase;text-align:center">Qty</td>
          <td style="padding:6px 0;font-size:11px;font-weight:600;color:#999;text-transform:uppercase;text-align:right">Price</td>
        </tr>
        ${rows}
        <tr><td colspan="2" style="padding:12px 0 0;font-size:14px;font-weight:600;color:#1a1a1a">Total</td>
        <td style="padding:12px 0 0;font-size:16px;font-weight:700;color:#7c3aed;text-align:right">&#8358;${params.total.toLocaleString()}</td></tr>
      </table>

      ${params.shippingAddress ? `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border-radius:10px;margin-bottom:16px">
        <tr><td style="padding:16px 20px">
          <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#7c3aed;text-transform:uppercase;letter-spacing:0.5px">Shipping Address</p>
          <p style="margin:0;font-size:13px;color:#1a1a1a;line-height:1.6">
            ${escapeHtml(params.shippingAddress.line1)}<br>
            ${escapeHtml(params.shippingAddress.city)}, ${escapeHtml(params.shippingAddress.state)}<br>
            ${escapeHtml(params.shippingAddress.country)}
          </p>
        </td></tr>
      </table>` : ''}

      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px auto 0">
        <tr><td style="border-radius:10px;background:#7c3aed;padding:12px 28px">
          <a href="${SITE_URL}/admin/orders" style="display:inline-block;font-size:14px;font-weight:600;color:#fff;text-decoration:none">View in Dashboard</a>
        </td></tr>
      </table>
    </td></tr>
  `)
}

export function contactFormOwnerEmail(params: {
  name: string
  email: string
  subject: string
  message: string
  preferredContact: string
}): string {
  return emailWrap(`
    <tr><td style="background:#fff;border-radius:16px;padding:40px 32px">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px">
        <tr><td style="width:48px;height:48px;background:#ede9fe;border-radius:50%;text-align:center;vertical-align:middle;line-height:48px;font-size:24px">&#9993;</td></tr>
      </table>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1a1a1a;text-align:center">New Contact Message</h1>
      <p style="margin:0 0 24px;font-size:14px;color:#666;text-align:center">Someone reached out via your portfolio contact form.</p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f5;border-radius:10px;margin-bottom:20px">
        <tr><td style="padding:16px 20px">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.5px">From</p>
          <p style="margin:0;font-size:14px;color:#1a1a1a"><strong>${escapeHtml(params.name)}</strong> &lt;${escapeHtml(params.email)}&gt;</p>
        </td></tr>
        <tr><td style="padding:12px 20px;border-top:1px solid #eee">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.5px">Subject</p>
          <p style="margin:0;font-size:14px;color:#1a1a1a">${escapeHtml(params.subject)}</p>
        </td></tr>
        <tr><td style="padding:12px 20px;border-top:1px solid #eee">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.5px">Preferred Contact</p>
          <p style="margin:0;font-size:14px;color:#1a1a1a;text-transform:capitalize">${escapeHtml(params.preferredContact)}</p>
        </td></tr>
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border-radius:12px;margin-bottom:20px">
        <tr><td style="padding:20px 24px">
          <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#7c3aed;text-transform:uppercase;letter-spacing:0.5px">Message</p>
          <p style="margin:0;font-size:14px;color:#1a1a1a;line-height:1.7;white-space:pre-wrap">${escapeHtml(params.message)}</p>
        </td></tr>
      </table>

      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto">
        <tr><td style="border-radius:10px;background:#7c3aed;padding:12px 28px">
          <a href="mailto:${escapeHtml(params.email)}?subject=Re: ${escapeHtml(params.subject)}" style="display:inline-block;font-size:14px;font-weight:600;color:#fff;text-decoration:none">Reply to ${escapeHtml(params.name.split(' ')[0])}</a>
        </td></tr>
      </table>
    </td></tr>
  `)
}

export function contactFormCustomerEmail(params: { name: string; subject: string }): string {
  return emailWrap(`
    <tr><td style="background:#fff;border-radius:16px;padding:40px 32px">
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1a1a1a;text-align:center">Message Received!</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;text-align:center">
        Hi ${escapeHtml(params.name)}, thanks for reaching out. I've received your message and will get back to you soon.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f5;border-radius:10px">
        <tr><td style="padding:16px 20px">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.5px">Your Message</p>
          <p style="margin:0;font-size:13px;color:#666;font-style:italic">${escapeHtml(params.subject)}</p>
        </td></tr>
      </table>
    </td></tr>
  `)
}

export function fileUploadOwnerEmail(params: {
  senderName: string
  senderEmail: string
  message: string
  fileCount: number
  fileNames: string[]
  uploadLinkId: string
}): string {
  const fileList = params.fileNames.slice(0, 5).map(n =>
    `<li style="padding:4px 0;font-size:13px;color:#1a1a1a">${escapeHtml(n)}</li>`
  ).join('')
  const moreText = params.fileNames.length > 5 ? `<li style="padding:4px 0;font-size:13px;color:#999">...and ${params.fileNames.length - 5} more</li>` : ''

  return emailWrap(`
    <tr><td style="background:#fff;border-radius:16px;padding:40px 32px">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px">
        <tr><td style="width:48px;height:48px;background:#dbeafe;border-radius:50%;text-align:center;vertical-align:middle;line-height:48px;font-size:24px">&#128193;</td></tr>
      </table>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1a1a1a;text-align:center">Files Uploaded</h1>
      <p style="margin:0 0 24px;font-size:14px;color:#666;text-align:center">
        <strong>${escapeHtml(params.senderName)}</strong> (${escapeHtml(params.senderEmail)}) uploaded ${params.fileCount} file${params.fileCount > 1 ? 's' : ''}.
      </p>

      ${params.message ? `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f5;border-radius:10px;margin-bottom:20px">
        <tr><td style="padding:16px 20px">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.5px">Message</p>
          <p style="margin:0;font-size:13px;color:#1a1a1a;line-height:1.6">${escapeHtml(params.message)}</p>
        </td></tr>
      </table>` : ''}

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border-radius:10px;margin-bottom:20px">
        <tr><td style="padding:16px 20px">
          <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#7c3aed;text-transform:uppercase;letter-spacing:0.5px">Files (${params.fileCount})</p>
          <ul style="margin:0;padding-left:16px">${fileList}${moreText}</ul>
        </td></tr>
      </table>

      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto">
        <tr><td style="border-radius:10px;background:#7c3aed;padding:12px 28px">
          <a href="${SITE_URL}/admin/file-uploads" style="display:inline-block;font-size:14px;font-weight:600;color:#fff;text-decoration:none">View in Dashboard</a>
        </td></tr>
      </table>
    </td></tr>
  `)
}

export function fileCommentOwnerEmail(params: {
  authorName: string
  fileName: string
  comment: string
  shareLabel: string
  shareToken: string
}): string {
  return emailWrap(`
    <tr><td style="background:#fff;border-radius:16px;padding:40px 32px">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px">
        <tr><td style="width:48px;height:48px;background:#fef3c7;border-radius:50%;text-align:center;vertical-align:middle;line-height:48px;font-size:24px">&#128172;</td></tr>
      </table>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1a1a1a;text-align:center">New Comment</h1>
      <p style="margin:0 0 24px;font-size:14px;color:#666;text-align:center">
        <strong>${escapeHtml(params.authorName)}</strong> commented on <strong>${escapeHtml(params.fileName)}</strong> in "${escapeHtml(params.shareLabel)}".
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border-radius:12px;margin-bottom:24px">
        <tr><td style="padding:20px 24px">
          <p style="margin:0;font-size:14px;color:#1a1a1a;line-height:1.7;font-style:italic">"${escapeHtml(params.comment)}"</p>
        </td></tr>
      </table>

      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto">
        <tr><td style="border-radius:10px;background:#7c3aed;padding:12px 28px">
          <a href="${SITE_URL}/admin/file-shares" style="display:inline-block;font-size:14px;font-weight:600;color:#fff;text-decoration:none">View in Dashboard</a>
        </td></tr>
      </table>
    </td></tr>
  `)
}

