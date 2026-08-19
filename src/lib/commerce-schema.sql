-- Gifted Commerce Platform - Complete Supabase Schema (idempotent)
-- v2: Added inventory, extended order statuses, shipping fields
-- Safe to run multiple times

-- ===================== PRODUCT CATEGORIES =====================
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read product categories" ON product_categories;
CREATE POLICY "Anyone can read product categories"
  ON product_categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage product categories" ON product_categories;
CREATE POLICY "Admins can manage product categories"
  ON product_categories FOR ALL
  USING (public.is_admin());

-- ===================== INVENTORY (colors/sizes for physical merch) =====================
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_label TEXT NOT NULL DEFAULT '',
  color TEXT DEFAULT NULL,
  size TEXT DEFAULT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  sku TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read inventory" ON inventory;
CREATE POLICY "Anyone can read inventory"
  ON inventory FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage inventory" ON inventory;
CREATE POLICY "Admins can manage inventory"
  ON inventory FOR ALL
  USING (public.is_admin());

-- ===================== DOWNLOAD FILES (Supabase Storage references) =====================
CREATE TABLE IF NOT EXISTS download_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT '',
  file_name TEXT NOT NULL DEFAULT '',
  file_path TEXT NOT NULL DEFAULT '',
  file_size BIGINT NOT NULL DEFAULT 0,
  mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  download_limit INTEGER DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE download_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read download files" ON download_files;
CREATE POLICY "Anyone can read download files"
  ON download_files FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage download files" ON download_files;
CREATE POLICY "Admins can manage download files"
  ON download_files FOR ALL
  USING (public.is_admin());

-- ===================== PRODUCTS =====================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  short_description TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'digital' CHECK (type IN ('digital', 'physical', 'bundle')),
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  sale_price DECIMAL(10,2) DEFAULT NULL,
  thumbnail TEXT NOT NULL DEFAULT '',
  gallery JSONB DEFAULT '[]'::jsonb,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  stock INTEGER DEFAULT NULL,
  digital_file_url TEXT DEFAULT NULL,
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  attributes JSONB DEFAULT NULL,
  variants JSONB DEFAULT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read published products" ON products;
CREATE POLICY "Anyone can read published products"
  ON products FOR SELECT
  USING (published = true);

DROP POLICY IF EXISTS "Admins can read all products" ON products;
CREATE POLICY "Admins can read all products"
  ON products FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert products" ON products;
CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update products" ON products;
CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete products" ON products;
CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  USING (public.is_admin());

-- ===================== CUSTOMERS =====================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT NULL,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_spent DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert customers" ON customers;
CREATE POLICY "Anyone can insert customers"
  ON customers FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read all customers" ON customers;
CREATE POLICY "Admins can read all customers"
  ON customers FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update customers" ON customers;
CREATE POLICY "Admins can update customers"
  ON customers FOR UPDATE
  USING (public.is_admin());

-- ===================== AFFILIATES =====================
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT DEFAULT NULL,
  social_links TEXT NOT NULL DEFAULT '',
  reason TEXT NOT NULL DEFAULT '',
  audience_description TEXT NOT NULL DEFAULT '',
  account_name TEXT DEFAULT NULL,
  account_number TEXT DEFAULT NULL,
  bank_name TEXT DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  referral_code TEXT NOT NULL UNIQUE,
  total_clicks INTEGER NOT NULL DEFAULT 0,
  total_sales INTEGER NOT NULL DEFAULT 0,
  total_earnings DECIMAL(10,2) NOT NULL DEFAULT 0,
  paid_earnings DECIMAL(10,2) NOT NULL DEFAULT 0,
  pending_earnings DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'affiliates' AND column_name = 'phone'
  ) THEN
    ALTER TABLE affiliates ADD COLUMN phone TEXT DEFAULT NULL;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'affiliates' AND column_name = 'auth_user_id'
  ) THEN
    ALTER TABLE affiliates ADD COLUMN auth_user_id UUID DEFAULT NULL;
  END IF;
END $$;

DROP POLICY IF EXISTS "Partners can read own affiliate" ON affiliates;
CREATE POLICY "Partners can read own affiliate"
  ON affiliates FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Anyone can insert affiliates" ON affiliates;
CREATE POLICY "Anyone can insert affiliates"
  ON affiliates FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read approved affiliates" ON affiliates;
CREATE POLICY "Anyone can read approved affiliates"
  ON affiliates FOR SELECT
  USING (status = 'approved');

DROP POLICY IF EXISTS "Admins can read all affiliates" ON affiliates;
CREATE POLICY "Admins can read all affiliates"
  ON affiliates FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update affiliates" ON affiliates;
CREATE POLICY "Admins can update affiliates"
  ON affiliates FOR UPDATE
  USING (public.is_admin());

