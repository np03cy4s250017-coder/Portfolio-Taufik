# Portfolio Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace a two-file static site advertising invented projects with a Next.js portfolio where every claim is backed by code, a certification, or a documented engagement.

**Architecture:** Next.js 15 App Router, prerendered to static except one serverless route. Content lives in typed, Zod-validated data modules that the grid, case-study routes, sitemap and JSON-LD all derive from — adding a project is one object, not a copied `<div>`. Presentational components are dumb; everything testable lives in `src/lib`.

**Tech Stack:** Next.js 15, TypeScript (strict), Tailwind v4, shadcn/ui (Radix), lucide-react, react-hook-form, Zod, Resend, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-08-21-portfolio-rebuild-design.md`

## Global Constraints

- **Node 20+.** Next.js 15 requires it. Verify with `node -v` before Task 1.
- **Never commit secrets.** `.env.local` is gitignored; `.env.example` carries empty values. `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `NEXT_PUBLIC_SITE_URL` are set in Vercel only.
- **No emoji as icons.** Use `lucide-react`. The old site used 🔗 💼 🐦 as social icons; that is the anti-pattern being corrected.
- **No stock photography.** Screenshots come from the real applications or the card falls back to a typographic treatment.
- **No invented claims.** Every skill, project and credential traces to the CV, a public repo, or `D:\My-Projects`. Hyperlocal is excluded entirely (spec §11).
- **Palette is fixed and contrast-verified** (spec §6). Do not substitute colours:
  `--background #0F172A` · `--foreground #F8FAFC` (17.4:1) · `--muted-foreground #94A3B8` (7.1:1) · `--accent #22C55E` (8.0:1) · `--border-interactive #64748B` (3.8:1) · `--border #1E293B` (decorative only) · `--destructive #EF4444`
- **Never `#000000`** as a background.
- **All motion respects `prefers-reduced-motion: reduce`** — content renders at final state, never hidden.
- **Animate `opacity` and `transform` only.** Never `width`/`height`/`top`/`left`.
- **Files under 400 lines.** Split by responsibility when approaching it.
- **Immutability.** Content modules export frozen data; transforms return new arrays.
- **Identity, verbatim:** MD Taufik Reza · `rezamdtaufik442@gmail.com` · `github.com/np03cy4s250017-coder` · `linkedin.com/in/md-taufik-reza-119240349` · Kathmandu, Nepal. **No phone number anywhere on the site.**

---

## File Structure

| File | Responsibility |
|---|---|
| `src/app/globals.css` | Design tokens as CSS variables, base layer, reveal keyframes |
| `src/app/layout.tsx` | Root shell, fonts, skip link, nav, footer, JSON-LD |
| `src/app/page.tsx` | Home — composes section components only |
| `src/app/projects/[slug]/page.tsx` | Case studies, `generateStaticParams` |
| `src/app/api/contact/route.ts` | The only serverless function |
| `src/app/sitemap.ts` · `robots.ts` · `opengraph-image.tsx` | Derived metadata |
| `src/lib/schemas.ts` | Zod schemas — the single source of shape truth |
| `src/lib/rate-limit.ts` | Sliding-window limiter, pure and testable |
| `src/lib/utils.ts` | `cn()` |
| `src/content/profile.ts` | Identity, links, experience, certifications |
| `src/content/projects.ts` | The four projects |
| `src/content/skills.ts` | Skill groups |
| `src/components/sections/*` | Hero, Work, Skills, About, Contact |
| `src/components/project-card.tsx` · `grade-badge.tsx` · `reveal.tsx` | Shared UI |

---

### Task 1: Scaffold, tokens, and fonts

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/lib/utils.ts`, `.env.example`, `.gitignore`
- Test: verified by `npm run build`

**Interfaces:**
- Consumes: nothing
- Produces: `cn(...inputs: ClassValue[]): string` from `src/lib/utils.ts`; CSS variables listed in Global Constraints; `--font-sans` and `--font-mono` bound to Inter and JetBrains Mono

- [ ] **Step 1: Scaffold**

Run in `D:\My-Projects\portfolio` (the directory already exists and holds `docs/` plus a git repo — do not re-init):

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

Answer **No** if asked to overwrite `docs/`. Then:

```bash
npm i zod react-hook-form @hookform/resolvers resend lucide-react clsx tailwind-merge
npm i -D vitest @vitejs/plugin-react vite-tsconfig-paths @playwright/test
```

- [ ] **Step 2: Write `src/lib/utils.ts`**

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 3: Write `src/app/globals.css`**

```css
@import "tailwindcss";

@theme {
  --color-background: #0F172A;
  --color-foreground: #F8FAFC;
  --color-muted: #1E293B;
  --color-muted-foreground: #94A3B8;
  --color-accent: #22C55E;
  --color-border: #1E293B;
  --color-border-interactive: #64748B;
  --color-destructive: #EF4444;
  --color-surface: #111C33;

  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-jetbrains), ui-monospace, monospace;
}

@layer base {
  body {
    background-color: var(--color-background);
    color: var(--color-foreground);
    -webkit-font-smoothing: antialiased;
  }
  :focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
}

/* Reveal-on-scroll. Elements start hidden ONLY when motion is allowed, so a
   reduced-motion user or a failed observer never sees a blank page. */
@media (prefers-reduced-motion: no-preference) {
  [data-reveal] {
    opacity: 0;
    transform: translateY(16px);
    transition: opacity 400ms cubic-bezier(0.16, 1, 0.3, 1),
                transform 400ms cubic-bezier(0.16, 1, 0.3, 1);
    transition-delay: calc(var(--reveal-index, 0) * 60ms);
  }
  [data-reveal="shown"] {
    opacity: 1;
    transform: none;
  }
}
```

- [ ] **Step 4: Wire fonts in `src/app/layout.tsx`**

```tsx
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

- [ ] **Step 5: Write `.env.example`**

