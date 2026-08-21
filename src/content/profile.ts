export const profile = Object.freeze({
  name: 'MD Taufik Reza',
  initials: 'MTR',
  role: 'Security & Infrastructure Engineer',
  location: 'Kathmandu, Nepal',
  email: 'rezamdtaufik442@gmail.com',
  github: 'https://github.com/np03cy4s250017-coder',
  linkedin: 'https://www.linkedin.com/in/md-taufik-reza-119240349',
  resume: '/MD_Taufik_Reza_CV.pdf',
  /** The site's thesis, from Drishti's own README. */
  thesis: 'I build tools that state honestly what they cannot see.',
  summary:
    'I keep production systems running and build the tooling that audits them. Application support by day — incident triage, root-cause analysis, SQL diagnostics, Nagios monitoring — and security engineering the rest of the time.',
  experience: Object.freeze([
    {
      role: 'Application Support — L1',
      org: 'Net Core Nepal Pvt. Ltd',
      start: 'March 2025',
      /** Machine-readable form for the <time> element rendering `start`. */
      startISO: '2025-03',
      end: 'Present',
      points: Object.freeze([
        '24×7 support for web-based production environments, handling user and system incidents end to end.',
        'Incident troubleshooting and escalation with supporting logs and root-cause analysis.',
        'SQL diagnostics against MySQL and PostgreSQL for data validation, correction and reporting.',
        'Nagios monitoring — managing monitored elements and handling alerts.',
        'Post-release validation testing and support for system updates and deployments.',
      ]),
    },
  ]),
  education: Object.freeze({
    degree: 'BSc (Hons) Cybersecurity',
    institution: 'University of Wolverhampton, UK',
    year: 2024,
    result: 'First Class Honours',
  }),
  certifications: Object.freeze([
    { name: 'Cisco Certified Network Associate (CCNA)', issuer: 'Cisco' },
    { name: 'Network+', issuer: 'CompTIA' },
    { name: 'Certified in Cybersecurity (CC)', issuer: 'ISC2' },
  ]),
})
