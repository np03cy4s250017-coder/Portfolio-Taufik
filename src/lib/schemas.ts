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
  demoUrl: z
    .string()
    .url()
    .startsWith('https://np03cy4s250017-coder.github.io/')
    .nullable()
    .default(null),
  featured: z.boolean(),
  kind: z.enum(['software', 'engagement']),
  /**
   * Screenshot captured from the running application, never stock photography.
   * null means the card falls back to a typographic treatment.
   */
  image: z.string().startsWith('/shots/').nullable().default(null),
})

export const skillGroupSchema = z.object({
  label: z.string().min(1),
  items: z.array(z.string().min(1)).min(1),
})

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Your name is required').max(100),
  email: z.string().trim().email('Enter a valid email address'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(5000),
  /**
   * Honeypot. Real users never see this field, so a non-empty value means a bot.
   *
   * Deliberately permissive: rejecting a filled honeypot here would return 400
   * and tell the bot it was caught. The route accepts the request, answers 200
   * and discards it, which is the whole point of the trap.
   */
  website: z.string().optional(),
})

export type Project = z.infer<typeof projectSchema>
export type SkillGroup = z.infer<typeof skillGroupSchema>
export type ContactInput = z.infer<typeof contactSchema>
