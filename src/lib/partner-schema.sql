-- Gifted Partner Ecosystem - Complete Supabase Schema (idempotent)
-- v1: Partner management, click/conversion tracking, payouts, gamification
-- Safe to run multiple times
-- Depends on: supabase-schema.sql (is_admin, profiles), commerce-schema.sql (products, orders, order_items, customers, store_settings, generate_referral_code)

-- ===================== PARTNERS =====================
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) UNIQUE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  bio TEXT,
  avatar_url TEXT,
  referral_code TEXT UNIQUE NOT NULL DEFAULT generate_referral_code(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','suspended','banned','rejected')),
  level TEXT DEFAULT 'bronze' CHECK (level IN ('bronze','silver','gold','platinum','diamond')),
  website TEXT,
  instagram TEXT,
  tiktok TEXT,
  youtube TEXT,
  twitter TEXT,
  linkedin TEXT,
  portfolio_url TEXT,
  audience_size TEXT,
  primary_platform TEXT,
  content_type TEXT,
  motivation TEXT,
  payment_method TEXT DEFAULT 'bank_transfer',
  bank_name TEXT,
  bank_account_number TEXT,
  bank_account_name TEXT,
  total_clicks BIGINT DEFAULT 0,
  total_conversions BIGINT DEFAULT 0,
  total_revenue_generated NUMERIC DEFAULT 0,
  total_commission_earned NUMERIC DEFAULT 0,
  pending_commission NUMERIC DEFAULT 0,
  paid_commission NUMERIC DEFAULT 0,
  lifetime_clicks BIGINT DEFAULT 0,
  lifetime_revenue NUMERIC DEFAULT 0,
  last_click_at TIMESTAMPTZ,
  last_conversion_at TIMESTAMPTZ,
  notification_preferences JSONB DEFAULT '{"email": true, "browser": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partners can read own profile" ON partners;
CREATE POLICY "Partners can read own profile"
  ON partners FOR SELECT
  USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Partners can update own profile" ON partners;
CREATE POLICY "Partners can update own profile"
  ON partners FOR UPDATE
  USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Anyone can insert partners" ON partners;
CREATE POLICY "Anyone can insert partners"
  ON partners FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read all partners" ON partners;
CREATE POLICY "Admins can read all partners"
  ON partners FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update partners" ON partners;
CREATE POLICY "Admins can update partners"
  ON partners FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete partners" ON partners;
CREATE POLICY "Admins can delete partners"
  ON partners FOR DELETE
  USING (public.is_admin());

-- ===================== PARTNER CLICKS =====================
CREATE TABLE IF NOT EXISTS partner_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  device_type TEXT,
  campaign TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE partner_clicks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert partner clicks" ON partner_clicks;
CREATE POLICY "Anyone can insert partner clicks"
  ON partner_clicks FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Partners can read own clicks" ON partner_clicks;
CREATE POLICY "Partners can read own clicks"
  ON partner_clicks FOR SELECT
  USING (
    public.is_admin()
    OR (auth.uid() IS NOT NULL AND partner_id IN (
      SELECT id FROM partners WHERE auth_user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Admins can read all partner clicks" ON partner_clicks;
CREATE POLICY "Admins can read all partner clicks"
  ON partner_clicks FOR SELECT
  USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_partner_clicks_partner_created
  ON partner_clicks (partner_id, created_at DESC);

-- ===================== PARTNER CONVERSIONS =====================
CREATE TABLE IF NOT EXISTS partner_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  click_id UUID REFERENCES partner_clicks(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_type TEXT,
  sale_amount NUMERIC NOT NULL,
  commission_rate NUMERIC NOT NULL,
  commission_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','cancelled','paid')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE partner_conversions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partners can read own conversions" ON partner_conversions;
CREATE POLICY "Partners can read own conversions"
  ON partner_conversions FOR SELECT
  USING (
    public.is_admin()
    OR (auth.uid() IS NOT NULL AND partner_id IN (
      SELECT id FROM partners WHERE auth_user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Admins can manage conversions" ON partner_conversions;
CREATE POLICY "Admins can manage conversions"
  ON partner_conversions FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Service role can insert conversions" ON partner_conversions;
CREATE POLICY "Service role can insert conversions"
  ON partner_conversions FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_partner_conversions_partner_created
  ON partner_conversions (partner_id, created_at DESC);

-- ===================== PARTNER PAYOUTS =====================
CREATE TABLE IF NOT EXISTS partner_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'NGN',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','approved','paid','rejected')),
  payment_method TEXT,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_account_name TEXT,
  reference TEXT,
  notes TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE partner_payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partners can read own payouts" ON partner_payouts;
CREATE POLICY "Partners can read own payouts"
  ON partner_payouts FOR SELECT
  USING (
    public.is_admin()
    OR (auth.uid() IS NOT NULL AND partner_id IN (
      SELECT id FROM partners WHERE auth_user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Partners can request payouts" ON partner_payouts;
CREATE POLICY "Partners can request payouts"
  ON partner_payouts FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND partner_id IN (
      SELECT id FROM partners WHERE auth_user_id = auth.uid() AND status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Admins can manage payouts" ON partner_payouts;
CREATE POLICY "Admins can manage payouts"
  ON partner_payouts FOR ALL
  USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_partner_payouts_partner_created
  ON partner_payouts (partner_id, created_at DESC);

-- ===================== PARTNER NOTIFICATIONS =====================
CREATE TABLE IF NOT EXISTS partner_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE partner_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partners can read own notifications" ON partner_notifications;
CREATE POLICY "Partners can read own notifications"
  ON partner_notifications FOR SELECT
  USING (
    public.is_admin()
    OR (auth.uid() IS NOT NULL AND partner_id IN (
      SELECT id FROM partners WHERE auth_user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Partners can update own notifications" ON partner_notifications;
CREATE POLICY "Partners can update own notifications"
  ON partner_notifications FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND partner_id IN (
      SELECT id FROM partners WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage notifications" ON partner_notifications;
CREATE POLICY "Admins can manage notifications"
  ON partner_notifications FOR ALL
  USING (public.is_admin());

-- ===================== PARTNER ACHIEVEMENTS =====================
CREATE TABLE IF NOT EXISTS partner_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  achievement_key TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(partner_id, achievement_key)
);

ALTER TABLE partner_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partners can read own achievements" ON partner_achievements;
CREATE POLICY "Partners can read own achievements"
  ON partner_achievements FOR SELECT
  USING (
    public.is_admin()
    OR (auth.uid() IS NOT NULL AND partner_id IN (
      SELECT id FROM partners WHERE auth_user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Admins can manage achievements" ON partner_achievements;
CREATE POLICY "Admins can manage achievements"
  ON partner_achievements FOR ALL
  USING (public.is_admin());

-- ===================== MARKETING ASSETS =====================
CREATE TABLE IF NOT EXISTS marketing_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  file_url TEXT,
  file_type TEXT,
  file_size BIGINT,
  thumbnail_url TEXT,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE marketing_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active marketing assets" ON marketing_assets;
CREATE POLICY "Anyone can read active marketing assets"
  ON marketing_assets FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage marketing assets" ON marketing_assets;
CREATE POLICY "Admins can manage marketing assets"
  ON marketing_assets FOR ALL
  USING (public.is_admin());

-- ===================== PARTNER CAMPAIGNS =====================
CREATE TABLE IF NOT EXISTS partner_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT,
  url TEXT,
  medium TEXT,
  source TEXT,
  clicks BIGINT DEFAULT 0,
  conversions BIGINT DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE partner_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partners can read own campaigns" ON partner_campaigns;
CREATE POLICY "Partners can read own campaigns"
  ON partner_campaigns FOR SELECT
  USING (
    public.is_admin()
    OR (auth.uid() IS NOT NULL AND partner_id IN (
      SELECT id FROM partners WHERE auth_user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Partners can manage own campaigns" ON partner_campaigns;
CREATE POLICY "Partners can manage own campaigns"
  ON partner_campaigns FOR ALL
  USING (
    auth.uid() IS NOT NULL AND partner_id IN (
      SELECT id FROM partners WHERE auth_user_id = auth.uid() AND status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Admins can manage all campaigns" ON partner_campaigns;
CREATE POLICY "Admins can manage all campaigns"
  ON partner_campaigns FOR ALL
  USING (public.is_admin());

-- ===================== PARTNER AUDIT LOG =====================
CREATE TABLE IF NOT EXISTS partner_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  actor_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE partner_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read partner audit log" ON partner_audit_log;
CREATE POLICY "Admins can read partner audit log"
  ON partner_audit_log FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert partner audit log" ON partner_audit_log;
CREATE POLICY "Admins can insert partner audit log"
  ON partner_audit_log FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Service role can insert partner audit log" ON partner_audit_log;
CREATE POLICY "Service role can insert partner audit log"
  ON partner_audit_log FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Partners can read own audit log" ON partner_audit_log;
CREATE POLICY "Partners can read own audit log"
  ON partner_audit_log FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND partner_id IN (
      SELECT id FROM partners WHERE auth_user_id = auth.uid()
    )
  );

-- ===================== TRIGGER: auto-update updated_at on partners =====================
CREATE OR REPLACE FUNCTION update_partners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_partners_updated ON partners;
CREATE TRIGGER on_partners_updated
  BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION update_partners_updated_at();

-- ===================== REALTIME PUBLICATION =====================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'partners'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE partners;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'partner_conversions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE partner_conversions;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'partner_payouts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE partner_payouts;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'partner_notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE partner_notifications;
  END IF;
END $$;
