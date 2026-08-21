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

Security-first engineer. Drishti leads; the web applications are supporting
evidence that the author ships working software, not the headline.

This is a deliberate narrowing. A "full-stack developer" framing would compete
against a much larger field on breadth the author does not yet have. A security
framing competes on the one thing he demonstrably does have: a working OWASP
scanner with an honest scoring model.

The strongest line in the entire corpus is from Drishti's own README —
*"an honest statement of what a remote scanner can and cannot see."* That
sentence is the site's thesis, and it earns the hero.

---

## 3. Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 15, App Router | First-class on Vercel; prerenders to static by default |
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
| **Drishti** | Hero card + full case study: 7-channel scoring table, OWASP mapping, active-check ownership gate, the "what a scanner cannot see" thesis | Repo — **needs pushing** |
| **Hyperlocal Kathmandu** | Tall card + case study: 4-app monorepo, PostGIS geospatial, Firebase realtime | Repo — **needs pushing** |
| **DevJobs** | Card | `Job-Finder-App` ✓ |
| **FinTrack** | Card | `Expense-Tracker` ✓ |
| **NovaShop** | Card | `Tech-Store` ✓ |

`Task-Manager` and `Tasks-Manager` are the same NovaShop e-commerce app under a
misleading folder name. It appears **once**, named for what it is.

### Skills — claimed only where code exists

Python · FastAPI · JavaScript · React · Tailwind · SQLite · PostgreSQL/PostGIS ·
Docker · DNS/TLS · OWASP Top 10 · Git

Removed from the old list: AWS, MongoDB, Node.js, TypeScript-as-expertise, SQL
generally. TypeScript returns to the list only once this portfolio itself ships
in it — at which point the claim is backed by the site making it.

---

## 12. Open inputs

1. **LinkedIn URL** — required for the contact section. Blocking only that link.
2. **Resend API key** — needed for the contact form to function in production.
   Site builds and deploys without it; the form returns a configured-error state.
3. **Drishti + Hyperlocal repos** — must be pushed for their Code links to
   resolve. Case-study pages work regardless; the links are additive.
4. **Résumé PDF** — optional; a download button is wired if one is supplied.

None of these block the build. Each degrades to a defined state.

---

## 13. Out of scope

A blog, a CMS, i18n, analytics, dark/light toggle (the design is dark-committed),
and any project not currently in `D:\My-Projects`.
