import { useState, useEffect, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { LiquidGlass } from '@/components/ui/LiquidGlass'
import { Skeleton } from '@/components/ui/Skeleton'

function ToolIcon({ name }: { name: string }) {
  const icons: Record<string, ReactNode> = {
    'React': <svg viewBox="0 0 24 24" fill="none" stroke="#61DAFB" strokeWidth="1.5" className="h-3.5 w-3.5"><circle cx="12" cy="12" r="2.5"/><ellipse cx="12" cy="12" rx="10" ry="3.5" transform="rotate(0 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="3.5" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="3.5" transform="rotate(120 12 12)"/></svg>,
    'TypeScript': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="3" fill="#3178C6"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="13" fontWeight="700">TS</text></svg>,
    'Tailwind CSS': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><path d="M12 2C8 2 6 5 6 8c2-1 4-1 5 0 1.5 1.5 3 3 6 3 4 0 6-3 6-6-2 1-4 1-5 0-1.5-1.5-3-3-6-3z" fill="#06B6D4"/><path d="M6 11c-4 0-6 3-6 6 2-1 4-1 5 0 1.5 1.5 3 3 6 3 4 0 6-3 6-6-2 1-4 1-5 0-1.5-1.5-3-3-6-3z" fill="#06B6D4"/></svg>,
    'Next.js': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="4" fill="#000" className="dark:fill-white"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="13" fontWeight="700" className="dark:fill-black">N</text></svg>,
    'Node.js': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" fill="#339933"/><text x="12" y="16" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">n</text></svg>,
    'Python': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><path d="M12 2C8 2 7 3 7 6v3h5v1H7H5c-3 0-4 2-4 4s1 4 4 4h2v-3c0-2 2-4 4-4h5c2 0 3-1 3-3V6c0-3-1-4-4-4z" fill="#3776AB"/><path d="M18 9v3c0 2-2 4-4 4H9c-2 0-3 1-3 3v2c0 3 1 4 4 4h5c3 0 4-1 4-4v-3h-5v-1h5h2c3 0 4-2 4-4V9h-3z" fill="#FFD43B"/></svg>,
    'PostgreSQL': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><path d="M12 2c-2 0-4 2-4 8s0 8 4 8 4-2 4-8-2-8-4-8zm0 3c1 0 2 1 2 3s-1 4-2 4-2-2-2-4 1-3 2-3z" fill="#4169E1"/><path d="M10 16h4v4h-4z" fill="#4169E1"/></svg>,
    'Supabase': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><path d="M17 2H3l8 12h-4l6 8h10l-8-12h4L17 2z" fill="#3ECF8E"/></svg>,
    'Figma': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect x="9" y="2" width="6" height="6" rx="1" fill="#F24E1E"/><rect x="9" y="8" width="6" height="6" rx="1" fill="#FF7262"/><rect x="9" y="14" width="6" height="6" rx="3" fill="#AB4BF2"/><rect x="3" y="8" width="6" height="6" rx="1" fill="#0ACF83"/><rect x="3" y="2" width="6" height="6" rx="1" fill="#A259FF"/></svg>,
    'Photoshop': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="4" fill="#31A8FF"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">Ps</text></svg>,
    'After Effects': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="4" fill="#9999FF"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">Ae</text></svg>,
    'Premiere Pro': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="4" fill="#9999FF"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">Pr</text></svg>,
    'Git': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><path d="M12 2L3 11l3 3 6-6 6 6 3-3-9-9z" fill="#F05032"/><path d="M12 10l-6 6 3 3 3-3 3 3 3-3-6-6z" fill="#F05032"/></svg>,
    'Docker': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect x="2" y="10" width="3" height="3" rx="0.5" fill="#2496ED"/><rect x="6" y="10" width="3" height="3" rx="0.5" fill="#2496ED"/><rect x="10" y="10" width="3" height="3" rx="0.5" fill="#2496ED"/><rect x="6" y="6" width="3" height="3" rx="0.5" fill="#2496ED"/><rect x="10" y="6" width="3" height="3" rx="0.5" fill="#2496ED"/><rect x="14" y="10" width="3" height="3" rx="0.5" fill="#2496ED"/><path d="M2 14c0 2.5 2 5 6 5 4 0 6-2 6-4" fill="none" stroke="#2496ED" strokeWidth="1"/></svg>,
    'AWS': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><path d="M9 8l3-3 3 3h-2v4h-2V8H9z" fill="#FF9900"/><path d="M6 18h12v1H6z" fill="#FF9900"/><path d="M5 15h14v1H5z" fill="#FF9900"/></svg>,
    'Vercel': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><path d="M12 2L2 22h20L12 2z" fill="#000" className="dark:fill-white"/></svg>,
  }
  return <>{icons[name] || <span className="text-xs opacity-50">▸</span>}</>
}

interface SkillItem {
  name: string
}

export function Skills() {
  const [groups, setGroups] = useState<{ name: string; skills: SkillItem[] }[]>([])
  const [loading, setLoading] = useState(true)

  const fallback = [
    { name: 'Frontend', skills: [{ name: 'React' }, { name: 'TypeScript' }, { name: 'Tailwind CSS' }, { name: 'Next.js' }] },
    { name: 'Backend', skills: [{ name: 'Node.js' }, { name: 'Python' }, { name: 'PostgreSQL' }, { name: 'Supabase' }] },
    { name: 'Design', skills: [{ name: 'Figma' }, { name: 'Photoshop' }, { name: 'After Effects' }, { name: 'Premiere Pro' }] },
    { name: 'Other', skills: [{ name: 'Git' }, { name: 'Docker' }, { name: 'AWS' }, { name: 'Vercel' }] },
  ]

  useEffect(() => {
    async function load() {
      try {
        const data = await (await import('@/lib/queries')).getSkills()
          if (data.length > 0) {
          const grouped: Record<string, SkillItem[]> = {}
          for (const s of data) {
            if (!grouped[s.category]) grouped[s.category] = []
            grouped[s.category].push({ name: s.name })
          }
          setGroups(Object.entries(grouped).map(([name, skills]) => ({ name, skills })))
        } else setGroups(fallback)
      } catch { setGroups(fallback) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  return (
    <section className="relative overflow-hidden px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.6 }}
          className="mb-16 text-center">
          <span className="mb-4 block text-xs font-semibold tracking-widest uppercase text-brand-500 dark:text-brand-400">Expertise</span>
          <h2 className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl">Skills & <span className="text-gradient">Tools</span></h2>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-6 border border-border-light dark:border-border-dark bg-surface-secondary-light dark:bg-surface-secondary-dark">
              <Skeleton className="mb-4 h-4 w-20" />
              <div className="flex flex-wrap gap-2">{Array.from({ length: 4 }).map((_, j) => <Skeleton key={j} className="h-7 w-16 rounded-lg" />)}</div>
            </div>
          )) : groups.map((cat, i) => (
            <motion.div key={cat.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}>
              <LiquidGlass className="rounded-2xl p-6" intensity="subtle">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-500 dark:text-brand-400">{cat.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {cat.skills.map(s => (
                    <span key={s.name} className="inline-flex items-center gap-1.5 rounded-lg border border-border-light dark:border-border-dark bg-white/50 dark:bg-white/5 px-3 py-1.5 text-xs font-medium">
                      <ToolIcon name={s.name} />
                      {s.name}
                    </span>
                  ))}
                </div>
              </LiquidGlass>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