```
# Resend API key — SENDING ACCESS ONLY. Set in Vercel, never commit a real value.
RESEND_API_KEY=
# Destination inbox for contact form submissions.
CONTACT_TO_EMAIL=
# Canonical site URL, used for metadata, OG tags and sitemap.
NEXT_PUBLIC_SITE_URL=
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: succeeds, no type errors.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: scaffold Next.js app with design tokens and fonts"
```

---

### Task 2: Content schemas

**Files:**
- Create: `src/lib/schemas.ts`
- Test: `src/lib/schemas.test.ts`, `vitest.config.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `projectSchema`, `skillGroupSchema`, `contactSchema`; types `Project`, `SkillGroup`, `ContactInput`

- [ ] **Step 1: Write `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
})
```

Add to `package.json` scripts: `"test": "vitest run"`.

- [ ] **Step 2: Write the failing test `src/lib/schemas.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { projectSchema, contactSchema } from './schemas'

const validProject = {
  slug: 'drishti',
  name: 'Drishti',
  tagline: 'Domain security auditor mapped to the OWASP Top 10.',
  grade: 'A+',
  year: 2026,
  stack: ['FastAPI', 'React'],
  repoUrl: 'https://github.com/np03cy4s250017-coder/Drishti',
  featured: true,
  kind: 'software',
}

describe('projectSchema', () => {
  it('accepts a valid project', () => {
    expect(projectSchema.parse(validProject).slug).toBe('drishti')
  })

  it('rejects a slug that is not url-safe', () => {
    expect(() => projectSchema.parse({ ...validProject, slug: 'Not A Slug' })).toThrow()
  })

  it('rejects a grade outside the allowed scale', () => {
    expect(() => projectSchema.parse({ ...validProject, grade: 'S' })).toThrow()
  })

  it('allows repoUrl to be null for client work with no public repo', () => {
    const parsed = projectSchema.parse({ ...validProject, repoUrl: null, kind: 'engagement' })
    expect(parsed.repoUrl).toBeNull()
  })

  it('rejects a non-github repoUrl', () => {
    expect(() => projectSchema.parse({ ...validProject, repoUrl: 'https://evil.test/x' })).toThrow()
  })

  it('requires at least one stack entry', () => {
    expect(() => projectSchema.parse({ ...validProject, stack: [] })).toThrow()
  })
})

describe('contactSchema', () => {
  const valid = { name: 'Ada', email: 'ada@example.com', message: 'Hello there, this is a real message.', website: '' }

  it('accepts a valid message', () => {
    expect(contactSchema.parse(valid).name).toBe('Ada')
  })

  it('rejects a malformed email', () => {
    expect(() => contactSchema.parse({ ...valid, email: 'not-an-email' })).toThrow()
  })

  it('rejects a message under 10 characters', () => {
    expect(() => contactSchema.parse({ ...valid, message: 'hi' })).toThrow()
  })

  it('rejects a message over 5000 characters', () => {
    expect(() => contactSchema.parse({ ...valid, message: 'x'.repeat(5001) })).toThrow()
  })

  it('trims surrounding whitespace from the name', () => {
    expect(contactSchema.parse({ ...valid, name: '  Ada  ' }).name).toBe('Ada')
  })
})
```

- [ ] **Step 3: Run to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `./schemas`.

- [ ] **Step 4: Write `src/lib/schemas.ts`**

```ts
import { z } from 'zod'

export const GRADES = ['A+', 'A', 'B+', 'B', 'C'] as const

export const projectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, 'slug must be lowercase, digits and hyphens only'),
  name: z.string().min(1),
  tagline: z.string().min(1).max(200),
  /** Self-assessed scope, echoing Drishti's own scoring scale. Never an external rating. */
  grade: z.enum(GRADES),
  year: z.number().int().min(2020).max(2100),
  stack: z.array(z.string().min(1)).min(1),
  /** null for professional engagements with no publishable repo. */
  repoUrl: z.string().url().startsWith('https://github.com/').nullable(),
  featured: z.boolean(),
  kind: z.enum(['software', 'engagement']),
})

export const skillGroupSchema = z.object({
  label: z.string().min(1),
  items: z.array(z.string().min(1)).min(1),
})

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Your name is required').max(100),
  email: z.string().trim().email('Enter a valid email address'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(5000),
  /** Honeypot. Real users never see this field, so a non-empty value means a bot. */
  website: z.string().max(0).optional().or(z.literal('')),
})

export type Project = z.infer<typeof projectSchema>
export type SkillGroup = z.infer<typeof skillGroupSchema>
export type ContactInput = z.infer<typeof contactSchema>
```

- [ ] **Step 5: Run to verify it passes**

Run: `npm test`
Expected: PASS, 11 tests.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add Zod content and contact schemas with tests"
```

---

### Task 3: Content modules

**Files:**
- Create: `src/content/profile.ts`, `src/content/projects.ts`, `src/content/skills.ts`
- Test: `src/content/projects.test.ts`

**Interfaces:**
- Consumes: `projectSchema`, `skillGroupSchema` from Task 2
- Produces: `profile` object; `projects: readonly Project[]`; `featuredProjects`, `getProjectBySlug(slug: string): Project | undefined`; `skillGroups: readonly SkillGroup[]`

