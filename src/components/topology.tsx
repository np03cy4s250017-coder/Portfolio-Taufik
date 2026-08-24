'use client'

import { useEffect, useRef } from 'react'
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  WebGLRenderer,
} from 'three'

/**
 * An ambient network-segmentation lattice.
 *
 * Three horizontal planes of nodes stand for the EXTERNAL, DMZ and INTERNAL
 * zones. Links run freely inside a zone, but cross a zone boundary only through
 * a handful of nodes — which is what a firewall is. Those crossings are the only
 * thing drawn in the accent colour, so the one bright thing on the page marks a
 * real idea rather than decorating.
 *
 * It is decorative: aria-hidden, and the hero reads identically without it.
 */

// Wide separation, narrow spread: the three bands have to read as distinct
// zones rather than one cloud of dots.
const ZONES = [
  { y: 1.9, count: 13, spread: 4.4 },
  { y: 0.0, count: 9, spread: 3.4 },
  { y: -1.9, count: 15, spread: 4.8 },
] as const

const INTRA_LINK_DISTANCE = 2.3
const CROSSINGS_PER_BOUNDARY = 2
const FULL_TURN_MS = 120_000

interface Node {
  readonly x: number
  readonly y: number
  readonly z: number
  readonly zone: number
}

/**
 * Deterministic PRNG. The lattice must look identical on the server-rendered
 * screenshot, on every reload and in every browser — a random layout would make
 * visual regressions impossible to spot.
 */
function seeded(seed: number): () => number {
  let value = seed
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296
    return value / 4294967296
  }
}

function buildLattice(): { nodes: Node[]; intra: number[]; crossing: number[] } {
  const random = seeded(20260824)
  const nodes: Node[] = []

  ZONES.forEach((zone, zoneIndex) => {
    for (let index = 0; index < zone.count; index += 1) {
      nodes.push({
        x: (random() - 0.5) * zone.spread * 2,
        y: zone.y + (random() - 0.5) * 0.5,
        z: (random() - 0.5) * zone.spread,
        zone: zoneIndex,
      })
    }
  })

  const intra: number[] = []
  const crossing: number[] = []

  for (let a = 0; a < nodes.length; a += 1) {
    for (let b = a + 1; b < nodes.length; b += 1) {
      const first = nodes[a]
      const second = nodes[b]
      if (first === undefined || second === undefined) continue
      if (first.zone !== second.zone) continue

      const distance = Math.hypot(first.x - second.x, first.y - second.y, first.z - second.z)
      if (distance < INTRA_LINK_DISTANCE) {
        intra.push(first.x, first.y, first.z, second.x, second.y, second.z)
      }
    }
  }

  // Boundary crossings: a small, fixed number of links between adjacent zones.
  //
  // Each one joins its NEAREST counterpart in the next zone. Picking at random
  // produced long diagonals that swept across the whole scene and read as lasers
  // rather than as chokepoints — and, sitting behind left-aligned hero copy,
  // they cut straight through the headline.
  for (let boundary = 0; boundary < ZONES.length - 1; boundary += 1) {
    const upper = nodes.filter((node) => node.zone === boundary)
    const lower = nodes.filter((node) => node.zone === boundary + 1)

    const used = new Set<number>()
    for (let crossingIndex = 0; crossingIndex < CROSSINGS_PER_BOUNDARY; crossingIndex += 1) {
      const from = upper[Math.floor(random() * upper.length)]
      if (from === undefined) continue

      let nearest: Node | undefined
      let nearestIndex = -1
      let best = Infinity
      lower.forEach((candidate, candidateIndex) => {
        if (used.has(candidateIndex)) return
        // Horizontal distance only: a crossing is supposed to span the vertical
        // gap between zones, so counting that gap would rank every candidate
        // equally and defeat the search.
        const flat = Math.hypot(from.x - candidate.x, from.z - candidate.z)
        if (flat < best) {
          best = flat
          nearest = candidate
          nearestIndex = candidateIndex
        }
      })

      if (nearest === undefined) continue
      // Claim the winner only after the scan. Marking each improving candidate
      // during it excluded most of the zone from later searches and produced
      // exactly the long diagonals this was meant to remove.
      used.add(nearestIndex)
      crossing.push(from.x, from.y, from.z, nearest.x, nearest.y, nearest.z)
    }
  }

  return { nodes, intra, crossing }
}

