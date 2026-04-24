---

# SHIELD — Anonymous Cybersecurity Services Marketplace

A production-ready, two-sided anonymous marketplace connecting
organizations needing cybersecurity services with verified
security professionals — all under anonymous aliases until
both parties consent to reveal identities after deal closure.

## The Problem

Organizations face growing cybersecurity threats but struggle
to find trustworthy service providers due to:
- Bias and conflicts of interest in vendor selection
- Risk of exposing security vulnerabilities to unknown vendors
- Lack of verifiable trust signals for cybersecurity professionals

## The Solution

SHIELD provides a neutral, anonymous platform where:
- **Buyers** post security requirements without revealing their organization
- **Vendors** offer services and build reputation through verified work
- **Identity** is only revealed after deal closure with mutual consent
- **Trust scores** are computed from behavioral data, not identity

## Core Features

### Anonymous Operations
- Every user gets a chosen codename (e.g. Vendor-Shadow, Buyer-Phantom)
- Real identity stored only in encrypted auth layer
- All marketplace interactions happen under aliases

### Marketplace
- Buyers post cybersecurity requirements (pentest, audit, compliance etc.)
- AI-powered matching engine connects requirements to relevant vendors
- Vendors browse and submit proposals anonymously

### Deal Lifecycle
POSTED → MATCHED → NEGOTIATING → CONTRACTED → IN_PROGRESS → REVIEW → CLOSED
- Price negotiation with edit history
- Milestone-based workflow
- Secure file delivery for work submissions

### Trust & Reputation
- Trust scores computed from: deal history, certifications,
  response rate, peer reviews
- Verified certifications (OSCP, CISSP, CEH, ISO27001 etc.)
- 5-star rating system after each completed deal
- Ratings visible to buyers when selecting vendors

### End-to-End Encrypted Chat
- Messages encrypted client-side using TweetNaCl (XSalsa20-Poly1305)
- Secret keys never leave the browser (stored in localStorage only)
- Server stores only ciphertext — unreadable even if DB is compromised

### Identity Reveal (Optional)
- After deal closes, both parties can consent to reveal real identity
- One-time email sent with contact details
- Full audit trail of all sensitive actions

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Primary Database | Supabase (PostgreSQL + Auth + Realtime + Storage) |
| Document Database | MongoDB Atlas |
| Authentication | Supabase Auth (email/password) |
| Encryption | TweetNaCl.js (XSalsa20-Poly1305) |
| Real-time | Supabase Realtime (WebSockets) |
| Email | Resend |
| Matching Engine | Jaccard Similarity + HuggingFace Sentence Transformers |
| Package Manager | pnpm (monorepo) |
| Deployment | Vercel |

## Project Structure
shield-cybersecurity-marketplace/
├── apps/
│   └── web/                          # Next.js 14 application
│       ├── app/
│       │   ├── (auth)/               # Login, Signup pages
│       │   ├── (dashboard)/          # Shared dashboard layout
│       │   ├── api/                  # 22 API routes
│       │   │   ├── buyer/            # Buyer-specific endpoints
│       │   │   ├── vendor/           # Vendor-specific endpoints
│       │   │   ├── deals/            # Deal lifecycle endpoints
│       │   │   ├── matching/         # AI matching engine
│       │   │   └── email/            # Email notification endpoints
│       │   ├── dashboard/
│       │   │   ├── buyer/            # Buyer dashboard (5 pages)
│       │   │   └── vendor/           # Vendor dashboard (5 pages)
│       │   ├── deal/[id]/chat/       # E2E encrypted chat
│       │   ├── marketplace/          # Public marketplace
│       │   └── vendor/[alias]/       # Public vendor profiles
│       ├── components/
│       │   ├── auth/                 # Login & Signup forms
│       │   ├── certifications/       # Cert upload component
│       │   ├── requirements/         # Requirement forms
│       │   └── shared/               # StarRating, AliasBadge, etc.
│       ├── hooks/                    # useAuth, useProfile hooks
│       ├── lib/
│       │   ├── supabase/             # Supabase client (browser + server)
│       │   ├── mongodb/              # MongoDB connection singleton
│       │   ├── crypto/               # TweetNaCl encryption wrapper
│       │   └── alias/                # Alias generation & validation
│       └── types/                    # Shared TypeScript interfaces
├── supabase/
│   ├── migrations/                   # Database schema (SQL)
│   └── functions/                    # Edge Functions (Deno)
│       ├── generate-alias/           # Auto-runs on user signup
│       ├── compute-trust/            # Trust score computation
│       └── auto-verify-certs/        # Certification verification
└── pnpm-workspace.yaml               # Monorepo configuration

