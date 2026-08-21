import { skillGroups } from '@/content/skills'
import { Reveal } from '@/components/reveal'

export function Skills() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <p className="font-mono text-sm text-accent">02 — Capabilities</p>

        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {skillGroups.map((group, i) => (
            <Reveal key={group.label} index={i}>
              <h2 className="font-mono text-sm text-accent">{group.label}</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded border border-border px-2 py-1 font-mono text-sm text-muted-foreground"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
