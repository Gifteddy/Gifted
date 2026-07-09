// Call this from the client after Paystack popup success to verify and fulfill
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY') || ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

serve(async (req) => {
  try {
    const { reference, customer_id, items, subtotal, discount, total, currency, affiliate_id, discount_code } = await req.json()

    // Verify with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    })
    const verifyData = await verifyRes.json()

    if (!verifyData.status || verifyData.data.status !== 'success') {
      return new Response(JSON.stringify({ error: 'Payment not verified' }), { status: 400 })
    }

    // Create order via Supabase management API
    const headers = { 'Content-Type': 'application/json', 'apikey': SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }

    const orderRes = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        customer_id,
        status: 'processing',
        payment_status: 'paid',
        payment_reference: reference,
        subtotal,
        discount,
        total,
        currency: currency || 'USD',
        affiliate_id,
        discount_code,
      }),
    })
    const order = await orderRes.json()

    // Create order items with download tokens
    for (const item of items) {
      await fetch(`${SUPABASE_URL}/rest/v1/order_items`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          order_id: order.id,
          product_id: item.product_id,
          product_title: item.product_title,
          product_type: item.product_type,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          download_token: item.product_type === 'digital' ? crypto.randomUUID() : null,
          download_expires: item.product_type === 'digital'
            ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            : null,
        }),
      })
    }

    return new Response(JSON.stringify({ success: true, order }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