- [ ] **Step 1: Write the failing test `src/content/projects.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { projects, getProjectBySlug, featuredProjects } from './projects'
import { projectSchema } from '@/lib/schemas'

describe('projects content', () => {
  it('every entry satisfies the schema', () => {
    for (const p of projects) expect(() => projectSchema.parse(p)).not.toThrow()
  })

  it('slugs are unique', () => {
    const slugs = projects.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('excludes Hyperlocal, whose README describes software that does not exist', () => {
    expect(projects.some((p) => p.slug.includes('hyperlocal'))).toBe(false)
  })

  it('includes Drishti as featured with its real repo', () => {
    const d = getProjectBySlug('drishti')
    expect(d?.featured).toBe(true)
    expect(d?.repoUrl).toBe('https://github.com/np03cy4s250017-coder/Drishti')
  })

  it('the client engagement publishes no repo link', () => {
    const e = projects.find((p) => p.kind === 'engagement')
    expect(e).toBeDefined()
    expect(e?.repoUrl).toBeNull()
  })

  it('getProjectBySlug returns undefined for an unknown slug', () => {
    expect(getProjectBySlug('nope')).toBeUndefined()
  })

  it('featuredProjects does not mutate the source array', () => {
    const before = projects.length
    void featuredProjects
    expect(projects.length).toBe(before)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `./projects`.

- [ ] **Step 3: Write `src/content/projects.ts`**

```ts
import { projectSchema, type Project } from '@/lib/schemas'

/**
 * Grades are a self-assessment of scope and depth, echoing Drishti's own A+–F
 * scoring scale. They are labelled as such in the UI and are never presented as
 * an external rating.
 *
 * Hyperlocal is deliberately absent — see spec §11. Its README advertises a
 * FastAPI + PostGIS backend and four apps; the folder has no backend directory
 * and one partially-built app.
 */
const raw: Project[] = [
  {
    slug: 'drishti',
    name: 'Drishti',
    tagline: 'A domain security auditor mapped to the OWASP Top 10 — and an honest statement of what a remote scanner cannot see.',
    grade: 'A+',
    year: 2026,
    stack: ['FastAPI', 'SQLite', 'React', 'Vite', 'Tailwind', 'WebSocket'],
    repoUrl: 'https://github.com/np03cy4s250017-coder/Drishti',
    featured: true,
    kind: 'software',
  },
  {
    slug: 'network-segmentation-deployment',
    name: 'CCTV & FortiGate Deployment',
    tagline: 'IP surveillance and firewall rollout across government and hospital networks, with segmentation between internal, DMZ and external zones.',
    grade: 'A',
    year: 2025,
    stack: ['FortiGate', 'IP-CCTV', 'VLAN segmentation', 'VPN', 'NAT'],
    repoUrl: null,
    featured: true,
    kind: 'engagement',
  },
  {
    slug: 'devjobs',
    name: 'DevJobs',
    tagline: 'A job board with live filtering by role, type and experience level, and saved listings persisted locally.',
    grade: 'B+',
    year: 2025,
    stack: ['JavaScript', 'CSS', 'JSON'],
    repoUrl: 'https://github.com/np03cy4s250017-coder/Job-Finder-App',
    featured: false,
    kind: 'software',
  },
  {
    slug: 'fintrack',
    name: 'FinTrack',
    tagline: 'A personal finance dashboard tracking income, expenses and savings in NPR, with category breakdowns charted over time.',
    grade: 'B+',
    year: 2025,
    stack: ['JavaScript', 'Chart.js', 'CSS'],
    repoUrl: 'https://github.com/np03cy4s250017-coder/Expense-Tracker',
    featured: false,
    kind: 'software',
  },
  {
    slug: 'novashop',
    name: 'NovaShop',
    tagline: 'A storefront with category filtering, search, and a cart that survives reload.',
    grade: 'B',
    year: 2025,
    stack: ['JavaScript', 'CSS', 'JSON'],
    repoUrl: 'https://github.com/np03cy4s250017-coder/Tech-Store',
    featured: false,
    kind: 'software',
  },
]

export const projects: readonly Project[] = Object.freeze(raw.map((p) => projectSchema.parse(p)))

export const featuredProjects: readonly Project[] = projects.filter((p) => p.featured)

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}
```

- [ ] **Step 4: Write `src/content/profile.ts`**

All values below are transcribed from the CV. Do not embellish.

```ts
export const profile = Object.freeze({
  name: 'MD Taufik Reza',
  initials: 'MTR',
  role: 'Security & Infrastructure Engineer',
  location: 'Kathmandu, Nepal',
  email: 'rezamdtaufik442@gmail.com',
  github: 'https://github.com/np03cy4s250017-coder',
  linkedin: 'https://www.linkedin.com/in/md-taufik-reza-119240349',
  resume: '/MD_Taufik_Reza_CV.pdf',
  /** The site's thesis, from Drishti's own README. */
  thesis: 'I build tools that state honestly what they cannot see.',
  summary:
    'I keep production systems running and build the tooling that audits them. Application support by day — incident triage, root-cause analysis, SQL diagnostics, Nagios monitoring — and security engineering the rest of the time.',
  experience: Object.freeze([
    {
      role: 'Application Support — L1',
      org: 'Net Core Nepal Pvt. Ltd',
      start: 'March 2025',
      end: 'Present',
      points: Object.freeze([
        '24×7 support for web-based production environments, handling user and system incidents end to end.',
        'Incident troubleshooting and escalation with supporting logs and root-cause analysis.',
        'SQL diagnostics against MySQL and PostgreSQL for data validation, correction and reporting.',
        'Nagios monitoring — managing monitored elements and handling alerts.',
        'Post-release validation testing and support for system updates and deployments.',
      ]),
    },
  ]),
  education: Object.freeze({
    degree: 'BSc (Hons) Cybersecurity',
    institution: 'University of Wolverhampton, UK',
    year: 2024,
    result: 'First Class Honours',
  }),
  certifications: Object.freeze([
    { name: 'Cisco Certified Network Associate (CCNA)', issuer: 'Cisco' },
    { name: 'Network+', issuer: 'CompTIA' },
    { name: 'Certified in Cybersecurity (CC)', issuer: 'ISC2' },
  ]),
})
```

- [ ] **Step 5: Write `src/content/skills.ts`**

```ts
import { skillGroupSchema, type SkillGroup } from '@/lib/schemas'

