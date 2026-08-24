'use client'

import dynamic from 'next/dynamic'

/**
 * Loads the hero lattice only in the browser, and only after the page is
 * interactive.
 *
 * three.js is by far the largest thing this site would ship. Importing it
 * lazily from a client boundary keeps it out of the server bundle and off the
 * critical path, so the hero text still paints immediately on a slow connection
 * and the lattice fades in behind it whenever it is ready — or never, on a
 * device without WebGL, which changes nothing that matters.
 */
const Topology = dynamic(() => import('@/components/topology'), { ssr: false })

export function TopologyMount() {
  return <Topology />
}
