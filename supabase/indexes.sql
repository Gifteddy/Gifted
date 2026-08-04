-- ============================================================
-- Gifted Portfolio — Performance Indexes + Analytics RPC
-- Safe to run multiple times. Run in the Supabase SQL editor.
-- Fixes: slow admin/portfolio queries caused by full table scans.
-- ============================================================

DO $$
BEGIN
  -- ===== Main portfolio schema =====
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projects') THEN
    CREATE INDEX IF NOT EXISTS idx_projects_status_display ON projects (status, display_order);
    CREATE INDEX IF NOT EXISTS idx_projects_published_display ON projects (published, display_order);
    CREATE INDEX IF NOT EXISTS idx_projects_status_created ON projects (status, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects (slug);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'testimonials') THEN
    CREATE INDEX IF NOT EXISTS idx_testimonials_featured_created ON testimonials (featured, created_at DESC);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'blog_posts') THEN
    CREATE INDEX IF NOT EXISTS idx_blog_posts_published_created ON blog_posts (published, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts (slug);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contact_messages') THEN
    CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages (created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_contact_messages_status_created ON contact_messages (status, created_at DESC);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'analytics') THEN
    CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics (created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics (event_type);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chat_logs') THEN
    CREATE INDEX IF NOT EXISTS idx_chat_logs_created ON chat_logs (created_at DESC);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'file_upload_links') THEN
    CREATE INDEX IF NOT EXISTS idx_file_upload_links_created ON file_upload_links (created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_file_upload_links_active_expires ON file_upload_links (is_active, expires_at);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'file_uploads') THEN
    CREATE INDEX IF NOT EXISTS idx_file_uploads_link_created ON file_uploads (link_id, created_at DESC);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'file_shares') THEN
    CREATE INDEX IF NOT EXISTS idx_file_shares_created ON file_shares (created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_file_shares_active_expires ON file_shares (is_active, expires_at);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'file_share_items') THEN
    CREATE INDEX IF NOT EXISTS idx_file_share_items_share_order ON file_share_items (share_id, sort_order);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'file_share_comments') THEN
    CREATE INDEX IF NOT EXISTS idx_file_share_comments_share_created ON file_share_comments (share_id, created_at);
  END IF;

  -- ===== Commerce schema =====
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
    CREATE INDEX IF NOT EXISTS idx_products_published_display ON products (published, display_order);
    CREATE INDEX IF NOT EXISTS idx_products_type_display ON products (type, display_order);
    CREATE INDEX IF NOT EXISTS idx_products_featured_display ON products (featured, display_order);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders') THEN
    CREATE INDEX IF NOT EXISTS idx_orders_created ON orders (created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_orders_customer_created ON orders (customer_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders (status, created_at DESC);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'order_items') THEN
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items (product_id);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customers') THEN
    CREATE INDEX IF NOT EXISTS idx_customers_created ON customers (created_at DESC);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'affiliates') THEN
    CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates (status);
    CREATE INDEX IF NOT EXISTS idx_affiliates_auth_user ON affiliates (auth_user_id);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'affiliate_clicks') THEN
    CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate_created ON affiliate_clicks (affiliate_id, created_at DESC);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'affiliate_commissions') THEN
    CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_affiliate ON affiliate_commissions (affiliate_id);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'affiliate_payouts') THEN
    CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_affiliate_created ON affiliate_payouts (affiliate_id, created_at DESC);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'discount_codes') THEN
    CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON discount_codes (is_active);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'transactions') THEN
    CREATE INDEX IF NOT EXISTS idx_transactions_order ON transactions (order_id);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'download_files') THEN
    CREATE INDEX IF NOT EXISTS idx_download_files_product ON download_files (product_id);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'downloads') THEN
    CREATE INDEX IF NOT EXISTS idx_downloads_orderitem_created ON downloads (order_item_id, created_at DESC);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inventory') THEN
    CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory (product_id, variant_label);
  END IF;

  -- ===== Partner schema =====
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'partners') THEN
    CREATE INDEX IF NOT EXISTS idx_partners_status_created ON partners (status, created_at DESC);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'partner_notifications') THEN
    CREATE INDEX IF NOT EXISTS idx_partner_notifications_partner_created ON partner_notifications (partner_id, created_at DESC);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'partner_achievements') THEN
    CREATE INDEX IF NOT EXISTS idx_partner_achievements_partner ON partner_achievements (partner_id, unlocked_at DESC);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'partner_campaigns') THEN
    CREATE INDEX IF NOT EXISTS idx_partner_campaigns_partner ON partner_campaigns (partner_id);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'marketing_assets') THEN
    CREATE INDEX IF NOT EXISTS idx_marketing_assets_active ON marketing_assets (is_active);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'partner_audit_log') THEN
    CREATE INDEX IF NOT EXISTS idx_partner_audit_partner_created ON partner_audit_log (partner_id, created_at DESC);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'push_subscriptions') THEN
    CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions (user_id);
  END IF;
END $$;

-- ============================================================
-- Grouped analytics counts — replaces the client-side query that
-- pulled every analytics row into the browser just to count them.
-- Run after the indexes. Call from the app with supabase.rpc('get_event_counts').
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_event_counts()
RETURNS TABLE(event_type text, count bigint)
LANGUAGE sql
STABLE
AS $$
  SELECT a.event_type, COUNT(*)::bigint AS count
  FROM public.analytics a
  GROUP BY a.event_type
  ORDER BY count DESC;
$$;
