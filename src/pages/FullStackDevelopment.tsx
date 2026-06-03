import { getCategory } from '@/lib/categories'
import { CategoryPage } from '@/components/category/CategoryPage'

export default function FullStackDevelopment() {
  const category = getCategory('full-stack-development')!
  return <CategoryPage category={category} />
}
