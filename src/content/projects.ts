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
    featured: true,
    kind: 'engagement',
    image: null,
  },
  {
    slug: 'devjobs',
    name: 'DevJobs',
    tagline:
      'A job board filtering live by keyword, contract type and experience level, with saved listings persisted across visits.',
    grade: 'B+',
    year: 2025,
    stack: ['JavaScript', 'CSS', 'JSON'],
    repoUrl: 'https://github.com/np03cy4s250017-coder/Job-Finder-App',
    featured: false,
    kind: 'software',
    image: '/shots/devjobs.png',
  },
  {
    slug: 'fintrack',
    name: 'FinTrack',
    tagline:
      'A personal finance tracker in NPR — income weighed against expenses, with spending broken down by category.',
    grade: 'B+',
    year: 2025,
    stack: ['JavaScript', 'Chart.js', 'CSS'],
    repoUrl: 'https://github.com/np03cy4s250017-coder/Expense-Tracker',
    featured: false,
    kind: 'software',
    image: '/shots/fintrack.png',
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
    image: '/shots/novashop.png',
  },
]

export const projects: readonly Project[] = Object.freeze(raw.map((p) => projectSchema.parse(p)))

export const featuredProjects: readonly Project[] = projects.filter((p) => p.featured)

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}
