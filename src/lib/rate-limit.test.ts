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
