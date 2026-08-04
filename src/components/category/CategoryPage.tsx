import type { CategoryConfig } from '@/lib/categories'
import { Breadcrumbs } from './Breadcrumbs'
import { CategoryHero } from './CategoryHero'
import { CategoryServices } from './CategoryServices'
import { CategoryProjects } from './CategoryProjects'
import { CategoryProcess } from './CategoryProcess'
import { CategoryTestimonials } from './CategoryTestimonials'
import { CategoryCTA } from './CategoryCTA'
import { SEOBreadcrumbs } from '@/components/ui/SEOBreadcrumbs'
import { Meta } from '@/lib/meta'
import { SITE_URL } from '@/lib/seo'

export function CategoryPage({ category }: { category: CategoryConfig }) {
  return (
    <div>
      <Meta
        title={category.seo.title}
        description={category.seo.description}
        keywords={[category.name, category.seo.title, 'creative services', 'gifted']}
        breadcrumbs={[{ name: category.name, path: `/${category.slug}` }]}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: category.seo.title,
          description: category.seo.description,
          provider: {
            '@type': 'Person',
            name: 'Ibiam Iheanyi Victory',
            alternateName: 'Gifted',
          },
          url: `${SITE_URL}/${category.slug}`,
          serviceType: category.name,
          areaServed: 'NG',
        }}
      />
      <div className="px-4 pt-20">
        <SEOBreadcrumbs
          items={[
            { name: 'Services', path: '/services' },
            { name: category.name, path: `/${category.slug}` },
          ]}
        />
      </div>
      <Breadcrumbs category={category.name} />
      <CategoryHero category={category} />
      <CategoryServices category={category} />
      <CategoryProjects category={category} />
      <CategoryProcess category={category} />
      <CategoryTestimonials category={category} />
      <CategoryCTA category={category} />
    </div>
  )
}
