import { getCategory } from '@/lib/categories'
import { CategoryPage } from '@/components/category/CategoryPage'

export default function FrontendDevelopment() {
  const category = getCategory('frontend-development')!
  return <CategoryPage category={category} />
}
