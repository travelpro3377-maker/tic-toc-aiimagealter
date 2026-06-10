import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-11-15' })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { userId } = req.body || {}

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: '10 AI edits credit pack' },
            unit_amount: 500
          },
          quantity: 1
        }
      ],
      success_url: `${req.headers.origin}/?payment=success`,
      cancel_url: `${req.headers.origin}/?payment=cancel`,
      client_reference_id: userId || undefined,
      metadata: { userId: userId || 'anonymous' }
    })

    res.status(200).json({ url: session.url })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
}
