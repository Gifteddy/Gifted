import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate, cn } from '@/lib/utils'

interface BlogItem {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string
  tags: string[]
  published: boolean
  created_at: string
  updated_at: string
}

type EditorMode = 'create' | 'edit' | null

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editorMode, setEditorMode] = useState<EditorMode>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const loadPosts = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })
      setPosts((data || []) as BlogItem[])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadPosts() }, [loadPosts])

  const handleDelete = async (id: string) => {
    await supabase.from('blog_posts').delete().eq('id', id)
    setDeleteId(null)
    loadPosts()
  }

  const handleTogglePublish = async (post: BlogItem) => {
    await supabase.from('blog_posts').update({
      published: !post.published,
      updated_at: new Date().toISOString(),
    }).eq('id', post.id)
    loadPosts()
  }

  const filtered = posts.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white/90">Blog Posts</h1>
        <button onClick={() => { setEditorMode('create'); setEditId(null) }} className="admin-btn-primary">
          New Post
        </button>
      </div>

      <div className="mb-4">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts..." className="w-full max-w-xs admin-input" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7700ff] border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center rounded-2xl p-12 text-center admin-glass">
          <p className="text-sm text-gray-500 dark:text-white/40">
            {search ? 'No posts match your search.' : 'No blog posts yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(post => (
            <div key={post.id} className="rounded-2xl p-4 transition-all hover:scale-[1.002] admin-glass">
              <div className="flex items-center gap-4">
                {post.cover_image ? (
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                    <img src={post.cover_image} alt="" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#7700ff]/10 text-lg text-[#7700ff] dark:text-[#ad66ff]">◇</div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-gray-900 dark:text-white/90">{post.title}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500 dark:text-white/40">
                    <span className={cn(post.published ? 'text-emerald-500' : 'text-amber-500')}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                    <span>·</span>
                    <span>{formatDate(post.created_at)}</span>
                    {post.tags?.length > 0 && (
                      <><span>·</span><span>{post.tags.join(', ')}</span></>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button onClick={() => handleTogglePublish(post)}
                    className="rounded-lg px-2.5 py-1.5 text-xs text-gray-500 transition-colors hover:bg-black/5 hover:text-gray-700 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white/80"
                    title={post.published ? 'Unpublish' : 'Publish'}>
                    {post.published ? '✓' : '○'}
                  </button>
                  <button onClick={() => { setEditorMode('edit'); setEditId(post.id) }}
                    className="rounded-lg px-2.5 py-1.5 text-xs text-gray-500 transition-colors hover:bg-black/5 hover:text-gray-700 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white/80">Edit</button>
                  <button onClick={() => setDeleteId(post.id)}
                    className="rounded-lg px-2.5 py-1.5 text-xs text-red-500 transition-colors hover:bg-red-500/10">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editorMode && (
        <BlogEditor postId={editId} onClose={() => { setEditorMode(null); setEditId(null) }}
          onSaved={() => { setEditorMode(null); setEditId(null); loadPosts() }} />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-sm rounded-2xl p-6 admin-glass-strong">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white/90">Delete Post</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-white/40">Are you sure? This cannot be undone.</p>
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

function BlogEditor({ postId, onClose, onSaved }: { postId: string | null; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [tags, setTags] = useState('')
  const [published, setPublished] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (postId) {
      supabase.from('blog_posts').select('*').eq('id', postId).single().then(({ data }) => {
        if (!data) return
        setTitle(data.title || '')
        setSlug(data.slug || '')
        setExcerpt(data.excerpt || '')
        setContent(data.content || '')
        setCoverImage(data.cover_image || '')
        setTags((data.tags || []).join(', '))
        setPublished(data.published || false)
      })
    }
  }, [postId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !slug.trim()) return
    setSaving(true)
    const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean)
    const payload = {
      title: title.trim(), slug: slug.trim(), excerpt: excerpt.trim(), content,
      cover_image: coverImage, tags: tagsArray, published,
      updated_at: new Date().toISOString(),
    }
    if (postId) {
      await supabase.from('blog_posts').update(payload).eq('id', postId)
    } else {
      await supabase.from('blog_posts').insert({ ...payload, created_at: new Date().toISOString() })
    }
    setSaving(false)
    onSaved()
  }

  const generateSlug = (val: string) => val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-8">
      <div className="relative w-full max-w-3xl rounded-2xl p-6 admin-glass-strong">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white/90">
            {postId ? 'Edit Post' : 'New Post'}
          </h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-500 hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Title</label>
              <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); if (!postId) setSlug(generateSlug(e.target.value)) }} className="w-full admin-input" placeholder="Post title" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Slug</label>
              <input type="text" value={slug} onChange={(e) => setSlug(generateSlug(e.target.value))} className="w-full admin-input" placeholder="post-slug" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Cover Image</label>
              <div className="flex gap-2">
                <input type="text" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} className="flex-1 admin-input" placeholder="https://... or upload" />
                <button type="button" onClick={async () => { try { const { uploadToCloudinary } = await import('@/lib/utils'); const url = await uploadToCloudinary(); if (url) setCoverImage(url) } catch { /* silent */ } }} className="shrink-0 rounded-xl bg-[#7700ff] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[#9900ff]">Upload</button>
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
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Excerpt</label>
              <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className="w-full admin-input" placeholder="Brief summary..." />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Content (Markdown supported)</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={12} className="w-full admin-input font-mono text-xs" placeholder="Write your post content here..." />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-white/70">Tags (comma separated)</label>
              <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full admin-input" placeholder="tech, design, ai" />
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[#7700ff] focus:ring-[#7700ff] dark:border-white/20" />
                <span className="text-sm text-gray-700 dark:text-white/70">Published</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm text-gray-500 transition-colors hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5">Cancel</button>
            <button type="submit" disabled={saving || !title.trim() || !slug.trim()} className="admin-btn-primary">
              {saving ? 'Saving...' : postId ? 'Save Changes' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
