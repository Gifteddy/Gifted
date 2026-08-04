export const SITE_NAME = 'Gifted'
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://www.giftedcreates.com').replace(/\/+$/, '')
export const TWITTER_HANDLE = '@iheanyiibiam'

const DEFAULT_DESCRIPTION = 'Multidisciplinary creative technologist combining visual storytelling, design, engineering, and digital experiences.'
const SITE_LOGO = `${SITE_URL}/favicon.png`

/** Source-of-truth brand image (as provided). */
export const DEFAULT_OG_IMAGE_SOURCE = 'https://res.cloudinary.com/dr4fjf3a1/image/upload/w_400/v1785883565/Gifted_World_d9c1aa.jpg'

/** Optimized 1200x630 social-card version of the brand image. */
export const DEFAULT_OG_IMAGE =
  'https://res.cloudinary.com/dr4fjf3a1/image/upload/f_auto,q_auto,w_1200,h_630,c_fill/v1785883565/Gifted_World_d9c1aa.jpg'

export const OG_IMAGE_WIDTH = 1200
export const OG_IMAGE_HEIGHT = 630

export const CLOUDINARY_CLOUD_NAME = 'dr4fjf3a1'
const CLOUDINARY_UPLOAD_MARKER = '/image/upload/'

export interface ResolvedImage {
  url: string
  width?: number
  height?: number
}

function isCloudinaryUrl(src: string): boolean {
  return src.startsWith('https://res.cloudinary.com/') && src.includes(CLOUDINARY_UPLOAD_MARKER)
}

/**
 * Rebuild a Cloudinary URL so it always serves an optimized, known-size
 * 1200x630 card. Handles URLs that already carry transformations and a version.
 * Falls back to the original URL when a public ID cannot be extracted safely.
 */
function optimizeCloudinaryUrl(src: string): string {
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

function toAbsoluteUrl(src: string): string {
  if (/^https?:\/\//i.test(src)) return src
  return `${SITE_URL}${src.startsWith('/') ? src : `/${src}`}`
}

/**
 * Resolve a page cover image into an absolute, optimized URL suitable for
 * og:image / twitter:image. Never returns an empty image.
 */
export function resolveOgImage(src?: string | null): ResolvedImage {
  if (!src || !src.trim()) {
    return { url: DEFAULT_OG_IMAGE, width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT }
  }

  const value = src.trim()

  if (isCloudinaryUrl(value)) {
    return { url: optimizeCloudinaryUrl(value), width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT }
  }

  if (/^https?:\/\//i.test(value)) {
    return { url: value }
  }

  if (/^data:/i.test(value) || value.startsWith('blob:')) {
    return { url: DEFAULT_OG_IMAGE, width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT }
  }

  if (value.startsWith('/')) {
    return { url: toAbsoluteUrl(value) }
  }

  // Bare Cloudinary public ID (may include folders).
  return {
    url: `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_1200,h_630,c_fill/${value}`,
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
  }
}

export type MetaType = 'website' | 'article' | 'product' | 'profile'

export interface BreadcrumbItem {
  name: string
  path: string
}

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: SITE_LOGO,
      width: 180,
      height: 180,
    },
    description: DEFAULT_DESCRIPTION,
    sameAs: [
      'https://github.com/Gifteddy/',
      'https://web.facebook.com/iheanyi.ibiam.3/',
      'https://www.instagram.com/iheanyiibiam1/',
      'https://www.tiktok.com/@iheanyiibiam',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'ibiamiheanyi@gmail.com',
      availableLanguage: 'English',
    },
  }
}

export function buildWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function buildPersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Ibiam Iheanyi Victory',
    alternateName: SITE_NAME,
    url: SITE_URL,
    jobTitle: 'Creative Technologist',
    description: DEFAULT_DESCRIPTION,
    image: DEFAULT_OG_IMAGE,
    sameAs: [
      'https://github.com/Gifteddy/',
      'https://web.facebook.com/iheanyi.ibiam.3/',
      'https://www.instagram.com/iheanyiibiam1/',
      'https://www.tiktok.com/@iheanyiibiam',
    ],
    knowsAbout: [
      'Photography', 'Video Production', 'Graphic Design',
      'Web Development', 'Photo Editing', 'React', 'TypeScript',
      'Supabase', 'Creative Strategy', 'Visual Storytelling',
    ],
  }
}

export function buildArticleSchema(article: {
  title: string
  description: string
  image?: string
  url: string
  publishedAt?: string
  modifiedAt?: string
  author?: string
}) {
  const image = resolveOgImage(article.image)
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description,
    image: image.url,
    url: article.url,
    datePublished: article.publishedAt || new Date().toISOString(),
    dateModified: article.modifiedAt || article.publishedAt || new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: article.author || 'Ibiam Iheanyi Victory',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: SITE_LOGO,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
  }
}

export function buildProductSchema(product: {
  title: string
  description: string
  image?: string
  price: number
  salePrice?: number | null
  currency?: string
  url: string
  availability?: string
  rating?: number
  reviewCount?: number
}) {
  const image = resolveOgImage(product.image)
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: image.url,
    url: product.url,
    offers: {
      '@type': 'Offer',
      price: product.salePrice || product.price,
      priceCurrency: product.currency || 'NGN',
      availability: product.availability || 'https://schema.org/InStock',
      url: product.url,
    },
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
  }

  if (product.rating && product.reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    }
  }

  return schema
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}

export function buildLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'Gifted — Creative Technologist',
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    image: DEFAULT_OG_IMAGE,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'NG',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 5.45,
      longitude: 7.49,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'ibiamiheanyi@gmail.com',
    },
    sameAs: [
      'https://github.com/Gifteddy/',
      'https://web.facebook.com/iheanyi.ibiam.3/',
      'https://www.instagram.com/iheanyiibiam1/',
    ],
  }
}
