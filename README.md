# Gifted — Creative Technologist Portfolio & Commerce Platform

Full-stack portfolio, e-commerce, and affiliate partner system built with React, Supabase, and Vercel.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS v4 |
| State | Zustand |
| Routing | React Router v7 |
| Animation | Framer Motion v12 |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth |
| Storage | Supabase Storage + Cloudinary |
| Payments | Paystack |
| Email | Nodemailer (via SMTP) |
| Hosting | Vercel |

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your Supabase + Paystack keys

# Start dev server
npm run dev

# Start API dev server (for partner-auth, process-payout)
npm run dev:api
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server (port 5173) |
| `npm run dev:api` | Custom Node.js server with API handlers |
| `npm run build` | TypeScript check + Vite production build |
| `npm run preview` | Preview production build |
| `npm run test` | Run all tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | ESLint |

## Environment Variables

### Client-side (VITE_ prefix — bundled in browser)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `VITE_SITE_URL` | No | Production URL (defaults to `gifted-beige.vercel.app`) |
| `VITE_ADMIN_EMAIL` | No | Admin email for role checks |
| `VITE_CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name |

### Server-side (API handlers — never exposed to browser)

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (bypasses RLS) |
| `SMTP_HOST` | Yes | SMTP server hostname (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | No | SMTP port (default `587`) |
| `SMTP_USER` | Yes | SMTP username / email |
| `SMTP_PASS` | Yes | SMTP password or app password |
| `SMTP_FROM` | No | Sender email address (defaults to `SMTP_USER`) |
| `ALLOWED_ORIGINS` | No | Comma-separated allowed CORS origins |
| `PAYSTACK_SECRET_KEY` | No | Paystack secret key (for edge functions) |

## Project Structure

```
├── api/                          # Vercel serverless functions
│   ├── _security.js              # CORS, rate limiting, validation helpers
│   ├── send-email.js             # Server-side email relay (Nodemailer/SMTP)
│   ├── partner-auth.js           # Admin approve/reject partners
│   └── process-payout.js         # Paystack transfer processing
├── supabase/functions/           # Supabase Edge Functions (Deno)
│   ├── paystack-verify/          # Payment verification + order creation
│   └── paystack-webhook/         # Paystack webhook handler
├── src/
│   ├── components/
│   │   ├── admin/                # Admin-specific components
│   │   ├── category/             # Portfolio category pages
│   │   ├── layout/               # Nav, Footer, AnimatedLayout
│   │   ├── sections/             # Home page sections
│   │   ├── shop/                 # Shop components (ProductCard, etc.)
│   │   └── ui/                   # Shared UI (LiquidGlass, etc.)
│   ├── lib/
│   │   ├── meta.tsx              # SEO <Meta> component with JSON-LD
│   │   ├── email.ts              # Client email (calls /api/send-email)
│   │   ├── supabase.ts           # Supabase client
│   │   ├── commerce-queries.ts   # Shop/product/order queries
│   │   └── commerce-types.ts     # Commerce TypeScript types
│   ├── modules/affiliate/        # Partner/affiliate module
│   │   ├── types.ts              # All affiliate TypeScript types
│   │   ├── queries.ts            # 25+ affiliate query functions
│   │   ├── constants.tsx         # Dashboard tabs, achievement defs
│   │   └── components/           # AccountTab, StatusBadge, etc.
│   ├── pages/
│   │   ├── shop/                 # Shop, ProductDetail, PartnerDashboard, etc.
│   │   └── admin/                # Admin dashboard pages
│   ├── store/                    # Zustand stores (admin, partner)
│   └── test/                     # Test setup
├── public/
│   ├── sitemap.xml               # SEO sitemap
│   └── robots.txt                # Crawl rules
├── vitest.config.ts              # Test configuration
└── vercel.json                   # Vercel deployment config
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Test files
api/_security.test.js              # Security helpers (20 tests)
src/modules/affiliate/components/StatusBadge.test.tsx  # Status badge (4 tests)
src/lib/meta.test.tsx              # SEO Meta component (12 tests)
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Push to `main` — auto-deploys via GitHub Actions

### Required GitHub Secrets for CI/CD

| Secret | Purpose |
|--------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `VITE_SITE_URL` | Production URL |
| `VITE_ADMIN_EMAIL` | Admin email |
| `VERCEL_TOKEN` | Vercel deployment token |
| `VERCEL_ORG_ID` | Vercel org ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |

### Database Setup

Run the SQL schemas in your Supabase SQL Editor:

1. `src/lib/supabase-schema.sql` — Core tables (profiles, storage, etc.)
2. `src/lib/commerce-schema.sql` — Commerce + affiliate tables (products, orders, affiliates, commissions, payouts, audit_logs, etc.)

## License

Private — All rights reserved.
