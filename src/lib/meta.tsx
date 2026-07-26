import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'Gifted'
const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin
const DEFAULT_DESCRIPTION = 'Multidisciplinary creative technologist combining visual storytelling, design, engineering, and digital experiences.'
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`

export type MetaType = 'website' | 'article' | 'product' | 'profile'

interface MetaProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: MetaType
  jsonLd?: Record<string, unknown>
}

export function Meta({ title, description, image, url, type = 'website', jsonLd }: MetaProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Creative Technologist`
  const desc = description || DEFAULT_DESCRIPTION
  const img = image || DEFAULT_IMAGE
  const canonical = url || `${SITE_URL}${window.location.pathname}`

  const defaultJsonLd = type === 'website' ? {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Gifted',
    url: SITE_URL,
    jobTitle: 'Creative Technologist',
    description: desc,
    image: img,
    sameAs: [],
  } : undefined

  const schema = jsonLd || defaultJsonLd

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={img} />
      <meta property="og:image:alt" content={`${SITE_NAME} — ${title || 'Creative Portfolio'}`} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content="en_US" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
      <meta name="twitter:image:alt" content={`${SITE_NAME} — ${title || 'Creative Portfolio'}`} />
      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  )
}
