import { getCategory } from '@/lib/categories'
import { CategoryPage } from '@/components/category/CategoryPage'

export default function Photography() {
  const category = getCategory('photography')!
  return <CategoryPage category={category} />
}
