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
