# Deployment & DNS

1) Add repository to your GitHub account (done).
2) On Vercel, import the project and set environment variables (see .env.example). Required for basic functionality:
   - OPENAI_API_KEY
   - TIKTOK_CLIENT_ID, TIKTOK_CLIENT_SECRET, TIKTOK_REDIRECT_URI (set to https://altermehq.online/api/tiktok/callback for production)

3) Payments (choose one or both):
   - Stripe: STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY
   - PayPal: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_MODE (sandbox or live)

4) Set the production branch to `main` in Vercel import and deploy.
5) Add domain altermehq.online to Vercel and follow DNS instructions. Add an A record or CNAME as Vercel instructs.

TikTok & OAuth notes
- You MUST register a TikTok Developer app and set the Redirect URI exactly to: https://altermehq.online/api/tiktok/callback (for local dev use http://localhost:3000/api/tiktok/callback).
- Request required scopes: user.info.basic and video.create (and any additional upload scopes TikTok requires). TikTok often requires app review for posting permissions.
- After OAuth, tokens are stored in data/tokens.json for MVP. Replace with a secure DB for production.

PayPal notes
- For PayPal integration use sandbox credentials for testing. Set PAYPAL_MODE=sandbox.
- The app includes simple server-side endpoints to create an order and capture it. For production use, implement webhooks and robust order management.

Monetization & going viral
- Use Stripe or PayPal for pay-per-edit or subscriptions. Offer a free trial to encourage sharing.
- Add social sharing hooks and pre-filled captions linking back to altermehq.online.

Security & legal
- Do not commit API keys. Add them in Vercel dashboard or GitHub Secrets.
- Implement content moderation and abuse reporting to avoid policy violations on TikTok.

Next steps we recommend you complete:
- Add persistent storage (S3) and a small DB (Postgres) to track users, credits, and history.
- Implement robust TikTok upload flow per their docs and request required scopes.
- Build analytics and virality features: share links, vanity captions, and easy-to-use templates.
