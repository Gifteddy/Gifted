import { Helmet } from 'react-helmet-async'
import {
  SITE_NAME,
  SITE_URL,
  TWITTER_HANDLE,
  resolveOgImage,
  buildOrganizationSchema,
  buildWebsiteSchema,
  buildPersonSchema,
  buildBreadcrumbSchema,
  type MetaType,
  type BreadcrumbItem,
} from './seo'

const DEFAULT_DESCRIPTION = 'Multidisciplinary creative technologist combining visual storytelling, design, engineering, and digital experiences.'

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
  const resolvedImage = resolveOgImage(image)
  const img = resolvedImage.url
  const canonical = url || `${SITE_URL}${typeof window !== 'undefined' ? window.location.pathname : '/'}`
  const imageAlt = `${SITE_NAME} — ${title || 'Creative Portfolio'}`

  const robotsContent = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow',
  ].join(', ')

  const schemas: Record<string, unknown>[] = []

  if (type === 'website' && !noindex) {
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
      <meta name="application-name" content={SITE_NAME} />
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={img} />
      <meta property="og:image:secure_url" content={img} />
      {resolvedImage.width && <meta property="og:image:width" content={String(resolvedImage.width)} />}
      {resolvedImage.height && <meta property="og:image:height" content={String(resolvedImage.height)} />}
      <meta property="og:image:alt" content={imageAlt} />
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
      <meta name="twitter:image:alt" content={imageAlt} />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:creator" content={TWITTER_HANDLE} />

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
