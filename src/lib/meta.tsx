import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'Gifted'
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://giftedcreates.com'
const DEFAULT_DESCRIPTION = 'Multidisciplinary creative technologist combining visual storytelling, design, engineering, and digital experiences.'
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`
const SITE_LOGO = `${SITE_URL}/favicon.png`

export type MetaType = 'website' | 'article' | 'product' | 'profile'

interface BreadcrumbItem {
  name: string
  path: string
}

interface MetaProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: MetaType
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
  publishedAt?: string
  modifiedAt?: string
  author?: string
  keywords?: string[]
  breadcrumbs?: BreadcrumbItem[]
  noindex?: boolean
  nofollow?: boolean
}

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Gifted',
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
    name: 'Gifted',
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
    alternateName: 'Gifted',
    url: SITE_URL,
    jobTitle: 'Creative Technologist',
    description: DEFAULT_DESCRIPTION,
    image: DEFAULT_IMAGE,
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
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description,
    image: article.image || DEFAULT_IMAGE,
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
      name: 'Gifted',
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
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.image || DEFAULT_IMAGE,
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
      name: 'Gifted',
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
    image: DEFAULT_IMAGE,
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

export function Meta({
  title,
  description,
  image,
  url,
  type = 'website',
  jsonLd,
  publishedAt,
  modifiedAt,
  author,
  keywords,
  breadcrumbs,
  noindex,
  nofollow,
}: MetaProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Creative Technologist`
  const desc = description || DEFAULT_DESCRIPTION
  const img = image || DEFAULT_IMAGE
  const canonical = url || `${SITE_URL}${typeof window !== 'undefined' ? window.location.pathname : ''}`

  const robotsContent = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow',
  ].join(', ')

  const schemas: Record<string, unknown>[] = []

  if (type === 'website') {
    schemas.push(buildOrganizationSchema(), buildWebsiteSchema(), buildPersonSchema())
  }

  if (breadcrumbs && breadcrumbs.length > 0) {
    schemas.push(buildBreadcrumbSchema(breadcrumbs))
  }

  if (jsonLd) {
    if (Array.isArray(jsonLd)) {
      schemas.push(...jsonLd)
    } else {
      schemas.push(jsonLd)
    }
  }

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={canonical} />
      <meta name="author" content={author || 'Ibiam Iheanyi Victory'} />
      <meta name="application-name" content="Gifted" />
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={img} />
      <meta property="og:image:alt" content={`${SITE_NAME} — ${title || 'Creative Portfolio'}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type === 'article' ? 'article' : type === 'product' ? 'product' : 'website'} />
      <meta property="og:locale" content="en_US" />
      {publishedAt && <meta property="article:published_time" content={publishedAt} />}
      {modifiedAt && <meta property="article:modified_time" content={modifiedAt} />}
      {author && <meta property="article:author" content={author} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
      <meta name="twitter:image:alt" content={`${SITE_NAME} — ${title || 'Creative Portfolio'}`} />
      <meta name="twitter:site" content="@iheanyiibiam" />
      <meta name="twitter:creator" content="@iheanyiibiam" />

      {/* Additional */}
      <meta name="theme-color" content="#7700ff" />
      <meta name="msapplication-TileColor" content="#7700ff" />

      {/* Structured Data */}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(schema)}</script>
      ))}
    </Helmet>
  )
}
