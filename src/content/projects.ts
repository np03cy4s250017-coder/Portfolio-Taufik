import { projectSchema, type Project } from '@/lib/schemas'

/**
 * Grades are a self-assessment of scope and depth, echoing Drishti's own A+–F
 * scoring scale. They are labelled as such in the UI and are never presented as
 * an external rating.
 *
 * Every tagline below was checked against the source it describes. Hyperlocal is
 * deliberately absent — see spec §11. Its README advertises a FastAPI + PostGIS
 * backend and four apps; the folder has no backend directory and one
 * partially-built app.
 */
const raw: Project[] = [
  {
    slug: 'drishti',
    name: 'Drishti',
    tagline:
      'A domain security auditor mapped to the OWASP Top 10 — and an honest statement of what a remote scanner cannot see.',
    grade: 'A+',
    year: 2026,
    stack: ['FastAPI', 'SQLite', 'React', 'Vite', 'Tailwind', 'WebSocket'],
    repoUrl: 'https://github.com/np03cy4s250017-coder/Drishti',
    demoUrl: null,
    featured: true,
    kind: 'software',
    image: '/shots/drishti.png',
  },
  {
    slug: 'network-segmentation-deployment',
    name: 'CCTV & FortiGate Deployment',
    tagline:
      'Assisted IP-CCTV and FortiGate deployment across government and hospital sites — network segmentation, firewall policy validation, and troubleshooting between internal, DMZ and external zones.',
    grade: 'A',
    year: 2025,
    stack: ['FortiGate', 'IP-CCTV', 'VLAN segmentation', 'VPN', 'NAT'],
    repoUrl: null,
    demoUrl: null,
    featured: true,
    kind: 'engagement',
    image: null,
  },
  {
    slug: 'devjobs',
    name: 'DevJobs',
    tagline:
      'A server-rendered job board: ranked search in SQLite FTS5, facet counts computed against every other active filter, and an employer pipeline with tested status transitions.',
    grade: 'A',
    year: 2026,
    stack: ['React Router', 'TypeScript', 'Drizzle', 'libSQL', 'SQLite FTS5', 'Playwright'],
    repoUrl: 'https://github.com/np03cy4s250017-coder/Job-Finder-App',
    // No demo link: DevJobs is a server-rendered app with sessions and a
    // database, so GitHub Pages cannot host it. A link would have to point at
    // something that is not this application, which is exactly the failure this
    // site exists to correct. Restore it when the app is deployed to a Node host.
    demoUrl: null,
    featured: false,
    kind: 'software',
    image: '/shots/devjobs.png',
  },
  {
    slug: 'fintrack',
    name: 'FinTrack',
    tagline:
      'An offline NPR ledger using integer paisa, gap-free monthly analytics and row-level RFC 4180 import errors.',
    grade: 'A',
    year: 2026,
    stack: ['React', 'TypeScript', 'IndexedDB', 'Recharts', 'Vitest'],
    repoUrl: 'https://github.com/np03cy4s250017-coder/Expense-Tracker',
    demoUrl: 'https://np03cy4s250017-coder.github.io/Expense-Tracker/',
    featured: false,
    kind: 'software',
    image: '/shots/fintrack.png',
  },
  {
    slug: 'novashop',
    name: 'NovaShop',
    tagline:
      'A storefront whose pure cart reducer clamps stock, repairs stale saved carts and rounds VAT once per order.',
    grade: 'A',
    year: 2026,
    stack: ['React', 'TypeScript', 'React Router', 'Zod', 'Vitest', 'Playwright'],
    repoUrl: 'https://github.com/np03cy4s250017-coder/Tech-Store',
    demoUrl: 'https://np03cy4s250017-coder.github.io/Tech-Store/',
    featured: false,
    kind: 'software',
    image: '/shots/novashop.png',
  },
]

export const projects: readonly Project[] = Object.freeze(raw.map((p) => projectSchema.parse(p)))

export const featuredProjects: readonly Project[] = projects.filter((p) => p.featured)

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}
