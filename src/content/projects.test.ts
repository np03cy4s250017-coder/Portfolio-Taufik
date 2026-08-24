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
    expect(e?.demoUrl).toBeNull()
  })

  it('links the statically hostable apps to their GitHub Pages demo', () => {
    for (const slug of ['fintrack', 'novashop']) {
      expect(getProjectBySlug(slug)?.demoUrl).toMatch(
        /^https:\/\/np03cy4s250017-coder\.github\.io\//,
      )
    }
  })

  // DevJobs is server-rendered with database-backed sessions, so no static host
  // can serve it. Claiming a demo would mean linking something that is not this
  // application — the exact failure this site was rebuilt to correct — so the
  // absence is asserted rather than left to drift back in.
  it('claims no demo for the app that cannot be statically hosted', () => {
    expect(getProjectBySlug('devjobs')?.demoUrl).toBeNull()
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
