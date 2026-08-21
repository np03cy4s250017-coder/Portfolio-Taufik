# Portfolio Rebuild — Design Spec

**Date:** 2026-08-21
**Owner:** MD Taufik Reza
**Supersedes:** `github.com/np03cy4s250017-coder/Portfolio-Taufik` (static `index.html` + `CSS/style.css`)
**Target host:** Vercel Hobby (free tier)

---

## 1. Why rebuild

The existing site is two files and misrepresents its author. All three "Featured
Projects" are inventions — E-Commerce Platform, Task Management App, Analytics
Dashboard — illustrated with Unsplash stock photos and linked to `href="#"`. The
skills list advertises AWS, Docker, MongoDB, TypeScript and Next.js, none of
which appear in any of the author's code. The contact email is misspelled
(`@hmail.com`), the `tel:` link points at the placeholder `+15551234567`, the
social links resolve to bare `github.com` and `linkedin.com`, and the contact
form posts nowhere.

Meanwhile the author's real work — a domain security auditor mapped to the OWASP
Top 10, and a four-app delivery-platform monorepo — appears nowhere on the site.

The rebuild's single organising principle: **every claim on the site is checkable
against code that exists.**

---

## 2. Positioning

**An operator who builds tools.** Someone who keeps production systems running,
and builds the tooling that audits them.

The old site called its author "a dedicated cybersecurity student." He has not
been one since 2024. The CV establishes:

- **BSc (Hons) Cybersecurity, First Class Honours** — University of
  Wolverhampton, 2024
- **Application Support L1, Net Core Nepal Pvt. Ltd** — since 13 March 2025.
  24×7 production support, incident triage and escalation, root-cause analysis,
  SQL diagnostics against MySQL/PostgreSQL, Nagios monitoring
- **CCNA · CompTIA Network+ · ISC2 Certified in Cybersecurity**
- **IP-CCTV and Fortinet FortiGate deployment across government and hospital
  sites** — network segmentation in sensitive environments, firewall policy and
  rule validation, VPN/NAT verification, internal/DMZ/external access
  troubleshooting

That last item is the rarest thing here and appeared nowhere on the old site.
Segmenting hospital and government networks is not a credential most applicants
can claim, and it cannot be acquired from a tutorial.

The positioning is a synthesis rather than a narrowing. Most security candidates
have certifications *or* shipped code; fewer have both plus live incident
experience. The site's job is to make that combination legible in one screen.

Drishti is the bridge between the two halves — a working OWASP scanner with an
honest scoring model, built by someone who does the operational work it
describes. Its README supplies the site's thesis:

> *"an honest statement of what a remote scanner can and cannot see."*

That sentence earns the hero, because restraint about a tool's limits is the
credential that distinguishes an engineer from a résumé.

---

## 3. Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 16, App Router | First-class on Vercel; prerenders to static by default. Scaffolded on 16.3.1 — 16 was stable by build time; Turbopack is its default bundler, so the spec's `--no-turbopack` flag no longer exists. |
| Language | TypeScript, `strict` | Content is typed data; typos become build failures |
| Styling | Tailwind v4 | CSS-first config, no `tailwind.config.js` runtime cost |
| Components | shadcn/ui (Radix) | Accessible primitives, copied in — no runtime dependency |
| Icons | `lucide-react` | SVG, tree-shaken. **No emoji as icons** (the old site used 🔗 💼 🐦) |
| Forms | `react-hook-form` + `zod` | One schema shared by client and server |
| Email | Resend | 3,000/mo free, 100/day — far beyond a portfolio's needs |
| Motion | CSS + one IntersectionObserver hook | See §7 |
| Tests | Vitest + Playwright | See §9 |

### Rejected: GSAP

The design database recommends a GSAP stagger preset. Rejected: GSAP is ~60KB
gzipped to animate scroll reveals that CSS `@keyframes` plus a ~30-line
`useReveal` hook produce identically. A site whose thesis is engineering rigour
should not ship 60KB of animation library to fade in five cards.

### Rejected: static export (`output: 'export'`)

Would eliminate serverless functions entirely, but forecloses the contact route
handler. Standard Next build is still free on Hobby and every page except
`/api/contact` prerenders anyway, so the practical difference is zero.

---

## 4. Vercel Hobby constraints, and how each is handled

| Constraint | Handling |
|---|---|
| Image Optimization: 1,000 source images/month | Project screenshots use static imports — counted once at build, not per visitor. Under 10 images total. |
| Serverless function invocations | Exactly one function, `/api/contact`, invoked only on form submit. |
| No edge middleware / cron on Hobby | Neither is used. |
| Single region | Static pages are CDN-served globally; region is irrelevant. |
| 100GB bandwidth/month | Target page weight < 200KB. Not reachable. |
| Non-commercial use only | A personal portfolio qualifies. |

