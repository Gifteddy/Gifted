import { next } from '@vercel/edge'

export const SITE_NAME = 'Gifted'
export const SITE_URL = (process.env.VITE_SITE_URL || 'https://www.giftedcreates.com').replace(/\/+$/, '')
export const TWITTER_HANDLE = '@iheanyiibiam'

export const DEFAULT_DESCRIPTION = 'Multidisciplinary creative technologist combining visual storytelling, design, engineering, and digital experiences.'
export const DEFAULT_OG_IMAGE =
  'https://res.cloudinary.com/dr4fjf3a1/image/upload/f_auto,q_auto,w_1200,h_630,c_fill/v1785883565/Gifted_World_d9c1aa.jpg'

const CLOUDINARY_CLOUD_NAME = 'dr4fjf3a1'
const CLOUDINARY_UPLOAD_MARKER = '/image/upload/'
const OG_WIDTH = 1200
const OG_HEIGHT = 630

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || ''

export const CRAWLER_RE =
  /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Pinterest|redditbot|Googlebot|Google-InspectionTool|bingbot|DuckDuckBot|YandexBot|baiduspider|Sogou|Exabot|Applebot|Flipboard|embed.ly|outbrain|Tumblr|bitlybot|Slack-ImgProxy|Slackbot|Discordbot|WhatsApp|TelegramBot|vkShare|W3C_Validator|quora link preview|snapchat|SkypeUriPreview|facebookcatalog|Instagram|PetalBot|GPTBot|ChatGPT-User|CCBot|AhrefsBot|SemrushBot|MJ12bot|Lighthouse|PageSpeed/i

const ROUTES = [
  {
    re: /^\/blog\/([^/]+)\/?$/,
    table: 'blog_posts',
    fields: 'slug,title,excerpt,cover_image,created_at,updated_at',
    filters: { published: 'eq.true' },
    type: 'article',
  },
  {
    re: /^\/projects\/([^/]+)\/?$/,
    table: 'projects',
    fields: 'slug,title,description,thumbnail,gallery,created_at,updated_at',
    filters: { status: 'eq.published' },
    type: 'website',
  },
  {
    re: /^\/shop\/product\/([^/]+)\/?$/,
    table: 'products',
    fields: 'slug,title,short_description,description,thumbnail,price,sale_price,created_at,updated_at',
    filters: { published: 'eq.true' },
    type: 'product',
  },
]

const STATIC_META = {
  '/': {
    title: 'Home',
    description: 'Creative technologist combining visual storytelling, design, engineering, and digital experiences. Explore projects, shop, and more.',
  },
  '/about': {
    title: 'About',
    description: 'Learn about Gifted — a multidisciplinary creative technologist passionate about visual storytelling, design, photography, video production, and engineering.',
  },
  '/contact': {
    title: 'Contact',
    description: 'Get in touch with Gifted for collaborations, projects, photography, video production, graphic design, and development opportunities.',
  },
}

export function isCrawler(userAgent) {
  return typeof userAgent === 'string' && CRAWLER_RE.test(userAgent)
}

export function matchRoute(pathname) {
  for (const route of ROUTES) {
    const m = pathname.match(route.re)
    if (m) return { route, slug: decodeURIComponent(m[1]) }
  }
  return null
}

function isCloudinaryUrl(src) {
  return src.startsWith('https://res.cloudinary.com/') && src.includes(CLOUDINARY_UPLOAD_MARKER)
}

