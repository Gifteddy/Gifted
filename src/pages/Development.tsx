import { getCategory } from '@/lib/categories'
import { CategoryPage } from '@/components/category/CategoryPage'

export default function Development() {
  const category = getCategory('development')!
  return <CategoryPage category={category} />
}
