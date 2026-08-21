import { cn } from '@/lib/utils'
import type { Project } from '@/lib/schemas'

const TONE: Record<Project['grade'], string> = {
  'A+': 'border-accent/50 text-accent',
  A: 'border-accent/40 text-accent',
  'B+': 'border-border-interactive text-muted-foreground',
  B: 'border-border-interactive text-muted-foreground',
  C: 'border-border-interactive text-muted-foreground',
}

export function GradeBadge({ grade, className }: { grade: Project['grade']; className?: string }) {
  return (
    <span
      title="Self-assessed scope, using the same scale Drishti applies to domains"
      className={cn(
        'inline-flex h-7 min-w-7 items-center justify-center rounded border px-1.5',
        'font-mono text-xs tracking-tight',
        TONE[grade],
        className,
      )}
    >
      {grade}
      <span className="sr-only"> — self-assessed scope</span>
    </span>
  )
}
