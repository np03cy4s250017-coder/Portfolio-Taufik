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
