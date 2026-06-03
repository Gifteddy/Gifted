import { getCategory } from '@/lib/categories'
import { CategoryPage } from '@/components/category/CategoryPage'

export default function AiEnthusiast() {
  const category = getCategory('ai-enthusiast')!
  return <CategoryPage category={category} />
}