-- ===================== ORDERS =====================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'in_production', 'ready_to_ship', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_reference TEXT NOT NULL DEFAULT '',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE SET NULL,
  discount_code TEXT DEFAULT NULL,
  shipping_address JSONB DEFAULT NULL,
  shipping_city TEXT DEFAULT NULL,
  shipping_state TEXT DEFAULT NULL,
  shipping_country TEXT DEFAULT NULL,
  shipping_zip TEXT DEFAULT NULL,
  tracking_number TEXT DEFAULT NULL,
  shipping_carrier TEXT DEFAULT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  shipping_status TEXT DEFAULT NULL,
  delivery_notes TEXT DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
CREATE POLICY "Anyone can insert orders"
  ON orders FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read orders" ON orders;
CREATE POLICY "Admins can read orders"
  ON orders FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update orders" ON orders;
CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (public.is_admin());

-- ===================== ORDER ITEMS =====================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_title TEXT NOT NULL DEFAULT '',
  product_type TEXT NOT NULL DEFAULT 'digital',
  size TEXT DEFAULT NULL,
  color TEXT DEFAULT NULL,
  options JSONB DEFAULT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  download_token TEXT DEFAULT NULL,
  download_expires TIMESTAMPTZ DEFAULT NULL,
  download_count INTEGER NOT NULL DEFAULT 0,
  download_limit INTEGER DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read order items" ON order_items;
CREATE POLICY "Admins can read order items"
  ON order_items FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert order items" ON order_items;
CREATE POLICY "Admins can insert order items"
  ON order_items FOR INSERT
  WITH CHECK (public.is_admin());

-- ===================== DOWNLOADS =====================
CREATE TABLE IF NOT EXISTS downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL DEFAULT '',
  user_agent TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert downloads" ON downloads;
CREATE POLICY "Anyone can insert downloads"
  ON downloads FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read downloads" ON downloads;
CREATE POLICY "Admins can read downloads"
  ON downloads FOR SELECT
  USING (public.is_admin());

-- ===================== AFFILIATE CLICKS =====================
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  ip_address TEXT NOT NULL DEFAULT '',
  user_agent TEXT NOT NULL DEFAULT '',
  converted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert affiliate clicks" ON affiliate_clicks;
CREATE POLICY "Anyone can insert affiliate clicks"
  ON affiliate_clicks FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read affiliate clicks" ON affiliate_clicks;
CREATE POLICY "Admins can read affiliate clicks"
  ON affiliate_clicks FOR SELECT
  USING (public.is_admin());

-- ===================== AFFILIATE COMMISSIONS =====================
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL DEFAULT 'digital',
  rate DECIMAL(5,4) NOT NULL DEFAULT 0,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage affiliate commissions" ON affiliate_commissions;
CREATE POLICY "Admins can manage affiliate commissions"
  ON affiliate_commissions FOR ALL
  USING (public.is_admin());

-- ===================== AFFILIATE PAYOUTS =====================
CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  payment_method TEXT NOT NULL DEFAULT '',
  account_name TEXT DEFAULT NULL,
  account_number TEXT DEFAULT NULL,
  bank_name TEXT DEFAULT NULL,
  notes TEXT NOT NULL DEFAULT '',
  processed_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage affiliate payouts" ON affiliate_payouts;
CREATE POLICY "Admins can manage affiliate payouts"
  ON affiliate_payouts FOR ALL
  USING (public.is_admin());

-- ===================== DISCOUNT CODES =====================
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_uses INTEGER DEFAULT NULL,
  use_count INTEGER NOT NULL DEFAULT 0,
  min_order_amount DECIMAL(10,2) DEFAULT NULL,
  expires_at TIMESTAMPTZ DEFAULT NULL,
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage discount codes" ON discount_codes;
CREATE POLICY "Admins can manage discount codes"
  ON discount_codes FOR ALL
  USING (public.is_admin());

-- ===================== TRANSACTIONS =====================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  reference TEXT NOT NULL,
  gateway TEXT NOT NULL CHECK (gateway IN ('paystack', 'stripe')),
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT '',
  gateway_response JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage transactions" ON transactions;
CREATE POLICY "Admins can manage transactions"
  ON transactions FOR ALL
  USING (public.is_admin());

-- ===================== STORE SETTINGS =====================
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  digital_commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.30,
  physical_commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.10,
  currency TEXT NOT NULL DEFAULT 'NGN',
  payment_gateway TEXT NOT NULL DEFAULT 'paystack',
  paystack_secret_key TEXT,
  paystack_public_key TEXT,
  min_payout_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  auto_approve_payouts BOOLEAN NOT NULL DEFAULT false,
  payout_schedule TEXT NOT NULL DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage store settings" ON store_settings;
CREATE POLICY "Admins can manage store settings"
  ON store_settings FOR ALL
  USING (public.is_admin());

-- ===================== REFERRAL CODE GENERATOR =====================
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
BEGIN
  code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
  RETURN code;
END;
$$;

-- ===================== ANALYTICS VIEW =====================
CREATE OR REPLACE VIEW analytics_daily AS
SELECT
  DATE(created_at) AS day,
  COUNT(*) AS order_count,
  COALESCE(SUM(total), 0) AS revenue,
  COUNT(DISTINCT customer_id) AS customer_count
FROM orders
WHERE status NOT IN ('cancelled', 'refunded')
GROUP BY DATE(created_at)
ORDER BY day DESC;

