# Veriq Architecture

## Overview

Veriq is a digital trust platform designed to help users determine whether digital content, websites, messages, documents, offers, identities, and claims can be trusted.

**Core Vision**: A trust layer for the AI internet.

**Long-term**: API-first platform with B2B enterprise features, browser extension, and industry integrations.

## Stack

```
Frontend
  └─ Next.js 15 (React 19)
  └─ TypeScript
  └─ Tailwind CSS + Headless UI
  └─ Zustand (state management)
  └─ React Query (async state)

Backend
  └─ Next.js API Routes
  └─ Supabase (PostgreSQL + Auth + Storage)
  └─ Row Level Security

Deployment
  └─ Vercel (frontend + API)
  └─ Supabase Cloud (database + auth + storage)

Analysis Engines
  └─ Modular signal collection
  └─ Confidence scoring (v1.0)
  └─ AI provider abstraction (Claude/GPT)
  └─ Extensible plugin architecture
```

## Directory Structure

```
veriq/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── dashboard/               # Authenticated routes
│   │   ├── page.tsx            # Dashboard
│   │   ├── history/            # Analysis history
│   │   └── settings/           # User settings
│   ├── analyze/                # Analysis flows
│   │   ├── url/                # URL checker
│   │   ├── message/            # Message checker
│   │   ├── claim/              # Claim checker
│   │   └── [analysisId]/       # Report detail
│   ├── auth/                   # Auth pages
│   │   ├── login/
│   │   └── signup/
│   ├── api/                    # Server API
│   │   ├── auth/
│   │   ├── analyze/
│   │   ├── reports/
│   │   └── user/
│   ├── (static)/               # Static pages
│   │   ├── privacy/
│   │   ├── security/
│   │   └── how-it-works/
│
├── lib/                         # Shared utilities
│   ├── analyzer/               # Core analysis engine
│   │   ├── index.ts            # Main analyzer
│   │   ├── signals/            # Signal modules
│   │   ├── scoring.ts          # Trust score calculation
│   │   └── confidence.ts       # Confidence estimation
│   ├── types.ts                # Shared types
│   ├── supabase.ts             # DB client
│   ├── ai-provider.ts          # AI abstraction
│   └── validation.ts           # Input validation
│
├── components/                  # React components
│   ├── ui/                     # Base components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   ├── TrustScore.tsx          # Trust score display
│   ├── EvidencePanel.tsx       # Evidence details
│   ├── RecommendationBox.tsx   # Action recommendations
│   └── ...
│
├── styles/                      # Global styles
│   └── globals.css
│
├── hooks/                       # Custom React hooks
│   ├── useAnalysis.ts
│   ├── useAuth.ts
│   └── ...
│
├── public/                      # Static assets
│   ├── icons/
│   └── fonts/
│
├── .env.local                   # Local secrets
├── .env.example                 # Secret template
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── README.md
```

## Analysis Pipeline

```
INPUT (URL, Message, Claim, Image, etc.)
  ↓
CLASSIFICATION
  └─ Identify input type
  └─ Route to appropriate analyzer
  ↓
EXTRACTION
  └─ Parse structured information
  └─ Clean and normalize
  ↓
SIGNAL COLLECTION
  └─ URL signals (domain, HTTPS, age, reputation)
  └─ Message signals (urgency, payment, links, patterns)
  └─ Claim signals (evidence, sources, contradictions)
  └─ Image signals (metadata, manipulation, provenance)
  ↓
CONFIDENCE ESTIMATION
  └─ Calculate per-signal confidence
  └─ Aggregate across dimensions
  ↓
RISK ASSESSMENT
  └─ Security risk
  └─ Trust risk
  └─ Credibility risk
  ↓
SCORING
  └─ Authenticity score
  └─ Source credibility score
  └─ Evidence quality score
  └─ Overall trust score
  ↓
EXPLANATION GENERATION
  └─ Why this score
  └─ Key evidence
  └─ Limitations
  └─ Recommended actions
  ↓
OUTPUT (Trust Report)
```

## Trust Score Dimensions

```
TRUST REPORT

Overall Trust: 0-100
├─ Authenticity: 0-100
│   └─ Measures whether content is unaltered/original
├─ Source Credibility: 0-100
│   └─ Measures reliability of source
├─ Evidence Quality: 0-100
│   └─ Measures strength of supporting evidence
├─ Identity Confidence: 0-100
│   └─ Measures confidence in claimed identity
├─ Claim Support: 0-100
│   └─ Measures claim evidence support
└─ Security Risk: Low/Medium/High
    └─ Measures potential for harm to user
```

