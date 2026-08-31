# Veriq

**Before you trust it, check it.**

Veriq is a digital trust MVP for websites, messages and claims. It is designed around explainability and uncertainty rather than pretending a detector can prove reality.

## What works now

- Live URL analysis from a server-side Node runtime
- HTTPS, reachability, HTTP status, redirect and hostname signals
- DNS checks that block private IPv4 destinations
- Message/scam heuristic screening
- Claim evidence framing
- Transparent confidence, evidence strength, limitations and recommendations
- Local report history and full report pages
- Responsive unified navigation
- Light/dark/system appearance controls
- Passwordless Supabase auth integration path
- Supabase migration for profiles and reports with Row Level Security
- Input-size validation and no-store analysis responses
- SEO-friendly checker pages

## What is deliberately not claimed

The MVP does **not** yet provide authoritative malware reputation, WHOIS/domain-age intelligence, C2PA verification, forensic image/video/audio detection, live fact-checking, identity verification, or a guarantee that a site is safe. Those require real providers and specialized analysis engines.

## Stack

Next.js 15 · React 19 · TypeScript · CSS · Lucide · optional Supabase

## Local development

```bash
npm install
npm run dev
```

For type checking:

```bash
npx tsc --noEmit
```

## Supabase

The SQL migration is in `supabase/migrations/001_veriq.sql`. Add these Vercel environment variables when a Supabase project is available:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

The current UI gracefully explains when cloud authentication is not connected.

## Architecture

```
UI → /api/analyze → modular analysis engine
                  ├─ URL signals
                  ├─ message signals
                  └─ claim signals

Future engines can add provenance, reputation, media forensics and source intelligence without changing the report contract.
```

## Product roadmap

**Phase 1:** authentication, cloud report persistence, real reputation/evidence providers and stronger scoring calibration.

**Phase 2:** image/document/provenance analysis, public privacy-safe reports and browser extension.

**Phase 3:** video/audio, evidence graph, source intelligence and API.

**Phase 4:** organizations, B2B controls, enterprise audit and developer platform.

Veriq intentionally prefers an honest “unverified” result over a fabricated certainty.
