# Photographer Portfolio

A production-ready, database-driven portfolio for a single photographer: a monochrome,
glassmorphic public site and a complete single-admin CMS. Every name, bio, contact detail,
service, photograph and page section is editable from the dashboard — there is no hardcoded
studio content in the UI.

Built with Next.js 14 (App Router), MongoDB Atlas, Cloudinary, NextAuth, Tailwind CSS,
React Hook Form + Zod, and Framer Motion.

---

## Quick start

```bash
npm install
cp .env.example .env.local     # fill in MONGODB_URI, NEXTAUTH_SECRET, Cloudinary keys
npm run seed                   # creates the admin user + demo services
npm run dev                    # http://localhost:3000
```

Default admin sign-in (change it before deploying anything real):

| | |
|---|---|
| URL | `http://localhost:3000/admin/login` |
| Username | `photographer` |
| Password | `adminphotographer@123` |

Set `SEED_ADMIN_PASSWORD` before seeding to override it, then change it again from
**Dashboard → Account** after the first sign-in.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint, zero warnings tolerated |
| `npm run check` | typecheck + lint |
| `npm run seed` | Idempotent seed (config, services, admin user) |

---

## Configuration

Copy `.env.example` to `.env.local`. Only `MONGODB_URI` is mandatory in production — the app
throws at startup rather than serving an empty site. Everything else degrades gracefully:

| Variable | Required for | Notes |
|---|---|---|
| `MONGODB_URI` | everything | Atlas connection string |
| `NEXTAUTH_SECRET` | auth | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | auth | site origin |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | image uploads | the key and cloud name are public by design (signed direct uploads) |
| `RESEND_API_KEY` / `RESEND_FROM` | contact-form email | without it, inquiries are still stored and shown in the inbox |
| `NEXT_PUBLIC_SITE_URL` | SEO | used by sitemap, robots and OG tags |
| `SEED_ADMIN_*` | seeding | see above |

### Atlas and Cloudinary gotchas

- **Atlas network access** — serverless functions connect from changing IP ranges, so add
  `0.0.0.0/0` (or your platform's egress list) to the IP allow-list.
- **Cloudinary transforms** — the custom loader in `next.config.mjs` rewrites Cloudinary URLs
  into responsive `next/image` sources. No other configuration is needed.

---

## Architecture

```
src/
├── app/
│   ├── (site)/              public pages: home, gallery, services, about, contact
│   ├── admin/
│   │   ├── login/           credentials sign-in
│   │   └── (dashboard)/     settings · contact · social · services · gallery
│   │                        · inquiries · appearance · account
│   └── api/
│       ├── config|services|gallery|contact   public REST
│       ├── auth/[...nextauth]                session handling
│       └── admin/                            all mutations (session-guarded)
├── components/
│   ├── ui/                  Button, Field, SmartImage, Reveal, ZigzagRow, icons
│   ├── home/ site/ layout/  public sections
│   ├── admin/               AdminUI, MediaPicker, sidebar, toasts
│   └── zip/                 the network-aware ZipLoader
├── lib/                     data access, auth, db, cloudinary, network, validation
├── models/                  Mongoose schemas
└── seed.ts
```

**Data flow.** Public pages are server components that read MongoDB directly through
`lib/data.ts` (cached with `unstable_cache`, keyed by tag). The parallel `/api/*` routes
return the same serialised shapes for external consumers. Every admin mutation calls
`revalidateSite()`, which purges the cache tags and revalidates the public routes.

**Auth.** NextAuth credentials provider, JWT sessions, `role: "admin"` checked in the edge
middleware *and* again in `requireAdminPage()` / `requireAdmin()`. Brute-force protection
counts failures per IP + username in a MongoDB `LoginAttempt` document with a TTL index, so
it survives serverless cold starts (6 failures → exponential cool-off).

**Uploads.** Files go browser → Cloudinary directly, authorised by a short-lived signature
from `/api/admin/upload/signature`. Because the bytes never pass through Next.js, the
ZipLoader during an upload is driven by genuine `xhr.upload.onprogress` events.

**ZipLoader.** `components/zip/` renders a case unzipping along its zipper: the pull slides
down the teeth, the halves swing apart, and photographs fan out of the opening case. Progress
is never faked — indeterminate work uses an exponential curve scaled by the network profile
(`navigator.connection` where available, measured task durations and frame cadence
otherwise) that converges on 92% and only reaches 100% when the real promise resolves.

---

## Dashboard

| Page | Controls |
|---|---|
| **Settings** | name, tagline, bio, logo, profile image, stat row, skills, experience timeline |
| **Contact** | email, phone, WhatsApp, address, map embed, closing CTA |
| **Social & Nav** | social links (10 platforms), navigation items |
| **Services** | full CRUD, icon picker, image per service, ↑/↓ reordering, deactivate |
| **Gallery** | multi-file drag-and-drop upload, title/description/alt/category, pin to top, drag or ↑/↓ reorder, delete (also destroys the Cloudinary asset) |
| **Inquiries** | inbox with unread filter, read/unread, reply, delete |
| **Appearance** | hero image or looping video, overlay strength, alignment, per-section visibility |
| **Account** | username, email, password, security notes |

All saves run through the ZipLoader with toast feedback. Sections hidden in **Appearance**
keep their content, so re-enabling one is instant.

---

## Accessibility

- Visible monochrome focus rings on every interactive element; no colour-only state changes.
- Gallery lightbox traps focus, restores it on close, supports arrow keys and `Esc`, and is
  linked from the URL (`?photo=<id>`) so a frame can be shared directly.
- `prefers-reduced-motion` disables the loader's jitter and the scroll reveals.
- Alt text is required for gallery images (falls back to the title) and editable everywhere else.
- All form fields have labels; validation errors use `role="alert"`.

Breakpoints verified at 375 / 768 / 1024 / 1440px.

---

## Deployment (Vercel)

1. Push to a Git repository and import it into Vercel.
2. Add every variable from `.env.example` to the project's Environment Variables.
3. Allow the deployment's egress in Atlas Network Access.
4. `npm run build` needs `MONGODB_URI` set — the production build intentionally fails without it.
5. Run `npm run seed` once from your machine (or a one-off Vercel command) to create the admin user.

Other Node hosts work equally well — the app is a standard Next.js project with no
platform-specific APIs.

---

## Notes and trade-offs

See [DECISIONS.md](./DECISIONS.md) for the reasoning behind the stack, the assumptions that
were made, and the known limitations.
