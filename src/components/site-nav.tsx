import Link from 'next/link'
import { profile } from '@/content/profile'

const LINKS = [
  { href: '#work', label: 'Work' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
] as const

/** Tap targets are min-h-11 (44px) so the nav stays usable on a phone. */
const linkClass =
  'inline-flex min-h-11 items-center px-3 py-2 font-mono text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground'

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6"
      >
        <Link
          href="#top"
          className="inline-flex min-h-11 items-center px-3 py-2 font-mono text-accent transition-colors duration-200 hover:text-foreground"
        >
          {profile.initials}
        </Link>

        <ul className="flex items-center">
          {LINKS.map((link) => (
            <li key={link.href} className={link.href === '#contact' ? '' : 'hidden sm:block'}>
              <Link href={link.href} className={linkClass}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
