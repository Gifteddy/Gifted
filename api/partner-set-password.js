const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

function json(res, status, body) {
  if (res.headersSent) return res
  return res.status(status).json(body)
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return json(res, 200, { ok: true })
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !SUPABASE_ANON_KEY) {
    console.error('[Partner Set Password] Missing Supabase environment variables')
    return json(res, 500, { error: 'Server configuration error' })
  }

  try {
    const { token, email, password } = req.body || {}

    if (!token || typeof token !== 'string') {
      return json(res, 400, { error: 'Missing token' })
    }
    if (!email || typeof email !== 'string') {
      return json(res, 400, { error: 'Missing email' })
    }
    if (!password || typeof password !== 'string') {
      return json(res, 400, { error: 'Missing password' })
    }
    if (password.length < 6) {
      return json(res, 400, { error: 'Password must be at least 6 characters' })
    }

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Find partner by email and token
    const { data: partner, error: fetchErr } = await adminClient
      .from('partners')
      .select('id, auth_user_id, password_setup_token, password_setup_expires, status')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (fetchErr || !partner) {
      return json(res, 404, { error: 'Partner not found' })
    }

    if (partner.status !== 'approved') {
      return json(res, 400, { error: 'Partner account is not approved' })
    }

    if (!partner.auth_user_id) {
      return json(res, 400, { error: 'Partner account has no linked user. Please contact support.' })
    }

    if (!partner.password_setup_token || partner.password_setup_token !== token) {
      return json(res, 400, { error: 'Invalid or expired setup link' })
    }

    if (partner.password_setup_expires && new Date(partner.password_setup_expires) < new Date()) {
      return json(res, 400, { error: 'This setup link has expired. Please contact support for a new one.' })
    }

    // Update the auth user's password using admin API
    const { error: pwErr } = await adminClient.auth.admin.updateUserById(
      partner.auth_user_id,
      { password }
    )

    if (pwErr) {
      console.error('[Partner Set Password] Failed to update password:', pwErr)
      return json(res, 500, { error: 'Failed to set password' })
    }

    // Clear the setup token
    await adminClient
      .from('partners')
      .update({
        password_setup_token: null,
        password_setup_expires: null,
      })
      .eq('id', partner.id)
      .catch(() => {})

    console.log(`[Partner Set Password] Password set for partner ${partner.id}`)
    return json(res, 200, { success: true, message: 'Password set successfully' })
  } catch (err) {
    console.error('[Partner Set Password] Unexpected error:', err)
    return json(res, 500, { error: 'Internal server error' })
  }
}
