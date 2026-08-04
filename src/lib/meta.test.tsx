import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { Meta } from './meta'
import { resolveOgImage, SITE_URL, DEFAULT_OG_IMAGE } from './seo'

function renderWithHelmet(ui: React.ReactElement) {
  return render(<HelmetProvider>{ui}</HelmetProvider>)
}

describe('Meta', () => {
  it('sets the page title', () => {
    renderWithHelmet(<Meta title="Test Page" />)
    expect(document.title).toBe('Test Page | Gifted')
  })

  it('uses default title when none provided', () => {
    renderWithHelmet(<Meta />)
    expect(document.title).toBe('Gifted | Creative Technologist')
  })

  it('renders meta description', () => {
    renderWithHelmet(<Meta description="A test description" />)
    const meta = document.querySelector('meta[name="description"]')
    expect(meta?.getAttribute('content')).toBe('A test description')
  })

  it('uses default description when none provided', () => {
    renderWithHelmet(<Meta />)
    const meta = document.querySelector('meta[name="description"]')
    expect(meta?.getAttribute('content')).toContain('Multidisciplinary creative technologist')
  })

  it('renders canonical link', () => {
    renderWithHelmet(<Meta url="https://example.com/page" />)
    const link = document.querySelector('link[rel="canonical"]')
    expect(link?.getAttribute('href')).toBe('https://example.com/page')
  })

  it('generates a canonical from the path when no url is provided', () => {
    renderWithHelmet(<Meta />)
    const link = document.querySelector('link[rel="canonical"]')
    expect(link?.getAttribute('href')).toContain(SITE_URL)
  })

  it('renders Open Graph tags', () => {
    renderWithHelmet(<Meta title="OG Test" description="OG description" />)
    const ogTitle = document.querySelector('meta[property="og:title"]')
    const ogDesc = document.querySelector('meta[property="og:description"]')
    const ogType = document.querySelector('meta[property="og:type"]')
    expect(ogTitle?.getAttribute('content')).toBe('OG Test | Gifted')
    expect(ogDesc?.getAttribute('content')).toBe('OG description')
    expect(ogType?.getAttribute('content')).toBe('website')
  })

  it('sets og:type to product when type="product"', () => {
    renderWithHelmet(<Meta type="product" />)
    const ogType = document.querySelector('meta[property="og:type"]')
    expect(ogType?.getAttribute('content')).toBe('product')
  })

  it('sets og:type to article when type="article"', () => {
    renderWithHelmet(<Meta type="article" />)
    const ogType = document.querySelector('meta[property="og:type"]')
    expect(ogType?.getAttribute('content')).toBe('article')
  })

  it('renders Twitter card tags', () => {
    renderWithHelmet(<Meta />)
    const twitterCard = document.querySelector('meta[name="twitter:card"]')
    expect(twitterCard?.getAttribute('content')).toBe('summary_large_image')
  })

  it('includes og:image:alt', () => {
    renderWithHelmet(<Meta title="Test" />)
    const imgAlt = document.querySelector('meta[property="og:image:alt"]')
    expect(imgAlt?.getAttribute('content')).toContain('Test')
  })

  it('renders JSON-LD script tag', () => {
    const jsonLd = { '@context': 'https://schema.org', '@type': 'Product', name: 'Test' }
    renderWithHelmet(<Meta jsonLd={jsonLd} />)
    const scripts = document.querySelectorAll('script[type="application/ld+json"]')
    expect(scripts.length).toBeGreaterThan(0)
    expect([...scripts].some(s => s.textContent?.includes('Product'))).toBe(true)
  })

  it('renders default Person JSON-LD on website type', () => {
    renderWithHelmet(<Meta />)
    const scripts = document.querySelectorAll('script[type="application/ld+json"]')
    expect([...scripts].some(s => s.textContent?.includes('"@type":"Person"'))).toBe(true)
    expect([...scripts].some(s => s.textContent?.includes('Creative Technologist'))).toBe(true)
  })

  it('uses the Cloudinary brand image by default', () => {
    renderWithHelmet(<Meta />)
    const ogImage = document.querySelector('meta[property="og:image"]')
    const twitterImage = document.querySelector('meta[name="twitter:image"]')
    expect(ogImage?.getAttribute('content')).toBe(DEFAULT_OG_IMAGE)
    expect(twitterImage?.getAttribute('content')).toBe(DEFAULT_OG_IMAGE)
  })

  it('emits og:image:secure_url, width and height for the default image', () => {
    renderWithHelmet(<Meta />)
    const secure = document.querySelector('meta[property="og:image:secure_url"]')
    const width = document.querySelector('meta[property="og:image:width"]')
    const height = document.querySelector('meta[property="og:image:height"]')
    expect(secure?.getAttribute('content')).toBe(DEFAULT_OG_IMAGE)
    expect(width?.getAttribute('content')).toBe('1200')
    expect(height?.getAttribute('content')).toBe('630')
  })

  it('uses a page cover image over the default', () => {
    renderWithHelmet(<Meta image="https://example.com/cover.jpg" />)
    const ogImage = document.querySelector('meta[property="og:image"]')
    expect(ogImage?.getAttribute('content')).toBe('https://example.com/cover.jpg')
  })

  it('optimizes Cloudinary cover images to 1200x630', () => {
    renderWithHelmet(<Meta image="https://res.cloudinary.com/dr4fjf3a1/image/upload/v1785883565/some_asset.jpg" />)
    const ogImage = document.querySelector('meta[property="og:image"]')
    const width = document.querySelector('meta[property="og:image:width"]')
    const height = document.querySelector('meta[property="og:image:height"]')
    expect(ogImage?.getAttribute('content')).toContain('w_1200,h_630,c_fill')
    expect(ogImage?.getAttribute('content')).toContain('some_asset.jpg')
    expect(width?.getAttribute('content')).toBe('1200')
    expect(height?.getAttribute('content')).toBe('630')
  })

  it('renders noindex when requested', () => {
    renderWithHelmet(<Meta noindex />)
    const robots = document.querySelector('meta[name="robots"]')
    expect(robots?.getAttribute('content')).toBe('noindex, follow')
  })

  it('skips default org/person JSON-LD on noindex pages', () => {
    renderWithHelmet(<Meta noindex />)
    const scripts = document.querySelectorAll('script[type="application/ld+json"]')
    expect(scripts.length).toBe(0)
  })
})

