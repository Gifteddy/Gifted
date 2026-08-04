import { ContactSection } from '@/components/sections/ContactSection'
import { SEOBreadcrumbs } from '@/components/ui/SEOBreadcrumbs'
import { Meta } from '@/lib/meta'
import { SITE_URL } from '@/lib/seo'

export default function Contact() {
  return (
    <div className="pt-20">
      <Meta
        title="Contact"
        description="Get in touch with Gifted for collaborations, projects, photography, video production, graphic design, and development opportunities."
        keywords={['contact', 'hire', 'freelancer', 'collaboration', 'project inquiry', 'creative services', 'gifted']}
        breadcrumbs={[{ name: 'Contact', path: '/contact' }]}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: 'Contact Gifted',
          description: 'Get in touch with Gifted for creative projects and collaborations.',
          url: `${SITE_URL}/contact`,
          mainEntity: {
            '@type': 'Person',
            name: 'Ibiam Iheanyi Victory',
            email: 'ibiamiheanyi@gmail.com',
            url: SITE_URL,
          },
        }}
      />
      <div className="px-4 pt-8">
        <SEOBreadcrumbs items={[{ name: 'Contact', path: '/contact' }]} />
      </div>
      <ContactSection />
    </div>
  )
}
