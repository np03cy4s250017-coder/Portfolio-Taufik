import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Lock } from 'lucide-react'
import type { Project } from '@/lib/schemas'
import { GradeBadge } from '@/components/grade-badge'
import { cn } from '@/lib/utils'

const footerLink =
  'inline-flex min-h-11 items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground'

/**
 * A link is rendered only when it has a real destination. The old site's
 * defining flaw was three project cards all pointing at href="#", so an absent
 * destination omits the element entirely rather than faking one.
 */
export function ProjectCard({ project, className }: { project: Project; className?: string }) {
  return (
    <article
      className={cn(
        'flex h-full flex-col rounded-lg border border-border bg-surface p-6',
        'transition-colors duration-200 hover:border-border-interactive',
        className,
      )}
    >
      {project.image !== null ? (
        // Fixed height rather than an aspect ratio: featured cards span the full
        // grid, where 8:5 would make the media ~780px tall and swamp the page.
        <div className="relative mb-5 h-52 overflow-hidden rounded border border-border sm:h-64">
          <Image
            src={project.image}
            alt={`Screenshot of ${project.name}`}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover object-top"
          />
        </div>
      ) : (
        // Typographic fallback. Nothing about this engagement is photographable
        // without disclosing client infrastructure, and stock photography is the
        // precise failure this rebuild exists to correct. The zone row names the
        // shape of the work without naming anything belonging to the client.
        <div className="mb-5 flex h-52 items-center justify-center rounded border border-dashed border-border bg-background px-4 sm:h-64 sm:px-6">
          <ul className="flex flex-wrap items-center justify-center gap-2 font-mono text-xs text-muted-foreground sm:gap-4 sm:text-sm">
            {['INTERNAL', 'DMZ', 'EXTERNAL'].map((zone, i) => (
              <li key={zone} className="flex items-center gap-2 sm:gap-4">
                {/* The connector reads as a diagram on wide cards; below sm the row wraps and it would only add clutter. */}
                {i > 0 && <span aria-hidden className="hidden h-px w-6 bg-border-interactive sm:block sm:w-10" />}
                <span className="rounded border border-border px-2 py-1">{zone}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold tracking-tight">{project.name}</h3>
        <GradeBadge grade={project.grade} className="shrink-0" />
      </div>

      <p className="mt-3 text-sm text-muted-foreground">{project.tagline}</p>

      <ul className="mt-4 flex flex-wrap gap-2">
        {project.stack.map((tech) => (
          <li
            key={tech}
            className="rounded border border-border px-2 py-1 font-mono text-xs text-muted-foreground"
          >
            {tech}
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-wrap items-center gap-x-5 pt-4">
        {project.repoUrl !== null && (
          <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className={footerLink}>
            Code
            <ArrowUpRight aria-hidden className="size-3.5" />
          </a>
        )}

        {project.kind === 'engagement' && (
          <p className="inline-flex min-h-11 items-center gap-1.5 font-mono text-xs text-muted-foreground">
            <Lock aria-hidden className="size-3.5" />
            Client engagement — no public repository
          </p>
        )}

        {project.featured && (
          <Link href={`/projects/${project.slug}`} className={footerLink}>
            Read case study
            <ArrowUpRight aria-hidden className="size-3.5" />
          </Link>
        )}
      </div>
    </article>
  )
}
