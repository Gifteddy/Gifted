import { useState, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { LiquidGlass } from '@/components/ui/LiquidGlass'
import { PortraitCard } from '@/components/ui/PortraitCard'
import { cn } from '@/lib/utils'
import { img } from '@/lib/images'

const label = 'text-[11px] font-semibold tracking-[0.2em] uppercase'
const heading = 'font-display text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl'

const chapters = [
  {
    id: 'creator', num: '01',
    title: 'The Creator',
    subtitle: 'Born to build',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6"><path d="M12 3v4m0 10v4m-6-8H2m20 0h-4m-2.5-7.5L12 3l-3.5 3.5M12 21l3.5-3.5M4.5 4.5 7 7m10 10 2.5 2.5M19.5 4.5 17 7M7 17l-2.5 2.5"/></svg>,
    content: 'I drew before I could write. Sketching worlds that only existed in my mind. That urge to create never left — it only found new languages.',
  },
  {
    id: 'designer', num: '02',
    title: 'The Designer',
    subtitle: 'Precision & vision',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6"><path d="M12 19V5m0 0-7 7m7-7 7 7"/><path d="M12 3a9 9 0 1 0 9 9"/></svg>,
    content: 'I needed a design. Couldn\'t find anyone who could execute my vision the way I saw it. So I learned. Design became my first functional language.',
  },
  {
    id: 'developer', num: '03',
    title: 'The Developer',
    subtitle: 'Building the bridge',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><rect x="2" y="3" width="20" height="18" rx="2"/></svg>,
    content: 'I studied IT at FUTO. But my real education happened in the hours between — teaching myself to build what I could imagine. Code became my bridge between ideas and reality.',
  },
  {
    id: 'storyteller', num: '04',
    title: 'The Storyteller',
    subtitle: 'Every frame matters',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6"><circle cx="12" cy="12" r="10"/><path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/></svg>,
    content: 'My father was into photography. I picked up his camera and never put it down. Film, photo, poetry — every medium is a way of telling a story that needs to be heard.',
  },
  {
    id: 'builder', num: '05',
    title: 'The Builder',
    subtitle: 'Ideas made real',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg>,
    content: 'Every skill became another tool for expression. Not for titles. Not for labels. For bringing ideas to life. I don\'t just make things — I build experiences people remember.',
  },
]

const skillModules = [
  { name: 'Post Production', level: 95, tag: 'Premiere · DaVinci · AE', category: 'Motion' },
  { name: 'Graphic Design', level: 92, tag: 'Photoshop · Illustrator · Brand', category: 'Visual' },
  { name: 'Photography', level: 88, tag: 'Portrait · Editorial · Lighting', category: 'Visual' },
  { name: 'Video Production', level: 85, tag: 'Cinematic · Documentary · Commercial', category: 'Motion' },
  { name: 'Creative Strategy', level: 90, tag: 'Vision · Branding · Direction', category: 'Direction' },
  { name: 'Narrative Design', level: 93, tag: 'Story · Script · Copy · Poetry', category: 'Narrative' },
  { name: 'UI/UX Design', level: 82, tag: 'Interface · Interaction · Responsive', category: 'Digital' },
  { name: 'Frontend Dev', level: 78, tag: 'React · TypeScript · Tailwind', category: 'Digital' },
  { name: 'Full Stack Dev', level: 72, tag: 'Node.js · Supabase · PostgreSQL', category: 'Digital' },
  { name: 'AI Explorer', level: 75, tag: 'Prompt Engineering · LLMs · Generative AI', category: 'Digital' },
  { name: 'Poetry', level: 85, tag: 'Verse · Prose · Spoken Word', category: 'Narrative' },
]

const milestones = [
  { num: '01', title: 'Curiosity', desc: 'Drawing as a child. Sketching worlds that only existed in my imagination.' },
  { num: '02', title: 'Creation', desc: 'Making my first real thing. Realizing I could bring ideas to life.' },
  { num: '03', title: 'Discovery', desc: 'Picking up my father\'s camera. Finding a second creative language.' },
  { num: '04', title: 'Experimentation', desc: 'Learning design by doing. Failing. Iterating. Growing.' },
  { num: '05', title: 'Mastery', desc: 'Building a toolkit across disciplines. Becoming fluent in multiple mediums.' },
  { num: '06', title: 'Expression', desc: 'Using every skill as a tool for storytelling. Finding my voice.' },
  { num: '07', title: 'Impact', desc: 'Creating work that people remember. Building the future of Gifted.' },
]

const beliefs = [
  { num: '01', text: 'Design is precision and organized creative chaos.' },
  { num: '02', text: 'Technology should connect people and help businesses grow.' },
  { num: '03', text: 'Stories create emotional impact that outlasts any product.' },
  { num: '04', text: 'Great experiences are remembered long after the project ends.' },
  { num: '05', text: 'Vision should guide execution — not the other way around.' },
  { num: '06', text: 'Creative freedom fuels the best work of your life.' },
]

const thoughts = [
  { text: 'Every frame should tell a story.', tag: 'Cinema' },
  { text: 'The best designs feel inevitable.', tag: 'Design' },
  { text: 'Technology is at its best when it feels invisible.', tag: 'Tech' },
  { text: 'Creativity begins where limitations end.', tag: 'Philosophy' },
  { text: 'Your style is what happens when you stop trying to have one.', tag: 'Wisdom' },
  { text: 'The goal is not to be understood. The goal is to be felt.', tag: 'Truth' },
  { text: 'In my mind I live in my own creative empire.', tag: 'The Empire' },
  { text: 'Value is what people remember long after the project ends.', tag: 'Legacy' },
]

const processSteps = [
  { step: '01', title: 'Vision', desc: 'The first thing I look for is the vision. Everything else is built around that.' },
  { step: '02', title: 'Research', desc: 'Understanding the problem, the audience, and what success looks like.' },
  { step: '03', title: 'Strategy', desc: 'Mapping the path from idea to execution. Planning every detail.' },
  { step: '04', title: 'Creation', desc: 'Bringing the vision to life across design, code, film, and story.' },
  { step: '05', title: 'Refinement', desc: 'Iterating until every pixel earns its place. Details make the difference.' },
  { step: '06', title: 'Launch', desc: 'Delivering an experience that people will remember and return to.' },
]

const outcomes = [
  { title: 'Creative + Technical Thinking', desc: 'I bridge imagination and execution. Vision without skill is just a dream.' },
  { title: 'Attention To Detail', desc: 'The difference between good and exceptional lives in the details.' },
  { title: 'Fast Learning', desc: 'New tool, new medium, new challenge — I adapt quickly and deliver.' },
  { title: 'Strong Execution', desc: 'Ideas are cheap. Execution is everything. I get things done.' },
  { title: 'End-To-End Delivery', desc: 'From concept to launch — I own the process and deliver results.' },
  { title: 'Vision-Driven Work', desc: 'Every decision ties back to the core vision. No feature for features\' sake.' },
]

export default function About() {
  const [activeChapter, setActiveChapter] = useState(0)

  const mainRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: mainRef, offset: ['start end', 'end start'] })

  const journeyRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: journeyProgress } = useScroll({ target: journeyRef, offset: ['start end', 'end start'] })
  const pathLength = useTransform(journeyProgress, [0, 0.6], [0, 1])

  const futureRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: futureProgress } = useScroll({ target: futureRef, offset: ['start end', 'end start'] })
  const futureScale = useTransform(futureProgress, [0, 0.5, 1], [0.88, 1, 0.88])
  const futureOpacity = useTransform(futureProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])

  return (
    <main ref={mainRef} className="relative min-h-screen bg-surface-light text-text-light dark:bg-surface-dark dark:text-text-dark overflow-hidden">

      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] z-50 origin-left bg-gradient-to-r from-brand-500 via-gold-400 to-brand-500"
        style={{ scaleX: scrollYProgress }}
      />

      {/* ═══════════════ 1. HERO ═══════════════ */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            className="absolute top-1/4 left-1/3 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-brand-500/10 blur-[160px]"
            animate={{ scale: [1, 1.15, 1], x: [0, 30, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/3 right-1/4 h-[450px] w-[450px] rounded-full bg-gold-500/8 blur-[130px]"
            animate={{ scale: [1.1, 1, 1.1], x: [0, -20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full border border-brand-500/8 dark:border-white/[0.03]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[900px] w-[900px] rounded-full border border-gold-500/5 dark:border-white/[0.02]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[1100px] w-[1100px] rounded-full border border-brand-500/3 dark:border-white/[0.015]" />

          {/* ─── Solar System Orbits ─── */}
          <style>{`
            @keyframes orbit-350 { from { transform: rotate(0deg) translateX(350px) rotate(0deg); } to { transform: rotate(360deg) translateX(350px) rotate(-360deg); } }
            @keyframes orbit-450 { from { transform: rotate(0deg) translateX(450px) rotate(0deg); } to { transform: rotate(360deg) translateX(450px) rotate(-360deg); } }
            @keyframes orbit-550 { from { transform: rotate(0deg) translateX(550px) rotate(0deg); } to { transform: rotate(360deg) translateX(550px) rotate(-360deg); } }
          `}</style>
          <div className="absolute inset-0 opacity-70">
            {[
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3 sm:h-5 sm:w-5"><polygon points="5 3 19 12 5 21 5 3"/></svg>, radius: 350, speed: '35s', delay: '0s', label: 'Post Production' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3 sm:h-5 sm:w-5"><path d="M12 19V5m0 0-7 7m7-7 7 7"/><circle cx="12" cy="12" r="10"/></svg>, radius: 350, speed: '35s', delay: '-11.67s', label: 'Graphic Design' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3 sm:h-5 sm:w-5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>, radius: 350, speed: '35s', delay: '-23.33s', label: 'Photography' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3 sm:h-5 sm:w-5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>, radius: 450, speed: '45s', delay: '0s', label: 'Video Production' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3 sm:h-5 sm:w-5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>, radius: 450, speed: '45s', delay: '-9s', label: 'UI/UX Design' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3 sm:h-5 sm:w-5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>, radius: 450, speed: '45s', delay: '-18s', label: 'Frontend Dev' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3 sm:h-5 sm:w-5"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>, radius: 450, speed: '45s', delay: '-27s', label: 'Full Stack Dev' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3 sm:h-5 sm:w-5"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>, radius: 450, speed: '45s', delay: '-36s', label: 'Creative Strategy' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3 sm:h-5 sm:w-5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>, radius: 550, speed: '55s', delay: '0s', label: 'Narrative Design' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3 sm:h-5 sm:w-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>, radius: 550, speed: '55s', delay: '-27.5s', label: 'Poetry' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3 sm:h-5 sm:w-5"><path d="M12 2a8 8 0 0 0-8 8c0 4 2 5 4.5 8.5a2 2 0 0 0 3.5 0C14 15 20 14 20 10a8 8 0 0 0-8-8z"/><circle cx="10" cy="10" r="1.5" fill="currentColor" stroke="none"/><circle cx="14" cy="10" r="1.5" fill="currentColor" stroke="none"/></svg>, radius: 550, speed: '55s', delay: '-13.75s', label: 'AI Explorer' },
            ].map((item) => {
              const orbitName = `orbit-${item.radius}`
              return (
                <div
                  key={item.label}
                  className="absolute top-1/2 left-1/2 -mt-3 -ml-3 sm:-mt-[20px] sm:-ml-[20px]"
                  style={{
                    animation: `${orbitName} ${item.speed} linear infinite`,
                    animationDelay: item.delay,
                  }}
                >
                  <div className="group relative flex items-center justify-center h-6 w-6 sm:h-10 sm:w-10 rounded-full bg-brand-500/10 dark:bg-white/5 text-brand-500 dark:text-brand-400 hover:bg-brand-500/20 dark:hover:bg-white/10 hover:scale-110 transition-all duration-500">
                    {item.icon}
                    <span className="absolute -bottom-7 sm:-bottom-8 left-1/2 -translate-x-1/2 text-[8px] sm:text-[10px] font-medium tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-500 text-text-muted-light dark:text-text-muted-dark translate-y-1 group-hover:translate-y-0">
                      {item.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="relative z-10 w-full max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className={cn(label, 'text-brand-500 dark:text-brand-400')}>Ibiam Iheanyi Victory</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.12, ease: [0.25, 0.1, 0.25, 1] }}
            className="font-display mt-6 text-[clamp(2.5rem,8vw,6rem)] font-bold leading-[0.92] tracking-[-0.03em]"
          >
            ABOUT{' '}
            <span className="text-gradient">GIFTED</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-4 text-sm font-semibold tracking-[0.15em] uppercase text-text-muted-light dark:text-text-muted-dark"
          >
            Creative Technologist. AI Explorer. Visual Storyteller. Builder of Experiences.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.38 }}
            className="mt-8 max-w-lg mx-auto text-base leading-relaxed text-text-muted-light dark:text-text-muted-dark"
          >
            I don&apos;t just create visuals. I create experiences people remember.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <Link to="/contact" className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-brand-500 px-7 py-3.5 text-sm font-semibold text-white transition-all duration-500 hover:shadow-xl hover:shadow-brand-500/30">
              <span className="relative z-10">Start a Project</span>
              <span className="relative z-10 text-lg transition-transform duration-300 group-hover:translate-x-1">→</span>
              <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-gold-500 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </Link>
            <Link to="/projects" className="inline-flex items-center gap-2 rounded-full border border-border-light dark:border-border-dark px-7 py-3.5 text-sm font-semibold text-text-light dark:text-text-dark transition-all duration-300 hover:bg-surface-secondary-light dark:hover:bg-surface-secondary-dark hover:scale-[1.02]">
              View Projects
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] tracking-[0.25em] uppercase text-text-muted-light dark:text-text-muted-dark font-medium">Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="h-8 w-px bg-text-muted-light dark:bg-text-muted-dark/50" />
        </motion.div>
      </section>

      {/* ═══════════════ 2. WHO IS GIFTED ═══════════════ */}
      <section className="relative px-6 py-32 lg:py-44">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-light dark:via-border-dark to-transparent" />

        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            className="mb-16"
          >
            <span className={cn(label, 'text-brand-500 dark:text-brand-400')}>Chapter Index</span>
            <h2 className={cn(heading, 'mt-4')}>
              Who Is <span className="text-gradient">Gifted</span>
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-text-muted-light dark:text-text-muted-dark">
              The name started as an affirmation. A reminder that potential is something you grow into. Here are the five sides of that identity.
            </p>
          </motion.div>

          <div className="grid gap-5 lg:grid-cols-5">
            {chapters.map((ch, i) => {
              const isActive = activeChapter === i
              return (
                <motion.button
                  key={ch.id}
                  layout
                  onMouseEnter={() => setActiveChapter(i)}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.06, layout: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } }}
                  className={cn(
                    'text-left relative',
                    !isActive && 'brightness-[0.7] saturate-[0.6] hover:brightness-[0.9] hover:saturate-[0.8]',
                    isActive && 'lg:col-span-2',
                  )}
                >
                  <LiquidGlass intensity={isActive ? 'medium' : 'subtle'} className={cn(
                    'relative overflow-hidden rounded-2xl p-6 sm:p-8 h-full',
                  )}>
                    <motion.div
                      animate={{ opacity: isActive ? 1 : 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none"
                    >
                      <img src={img(i + 2)} alt="" className="absolute inset-0 w-full h-full object-cover object-top" style={{ filter: 'blur(4px) saturate(0.8)' }} />
                      <div className="absolute inset-0 bg-white/70 dark:bg-black/70" />
                      <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-brand-500/15 blur-[70px]" />
                    </motion.div>

                    <div className="relative z-10 flex flex-col h-full min-h-[180px]">
                      <div className={cn(
                        'flex items-center justify-between transition-all duration-500',
                        isActive ? 'mb-6' : 'mb-0',
                      )}>
                        <span className={cn(
                          'font-display text-3xl font-bold transition-colors duration-500',
                          isActive ? 'text-brand-500 dark:text-brand-400' : 'text-text-muted-light/30 dark:text-text-muted-dark/30',
                        )}>
                          {ch.num}
                        </span>
                        <span className={cn(
                          'transition-all duration-500',
                          isActive ? 'text-brand-500 dark:text-brand-400' : 'text-text-muted-light/40 dark:text-text-muted-dark/40',
                        )}>
                          {ch.icon}
                        </span>
                      </div>

                      <motion.div
                        animate={{ height: isActive ? 'auto' : 0, opacity: isActive ? 1 : 0 }}
                        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                        className="overflow-hidden"
                      >
                        <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-brand-500 dark:text-brand-400">
                          {ch.subtitle}
                        </span>
                        <h3 className="font-display mt-2 text-2xl font-bold sm:text-3xl">{ch.title}</h3>
                        <p className="mt-3 text-sm leading-relaxed text-text-muted-light dark:text-text-muted-dark">{ch.content}</p>
                      </motion.div>

                      <motion.div
                        animate={{ opacity: isActive ? 0 : 1 }}
                        transition={{ duration: 0.3 }}
                        className="mt-auto pt-4"
                      >
                        <h3 className="font-display text-lg font-bold sm:text-xl">{ch.title}</h3>
                      </motion.div>
                    </div>
                  </LiquidGlass>
                </motion.button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ 3. CREATIVE OS ═══════════════ */}
      <section className="relative px-6 py-32 lg:py-44 bg-surface-secondary-light dark:bg-surface-secondary-dark">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-light dark:via-border-dark to-transparent" />

        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            className="mb-16"
          >
            <span className={cn(label, 'text-gold-500 dark:text-gold-400')}>System Overview</span>
            <h2 className={cn(heading, 'mt-4')}>
              Creative <span className="text-gradient">OS</span>
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-text-muted-light dark:text-text-muted-dark">
              Every skill is a module in my operating system. Each one handles a different type of creative problem.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {skillModules.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.025 }}
              >
                <div className="group relative overflow-hidden rounded-2xl border border-border-light dark:border-border-dark/50 p-5 transition-all duration-500 hover:ring-1 hover:ring-brand-500/20 hover:shadow-lg hover:-translate-y-0.5 dark:hover:bg-white/[0.02]">
                  <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-brand-500/8 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-semibold tracking-wider uppercase text-brand-500/60 dark:text-brand-400/60">{s.category}</span>
                      <span className="text-[11px] font-mono font-medium text-text-muted-light dark:text-text-muted-dark">{s.level}%</span>
                    </div>
                    <h3 className="font-display text-base font-bold sm:text-lg">{s.name}</h3>
                    <p className="mt-1 text-[11px] text-text-muted-light dark:text-text-muted-dark">{s.tag}</p>
                    <div className="mt-3 h-1.5 rounded-full bg-gray-200 dark:bg-white/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-gold-500"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${s.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: i * 0.03, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ 4. THE JOURNEY ═══════════════ */}
      <section ref={journeyRef} className="relative px-6 py-32 lg:py-44">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-light dark:via-border-dark to-transparent" />

        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            className="mb-20"
          >
            <span className={cn(label, 'text-brand-500 dark:text-brand-400')}>Timeline</span>
            <h2 className={cn(heading, 'mt-4')}>
              The <span className="text-gradient">Journey</span>
            </h2>
          </motion.div>

          <div className="relative">
            <svg className="absolute left-[35px] md:left-[55px] top-0 bottom-0 w-[2px] overflow-visible hidden sm:block" preserveAspectRatio="none">
              <line x1="0" y1="0" x2="0" y2="100%" stroke="url(#pathGradient)" strokeWidth="2" strokeLinecap="round" />
              <motion.line
                x1="0" y1="0" x2="0" y2="100%"
                stroke="url(#pathGradientFill)"
                strokeWidth="2"
                strokeLinecap="round"
                style={{ pathLength }}
              />
              <defs>
                <linearGradient id="pathGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--brand-500, #7c3aed)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
                <linearGradient id="pathGradientFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--brand-500, #7c3aed)" />
                  <stop offset="50%" stopColor="var(--gold-500, #eab308)" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>

            <div className="space-y-12 sm:space-y-16">
              {milestones.map((m, i) => (
                <motion.div
                  key={m.num}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <LiquidGlass intensity="subtle" className="group relative rounded-2xl p-5 sm:p-7 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                    {/* Number watermark */}
                    <span className="absolute top-0 right-4 font-display text-7xl sm:text-8xl lg:text-9xl font-bold text-brand-500/[0.04] dark:text-white/[0.02] leading-none pointer-events-none select-none">
                      {m.num}
                    </span>

                    <div className="relative flex items-start gap-4 sm:gap-7">
                      {/* Timeline dot (hidden on very small screens) */}
                      <div className="hidden sm:flex shrink-0 flex-col items-center z-10 mt-2">
                        <div className="h-4 w-4 rounded-full border-2 border-brand-500 dark:border-brand-400 bg-surface-light dark:bg-surface-dark group-hover:bg-brand-500 dark:group-hover:bg-brand-400 transition-colors duration-500" />
                      </div>

                      {/* Image — visible on all screens */}
                      <div className="shrink-0 h-16 w-16 sm:h-32 sm:w-32 z-10 rounded-xl sm:rounded-2xl overflow-hidden shadow-md ring-1 ring-brand-500/10 dark:ring-white/[0.05] transition-all duration-500 group-hover:shadow-lg group-hover:ring-brand-500/30 dark:group-hover:ring-white/[0.1]">
                        <PortraitCard
                          src={img([9, 10, 11, 12, 15, 16, 17][i])}
                          alt={m.title}
                          className="h-full w-full"
                          hover
                          priority
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <span className="font-display text-xs sm:text-sm font-bold tracking-[0.15em] uppercase text-brand-500 dark:text-brand-400">
                          Step {m.num}
                        </span>
                        <h3 className="font-display mt-1 text-lg sm:text-2xl lg:text-3xl font-bold leading-tight">{m.title}</h3>
                        <p className="mt-1.5 sm:mt-2 max-w-lg text-xs sm:text-sm leading-relaxed text-text-muted-light dark:text-text-muted-dark">{m.desc}</p>
                      </div>
                    </div>
                  </LiquidGlass>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ 5. PHILOSOPHY ═══════════════ */}
      <section className="relative px-6 py-32 lg:py-44 bg-surface-secondary-light dark:bg-surface-secondary-dark">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-light dark:via-border-dark to-transparent" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/4 right-0 w-[35vw] h-[50vh] bg-gradient-to-bl from-brand-500/[0.04] dark:from-white/[0.02] to-transparent rounded-full" />
          <div className="absolute bottom-1/4 left-0 w-[30vw] h-[40vh] bg-gradient-to-tr from-gold-500/[0.04] dark:from-white/[0.015] to-transparent rounded-full" />
        </div>

        <div className="mx-auto max-w-5xl relative">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <span className={cn(label, 'text-brand-500 dark:text-brand-400')}>Manifesto</span>
            <h2 className={cn(heading, 'mt-4')}>
              What I <span className="text-gradient">Believe</span>
            </h2>
          </motion.div>

          <div className="mt-16 space-y-12">
            {beliefs.map((b, i) => {
              const alignLeft = i % 2 === 0
              return (
                <motion.div
                  key={b.num}
                  initial={{ opacity: 0, x: alignLeft ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className={cn('flex items-start gap-6 sm:gap-10', alignLeft ? '' : 'sm:flex-row-reverse sm:text-right')}
                >
                  <span className={cn(
                    'font-display text-5xl sm:text-7xl lg:text-8xl font-bold leading-none shrink-0',
                    alignLeft ? 'text-brand-500/20 dark:text-brand-400/20' : 'text-gold-500/25 dark:text-gold-400/25',
                  )}>
                    {b.num}
                  </span>
                  <p className={cn(
                    'font-display text-xl sm:text-2xl lg:text-3xl font-light leading-snug max-w-2xl',
                    alignLeft ? '' : 'sm:ml-auto',
                  )}>
                    &ldquo;{b.text}&rdquo;
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ 6. THE MIND OF GIFTED ═══════════════ */}
      <section className="relative px-6 py-32 lg:py-44">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-light dark:via-border-dark to-transparent" />

        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            className="mb-16"
          >
            <span className={cn(label, 'text-brand-500 dark:text-brand-400')}>The Mind of Gifted</span>
            <h2 className={cn(heading, 'mt-4')}>
              Thoughts & <span className="text-gradient">Reflections</span>
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-text-muted-light dark:text-text-muted-dark">
              Fragments from a mind that never stops writing. Glimpses into how I think.
            </p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {thoughts.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.03 }}
                style={{ marginTop: i % 4 === 1 ? '2rem' : i % 4 === 3 ? '2rem' : '0' }}
                className={cn(i === 0 && 'sm:col-span-2 lg:col-span-2', i === 7 && 'sm:col-span-2 lg:col-span-2')}
              >
                <LiquidGlass intensity="subtle" className="relative overflow-hidden rounded-2xl p-6 sm:p-8 h-full transition-all duration-500 hover:shadow-lg hover:-translate-y-0.5">
                  <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-brand-500/10 blur-[50px]" />
                  <span className="relative z-10 text-[10px] font-semibold tracking-widest uppercase text-brand-500 dark:text-brand-400">{t.tag}</span>
                  <p className="relative z-10 mt-3 text-base leading-relaxed italic sm:text-lg text-text-light dark:text-text-dark">
                    &ldquo;{t.text}&rdquo;
                  </p>
                </LiquidGlass>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ 7. HOW I WORK ═══════════════ */}
      <section className="relative px-6 py-32 lg:py-44 bg-surface-secondary-light dark:bg-surface-secondary-dark">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-light dark:via-border-dark to-transparent" />

        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            className="mb-16"
          >
            <span className={cn(label, 'text-gold-500 dark:text-gold-400')}>Process</span>
            <h2 className={cn(heading, 'mt-4')}>
              How I <span className="text-gradient">Work</span>
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-text-muted-light dark:text-text-muted-dark">
              The first thing I look for is the vision. Everything else is built around that.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {processSteps.map((p, i) => (
              <motion.div
                key={p.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <div className="relative h-full rounded-2xl border border-border-light dark:border-border-dark/50 p-6 transition-all duration-500 hover:shadow-lg hover:-translate-y-0.5 dark:hover:bg-white/[0.02] group">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-display text-3xl font-bold text-brand-500/20 dark:text-brand-400/20">{p.step}</span>
                    {i < 5 && (
                      <svg className="hidden lg:block h-4 w-4 text-text-muted-light/30 dark:text-text-muted-dark/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M5 12h14M13 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                  <h3 className="font-display text-lg font-bold">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted-light dark:text-text-muted-dark">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ 8. WHY CLIENTS WORK WITH ME ═══════════════ */}
      <section className="relative px-6 py-32 lg:py-44">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-light dark:via-border-dark to-transparent" />

        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            className="mb-16"
          >
            <span className={cn(label, 'text-brand-500 dark:text-brand-400')}>Outcomes</span>
            <h2 className={cn(heading, 'mt-4')}>
              Why Clients <span className="text-gradient">Work With Me</span>
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-text-muted-light dark:text-text-muted-dark">
              It&apos;s not about the tools. It&apos;s about what those tools can do for you.
            </p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {outcomes.map((o, i) => (
              <motion.div
                key={o.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
              >
                <LiquidGlass intensity="subtle" className="relative overflow-hidden rounded-2xl p-8 h-full transition-all duration-500 hover:ring-1 hover:ring-brand-500/20 hover:-translate-y-1">
                  <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-brand-500/10 blur-[50px]" />
                  <span className="relative z-10 font-display text-4xl font-bold text-brand-500/10 dark:text-brand-400/10">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="relative z-10 font-display mt-2 text-lg font-bold sm:text-xl">{o.title}</h3>
                  <p className="relative z-10 mt-2 text-sm leading-relaxed text-text-muted-light dark:text-text-muted-dark">{o.desc}</p>
                </LiquidGlass>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ 9. THE FUTURE ═══════════════ */}
      <section ref={futureRef} className="relative px-6 py-48 lg:py-56 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-surface-secondary-light via-surface-light to-surface-secondary-light dark:from-surface-secondary-dark dark:via-surface-dark dark:to-surface-secondary-dark" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-light dark:via-border-dark to-transparent" />

        <div className="mx-auto max-w-4xl relative">
          <motion.div
            style={{ scale: futureScale, opacity: futureOpacity }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-100px' }}
            >
              <span className={cn(label, 'text-gold-500 dark:text-gold-400')}>The Horizon</span>
            </motion.div>

            <motion.div className="mt-14 relative">
              <svg className="absolute -top-8 left-1/2 -translate-x-1/2 h-16 w-16 text-brand-500/8 dark:text-white/[0.04]" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151C7.563 6.068 6 8.789 6 11h4v10H0z"/></svg>
              <h2 className="font-display text-4xl font-bold leading-[1.2] sm:text-5xl lg:text-6xl">
                <span className="text-text-light dark:text-white">&ldquo;I don&apos;t simply want to work with great brands.</span><br />
                <span className="text-gradient">I want Gifted to become one.&rdquo;</span>
              </h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-10 max-w-2xl mx-auto text-base leading-relaxed text-text-muted-light dark:text-text-muted-dark"
            >
              A brand recognized for exceptional creativity, thoughtful execution, and unforgettable experiences. 
              I&apos;m looking for clients who value creative freedom, pay well, and are ready to build something remarkable together.
            </motion.p>


          </motion.div>
        </div>
      </section>

      {/* ═══════════════ 10. FINAL CTA ═══════════════ */}
      <section className="relative px-6 py-32 lg:py-44">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-light dark:via-border-dark to-transparent" />

        <div className="mx-auto max-w-6xl">
          <div className="relative grid overflow-hidden rounded-3xl lg:grid-cols-5">
            <div className="relative lg:col-span-3 order-2 lg:order-1">
              <LiquidGlass intensity="pronounced" className="h-full rounded-none p-10 sm:p-16 lg:p-20">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <h2 className="font-display text-3xl font-bold leading-[1.1] sm:text-4xl lg:text-5xl">
                    Let&apos;s Build{' '}
                    <span className="text-gradient">Something</span> Remarkable.
                  </h2>
                  <p className="mt-6 max-w-lg text-sm leading-relaxed text-text-muted-light dark:text-text-muted-dark">
                    Great ideas deserve exceptional execution. Whether you&apos;re building a brand, telling a story, creating a product, or shaping an experience, let&apos;s create something people won&apos;t forget.
                  </p>
                  <div className="mt-10 flex flex-wrap gap-4">
                    <a href="mailto:hello@gifted.com" className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-7 py-3.5 text-sm font-semibold text-white transition-all duration-500 hover:shadow-xl hover:shadow-brand-500/30 hover:scale-[1.02]">
                      Email
                    </a>
                    <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-border-light dark:border-border-dark px-7 py-3.5 text-sm font-semibold text-text-light dark:text-text-dark transition-all duration-300 hover:bg-surface-secondary-light dark:hover:bg-surface-secondary-dark hover:scale-[1.02]">
                      WhatsApp
                    </a>
                    <Link to="/projects" className="inline-flex items-center gap-2 rounded-full border border-border-light dark:border-border-dark px-7 py-3.5 text-sm font-semibold text-text-light dark:text-text-dark transition-all duration-300 hover:bg-surface-secondary-light dark:hover:bg-surface-secondary-dark hover:scale-[1.02]">
                      View Work
                    </Link>
                  </div>
                </motion.div>
              </LiquidGlass>
            </div>
            <div className="relative lg:col-span-2 order-1 lg:order-2 min-h-[300px] lg:min-h-full overflow-hidden">
              <img
                src={img(1)}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent lg:bg-gradient-to-l lg:from-black/40 lg:to-transparent" />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