## Signal System

Each signal contains:

```typescript
interface Signal {
  id: string;
  name: string;
  value: string | number | boolean;
  source: string;              // 'domain', 'content', 'ai', 'external'
  confidence: 0-100;           // How confident in this signal
  category: 'positive' | 'negative' | 'neutral';
  weight: 0-1;                 // How much this signal influences score
  explanation: string;
  timestamp: ISO8601;
}
```

## Confidence Levels

- **High** (80-100): Multiple independent signals confirm conclusion
- **Moderate** (50-79): Some evidence but uncertainty remains
- **Low** (20-49): Limited or conflicting signals
- **Unable** (0-19): Insufficient evidence to reach conclusion

## Database Schema

See `docs/DATABASE.md` for complete schema.

Key tables:
- `users` - User accounts
- `analyses` - Analysis records
- `signals` - Individual trust signals
- `reports` - Generated trust reports
- `feedback` - User feedback on analyses
- `audit_logs` - Security and compliance logs

## API Contract

### POST /api/analyze/url

```json
{
  "url": "https://example.com",
  "depth": "quick" | "deep"
}
```

Response:

```json
{
  "id": "uuid",
  "status": "completed",
  "result": {
    "overallTrust": 72,
    "confidence": 0.81,
    "risk": "medium",
    "dimensions": {
      "authenticity": 84,
      "source": 91,
      "evidence": 63,
      "identity": 78,
      "security": "low"
    },
    "signals": [...],
    "explanation": "...",
    "recommendations": [...],
    "limitations": [...]
  }
}
```

Similar endpoints for message, claim, image, document analysis.

## Feature Phases

### Phase 1 (MVP)
- [ ] Landing page
- [ ] Authentication (email)
- [ ] URL analyzer
- [ ] Message/scam analyzer
- [ ] Claim analyzer (basic)
- [ ] Trust report display
- [ ] Dashboard + history
- [ ] Privacy controls
- [ ] Responsive design
- [ ] Basic accessibility

### Phase 2
- [ ] Image analyzer (visual + metadata)
- [ ] Document analyzer
- [ ] Provenance support (C2PA)
- [ ] Public report sharing
- [ ] Source profiles
- [ ] Advanced claim verification
- [ ] Internationalization
- [ ] Browser extension

### Phase 3
- [ ] Video analyzer
- [ ] Audio analyzer
- [ ] Evidence graph
- [ ] Advanced threat intelligence
- [ ] API documentation
- [ ] Developer portal

### Phase 4
- [ ] B2B product
- [ ] Organization accounts
- [ ] Enterprise security
- [ ] Custom models
- [ ] Audit controls

### Phase 5
- [ ] AI agent trust
- [ ] Verified publishers
- [ ] Real-time trust infrastructure
- [ ] Industry integrations

## Security Principles

1. **Never expose secrets** in frontend code
2. **Server-side validation** always
3. **SSRF protection** for URL fetching
4. **Malware isolation** for file processing
5. **Rate limiting** on all endpoints
6. **HTTPS only** in production
7. **Database encryption** for sensitive data
8. **Row-level security** in Supabase
9. **Audit logging** for all actions
10. **Regular security reviews**

## Privacy Principles

1. **Minimize data retention** - delete uploads after analysis
2. **User control** - users can delete all their data
3. **Sensitive handling** - PII and private docs get special protection
4. **No training** - never use private uploads to train models without consent
5. **Transparency** - privacy policy is clear and detailed
6. **Compliance** - prepare for GDPR, privacy laws

## Performance Targets

- **Initial load**: < 2s
- **URL analysis**: < 5s
- **Message analysis**: < 2s
- **Claim analysis**: < 10s
- **Report render**: < 1s
- **Mobile (3G)**: < 8s

## Monitoring

- Application metrics (errors, latency, throughput)
- User metrics (checks, completions, reports)
- Analysis metrics (model performance, accuracy)
- System metrics (uptime, resource utilization)

## Future: Trust Infrastructure

Vision for eventual evolution:

```
DIGITAL TRUST LAYER
├─ Content Trust (images, video, audio)
├─ Identity Trust (people, organizations)
├─ Website Trust (domains, services)
├─ Message Trust (emails, SMS, chat)
├─ Claim Trust (statements, facts)
├─ Source Trust (publishers, experts)
└─ Agent Trust (AI systems, automation)
```

Accessible via:
- Web interface (Veriq)
- Browser extension
- REST API
- Webhook integration
- Embedded widgets
