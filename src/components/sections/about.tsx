import { profile } from '@/content/profile'
import { Reveal } from '@/components/reveal'

export function About() {
  const { education } = profile

  return (
    <section id="about" className="border-t border-border">
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <p className="font-mono text-sm text-accent">03 — Background</p>

        <Reveal>
          <h2 className="mt-8 text-2xl font-semibold tracking-tight">Experience</h2>

          {profile.experience.map((job) => (
            <div key={`${job.org}-${job.role}`} className="mt-6">
              <h3 className="text-lg font-medium">
                {job.role} · {job.org}
              </h3>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                <time dateTime={job.startISO}>{job.start}</time> — {job.end}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {job.points.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Reveal>

        <Reveal index={1}>
          <h2 className="mt-14 text-2xl font-semibold tracking-tight">Education</h2>
          <div className="mt-6">
            <h3 className="text-lg font-medium">{education.degree}</h3>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {education.institution} · <time dateTime={String(education.year)}>{education.year}</time>{' '}
              · {education.result}
            </p>
          </div>
        </Reveal>

        <Reveal index={2}>
          <h2 className="mt-14 text-2xl font-semibold tracking-tight">Certifications</h2>
          <ul className="mt-6 flex flex-wrap gap-2">
            {profile.certifications.map((cert) => (
              <li
                key={cert.name}
                className="rounded border border-border px-3 py-2 font-mono text-xs text-muted-foreground"
              >
                {cert.name}
                <span className="text-border-interactive"> · {cert.issuer}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
