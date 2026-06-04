# SHIELD — Anonymous Cybersecurity Services Marketplace

A production-ready, two-sided anonymous marketplace connecting organizations needing cybersecurity services with verified security professionals — all under anonymous aliases until both parties consent to reveal identities after deal closure.

---

## The Problem

Organizations face growing cybersecurity threats but struggle to find trustworthy service providers due to:
- Bias and conflicts of interest in vendor selection
- Risk of exposing security vulnerabilities to unknown vendors
- Lack of verifiable trust signals for cybersecurity professionals

## The Solution

SHIELD provides a neutral, anonymous platform where:
- **Buyers** post security requirements without revealing their organization
- **Vendors** offer services and build reputation through verified work
- **Identity** is only revealed after deal closure with mutual consent
- **Trust scores** are computed from behavioral data, not identity

---

## Core Features

### Anonymous Operations
- Every user gets a chosen codename (e.g., `Vendor-Shadow`, `Buyer-Phantom`)
- Real identity stored only in the encrypted auth layer
- All marketplace interactions happen under aliases

### Marketplace
- Buyers post cybersecurity requirements (pentest, audit, compliance etc.)
- AI-powered matching engine connects requirements to relevant vendors
- Vendors browse and submit proposals anonymously

### Deal Lifecycle
`POSTED → MATCHED → NEGOTIATING → CONTRACTED → IN_PROGRESS → REVIEW → CLOSED`
- Price negotiation with edit history
- Milestone-based workflow
- Secure file delivery for work submissions

### Trust & Reputation
- Trust scores computed from: deal history, certifications, response rate, peer reviews
- Verified certifications (OSCP, CISSP, CEH, ISO27001 etc.)
- 5-star rating system after each completed deal visible to buyers

### End-to-End Encrypted Chat
- Messages encrypted client-side using TweetNaCl (XSalsa20-Poly1305)
- Secret keys never leave the browser (stored in `localStorage` only)
- Server stores only ciphertext — unreadable even if the DB is compromised

### Identity Reveal (Optional)
- After deal closes, both parties can consent to reveal real identity
- One-time email sent with contact details
- Full audit trail of all sensitive actions

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Vanilla CSS + shadcn/ui |
| Primary Database | PostgreSQL (managed with Prisma ORM) |
| Document Database | MongoDB Atlas |
| Authentication | Self-Hosted JWT Session Tokens (stored in HttpOnly cookies) |
| Encryption | TweetNaCl.js (XSalsa20-Poly1305) |
| Real-time Chat | WebSockets (via integrated Socket.IO server) |
| Email Dispatch | Nodemailer (Gmail SMTP Server) |
| Matching Engine | Jaccard Similarity + HuggingFace Sentence Transformers |
| Package Manager | pnpm (monorepo) |
| Deployment | VPS / VM / Docker Container |

---

## Project Structure

```text
shield-cybersecurity-marketplace/
├── apps/
│   └── web/                          # Next.js 14 application
│       ├── app/
│       │   ├── (auth)/               # Login, Signup pages
│       │   ├── (dashboard)/          # Shared dashboard layout
│       │   ├── api/cmp/              # API routes
│       │   │   ├── auth/             # Login, signup, verify endpoints
│       │   │   ├── buyer/            # Buyer-specific stats & requirements
│       │   │   ├── vendor/           # Vendor-specific stats & profiles
│       │   │   ├── deals/            # Deal lifecycle endpoints
│       │   │   ├── matching/         # AI matching engine
│       │   │   ├── email/            # Email notification templates
│       │   │   └── files/            # File upload & download routes
│       │   ├── dashboard/
│       │   │   ├── buyer/            # Buyer dashboard pages
│       │   │   └── vendor/           # Vendor dashboard pages
│       │   ├── deal/[id]/chat/       # E2E encrypted chat
│       │   ├── marketplace/          # Public marketplace
│       │   └── vendor/[alias]/       # Public vendor profiles
│       ├── components/
│       │   ├── auth/                 # Login & Signup forms
│       │   ├── certifications/       # Cert upload component
│       │   └── shared/               # StarRating, AliasBadge, etc.
│       ├── hooks/                    # useAuth, useProfile, useSocket hooks
│       ├── lib/
│       │   ├── auth/                 # Web Crypto API JWT signer & password utils
│       │   ├── email/                # Nodemailer SMTP integrations
│       │   ├── mongodb/              # MongoDB connection singleton
│       │   ├── prisma/               # Prisma database client
│       │   └── trust/                # Behavioral trust scoring algorithms
│       ├── prisma/                   # Database migrations & schemas
│       ├── server.ts                 # Socket.IO & Next.js Custom Server
│       └── types/                    # Shared TypeScript interfaces
└── pnpm-workspace.yaml               # Monorepo configuration
```

