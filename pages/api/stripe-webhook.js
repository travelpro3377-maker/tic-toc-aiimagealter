export const config = { api: { bodyParser: false } }

import Stripe from 'stripe'

// Helper to read raw body
async function getRawBody(req) {
  return await new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

import { addCreditsForUser, isEventProcessed, markEventProcessed, saveOrder } from '../../lib/creditsStore'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-11-15' })
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')
  const sig = req.headers['stripe-signature']
  if (!sig) return res.status(400).end('Missing stripe-signature header')

  let buf
  try {
    buf = await getRawBody(req)
  } catch (e) {
    console.error('Error reading raw body', e)
    return res.status(400).end('Error reading request body')
  }

  let event
  try {
    if (!webhookSecret) {
      console.warn('STRIPE_WEBHOOK_SECRET not configured; attempting to parse without verification (NOT RECOMMENDED)')
      event = JSON.parse(buf.toString('utf8'))
    } else {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret)
    }
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed.', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Idempotency: skip already-processed events
  const eventId = event.id
  if (await isEventProcessed(eventId)) {
    console.log('Event already processed:', eventId)
    return res.status(200).json({ received: true })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        // Retrieve full session to access metadata/client_reference_id
        const fullSession = await stripe.checkout.sessions.retrieve(session.id)
        const userId = fullSession.client_reference_id || fullSession.metadata?.userId || 'anonymous'
        // Grant credits (example: 10 credits per pack)
        const creditsToGrant = 10
        await addCreditsForUser(userId, creditsToGrant, { sessionId: session.id, amount: fullSession.amount_total || null })
        await saveOrder({ sessionId: session.id, userId, amount: fullSession.amount_total || null, timestamp: Date.now() })
        break
      }

      case 'payment_intent.succeeded': {
        console.log('payment_intent.succeeded event received')
        break
      }

      case 'charge.refunded': {
        console.log('charge.refunded event received')
        break
      }

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    await markEventProcessed(eventId)
    res.json({ received: true })
  } catch (err) {
    console.error('Error handling webhook event', err)
    res.status(500).end()
  }
}
