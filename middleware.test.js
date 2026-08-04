import { describe, it, expect } from 'vitest'
import {
  isCrawler,
  matchRoute,
  resolveBotImage,
  buildRouteMeta,
  buildSeoHtml,
  SITE_URL,
  DEFAULT_OG_IMAGE,
} from './middleware.js'

describe('bot detection', () => {
  it('detects social crawlers and search engine bots', () => {
    expect(isCrawler('facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)')).toBe(true)
    expect(isCrawler('Twitterbot/1.0')).toBe(true)
    expect(isCrawler('LinkedInBot/1.0 (compatible; Mozilla/5.0...)')).toBe(true)
    expect(isCrawler('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')).toBe(true)
    expect(isCrawler('WhatsApp/2.23.20.0')).toBe(true)
    expect(isCrawler('Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)')).toBe(true)
  })

  it('ignores regular browsers', () => {
    expect(isCrawler('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36')).toBe(false)
    expect(isCrawler('')).toBe(false)
    expect(isCrawler(undefined)).toBe(false)
  })
})

describe('route matching', () => {
  it('matches blog, project, and product detail paths', () => {
    expect(matchRoute('/blog/hello-world')?.route.table).toBe('blog_posts')
    expect(matchRoute('/blog/hello-world')?.slug).toBe('hello-world')
    expect(matchRoute('/projects/rebrand')?.route.table).toBe('projects')
    expect(matchRoute('/shop/product/my-product')?.route.table).toBe('products')
    expect(matchRoute('/blog/hello-world/')?.slug).toBe('hello-world')
  })

  it('returns null for non-detail paths', () => {
    expect(matchRoute('/')).toBe(null)
    expect(matchRoute('/about')).toBe(null)
    expect(matchRoute('/blog')).toBe(null)
    expect(matchRoute('/admin/login')).toBe(null)
  })
})

describe('resolveBotImage', () => {
  it('falls back to the default card for empty input', () => {
    expect(resolveBotImage(undefined)).toEqual({ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 })
    expect(resolveBotImage('')).toEqual({ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 })
    expect(resolveBotImage('data:image/png;base64,abc')).toEqual({ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 })
    expect(resolveBotImage('blob:https://x/y')).toEqual({ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 })
  })

  it('optimizes Cloudinary URLs to 1200x630', () => {
    const out = resolveBotImage('https://res.cloudinary.com/dr4fjf3a1/image/upload/w_400/v1785883565/Gifted_World_d9c1aa.jpg')
    expect(out.url).toBe(
      'https://res.cloudinary.com/dr4fjf3a1/image/upload/f_auto,q_auto,w_1200,h_630,c_fill/v1785883565/Gifted_World_d9c1aa.jpg',
    )
    expect(out.width).toBe(1200)
    expect(out.height).toBe(630)
  })

  it('turns a bare public ID into an optimized Cloudinary URL', () => {
    const out = resolveBotImage('folder/my-image')
    expect(out.url).toContain('/image/upload/f_auto,q_auto,w_1200,h_630,c_fill/folder/my-image')
  })

  it('passes through absolute non-Cloudinary URLs and resolves relative paths', () => {
    expect(resolveBotImage('https://cdn.example.com/pic.jpg').url).toBe('https://cdn.example.com/pic.jpg')
    expect(resolveBotImage('/images/pic.jpg').url).toBe(`${SITE_URL}/images/pic.jpg`)
  })
})

describe('buildRouteMeta', () => {
  it('builds blog post meta with the cover image', () => {
    const route = matchRoute('/blog/hello').route
    const meta = buildRouteMeta(route, {
      slug: 'hello',
      title: 'Hello World',
      excerpt: 'An excerpt',
      cover_image: 'https://res.cloudinary.com/dr4fjf3a1/image/upload/w_400/v1785883565/a/b',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-02-01T00:00:00Z',
    })
    expect(meta.type).toBe('article')
    expect(meta.title).toBe('Hello World')
    expect(meta.url).toBe(`${SITE_URL}/blog/hello`)
    expect(meta.imageUrl).toContain('f_auto,q_auto,w_1200,h_630,c_fill')
    expect(meta.jsonLd['@type']).toBe('BlogPosting')
  })

  it('builds project meta using thumbnail or first gallery image', () => {
    const route = matchRoute('/projects/x').route
    const withThumb = buildRouteMeta(route, { slug: 'x', title: 'X', thumbnail: 'pic' })
    expect(withThumb.url).toBe(`${SITE_URL}/projects/x`)
    expect(withThumb.imageUrl).toContain('/pic')
    const withGallery = buildRouteMeta(route, { slug: 'x', title: 'X', thumbnail: null, gallery: ['a', 'b'] })
    expect(withGallery.imageUrl).toContain('/a')
  })

  it('builds product meta with the thumbnail', () => {
    const route = matchRoute('/shop/product/p').route
    const meta = buildRouteMeta(route, { slug: 'p', title: 'Product', short_description: 'Short', thumbnail: 'pic', price: 5000, sale_price: 4500 })
    expect(meta.type).toBe('product')
    expect(meta.url).toBe(`${SITE_URL}/shop/product/p`)
    expect(meta.jsonLd['@type']).toBe('Product')
    expect(meta.jsonLd.offers.price).toBe(4500)
  })
})

describe('buildSeoHtml', () => {
  const html = buildSeoHtml({
    title: 'Hello & World',
    description: 'A <b>test</b>',
    imageUrl: 'https://example.com/og.jpg',
    imageWidth: 1200,
    imageHeight: 630,
    url: `${SITE_URL}/blog/hello`,
    type: 'article',
    jsonLd: { '@context': 'https://schema.org', '@type': 'BlogPosting' },
  })

  it('emits title, canonical, and description', () => {
    expect(html).toContain('<title>Hello &amp; World | Gifted</title>')
    expect(html).toContain(`<link rel="canonical" href="${SITE_URL}/blog/hello" />`)
    expect(html).toContain('A &lt;b&gt;test&lt;/b&gt;')
  })

  it('emits full Open Graph and Twitter tags', () => {
    expect(html).toContain('<meta property="og:image" content="https://example.com/og.jpg" />')
    expect(html).toContain('<meta property="og:image:secure_url" content="https://example.com/og.jpg" />')
    expect(html).toContain('<meta property="og:image:width" content="1200" />')
    expect(html).toContain('<meta property="og:image:height" content="630" />')
    expect(html).toContain('<meta property="og:type" content="article" />')
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />')
    expect(html).toContain('<meta name="twitter:image" content="https://example.com/og.jpg" />')
  })

  it('embeds JSON-LD safely', () => {
    expect(html).toContain('application/ld+json')
    expect(html).toContain('"@type":"BlogPosting"')
  })
})
