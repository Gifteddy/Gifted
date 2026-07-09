import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'Gifted'
const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin
const DEFAULT_DESCRIPTION = 'Multidisciplinary creative technologist combining visual storytelling, design, engineering, and digital experiences.'
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`

interface MetaProps {
  title?: string
  description?: string
  image?: string
  url?: string
}

export function Meta({ title, description, image, url }: MetaProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Creative Technologist`
  const desc = description || DEFAULT_DESCRIPTION
  const img = image || DEFAULT_IMAGE
  const canonical = url || SITE_URL

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={img} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
    </Helmet>
  )
}
