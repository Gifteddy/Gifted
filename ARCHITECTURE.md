# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Client (React SPA)                     │
│  Pages → Modules → Components → Supabase Client          │
│  Zustand Stores │ React Router │ Framer Motion           │
└──────────┬──────────────────────────┬────────────────────┘
           │                          │
     ┌─────▼──────┐           ┌──────▼───────┐
     │  Vercel     │           │  Supabase     │
     │  Serverless │           │  Platform     │
     │  Functions  │           │               │
     └─────┬──────┘           └──────┬───────┘
           │                          │
     ┌─────▼──────┐           ┌──────▼───────┐
     │  External   │           │  PostgreSQL   │
     │  APIs       │           │  + RLS        │
      │  (Paystack, │           │  + Auth       │
      │   SMTP)     │           │  + Storage    │
     └────────────┘           └──────────────┘
```

## Authentication Flow

### Admin Auth
1. Admin logs in via Supabase Auth (email/password)
2. JWT stored in Supabase client session
3. API handlers verify JWT via anon client, then check `profiles.role = 'admin'` via service-role client
4. All admin operations use service-role key (bypasses RLS)

### Partner Auth
1. Partner applies via landing page form → stored in `affiliates` table (status: `pending`)
2. Admin reviews → calls `/api/partner-auth` with `approve`/`reject` action
3. On approve: creates Supabase Auth user, generates password, sends email
4. Partner logs in via `/shop/partners` → JWT stored in partner store
5. Partner dashboard queries use RLS (partners can only read own data)

### RLS Strategy
- All tables have RLS enabled
- Partners read own data via `auth.uid()` → `affiliates.auth_user_id`
- Admin access via `is_admin()` SECURITY DEFINER function (checks `profiles.role`)
- Service-role key used only in serverless functions (bypasses RLS for admin operations)

## Data Model

### Core Tables
```
profiles ──────────┐
                    │
products ──────────┤
  product_categories│
                    │
orders ────────────┤
  order_items ─────┤
  customers ───────┘
```

### Affiliate System
```
affiliates ────────┐
  affiliate_commissions ──┐
  affiliate_clicks ───────┤
  affiliate_payouts ──────┤
  partner_notifications ──┤
  partner_achievements ───┘
```

### Admin
```
store_settings ──── Global store config (payment gateway, payout settings)
audit_logs ──────── Immutable record of critical actions
```

## API Endpoints

### Vercel Serverless (`/api/`)

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/send-email` | POST | None | Server-side email relay (Nodemailer/SMTP) |
| `/api/partner-auth` | POST | Admin JWT | Approve/reject partner applications |
| `/api/process-payout` | POST | Admin JWT | Process Paystack transfers |
| `/api/cloudinary` | GET | None | Cloudinary API proxy |

### Supabase Edge Functions

| Function | Purpose |
|----------|---------|
| `paystack-verify` | Verify payment + create order (idempotent) |
| `paystack-webhook` | Handle Paystack webhook events (HMAC verified) |

### Security

All API endpoints include:
- CORS restricted to `ALLOWED_ORIGINS` env var
- Rate limiting (10-20 req/min per IP)
- Input validation (UUID, email format, action whitelist)
- Audit logging for financial operations

## Module Architecture

### Affiliate Module (`src/modules/affiliate/`)
```
affiliate/
├── types.ts          # All TypeScript types (Affiliate, Commission, Payout, etc.)
├── queries.ts        # 25+ query functions (Supabase)
├── constants.tsx     # Dashboard tabs, achievement definitions, tier thresholds
├── index.ts          # Re-exports
└── components/
    ├── StatusBadge.tsx           # Reusable status indicator
    ├── MonthlyEarningsChart.tsx  # CSS bar chart
    ├── NotificationPanel.tsx     # Notification dropdown
    ├── BankDetailsForm.tsx       # Bank details input
    ├── ReferralLinkCard.tsx      # Referral link + UTM builder
    ├── ChangePasswordCard.tsx    # Password change form
    └── AccountTab.tsx            # Profile, notifications, settings
```

### Key Design Decisions

1. **Module isolation**: Affiliate system is self-contained in `src/modules/affiliate/` — types, queries, components, constants all colocated
2. **Server-side secrets**: All API keys (SMTP, Paystack, Supabase service role) stay server-side. Client only uses anon key + VITE_ prefixed public config
3. **Email relay**: Client calls `/api/send-email` → server sends via Nodemailer (SMTP). Credentials never exposed to browser
4. **RLS-first**: Database-level security via Row Level Security. Partners can only access own data. Admin verified at API layer
5. **Audit trail**: All financial operations (payouts, partner approvals) logged to immutable `audit_logs` table
6. **Idempotent payments**: Paystack verify checks for existing orders before creating duplicates

## Performance

- All page routes lazy-loaded via `React.lazy()`
- Images use `loading="lazy" decoding="async"`
- Supabase queries use specific column selects (not `SELECT *`)
- Derived computations memoized with `useMemo`
- Product queries include category join (eliminates N+1)
- CSS-only charts (no charting library)
- Tailwind CSS v4 with purged unused styles

## SEO

- `<Meta>` component on all public pages (title, description, OG/Twitter, canonical)
- JSON-LD structured data (Person schema, Product schema)
- Static sitemap.xml with all public routes
- robots.txt blocks `/admin` and `/shop/partners/dashboard`
- Semantic HTML with proper heading hierarchy

## Security

- CORS restricted to configured origins
- Rate limiting on all API endpoints
- Input validation (UUID, email, action whitelist)
- Cryptographically secure password generation (`crypto.getRandomValues`)
- Security headers (HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff)
- Paystack webhook HMAC-SHA512 signature verification
