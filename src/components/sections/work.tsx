import { projects } from '@/content/projects'
import { ProjectCard } from '@/components/project-card'
import { Reveal } from '@/components/reveal'

export function Work() {
  const featured = projects.filter((p) => p.featured)
  const rest = projects.filter((p) => !p.featured)

  return (
    <section id="work" className="border-t border-border">
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <p className="font-mono text-sm text-accent">01 — Work</p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {featured.map((project, i) => (
            <Reveal key={project.slug} index={i} className="md:col-span-2">
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {rest.map((project, i) => (
            <Reveal key={project.slug} index={i} className="h-full">
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
