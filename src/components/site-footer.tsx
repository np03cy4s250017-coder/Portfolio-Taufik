import { profile } from '@/content/profile'

/**
 * Text labels rather than icons: lucide-react v1 removed every brand mark, so
 * Github/Linkedin no longer exist. A filled brand SVG next to lucide's 24px
 * stroke grid reads as a mismatch, and mono labels sit better in a type system
 * where monospace already means "this is a value". The rule being honoured is
 * the spec's — no emoji as icons — which text labels satisfy outright.
 */
const LINKS = [
  { href: profile.github, label: 'GitHub', external: true },
  { href: profile.linkedin, label: 'LinkedIn', external: true },
  { href: `mailto:${profile.email}`, label: 'Email', external: false },
] as const

const linkClass =
  'inline-flex min-h-11 items-center rounded px-3 py-2 transition-colors duration-200 hover:text-foreground'

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 py-8 font-mono text-sm text-muted-foreground sm:flex-row sm:px-6">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>

        <ul className="flex items-center">
          {LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className={linkClass}
                {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
