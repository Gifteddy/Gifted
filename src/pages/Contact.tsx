import { ContactSection } from '@/components/sections/ContactSection'
import { Meta } from '@/lib/meta'

export default function Contact() {
  return (
    <div className="pt-20">
      <Meta title="Contact" description="Get in touch with Gifted for collaborations, projects, and creative opportunities." />
      <ContactSection />
    </div>
  )
}