describe('resolveOgImage', () => {
  it('falls back to the brand image when empty', () => {
    expect(resolveOgImage()).toEqual({ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 })
    expect(resolveOgImage('')).toEqual({ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 })
    expect(resolveOgImage(null)).toEqual({ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 })
  })

  it('keeps non-Cloudinary absolute URLs as-is', () => {
    expect(resolveOgImage('https://example.com/img.png')).toEqual({ url: 'https://example.com/img.png' })
  })

  it('resolves bare Cloudinary public IDs to optimized URLs', () => {
    const result = resolveOgImage('Gifted_World_d9c1aa.jpg')
    expect(result.url).toBe('https://res.cloudinary.com/dr4fjf3a1/image/upload/f_auto,q_auto,w_1200,h_630,c_fill/Gifted_World_d9c1aa.jpg')
    expect(result.width).toBe(1200)
    expect(result.height).toBe(630)
  })

  it('resolves bare public IDs with folders', () => {
    const result = resolveOgImage('projects/awesome-cover.jpg')
    expect(result.url).toBe('https://res.cloudinary.com/dr4fjf3a1/image/upload/f_auto,q_auto,w_1200,h_630,c_fill/projects/awesome-cover.jpg')
  })

  it('rewrites versioned Cloudinary URLs to optimized versions', () => {
    const result = resolveOgImage('https://res.cloudinary.com/dr4fjf3a1/image/upload/w_400/v1785883565/Gifted_World_d9c1aa.jpg')
    expect(result.url).toBe('https://res.cloudinary.com/dr4fjf3a1/image/upload/f_auto,q_auto,w_1200,h_630,c_fill/v1785883565/Gifted_World_d9c1aa.jpg')
    expect(result.width).toBe(1200)
    expect(result.height).toBe(630)
  })

  it('makes relative paths absolute', () => {
    const result = resolveOgImage('/me/1.jpg')
    expect(result.url).toBe(`${SITE_URL}/me/1.jpg`)
  })

  it('ignores data/blob sources and falls back to the brand image', () => {
    expect(resolveOgImage('data:image/png;base64,abc').url).toBe(DEFAULT_OG_IMAGE)
    expect(resolveOgImage('blob:http://localhost/x').url).toBe(DEFAULT_OG_IMAGE)
  })
})
