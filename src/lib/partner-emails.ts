const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://gifted-beige.vercel.app'

function escapeHtml(str: string): string {
  if (!str) return ''
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function partnerEmailWrap(body: string): string {
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
<td style="padding-left:10px;font-size:18px;font-weight:700;color:#1a1a1a">ifted Partners</td>
</tr></table>
</td></tr>
${body}
<tr><td style="padding-top:32px;border-top:1px solid #e5e5e0;text-align:center">
<p style="margin:0;font-size:12px;color:#999;line-height:1.6">Gifted Partners &mdash; Earn by Sharing<br><a href="${SITE_URL}/partner/dashboard" style="color:#7c3aed;text-decoration:none">${SITE_URL.replace('https://', '')}/partner/dashboard</a></p>
</td></tr>
</table></td></tr></table></body></html>`
}

function ctaButton(url: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 0">
    <tr><td style="border-radius:10px;background:#7c3aed;padding:14px 36px">
      <a href="${url}" target="_blank" style="display:inline-block;font-size:15px;font-weight:600;color:#fff;text-decoration:none">${escapeHtml(label)}</a>
    </td></tr>
  </table>`
}

// ---- PARTNER APPLICATION TEMPLATES ----

export function partnerApplicationReceivedEmail(params: { name: string }): string {
  return partnerEmailWrap(`
    <tr><td style="background:#fff;border-radius:16px;padding:40px 32px">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px">
        <tr><td style="width:48px;height:48px;background:#f5f3ff;border-radius:50%;text-align:center;vertical-align:middle;line-height:48px;font-size:24px">&#128233;</td></tr>
      </table>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#1a1a1a;text-align:center">Application Received</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;text-align:center">
        Hi ${escapeHtml(params.name)}, thank you for applying to become a Gifted Partner! We've received your application and our team will review it shortly.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f5;border-radius:10px;margin-bottom:8px">
        <tr><td style="padding:16px 20px">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.5px">What happens next?</p>
          <p style="margin:0;font-size:14px;color:#555;line-height:1.6">
            Our team will review your application within 2-3 business days. You'll receive an email once a decision has been made. Please also check your spam/junk folder if you don't see it in your inbox.
          </p>
        </td></tr>
      </table>
    </td></tr>
  `)
}

export function partnerApplicationApprovedEmail(params: { name: string; referralCode: string; loginUrl: string }): string {
  return partnerEmailWrap(`
    <tr><td style="background:#fff;border-radius:16px;padding:40px 32px">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px">
        <tr><td style="width:48px;height:48px;background:#dcfce7;border-radius:50%;text-align:center;vertical-align:middle;line-height:48px;font-size:24px">&#10004;&#65039;</td></tr>
      </table>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#1a1a1a;text-align:center">Application Approved!</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;text-align:center">
        Hi ${escapeHtml(params.name)}, great news! Your application to become a Gifted Partner has been approved. Welcome to the team!
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border-radius:12px;margin-bottom:24px">
        <tr><td style="padding:20px 24px;text-align:center">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#7c3aed;text-transform:uppercase;letter-spacing:0.5px">Your Referral Code</p>
          <p style="margin:0;font-size:28px;font-weight:700;color:#5b21b6;font-family:monospace;letter-spacing:2px">${escapeHtml(params.referralCode)}</p>
        </td></tr>
      </table>

      <p style="margin:0 0 20px;font-size:14px;color:#555;line-height:1.6;text-align:center">
        Share this code with your audience to start earning commissions on every sale.
      </p>

      ${ctaButton(params.loginUrl, 'Log In to Dashboard')}
    </td></tr>
  `)
}

export function partnerApplicationRejectedEmail(params: { name: string }): string {
  return partnerEmailWrap(`
    <tr><td style="background:#fff;border-radius:16px;padding:40px 32px">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px">
        <tr><td style="width:48px;height:48px;background:#fef2f2;border-radius:50%;text-align:center;vertical-align:middle;line-height:48px;font-size:24px">&#128312;</td></tr>
      </table>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#1a1a1a;text-align:center">Application Not Approved</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;text-align:center">
        Hi ${escapeHtml(params.name)}, after careful review, we're unable to approve your Gifted Partners application at this time.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f5;border-radius:10px;margin-bottom:20px">
        <tr><td style="padding:16px 20px">
          <p style="margin:0;font-size:14px;color:#555;line-height:1.6">
            This decision is not permanent. You're welcome to reapply in the future once you've built a stronger audience or portfolio. We encourage you to keep creating and growing.
          </p>
        </td></tr>
      </table>
      ${ctaButton(`${SITE_URL}/partner/apply`, 'Reapply Later')}
    </td></tr>
  `)
}

// ---- PARTNER ONBOARDING TEMPLATES ----

export function partnerWelcomeEmail(params: { name: string; referralCode: string; dashboardUrl: string }): string {
  return partnerEmailWrap(`
    <tr><td style="background:#fff;border-radius:16px;padding:40px 32px">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px">
        <tr><td style="width:48px;height:48px;background:#fef3c7;border-radius:50%;text-align:center;vertical-align:middle;line-height:48px;font-size:24px">&#127881;</td></tr>
      </table>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#1a1a1a;text-align:center">Welcome to Gifted Partners!</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;text-align:center">
        Hi ${escapeHtml(params.name)}, you're officially a Gifted Partner. Here's how to get started and start earning.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border-radius:12px;margin-bottom:20px">
        <tr><td style="padding:20px 24px;text-align:center">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#7c3aed;text-transform:uppercase;letter-spacing:0.5px">Your Referral Code</p>
          <p style="margin:0;font-size:28px;font-weight:700;color:#5b21b6;font-family:monospace;letter-spacing:2px">${escapeHtml(params.referralCode)}</p>
        </td></tr>
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px">
        <tr><td style="padding:14px 20px;background:#f8f8f5;border-radius:10px;margin-bottom:8px">
          <p style="margin:0;font-size:14px;color:#1a1a1a"><strong style="color:#7c3aed">1.</strong> &nbsp;Get your referral link from the dashboard</p>
        </td></tr>
        <tr><td style="height:8px"></td></tr>
        <tr><td style="padding:14px 20px;background:#f8f8f5;border-radius:10px">
          <p style="margin:0;font-size:14px;color:#1a1a1a"><strong style="color:#7c3aed">2.</strong> &nbsp;Share products with your audience</p>
        </td></tr>
        <tr><td style="height:8px"></td></tr>
        <tr><td style="padding:14px 20px;background:#f8f8f5;border-radius:10px">
          <p style="margin:0;font-size:14px;color:#1a1a1a"><strong style="color:#7c3aed">3.</strong> &nbsp;Track your clicks, conversions, and earnings</p>
        </td></tr>
      </table>

      ${ctaButton(params.dashboardUrl, 'Go to Dashboard')}
    </td></tr>
  `)
}

export function partnerPasswordCreatedEmail(params: { name: string; dashboardUrl: string }): string {
  return partnerEmailWrap(`
    <tr><td style="background:#fff;border-radius:16px;padding:40px 32px">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px">
        <tr><td style="width:48px;height:48px;background:#dcfce7;border-radius:50%;text-align:center;vertical-align:middle;line-height:48px;font-size:24px">&#128274;</td></tr>
      </table>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#1a1a1a;text-align:center">Account Ready!</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;text-align:center">
        Hi ${escapeHtml(params.name)}, your partner account password has been set. You can now log in to your dashboard and start promoting products.
      </p>
      ${ctaButton(params.dashboardUrl, 'Log In to Dashboard')}
    </td></tr>
  `)
}

// ---- COMMISSION & SALES TEMPLATES ----

export function partnerCommissionEarnedEmail(params: { name: string; amount: number; productTitle: string; saleAmount: number; rate: number }): string {
  return partnerEmailWrap(`
    <tr><td style="background:#fff;border-radius:16px;padding:40px 32px">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px">
        <tr><td style="width:48px;height:48px;background:#dcfce7;border-radius:50%;text-align:center;vertical-align:middle;line-height:48px;font-size:24px">&#128176;</td></tr>
      </table>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#1a1a1a;text-align:center">Commission Earned!</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;text-align:center">
        Hi ${escapeHtml(params.name)}, someone purchased through your referral link and you've earned a commission!
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border-radius:12px;margin-bottom:20px">
        <tr><td style="padding:24px;text-align:center">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#7c3aed;text-transform:uppercase;letter-spacing:0.5px">Your Commission</p>
          <p style="margin:0;font-size:32px;font-weight:700;color:#5b21b6">&#8358;${params.amount.toLocaleString()}</p>
        </td></tr>
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f5;border-radius:10px;margin-bottom:20px">
        <tr><td style="padding:16px 20px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:4px 0;font-size:13px;color:#999">Product</td>
              <td style="padding:4px 0;font-size:13px;color:#1a1a1a;text-align:right;font-weight:600">${escapeHtml(params.productTitle)}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:13px;color:#999">Sale Amount</td>
              <td style="padding:4px 0;font-size:13px;color:#1a1a1a;text-align:right;font-weight:600">&#8358;${params.saleAmount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:13px;color:#999">Commission Rate</td>
              <td style="padding:4px 0;font-size:13px;color:#1a1a1a;text-align:right;font-weight:600">${params.rate}%</td>
            </tr>
          </table>
        </td></tr>
      </table>

      ${ctaButton(`${SITE_URL}/partner/dashboard`, 'View Dashboard')}
    </td></tr>
  `)
}

export function partnerNewSaleEmail(params: { name: string; saleAmount: number; productTitle: string }): string {
  return partnerEmailWrap(`
    <tr><td style="background:#fff;border-radius:16px;padding:40px 32px">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px">
        <tr><td style="width:48px;height:48px;background:#dbeafe;border-radius:50%;text-align:center;vertical-align:middle;line-height:48px;font-size:24px">&#128722;</td></tr>
      </table>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#1a1a1a;text-align:center">New Sale!</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;text-align:center">
        Hi ${escapeHtml(params.name)}, someone just made a purchase through your referral link!
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f5;border-radius:10px;margin-bottom:24px">
        <tr><td style="padding:20px 24px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:4px 0;font-size:13px;color:#999">Product</td>
              <td style="padding:4px 0;font-size:13px;color:#1a1a1a;text-align:right;font-weight:600">${escapeHtml(params.productTitle)}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:13px;color:#999">Sale Amount</td>
              <td style="padding:4px 0;font-size:13px;color:#7c3aed;text-align:right;font-weight:700;font-size:16px">&#8358;${params.saleAmount.toLocaleString()}</td>
            </tr>
          </table>
        </td></tr>
      </table>

      <p style="margin:0 0 20px;font-size:14px;color:#555;line-height:1.6;text-align:center">
        Keep sharing to earn more commissions!
      </p>

      ${ctaButton(`${SITE_URL}/partner/dashboard`, 'View Dashboard')}
    </td></tr>
  `)
}

// ---- PAYOUT TEMPLATES ----

export function partnerPayoutRequestedEmail(params: { name: string; amount: number }): string {
  return partnerEmailWrap(`
    <tr><td style="background:#fff;border-radius:16px;padding:40px 32px">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px">
        <tr><td style="width:48px;height:48px;background:#fef3c7;border-radius:50%;text-align:center;vertical-align:middle;line-height:48px;font-size:24px">&#128179;</td></tr>
      </table>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#1a1a1a;text-align:center">Payout Request Received</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;text-align:center">
        Hi ${escapeHtml(params.name)}, your payout request has been received and is now under review.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border-radius:12px;margin-bottom:24px">
        <tr><td style="padding:24px;text-align:center">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#7c3aed;text-transform:uppercase;letter-spacing:0.5px">Payout Amount</p>
          <p style="margin:0;font-size:32px;font-weight:700;color:#5b21b6">&#8358;${params.amount.toLocaleString()}</p>
        </td></tr>
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f5;border-radius:10px">
        <tr><td style="padding:16px 20px">
          <p style="margin:0;font-size:14px;color:#555;line-height:1.6">
            Our team will review your request and process it within 1-3 business days. You'll receive an email once the payout has been approved and sent. Please also check your spam/junk folder if you don't see it in your inbox.
          </p>
        </td></tr>
      </table>
    </td></tr>
  `)
}

export function partnerPayoutApprovedEmail(params: { name: string; amount: number; reference: string }): string {
  return partnerEmailWrap(`
    <tr><td style="background:#fff;border-radius:16px;padding:40px 32px">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px">
        <tr><td style="width:48px;height:48px;background:#dcfce7;border-radius:50%;text-align:center;vertical-align:middle;line-height:48px;font-size:24px">&#9989;</td></tr>
      </table>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#1a1a1a;text-align:center">Payout Approved!</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;text-align:center">
        Hi ${escapeHtml(params.name)}, your payout has been approved and will be sent to your bank account shortly.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border-radius:12px;margin-bottom:20px">
        <tr><td style="padding:24px;text-align:center">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#7c3aed;text-transform:uppercase;letter-spacing:0.5px">Payout Amount</p>
          <p style="margin:0;font-size:32px;font-weight:700;color:#5b21b6">&#8358;${params.amount.toLocaleString()}</p>
        </td></tr>
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f5;border-radius:10px;margin-bottom:20px">
        <tr><td style="padding:16px 20px">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.5px">Reference</p>
          <p style="margin:0;font-size:14px;color:#1a1a1a;font-family:monospace">${escapeHtml(params.reference)}</p>
        </td></tr>
      </table>
    </td></tr>
  `)
}

export function partnerPayoutSentEmail(params: { name: string; amount: number; reference: string; paymentMethod: string }): string {
  return partnerEmailWrap(`
    <tr><td style="background:#fff;border-radius:16px;padding:40px 32px">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px">
        <tr><td style="width:48px;height:48px;background:#dcfce7;border-radius:50%;text-align:center;vertical-align:middle;line-height:48px;font-size:24px">&#128176;</td></tr>
      </table>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#1a1a1a;text-align:center">Payout Sent!</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;text-align:center">
        Hi ${escapeHtml(params.name)}, your payout has been sent successfully.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border-radius:12px;margin-bottom:20px">
        <tr><td style="padding:24px;text-align:center">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#7c3aed;text-transform:uppercase;letter-spacing:0.5px">Amount Sent</p>
          <p style="margin:0;font-size:32px;font-weight:700;color:#5b21b6">&#8358;${params.amount.toLocaleString()}</p>
        </td></tr>
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f5;border-radius:10px;margin-bottom:20px">
        <tr><td style="padding:16px 20px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:4px 0;font-size:13px;color:#999">Payment Method</td>
              <td style="padding:4px 0;font-size:13px;color:#1a1a1a;text-align:right;font-weight:600">${escapeHtml(params.paymentMethod)}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:13px;color:#999">Reference</td>
              <td style="padding:4px 0;font-size:13px;color:#1a1a1a;text-align:right;font-weight:600;font-family:monospace">${escapeHtml(params.reference)}</td>
            </tr>
          </table>
        </td></tr>
      </table>

      <p style="margin:0;font-size:13px;color:#999;line-height:1.6;text-align:center">
        The funds should arrive in your account within 1-2 business days depending on your bank.
      </p>
    </td></tr>
  `)
}

// ---- LEVEL & ACHIEVEMENT TEMPLATES ----

export function partnerLevelUpEmail(params: { name: string; newLevel: string; benefits: string }): string {
  return partnerEmailWrap(`
    <tr><td style="background:#fff;border-radius:16px;padding:40px 32px">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px">
        <tr><td style="width:48px;height:48px;background:#fef3c7;border-radius:50%;text-align:center;vertical-align:middle;line-height:48px;font-size:24px">&#127942;</td></tr>
      </table>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#1a1a1a;text-align:center">Level Up!</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;text-align:center">
        Hi ${escapeHtml(params.name)}, congratulations! You've reached a new tier.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#7c3aed,#a78bfa);border-radius:12px;margin-bottom:24px">
        <tr><td style="padding:28px 24px;text-align:center">
          <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:rgba(255,255,255,0.8);text-transform:uppercase;letter-spacing:1px">New Level</p>
          <p style="margin:0;font-size:28px;font-weight:700;color:#fff">${escapeHtml(params.newLevel)}</p>
        </td></tr>
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border-radius:12px;margin-bottom:20px">
        <tr><td style="padding:20px 24px">
          <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#7c3aed;text-transform:uppercase;letter-spacing:0.5px">Your New Benefits</p>
          <p style="margin:0;font-size:14px;color:#1a1a1a;line-height:1.7">${escapeHtml(params.benefits)}</p>
        </td></tr>
      </table>

      ${ctaButton(`${SITE_URL}/partner/dashboard`, 'View Your Dashboard')}
    </td></tr>
  `)
}

export function partnerAchievementUnlockedEmail(params: { name: string; achievementTitle: string; achievementIcon: string }): string {
  return partnerEmailWrap(`
    <tr><td style="background:#fff;border-radius:16px;padding:40px 32px">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px">
        <tr><td style="width:48px;height:48px;background:#fef3c7;border-radius:50%;text-align:center;vertical-align:middle;line-height:48px;font-size:24px">${escapeHtml(params.achievementIcon)}</td></tr>
      </table>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#1a1a1a;text-align:center">Achievement Unlocked!</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;text-align:center">
        Hi ${escapeHtml(params.name)}, you've unlocked a new achievement. Keep up the great work!
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border-radius:12px;margin-bottom:24px">
        <tr><td style="padding:28px 24px;text-align:center">
          <p style="margin:0 0 8px;font-size:36px">${escapeHtml(params.achievementIcon)}</p>
          <p style="margin:0;font-size:20px;font-weight:700;color:#5b21b6">${escapeHtml(params.achievementTitle)}</p>
        </td></tr>
      </table>

      ${ctaButton(`${SITE_URL}/partner/dashboard`, 'View Dashboard')}
    </td></tr>
  `)
}

// ---- NOTIFICATION TEMPLATES ----

export function partnerNewProductEmail(params: { name: string; productTitle: string; productUrl: string; commissionRate: number }): string {
  return partnerEmailWrap(`
    <tr><td style="background:#fff;border-radius:16px;padding:40px 32px">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px">
        <tr><td style="width:48px;height:48px;background:#dbeafe;border-radius:50%;text-align:center;vertical-align:middle;line-height:48px;font-size:24px">&#128722;</td></tr>
      </table>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#1a1a1a;text-align:center">New Product Available</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;text-align:center">
        Hi ${escapeHtml(params.name)}, a new product is now available for you to promote!
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f5;border-radius:10px;margin-bottom:20px">
        <tr><td style="padding:20px 24px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:4px 0;font-size:13px;color:#999">Product</td>
              <td style="padding:4px 0;font-size:13px;color:#1a1a1a;text-align:right;font-weight:600">${escapeHtml(params.productTitle)}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:13px;color:#999">Commission Rate</td>
              <td style="padding:4px 0;font-size:13px;color:#7c3aed;text-align:right;font-weight:700">${params.commissionRate}%</td>
            </tr>
          </table>
        </td></tr>
      </table>

      ${ctaButton(params.productUrl, 'View Product')}
    </td></tr>
  `)
}

export function partnerMonthlySummaryEmail(params: {
  name: string
  month: string
  clicks: number
  conversions: number
  revenue: number
  commission: number
  topProduct: string
}): string {
  return partnerEmailWrap(`
    <tr><td style="background:#fff;border-radius:16px;padding:40px 32px">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px">
        <tr><td style="width:48px;height:48px;background:#f5f3ff;border-radius:50%;text-align:center;vertical-align:middle;line-height:48px;font-size:24px">&#128200;</td></tr>
      </table>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#1a1a1a;text-align:center">${escapeHtml(params.month)} Summary</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;text-align:center">
        Hi ${escapeHtml(params.name)}, here's your monthly performance report.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border-radius:12px;margin-bottom:20px">
        <tr><td style="padding:24px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="50%" style="padding:8px;text-align:center">
                <p style="margin:0 0 2px;font-size:11px;color:#7c3aed;text-transform:uppercase;letter-spacing:0.5px">Clicks</p>
                <p style="margin:0;font-size:22px;font-weight:700;color:#1a1a1a">${params.clicks.toLocaleString()}</p>
              </td>
              <td width="50%" style="padding:8px;text-align:center">
                <p style="margin:0 0 2px;font-size:11px;color:#7c3aed;text-transform:uppercase;letter-spacing:0.5px">Conversions</p>
                <p style="margin:0;font-size:22px;font-weight:700;color:#1a1a1a">${params.conversions.toLocaleString()}</p>
              </td>
            </tr>
            <tr>
              <td width="50%" style="padding:8px;text-align:center">
                <p style="margin:0 0 2px;font-size:11px;color:#7c3aed;text-transform:uppercase;letter-spacing:0.5px">Revenue</p>
                <p style="margin:0;font-size:22px;font-weight:700;color:#1a1a1a">&#8358;${params.revenue.toLocaleString()}</p>
              </td>
              <td width="50%" style="padding:8px;text-align:center">
                <p style="margin:0 0 2px;font-size:11px;color:#7c3aed;text-transform:uppercase;letter-spacing:0.5px">Commission</p>
                <p style="margin:0;font-size:22px;font-weight:700;color:#5b21b6">&#8358;${params.commission.toLocaleString()}</p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f5;border-radius:10px;margin-bottom:20px">
        <tr><td style="padding:16px 20px">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.5px">Top Product</p>
          <p style="margin:0;font-size:14px;color:#1a1a1a;font-weight:600">${escapeHtml(params.topProduct)}</p>
        </td></tr>
      </table>

      ${ctaButton(`${SITE_URL}/partner/dashboard`, 'View Full Dashboard')}
    </td></tr>
  `)
}

export function partnerAccountUpdateEmail(params: { name: string; changes: string }): string {
  return partnerEmailWrap(`
    <tr><td style="background:#fff;border-radius:16px;padding:40px 32px">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px">
        <tr><td style="width:48px;height:48px;background:#f5f3ff;border-radius:50%;text-align:center;vertical-align:middle;line-height:48px;font-size:24px">&#9881;&#65039;</td></tr>
      </table>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#1a1a1a;text-align:center">Account Updated</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;text-align:center">
        Hi ${escapeHtml(params.name)}, your partner account has been updated.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border-radius:12px;margin-bottom:24px">
        <tr><td style="padding:20px 24px">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#7c3aed;text-transform:uppercase;letter-spacing:0.5px">Changes Made</p>
          <p style="margin:0;font-size:14px;color:#1a1a1a;line-height:1.7">${escapeHtml(params.changes)}</p>
        </td></tr>
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border-radius:10px">
        <tr><td style="padding:16px 20px">
          <p style="margin:0;font-size:13px;color:#999;line-height:1.6">
            If you didn't make this change, please contact our support team immediately.
          </p>
        </td></tr>
      </table>
    </td></tr>
  `)
}

// ---- ADMIN NOTIFICATION TEMPLATES ----

export function adminNewApplicationEmail(params: { partnerName: string; partnerEmail: string; applicationUrl: string }): string {
  return partnerEmailWrap(`
    <tr><td style="background:#fff;border-radius:16px;padding:40px 32px">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px">
        <tr><td style="width:48px;height:48px;background:#fef3c7;border-radius:50%;text-align:center;vertical-align:middle;line-height:48px;font-size:24px">&#128233;</td></tr>
      </table>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1a1a1a;text-align:center">New Partner Application</h1>
      <p style="margin:0 0 24px;font-size:14px;color:#666;text-align:center">
        A new application has been submitted to join Gifted Partners.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f5;border-radius:10px;margin-bottom:20px">
        <tr><td style="padding:16px 20px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:4px 0;font-size:13px;color:#999">Name</td>
              <td style="padding:4px 0;font-size:13px;color:#1a1a1a;text-align:right;font-weight:600">${escapeHtml(params.partnerName)}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:13px;color:#999">Email</td>
              <td style="padding:4px 0;font-size:13px;color:#1a1a1a;text-align:right;font-weight:600">${escapeHtml(params.partnerEmail)}</td>
            </tr>
          </table>
        </td></tr>
      </table>

      ${ctaButton(params.applicationUrl, 'Review Application')}
    </td></tr>
  `)
}

export function adminPayoutRequestEmail(params: { partnerName: string; amount: number; bankDetails: string; approveUrl: string }): string {
  return partnerEmailWrap(`
    <tr><td style="background:#fff;border-radius:16px;padding:40px 32px">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px">
        <tr><td style="width:48px;height:48px;background:#fef3c7;border-radius:50%;text-align:center;vertical-align:middle;line-height:48px;font-size:24px">&#128179;</td></tr>
      </table>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1a1a1a;text-align:center">Payout Request</h1>
      <p style="margin:0 0 24px;font-size:14px;color:#666;text-align:center">
        A partner has requested a payout.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border-radius:12px;margin-bottom:20px">
        <tr><td style="padding:24px;text-align:center">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#7c3aed;text-transform:uppercase;letter-spacing:0.5px">Payout Amount</p>
          <p style="margin:0;font-size:32px;font-weight:700;color:#5b21b6">&#8358;${params.amount.toLocaleString()}</p>
        </td></tr>
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f5;border-radius:10px;margin-bottom:20px">
        <tr><td style="padding:16px 20px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:4px 0;font-size:13px;color:#999">Partner</td>
              <td style="padding:4px 0;font-size:13px;color:#1a1a1a;text-align:right;font-weight:600">${escapeHtml(params.partnerName)}</td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 20px 16px;border-top:1px solid #eee">
          <p style="margin:12px 0 4px;font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.5px">Bank Details</p>
          <p style="margin:0;font-size:13px;color:#1a1a1a;line-height:1.6;white-space:pre-wrap">${escapeHtml(params.bankDetails)}</p>
        </td></tr>
      </table>

      ${ctaButton(params.approveUrl, 'Review & Approve')}
    </td></tr>
  `)
}

export function adminPartnerApprovedEmail(params: { partnerName: string; partnerEmail: string }): string {
  return partnerEmailWrap(`
    <tr><td style="background:#fff;border-radius:16px;padding:40px 32px">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px">
        <tr><td style="width:48px;height:48px;background:#dcfce7;border-radius:50%;text-align:center;vertical-align:middle;line-height:48px;font-size:24px">&#10004;&#65039;</td></tr>
      </table>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1a1a1a;text-align:center">Partner Approved</h1>
      <p style="margin:0 0 24px;font-size:14px;color:#666;text-align:center">
        You've approved a new partner application. They've been notified and can now access their dashboard.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f5;border-radius:10px;margin-bottom:20px">
        <tr><td style="padding:16px 20px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:4px 0;font-size:13px;color:#999">Partner</td>
              <td style="padding:4px 0;font-size:13px;color:#1a1a1a;text-align:right;font-weight:600">${escapeHtml(params.partnerName)}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:13px;color:#999">Email</td>
              <td style="padding:4px 0;font-size:13px;color:#1a1a1a;text-align:right;font-weight:600">${escapeHtml(params.partnerEmail)}</td>
            </tr>
          </table>
        </td></tr>
      </table>

      ${ctaButton(`${SITE_URL}/admin/partners`, 'View Partners')}
    </td></tr>
  `)
}
