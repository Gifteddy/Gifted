import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { LiquidGlass } from '@/components/ui/LiquidGlass'

function ToolIcon({ name }: { name: string }) {
  const icons: Record<string, ReactNode> = {
    'React': <svg viewBox="0 0 24 24" fill="none" stroke="#61DAFB" strokeWidth="1.5" className="h-3.5 w-3.5"><circle cx="12" cy="12" r="2.5"/><ellipse cx="12" cy="12" rx="10" ry="3.5" transform="rotate(0 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="3.5" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="3.5" transform="rotate(120 12 12)"/></svg>,
    'TypeScript': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="3" fill="#3178C6"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="13" fontWeight="700">TS</text></svg>,
    'Tailwind CSS': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><path d="M12 2C8 2 6 5 6 8c2-1 4-1 5 0 1.5 1.5 3 3 6 3 4 0 6-3 6-6-2 1-4 1-5 0-1.5-1.5-3-3-6-3z" fill="#06B6D4"/><path d="M6 11c-4 0-6 3-6 6 2-1 4-1 5 0 1.5 1.5 3 3 6 3 4 0 6-3 6-6-2 1-4 1-5 0-1.5-1.5-3-3-6-3z" fill="#06B6D4"/></svg>,
    'Next.js': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="4" fill="#000" className="dark:fill-white"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="13" fontWeight="700" className="dark:fill-black">N</text></svg>,
    'Node.js': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" fill="#339933"/><text x="12" y="16" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">n</text></svg>,
    'PostgreSQL': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><path d="M12 2c-2 0-4 2-4 8s0 8 4 8 4-2 4-8-2-8-4-8zm0 3c1 0 2 1 2 3s-1 4-2 4-2-2-2-4 1-3 2-3z" fill="#4169E1"/><path d="M10 16h4v4h-4z" fill="#4169E1"/></svg>,
    'Supabase': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><path d="M17 2H3l8 12h-4l6 8h10l-8-12h4L17 2z" fill="#3ECF8E"/></svg>,
    'Adobe Photoshop': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="4" fill="#0000FF"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">Ps</text></svg>,
    'Adobe Lightroom': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="4" fill="#0000FF"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">Lr</text></svg>,
    'Lightroom Classic': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="4" fill="#0000FF"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">LrC</text></svg>,
    'Adobe Illustrator': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="4" fill="#FF9A00"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">Ai</text></svg>,
    'Adobe Premiere Pro': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="4" fill="#5a189a"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">Pr</text></svg>,
    'Adobe After Effects': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="4" fill="#5a189a"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">Ae</text></svg>,
    'Capture One': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="4" fill="#0D2B3E"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">C1</text></svg>,
    'Camera Raw': <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.5" className="h-3.5 w-3.5"><rect x="2" y="7" width="20" height="13" rx="2"/><circle cx="12" cy="13" r="3"/><path d="M7 7V5a1 1 0 0 1 1-1h2l1.5-1.5h1L14 4h2a1 1 0 0 1 1 1v2"/></svg>,
    'DaVinci Resolve': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="4" fill="#1A1A2E"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="8" fontWeight="700">DR</text></svg>,
    'CapCut': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="4" fill="#1E1E1E"/><path d="M8 6v12l10-6L8 6z" fill="#00D4FF"/></svg>,
    'Moho': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="4" fill="#6C3CC7"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">Mo</text></svg>,
    'Lottie': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="4" fill="#00D4AA"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">Lo</text></svg>,
    'HTML5': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="3" fill="#E34F26"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">H5</text></svg>,
    'CSS3': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="3" fill="#1572B6"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">C3</text></svg>,
    'JavaScript': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="3" fill="#F7DF1E"/><text x="12" y="17" textAnchor="middle" fill="#000" fontSize="10" fontWeight="700">JS</text></svg>,
    'Framer Motion': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="4" fill="#0055FF"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">FM</text></svg>,
    'Vite': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="4" fill="#646CFF"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="12" fontWeight="700">V</text></svg>,
    'React Router': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="4" fill="#CA4245"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="8" fontWeight="700">RR</text></svg>,
    'Express.js': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="4" fill="#000" className="dark:fill-white"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="8" fontWeight="700" className="dark:fill-black">Ex</text></svg>,
    'Render': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="4" fill="#000" className="dark:fill-white"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" className="dark:fill-black">R</text></svg>,
    'Netlify': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="4" fill="#00C7B7"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="8" fontWeight="700">Nf</text></svg>,
    'Cloudinary': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="4" fill="#2B82D6"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="8" fontWeight="700">Cl</text></svg>,
    'Cloudflare': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="4" fill="#F38020"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="8" fontWeight="700">CF</text></svg>,
    'VS Code': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="4" fill="#007ACC"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">VS</text></svg>,
    'GitHub': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><path d="M12 2C6.5 2 2 6.5 2 12c0 4.4 2.9 8.2 6.9 9.5.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.4-3.4-1.4-.5-1.2-1.2-1.5-1.2-1.5-1-.7 0-.7 0-.7 1 .1 1.6 1.1 1.6 1.1.9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1.1-2.7-.1-.3-.5-1.3.1-2.7 0 0 .9-.3 2.9 1.1A10 10 0 0 1 12 7c1 0 2 .1 2.8.3 2-1.4 2.9-1.1 2.9-1.1.6 1.4.2 2.4.1 2.7.7.7 1.1 1.6 1.1 2.7 0 3.9-2.4 4.7-4.6 4.9.4.3.7 1 .7 1.9v2.8c0 .3.2.6.7.5C19.1 20.2 22 16.4 22 12c0-5.5-4.5-10-10-10z" fill="#000" className="dark:fill-white"/></svg>,
    'NPM': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="3" fill="#CB3837"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">n</text></svg>,
    'Yarn': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="4" fill="#2C8EBB"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">Yn</text></svg>,
    'ChatGPT': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="5" fill="#10A37F"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">CG</text></svg>,
    'Gemini': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="5" fill="#1A73E8"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="8" fontWeight="700">Ge</text></svg>,
    'DeepSeek': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="5" fill="#4F46E5"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="7" fontWeight="700">DS</text></svg>,
    'Grok': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="5" fill="#1DA1F2"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="8" fontWeight="700">Gk</text></svg>,
    'GitHub Copilot': <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><rect width="24" height="24" rx="5" fill="#58A6FF"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="7" fontWeight="700">GHC</text></svg>,
  }
  return <>{icons[name] || <span className="text-xs opacity-50">▸</span>}</>
}

