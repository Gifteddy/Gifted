import type { CategoryConfig } from '@/lib/categories'
import { Breadcrumbs } from './Breadcrumbs'
import { CategoryHero } from './CategoryHero'
import { CategoryServices } from './CategoryServices'
import { CategoryProjects } from './CategoryProjects'
import { CategoryProcess } from './CategoryProcess'
import { CategoryTestimonials } from './CategoryTestimonials'
import { CategoryCTA } from './CategoryCTA'

export function CategoryPage({ category }: { category: CategoryConfig }) {
  return (
    <main>
      <Breadcrumbs category={category.name} />
      <CategoryHero category={category} />
      <CategoryServices category={category} />
      <CategoryProjects category={category} />
      <CategoryProcess category={category} />
      <CategoryTestimonials category={category} />
      <CategoryCTA category={category} />
    </main>
  )
}
