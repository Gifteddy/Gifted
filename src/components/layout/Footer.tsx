import { Link } from 'react-router-dom'

const footerLinks = {
  Navigation: [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/projects', label: 'Projects' },
    { to: '/blog', label: 'Blog' },
    { to: '/contact', label: 'Contact' },
  ],
  Services: [
    { to: '/photography', label: 'Photography' },
    { to: '/video-production', label: 'Video Production' },
    { to: '/graphic-design', label: 'Graphic Design' },
    { to: '/development', label: 'Development' },
    { to: '/photo-editing', label: 'Photo Editing' },
  ],
  Social: [
    { to: 'https://github.com/Gifteddy/', label: 'GitHub' },
    { to: 'https://web.facebook.com/iheanyi.ibiam.3/', label: 'Facebook' },
    { to: 'https://www.instagram.com/iheanyiibiam1/', label: 'Instagram' },
    { to: 'https://www.tiktok.com/@iheanyiibiam', label: 'TikTok' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center">
              <img src="https://res.cloudinary.com/dr4fjf3a1/image/upload/f_auto,q_auto/v1781723693/logo_u7assw.png" alt="Gifted" className="h-12 w-auto" loading="lazy" decoding="async" />
            </Link>
            <p className="mt-3 text-sm text-text-muted-light dark:text-text-muted-dark">Designer. Developer. Storyteller.</p>
            <p className="mt-1 text-sm text-text-muted-light dark:text-text-muted-dark">Creative Technologist</p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">{title}</h3>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.label}>
                    {link.to.startsWith('http') ? (
                      <a href={link.to} target="_blank" rel="noopener noreferrer" className="text-sm text-text-light transition-colors hover:text-brand-500 dark:text-text-dark dark:hover:text-brand-400">{link.label}</a>
                    ) : (
                      <Link to={link.to} className="text-sm text-text-light transition-colors hover:text-brand-500 dark:text-text-dark dark:hover:text-brand-400">{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-border-light pt-8 dark:border-border-dark">
          <p className="text-center text-sm text-text-muted-light dark:text-text-muted-dark">&copy; {new Date().getFullYear()} Gifted. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
