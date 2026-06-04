import type { ReactNode } from 'react'

export interface CategoryConfig {
  slug: string
  name: string
  shortName: string
  shortDescription: string
  description: string
  icon: ReactNode
  gradient: string
  heroGradient: string
  accentColor: string
  features: string[]
  subServices: { title: string; description: string }[]
  process: { title: string; description: string }[]
  seo: { title: string; description: string }
}

export const categories: Record<string, CategoryConfig> = {
  photography: {
    slug: 'photography',
    name: 'Photography',
    shortName: 'Photography',
    shortDescription: 'Capturing moments that tell your story with precision, artistry, and emotion.',
    description: 'Professional photography services covering portrait, event, product, lifestyle, and brand photography. Every shot is crafted to communicate your unique vision and elevate your brand identity.',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
    gradient: 'from-[#ff922b] to-[#ff6b6b]',
    heroGradient: 'radial-gradient(ellipse at 30% 20%, rgba(255,146,43,0.15), transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(255,107,107,0.1), transparent 50%)',
    accentColor: '#ff922b',
    features: ['High-resolution imagery', 'Professional lighting', 'Quick turnaround', 'Unlimited revisions'],
    subServices: [
      { title: 'Portrait Photography', description: 'Professional headshots, personal branding portraits, and family photography in studio or on location.' },
      { title: 'Event Photography', description: 'Comprehensive coverage for corporate events, weddings, parties, and special occasions.' },
      { title: 'Product Photography', description: 'E-commerce ready product shots, 360-degree views, and lifestyle product imagery.' },
      { title: 'Lifestyle Photography', description: 'Candid, natural imagery that captures authentic moments and tells your brand story.' },
    ],
    process: [
      { title: 'Discovery', description: 'We discuss your vision, goals, and requirements to plan the perfect shoot.' },
      { title: 'Planning', description: 'Location scouting, mood boards, shot lists, and scheduling for a seamless experience.' },
      { title: 'Execution', description: 'Professional-grade photography with attention to lighting, composition, and detail.' },
      { title: 'Delivery', description: 'Curated, retouched images delivered in your preferred format with quick turnaround.' },
    ],
    seo: { title: 'Photography | Gifted', description: 'Professional photography services: portrait, event, product, lifestyle and brand photography. Capturing moments that tell your story.' },
  },

  'video-production': {
    slug: 'video-production',
    name: 'Video Production',
    shortName: 'Video Production',
    shortDescription: 'End-to-end video production from concept to final cut for commercial, content, and motion projects.',
    description: 'Full-service video production covering commercial videos, content creation, short-form videos, and motion-based work. From pre-production planning to final color grading, every frame is crafted for impact.',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
    gradient: 'from-[#20c997] to-[#12b886]',
    heroGradient: 'radial-gradient(ellipse at 30% 20%, rgba(32,201,151,0.15), transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(18,184,134,0.1), transparent 50%)',
    accentColor: '#20c997',
    features: ['4K cinematic quality', 'Professional audio', 'Drone capabilities', 'Color grading included'],
    subServices: [
      { title: 'Commercial Videos', description: 'High-end commercial and advertising video production for brands and agencies.' },
      { title: 'Content Videos', description: 'Engaging content videos optimized for social media, marketing, and brand storytelling.' },
      { title: 'Short-Form Videos', description: 'Quick-turnaround short-form video content for social platforms and digital campaigns.' },
      { title: 'Motion-Based Work', description: 'Motion graphics, animated content, and visual effects that bring your message to life.' },
    ],
    process: [
      { title: 'Concept', description: 'We develop your creative vision into a compelling video concept and script.' },
      { title: 'Pre-Production', description: 'Storyboarding, location scouting, casting, and scheduling for a smooth production.' },
      { title: 'Production', description: 'Professional filming with industry-standard equipment and techniques.' },
      { title: 'Post-Production', description: 'Editing, color grading, sound design, and final delivery in your preferred format.' },
    ],
    seo: { title: 'Video Production | Gifted', description: 'Professional video production services: commercial, content, short-form and motion-based work. End-to-end production from concept to final cut.' },
  },

  'graphic-design': {
    slug: 'graphic-design',
    name: 'Graphic Design',
    shortName: 'Graphic Design',
    shortDescription: 'Visual identity, marketing creatives, and digital design assets that communicate your story.',
    description: 'Comprehensive graphic design services covering marketing creatives, social media assets, posters, digital design, and visual branding materials. Every design is strategically crafted to communicate your message effectively.',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 19V5m0 0-7 7m7-7 7 7"/><path d="M12 3a9 9 0 1 0 9 9"/></svg>,
    gradient: 'from-[#ff6b6b] to-[#ee5a24]',
    heroGradient: 'radial-gradient(ellipse at 30% 20%, rgba(255,107,107,0.15), transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(238,90,36,0.1), transparent 50%)',
    accentColor: '#ff6b6b',
    features: ['Marketing creatives', 'Social media assets', 'Print-ready files', 'Brand guidelines'],
    subServices: [
      { title: 'Marketing Creatives', description: 'Campaign visuals, promotional materials, and marketing collateral for digital and print.' },
      { title: 'Social Media Creatives', description: 'Platform-optimized social media graphics, templates, and content calendars.' },
      { title: 'Posters & Print', description: 'Posters, flyers, banners, and all print collateral design for events and promotions.' },
      { title: 'Digital Design Assets', description: 'Icons, illustrations, email templates, and web graphics for digital platforms.' },
    ],
    process: [
      { title: 'Brief', description: 'We gather requirements, understand your brand, and define the project scope.' },
      { title: 'Concept', description: 'Initial design concepts and mood boards to establish the creative direction.' },
      { title: 'Design', description: 'Refined design development with feedback loops and iterations.' },
      { title: 'Delivery', description: 'Final files delivered in all required formats with specifications.' },
    ],
    seo: { title: 'Graphic Design | Gifted', description: 'Professional graphic design services: marketing creatives, social media assets, posters and digital design. Visual communication that makes an impact.' },
  },

  'photo-editing': {
    slug: 'photo-editing',
    name: 'Photo Editing',
    shortName: 'Photo Editing',
    shortDescription: 'Professional photo retouching, color grading, and image enhancement that elevates every frame.',
    description: 'Expert photo editing and retouching services that transform raw captures into polished, stunning visuals. From advanced color grading and skin retouching to composite creation and restoration — every image is handled with the precision and artistry it deserves.',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
    gradient: 'from-[#f97316] to-[#eab308]',
    heroGradient: 'radial-gradient(ellipse at 30% 20%, rgba(249,115,22,0.15), transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(234,179,8,0.1), transparent 50%)',
    accentColor: '#f97316',
    features: ['Color Grading', 'Skin Retouching', 'Background Removal', 'Photo Restoration'],
    subServices: [
      { title: 'Color Grading & Correction', description: 'Professional color grading and correction that sets the mood, enhances visual appeal, and ensures consistency across all images.' },
      { title: 'Skin Retouching', description: 'Natural, high-end skin retouching that preserves texture while removing blemishes, smoothing skin, and enhancing features.' },
      { title: 'Background Removal & Swap', description: 'Precise background extraction and replacement for product photos, portraits, and creative composites.' },
      { title: 'Photo Restoration', description: 'Careful restoration of old, damaged, or faded photographs — repairing tears, restoring color, and preserving memories.' },
    ],
    process: [
      { title: 'Assessment', description: 'Evaluating the image and understanding the desired outcome, style, and level of retouching required.' },
      { title: 'Base Adjustments', description: 'Initial corrections: exposure, white balance, contrast, and basic color adjustments to establish a solid foundation.' },
      { title: 'Detailed Editing', description: 'Fine retouching, advanced color grading, compositing, and all detailed pixel-level work.' },
      { title: 'Final Review', description: 'Quality check, format optimization, and delivery in your preferred file format and resolution.' },
    ],
    seo: { title: 'Photo Editing | Gifted', description: 'Professional photo editing services: color grading, retouching, background removal, and restoration. Transform your images with expert precision.' },
  },

  development: {
    slug: 'development',
    name: 'Development',
    shortName: 'Development',
    shortDescription: 'Modern web applications and interactive digital experiences built with precision.',
    description: 'Comprehensive development services covering frontend interfaces, full stack applications, and everything in between. Specializing in React, TypeScript, Supabase, and modern frameworks — building performant, accessible, and scalable digital products from concept to deployment.',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
    gradient: 'from-[#4dabf7] to-[#f06595]',
    heroGradient: 'radial-gradient(ellipse at 30% 20%, rgba(77,171,247,0.15), transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(240,101,149,0.1), transparent 50%)',
    accentColor: '#4dabf7',
    features: ['React / TypeScript', 'Full Stack Applications', 'Supabase & Database', 'Cloud Deployment'],
    subServices: [
      { title: 'Frontend Development', description: 'Custom React applications with modern hooks, state management, and component architecture. Pixel-perfect UI implementation with smooth animations.' },
      { title: 'Full Stack Applications', description: 'Complete application development from database design to deployed solution. End-to-end development with modern frameworks.' },
      { title: 'Supabase Projects', description: 'Full-stack applications powered by Supabase for authentication, storage, and real-time data. Database architecture and API design.' },
      { title: 'Dashboards & Admin Systems', description: 'Custom dashboard interfaces and administrative systems with data visualization and management capabilities.' },
    ],
    process: [
      { title: 'Architecture', description: 'System architecture design, technology stack selection, and project planning based on requirements.' },
      { title: 'Development', description: 'Full-stack development with modern frameworks, best practices, and regular code reviews.' },
      { title: 'Integration', description: 'Third-party service integration, API development, testing, and quality assurance.' },
      { title: 'Launch', description: 'Production deployment, performance optimization, and ongoing maintenance and support.' },
    ],
    seo: { title: 'Development | Gifted', description: 'Professional development services: web applications, Supabase projects, dashboards and admin systems. Modern digital solutions from concept to launch.' },
  },
}

export function getCategory(slug: string): CategoryConfig | undefined {
  return categories[slug]
}

export const categoryList = Object.values(categories)
