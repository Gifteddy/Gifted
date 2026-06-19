import { supabase } from '@/lib/supabase'

const contextTriggers = [
  'project', 'projects', 'portfolio', 'work', 'show me',
  'service', 'services', 'offer', 'provide',
  'skill', 'skills', 'technology', 'technologies', 'tech stack', 'tools',
  'photography', 'photo', 'video', 'production', 'film',
  'graphic design', 'design', 'development', 'website', 'app',
  'photo editing', 'retouch', 'editing',
  'category', 'categories', 'type',
  'latest', 'recent', 'newest', 'sample', 'example',
  'build', 'built', 'created', 'made',
  'pricing', 'price', 'cost', 'rate', 'hire',
  'client', 'testimonial', 'review',
  'blog', 'article', 'post', 'write',
  'case study', 'detail', 'tell me about',
]

function needsContext(message: string): boolean {
  const lower = message.toLowerCase()
  return contextTriggers.some(t => lower.includes(t))
}

let cachedContext: string | null = null
let cachePromise: Promise<string> | null = null

export async function fetchChatContext(): Promise<string> {
  if (cachedContext !== null) return cachedContext
  if (cachePromise !== null) return cachePromise

  cachePromise = fetchFreshContext()
  cachedContext = await cachePromise
  return cachedContext
}

async function fetchFreshContext(): Promise<string> {
  try {
    const [projectsRaw, servicesRaw, skillsRaw] = await Promise.all([
      supabase.from('projects').select('title, slug, description, category, featured').or('status.eq.published,published.eq.true').order('display_order').limit(20),
      supabase.from('services').select('title, description').order('order'),
      supabase.from('skills').select('name, category, level').order('order'),
    ])

    const sections: string[] = []

    const projects = projectsRaw.data
    if (projects?.length) {
      sections.push('PORTFOLIO PROJECTS:')
      for (const p of projects) {
        const cat = p.category?.replace(/-/g, ' ') || ''
        sections.push(`- ${p.title}${p.featured ? ' (featured)' : ''}${cat ? ` [${cat}]` : ''}${p.description ? `: ${p.description.slice(0, 120)}` : ''}`)
      }
    }

    const services = servicesRaw.data
    if (services?.length) {
      sections.push('')
      sections.push('SERVICES:')
      for (const s of services) {
        sections.push(`- ${s.title}${s.description ? `: ${s.description.slice(0, 200)}` : ''}`)
      }
    }

    const skills = skillsRaw.data
    if (skills?.length) {
      const byCategory: Record<string, string[]> = {}
      for (const s of skills) {
        const cat = s.category || 'Other'
        if (!byCategory[cat]) byCategory[cat] = []
        byCategory[cat].push(s.name)
      }
      sections.push('')
      sections.push('SKILLS:')
      for (const [cat, names] of Object.entries(byCategory)) {
        sections.push(`- ${cat}: ${names.join(', ')}`)
      }
    }

    return sections.join('\n')
  } catch {
    return ''
  }
}

export { needsContext }
