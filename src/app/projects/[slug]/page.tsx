import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft, ArrowUpRight, Lock } from 'lucide-react'
import { projects, getProjectBySlug } from '@/content/projects'
import { caseStudies } from '@/content/case-studies'
import { GradeBadge } from '@/components/grade-badge'
import { profile } from '@/content/profile'

export function generateStaticParams() {
  return projects.filter((p) => p.featured).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) return {}
  return { title: `${project.name} — ${profile.name}`, description: project.tagline }
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  const study = caseStudies[slug]
  if (!project || !study) notFound()

  return (
    <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <Link
        href="/#work"
        className="inline-flex min-h-11 items-center gap-2 font-mono text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Back to work
      </Link>

      <header className="mt-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{project.name}</h1>
          <GradeBadge grade={project.grade} className="mt-1 shrink-0" />
        </div>
        <p className="mt-4 text-lg text-muted-foreground">{project.tagline}</p>

        <ul className="mt-6 flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <li
              key={tech}
              className="rounded border border-border px-2 py-1 font-mono text-xs text-muted-foreground"
            >
              {tech}
            </li>
          ))}
        </ul>
      </header>

      <section className="mt-12">
        <h2 className="font-mono text-sm text-accent">Problem</h2>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">{study.problem}</p>
      </section>

      <section className="mt-10">
        <h2 className="font-mono text-sm text-accent">Approach</h2>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">{study.approach}</p>
      </section>

      <section className="mt-10">
        <h2 className="font-mono text-sm text-accent">Detail</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left font-mono text-xs">
            <caption className="caption-bottom pt-3 text-left font-mono text-xs text-muted-foreground">
              {study.detailCaption}
            </caption>
            <tbody>
              {study.detail.map((row) => (
                <tr key={row.label} className="border-b border-border align-top">
                  <th scope="row" className="whitespace-nowrap py-3 pr-6 font-medium text-foreground">
                    {row.label}
                  </th>
                  <td className="py-3 text-muted-foreground">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="mt-12 border-t border-border pt-6">
        {project.repoUrl !== null ? (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 font-mono text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            View the code
            <ArrowUpRight aria-hidden className="size-4" />
          </a>
        ) : (
          <p className="inline-flex min-h-11 items-center gap-2 font-mono text-sm text-muted-foreground">
            <Lock aria-hidden className="size-4" />
            Client engagement — no public repository
          </p>
        )}
      </footer>
    </article>
  )
}
