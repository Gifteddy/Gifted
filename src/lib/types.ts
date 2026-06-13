export type CategorySlug =
  | "photography"
  | "video-production"
  | "graphic-design"
  | "development"
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

export interface FileUploadLink {
  id: string
  label: string
  token: string
  expires_at: string
  max_file_size: number
  max_files_per_upload: number
  max_total_uploads: number | null
  allowed_extensions: string
  is_active: boolean
  upload_count: number
  created_at: string
}

export interface FileUpload {
  id: string
  link_id: string
  sender_name: string
  sender_email: string
  message: string
  files: { name: string; url: string; size: number; type: string }[]
  created_at: string
}

export interface FileShare {
  id: string
  label: string
  description: string
  token: string
  password_hash: string | null
  expires_at: string
  is_active: boolean
  file_count: number
  created_at: string
}

export interface FileShareComment {
  id: string
  share_id: string
  item_id: string | null
  author_name: string
  content: string
  created_at: string
}

export interface FileShareItem {
  id: string
  share_id: string
  name: string
  url: string
  type: string
  size: number
  sort_order: number
  created_at: string
}

export type NotificationType = 'message' | 'testimonial' | 'file_upload' | 'share_viewed'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  description: string
  link: string
  read: boolean
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