/** Every entry traces to the CV or to code in a public repo. Nothing aspirational. */
const raw: SkillGroup[] = [
  {
    label: 'Security',
    items: ['OWASP Top 10', 'FortiGate policy', 'Network segmentation', 'DNS / TLS', 'VPN & NAT', 'Incident response'],
  },
  {
    label: 'Infrastructure',
    items: ['TCP/IP', 'Nagios', 'Linux', 'Windows Server', 'Docker', 'FTTH / fibre basics'],
  },
  {
    label: 'Engineering',
    items: ['Python', 'FastAPI', 'JavaScript', 'React', 'Tailwind', 'SQL', 'SQLite', 'Git'],
  },
]

export const skillGroups: readonly SkillGroup[] = Object.freeze(raw.map((g) => skillGroupSchema.parse(g)))
```

- [ ] **Step 6: Run to verify it passes**

Run: `npm test`
Expected: PASS, 18 tests.

- [ ] **Step 7: Copy the résumé into `public/`**

```bash
cp "D:/My-Projects/MD_Taufik_Reza_CV.pdf" public/MD_Taufik_Reza_CV.pdf
```

Do **not** copy the `.docx`.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: add validated content modules for profile, projects and skills"
```

---

### Task 4: Reveal primitive and grade badge

**Files:**
- Create: `src/components/reveal.tsx`, `src/components/grade-badge.tsx`

**Interfaces:**
- Consumes: `cn` from Task 1, `GRADES` from Task 2
- Produces: `<Reveal index?: number>` wrapper; `<GradeBadge grade: Grade>`

- [ ] **Step 1: Write `src/components/reveal.tsx`**

```tsx
'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Adds data-reveal="shown" when the element scrolls into view. CSS in
 * globals.css does the animating, and only under prefers-reduced-motion:
 * no-preference — so a reduced-motion user gets final state with no JS
 * involvement, and a failed observer degrades to visible rather than blank.
 */
export function Reveal({ children, index = 0 }: { children: ReactNode; index?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || shown) return
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [shown])

  return (
    <div
      ref={ref}
      data-reveal={shown ? 'shown' : ''}
      style={{ '--reveal-index': index } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Write `src/components/grade-badge.tsx`**

The `title` and `sr-only` text are required — they are what stop the badge reading as an external rating.

```tsx
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
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add reveal wrapper and grade badge"
```

---

### Task 5: Layout shell — nav, footer, JSON-LD

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/components/site-nav.tsx`, `src/components/site-footer.tsx`

**Interfaces:**
- Consumes: `profile` from Task 3
- Produces: root layout exporting `metadata`; `<SiteNav>`, `<SiteFooter>`

- [ ] **Step 1: Write `src/components/site-nav.tsx`**

Requirements — a reviewer should check each:
- `<header>` with `sticky top-0 z-50`, `backdrop-blur`, `bg-background/80`, bottom border `border-border`
- Left: `profile.initials` in `font-mono text-accent`, linking to `#top`
- Right: anchors to `#work`, `#about`, `#contact` — `font-mono text-sm text-muted-foreground`, `hover:text-foreground`, `transition-colors duration-200`
- Every link ≥44×44px tappable (`px-3 py-2` minimum)
- Nav links hidden below `sm`; the initials and a single "Contact" link remain

- [ ] **Step 2: Write `src/components/site-footer.tsx`**

- `<footer>` with top border, `font-mono text-sm text-muted-foreground`
- Left: `© {new Date().getFullYear()} MD Taufik Reza`
- Right: GitHub, LinkedIn, Email — `lucide-react` icons (`Github`, `Linkedin`, `Mail`), each with an `aria-label`. **No emoji.**
- External links carry `target="_blank" rel="noopener noreferrer"`

- [ ] **Step 3: Update `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { profile } from '@/content/profile'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://portfolio-taufik.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${profile.name} — ${profile.role}`,
  description: profile.summary,
  openGraph: {
    title: `${profile.name} — ${profile.role}`,
    description: profile.summary,
    url: siteUrl,
    type: 'website',
  },
  robots: { index: true, follow: true },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: profile.name,
  jobTitle: profile.role,
  email: `mailto:${profile.email}`,
  url: siteUrl,
  sameAs: [profile.github, profile.linkedin],
  address: { '@type': 'PostalAddress', addressLocality: 'Kathmandu', addressCountry: 'NP' },
  alumniOf: { '@type': 'CollegeOrUniversity', name: profile.education.institution },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:text-background"
        >
          Skip to content
        </a>
        <SiteNav />
        <main id="main">{children}</main>
        <SiteFooter />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Verify build, then commit**

```bash
npm run build && git add -A && git commit -m "feat: add layout shell with nav, footer and Person schema"
```

---

### Task 6: Hero section

**Files:**
- Create: `src/components/sections/hero.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `profile`, `Reveal`
- Produces: `<Hero />`

- [ ] **Step 1: Write `src/components/sections/hero.tsx`**

Requirements:
- `<section id="top">`, `min-h-[85vh]`, vertically centred, `max-w-5xl` container
- Eyebrow: `profile.role` + `profile.location`, joined by a `·`, in `font-mono text-sm text-accent`
- `<h1>`: `profile.name` — `text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight`
- Below it, `profile.thesis` at `text-xl sm:text-2xl text-muted-foreground max-w-2xl`
- Then `profile.summary` at `text-base text-muted-foreground max-w-xl`
- Two CTAs: "View work" → `#work` (accent background, `text-background`); "Download CV" → `profile.resume` with `download` attribute (bordered, `border-border-interactive`). Both `h-11` minimum, `cursor-pointer`, `transition-colors duration-200`
- A credentials strip in `font-mono text-xs text-muted-foreground`: the three certification names joined by `·`
- Wrap the block in `<Reveal>`

**Do not** state or imply student status anywhere.

- [ ] **Step 2: Update `src/app/page.tsx` to render `<Hero />`**

- [ ] **Step 3: Verify build, then commit**

```bash
npm run build && git add -A && git commit -m "feat: add hero section"
```

---

