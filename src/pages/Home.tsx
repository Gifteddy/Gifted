import { Hero } from '@/components/sections/Hero'
import { About } from '@/components/sections/About'
import { Services } from '@/components/sections/Services'
import { FeaturedProjects } from '@/components/sections/FeaturedProjects'
import { Skills } from '@/components/sections/Skills'
import { CompanyMarquee } from '@/components/sections/CompanyMarquee'
import { Testimonials } from '@/components/sections/Testimonials'
import { ContactSection } from '@/components/sections/ContactSection'
import { Meta } from '@/lib/meta'

export default function Home() {
  return (
    <>
      <Meta title="Home" description="Creative technologist combining visual storytelling, design, engineering, and digital experiences. Explore projects, shop, and more." />
      <Hero />
      <About />
      <Services />
      <FeaturedProjects />
      <Skills />
      <CompanyMarquee />
      <Testimonials />
      <ContactSection />
    </>
  )
}
