'use client'

import { useEffect, useRef, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

/**
 * Sets data-reveal="shown" when the element scrolls into view. CSS in
 * globals.css does the animating, and only under prefers-reduced-motion:
 * no-preference — so a reduced-motion user gets final state with no JS
 * involvement, and a failed observer degrades to visible rather than blank.
 *
 * The attribute is written straight to the node rather than held in state.
 * Revealing is a one-way DOM update with no bearing on what React renders,
 * so routing it through setState would only buy a re-render per element.
 */
export function Reveal({
  children,
  index = 0,
  className,
}: {
  children: ReactNode
  index?: number
  /** Applied to the wrapper, which is the grid/flex item — not the child. */
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const show = () => {
      el.dataset.reveal = 'shown'
    }

    if (typeof IntersectionObserver === 'undefined') {
      show()
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          show()
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(className)}
      data-reveal=""
      style={{ '--reveal-index': index } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
