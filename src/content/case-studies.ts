export type DetailRow = { label: string; value: string }

export type CaseStudy = {
  problem: string
  approach: string
  detail: readonly DetailRow[]
  detailCaption: string
}

/**
 * Case studies exist only for featured projects.
 *
 * Drishti's figures are transcribed from its README's scoring table and were
 * re-checked against it. The engagement entry is written at the disclosure
 * level set in spec §11: capabilities exercised, never client-identifying
 * detail — no site names, locations, topology, IP ranges or rule contents.
 */
export const caseStudies: Readonly<Record<string, CaseStudy>> = Object.freeze({
  drishti: {
    problem:
      'Most domain scanners return a wall of findings and an unearned number. They rarely say which risks they are blind to, so a clean report reads as a clean site — even when the categories that matter most were never observable from outside.',
    approach:
      'Seven passive channels each start at a maximum and lose points for what they find, every one mapped to the OWASP Top 10 category it actually covers. Where a category cannot be judged remotely, the tool records that it cannot rather than scoring it as a pass. Active checks against A01 are gated behind verified domain ownership, so the scanner never probes a host the operator has not proven they control.',
    detail: [
      { label: 'CH1 SSL/TLS', value: '25 pts · A02 — certificate validity and expiry, protocol versions, chain' },
      { label: 'CH2 DNS', value: '25 pts · A07/A08 — SPF, DMARC, DNSSEC, MX' },
      { label: 'CH3 Headers', value: '20 pts · A05/A02 — HSTS, CSP, framing, MIME, referrer, HTTPS redirect' },
      { label: 'CH4 Ports', value: '15 pts · A05 — reachable services, sensitive ports weighted heavily' },
      { label: 'CH5 Subdomains', value: '5 pts · A05 — passive discovery over a fixed wordlist' },
      { label: 'CH6 WHOIS', value: '10 pts · operational, not an OWASP web risk — registration expiry, transfer lock' },
      { label: 'CH7 Components', value: '15 pts · A06 — server banner and front-end libraries against the OSV CVE database' },
      { label: 'Active channel', value: '20 pts · A01 — runs only on a domain whose ownership the user verified' },
      { label: 'Grading', value: 'A+ at 95 down to F. A critical finding caps the grade at C.' },
      { label: 'Not observable', value: 'A04 insecure design and A09 logging carry no external signal — the report says so rather than scoring them' },
    ],
    detailCaption: 'Scoring channels, as defined in the project README',
  },

  'network-segmentation-deployment': {
    problem:
      'Surveillance systems on sensitive networks have to be reachable by the operators who depend on them and unreachable by everyone else. A camera estate is a large, uniform, rarely-patched attack surface sitting inside the same buildings as clinical and administrative systems.',
    approach:
      'Worked within a deployment team on IP-CCTV and Fortinet FortiGate rollouts, keeping surveillance traffic in its own segment with controlled paths between internal, DMZ and external zones. Verified that firewall policy matched intent rather than assuming it, and stayed on after handover for fault isolation and connectivity work.',
    detail: [
      { label: 'Segmentation', value: 'Surveillance traffic isolated from general network segments in sensitive environments' },
      { label: 'Policy validation', value: 'Firewall policy verification, rule validation and configuration checks' },
      { label: 'Remote access', value: 'VPN connectivity and NAT rule validation, alongside senior engineers' },
      { label: 'Zone troubleshooting', value: 'Access issues diagnosed between internal, DMZ and external zones' },
      { label: 'Post-deployment', value: 'IP connectivity testing, device accessibility checks, fault identification' },
      { label: 'Disclosure', value: 'Client work — no site names, topology, addressing or rule contents are published here' },
    ],
    detailCaption: 'Capabilities exercised, stated without client-identifying detail',
  },
})