### Task 7: Work grid and project cards

**Files:**
- Create: `src/components/project-card.tsx`, `src/components/sections/work.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `projects`, `GradeBadge`, `Reveal`
- Produces: `<ProjectCard project: Project; featured?: boolean>`, `<Work />`

- [ ] **Step 1: Write `src/components/project-card.tsx`**

Requirements:
- `<article>`, `bg-surface`, `border border-border`, `rounded-lg`, `p-6`
- Hover: `hover:border-border-interactive`, `transition-colors duration-200`
- Header row: `<h3>` project name, `<GradeBadge>` pushed right
- `project.tagline` in `text-muted-foreground`
- Stack tags: `font-mono text-xs`, each `rounded border border-border px-2 py-1`
- Footer links, `lucide-react` icons:
  - `repoUrl !== null` → "Code" → `<Github />`, `target="_blank" rel="noopener noreferrer"`
  - `kind === 'engagement'` → render `<Lock />` + the text "Client engagement — no public repository" in `font-mono text-xs text-muted-foreground` **instead of** a link
  - `featured` → "Read case study" → `/projects/{slug}`
- **Never render an `href="#"`.** If a link has no destination, omit the element. This was the old site's defining flaw.

- [ ] **Step 2: Write `src/components/sections/work.tsx`**

- `<section id="work">` with a `font-mono text-accent` eyebrow reading `01 — Work`
- Featured projects (Drishti, the deployment) span `md:col-span-2` in a `md:grid-cols-2` grid
- The three smaller apps fill a `md:grid-cols-3` row
- Each card wrapped in `<Reveal index={i}>` for the 60ms stagger

- [ ] **Step 3: Verify build, then commit**

```bash
npm run build && git add -A && git commit -m "feat: add work grid and project cards"
```

---

### Task 8: About, experience and skills sections

**Files:**
- Create: `src/components/sections/about.tsx`, `src/components/sections/skills.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `profile`, `skillGroups`, `Reveal`
- Produces: `<About />`, `<Skills />`

- [ ] **Step 1: Write `src/components/sections/skills.tsx`**

- `<section>` with eyebrow `02 — Capabilities`
- One column per `skillGroup`: `label` as a `font-mono text-accent text-sm` heading, `items` as a list of `font-mono text-sm text-muted-foreground` chips
- Group grid: `grid gap-8 md:grid-cols-3`

- [ ] **Step 2: Write `src/components/sections/about.tsx`**

- `<section id="about">` with eyebrow `03 — Background`
- Experience: for each `profile.experience` entry, role + org as `<h3>`, `start – end` in `font-mono text-xs text-muted-foreground`, `points` as a `<ul>`
- Education: degree, institution, year, result
- Certifications: `profile.certifications` as bordered `font-mono text-xs` chips
- Use `<time>` elements where a date is expressed

- [ ] **Step 3: Verify build, then commit**

```bash
npm run build && git add -A && git commit -m "feat: add skills and background sections"
```

---

### Task 9: Rate limiter

**Files:**
- Create: `src/lib/rate-limit.ts`
- Test: `src/lib/rate-limit.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `createRateLimiter(opts: { limit: number; windowMs: number }): { check(key: string, now?: number): boolean }`

- [ ] **Step 1: Write the failing test `src/lib/rate-limit.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { createRateLimiter } from './rate-limit'

describe('createRateLimiter', () => {
  it('allows requests up to the limit', () => {
    const rl = createRateLimiter({ limit: 3, windowMs: 1000 })
    expect(rl.check('a', 0)).toBe(true)
    expect(rl.check('a', 1)).toBe(true)
    expect(rl.check('a', 2)).toBe(true)
  })

  it('blocks the request past the limit', () => {
    const rl = createRateLimiter({ limit: 2, windowMs: 1000 })
    rl.check('a', 0)
    rl.check('a', 1)
    expect(rl.check('a', 2)).toBe(false)
  })

  it('tracks keys independently', () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 1000 })
    expect(rl.check('a', 0)).toBe(true)
    expect(rl.check('b', 0)).toBe(true)
    expect(rl.check('a', 0)).toBe(false)
  })

  it('allows again once the window has slid past', () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 1000 })
    expect(rl.check('a', 0)).toBe(true)
    expect(rl.check('a', 500)).toBe(false)
    expect(rl.check('a', 1001)).toBe(true)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `./rate-limit`.

- [ ] **Step 3: Write `src/lib/rate-limit.ts`**

