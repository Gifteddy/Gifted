const RESEND_API = 'https://api.resend.com'

export interface SendEmailParams {
  to: string
  subject: string
  html: string
  from?: string
}

function isResendAvailable(): boolean {
  return typeof import.meta.env !== 'undefined' && !!import.meta.env.VITE_RESEND_API_KEY
}

async function callResend(endpoint: string, body: unknown): Promise<Response> {
  const apiKey = import.meta.env.VITE_RESEND_API_KEY as string || ''
  return fetch(`${RESEND_API}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  if (!isResendAvailable()) {
    console.warn('[Email] Resend not configured. Skipping email.')
    return false
  }
  try {
    const from = params.from || import.meta.env.VITE_RESEND_FROM_EMAIL as string || 'noreply@gifted.ng'
    const res = await callResend('emails', {
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
    })
    return res.ok
  } catch (err) {
    console.error('[Email] Failed to send:', err)
    return false
  }
}

// ---- TEMPLATES ----

export function purchaseConfirmationEmail(params: { name: string; items: { title: string; type: string }[]; total: number; orderId: string; downloadLinks?: { title: string; url: string }[] }): string {
  const itemsHtml = params.items.map(i => `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${i.title}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-transform:capitalize">${i.type}</td></tr>`).join('')
  const downloadsHtml = params.downloadLinks?.length
    ? `<h3 style="margin-top:24px;color:#333">Your Downloads</h3>${params.downloadLinks.map(d => `<p><a href="${d.url}" style="display:inline-block;padding:10px 20px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px">Download ${d.title}</a></p>`).join('')}`
    : ''
  return `
<!DOCTYPE html>
<html><body style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:24px">
  <h1 style="color:#7c3aed">Thank you for your order!</h1>
  <p>Hi ${params.name},</p>
  <p>Your order <strong>#${params.orderId.slice(0, 8)}</strong> has been confirmed.</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">${itemsHtml}</table>
  <p style="font-size:18px;font-weight:bold">Total: ₦${params.total.toLocaleString()}</p>
  ${downloadsHtml}
  <p style="margin-top:24px;color:#666;font-size:14px">Gifted — Creator Commerce Platform</p>
</body></html>`
}

export function orderShippingUpdateEmail(params: { name: string; orderId: string; status: string; trackingNumber?: string; carrier?: string }): string {
  return `
<!DOCTYPE html>
<html><body style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:24px">
  <h1 style="color:#7c3aed">Order Update</h1>
  <p>Hi ${params.name},</p>
  <p>Your order <strong>#${params.orderId.slice(0, 8)}</strong> status has been updated to: <strong style="text-transform:capitalize">${params.status.replace(/_/g, ' ')}</strong>.</p>
  ${params.trackingNumber ? `<p>Tracking Number: <strong>${params.trackingNumber}</strong></p>` : ''}
  ${params.carrier ? `<p>Carrier: ${params.carrier}</p>` : ''}
  <p style="margin-top:24px;color:#666;font-size:14px">Gifted — Creator Commerce Platform</p>
</body></html>`
}

export function partnerApprovalEmail(params: { name: string; referralCode: string; email: string }): string {
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://gifted.ng'
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0"><tr><td align="center" style="padding:40px 16px">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
      <tr><td align="center" style="padding-bottom:32px">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="width:40px;height:40px;background:linear-gradient(135deg,#7c3aed,#a78bfa);border-radius:12px;text-align:center;vertical-align:middle;line-height:40px;color:#fff;font-size:20px;font-weight:700">G</td>
          <td style="padding-left:10px;font-size:18px;font-weight:700;color:#1a1a1a">ifted Partners</td>
        </tr></table>
      </td></tr>
      <tr><td style="background:#fff;border-radius:16px;padding:40px 32px">
        <h1 style="margin:0 0 8px;font-size:28px;font-weight:700;color:#1a1a1a">Welcome to Gifted Partners${params.name ? ',' : ''}${params.name ? ' <span style="color:#7c3aed">' + params.name.split(' ')[0] + '</span>' : ''}!</h1>
        <p style="margin:0 0 24px;font-size:15px;color:#666;line-height:1.6">Your application has been approved. You're now part of the Gifted Partner Network.</p>
        <div style="background:linear-gradient(135deg,#f5f3ff,#ede9fe);border-radius:12px;padding:20px 24px;margin-bottom:24px">
          <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#7c3aed;text-transform:uppercase;letter-spacing:0.5px">Your Referral Code</p>
          <p style="margin:0;font-size:32px;font-weight:700;color:#5b21b6;letter-spacing:2px;font-family:monospace">${params.referralCode}</p>
          <p style="margin:8px 0 0;font-size:13px;color:#7c3aed;word-break:break-all">${siteUrl}/shop?ref=${params.referralCode}</p>
        </div>
        <a href="${siteUrl}/shop/partners/dashboard" style="display:inline-block;padding:14px 32px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:600">Go to Your Dashboard</a>
      </td></tr>
      <tr><td style="padding-top:32px;border-top:1px solid #e5e5e0;text-align:center">
        <p style="margin:0;font-size:12px;color:#999;line-height:1.6">Gifted &mdash; Creator Commerce Platform</p>
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`
}

export function partnerRejectionEmail(params: { name: string; email: string }): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0"><tr><td align="center" style="padding:40px 16px">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
      <tr><td align="center" style="padding-bottom:32px">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="width:40px;height:40px;background:linear-gradient(135deg,#7c3aed,#a78bfa);border-radius:12px;text-align:center;vertical-align:middle;line-height:40px;color:#fff;font-size:20px;font-weight:700">G</td>
          <td style="padding-left:10px;font-size:18px;font-weight:700;color:#1a1a1a">ifted Partners</td>
        </tr></table>
      </td></tr>
      <tr><td style="background:#fff;border-radius:16px;padding:40px 32px;text-align:center">
        <div style="width:64px;height:64px;background:#fef2f2;border-radius:50%;margin:0 auto 24px;line-height:64px;font-size:28px">&#x1F4AC;</div>
        <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1a1a1a">Application Update</h1>
        <p style="margin:0 0 20px;font-size:15px;color:#666;line-height:1.6">Hi ${params.name || params.email.split('@')[0]},<br><br>Thank you for your interest in the Gifted Partner Network. After careful review, we're unable to move forward with your application at this time.</p>
        <div style="background:#f5f3ff;border-radius:12px;padding:20px 24px;margin-bottom:24px;text-align:left">
          <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#7c3aed">Tips for reapplying</p>
          <ul style="margin:0;padding-left:16px;font-size:13px;color:#666;line-height:1.7">
            <li>Continue growing your audience engagement</li>
            <li>Share more content aligned with our product categories</li>
            <li>Build a stronger social media presence</li>
          </ul>
        </div>
        <p style="margin:24px 0 0;font-size:14px;color:#999;font-style:italic">We wish you the best in your content journey.</p>
      </td></tr>
      <tr><td style="padding-top:32px;border-top:1px solid #e5e5e0;text-align:center">
        <p style="margin:0;font-size:12px;color:#999;line-height:1.6">Gifted &mdash; Creator Commerce Platform</p>
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`
}
