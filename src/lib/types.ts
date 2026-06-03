export type CategorySlug =
  | "photography"
  | "video-production"
  | "graphic-design"
  | "development"
  | "ai-enthusiast"
  | "photo-editing"

export interface Project {
  id: string
  title: string
  slug: string
  description: string
  content?: string
  gallery: string[]
  cover_image?: string
  videos: string[]
  tags: string[]
  client: string
  year: number
  role: string
  tools: string[]
  technologies?: string[]
  category?: CategorySlug
  categories: Category[]
  featured: boolean
  external_links: { label: string; url: string }[]
  thumbnail: string
  status: 'draft' | 'published'
  published?: boolean
  project_url?: string
  github_url?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  created_at: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  service?: string
  preferred_contact: 'email' | 'whatsapp'
  status: 'unread' | 'read' | 'replied' | 'archived'
  created_at: string
}

export interface Profile {
  id: string
  email: string
  role: 'admin'
  created_at: string
}

export interface ChatLog {
  id: string
  question: string
  response: string
  category?: string
  created_at: string
}

export interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  content: string
  avatar: string
  rating: number
  featured: boolean
  created_at: string
}

export interface Service {
  id: string
  name: string
  title: string
  description: string
  icon: string
  order: number
  created_at: string
}

export interface Skill {
  id: string
  name: string
  category: string
  level: number
  icon: string
  order: number
  created_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string
  tags: string[]
  published: boolean
  reading_time: number
  created_at: string
  updated_at: string
}
