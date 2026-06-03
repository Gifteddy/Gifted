import { getCategory } from '@/lib/categories'
import { CategoryPage } from '@/components/category/CategoryPage'

export default function PhotoEditing() {
  const category = getCategory('photo-editing')!
  return <CategoryPage category={category} />
}