---

## 5. Architecture

```
portfolio/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx              root shell, fonts, JSON-LD Person schema
│  │  ├─ page.tsx                home
│  │  ├─ projects/[slug]/page.tsx  case studies (generateStaticParams)
│  │  ├─ api/contact/route.ts    the only serverless function
│  │  ├─ opengraph-image.tsx     generated at build via next/og
│  │  ├─ sitemap.ts · robots.ts
│  │  └─ globals.css             design tokens as CSS variables
│  ├─ content/
│  │  ├─ profile.ts              name, role, location, links
│  │  ├─ projects.ts             the five projects, typed
│  │  └─ skills.ts               only what appears in real code
│  ├─ components/
│  │  ├─ ui/                     shadcn primitives
│  │  └─ sections/               Hero · Work · Stack · About · Contact · Nav · Footer
│  └─ lib/
│     ├─ schemas.ts              Zod: Project, Skill, ContactMessage
│     ├─ rate-limit.ts           in-memory sliding window
│     └─ utils.ts                cn()
└─ docs/superpowers/specs/
```

### Content as data, not markup

Every project is an object in `src/content/projects.ts`, parsed through a Zod
schema at module load. Adding a project is one object; the grid, the case-study
routes, the sitemap and the JSON-LD all derive from it. This is what the old site
got most wrong — three hand-copied `<div class="project-card">` blocks that
drifted from reality the moment they were written.

Files stay under 400 lines and each section component owns one section. No file
approaches the 800-line ceiling.

### Immutability

Content modules export frozen data. Transformations (filtering by tag, sorting by
year) return new arrays; nothing mutates a source array in place.

---

## 6. Visual design — "Security Console"

### Palette

All ratios below are computed against the `#0F172A` background and verified, not
assumed.

| Token | Hex | Role | Contrast on bg |
|---|---|---|---|
| `--background` | `#0F172A` | page ground | — |
| `--foreground` | `#F8FAFC` | primary text | **17.4:1** (AAA) |
| `--muted-foreground` | `#94A3B8` | secondary text | **7.1:1** (AAA) |
| `--accent` | `#22C55E` | pass/run/CTA | **8.0:1** (AAA) |
| `--border-interactive` | `#64748B` | input + control borders | **3.8:1** (passes 3:1 UI) |
| `--border` | `#1E293B` | decorative dividers | decorative only |
| `--destructive` | `#EF4444` | form errors | — |

Note `#475569`, the database's suggested border, measures **2.4:1** — below the
3:1 required for interactive component boundaries. It is used only for
decoration; inputs and buttons use `#64748B`.

Background is `#0F172A`, never `#000000` — pure black smears on OLED and crushes
the elevation hierarchy.

### Typography

- **Inter** (variable, via `next/font`) — prose, headings, UI
- **JetBrains Mono** (variable) — every piece of *data*: tech tags, grades,
  section indices, metrics, timestamps, the hero's role line

The split is semantic, not decorative: mono means "this is a value." Long-form
prose stays in Inter because a whole page of monospace is tiring to read — which
is why the full Terminal Brutalist direction was set aside.

### The grade badge motif

Drishti scores domains A+ through F. The site borrows its own subject's visual
language: each project card carries a mono grade chip. This ties the design to
the work rather than to a template, which is the difference between a portfolio
that looks designed and one that looks purchased.

Grades reflect project substance (Drishti A+, Hyperlocal A, the three vanilla-JS
apps B-range) and are labelled as such — a self-assessment of scope, never
presented as an external rating.

### Layout

Bento-ish asymmetric grid: Drishti occupies a double-width hero card, Hyperlocal
a tall card, the three smaller apps a uniform row. Deliberately not a 3×N grid of
identical rectangles — equal visual weight would imply equal significance, and
these projects are not equal.

Breakpoints tested: 375 / 768 / 1024 / 1440.

---

## 7. Motion

`useReveal` — one hook, IntersectionObserver, adds a class when an element
crosses the viewport. CSS handles the rest: `opacity` and `translateY` only
(both compositor-friendly; never `width`/`height`, which force layout).

- Duration 200–400ms, `cubic-bezier(0.16, 1, 0.3, 1)`
- Stagger 60ms per grid child via `--stagger-index`
- Hover transitions 150–250ms
- **`prefers-reduced-motion: reduce` disables all of it** — content appears at
  final state immediately, never hidden

Reserved space on every card prevents layout shift; CLS target < 0.1.

