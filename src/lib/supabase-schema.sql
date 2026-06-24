-- Gifted Portfolio - Complete Supabase Schema (idempotent)
-- Safe to run multiple times

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================== PROFILES =====================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- ===================== HELPER: is_admin =====================
-- SECURITY DEFINER so it bypasses RLS, preventing infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (public.is_admin());

-- ===================== CATEGORIES =====================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read categories" ON categories;
CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  WITH CHECK (
    public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can update categories" ON categories;
CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  USING (
    public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can delete categories" ON categories;
CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  USING (
    public.is_admin()
  );

-- ===================== PROJECTS =====================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  content TEXT DEFAULT '',
  cover_image TEXT DEFAULT '',
  gallery JSONB DEFAULT '[]'::jsonb,
  videos JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  client TEXT DEFAULT '',
  year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  role TEXT DEFAULT '',
  tools JSONB DEFAULT '[]'::jsonb,
  technologies JSONB DEFAULT '[]'::jsonb,
  category TEXT DEFAULT '',
  thumbnail TEXT DEFAULT '',
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  project_url TEXT DEFAULT '',
  github_url TEXT DEFAULT '',
  external_links JSONB DEFAULT '[]'::jsonb,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read published projects" ON projects;
CREATE POLICY "Anyone can read published projects"
  ON projects FOR SELECT
  USING (published = true OR status = 'published');

DROP POLICY IF EXISTS "Admins can read all projects" ON projects;
CREATE POLICY "Admins can read all projects"
  ON projects FOR SELECT
  USING (
    public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can insert projects" ON projects;
CREATE POLICY "Admins can insert projects"
  ON projects FOR INSERT
  WITH CHECK (
    public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can update projects" ON projects;
CREATE POLICY "Admins can update projects"
  ON projects FOR UPDATE
  USING (
    public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can delete projects" ON projects;
CREATE POLICY "Admins can delete projects"
  ON projects FOR DELETE
  USING (
    public.is_admin()
  );

-- ===================== PROJECT CATEGORIES (Junction) =====================
CREATE TABLE IF NOT EXISTS project_categories (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, category_id)
);

ALTER TABLE project_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read project_categories" ON project_categories;
CREATE POLICY "Anyone can read project_categories"
  ON project_categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage project_categories" ON project_categories;
CREATE POLICY "Admins can manage project_categories"
  ON project_categories FOR ALL
  USING (
    public.is_admin()
  );

-- ===================== PROJECT GALLERY =====================
CREATE TABLE IF NOT EXISTS project_gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE project_gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read project gallery" ON project_gallery;
CREATE POLICY "Anyone can read project gallery"
  ON project_gallery FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage project gallery" ON project_gallery;
CREATE POLICY "Admins can manage project gallery"
  ON project_gallery FOR ALL
  USING (
    public.is_admin()
  );

-- ===================== SERVICES =====================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '',
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read services" ON services;
CREATE POLICY "Anyone can read services"
  ON services FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage services" ON services;
CREATE POLICY "Admins can manage services"
  ON services FOR ALL
  USING (
    public.is_admin()
  );

-- ===================== TESTIMONIALS =====================
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  avatar TEXT NOT NULL DEFAULT '',
  rating INTEGER DEFAULT 5,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read testimonials" ON testimonials;
CREATE POLICY "Anyone can read testimonials"
  ON testimonials FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage testimonials" ON testimonials;
CREATE POLICY "Admins can manage testimonials"
  ON testimonials FOR ALL
  USING (
    public.is_admin()
  );

DROP POLICY IF EXISTS "Anyone can insert testimonials" ON testimonials;
CREATE POLICY "Anyone can insert testimonials"
  ON testimonials FOR INSERT
  WITH CHECK (true);

-- ===================== SKILLS =====================
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  level INTEGER NOT NULL DEFAULT 0,
  icon TEXT NOT NULL DEFAULT '',
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read skills" ON skills;
CREATE POLICY "Anyone can read skills"
  ON skills FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage skills" ON skills;
CREATE POLICY "Admins can manage skills"
  ON skills FOR ALL
  USING (
    public.is_admin()
  );

-- ===================== BLOG POSTS =====================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  cover_image TEXT NOT NULL DEFAULT '',
  tags JSONB DEFAULT '[]'::jsonb,
  categories JSONB DEFAULT '[]'::jsonb,
  reading_time INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read published posts" ON blog_posts;
CREATE POLICY "Anyone can read published posts"
  ON blog_posts FOR SELECT
  USING (published = true);

DROP POLICY IF EXISTS "Admins can read all posts" ON blog_posts;
CREATE POLICY "Admins can read all posts"
  ON blog_posts FOR SELECT
  USING (
    public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can manage blog posts" ON blog_posts;
CREATE POLICY "Admins can manage blog posts"
  ON blog_posts FOR ALL
  USING (
    public.is_admin()
  );

-- ===================== CONTACT MESSAGES =====================
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  subject TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  service TEXT DEFAULT '',
  preferred_contact TEXT DEFAULT 'email' CHECK (preferred_contact IN ('email', 'whatsapp')),
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert messages" ON contact_messages;
CREATE POLICY "Anyone can insert messages"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read messages" ON contact_messages;
CREATE POLICY "Admins can read messages"
  ON contact_messages FOR SELECT
  USING (
    public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can update messages" ON contact_messages;
CREATE POLICY "Admins can update messages"
  ON contact_messages FOR UPDATE
  USING (
    public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can delete messages" ON contact_messages;
CREATE POLICY "Admins can delete messages"
  ON contact_messages FOR DELETE
  USING (
    public.is_admin()
  );

-- ===================== CHAT LOGS =====================
CREATE TABLE IF NOT EXISTS chat_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  response TEXT NOT NULL DEFAULT '',
  category TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read chat logs" ON chat_logs;
CREATE POLICY "Admins can read chat logs"
  ON chat_logs FOR SELECT
  USING (
    public.is_admin()
  );

DROP POLICY IF EXISTS "Anyone can insert chat logs" ON chat_logs;
CREATE POLICY "Anyone can insert chat logs"
  ON chat_logs FOR INSERT
  WITH CHECK (true);

-- ===================== ANALYTICS =====================
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  session_id TEXT DEFAULT '',
  page_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read analytics" ON analytics;
CREATE POLICY "Admins can read analytics"
  ON analytics FOR SELECT
  USING (
    public.is_admin()
  );

DROP POLICY IF EXISTS "Anyone can insert analytics" ON analytics;
CREATE POLICY "Anyone can insert analytics"
  ON analytics FOR INSERT
  WITH CHECK (true);

-- ===================== STORAGE BUCKETS =====================
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can read media" ON storage.objects;
CREATE POLICY "Anyone can read media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Admins can upload media" ON storage.objects;
CREATE POLICY "Admins can upload media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'media' AND
    public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can delete media" ON storage.objects;
CREATE POLICY "Admins can delete media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'media' AND
    public.is_admin()
  );

-- ===================== FILE UPLOAD LINKS =====================
CREATE TABLE IF NOT EXISTS file_upload_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL DEFAULT '',
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  max_file_size BIGINT DEFAULT 52428800,
  max_files_per_upload INTEGER DEFAULT 5,
  max_total_uploads INTEGER DEFAULT NULL,
  allowed_extensions TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  upload_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE file_upload_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read valid upload links" ON file_upload_links;
CREATE POLICY "Anyone can read valid upload links"
  ON file_upload_links FOR SELECT
  USING (is_active = true AND expires_at > NOW());

DROP POLICY IF EXISTS "Admins can read all upload links" ON file_upload_links;
CREATE POLICY "Admins can read all upload links"
  ON file_upload_links FOR SELECT
  USING (
    public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can manage upload links" ON file_upload_links;
CREATE POLICY "Admins can manage upload links"
  ON file_upload_links FOR ALL
  USING (
    public.is_admin()
  );

-- ===================== FILE UPLOADS =====================
CREATE TABLE IF NOT EXISTS file_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id UUID NOT NULL REFERENCES file_upload_links(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL DEFAULT '',
  sender_email TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  files JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert file uploads" ON file_uploads;
CREATE POLICY "Anyone can insert file uploads"
  ON file_uploads FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read file uploads" ON file_uploads;
CREATE POLICY "Admins can read file uploads"
  ON file_uploads FOR SELECT
  USING (
    public.is_admin()
  );

DROP POLICY IF EXISTS "Anyone can read their own uploads" ON file_uploads;
CREATE POLICY "Anyone can read their own uploads"
  ON file_uploads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM file_upload_links
      WHERE id = link_id AND is_active = true AND expires_at > NOW()
    )
  );

-- ===================== FILE UPLOADS STORAGE BUCKET =====================
INSERT INTO storage.buckets (id, name, public) VALUES ('file-uploads', 'file-uploads', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can read file uploads storage" ON storage.objects;
CREATE POLICY "Anyone can read file uploads storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'file-uploads');

DROP POLICY IF EXISTS "Anyone can upload to file-uploads" ON storage.objects;
CREATE POLICY "Anyone can upload to file-uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'file-uploads');

DROP POLICY IF EXISTS "Admins can delete file uploads" ON storage.objects;
CREATE POLICY "Admins can delete file uploads"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'file-uploads' AND
    public.is_admin()
  );

-- ===================== FILE SHARES (Client Review) =====================
CREATE TABLE IF NOT EXISTS file_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  token TEXT NOT NULL UNIQUE,
  password_hash TEXT DEFAULT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  file_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE file_shares ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';

ALTER TABLE file_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read file shares" ON file_shares;
CREATE POLICY "Anyone can read file shares"
  ON file_shares FOR SELECT
  USING (is_active = true AND expires_at > NOW());

DROP POLICY IF EXISTS "Admins can read all file shares" ON file_shares;
CREATE POLICY "Admins can read all file shares"
  ON file_shares FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage file shares" ON file_shares;
CREATE POLICY "Admins can manage file shares"
  ON file_shares FOR ALL
  USING (public.is_admin());

CREATE TABLE IF NOT EXISTS file_share_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  share_id UUID NOT NULL REFERENCES file_shares(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT '',
  size BIGINT DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE file_share_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read file share items" ON file_share_items;
CREATE POLICY "Anyone can read file share items"
  ON file_share_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM file_shares WHERE id = share_id AND is_active = true AND expires_at > NOW())
  );

DROP POLICY IF EXISTS "Admins can read all file share items" ON file_share_items;
CREATE POLICY "Admins can read all file share items"
  ON file_share_items FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage file share items" ON file_share_items;
CREATE POLICY "Admins can manage file share items"
  ON file_share_items FOR ALL
  USING (public.is_admin());

-- ===================== FILE SHARE COMMENTS =====================
CREATE TABLE IF NOT EXISTS file_share_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  share_id UUID NOT NULL REFERENCES file_shares(id) ON DELETE CASCADE,
  item_id UUID REFERENCES file_share_items(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE file_share_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read comments" ON file_share_comments;
CREATE POLICY "Anyone can read comments"
  ON file_share_comments FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can insert comments" ON file_share_comments;
CREATE POLICY "Anyone can insert comments"
  ON file_share_comments FOR INSERT
  WITH CHECK (true);

INSERT INTO storage.buckets (id, name, public) VALUES ('file-shares', 'file-shares', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can read file shares storage" ON storage.objects;
CREATE POLICY "Anyone can read file shares storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'file-shares');

DROP POLICY IF EXISTS "Admins can upload file shares" ON storage.objects;
CREATE POLICY "Admins can upload file shares"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'file-shares' AND public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can delete file shares" ON storage.objects;
CREATE POLICY "Admins can delete file shares"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'file-shares' AND public.is_admin()
  );

-- ===================== COMPANY LOGOS =====================
CREATE TABLE IF NOT EXISTS company_logos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE company_logos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read company logos" ON company_logos;
CREATE POLICY "Anyone can read company logos"
  ON company_logos FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage company logos" ON company_logos;
CREATE POLICY "Admins can manage company logos"
  ON company_logos FOR ALL
  USING (public.is_admin());

-- ===================== SETTINGS =====================
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage settings" ON settings;
CREATE POLICY "Admins can manage settings"
  ON settings FOR ALL
  USING (public.is_admin());

-- ===================== MIGRATION: Set initial display_order =====================
UPDATE projects SET display_order = sub.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as row_num
  FROM projects
) sub
WHERE projects.id = sub.id AND projects.display_order = 0;

-- ===================== HELPER FUNCTION =====================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ===================== REALTIME (ADMIN NOTIFICATIONS) =====================
-- Enable Realtime for tables the admin needs push notifications on
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'contact_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE contact_messages;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'testimonials'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE testimonials;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'file_uploads'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE file_uploads;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'file_share_comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE file_share_comments;
  END IF;
END $$;
