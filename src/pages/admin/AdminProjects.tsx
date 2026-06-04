import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate, cn } from '@/lib/utils'

interface ProjectItem {
  id: string
  title: string
  slug: string
  description: string
  category: string
  cover_image: string
  featured: boolean
  published: boolean
  status: string
  created_at: string
  updated_at: string
}

type EditorMode = 'create' | 'edit' | null

interface MediaItem {
  public_id: string
  secure_url: string
  format: string
  resource_type: string
  width: number
  height: number
  created_at: string
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editorMode, setEditorMode] = useState<EditorMode>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const loadProjects = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
      setProjects((data || []) as ProjectItem[])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadProjects() }, [loadProjects])

  const handleDelete = async (id: string) => {
    await supabase.from('projects').delete().eq('id', id)
    setDeleteId(null)
    loadProjects()
  }

  const handleTogglePublish = async (project: ProjectItem) => {
    const newPublished = !(project.published || project.status === 'published')
    await supabase.from('projects').update({
      published: newPublished,
      status: newPublished ? 'published' : 'draft',
      updated_at: new Date().toISOString(),
    }).eq('id', project.id)
    loadProjects()
  }

  const handleToggleFeatured = async (project: ProjectItem) => {
    await supabase.from('projects').update({
      featured: !project.featured,
      updated_at: new Date().toISOString(),
    }).eq('id', project.id)
    loadProjects()
  }

  const filtered = projects.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white/90">Projects</h1>
        <button onClick={() => { setEditorMode('create'); setEditId(null) }} className="w-full sm:w-auto admin-btn-primary">
          New Project
        </button>
      </div>

      <div className="mb-4">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects..." className="w-full sm:max-w-xs admin-input" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7700ff] border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center rounded-2xl p-12 text-center admin-glass">
          <p className="text-sm text-gray-500 dark:text-white/40">
            {search ? 'No projects match your search.' : 'No projects yet. Create your first project.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(project => (
            <div key={project.id} className="relative overflow-hidden rounded-2xl p-4 transition-all hover:scale-[1.002] admin-glass">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {project.cover_image ? (
                    <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-xl">
                      <img src={project.cover_image} alt="" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl bg-[#7700ff]/10 text-lg text-[#7700ff] dark:text-[#ad66ff]">◇</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-gray-900 dark:text-white/90">{project.title}</span>
                      {project.featured && <span className="shrink-0 text-xs text-amber-500">★</span>}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500 dark:text-white/40">
                      {project.category && <span className="truncate">{project.category.replace(/-/g, ' ')}</span>}
                      <span>·</span>
                      <span className={cn('shrink-0', (project.published || project.status === 'published') ? 'text-emerald-500' : 'text-amber-500')}>
                        {project.published || project.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                      <span>·</span>
                      <span className="shrink-0">{formatDate(project.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1 pl-0 sm:pl-0">
                  <button onClick={() => handleTogglePublish(project)}
                    className="rounded-lg px-2.5 py-1.5 text-xs text-gray-500 transition-colors hover:bg-black/5 hover:text-gray-700 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white/80"
                    title={project.published || project.status === 'published' ? 'Unpublish' : 'Publish'}>
                    {(project.published || project.status === 'published') ? '✓' : '○'}
                  </button>
                  <button onClick={() => handleToggleFeatured(project)}
                    className={cn('rounded-lg px-2.5 py-1.5 text-xs transition-colors', project.featured ? 'text-amber-500' : 'text-gray-500 hover:text-amber-500 dark:text-white/50')}
                    title={project.featured ? 'Unfeature' : 'Feature'}>★</button>
                  <button onClick={() => { setEditorMode('edit'); setEditId(project.id) }}
                    className="rounded-lg px-2.5 py-1.5 text-xs text-gray-500 transition-colors hover:bg-black/5 hover:text-gray-700 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white/80">Edit</button>
                  <button onClick={() => setDeleteId(project.id)}
                    className="rounded-lg px-2.5 py-1.5 text-xs text-red-500 transition-colors hover:bg-red-500/10">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editorMode && (
        <ProjectEditor projectId={editId} onClose={() => { setEditorMode(null); setEditId(null) }}
          onSaved={() => { setEditorMode(null); setEditId(null); loadProjects() }} />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl p-6 admin-glass-strong">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white/90">Delete Project</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-white/40">Are you sure you want to delete this project? This action cannot be undone.</p>
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

const categoryOptions = [
  { value: '', label: 'Select category' },
  { value: 'photography', label: 'Photography' },
  { value: 'video-production', label: 'Video Production' },
  { value: 'graphic-design', label: 'Graphic Design' },
  { value: 'development', label: 'Development' },
  { value: 'ai-enthusiast', label: 'AI Enthusiast' },
  { value: 'photo-editing', label: 'Photo Editing' },
]

function ProjectEditor({ projectId, onClose, onSaved }: { projectId: string | null; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [allCategories, setAllCategories] = useState<{ id: string; slug: string; name: string }[]>([])
  const [coverImage, setCoverImage] = useState('')
  const [technologies, setTechnologies] = useState('')
  const [client, setClient] = useState('')
  const [projectUrl, setProjectUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [featured, setFeatured] = useState(false)
  const [published, setPublished] = useState(false)
  const [saving, setSaving] = useState(false)
  const [gallery, setGallery] = useState<string[]>([])
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryTarget, setGalleryTarget] = useState<'cover' | 'video' | 'gallery'>('cover')

  useEffect(() => {
    supabase.from('categories').select('id, slug, name').then(({ data }) => {
      if (data) setAllCategories(data)
    })
  }, [])

  useEffect(() => {
    if (projectId) {
      supabase.from('projects').select('*, categories:project_categories(category:categories(*))').eq('id', projectId).single().then(({ data }) => {
        if (!data) return
        setTitle(data.title || '')
        setSlug(data.slug || '')
        setDescription(data.description || '')
        setCoverImage(data.cover_image || data.thumbnail || '')
        setGallery(data.gallery || [])
        setTechnologies((data.technologies || data.tools || []).join(', '))
        setClient(data.client || '')
        setProjectUrl(data.project_url || '')
        setGithubUrl(data.github_url || '')
        setFeatured(data.featured || false)
        setPublished(data.published || data.status === 'published')
        if (data.categories) {
          setSelectedCategories(data.categories.map((pc: any) => pc.category?.slug).filter(Boolean))
        }
      })
    }
  }, [projectId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !slug.trim()) return
    setSaving(true)
    const techArray = technologies.split(',').map(t => t.trim()).filter(Boolean)
    const firstCategory = selectedCategories[0] || ''
    const payload = {
      title: title.trim(), slug: slug.trim(), description: description.trim(), category: firstCategory,
      cover_image: coverImage, thumbnail: coverImage, gallery, technologies: techArray, tools: techArray,
      client: client.trim(), project_url: projectUrl.trim(), github_url: githubUrl.trim(),
      featured, published, status: published ? 'published' : 'draft', updated_at: new Date().toISOString(),
    }
    if (projectId) {
      await supabase.from('projects').update(payload).eq('id', projectId)
      await supabase.from('project_categories').delete().eq('project_id', projectId)
      if (selectedCategories.length > 0) {
        const catIds = allCategories.filter(c => selectedCategories.includes(c.slug)).map(c => c.id)
        if (catIds.length > 0) {
          await supabase.from('project_categories').insert(catIds.map(categoryId => ({ project_id: projectId, category_id: categoryId })))
        }
      }
    } else {
      const { data: newProject } = await supabase.from('projects').insert({ ...payload, created_at: new Date().toISOString() }).select('id').single()
      if (newProject && selectedCategories.length > 0) {
        const catIds = allCategories.filter(c => selectedCategories.includes(c.slug)).map(c => c.id)
        if (catIds.length > 0) {
          await supabase.from('project_categories').insert(catIds.map(categoryId => ({ project_id: newProject.id, category_id: categoryId })))
        }
      }
    }
    setSaving(false)
    onSaved()
  }

  const generateSlug = (val: string) => val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const pickImage = (url: string) => {
    if (galleryTarget === 'cover') setCoverImage(url)
    else if (galleryTarget === 'video') setProjectUrl(url)
    else if (galleryTarget === 'gallery') setGallery(prev => [...prev, url])
    setGalleryOpen(false)
  }

  const handleUploadCover = async () => {
    try {
      const { uploadToCloudinary } = await import('@/lib/utils')
      const url = await uploadToCloudinary('image/*')
      if (url) setCoverImage(url)
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

  const handleUploadVideo = async () => {
    try {
      const { uploadToCloudinary } = await import('@/lib/utils')
      const url = await uploadToCloudinary('video/*')
      if (url) setProjectUrl(url)
    } catch { /* silent */ }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-8">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl p-6 admin-glass-strong">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white/90">
            {projectId ? 'Edit Project' : 'New Project'}
          </h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-500 hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Title</label>
              <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); if (!projectId) setSlug(generateSlug(e.target.value)) }} className="w-full admin-input" placeholder="Project title" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Slug</label>
              <input type="text" value={slug} onChange={(e) => setSlug(generateSlug(e.target.value))} className="w-full admin-input" placeholder="project-slug" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Categories</label>
              <div className="flex flex-wrap gap-1.5">
                {allCategories.length > 0 ? allCategories.map(cat => {
                  const isSelected = selectedCategories.includes(cat.slug)
                  return (
                    <button key={cat.id} type="button" onClick={() => {
                      setSelectedCategories(prev =>
                        isSelected ? prev.filter(s => s !== cat.slug) : [...prev, cat.slug]
                      )
                    }}
                      className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                        isSelected
                          ? 'bg-[#7700ff] text-white dark:bg-[#9233ff]'
                          : 'bg-black/[0.04] text-gray-500 hover:bg-black/[0.08] dark:bg-white/[0.04] dark:text-white/50 dark:hover:bg-white/[0.08]'
                      )}>
                      {cat.name}
                    </button>
                  )
                }) : (
                  <span className="text-xs text-gray-400 dark:text-white/30">Loading categories...</span>
                )}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full admin-input" placeholder="Project description" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">
                {selectedCategories.includes('video-production') ? 'Video Thumbnail (cover image)' : 'Cover Image'}
              </label>
              <div className="flex gap-2">
                <input type="text" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} className="flex-1 admin-input" placeholder="https://... or pick from gallery" />
                <button type="button" onClick={handleUploadCover} className="shrink-0 rounded-xl bg-[#7700ff] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[#9900ff]">Upload</button>
                <button type="button" onClick={() => { setGalleryTarget('cover'); setGalleryOpen(true) }} className="shrink-0 rounded-xl bg-[#7700ff]/10 px-3 py-2 text-xs font-medium text-[#7700ff] transition-colors hover:bg-[#7700ff]/20 dark:text-[#ad66ff]">Gallery</button>
              </div>
              {coverImage && (
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                    <img src={coverImage} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  </div>
                  <span className="truncate text-xs text-gray-500 dark:text-white/40">{coverImage}</span>
                </div>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Gallery Images</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {gallery.map((img, i) => (
                  <div key={i} className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                    <img src={img.replace('/upload/', '/upload/w_100/')} alt="" className="h-full w-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    <button type="button" onClick={() => handleRemoveGallery(i)}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">✕</button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={handleUploadGallery} className="rounded-xl bg-[#7700ff] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[#9900ff]">Upload Images</button>
                <button type="button" onClick={() => { setGalleryTarget('gallery'); setGalleryOpen(true) }} className="rounded-xl bg-[#7700ff]/10 px-3 py-2 text-xs font-medium text-[#7700ff] transition-colors hover:bg-[#7700ff]/20 dark:text-[#ad66ff]">Pick from Gallery</button>
                {gallery.length > 0 && (
                  <span className="self-center text-xs text-gray-400 dark:text-white/30">{gallery.length} image{gallery.length !== 1 ? 's' : ''}</span>
                )}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Tools / Technologies (comma separated)</label>
              <input type="text" value={technologies} onChange={(e) => setTechnologies(e.target.value)} className="w-full admin-input" placeholder="React, TypeScript, Tailwind CSS" />
            </div>
            {(selectedCategories.some(c => ['development', 'graphic-design', 'ai-enthusiast'].includes(c))) && (
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">GitHub URL</label>
                <input type="text" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className="w-full admin-input" placeholder="https://github.com/..." />
              </div>
            )}
            {(selectedCategories.some(c => ['photography', 'video-production', 'photo-editing'].includes(c))) && (
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Client</label>
                <input type="text" value={client} onChange={(e) => setClient(e.target.value)} className="w-full admin-input" placeholder="Client name" />
              </div>
            )}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">
                {selectedCategories.includes('video-production') ? 'Video File' : 'Project URL'}
              </label>
              <div className="flex gap-2">
                <input type="text" value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} className="flex-1 admin-input" placeholder={selectedCategories.includes('video-production') ? 'https://... or upload video' : 'https://...'} />
                {selectedCategories.includes('video-production') && (
                  <>
                    <button type="button" onClick={handleUploadVideo}
                      className="shrink-0 rounded-xl bg-[#7700ff] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[#9900ff]">Upload</button>
                    <button type="button" onClick={() => { setGalleryTarget('video'); setGalleryOpen(true) }}
                      className="shrink-0 rounded-xl bg-[#7700ff]/10 px-3 py-2 text-xs font-medium text-[#7700ff] transition-colors hover:bg-[#7700ff]/20 dark:text-[#ad66ff]">Gallery</button>
                  </>
                )}
              </div>
              {projectUrl && (
                <div className="mt-2 flex items-center gap-3">
                  <span className="truncate text-xs text-gray-500 dark:text-white/40">{projectUrl}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-6 pt-2">
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
            <button type="submit" disabled={saving || !title.trim() || !slug.trim()} className="admin-btn-primary">
              {saving ? 'Saving...' : projectId ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>

      {galleryOpen && <MediaPicker onPick={pickImage} onClose={() => setGalleryOpen(false)} />}
    </div>
  )
}

function MediaPicker({ onPick, onClose }: { onPick: (url: string) => void; onClose: () => void }) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const types = ['image', 'video', 'raw']
        const results = await Promise.allSettled(
          types.map(t => fetch(`/api/cloudinary/resources/${t}`).then(r => r.json()))
        )
        const all: MediaItem[] = []
        for (const r of results) {
          if (r.status === 'fulfilled' && r.value?.resources) {
            for (const res of r.value.resources) {
              if (res.created_at && new Date(res.created_at) >= new Date('2026-06-01T00:00:00Z')) {
                all.push(res)
              }
            }
          }
        }
        all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        setItems(all)
      } catch { /* silent */ } finally { setLoading(false) }
    }
    load()
  }, [])

  const handleUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*,video/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '')
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`,
          { method: 'POST', body: formData }
        )
        const data = await res.json()
        if (data.secure_url) {
          setItems(prev => [{
            public_id: data.public_id, secure_url: data.secure_url,
            format: data.format, resource_type: data.resource_type,
            width: data.width || 0, height: data.height || 0,
            created_at: data.created_at,
          }, ...prev])
          onPick(data.secure_url)
          onClose()
        }
      } catch { /* silent */ }
    }
    input.click()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl admin-glass-strong">
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white/90">Media Gallery</h3>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleUpload}
              className="rounded-xl bg-[#7700ff] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#9900ff]">Upload</button>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-500 hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7700ff] border-t-transparent" />
            </div>
          ) : items.length === 0 ? (
            <p className="py-16 text-center text-sm text-gray-500 dark:text-white/40">No media found.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {items.map(item => (
                <button key={item.public_id} type="button" onClick={() => onPick(item.secure_url)}
                  className="group relative aspect-square overflow-hidden rounded-xl bg-black/10 transition-all hover:ring-2 hover:ring-[#7700ff] dark:bg-white/5">
                  {item.resource_type === 'video' ? (
                    <><img src={item.secure_url.replace('/upload/', '/upload/w_200,q_auto/')} alt="" className="h-full w-full object-cover" />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white opacity-0 transition-opacity group-hover:opacity-100">
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                      </span>
                      <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 py-0.5 text-[10px] text-white">{item.format}</span>
                    </>
                  ) : (
                    <img src={item.secure_url.replace('/upload/', '/upload/w_200,q_auto/')} alt="" className="h-full w-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