```ts
type Limiter = { check(key: string, now?: number): boolean }

/**
 * Sliding-window limiter held in module memory.
 *
 * On Vercel Hobby this is best-effort, not a guarantee: instances are ephemeral
 * and requests may land on a cold one with an empty window. It raises the cost
 * of casual abuse; the honeypot is the primary spam defence.
 */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }): Limiter {
  const hits = new Map<string, number[]>()

  return {
    check(key: string, now: number = Date.now()): boolean {
      const cutoff = now - windowMs
      const recent = (hits.get(key) ?? []).filter((t) => t > cutoff)
      if (recent.length >= limit) {
        hits.set(key, recent)
        return false
      }
      hits.set(key, [...recent, now])
      return true
    },
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test`
Expected: PASS, 22 tests total.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add sliding-window rate limiter with tests"
```

---

### Task 10: Contact API route

**Files:**
- Create: `src/app/api/contact/route.ts`
- Test: `src/app/api/contact/route.test.ts`

**Interfaces:**
- Consumes: `contactSchema` (Task 2), `createRateLimiter` (Task 9), `profile` (Task 3)
- Produces: `POST(req: Request): Promise<Response>`

- [ ] **Step 1: Write the failing test `src/app/api/contact/route.test.ts`**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const send = vi.fn()
vi.mock('resend', () => ({ Resend: class { emails = { send } } }))

const post = async (body: unknown, ip = '1.1.1.1') => {
  const { POST } = await import('./route')
  return POST(new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  }))
}

const valid = { name: 'Ada', email: 'ada@example.com', message: 'This is a genuine enquiry.', website: '' }

beforeEach(() => {
  vi.resetModules()
  send.mockReset()
  send.mockResolvedValue({ data: { id: 'x' }, error: null })
  process.env.RESEND_API_KEY = 'test-key'
  process.env.CONTACT_TO_EMAIL = 'to@example.com'
})

describe('POST /api/contact', () => {
  it('sends a valid message and returns 200', async () => {
    const res = await post(valid)
    expect(res.status).toBe(200)
    expect(send).toHaveBeenCalledOnce()
  })

  it('returns 400 with field errors for a malformed payload', async () => {
    const res = await post({ ...valid, email: 'nope' })
    expect(res.status).toBe(400)
    expect((await res.json()).errors).toHaveProperty('email')
    expect(send).not.toHaveBeenCalled()
  })

  it('silently discards a honeypot hit with 200 and sends nothing', async () => {
    const res = await post({ ...valid, website: 'http://spam.test' })
    expect(res.status).toBe(200)
    expect(send).not.toHaveBeenCalled()
  })

  it('returns 429 once the per-IP limit is exceeded', async () => {
    for (let i = 0; i < 5; i++) await post(valid, '9.9.9.9')
    expect((await post(valid, '9.9.9.9')).status).toBe(429)
  })

  it('returns 502 with a generic message when Resend fails', async () => {
    send.mockResolvedValue({ data: null, error: { message: 'quota exceeded for account acct_12345' } })
    const res = await post(valid)
    expect(res.status).toBe(502)
    const body = await res.json()
    expect(body.error).toBe('Could not send message. Please email directly.')
    expect(JSON.stringify(body)).not.toContain('acct_12345')
  })

  it('returns 500 when the API key is not configured, without sending', async () => {
    delete process.env.RESEND_API_KEY
    expect((await post(valid)).status).toBe(500)
    expect(send).not.toHaveBeenCalled()
  })

  it('returns 400 for a non-JSON body', async () => {
    const { POST } = await import('./route')
    const res = await POST(new Request('http://localhost/api/contact', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: 'not json',
    }))
    expect(res.status).toBe(400)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `./route`.

- [ ] **Step 3: Write `src/app/api/contact/route.ts`**

```ts
import { Resend } from 'resend'
import { contactSchema } from '@/lib/schemas'
import { createRateLimiter } from '@/lib/rate-limit'
import { profile } from '@/content/profile'

const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 })

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || 'unknown'
}

export async function POST(req: Request): Promise<Response> {
  let payload: unknown
  try {
    payload = await req.json()
  } catch {
    return json({ error: 'Malformed request.' }, 400)
  }

  const parsed = contactSchema.safeParse(payload)
  if (!parsed.success) {
    // Field-level errors only. Never echo the submitted values back.
    const errors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form')
      errors[key] ??= issue.message
    }
    return json({ errors }, 400)
  }

  // Honeypot: 200, not 403. Telling a bot it was detected teaches it to adapt.
  if (parsed.data.website) return json({ ok: true }, 200)

  if (!limiter.check(clientIp(req))) {
    return json({ error: 'Too many messages. Please try again later.' }, 429)
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('[contact] RESEND_API_KEY is not configured')
    return json({ error: 'Contact form is not configured.' }, 500)
  }

  const { name, email, message } = parsed.data

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>',
      to: process.env.CONTACT_TO_EMAIL ?? profile.email,
      replyTo: email,
      subject: `Portfolio enquiry from ${name}`,
      // Plain text only — the message is never interpolated into HTML, so a
      // crafted body cannot inject markup into the inbox that receives it.
      text: `From: ${name} <${email}>\n\n${message}`,
    })
    if (error) {
      // Log upstream detail server-side; never return it. Provider errors can
      // disclose account state and quota information.
      console.error('[contact] resend error:', error)
      return json({ error: 'Could not send message. Please email directly.' }, 502)
    }
    return json({ ok: true }, 200)
  } catch (err) {
    console.error('[contact] unexpected failure:', err)
    return json({ error: 'Could not send message. Please email directly.' }, 502)
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test`
Expected: PASS, 29 tests total.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add contact API route with validation, honeypot and rate limiting"
```

---

### Task 11: Contact form and section

**Files:**
- Create: `src/components/contact-form.tsx`, `src/components/sections/contact.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `contactSchema`, `profile`
- Produces: `<ContactForm />`, `<Contact />`

- [ ] **Step 1: Write `src/components/contact-form.tsx`**

`'use client'`, `react-hook-form` with `zodResolver(contactSchema)`.

Requirements:
- Every field has a **visible** `<label>` — never placeholder-as-label
- Errors render beneath their field, `text-destructive text-sm`, tied by `aria-describedby`; inputs get `aria-invalid` when errored
- Honeypot: `<input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true">` inside a wrapper with `className="absolute left-[-9999px]"` — off-screen, not `display:none` (some bots skip hidden fields)
- Submit disabled while pending, label switches to "Sending…"
- Status region: `<p role="status" aria-live="polite">` for success, `role="alert"` for failure
- On a 400, map `errors` from the response onto fields via `setError`
- Inputs: `bg-background border border-border-interactive rounded px-3 h-11`, focus ring uses the accent outline from `globals.css`
- Buttons `h-11`, `cursor-pointer`

- [ ] **Step 2: Write `src/components/sections/contact.tsx`**

- `<section id="contact">` with eyebrow `04 — Contact`
- Two columns on `md`: form left, direct links right
- Direct links: email (`mailto:`), GitHub, LinkedIn — `lucide-react` icons, `aria-label` on each
- **No phone number.** Location renders as text only: "Kathmandu, Nepal"

- [ ] **Step 3: Verify build, then commit**

```bash
npm run build && git add -A && git commit -m "feat: add accessible contact form"
```

---

### Task 12: Case study pages

**Files:**
- Create: `src/app/projects/[slug]/page.tsx`, `src/content/case-studies.ts`

**Interfaces:**
- Consumes: `projects`, `getProjectBySlug`
- Produces: `generateStaticParams`, `generateMetadata`, default page component

- [ ] **Step 1: Write `src/content/case-studies.ts`**

Keyed by slug, only for `featured` projects. Each has `{ problem, approach, detail }` where `detail` is a list of `{ label, value }` rows.

**drishti** — content drawn from its README:
- Scoring channels with max points and OWASP mapping: TLS 25 (A02) · DNS 25 (A07/A08) · Headers 20 (A05/A02) · Ports 15 (A05) · Subdomains 5 (A05) · WHOIS 10 · Components 15 (A06)
- The active channel (A01) runs only against a domain whose ownership the user verified, and contributes its own 20 points
- Grades run A+ (95) down to F, and **a critical finding caps the grade at C**
- The thesis: the tool states what a remote scanner cannot see

**network-segmentation-deployment** — from the CV, at the disclosure level set in spec §11:
- Problem: surveillance systems on sensitive networks must be reachable by operators and unreachable by everyone else
- Approach: segmentation between internal, DMZ and external zones; FortiGate policy and rule validation; VPN and NAT verification; post-deployment fault isolation
- **No client names, sites, addresses, topology, IP ranges or rule contents.** A reviewer must confirm this before merge.

- [ ] **Step 2: Write `src/app/projects/[slug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { projects, getProjectBySlug } from '@/content/projects'
import { caseStudies } from '@/content/case-studies'

export function generateStaticParams() {
  return projects.filter((p) => p.featured).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) return {}
  return { title: `${project.name} — MD Taufik Reza`, description: project.tagline }
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  const study = caseStudies[slug]
  if (!project || !study) notFound()
  // Render: back link to /#work, h1 = project.name, tagline, grade badge,
  // stack tags, Problem / Approach prose, the detail table in font-mono,
  // and a repo link only when project.repoUrl !== null.
}
```

- [ ] **Step 3: Verify build, then commit**

```bash
npm run build && git add -A && git commit -m "feat: add case study pages for Drishti and the deployment engagement"
```

---

### Task 13: SEO surfaces

**Files:**
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/opengraph-image.tsx`

**Interfaces:**
- Consumes: `projects`, `profile`
- Produces: three route handlers

- [ ] **Step 1: Write `src/app/sitemap.ts`**

```ts
import type { MetadataRoute } from 'next'
import { projects } from '@/content/projects'

const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://portfolio-taufik.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: base, lastModified: new Date(), priority: 1 },
    ...projects
      .filter((p) => p.featured)
      .map((p) => ({ url: `${base}/projects/${p.slug}`, lastModified: new Date(), priority: 0.8 })),
  ]
}
```

- [ ] **Step 2: Write `src/app/robots.ts`**

```ts
import type { MetadataRoute } from 'next'

