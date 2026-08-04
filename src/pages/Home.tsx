import { Hero } from '@/components/sections/Hero'
import { About } from '@/components/sections/About'
import { Services } from '@/components/sections/Services'
import { FeaturedProjects } from '@/components/sections/FeaturedProjects'
import { Skills } from '@/components/sections/Skills'
import { CompanyMarquee } from '@/components/sections/CompanyMarquee'
import { Testimonials } from '@/components/sections/Testimonials'
import { ContactSection } from '@/components/sections/ContactSection'
import { Meta } from '@/lib/meta'
import { SITE_URL } from '@/lib/seo'

export default function Home() {
  return (
    <>
      <Meta
        title="Home"
        description="Creative technologist combining visual storytelling, design, engineering, and digital experiences. Explore projects, shop, and more."
        keywords={[
          'creative technologist', 'portfolio', 'photography', 'video production',
          'graphic design', 'web development', 'photo editing', 'freelancer',
          'Nigeria', 'visual storytelling', 'digital experiences',
        ]}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Gifted | Creative Technologist',
          description: 'Creative technologist combining visual storytelling, design, engineering, and digital experiences.',
          url: `${SITE_URL}/`,
          mainEntity: {
            '@type': 'Person',
            name: 'Ibiam Iheanyi Victory',
            alternateName: 'Gifted',
            jobTitle: 'Creative Technologist',
          },
        }}
      />
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
