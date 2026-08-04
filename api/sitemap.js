const { createClient } = require('@supabase/supabase-js')

const SITE_URL = 'https://www.giftedcreates.com'
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const STATIC_ROUTES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/about', changefreq: 'monthly', priority: '0.8' },
  { path: '/projects', changefreq: 'weekly', priority: '0.9' },
  { path: '/blog', changefreq: 'weekly', priority: '0.8' },
  { path: '/contact', changefreq: 'monthly', priority: '0.7' },
  { path: '/shop', changefreq: 'daily', priority: '0.9' },
  { path: '/shop/digital-products', changefreq: 'weekly', priority: '0.8' },
  { path: '/shop/merch', changefreq: 'weekly', priority: '0.8' },
  { path: '/shop/bundles', changefreq: 'monthly', priority: '0.7' },
  { path: '/shop/partners', changefreq: 'monthly', priority: '0.6' },
  { path: '/photography', changefreq: 'monthly', priority: '0.7' },
  { path: '/video-production', changefreq: 'monthly', priority: '0.7' },
  { path: '/graphic-design', changefreq: 'monthly', priority: '0.7' },
  { path: '/development', changefreq: 'monthly', priority: '0.7' },
  { path: '/photo-editing', changefreq: 'monthly', priority: '0.7' },
]

const EXCLUDED_PATHS = new Set([
  '/admin', '/dashboard', '/profile', '/login', '/signup',
  '/checkout', '/cart', '/forgot-password', '/reset-password',
])

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function toLastmod(dateStr) {
  if (!dateStr) return new Date().toISOString()
  return new Date(dateStr).toISOString()
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/xml')
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400')

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('[Sitemap] Missing Supabase env vars')
    const xml = buildSitemap([], [], [], [])
    return res.status(200).send(xml)
  }

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const now = new Date().toISOString()

  const [blogResult, projectsResult, productsResult] = await Promise.all([
    adminClient
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('published', true)
      .order('updated_at', { ascending: false }),
    adminClient
      .from('projects')
      .select('slug, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false }),
    adminClient
      .from('products')
      .select('slug, updated_at')
      .eq('published', true)
      .order('updated_at', { ascending: false }),
  ])

  const blogPosts = (blogResult.data || []).filter(p => p.slug)
  const projects = (projectsResult.data || []).filter(p => p.slug)
  const products = (productsResult.data || []).filter(p => p.slug)

  const xml = buildSitemap(blogPosts, projects, products, now)
  return res.status(200).send(xml)
}

function buildSitemap(blogPosts, projects, products, now) {
  now = now || new Date().toISOString()

  const entries = []

  for (const route of STATIC_ROUTES) {
    entries.push(urlEntry(`${SITE_URL}${route.path}`, now, route.changefreq, route.priority))
  }

  for (const post of blogPosts) {
    if (EXCLUDED_PATHS.has(`/blog/${post.slug}`)) continue
    entries.push(urlEntry(
      `${SITE_URL}/blog/${escapeXml(post.slug)}`,
      toLastmod(post.updated_at),
      'weekly',
      '0.8',
    ))
  }

  for (const project of projects) {
    if (EXCLUDED_PATHS.has(`/projects/${project.slug}`)) continue
    entries.push(urlEntry(
      `${SITE_URL}/projects/${escapeXml(project.slug)}`,
      toLastmod(project.updated_at),
      'weekly',
      '0.9',
    ))
  }

  for (const product of products) {
    if (EXCLUDED_PATHS.has(`/shop/product/${product.slug}`)) continue
    entries.push(urlEntry(
      `${SITE_URL}/shop/product/${escapeXml(product.slug)}`,
      toLastmod(product.updated_at),
      'weekly',
      '0.8',
    ))
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`
}

function urlEntry(loc, lastmod, changefreq, priority) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}
