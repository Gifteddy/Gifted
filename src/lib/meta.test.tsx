import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { Meta } from './meta'

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
    const script = document.querySelector('script[type="application/ld+json"]')
    expect(script).toBeTruthy()
    expect(script?.textContent).toContain('Product')
  })

  it('renders default Person JSON-LD on website type', () => {
    renderWithHelmet(<Meta />)
    const script = document.querySelector('script[type="application/ld+json"]')
    expect(script?.textContent).toContain('Person')
    expect(script?.textContent).toContain('Creative Technologist')
  })
})