---

## 8. Contact flow

```
form (react-hook-form + zod, inline errors)
  → POST /api/contact
      ├─ honeypot field non-empty?     → 200 OK, silently discard
      ├─ rate limit (5 / 10min / IP)?  → 429
      ├─ Zod parse fails?              → 400 + field errors
      └─ Resend send                   → 200 | 502
  → success or error state announced via aria-live
```

**Security properties:**

- The same Zod schema validates on both sides; the client copy is UX, the server
  copy is the trust boundary. Server never trusts client-side validation.
- `RESEND_API_KEY` and `CONTACT_TO_EMAIL` come from environment variables only.
  `.env.local` is gitignored; `.env.example` documents the names with no values.
- Message body is sent as plain text, not interpolated into HTML — no injection
  into the email that lands in the author's inbox.
- Error responses are generic. A failed Resend call returns "Could not send
  message" — never the upstream error, which can leak key state or account
  details.
- Honeypot returns **200, not 403** — telling a bot it was detected teaches it to
  adapt.
- Rate limiting is in-memory, per-instance. On Hobby this is best-effort, not a
  guarantee, since instances are ephemeral. Documented as such rather than
  overclaimed; the honeypot is the primary spam defence.

**Privacy:** email and social links only. The phone number that appears on the
current site is dropped — a number on an indexed page is scraped within days and
is a SIM-swap vector, and recruiters email first regardless.

---

## 9. Testing

The global 80% coverage target assumes application logic. This is a
mostly-static marketing site; chasing 80% here would mean asserting that
headings render. Coverage effort goes where breakage is possible:

**Vitest (unit):**
- `schemas.ts` — every content schema accepts valid and rejects malformed input
- `projects.ts` — all entries parse; slugs unique; every non-null repo URL well-formed
- `rate-limit.ts` — allows under limit, blocks over, expires after window

**Vitest (integration):** `/api/contact` — valid send, malformed payload → 400,
honeypot → 200 without sending, over-limit → 429, Resend failure → 502 with a
generic message. Resend is mocked; no test sends real email.

**Playwright (E2E):** one critical flow — load home, navigate to a case study,
return, submit the contact form (Resend intercepted), assert success state.

Written before the implementation they cover, per TDD.

---

## 10. SEO & metadata

- `metadata` export per route; no manual `<head>`
- OG image generated at build with `next/og` — no external image service
- `sitemap.ts` and `robots.ts` derived from the same content modules
- JSON-LD `Person` schema in the root layout
- Semantic landmarks, one `<h1>` per page, skip-to-content link

---

## 11. Content inventory

