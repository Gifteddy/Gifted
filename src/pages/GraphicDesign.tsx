import { getCategory } from '@/lib/categories'
import { CategoryPage } from '@/components/category/CategoryPage'

export default function GraphicDesign() {
  const category = getCategory('graphic-design')!
  return <CategoryPage category={category} />
}
