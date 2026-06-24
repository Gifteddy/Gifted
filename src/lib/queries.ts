import { supabase } from './supabase'
import type { Project, Category, Service, Testimonial, Skill, BlogPost, ContactMessage, FileUploadLink, FileUpload, FileShare, FileShareItem, CompanyLogo } from './types'

export async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*, categories:project_categories(category:categories(*))')
    .eq('status', 'published')
    .order('display_order', { ascending: true })
  if (error) throw error
  return data as unknown as Project[]
}

export async function getFeaturedProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*, categories:project_categories(category:categories(*))')
    .eq('status', 'published')
    .eq('featured', true)
    .order('display_order', { ascending: true })
    .limit(6)
  if (error) throw error
  return data as unknown as Project[]
}

export async function getProjectBySlug(slug: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*, categories:project_categories(category:categories(*))')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  if (error) throw error
  return data as unknown as Project
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  if (error) throw error
  return data as Category[]
}

export async function getServices() {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('order', { ascending: true })
  if (error) throw error
  return data as Service[]
}

export async function getTestimonials() {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('featured', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Testimonial[]
}

export async function getAllTestimonials() {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Testimonial[]
}

export async function updateTestimonial(id: string, updates: Partial<Testimonial>) {
  const { data, error } = await supabase
    .from('testimonials')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Testimonial
}

export async function deleteTestimonial(id: string) {
  const { error } = await supabase
    .from('testimonials')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function getSkills() {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('order', { ascending: true })
  if (error) throw error
  return data as Skill[]
}

export async function getBlogPosts() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as BlogPost[]
}

export async function getBlogPostBySlug(slug: string) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  if (error) throw error
  return data as BlogPost
}

export async function createContactMessage(message: Omit<ContactMessage, 'id' | 'status' | 'created_at'>) {
  const { data, error } = await supabase
    .from('contact_messages')
    .insert([{ ...message, status: 'unread' }])
    .select()
    .single()
  if (error) throw error
  return data as ContactMessage
}

export async function getFileUploadLinkByToken(token: string) {
  const { data, error } = await supabase
    .from('file_upload_links')
    .select('*')
    .eq('token', token)
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .single()
  if (error) throw error
  return data as FileUploadLink
}

export async function createFileUploadLink(link: Omit<FileUploadLink, 'id' | 'token' | 'upload_count' | 'created_at'>) {
  const token = crypto.randomUUID()
  const { data, error } = await supabase
    .from('file_upload_links')
    .insert([{ ...link, token }])
    .select()
    .single()
  if (error) throw error
  return data as FileUploadLink
}

export async function getFileUploadLinks() {
  const { data, error } = await supabase
    .from('file_upload_links')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as FileUploadLink[]
}

export async function deleteFileUploadLink(id: string) {
  const { error } = await supabase
    .from('file_upload_links')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function getFileUploadsByLinkId(linkId: string) {
  const { data, error } = await supabase
    .from('file_uploads')
    .select('*')
    .eq('link_id', linkId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as FileUpload[]
}

export async function createFileUpload(upload: Omit<FileUpload, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('file_uploads')
    .insert([upload])
    .select()
    .single()
  if (error) throw error
  return data as FileUpload
}

export async function getFileShareByToken(token: string) {
  const { data, error } = await supabase
    .from('file_shares')
    .select('*')
    .eq('token', token)
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .single()
  if (error) throw error
  return data as FileShare
}

export async function getFileShareItems(shareId: string) {
  const { data, error } = await supabase
    .from('file_share_items')
    .select('*')
    .eq('share_id', shareId)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data as FileShareItem[]
}

export async function getFileShares() {
  const { data, error } = await supabase
    .from('file_shares')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as FileShare[]
}

export async function deleteFileShare(id: string) {
  const { error } = await supabase
    .from('file_shares')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function getCompanyLogos() {
  const { data, error } = await supabase
    .from('company_logos')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data as CompanyLogo[]
}

export async function createCompanyLogo(logo: { name: string; url: string; sort_order: number }) {
  const { data, error } = await supabase
    .from('company_logos')
    .insert([logo])
    .select()
    .single()
  if (error) throw error
  return data as CompanyLogo
}

export async function updateCompanyLogo(id: string, updates: Partial<CompanyLogo>) {
  const { data, error } = await supabase
    .from('company_logos')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as CompanyLogo
}

export async function deleteCompanyLogo(id: string) {
  const { error } = await supabase
    .from('company_logos')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function reorderCompanyLogos(ids: string[]) {
  const updates = ids.map((id, index) => ({
    id,
    sort_order: index,
  }))
  const { error } = await supabase
    .from('company_logos')
    .upsert(updates)
  if (error) throw error
}

export async function incrementUploadCount(linkId: string) {
  const { data: link } = await supabase
    .from('file_upload_links')
    .select('upload_count')
    .eq('id', linkId)
    .single()
  if (!link) return
  await supabase
    .from('file_upload_links')
    .update({ upload_count: (link.upload_count || 0) + 1 })
    .eq('id', linkId)
}
