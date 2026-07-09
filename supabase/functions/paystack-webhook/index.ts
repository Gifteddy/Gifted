// Paystack webhook handler — receives payment event from Paystack
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY') || ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

serve(async (req) => {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-paystack-signature') || ''

    // Verify webhook signature
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(PAYSTACK_SECRET_KEY),
      { name: 'HMAC', hash: 'SHA-512' },
      false, ['verify']
    )
    const expectedSig = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
    const expectedHex = Array.from(new Uint8Array(expectedSig)).map(b => b.toString(16).padStart(2, '0')).join('')

    if (signature !== expectedHex) {
      return new Response('Invalid signature', { status: 401 })
    }

    const event = JSON.parse(body)

    if (event.event === 'charge.success') {
      const data = event.data
      const reference = data.reference

      // Verify with Paystack API
      const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      })
      const verifyData = await verifyRes.json()

      if (verifyData.status && verifyData.data.status === 'success') {
        const metadata = data.metadata || {}
        const headers = { 'Content-Type': 'application/json', 'apikey': SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }

        // Update order payment status
        await fetch(`${SUPABASE_URL}/rest/v1/orders?payment_reference=eq.${reference}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ payment_status: 'paid', status: 'processing' }),
        })
      }
    }

    return new Response('OK')
  } catch (err) {
    console.error('Webhook error:', err)
    return new Response('OK') // Always return 200 to acknowledge receipt
  }
})
