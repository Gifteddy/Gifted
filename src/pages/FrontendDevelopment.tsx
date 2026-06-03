import { getCategory } from '@/lib/categories'
import { CategoryPage } from '@/components/category/CategoryPage'

export default function FrontendDevelopment() {
  const category = getCategory('development')
  if (!category) return null
  return <CategoryPage category={category} />
}