const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://portfolio-taufik.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: `${base}/sitemap.xml`,
  }
}
```

- [ ] **Step 3: Write `src/app/opengraph-image.tsx`**

`ImageResponse` at 1200×630, background `#0F172A`, name in `#F8FAFC` at ~64px, role and location in `#22C55E` monospace beneath. No external fonts or images — the edge runtime cannot fetch them under CSP.

- [ ] **Step 4: Verify build, then commit**

```bash
npm run build && git add -A && git commit -m "feat: add sitemap, robots and generated OG image"
```

---

### Task 14: Screenshots

**Files:**
- Create: `public/shots/*.png`
- Modify: `src/content/projects.ts` (add optional `image` field), `src/lib/schemas.ts`, `src/components/project-card.tsx`

**Interfaces:**
- Consumes: existing project card
- Produces: `image: string | null` on `projectSchema`

- [ ] **Step 1: Extend `projectSchema`**

Add `image: z.string().startsWith('/shots/').nullable().default(null)`.

- [ ] **Step 2: Capture the three vanilla-JS apps**

Open each `index.html` from `D:\My-Projects\{Job_finder,Expense-Tracker,Task-Manager}` at 1440×900 and capture the viewport. Save to `public/shots/{devjobs,fintrack,novashop}.png`.

- [ ] **Step 3: Capture Drishti**

Prefer `D:\My-Projects\Drishti\DESIGN-PREVIEW.html`, which needs no server. Only if that is unusable, start the backend and frontend per its README.

- [ ] **Step 4: Handle the engagement card**

`network-segmentation-deployment` keeps `image: null` — there is nothing photographable that would not disclose client infrastructure. Its card uses the typographic fallback.

- [ ] **Step 5: Render in the card**

`next/image` with static width/height so space is reserved and CLS stays at 0. When `image === null`, render the typographic fallback. **No stock photography under any circumstance.**

- [ ] **Step 6: Verify build, then commit**

```bash
npm run build && git add -A && git commit -m "feat: add real project screenshots"
```

---

### Task 15: E2E and full verification

**Files:**
- Create: `playwright.config.ts`, `e2e/portfolio.spec.ts`

- [ ] **Step 1: Write `playwright.config.ts`**

`testDir: './e2e'`, `webServer: { command: 'npm run build && npm run start', url: 'http://localhost:3000', reuseExistingServer: !process.env.CI }`.

- [ ] **Step 2: Write `e2e/portfolio.spec.ts`**