-- ===================== PARTNER NOTIFICATIONS =====================
CREATE TABLE IF NOT EXISTS partner_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'sale',
  title TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  read BOOLEAN NOT NULL DEFAULT false,
  link TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE partner_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read notifications" ON partner_notifications;
CREATE POLICY "Anyone can read notifications"
  ON partner_notifications FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage notifications" ON partner_notifications;
CREATE POLICY "Admins can manage notifications"
  ON partner_notifications FOR ALL
  USING (public.is_admin());

-- ===================== PARTNER ACHIEVEMENTS =====================
CREATE TABLE IF NOT EXISTS partner_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  achievement_key TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'star',
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT NULL
);

ALTER TABLE partner_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read achievements" ON partner_achievements;
CREATE POLICY "Anyone can read achievements"
  ON partner_achievements FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage achievements" ON partner_achievements;
CREATE POLICY "Admins can manage achievements"
  ON partner_achievements FOR ALL
  USING (public.is_admin());

-- ===================== MARKETING ASSETS =====================
CREATE TABLE IF NOT EXISTS marketing_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'image',
  file_url TEXT DEFAULT NULL,
  content TEXT DEFAULT NULL,
  description TEXT NOT NULL DEFAULT '',
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  downloadable BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE marketing_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read marketing assets" ON marketing_assets;
CREATE POLICY "Anyone can read marketing assets"
  ON marketing_assets FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage marketing assets" ON marketing_assets;
CREATE POLICY "Admins can manage marketing assets"
  ON marketing_assets FOR ALL
  USING (public.is_admin());

-- ===================== REALTIME PUBLICATION =====================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'affiliates'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE affiliates;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'affiliate_commissions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE affiliate_commissions;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'inventory'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE inventory;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'attributes'
  ) THEN
    ALTER TABLE products ADD COLUMN attributes JSONB DEFAULT NULL;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'variants'
  ) THEN
    ALTER TABLE products ADD COLUMN variants JSONB DEFAULT NULL;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'size'
  ) THEN
    ALTER TABLE order_items ADD COLUMN size TEXT DEFAULT NULL;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'color'
  ) THEN
    ALTER TABLE order_items ADD COLUMN color TEXT DEFAULT NULL;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'options'
  ) THEN
    ALTER TABLE order_items ADD COLUMN options JSONB DEFAULT NULL;
  END IF;
END $$;

-- ===================== RLS FIXES (v2) =====================

-- Partners can read their own commissions
DROP POLICY IF EXISTS "Partners can read own commissions" ON affiliate_commissions;
CREATE POLICY "Partners can read own commissions"
  ON affiliate_commissions FOR SELECT
  USING (auth.uid() IS NOT NULL AND affiliate_id IN (
    SELECT id FROM affiliates WHERE auth_user_id = auth.uid()
  ));

-- Partners can read their own payouts
DROP POLICY IF EXISTS "Partners can read own payouts" ON affiliate_payouts;
CREATE POLICY "Partners can read own payouts"
  ON affiliate_payouts FOR SELECT
  USING (auth.uid() IS NOT NULL AND affiliate_id IN (
    SELECT id FROM affiliates WHERE auth_user_id = auth.uid()
  ));

-- Partners can read their own clicks
DROP POLICY IF EXISTS "Partners can read own clicks" ON affiliate_clicks;
CREATE POLICY "Partners can read own clicks"
  ON affiliate_clicks FOR SELECT
  USING (auth.uid() IS NOT NULL AND affiliate_id IN (
    SELECT id FROM affiliates WHERE auth_user_id = auth.uid()
  ));

-- Notifications: only partner + admin (replaces wide-open "Anyone can read")
DROP POLICY IF EXISTS "Anyone can read notifications" ON partner_notifications;
DROP POLICY IF EXISTS "Partners can read own notifications" ON partner_notifications;
CREATE POLICY "Partners can read own notifications"
  ON partner_notifications FOR SELECT
  USING (
    public.is_admin()
    OR (auth.uid() IS NOT NULL AND partner_id IN (
      SELECT id FROM affiliates WHERE auth_user_id = auth.uid()
    ))
  );

-- Achievements: only partner + admin (replaces wide-open "Anyone can read")
DROP POLICY IF EXISTS "Anyone can read achievements" ON partner_achievements;
DROP POLICY IF EXISTS "Partners can read own achievements" ON partner_achievements;
CREATE POLICY "Partners can read own achievements"
  ON partner_achievements FOR SELECT
  USING (
    public.is_admin()
    OR (auth.uid() IS NOT NULL AND partner_id IN (
      SELECT id FROM affiliates WHERE auth_user_id = auth.uid()
    ))
  );

-- ============================================================
-- AUDIT LOGS — immutable record of critical actions
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  actor_id UUID,
  actor_email TEXT,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB DEFAULT '{}'
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read audit logs" ON audit_logs;
CREATE POLICY "Admins can read audit logs"
  ON audit_logs FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Service role can insert audit logs" ON audit_logs;
CREATE POLICY "Service role can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);