| Project | Presentation | Link |
|---|---|---|
| **Drishti** | Hero card + full case study: 7-channel scoring table, OWASP mapping, active-check ownership gate, the "what a scanner cannot see" thesis | [Drishti](https://github.com/np03cy4s250017-coder/Drishti) ✓ **pushed 2026-08-21** |
| **CCTV + FortiGate deployment** | First-class card + case study. Professional engagement, no repo — see disclosure rules below | None (client work) |
| **DevJobs** | Card | `Job-Finder-App` ✓ |
| **FinTrack** | Card | `Expense-Tracker` ✓ |
| **NovaShop** | Card | `Tech-Store` ✓ |

`Task-Manager` and `Tasks-Manager` are the same NovaShop e-commerce app under a
misleading folder name. It appears **once**, named for what it is.

### Excluded: Hyperlocal Kathmandu

Cut after audit. Its README advertises a FastAPI + PostGIS backend and four
Next.js apps. The folder contains **no `backend/` directory at all**, two app
folders rather than four, and of those two only `apps/admin` has source (~7KB:
a login page, a shops list, three lib files). `apps/customer` is config files
with no `src/`.

Featuring it would reproduce the exact failure this rebuild exists to correct,
one level deeper: a recruiter clicking a card that promises a backend, finding
an empty directory, and reasonably discounting every other claim on the site —
including Drishti, which delivers everything it says.

It is also **not pushed to GitHub**. A public repo whose README describes
software that was never written is worse than no repo.

### The CCTV/FortiGate card — disclosure rules

This describes a professional engagement at government and hospital sites, so
the card and case study state *capabilities exercised*, never client-identifying
detail. Permitted: technology (FortiGate, IP-CCTV), the class of work (network
segmentation, policy validation, VPN/NAT verification, DMZ troubleshooting), and
the sensitivity of the environment in general terms. Excluded: site names,
locations, topology specifics, IP ranges, rule contents, and anything that would
assist someone attacking those networks.

### Skills — claimed only where evidence exists

**Security & infrastructure:** OWASP Top 10 · FortiGate firewall policy ·
network segmentation · DNS/TLS · VPN/NAT · TCP/IP · Nagios monitoring ·
incident response & RCA

**Engineering:** Python · FastAPI · JavaScript · React · Tailwind · SQL
(MySQL/PostgreSQL) · SQLite · Docker · Git · Linux/Windows server administration

**Certifications:** CCNA · CompTIA Network+ · ISC2 Certified in Cybersecurity

Removed from the old site's list: AWS, MongoDB, Node.js, and
TypeScript-as-expertise — none appear in any code or on the CV. TypeScript joins
the list only once this portfolio ships in it, at which point the site itself is
the evidence for the claim.

---

## 12. Inputs

**Resolved:**

- GitHub — `https://github.com/np03cy4s250017-coder`
- LinkedIn — `https://www.linkedin.com/in/md-taufik-reza-119240349`
- Email — `rezamdtaufik442@gmail.com` (the old site's `@hmail.com` was a typo)

- Résumé — `MD_Taufik_Reza_CV.pdf`, copied to `public/` and wired to a download
  button. The `.docx` is not published.
- Drishti repo — pushed 2026-08-21, public, 95 files, verified free of `.env`,
  `drishti.db`, and `.venv`.

**Outstanding, none blocking:**

1. **Resend API key** — set as a Vercel environment variable, never committed.
   The site builds and deploys without it; the form renders and returns a
   configured-error state rather than failing at build time.

### Secret hygiene — findings from the pre-push audit

Recorded because the same mistakes recur:

- Drishti's `.gitignore` covered `node_modules/` but not `.venv/`,
  `__pycache__/`, or `*.db`. A naive `git add -A` staged the entire Python
  virtualenv **and `backend/drishti.db`** — a live SQLite file holding user
  accounts, password hashes, verified domain-ownership records, and scan history
  for every domain audited. Ignore rules were extended before the first commit;
  the database never entered git history.
- Hyperlocal had **no `.gitignore` at all**. One was written covering `.env`,
  `firebase-service-account.json`, virtualenvs and build output — even though
  the repo is not being pushed, because the next `git init` there would
  otherwise repeat the problem.
- Both projects' `.env.example` files were checked and are clean. Drishti's is
  genuinely good documentation and is worth keeping public.
- The Resend API key was pasted into a chat transcript twice. It must be rotated
  once more at deploy time and entered directly into Vercel, scoped to
  **sending access only** — never full access, which can mint further keys.

### Project screenshots

Cards and case studies need real visuals — the old site's use of Unsplash stock
photography for imaginary projects is precisely the failure being corrected.

Screenshots are captured from the running applications, not sourced externally.
The three vanilla-JS apps (DevJobs, FinTrack, NovaShop) open directly from their
`index.html`. Drishti and Hyperlocal need their dev servers up; Drishti also
ships a `DESIGN-PREVIEW.html` usable as a fallback.

If a project cannot be captured, its card falls back to a typographic treatment —
grade chip, stack tags, and title on the surface colour. No stock photography
under any circumstance.

---

## 13. Deployment

**Repository:** the existing `np03cy4s250017-coder/Portfolio-Taufik`. The Next.js
site replaces the contents of `main`; Vercel builds from that branch.

### The GitHub Pages problem

The CV in circulation directs recruiters to
`np03cy4s250017-coder.github.io/Portfolio-Taufik`, which is **live and returning
200 today**. Replacing `main` with a Next.js app breaks that Pages build, and
every CV already sent points at a dead link.

**Resolution:** a `gh-pages` branch carrying a single static `index.html` — a
`<meta http-equiv="refresh">` plus a `<link rel="canonical">` and a visible
fallback anchor for anyone whose browser blocks the refresh. GitHub Pages is
pointed at that branch. The old URL keeps resolving and forwards to the Vercel
site, so CVs already in circulation stay correct.

The redirect page carries no analytics, no scripts, and no dependencies. It
exists to survive unattended.

### Environment variables (set in Vercel, never committed)

| Name | Purpose | Absent behaviour |
|---|---|---|
| `RESEND_API_KEY` | Contact form delivery | Form renders; submit returns a configured-error state |
| `CONTACT_TO_EMAIL` | Destination inbox | Falls back to the public email in `profile.ts` |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata, OG tags, sitemap | Falls back to the Vercel deployment URL |

`.env.example` documents all three with empty values. `.env.local` is gitignored.

---

## 14. Out of scope

A blog, a CMS, i18n, analytics, dark/light toggle (the design is dark-committed),
and any project not currently in `D:\My-Projects`.
