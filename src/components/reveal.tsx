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