function readToken(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value === '' ? fallback : value
}

export default function Topology() {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (host === null) return

    let renderer: WebGLRenderer
    try {
      renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
    } catch {
      // No WebGL (old hardware, blocked context, some headless browsers). The
      // hero is complete without this, so failing silently is correct.
      return
    }

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const foreground = readToken('--color-muted-foreground', '#94A3B8')
    const accent = readToken('--color-accent', '#22C55E')

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(host.clientWidth, host.clientHeight)
    host.append(renderer.domElement)

    const scene = new Scene()
    const camera = new PerspectiveCamera(42, host.clientWidth / host.clientHeight, 0.1, 100)
    camera.position.set(0, 1.2, 13)
    camera.lookAt(0, 0, 0)

    const { nodes, intra, crossing } = buildLattice()
    const group = new Group()

    const pointGeometry = new BufferGeometry()
    pointGeometry.setAttribute(
      'position',
      new BufferAttribute(new Float32Array(nodes.flatMap((n) => [n.x, n.y, n.z])), 3),
    )
    group.add(
      new Points(
        pointGeometry,
        new PointsMaterial({ color: foreground, size: 0.09, transparent: true, opacity: 0.75 }),
      ),
    )

    const intraGeometry = new BufferGeometry()
    intraGeometry.setAttribute('position', new BufferAttribute(new Float32Array(intra), 3))
    group.add(
      new LineSegments(
        intraGeometry,
        new LineBasicMaterial({ color: foreground, transparent: true, opacity: 0.16 }),
      ),
    )

    const crossingGeometry = new BufferGeometry()
    crossingGeometry.setAttribute('position', new BufferAttribute(new Float32Array(crossing), 3))
    group.add(
      new LineSegments(
        crossingGeometry,
        new LineBasicMaterial({
          color: accent,
          transparent: true,
          // Low enough to read as a marked path rather than a drawn line. The
          // crossings are the only accent on the page and they sit beside the
          // headline, so they earn attention by being the only green thing, not
          // by being bright.
          opacity: 0.28,
          blending: AdditiveBlending,
        }),
      ),
    )

    scene.add(group)

    let frame = 0
    let pointerX = 0
    let pointerY = 0

    const draw = (rotation: number) => {
      group.rotation.y = rotation
      group.rotation.x = pointerY * 0.12
      camera.position.x = pointerX * 0.9
      camera.lookAt(0, 0, 0)
      renderer.render(scene, camera)
    }

    const started = performance.now()
    const tick = (now: number) => {
      draw(((now - started) / FULL_TURN_MS) * Math.PI * 2)
      frame = requestAnimationFrame(tick)
    }

    const onPointerMove = (event: PointerEvent) => {
      pointerX = (event.clientX / window.innerWidth - 0.5) * 2
      pointerY = (event.clientY / window.innerHeight - 0.5) * 2
    }

    const stop = () => {
      if (frame !== 0) cancelAnimationFrame(frame)
      frame = 0
    }
    const start = () => {
      if (still || frame !== 0) return
      frame = requestAnimationFrame(tick)
    }

    const onVisibility = () => (document.hidden ? stop() : start())

    // Only animate while actually on screen: a hero that keeps a rAF loop alive
    // behind three screens of content is a battery cost with nothing to show.
    const observer = new IntersectionObserver(
      ([entry]) => (entry?.isIntersecting === true ? start() : stop()),
      { threshold: 0.01 },
    )
    observer.observe(host)

    const onResize = () => {
      renderer.setSize(host.clientWidth, host.clientHeight)
      camera.aspect = host.clientWidth / host.clientHeight
      camera.updateProjectionMatrix()
      if (still) draw(0)
    }

    if (still) draw(0)
    else window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('resize', onResize)

    return () => {
      stop()
      observer.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', onResize)
      pointGeometry.dispose()
      intraGeometry.dispose()
      crossingGeometry.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return (
    <div
      ref={hostRef}
      aria-hidden
      className={
        // The hero copy is left-aligned, so the lattice sits in the right half
        // on wide screens and never competes with the headline for contrast.
        // Below lg there is no room beside the text, so it falls back to a
        // full-bleed wash at low opacity, faded hard at every edge.
        'pointer-events-none absolute inset-y-0 right-0 w-full opacity-40 ' +
        'lg:w-[55%] lg:opacity-100 ' +
        '[mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]'
      }
    />
  )
}
