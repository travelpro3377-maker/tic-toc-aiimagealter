import fetch from 'node-fetch'

// Capture a PayPal order after buyer approval. Client posts { orderID }
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { orderID } = req.body || {}
  if (!orderID) return res.status(400).json({ error: 'Missing orderID' })

  const clientId = process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_CLIENT_SECRET
  const mode = process.env.PAYPAL_MODE || 'sandbox'
  if (!clientId || !secret) return res.status(500).json({ error: 'PayPal credentials not configured' })

  try {
    const auth = Buffer.from(`${clientId}:${secret}`).toString('base64')
    const tokenResp = await fetch(`https://api.${mode === 'live' ? '' : 'sandbox.'}paypal.com/v1/oauth2/token`, {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials'
    })
    const tokenData = await tokenResp.json()
    if (!tokenResp.ok) return res.status(500).json({ error: 'PayPal token error', detail: tokenData })

    const accessToken = tokenData.access_token
    const captureResp = await fetch(`https://api.${mode === 'live' ? '' : 'sandbox.'}paypal.com/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
    })

    const captureData = await captureResp.json()
    if (!captureResp.ok) return res.status(500).json({ error: 'Capture failed', detail: captureData })

    return res.status(200).json({ success: true, capture: captureData })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: e.message })
  }
}