```ts
import { test, expect } from '@playwright/test'

test('home renders identity and real work', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('MD Taufik Reza')
  await expect(page.getByText('Drishti')).toBeVisible()
})

test('no dead links — the old site was full of href="#"', async ({ page }) => {
  await page.goto('/')
  expect(await page.locator('a[href="#"]').count()).toBe(0)
})

test('no invented projects survive from the old site', async ({ page }) => {
  await page.goto('/')
  const body = (await page.textContent('body')) ?? ''
  for (const ghost of ['E-Commerce Platform', 'Analytics Dashboard', 'Task Management App']) {
    expect(body).not.toContain(ghost)
  }
})

test('no phone number is exposed', async ({ page }) => {
  await page.goto('/')
  const html = await page.content()
  expect(html).not.toContain('9820092586')
  expect(html).not.toContain('tel:')
})

test('case study is reachable and returns home', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: /case study/i }).first().click()
  await expect(page).toHaveURL(/\/projects\//)
  await page.getByRole('link', { name: /work|back/i }).first().click()
  await expect(page).toHaveURL(/\/$|#work/)
})

test('contact form validates and submits', async ({ page }) => {
  await page.route('**/api/contact', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }),
  )
  await page.goto('/#contact')
  await page.getByLabel(/name/i).fill('Ada Lovelace')
  await page.getByLabel(/email/i).fill('ada@example.com')
  await page.getByLabel(/message/i).fill('I would like to discuss a security engineering role.')
  await page.getByRole('button', { name: /send/i }).click()
  await expect(page.getByRole('status')).toBeVisible()
})
```

- [ ] **Step 3: Run everything**

```bash
npm run lint && npx tsc --noEmit && npm test && npm run build && npx playwright test
```

Expected: all pass. Fix failures before proceeding — do not report completion on a red suite.

- [ ] **Step 4: Responsive and accessibility check**

Verify at 375 / 768 / 1024 / 1440: no horizontal scroll, tap targets ≥44px, focus visible on every interactive element via keyboard only. Confirm reveal animations are absent under `prefers-reduced-motion: reduce` and content is still visible.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "test: add E2E coverage for content integrity and contact flow"
```

---

### Task 16: Deploy

**Files:**
- Create: `gh-pages/index.html` (on the `gh-pages` branch only)

- [ ] **Step 1: Push to `Portfolio-Taufik`**

```bash
git remote add origin https://github.com/np03cy4s250017-coder/Portfolio-Taufik.git
git push -u origin main --force-with-lease
```

`--force-with-lease` rather than `--force`: it refuses if the remote moved unexpectedly.

- [ ] **Step 2: Create the redirect branch**

The CV in circulation points at `np03cy4s250017-coder.github.io/Portfolio-Taufik`, live today. This keeps it working.

```bash
git checkout --orphan gh-pages && git rm -rf .
```

Write `index.html`:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>MD Taufik Reza — Portfolio</title>
<link rel="canonical" href="https://portfolio-taufik.vercel.app/">
<meta http-equiv="refresh" content="0; url=https://portfolio-taufik.vercel.app/">
<style>body{background:#0F172A;color:#F8FAFC;font-family:ui-monospace,monospace;display:grid;place-items:center;min-height:100vh;margin:0}a{color:#22C55E}</style>
</head>
<body>
<p>This portfolio has moved. <a href="https://portfolio-taufik.vercel.app/">Continue &rarr;</a></p>
</body>
</html>
```

```bash
git add index.html && git commit -m "chore: redirect legacy Pages URL to the Vercel site"
git push -u origin gh-pages && git checkout main
```

Then set Pages source to the `gh-pages` branch in repository settings.

- [ ] **Step 3: Import to Vercel**

Import `Portfolio-Taufik`, framework auto-detects as Next.js. Set environment variables for Production **and** Preview:

| Name | Value |
|---|---|
| `RESEND_API_KEY` | the **rotated** sending-access key — never the one pasted in chat |
| `CONTACT_TO_EMAIL` | `rezamdtaufik442@gmail.com` |
| `NEXT_PUBLIC_SITE_URL` | the assigned Vercel URL |

- [ ] **Step 4: Verify in production**

Confirm: home renders; a case study loads; the contact form delivers a real email; the legacy Pages URL forwards; `/sitemap.xml` and `/robots.txt` resolve; the OG image renders in a link preview.

- [ ] **Step 5: Update the redirect if the Vercel URL differs**

If Vercel assigns something other than `portfolio-taufik.vercel.app`, update `NEXT_PUBLIC_SITE_URL`, the two URLs in `gh-pages/index.html`, and the fallbacks in `sitemap.ts`, `robots.ts` and `layout.tsx`.

---

## Review Gates

Per the agreed scope, run **only** these:

1. **`security-reviewer`** — after Task 10, scoped to `src/app/api/contact/route.ts`, `src/lib/rate-limit.ts`, `src/lib/schemas.ts`. Checks: no secret in the repo, no upstream error text returned to clients, honeypot returns 200, no HTML interpolation of user input, validation is server-side and not merely client-side.
2. **`code-reviewer`** — after Task 15, across the diff.
3. **`/design-review`** — after Task 15, on the running site.

Address CRITICAL and HIGH findings before Task 16. Fix MEDIUM where practical.

Not run, by agreement: `planner`, `architect`, `tdd-guide`, `e2e-runner`, `refactor-cleaner`, `doc-updater`.

---

## Self-Review Notes

**Spec coverage:** §3 stack → Task 1 · §5 architecture → Tasks 1–3 · §6 palette and type → Tasks 1, 4–8 · §7 motion → Task 4 · §8 contact → Tasks 9–11 · §9 testing → Tasks 2, 3, 9, 10, 15 · §10 SEO → Task 13 · §11 content → Tasks 3, 12, 14 · §13 deployment → Task 16.

**Type consistency:** `Project` and `SkillGroup` originate in `src/lib/schemas.ts` and are imported everywhere. `getProjectBySlug` keeps that name in Tasks 3, 12. `createRateLimiter().check(key, now?)` keeps that signature in Tasks 9, 10. `caseStudies` is keyed by slug in Tasks 12.

**Known deviation from global rules:** coverage will not reach 80% overall, because most of the codebase is presentational JSX where a test would assert that a heading renders. Tests concentrate on schemas, the rate limiter, and all seven `/api/contact` paths — the code that can actually break. Recorded deliberately, not overlooked.
