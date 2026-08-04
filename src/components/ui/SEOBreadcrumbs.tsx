import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { SITE_URL } from '@/lib/seo'

export interface BreadcrumbItem {
  name: string
  path: string
}

interface SEOBreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function SEOBreadcrumbs({ items, className = '' }: SEOBreadcrumbsProps) {
  const allItems: BreadcrumbItem[] = [
    { name: 'Home', path: '/' },
    ...items,
  ]

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-gray-400 dark:text-white/40 ${className}`}
      >
        <ol className="flex items-center gap-1.5" itemScope itemType="https://schema.org/BreadcrumbList">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1
            return (
              <li
                key={item.path}
                className="flex items-center gap-1.5"
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                {index > 0 && (
                  <span className="text-gray-300 dark:text-white/20" aria-hidden="true">/</span>
                )}
                {isLast ? (
                  <span
                    className="text-brand-500 dark:text-brand-400"
                    itemProp="name"
                    aria-current="page"
                  >
                    {item.name}
                  </span>
                ) : (
                  <Link
                    to={item.path}
                    className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                    itemProp="item"
                  >
                    <span itemProp="name">{item.name}</span>
                  </Link>
                )}
                <meta itemProp="position" content={String(index + 1)} />
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