## Database Schema (Supabase)

| Table | Purpose |
|---|---|
| profiles | User aliases, roles, trust scores, ratings |
| alias_directory | Public anonymous profile data |
| deals | Deal records with full lifecycle state |
| deal_events | Immutable deal timeline/history |
| messages | E2E encrypted chat messages |
| chat_keys | Public keys for key exchange |
| certifications | Vendor certifications (verified/pending) |
| trust_events | Individual events contributing to trust score |
| notifications | Real-time in-app notifications |
| audit_logs | Immutable log of all sensitive actions |
| reviews | Post-deal ratings (1-5 stars) |

## MongoDB Collections

| Collection | Purpose |
|---|---|
| vendor_profiles | Vendor skills, categories, sample work |
| buyer_requirements | Posted requirements with all details |
| proposals | Vendor proposals for requirements |
| match_cache | Cached matching engine results (24h TTL) |

## Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Supabase account (free) — supabase.com
- MongoDB Atlas account (free) — mongodb.com/atlas
- Resend account (free) — resend.com
- HuggingFace account (free) — huggingface.co

### Setup

1. Clone the repository
```bash
git clone https://github.com/devang2008/CyberSecurity_Marketplace.git
cd CyberSecurity_Marketplace
```

2. Install dependencies
```bash
pnpm install
```

3. Configure environment variables
```bash
cp apps/web/.env.local.example apps/web/.env.local
```
Fill in your actual values in apps/web/.env.local

4. Set up Supabase database
   - Create a project at supabase.com
   - Run the SQL migration: supabase/migrations/001_initial_schema.sql
   - Deploy Edge Functions from supabase/functions/

5. Set up MongoDB Atlas
   - Create a free M0 cluster
   - Create database: cybersec_marketplace
   - Add your connection string to .env.local

6. Run the development server
```bash
cd apps/web
pnpm dev
```

Visit http://localhost:3000

### Environment Variables

Copy apps/web/.env.local.example to apps/web/.env.local and fill:

| Variable | Where to get it |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Supabase Dashboard → Settings → API |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase Dashboard → Settings → API |
| SUPABASE_SERVICE_ROLE_KEY | Supabase Dashboard → Settings → API |
| MONGODB_URI | MongoDB Atlas → Connect → Drivers |
| MONGODB_DB_NAME | Set to: cybersec_marketplace |
| RESEND_API_KEY | resend.com → API Keys |
| INTERNAL_SECRET | Any random 32+ character string |
| NEXT_PUBLIC_APP_URL | http://localhost:3000 (dev) |
| HUGGINGFACE_API_KEY | huggingface.co → Settings → Tokens |

## Security Design

### Anonymity Architecture
- Real identity stored ONLY in Supabase Auth (auth.users table)
- All application tables use alias only — never user ID or email
- Row Level Security (RLS) enforced on every table
- Identity reveal requires mutual consent + admin audit log

### Encryption
- Chat messages: XSalsa20-Poly1305 via TweetNaCl
- Keys generated per-deal in the browser
- Secret keys: never transmitted, never stored server-side
- Database stores only base64-encoded ciphertext

### Access Control
- JWT-based authentication via Supabase Auth
- Role enforcement at middleware level (buyer vs vendor)
- RLS policies prevent cross-role data access at database level
- Sensitive API routes protected by internal secret header

## Key User Flows

### Buyer Flow
1. Sign up → choose alias (e.g. Buyer-Phantom)
2. Complete onboarding (organization type, service needs)
3. Post a cybersecurity requirement
4. Review matched vendor proposals with ratings & trust scores
5. Accept a proposal → deal created
6. Negotiate price via chat
7. Review vendor's submitted work
8. Close deal → rate the vendor
9. Optionally reveal identity for ongoing relationship

### Vendor Flow
1. Sign up → choose alias (e.g. Vendor-Shadow)
2. Complete profile (skills, certifications, experience)
3. Upload certifications for trust score boost
4. Browse marketplace requirements
5. Submit proposals for relevant requirements
6. Chat with buyer after acceptance
7. Submit completed work
8. Deal closes → rate the buyer
9. Build reputation for future deals

## Problem Statement

This project was built as a solution to the following
industry problem statement:

> Organizations face growing cybersecurity threats, yet selecting
> trustworthy service providers is challenging due to bias, conflicts
> of interest, and confidentiality risks. This project proposes the
> design of an anonymous cybersecurity services marketplace where
> buyers and vendors interact without identity disclosure until deal
> closure. The platform emphasizes secure onboarding, fair matching,
> trust scoring, and secure transaction workflows using cloud-native
> architecture principles.

## License

MIT License — see LICENSE file for details.
