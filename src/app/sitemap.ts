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