const toolGroups = [
  {
    name: 'Design',
    skills: ['Adobe Photoshop', 'Adobe Illustrator', 'Adobe Lightroom', 'Lightroom Classic', 'Capture One', 'Camera Raw'],
  },
  {
    name: 'Video & Motion',
    skills: ['Adobe Premiere Pro', 'Adobe After Effects', 'DaVinci Resolve', 'CapCut', 'Moho', 'Lottie'],
  },
  {
    name: 'Frontend Development',
    skills: ['HTML5', 'CSS3', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'Framer Motion', 'Vite', 'React Router', 'Redux'],
  },
  {
    name: 'Backend & Database',
    skills: ['Node.js', 'Express.js', 'MongoDB', 'PostgreSQL', 'Supabase', 'Firebase'],
  },
  {
    name: 'Cloud & Deployment',
    skills: ['Vercel', 'Render', 'Netlify', 'Cloudinary', 'Cloudflare'],
  },
  {
    name: 'Development Tools',
    skills: ['VS Code', 'Git', 'GitHub', 'NPM', 'Yarn'],
  },
  {
    name: 'AI & Productivity',
    skills: ['ChatGPT', 'Gemini', 'DeepSeek', 'Grok', 'GitHub Copilot'],
  },
]

const expertiseList = [
  'Photography', 'Photo Editing', 'Video Production', 'Video Editing',
  'Graphic Design', 'Brand Identity Design',
  'Creative Direction', 'Art Direction', 'Storytelling',
  'Content Creation', 'Social Media Content', 'Short-form Content',
  'Reels Production', 'Content Strategy',
  'Web Development', 'Full Stack Development', 'Frontend Engineering',
  'API Development', 'Software Architecture', 'Database Design',
  'Cloud Architecture',
]

export function Skills() {
  return (
    <section className="relative overflow-hidden px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.6 }}
          className="mb-16 text-center">
          <span className="mb-4 block text-xs font-semibold tracking-widest uppercase text-brand-500 dark:text-brand-400">Toolbox</span>
          <h2 className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl">Skills & <span className="text-gradient">Tools</span></h2>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {toolGroups.map((cat, i) => (
            <motion.div key={cat.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}>
              <LiquidGlass className="rounded-2xl p-6" intensity="subtle">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-500 dark:text-brand-400">{cat.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {cat.skills.map(s => (
                    <span key={s} className="inline-flex items-center gap-1.5 rounded-lg border border-border-light dark:border-border-dark bg-white/50 dark:bg-white/5 px-3 py-1.5 text-xs font-medium">
                      <ToolIcon name={s} />
                      {s}
                    </span>
                  ))}
                </div>
              </LiquidGlass>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mt-24 text-center">
          <span className="mb-4 block text-xs font-semibold tracking-widest uppercase text-brand-500 dark:text-brand-400">What I Do</span>
          <h2 className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl">Expertise</h2>
          <div className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-3">
            {expertiseList.map((item, i) => (
              <motion.span key={item} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.03 }}
                className="rounded-full border border-border-light dark:border-border-dark bg-surface-secondary-light/50 dark:bg-surface-secondary-dark/50 px-5 py-2 text-sm font-medium"
              >
                {item}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
