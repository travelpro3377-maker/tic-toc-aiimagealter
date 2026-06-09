# AlterMeHQ - Tic-Tok AI Image Alter

This repository contains the scaffold for AlterMeHQ (tic-toc-aiimagealter) — a Next.js app that lets users upload images, apply AI edits (OpenAI Images edits), optionally purchase credits with Stripe or PayPal, and connect to TikTok (OAuth stubs included) to post edited media.

Important: This repo includes example code and stubs. You must provide API keys and add them to your deployment environment (Vercel, etc.) before production use.

Quick start (local):
1) git clone https://github.com/travelpro3377-maker/tic-toc-aiimagealter
2) cd tic-toc-aiimagealter
3) cp .env.example .env.local and fill in your keys
4) npm ci
5) npm run dev

Open http://localhost:3000 and test upload/edit flows. Complete TikTok OAuth and test posting once you have a TikTok Developer app and credentials.

PayPal
- This scaffold includes basic PayPal server endpoints to create and capture orders. See pages/api/paypal/create-order.js and pages/api/paypal/capture-order.js

NOTE: Replace file-based token store (data/tokens.json) with a database for production, and add durable storage for user uploads (S3).