function optimizeCloudinaryUrl(src) {
  const idx = src.indexOf(CLOUDINARY_UPLOAD_MARKER)
  if (idx === -1) return src
  const rest = src.slice(idx + CLOUDINARY_UPLOAD_MARKER.length)
  const matches = [...rest.matchAll(/(?:^|\/)v\d{6,}\//g)]
  const last = matches[matches.length - 1]
  if (!last || last.index === undefined) return src
  const versionStart = last.index + (last[0].startsWith('/') ? 1 : 0)
  const tail = rest.slice(versionStart)
  if (!tail) return src
  return `${src.slice(0, idx + CLOUDINARY_UPLOAD_MARKER.length)}f_auto,q_auto,w_1200,h_630,c_fill/${tail}`
}

export function resolveBotImage(src) {
  if (!src || !src.trim()) {
    return { url: DEFAULT_OG_IMAGE, width: OG_WIDTH, height: OG_HEIGHT }
  }
  const value = src.trim()

  if (isCloudinaryUrl(value)) {
    return { url: optimizeCloudinaryUrl(value), width: OG_WIDTH, height: OG_HEIGHT }
  }
  if (/^https?:\/\//i.test(value)) {
    return { url: value }
  }
  if (/^data:/i.test(value) || value.startsWith('blob:')) {
    return { url: DEFAULT_OG_IMAGE, width: OG_WIDTH, height: OG_HEIGHT }
  }
  if (value.startsWith('/')) {
    return { url: `${SITE_URL}${value.startsWith('/') ? value : `/${value}`}` }
  }
  return {
    url: `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_1200,h_630,c_fill/${value}`,
    width: OG_WIDTH,
    height: OG_HEIGHT,
  }
}

export function buildRouteMeta(route, row, siteUrl = SITE_URL) {
  if (route.type === 'article') {
    const image = resolveBotImage(row.cover_image)
    return {
      title: row.title,
      description: row.excerpt || row.title,
      imageUrl: image.url,
      imageWidth: image.width,
      imageHeight: image.height,
      url: `${siteUrl}/blog/${row.slug}`,
      type: 'article',
      publishedAt: row.created_at,
      modifiedAt: row.updated_at,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: row.title,
        description: row.excerpt || row.title,
        image: image.url,
        url: `${siteUrl}/blog/${row.slug}`,
        datePublished: row.created_at || new Date().toISOString(),
        dateModified: row.updated_at || row.created_at || new Date().toISOString(),
        author: { '@type': 'Person', name: 'Ibiam Iheanyi Victory', url: siteUrl },
        publisher: { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: `${siteUrl}/favicon.png` } },
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}/blog/${row.slug}` },
      },
    }
  }

  if (route.type === 'product') {
    const image = resolveBotImage(row.thumbnail)
    const desc = row.short_description || (row.description ? String(row.description).slice(0, 160) : row.title)
    return {
      title: row.title,
      description: desc,
      imageUrl: image.url,
      imageWidth: image.width,
      imageHeight: image.height,
      url: `${siteUrl}/shop/product/${row.slug}`,
      type: 'product',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: row.title,
        description: desc,
        image: image.url,
        url: `${siteUrl}/shop/product/${row.slug}`,
        offers: {
          '@type': 'Offer',
          price: row.sale_price ?? row.price ?? 0,
          priceCurrency: 'NGN',
          availability: 'https://schema.org/InStock',
          url: `${siteUrl}/shop/product/${row.slug}`,
        },
        brand: { '@type': 'Brand', name: SITE_NAME },
      },
    }
  }

  const projectImage = row.thumbnail || (Array.isArray(row.gallery) && row.gallery.length ? row.gallery[0] : null)
  const image = resolveBotImage(projectImage)
  return {
    title: row.title,
    description: row.description || `View ${row.title} by Gifted — a creative project spanning design, development, and visual storytelling.`,
    imageUrl: image.url,
    imageWidth: image.width,
    imageHeight: image.height,
    url: `${siteUrl}/projects/${row.slug}`,
    type: 'website',
    publishedAt: row.created_at,
    modifiedAt: row.updated_at,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: row.title,
      description: row.description || `View ${row.title} by Gifted.`,
      image: image.url,
      url: `${siteUrl}/projects/${row.slug}`,
      author: { '@type': 'Person', name: 'Ibiam Iheanyi Victory', url: siteUrl },
    },
  }
}

const escapeHtml = (value) =>
  String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

export function buildSeoHtml(meta) {
  const fullTitle = meta.title ? `${meta.title} | ${SITE_NAME}` : `${SITE_NAME} | Creative Technologist`
  const desc = meta.description || DEFAULT_DESCRIPTION
  const img = meta.imageUrl || DEFAULT_OG_IMAGE
  const imageAlt = `${SITE_NAME} — ${meta.title || 'Creative Portfolio'}`
  const ogType = meta.type === 'article' ? 'article' : meta.type === 'product' ? 'product' : 'website'
  const width = meta.imageWidth ? `\n<meta property="og:image:width" content="${meta.imageWidth}" />` : ''
  const height = meta.imageHeight ? `\n<meta property="og:image:height" content="${meta.imageHeight}" />` : ''
  const published = meta.publishedAt ? `\n<meta property="article:published_time" content="${escapeHtml(meta.publishedAt)}" />` : ''
  const modified = meta.modifiedAt ? `\n<meta property="article:modified_time" content="${escapeHtml(meta.modifiedAt)}" />` : ''
  const jsonLd = meta.jsonLd
    ? `\n<script type="application/ld+json">${JSON.stringify(meta.jsonLd).replace(/</g, '\\u003c')}</script>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(fullTitle)}</title>
<meta name="description" content="${escapeHtml(desc)}" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="${escapeHtml(meta.url || SITE_URL)}" />
<meta name="author" content="Ibiam Iheanyi Victory" />
<meta name="application-name" content="${SITE_NAME}" />
<meta property="og:title" content="${escapeHtml(fullTitle)}" />
<meta property="og:description" content="${escapeHtml(desc)}" />
<meta property="og:image" content="${escapeHtml(img)}" />
<meta property="og:image:secure_url" content="${escapeHtml(img)}" />${width}${height}
<meta property="og:image:alt" content="${escapeHtml(imageAlt)}" />
<meta property="og:url" content="${escapeHtml(meta.url || SITE_URL)}" />
<meta property="og:site_name" content="${SITE_NAME}" />
<meta property="og:type" content="${ogType}" />
<meta property="og:locale" content="en_US" />${published}${modified}
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(fullTitle)}" />
<meta name="twitter:description" content="${escapeHtml(desc)}" />
<meta name="twitter:image" content="${escapeHtml(img)}" />
<meta name="twitter:image:alt" content="${escapeHtml(imageAlt)}" />
<meta name="twitter:site" content="${TWITTER_HANDLE}" />
<meta name="twitter:creator" content="${TWITTER_HANDLE}" />
<meta name="theme-color" content="#7700ff" />${jsonLd}
</head>
<body><h1>${escapeHtml(fullTitle)}</h1></body>
</html>`
}

async function queryItem({ table, slug, fields, filters }) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null
  const params = new URLSearchParams({ select: fields, slug: `eq.${slug}`, limit: '1' })
  for (const [key, value] of Object.entries(filters)) params.set(key, value)
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params.toString()}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Accept: 'application/json',
    },
  })
  if (!res.ok) return null
  const rows = await res.json()
  return Array.isArray(rows) && rows.length ? rows[0] : null
}

function botResponse(html) {
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=60',
      'Vary': 'User-Agent',
    },
  })
}

async function serveMatched(request, route, slug, url) {
  try {
    const row = await queryItem({ table: route.table, slug, fields: route.fields, filters: route.filters })
    if (!row) return next()
    return botResponse(buildSeoHtml(buildRouteMeta(route, row)))
  } catch {
    return next()
  }
}

export async function middleware(request) {
  const userAgent = request.headers.get('user-agent') || ''
  if (!isCrawler(userAgent)) return next()

  const url = new URL(request.url)
  const path = url.pathname

  const matched = matchRoute(path)
  if (matched) {
    return serveMatched(request, matched.route, matched.slug, url)
  }

  const stat = STATIC_META[path]
  if (stat) {
    return botResponse(
      buildSeoHtml({
        ...stat,
        imageUrl: DEFAULT_OG_IMAGE,
        imageWidth: OG_WIDTH,
        imageHeight: OG_HEIGHT,
        url: `${SITE_URL}${path === '/' ? '/' : path}`,
        type: 'website',
        jsonLd: null,
      }),
    )
  }

  return next()
}

export default middleware

export const config = {
  matcher: [
    '/((?!api/|assets/|favicon\\.png|og-image\\.jpg|robots\\.txt|sitemap\\.xml|manifest\\.json|sw\\.js|.*\\.(?:css|js|json|png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|eot|xml|txt|webmanifest|map)).*)',
  ],
}
