import fetch from 'node-fetch'

// Create a PayPal order (server-side). Returns approval URL for client to redirect.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { amount = '5.00', currency = 'USD' } = req.body || {}
  const clientId = process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_CLIENT_SECRET
  const mode = process.env.PAYPAL_MODE || 'sandbox'
  if (!clientId || !secret) return res.status(500).json({ error: 'PayPal credentials not configured' })

  try {
    // Get access token
    const auth = Buffer.from(`${clientId}:${secret}`).toString('base64')
    const tokenResp = await fetch(`https://api.${mode === 'live' ? '' : 'sandbox.'}paypal.com/v1/oauth2/token`, {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials'
    })
    const tokenData = await tokenResp.json()
    if (!tokenResp.ok) return res.status(500).json({ error: 'PayPal token error', detail: tokenData })

    const accessToken = tokenData.access_token
    // Create order
    const orderResp = await fetch(`https://api.${mode === 'live' ? '' : 'sandbox.'}paypal.com/v2/checkout/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{ amount: { currency_code: currency, value: amount } }],
        application_context: { return_url: `${process.env.TIKTOK_REDIRECT_URI || 'https://altermehq.online'}`, cancel_url: `${process.env.TIKTOK_REDIRECT_URI || 'https://altermehq.online'}` }
      })
    })

    const orderData = await orderResp.json()
    if (!orderResp.ok) return res.status(500).json({ error: 'PayPal create order failed', detail: orderData })

    // Find approval link
    const approve = orderData.links?.find((l) => l.rel === 'approve')
    return res.status(200).json({ order: orderData, approveUrl: approve?.href })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: e.message })
  }
}
