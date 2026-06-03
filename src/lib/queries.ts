import { supabase } from './supabase'
import type { Project, Category, Service, Testimonial, Skill, BlogPost, ContactMessage } from './types'

export async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*, categories:project_categories(category:categories(*))')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as unknown as Project[]
}

export async function getFeaturedProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*, categories:project_categories(category:categories(*))')
    .eq('status', 'published')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(3)
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
