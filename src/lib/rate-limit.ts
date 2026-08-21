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
