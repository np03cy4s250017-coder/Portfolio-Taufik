import Link from 'next/link'
import { ArrowRight, Download } from 'lucide-react'
import { profile } from '@/content/profile'
import { Reveal } from '@/components/reveal'
import { TopologyMount } from '@/components/topology-mount'

const ctaBase =
  'inline-flex h-11 cursor-pointer items-center gap-2 rounded px-5 text-sm font-medium transition-colors duration-200'

export function Hero() {
  return (
    <section id="top" className="relative flex min-h-[85vh] items-center overflow-hidden">
      <TopologyMount />
      <div className="relative mx-auto w-full max-w-5xl px-4 py-20 sm:px-6">
        <Reveal>
          <p className="font-mono text-sm text-accent">
            {profile.role} · {profile.location}
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            {profile.name}
          </h1>

          <p className="mt-6 max-w-2xl text-xl text-muted-foreground sm:text-2xl">{profile.thesis}</p>

          <p className="mt-6 max-w-xl text-base text-muted-foreground">{profile.summary}</p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="#work" className={`${ctaBase} bg-accent text-background hover:bg-accent/90`}>
              View work
              <ArrowRight aria-hidden className="size-4" />
            </Link>
            <a
              href={profile.resume}
              download
              className={`${ctaBase} border border-border-interactive text-foreground hover:border-foreground`}
            >
              Download CV
              <Download aria-hidden className="size-4" />
            </a>
          </div>

          <p className="mt-10 font-mono text-xs text-muted-foreground">
            {profile.certifications.map((c) => c.name).join(' · ')}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
