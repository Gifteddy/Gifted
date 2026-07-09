import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { categoryConfigs, getCategoryConfig } from '@/lib/product-attributes'
import { createProductCategory, updateProductCategory, deleteProductCategory } from '@/lib/commerce-queries'
import type { ProductCategory } from '@/lib/commerce-types'

export default function AdminCategories() {
  const [dbCategories, setDbCategories] = useState<ProductCategory[]>([])
  const [productCounts, setProductCounts] = useState<Record<string, number>>({})
  const [showEditor, setShowEditor] = useState(false)
  const [editCategory, setEditCategory] = useState<ProductCategory | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const configSlugs = Object.keys(categoryConfigs)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data: cats } = await supabase
        .from('product_categories')
        .select('*')
        .order('name')
      if (cats) setDbCategories(cats as ProductCategory[])

      const { data: counts } = await supabase
        .from('products')
        .select('category_id')
      if (counts) {
        const map: Record<string, number> = {}
        for (const row of counts) {
          const cid = (row as { category_id: string | null }).category_id
          if (cid) map[cid] = (map[cid] || 0) + 1
        }
        setProductCounts(map)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const dbSyncedSlugs = new Set(dbCategories.map(c => c.slug))
  const unsyncedConfigSlugs = configSlugs.filter(s => !dbSyncedSlugs.has(s))

  const handleSync = async () => {
    setSyncing(true)
    try {
      for (const slug of unsyncedConfigSlugs) {
        const cfg = getCategoryConfig(slug)
        if (!cfg) continue
        await createProductCategory({
          name: cfg.name,
          slug: cfg.slug,
          description: `${cfg.type} product category`,
        })
      }
      await load()
    } catch {
      // silent
    } finally {
      setSyncing(false)
    }
  }

  const handleCreateCustom = () => {
    setEditCategory(null)
    setShowEditor(true)
  }

  const handleEdit = (cat: ProductCategory) => {
    setEditCategory(cat)
    setShowEditor(true)
  }

  const handleSave = async (name: string, slug: string, description: string) => {
    setSaving(true)
    try {
      if (editCategory) {
        await updateProductCategory(editCategory.id, { name, slug, description })
      } else {
        await createProductCategory({ name, slug, description })
      }
      setShowEditor(false)
      setEditCategory(null)
      await load()
    } catch {
      // silent
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteProductCategory(id)
      setDeleteId(null)
      await load()
    } catch {
      // silent
    }
  }

  const isConfigDefined = (slug: string) => configSlugs.includes(slug)

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white/90">Categories</h1>
          <p className="mt-1 text-xs text-gray-500 dark:text-white/40">
            {dbCategories.length} synced · {configSlugs.length} defined in config
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {unsyncedConfigSlugs.length > 0 && (
            <button onClick={handleSync} disabled={syncing}
              className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50">
              {syncing ? 'Syncing...' : `Sync ${unsyncedConfigSlugs.length} Config Categories`}
            </button>
          )}
          <button onClick={handleCreateCustom}
            className="admin-btn-primary">
            + New Category
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7700ff] border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-6">
          {unsyncedConfigSlugs.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800/30 dark:bg-amber-900/10">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                {unsyncedConfigSlugs.length} category configuration{unsyncedConfigSlugs.length !== 1 ? 's' : ''} not yet synced to the database.
                Click "Sync {unsyncedConfigSlugs.length} Config Categories" above to create them.
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {unsyncedConfigSlugs.map(slug => {
                  const cfg = getCategoryConfig(slug)
                  return (
                    <span key={slug}
                      className="rounded-lg bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                      {cfg?.name || slug}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {dbCategories.length === 0 && unsyncedConfigSlugs.length === 0 ? (
            <div className="flex items-center justify-center rounded-2xl p-12 text-center admin-glass">
              <p className="text-sm text-gray-500 dark:text-white/40">No categories yet. Create your first category or sync from config.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-black/[0.06] dark:border-white/[0.06]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/[0.04] dark:border-white/[0.04] bg-black/[0.02] dark:bg-white/[0.02]">
                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-white/60">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-white/60">Slug</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-white/60">Type</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-white/60">Attributes</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-600 dark:text-white/60">Products</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-white/60">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dbCategories.map(cat => {
                    const cfg = getCategoryConfig(cat.slug)
                    const productCount = productCounts[cat.id] || 0
                    const isConfig = isConfigDefined(cat.slug)
                    return (
                      <tr key={cat.id}
                        className="border-b border-black/[0.03] dark:border-white/[0.03] last:border-0 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white/90">{cat.name}</span>
                            {isConfig ? (
                              <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">config</span>
                            ) : (
                              <span className="rounded-md bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">custom</span>
                            )}
                          </div>
                          {cat.description && (
                            <p className="mt-0.5 text-xs text-gray-400 dark:text-white/30">{cat.description}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-white/50 font-mono">{cat.slug}</td>
                        <td className="px-4 py-3">
                          {cfg ? (
                            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium',
                              cfg.type === 'digital' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              cfg.type === 'physical' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                            )}>{cfg.type}</span>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-white/30">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {cfg ? (
                            <div className="flex flex-wrap gap-1">
                              {cfg.attributes
                                .filter(a => a.key !== 'shipping_required' && a.key !== 'weight' && a.key !== 'download_type')
                                .map(a => (
                                  <span key={a.key}
                                    className="rounded-md bg-black/[0.04] dark:bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-gray-600 dark:text-white/70">
                                    {a.label}
                                  </span>
                                ))}
                              {cfg.hasVariants && (
                                <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                  + variants
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-white/30">No attribute config</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-medium tabular-nums text-gray-700 dark:text-white/80">{productCount}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleEdit(cat)}
                            className="rounded-lg px-2.5 py-1 text-xs text-gray-500 transition-colors hover:bg-black/5 hover:text-gray-700 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white/80">
                            Edit
                          </button>
                          {!isConfig && (
                            <button onClick={() => setDeleteId(cat.id)}
                              className="ml-1 rounded-lg px-2.5 py-1 text-xs text-red-500 transition-colors hover:bg-red-500/10">
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Config-defined categories not in DB */}
          {unsyncedConfigSlugs.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/40">Available Config Categories (not yet synced)</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {unsyncedConfigSlugs.map(slug => {
                  const cfg = getCategoryConfig(slug)!
                  return (
                    <div key={slug}
                      className="rounded-2xl border border-dashed border-black/[0.08] p-4 dark:border-white/[0.08]">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white/90">{cfg.name}</h4>
                      <p className="mt-0.5 text-xs text-gray-400 dark:text-white/30 font-mono">{cfg.slug}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium',
                          cfg.type === 'digital' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          cfg.type === 'physical' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        )}>{cfg.type}</span>
                        <span className="text-[10px] text-gray-400 dark:text-white/30">{cfg.attributes.length} attributes</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showEditor && (
        <CategoryEditor
          category={editCategory}
          onSave={handleSave}
          onClose={() => { setShowEditor(false); setEditCategory(null) }}
          saving={saving}
        />
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl p-6 admin-glass-strong">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white/90">Delete Category</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-white/40">
              Are you sure you want to delete this custom category? Products assigned to it will have their category unset.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)}
                className="rounded-xl px-4 py-2 text-sm text-gray-500 transition-colors hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CategoryEditor({ category, onSave, onClose, saving }: {
  category: ProductCategory | null
  onSave: (name: string, slug: string, description: string) => void
  onClose: () => void
  saving: boolean
}) {
  const [name, setName] = useState(category?.name || '')
  const [slug, setSlug] = useState(category?.slug || '')
  const [description, setDescription] = useState(category?.description || '')

  const generateSlug = (val: string) =>
    val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl p-6 admin-glass-strong">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white/90">
            {category ? 'Edit Category' : 'New Category'}
          </h2>
          <button onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-500 hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Name</label>
            <input type="text" value={name}
              onChange={(e) => { setName(e.target.value); if (!category) setSlug(generateSlug(e.target.value)) }}
              className="w-full admin-input" placeholder="Category name" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Slug</label>
            <input type="text" value={slug}
              onChange={(e) => setSlug(generateSlug(e.target.value))}
              className="w-full admin-input font-mono" placeholder="category-slug" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Description</label>
            <textarea value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3} className="w-full admin-input" placeholder="Optional description" />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm text-gray-500 transition-colors hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5">
            Cancel
          </button>
          <button onClick={() => onSave(name, slug, description)}
            disabled={saving || !name.trim() || !slug.trim()}
            className="admin-btn-primary">
            {saving ? 'Saving...' : category ? 'Save Changes' : 'Create Category'}
          </button>
        </div>
      </div>
    </div>
  )
}
