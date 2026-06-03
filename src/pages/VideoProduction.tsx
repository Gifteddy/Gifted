import { getCategory } from '@/lib/categories'
import { CategoryPage } from '@/components/category/CategoryPage'

export default function VideoProduction() {
  const category = getCategory('video-production')!
  return <CategoryPage category={category} />
}
