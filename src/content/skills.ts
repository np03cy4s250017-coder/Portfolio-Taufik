import { skillGroupSchema, type SkillGroup } from '@/lib/schemas'

/**
 * Every entry traces to the CV or to code in a public repo. Nothing aspirational.
 *
 * Docker is deliberately absent. The spec listed it, but no Dockerfile or compose
 * file exists in any project and the CV does not mention it — the only matches in
 * the tree are inside node_modules and .venv. Spec §1 faults the old site for
 * advertising Docker among skills that "appear in no code"; keeping it here would
 * reproduce that exact failure.
 */
const raw: SkillGroup[] = [
  {
    label: 'Security',
    items: ['OWASP Top 10', 'FortiGate policy', 'Network segmentation', 'DNS / TLS', 'VPN & NAT', 'Incident response'],
  },
  {
    label: 'Infrastructure',
    items: ['TCP/IP', 'Nagios', 'Linux', 'Windows Server', 'Wi-Fi troubleshooting', 'FTTH / fibre basics'],
  },
  {
    label: 'Engineering',
    items: ['Python', 'FastAPI', 'JavaScript', 'React', 'Tailwind', 'SQL', 'SQLite', 'Git'],
  },
]

export const skillGroups: readonly SkillGroup[] = Object.freeze(raw.map((g) => skillGroupSchema.parse(g)))
