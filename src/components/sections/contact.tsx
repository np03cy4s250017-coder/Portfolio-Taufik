import { ArrowUpRight, Mail, MapPin } from 'lucide-react'
import { profile } from '@/content/profile'
import { ContactForm } from '@/components/contact-form'
import { Reveal } from '@/components/reveal'

const directLink =
  'inline-flex min-h-11 items-center gap-2 font-mono text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground'

export function Contact() {
  return (
    <section id="contact" className="border-t border-border">
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <p className="font-mono text-sm text-accent">04 — Contact</p>

        <div className="mt-8 grid gap-12 md:grid-cols-2">
          <Reveal>
            <h2 className="text-2xl font-semibold tracking-tight">Send a message</h2>
            <div className="mt-6">
              <ContactForm />
            </div>
          </Reveal>

          <Reveal index={1}>
            <h2 className="text-2xl font-semibold tracking-tight">Or reach me directly</h2>
            <ul className="mt-6 flex flex-col gap-1">
              <li>
                <a href={`mailto:${profile.email}`} aria-label="Email MD Taufik Reza" className={directLink}>
                  <Mail aria-hidden className="size-4" />
                  {profile.email}
                </a>
              </li>
              <li>
                <a
                  href={profile.github}
                  aria-label="GitHub profile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={directLink}
                >
                  <ArrowUpRight aria-hidden className="size-4" />
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href={profile.linkedin}
                  aria-label="LinkedIn profile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={directLink}
                >
                  <ArrowUpRight aria-hidden className="size-4" />
                  LinkedIn
                </a>
              </li>
              <li className="inline-flex min-h-11 items-center gap-2 font-mono text-sm text-muted-foreground">
                <MapPin aria-hidden className="size-4" />
                {profile.location}
              </li>
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
