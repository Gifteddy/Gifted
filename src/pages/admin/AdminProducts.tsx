import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate, cn } from '@/lib/utils'
import type { Product, ProductVariant } from '@/lib/commerce-types'
import { getCategoryConfig, categoryConfigs } from '@/lib/product-attributes'
import type { AttributeDef } from '@/lib/product-attributes'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type EditorMode = 'create' | 'edit' | null
type ProductTypeFilter = 'all' | 'digital' | 'physical' | 'bundle'

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editorMode, setEditorMode] = useState<EditorMode>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<ProductTypeFilter>('all')
  const [_activeId, setActiveId] = useState<string | null>(null)
  const [reorderSaving, setReorderSaving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('display_order', { ascending: true, nullsFirst: false })
        .limit(500)
      setProducts((data || []) as Product[])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadProducts() }, [loadProducts])

  const saveDisplayOrder = async (ordered: Product[]) => {
    setReorderSaving(true)
    try {
      await Promise.all(
        ordered.map((p, i) =>
          supabase.from('products').update({ display_order: i + 1 }).eq('id', p.id)
        )
      )
    } catch {
      loadProducts()
    } finally {
      setReorderSaving(false)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return

    const oldIndex = products.findIndex(p => p.id === active.id)
    const newIndex = products.findIndex(p => p.id === over.id)
    const reordered = arrayMove(products, oldIndex, newIndex)
    const updated = reordered.map((p, i) => ({ ...p, display_order: i + 1 }))
    setProducts(updated as Product[])
    saveDisplayOrder(updated)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('products').delete().eq('id', id)
    setDeleteId(null)
    const remaining = products.filter(p => p.id !== id).map((p, i) => ({ ...p, display_order: i + 1 }))
    setProducts(remaining as Product[])
    saveDisplayOrder(remaining)
  }

  const handleDuplicate = async (product: Product) => {
    const { id, created_at, updated_at, ...rest } = product
    const dup = { ...rest, title: `${product.title} (Copy)`, slug: `${product.slug}-copy`, published: false, display_order: products.length + 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    await supabase.from('products').insert(dup)
    loadProducts()
  }

  const handleTogglePublished = async (product: Product) => {
    await supabase.from('products').update({ published: !product.published, updated_at: new Date().toISOString() }).eq('id', product.id)
    loadProducts()
  }

  const handleToggleFeatured = async (product: Product) => {
    await supabase.from('products').update({ featured: !product.featured, updated_at: new Date().toISOString() }).eq('id', product.id)
    loadProducts()
  }

  const typeTabs: { key: ProductTypeFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'digital', label: 'Digital' },
    { key: 'physical', label: 'Physical' },
    { key: 'bundle', label: 'Bundle' },
  ]

  const filtered = products.filter(p => {
    const matchesSearch = !search || p.title.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'all' || p.type === typeFilter
    return matchesSearch && matchesType
  })
  const isSearching = search.trim().length > 0
  const nextDisplayOrder = products.length > 0 ? Math.max(...products.map(p => p.display_order)) + 1 : 1

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white/90">Products</h1>
        <button onClick={() => { setEditorMode('create'); setEditId(null) }} className="w-full sm:w-auto admin-btn-primary">
          New Product
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..." className="w-full sm:max-w-xs admin-input" />
        <div className="flex items-center gap-1 rounded-xl bg-black/[0.03] p-0.5 dark:bg-white/[0.03]">
          {typeTabs.map(tab => (
            <button key={tab.key} onClick={() => setTypeFilter(tab.key)}
              className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                typeFilter === tab.key
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-[#1a1a2e] dark:text-white/90'
                  : 'text-gray-500 hover:text-gray-700 dark:text-white/50 dark:hover:text-white/80'
              )}>
              {tab.label}
            </button>
          ))}
        </div>
        {reorderSaving && (
          <span className="text-xs text-gray-400 dark:text-white/30">Saving order...</span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7700ff] border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center rounded-2xl p-12 text-center admin-glass">
          <p className="text-sm text-gray-500 dark:text-white/40">
            {search ? 'No products match your search.' : 'No products yet. Create your first product.'}
          </p>
        </div>
      ) : isSearching || typeFilter !== 'all' ? (
        <div className="space-y-2">
          {filtered.map(product => (
            <ProductCardBase key={product.id} product={product}
              onTogglePublished={handleTogglePublished} onToggleFeatured={handleToggleFeatured}
              onEdit={(id) => { setEditorMode('edit'); setEditId(id) }}
              onDelete={(id) => setDeleteId(id)}
              onDuplicate={handleDuplicate} />
          ))}
          {filtered.length < products.length && (
            <p className="pt-2 text-center text-xs text-gray-400 dark:text-white/30">
              Showing {filtered.length} of {products.length} products. Clear filters to reorder.
            </p>
          )}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={products.map(p => p.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {products.map(product => (
                <SortableProductCard key={product.id} product={product}
                  onTogglePublished={handleTogglePublished} onToggleFeatured={handleToggleFeatured}
                  onEdit={(id) => { setEditorMode('edit'); setEditId(id) }}
                  onDelete={(id) => setDeleteId(id)}
                  onDuplicate={handleDuplicate} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {editorMode && (
        <ProductEditor productId={editId} onClose={() => { setEditorMode(null); setEditId(null) }}
          onSaved={() => { setEditorMode(null); setEditId(null); loadProducts() }}
          nextDisplayOrder={nextDisplayOrder} />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl p-6 admin-glass-strong">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white/90">Delete Product</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-white/40">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="rounded-xl px-4 py-2 text-sm text-gray-500 transition-colors hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SortableProductCard({ product, onTogglePublished, onToggleFeatured, onEdit, onDelete, onDuplicate }: {
  product: Product
  onTogglePublished: (p: Product) => void; onToggleFeatured: (p: Product) => void
  onEdit: (id: string) => void; onDelete: (id: string) => void; onDuplicate: (p: Product) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: product.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 50 : 'auto' as const,
  }

  return (
    <div ref={setNodeRef} style={style}
      className={cn('relative overflow-hidden rounded-2xl p-4 transition-all hover:scale-[1.002] admin-glass',
        isDragging && 'shadow-xl shadow-black/20 dark:shadow-black/40 scale-[1.01]')}>
      <ProductCardContent product={product}
        onTogglePublished={onTogglePublished} onToggleFeatured={onToggleFeatured}
        onEdit={onEdit} onDelete={onDelete} onDuplicate={onDuplicate}
        dragHandle={<button {...attributes} {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none text-gray-400 hover:text-gray-600 dark:text-white/30 dark:hover:text-white/50"
          title="Drag to reorder">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zm-6 5h2v2H8v-2zm6 0h2v2h-2v-2z"/></svg>
        </button>} />
    </div>
  )
}

function ProductCardBase({ product, onTogglePublished, onToggleFeatured, onEdit, onDelete, onDuplicate }: {
  product: Product
  onTogglePublished: (p: Product) => void; onToggleFeatured: (p: Product) => void
  onEdit: (id: string) => void; onDelete: (id: string) => void; onDuplicate: (p: Product) => void
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-4 transition-all hover:scale-[1.002] admin-glass">
      <ProductCardContent product={product}
        onTogglePublished={onTogglePublished} onToggleFeatured={onToggleFeatured}
        onEdit={onEdit} onDelete={onDelete} onDuplicate={onDuplicate} />
    </div>
  )
}

function ProductCardContent({ product, dragHandle, onTogglePublished, onToggleFeatured, onEdit, onDelete, onDuplicate }: {
  product: Product; dragHandle?: React.ReactNode
  onTogglePublished: (p: Product) => void; onToggleFeatured: (p: Product) => void
  onEdit: (id: string) => void; onDelete: (id: string) => void; onDuplicate: (p: Product) => void
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {dragHandle}
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#7700ff]/10 text-xs font-medium text-[#7700ff] dark:text-[#ad66ff]">
          {product.display_order}
        </span>
        {product.thumbnail ? (
          <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-xl">
            <img src={product.thumbnail} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl bg-[#7700ff]/10 text-lg text-[#7700ff] dark:text-[#ad66ff]">⊞</div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-gray-900 dark:text-white/90">{product.title}</span>
            {product.featured && <span className="shrink-0 text-xs text-amber-500">★</span>}
            <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
              product.type === 'digital' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
              product.type === 'physical' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
              'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
            )}>{product.type}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500 dark:text-white/40">
            <span>₦{(product.price || 0).toLocaleString()}</span>
            {product.sale_price && <span className="text-red-500">₦{product.sale_price.toLocaleString()}</span>}
            <span>·</span>
            <span className={cn(product.published ? 'text-emerald-500' : 'text-amber-500')}>
              {product.published ? 'Published' : 'Draft'}
            </span>
            <span>·</span>
            <span>{formatDate(product.created_at)}</span>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button onClick={() => onTogglePublished(product)}
          className="rounded-lg px-2.5 py-1.5 text-xs text-gray-500 transition-colors hover:bg-black/5 hover:text-gray-700 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white/80"
          title={product.published ? 'Unpublish' : 'Publish'}>
          {product.published ? '✓' : '○'}
        </button>
        <button onClick={() => onToggleFeatured(product)}
          className={cn('rounded-lg px-2.5 py-1.5 text-xs transition-colors', product.featured ? 'text-amber-500' : 'text-gray-500 hover:text-amber-500 dark:text-white/50')}
          title={product.featured ? 'Unfeature' : 'Feature'}>★</button>
        <button onClick={() => onDuplicate(product)}
          className="rounded-lg px-2.5 py-1.5 text-xs text-gray-500 transition-colors hover:bg-black/5 hover:text-gray-700 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white/80"
          title="Duplicate">⧉</button>
        <button onClick={() => onEdit(product.id)}
          className="rounded-lg px-2.5 py-1.5 text-xs text-gray-500 transition-colors hover:bg-black/5 hover:text-gray-700 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white/80">Edit</button>
        <button onClick={() => onDelete(product.id)}
          className="rounded-lg px-2.5 py-1.5 text-xs text-red-500 transition-colors hover:bg-red-500/10">Delete</button>
      </div>
    </div>
  )
}

function ProductEditor({ productId, onClose, onSaved, nextDisplayOrder }: { productId: string | null; onClose: () => void; onSaved: () => void; nextDisplayOrder: number }) {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [type, setType] = useState<'digital' | 'physical' | 'bundle'>('digital')
  const [price, setPrice] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [description, setDescription] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [gallery, setGallery] = useState<string[]>([])
  const [categoryId, setCategoryId] = useState('')
  const [tags, setTags] = useState('')
  const [stock, setStock] = useState('')
  const [digitalFileUrl, setDigitalFileUrl] = useState('')
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([])
  const [attributes, setAttributes] = useState<Record<string, unknown>>({})
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [featured, setFeatured] = useState(false)
  const [published, setPublished] = useState(false)
  const [saving, setSaving] = useState(false)

  const categorySlug = categories.find(c => c.id === categoryId)?.slug ?? ''

  useEffect(() => {
    supabase.from('product_categories').select('id, name, slug').order('name').then(async ({ data }) => {
      if (data && data.length > 0) {
        setCategories(data)
      } else {
        const entries = Object.values(categoryConfigs)
        const { data: seeded } = await supabase.from('product_categories').insert(
          entries.map(c => ({ name: c.name, slug: c.slug, description: `${c.type} product category` }))
        ).select('id, name, slug').order('name')
        if (seeded) setCategories(seeded)
      }
    })
    if (productId) {
      supabase.from('products').select('*').eq('id', productId).single().then(({ data }) => {
        if (!data) return
        setTitle(data.title || '')
        setSlug(data.slug || '')
        setType(data.type || 'digital')
        setPrice(String(data.price || ''))
        setSalePrice(data.sale_price ? String(data.sale_price) : '')
        setShortDescription(data.short_description || '')
        setDescription(data.description || '')
        setThumbnail(data.thumbnail || '')
        setGallery(data.gallery || [])
        setCategoryId(data.category_id || '')
        setTags((data.tags || []).join(', '))
        setStock(data.stock !== null ? String(data.stock) : '')
        setDigitalFileUrl(data.digital_file_url || '')
        setAttributes((data.attributes as Record<string, unknown>) || {})
        setVariants((data.variants as ProductVariant[]) || [])
        setFeatured(data.featured || false)
        setPublished(data.published || false)
      })
    }
  }, [productId])

  useEffect(() => {
    if (productId || !categorySlug) return
    const cfg = getCategoryConfig(categorySlug)
    if (!cfg) return
    const next: Record<string, unknown> = {}
    for (const a of cfg.attributes) {
      if (a.type === 'multi_select') next[a.key] = []
      else if (a.type === 'boolean') next[a.key] = false
      else next[a.key] = ''
    }
    setAttributes(next)
    if (cfg.hasVariants) {
      setVariants([])
    }
  }, [categorySlug, productId])

  const generateSlug = (val: string) => val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !slug.trim() || !price) return
    setSaving(true)
    const payload: Record<string, unknown> = {
      title: title.trim(),
      slug: slug.trim(),
      type,
      price: parseFloat(price) || 0,
      sale_price: salePrice ? parseFloat(salePrice) : null,
      short_description: shortDescription.trim(),
      description: description.trim(),
      thumbnail,
      gallery,
      category_id: categoryId || null,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      stock: stock ? parseInt(stock) : null,
      digital_file_url: digitalFileUrl || null,
      featured,
      published,
      attributes: Object.keys(attributes).length > 0 ? attributes : null,
      variants: variants.length > 0 ? variants : null,
      updated_at: new Date().toISOString(),
    }
    if (!productId) {
      payload.display_order = nextDisplayOrder
    }
    try {
      if (productId) {
        await supabase.from('products').update(payload).eq('id', productId)
      } else {
        await supabase.from('products').insert({ ...payload, created_at: new Date().toISOString() })
      }
      setSaving(false)
      onSaved()
    } catch (err) {
      console.error('Product save error:', err)
      setSaving(false)
    }
  }

  const handleUploadThumbnail = async () => {
    try {
      const { uploadToCloudinary } = await import('@/lib/utils')
      const url = await uploadToCloudinary()
      if (url) setThumbnail(url)
    } catch { /* silent */ }
  }

  const handleUploadGallery = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = async () => {
      const files = Array.from(input.files || [])
      if (files.length === 0) return
      const uploads = files.map(file => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '')
        return fetch(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`,
          { method: 'POST', body: formData }
        ).then(r => r.json())
      })
      const results = await Promise.allSettled(uploads)
      const urls = results
        .filter((r): r is PromiseFulfilledResult<{ secure_url: string }> => r.status === 'fulfilled' && r.value.secure_url)
        .map(r => r.value.secure_url)
      if (urls.length > 0) setGallery(prev => [...prev, ...urls])
    }
    input.click()
  }

  const handleRemoveGallery = (index: number) => {
    setGallery(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-8">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl p-6 admin-glass-strong">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white/90">
            {productId ? 'Edit Product' : 'New Product'}
          </h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-500 hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Title</label>
              <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); if (!productId) setSlug(generateSlug(e.target.value)) }} className="w-full admin-input" placeholder="Product title" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Slug</label>
              <input type="text" value={slug} onChange={(e) => setSlug(generateSlug(e.target.value))} className="w-full admin-input" placeholder="product-slug" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as 'digital' | 'physical' | 'bundle')} className="w-full admin-input">
                <option value="digital">Digital</option>
                <option value="physical">Physical</option>
                <option value="bundle">Bundle</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Price</label>
              <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full admin-input" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Sale Price</label>
              <input type="number" step="0.01" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} className="w-full admin-input" placeholder="0.00" />
            </div>
            {(!categorySlug || !getCategoryConfig(categorySlug)?.hasVariants) && (
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Stock (null = unlimited)</label>
                <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full admin-input" placeholder="Leave empty for unlimited" />
              </div>
            )}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Short Description</label>
              <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={2} className="w-full admin-input" placeholder="Brief product description" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full admin-input" placeholder="Full product description" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Thumbnail URL</label>
              <div className="flex gap-2">
                <input type="text" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} className="flex-1 admin-input" placeholder="https://..." />
                <button type="button" onClick={handleUploadThumbnail} className="shrink-0 rounded-xl bg-[#7700ff] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[#9900ff]">Upload</button>
              </div>
              {thumbnail && (
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                    <img src={thumbnail} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  </div>
                  <span className="truncate text-xs text-gray-500 dark:text-white/40">{thumbnail}</span>
                </div>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Gallery Images</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {gallery.map((img, i) => (
                  <div key={i} className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                    <img src={img.replace('/upload/', '/upload/w_100/')} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    <button type="button" onClick={() => handleRemoveGallery(i)}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">✕</button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={handleUploadGallery} className="rounded-xl bg-[#7700ff] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[#9900ff]">Upload Images</button>
              {gallery.length > 0 && (
                <span className="ml-2 text-xs text-gray-400 dark:text-white/30">{gallery.length} image{gallery.length !== 1 ? 's' : ''}</span>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full admin-input">
                <option value="">None</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* ── Dynamic Attributes ── */}
            {categorySlug && (() => {
              const cfg = getCategoryConfig(categorySlug)
              if (!cfg) return null
              return (
                <div className="sm:col-span-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] p-4 space-y-3">
                  <h3 className="text-xs font-semibold text-gray-600 dark:text-white/60 uppercase tracking-wider">{cfg.name} Attributes</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {cfg.attributes.filter(a => a.key !== 'shipping_required' && a.key !== 'weight').map(a => (
                      <AttributeField key={a.key} def={a} value={attributes[a.key]} onChange={(v) => setAttributes(prev => ({ ...prev, [a.key]: v }))} />
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* ── Variant Editor ── */}
            {categorySlug && getCategoryConfig(categorySlug)?.hasVariants && (
              <VariantEditor
                config={getCategoryConfig(categorySlug)!.variantConfig!}
                variants={variants}
                onChange={setVariants}
              />
            )}

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Tags (comma separated)</label>
              <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full admin-input" placeholder="design, template, pro" />
            </div>
            {type === 'digital' && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Digital File URL</label>
                <input type="text" value={digitalFileUrl} onChange={(e) => setDigitalFileUrl(e.target.value)} className="w-full admin-input" placeholder="https://..." />
              </div>
            )}
            <div className="flex items-center gap-6 pt-2 sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[#7700ff] focus:ring-[#7700ff] dark:border-white/20" />
                <span className="text-sm text-gray-700 dark:text-white/70">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[#7700ff] focus:ring-[#7700ff] dark:border-white/20" />
                <span className="text-sm text-gray-700 dark:text-white/70">Published</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm text-gray-500 transition-colors hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5">Cancel</button>
            <button type="submit" disabled={saving || !title.trim() || !slug.trim() || !price} className="admin-btn-primary">
              {saving ? 'Saving...' : productId ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AttributeField({ def, value, onChange }: { def: AttributeDef; value: unknown; onChange: (v: unknown) => void }) {
  if (def.type === 'select') {
    return (
      <div>
        <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">{def.label}</label>
        <select value={(value as string) || ''} onChange={(e) => onChange(e.target.value)} className="w-full admin-input">
          <option value="">Select...</option>
          {def.options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    )
  }
  if (def.type === 'multi_select') {
    const selected = (value as string[]) || []
    return (
      <div>
        <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">{def.label}</label>
        <div className="flex flex-wrap gap-1.5">
          {def.options?.map(o => {
            const isSelected = selected.includes(o)
            return (
              <button key={o} type="button" onClick={() => onChange(isSelected ? selected.filter(s => s !== o) : [...selected, o])}
                className={cn('rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                  isSelected ? 'bg-[#7700ff] text-white' : 'bg-black/[0.04] dark:bg-white/[0.06] text-gray-600 dark:text-white/70 hover:bg-black/[0.08] dark:hover:bg-white/[0.1]'
                )}>
                {o}
              </button>
            )
          })}
        </div>
      </div>
    )
  }
  if (def.type === 'boolean') {
    return (
      <div>
        <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">{def.label}</label>
        <select value={value ? 'yes' : 'no'} onChange={(e) => onChange(e.target.value === 'yes')} className="w-full admin-input">
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </div>
    )
  }
  return (
    <div>
      <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">{def.label}</label>
      <input type={def.type === 'url' ? 'url' : 'text'} value={(value as string) || ''} onChange={(e) => onChange(e.target.value)}
        className="w-full admin-input" placeholder={def.placeholder || ''} />
    </div>
  )
}

function VariantEditor({ config, variants, onChange }: {
  config: NonNullable<ReturnType<typeof getCategoryConfig>>['variantConfig']
  variants: ProductVariant[]
  onChange: (v: ProductVariant[]) => void
}) {
  const hasSizes = (config?.sizes?.length ?? 0) > 0
  const hasColors = (config?.colors?.length ?? 0) > 0
  const hasSku = config?.hasSku
  const hasPriceOverride = config?.hasPriceOverride

  const comboKeys: string[] = []
  if (hasSizes && hasColors) {
    for (const s of config!.sizes!) {
      for (const c of config!.colors!) {
        comboKeys.push(`${s}||${c}`)
      }
    }
  } else if (hasSizes) {
    for (const s of config!.sizes!) {
      comboKeys.push(`${s}||`)
    }
  } else if (hasColors) {
    for (const c of config!.colors!) {
      comboKeys.push(`||${c}`)
    }
  }

  const variantMap = new Map<string, ProductVariant>(variants.map(v => [`${v.size || ''}||${v.color || ''}`, v]))

  const getOrCreate = (key: string): ProductVariant => {
    const existing = variantMap.get(key)
    if (existing) return existing
    const [size, color] = key.split('||')
    return { id: crypto.randomUUID(), size: size || undefined, color: color || undefined, stock: 0 }
  }

  return (
    <div className="sm:col-span-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] p-4">
      <h3 className="text-xs font-semibold text-gray-600 dark:text-white/60 uppercase tracking-wider mb-3">Variants</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-gray-500 dark:text-white/40 border-b border-black/[0.05] dark:border-white/[0.05]">
              {hasSizes && <th className="pb-2 pr-2 font-medium">Size</th>}
              {hasColors && <th className="pb-2 pr-2 font-medium">Color</th>}
              <th className="pb-2 pr-2 font-medium">Stock</th>
              {hasSku && <th className="pb-2 pr-2 font-medium">SKU</th>}
              {hasPriceOverride && <th className="pb-2 font-medium">Price Override</th>}
            </tr>
          </thead>
          <tbody>
            {comboKeys.map(key => {
              const v = getOrCreate(key)
              return (
                <tr key={key} className="border-b border-black/[0.03] dark:border-white/[0.03]">
                  {hasSizes && <td className="py-1.5 pr-2 font-medium text-gray-700 dark:text-white/80">{v.size}</td>}
                  {hasColors && <td className="py-1.5 pr-2 text-gray-700 dark:text-white/80">{v.color}</td>}
                  <td className="py-1.5 pr-2">
                    <input type="number" min="0" value={variantMap.has(key) ? v.stock : ''}
                      onChange={(e) => {
                        const updated = variantMap.has(key)
                          ? variants.map(x => x.id === v.id ? { ...x, stock: parseInt(e.target.value) || 0 } : x)
                          : [...variants, { ...v, stock: parseInt(e.target.value) || 0 }]
                        onChange(updated)
                      }}
                      className="w-20 admin-input !py-1 text-xs" placeholder="0" />
                  </td>
                  {hasSku && (
                    <td className="py-1.5 pr-2">
                      <input type="text" value={variantMap.has(key) ? (v.sku || '') : ''}
                        onChange={(e) => {
                          const updated = variantMap.has(key)
                            ? variants.map(x => x.id === v.id ? { ...x, sku: e.target.value } : x)
                            : [...variants, { ...v, sku: e.target.value }]
                          onChange(updated)
                        }}
                        className="w-24 admin-input !py-1 text-xs" placeholder="SKU" />
                    </td>
                  )}
                  {hasPriceOverride && (
                    <td className="py-1.5">
                      <input type="number" step="0.01" min="0" value={variantMap.has(key) ? (v.price_override ?? '') : ''}
                        onChange={(e) => {
                          const val = e.target.value ? parseFloat(e.target.value) : null
                          const updated = variantMap.has(key)
                            ? variants.map(x => x.id === v.id ? { ...x, price_override: val } : x)
                            : [...variants, { ...v, price_override: val }]
                          onChange(updated)
                        }}
                        className="w-24 admin-input !py-1 text-xs" placeholder="Base price" />
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
