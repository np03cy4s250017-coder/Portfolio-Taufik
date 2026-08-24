/**
 * A generic illustration of the segmentation pattern used on IP-CCTV
 * deployments — NOT any client's topology.
 *
 * The engagement covered government and hospital sites, so nothing here may be
 * traceable to a real network: no client names, no site names, no addressing, no
 * rule contents, no interface names, no counts of anything real. What it shows
 * is the textbook shape any competent deployment has, which is the part worth
 * claiming: cameras isolated from the people who watch them, recording reachable
 * from neither side directly, and remote access arriving through one controlled
 * point rather than a port forward.
 *
 * Deliberately shares its visual grammar with the hero lattice: nodes, zone
 * bands, and the accent reserved for boundary crossings.
 */

interface Zone {
  readonly id: string
  readonly label: string
  readonly caption: string
  readonly nodes: readonly string[]
  readonly y: number
}

const ZONES: readonly Zone[] = [
  {
    id: 'external',
    label: 'EXTERNAL',
    caption: 'Remote access, VPN only',
    nodes: ['Remote operator'],
    y: 16,
  },
  {
    id: 'dmz',
    label: 'DMZ',
    caption: 'Recording and control, no outbound path',
    nodes: ['NVR', 'Management'],
    y: 116,
  },
  {
    // Cameras sit alone here on purpose. An earlier draft put operator
    // workstations in this band too, while the caption claimed the cameras were
    // isolated from clients — the picture contradicted the sentence beside it.
    // On this pattern a camera reaches the recorder and nothing else, so that is
    // what the band shows.
    id: 'internal',
    label: 'CAMERA VLAN',
    caption: 'Isolated; reaches the recorder only',
    nodes: ['Cameras'],
    y: 216,
  },
]

export function SegmentationDiagram() {
  return (
    <figure className="m-0">
      <svg
        viewBox="0 0 460 300"
        role="img"
        aria-labelledby="segmentation-title segmentation-desc"
        className="h-auto w-full text-muted-foreground"
        preserveAspectRatio="xMidYMid meet"
      >
        <title id="segmentation-title">Network segmentation pattern for IP-CCTV</title>
        <desc id="segmentation-desc">
          Three zones stacked vertically. External holds remote operators reaching the site over
          VPN. The DMZ holds recording and management with no outbound path. The camera VLAN is
          isolated and reaches the recorder only. Traffic crosses between zones just at the
          firewall policy marked on each boundary.
        </desc>

        {ZONES.map((zone) => (
          <g key={zone.id}>
            <rect
              x={1}
              y={zone.y}
              width={458}
              height={68}
              rx={4}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.25}
              strokeDasharray="3 3"
            />
            <text
              x={14}
              y={zone.y + 20}
              className="fill-current font-mono"
              fontSize={10}
              letterSpacing={1.4}
              opacity={0.85}
            >
              {zone.label}
            </text>
            <text x={14} y={zone.y + 36} className="fill-current" fontSize={10} opacity={0.55}>
              {zone.caption}
            </text>

            {zone.nodes.map((node, index) => (
              <g key={node} transform={`translate(${190 + index * 132}, ${zone.y + 34})`}>
                <rect
                  x={0}
                  y={-13}
                  width={124}
                  height={26}
                  rx={3}
                  fill="currentColor"
                  fillOpacity={0.07}
                  stroke="currentColor"
                  strokeOpacity={0.3}
                />
                <text
                  x={62}
                  y={4}
                  textAnchor="middle"
                  className="fill-current"
                  fontSize={10}
                  opacity={0.9}
                >
                  {node}
                </text>
              </g>
            ))}
          </g>
        ))}

        {/* Boundary crossings. The only accent on the figure, because the whole
            point of the pattern is that these are the only ways through. */}
        {[100, 200].map((y) => (
          <g key={y} className="text-accent">
            <line
              x1={230}
              y1={y - 16}
              x2={230}
              y2={y + 16}
              stroke="currentColor"
              strokeOpacity={0.75}
              strokeWidth={1.5}
            />
            <rect
              x={196}
              y={y - 9}
              width={68}
              height={18}
              rx={9}
              fill="var(--color-background)"
              stroke="currentColor"
              strokeOpacity={0.75}
            />
            <text
              x={230}
              y={y + 4}
              textAnchor="middle"
              className="fill-current font-mono"
              fontSize={9}
              letterSpacing={0.6}
            >
              policy
            </text>
          </g>
        ))}
      </svg>

      <figcaption className="mt-3 text-xs text-muted-foreground">
        The segmentation pattern, not a client topology. No site, address or rule detail is shown.
      </figcaption>
    </figure>
  )
}