---

## Database Schemas

### PostgreSQL (via Prisma)
- `users`: Credentials, verification tokens, roles, trust scores, ratings
- `alias_directory`: Public anonymous profile directories
- `deals`: Deal records and lifecycle states
- `deal_events`: Immutable deal action histories
- `messages`: E2E encrypted chat message payloads
- `chat_keys`: Public keys for secure exchange
- `certifications`: Vendor uploaded credentials
- `trust_events`: Score modification trackers
- `notifications`: Webhook & active dashboard notifications
- `reviews`: Peer performance evaluations
- `audit_logs`: Immutable log of all sensitive actions

### MongoDB Collections
- `vendor_profiles`: Detailed vendor bios, skills, and portfolio directories
- `buyer_requirements`: Detailed posted job listings
- `proposals`: Proposal files, bids, and attachments submitted by vendors
- `match_cache`: Matching engine results cache (24h TTL)

---

## Getting Started (Local Development)

### Prerequisites
- Node.js 20+
- pnpm (`npm install -g pnpm`)
- PostgreSQL database (Local or cloud)
- MongoDB Atlas account (free) — [mongodb.com/atlas](https://mongodb.com/atlas)
- Gmail account (for SMTP App Password)
- HuggingFace account (free) — [huggingface.co](https://huggingface.co)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/devang2008/cmp.git
   cd cmp
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   ```bash
   cp apps/web/.env.local.example apps/web/.env.local
   ```
   Fill in your actual connection URLs and API keys inside `apps/web/.env.local`.

4. **Deploy Prisma Migrations**
   ```bash
   cd apps/web
   npx prisma migrate dev --name init
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```
   Visit `http://localhost:3000`.

---

### Environment Variables Reference

Configure the following key-value pairs inside `apps/web/.env.local`:

| Variable | Description / Source |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (`postgresql://username:password@host:port/database`) |
| `JWT_SECRET` | Secret key used for signing session JWT tokens (64-byte random string) |
| `JWT_EXPIRES_IN` | Token validity duration (e.g., `7d`) |
| `MONGODB_URI` | MongoDB Atlas driver connection URI |
| `MONGODB_DB_NAME` | Set to: `cybersec_marketplace` |
| `NEXT_PUBLIC_APP_URL` | Host deployment root (e.g. `http://localhost:3000` in dev) |
| `GMAIL_USER` | Gmail account email address |
| `GMAIL_APP_PASSWORD` | App-specific password generated under Google Account Security settings |
| `HUGGINGFACE_API_KEY` | HuggingFace user settings access token |
| `INTERNAL_SECRET` | Unique token used to secure internal server transactions |

---

## Security Design

### Anonymity Architecture
- Real identity stored exclusively in the authenticated `users` table.
- All transactional tables use alias identifiers only.
- Strict Next.js Middleware route protection and role-based checks (buyer vs vendor isolation).
- Mutual reveal consent is audited via immutable logging.

### Encryption
- Chat messages are encrypted client-side using **XSalsa20-Poly1305** keys via `TweetNaCl`.
- Secret keys are kept locally in the browser (`localStorage`) and are never sent to the server.
- The server stores only ciphertext payloads.

---

## Problem Statement

This project was built as a solution to the following industry problem statement:

> Organizations face growing cybersecurity threats, yet selecting trustworthy service providers is challenging due to bias, conflicts of interest, and confidentiality risks. This project proposes the design of an anonymous cybersecurity services marketplace where buyers and vendors interact without identity disclosure until deal closure. The platform emphasizes secure onboarding, fair matching, trust scoring, and secure transaction workflows using self-hosted, cloud-native architecture principles.

---

## License

MIT License — see `LICENSE` file for details.
