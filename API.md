# API Documentation

## Serverless Functions (`/api/`)

### POST `/api/send-email`

Server-side email relay. Client calls this instead of sending SMTP directly to keep credentials server-side.

**Request:**
```json
{
  "to": "user@example.com",
  "subject": "Welcome!",
  "html": "<h1>Hello</h1>",
  "from": "noreply@gifted.ng",
  "replyTo": "support@gifted.ng"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `to` | Yes | Recipient email(s) — string or array |
| `subject` | Yes | Email subject |
| `html` | Yes | HTML body |
| `from` | No | Sender address (defaults to `SMTP_FROM` / `SMTP_USER`) |
| `replyTo` | No | Reply-to address |

**Response (200):** `{ "success": true }`

---

### POST `/api/partner-auth`

Admin endpoint for approving or rejecting partner applications.

**Auth:** Bearer token (admin JWT required)

**Request:**
```json
{
  "action": "approve",
  "affiliate_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "referral_code": "JOHN123"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `action` | Yes | `"approve"` or `"reject"` |
| `affiliate_id` | Yes | UUID of the affiliate |
| `email` | Yes | Partner's email |
| `name` | No | Partner's name |
| `referral_code` | No | Partner's referral code |

**Approve Response (200):**
```json
{
  "success": true,
  "userId": "uuid",
  "emailSent": true,
  "isExistingUser": false
}
```

**Reject Response (200):**
```json
{
  "success": true,
  "emailSent": true
}
```

**Side effects:**
- Approve: Creates Supabase Auth user (or finds existing), updates affiliate status, sends approval email with credentials
- Reject: Updates affiliate status, sends rejection email
- Both: Audit log created

**Rate limit:** 20 requests per minute per IP

---

### POST `/api/process-payout`

Processes a Paystack transfer to a partner's bank account.

**Auth:** Bearer token (admin JWT required)

**Request:**
```json
{
  "payout_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `payout_id` | Yes | UUID of the payout record |

**Response (200):**
```json
{
  "success": true,
  "transfer_reference": "TRF_xxx",
  "amount": 50000
}
```

**Flow:**
1. Validates admin auth
2. Fetches payout + affiliate bank details
3. Creates/retrieves Paystack transfer recipient
4. Initiates Paystack transfer
5. Updates payout status to `paid`
6. Creates partner notification
7. Sends payout email to partner
8. Creates audit log entry

**Rate limit:** 10 requests per minute per IP

---

## Supabase Edge Functions

### `paystack-verify`

Called from client after Paystack popup success. Verifies payment and creates order.

**Endpoint:** `https://{project-ref}.supabase.co/functions/v1/paystack-verify`

**Request:**
```json
{
  "reference": "pay_ref_xxx",
  "customer_id": "uuid",
  "items": [{ "product_id": "uuid", "product_title": "...", "product_type": "digital", "quantity": 1, "unit_price": 5000, "total_price": 5000 }],
  "subtotal": 5000,
  "discount": 0,
  "total": 5000,
  "currency": "NGN",
  "affiliate_id": "uuid",
  "discount_code": "SAVE10"
}
```

**Idempotent:** Returns existing order if `payment_reference` already processed.

---

### `paystack-webhook`

Handles Paystack webhook events. Verifies HMAC-SHA512 signature.

**Events handled:** `charge.success`

## Database Tables

### Key Tables

| Table | Purpose | RLS |
|-------|---------|-----|
| `profiles` | User profiles | Users read own; admins read all |
| `affiliates` | Partner applications/accounts | Partners read own; anyone insert; admins all |
| `affiliate_commissions` | Commission records | Partners read own; admins manage |
| `affiliate_clicks` | Click tracking | Partners read own; anyone insert |
| `affiliate_payouts` | Payout records | Partners read own; admins manage |
| `partner_notifications` | Partner notifications | Partners + admin read own |
| `partner_achievements` | Achievement badges | Partners read own; admins read all |
| `audit_logs` | Action audit trail | Admins read; service-role insert |
| `store_settings` | Store configuration | Admins only |
| `products` | Shop products | Published = public read; admins CRUD |
| `orders` | Customer orders | Admins read/update; anyone insert |
| `order_items` | Order line items | Admins only |
| `customers` | Customer records | Anyone insert; admins read |

### `audit_logs` Schema

```sql
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  actor_id UUID,
  actor_email TEXT,
  action TEXT NOT NULL,          -- 'partner_approved', 'partner_rejected', 'payout_processed'
  target_type TEXT,              -- 'affiliate', 'affiliate_payout'
  target_id UUID,
  details JSONB DEFAULT '{}'
);
```
