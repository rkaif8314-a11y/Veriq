# Veriq

Before you trust it, check it.

Veriq is a digital trust MVP for websites, messages and claims. It is intentionally uncertainty-aware: results expose signals, confidence, limitations and recommended next actions.

## Current MVP
- URL screening with transparent local signals
- Message/scam heuristic screening
- Claim evidence framing
- Explainable result cards
- Responsive, accessibility-minded product UI
- Server-side analysis API contract

## Architecture
Next.js + React + TypeScript. Analysis logic lives in `lib/analyzer.ts` and is exposed through `app/api/analyze/route.ts`, keeping the analysis contract reusable for future threat intelligence, provenance, media forensics and source intelligence engines.

## Run locally
1. Install dependencies with `npm install`.
2. Start with `npm run dev`.
3. Open `http://localhost:3000`.

## Important
This repository does not pretend to provide live web-scale fact checking, forensic media detection, domain reputation intelligence, or provenance verification yet. Those capabilities should be connected to real providers before production claims are made.
