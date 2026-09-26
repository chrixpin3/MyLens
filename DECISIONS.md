# Decisions & Assumptions

Every choice below was made under the constraints of the brief (fixed stack, monochrome only,
reusable loader, no interactive questions). This file records what was decided, what was
assumed, and what is still a trade-off.

---

## Stack

| Decision | Why |
|---|---|
| Next.js 14 App Router, `src/` layout | Required. Server components + route handlers give the public site and the API the same data layer. |
| React 18 (not 19) | `next@14.2.35` pins React 18. Upgrading both was out of scope and would risk the App Router behaviours this project depends on. |
| Tailwind 3.4 with CSS custom properties | Design tokens (greyscale ramp, glass surfaces, fluid type scale) live in `globals.css` and are consumed as Tailwind values. Greyscale-only is enforced by the palette itself. |
| Mongoose 9 + MongoDB Atlas | The brief fixed MongoDB. Mongoose gives schema validation and indexes; a singleton `SiteConfig` document keeps "one site" a database guarantee rather than a convention. |
| NextAuth v4 credentials + JWT | Single admin, no OAuth requirement. JWT avoids database session lookups on every server component. |
| Cloudinary with a custom `next/image` loader | Lets `next/image` do responsive `srcset` work against Cloudinary's URL-based transformation API, so no duplicate assets and no Next image optimiser cost. |
| React Hook Form + Zod | One schema per form, shared verbatim with the API route, so client and server can never disagree about validation. |
| Framer Motion | Required for the loader animation and the scroll reveals. `LazyMotion`/`useReducedMotion` keep the cost down. |
| `unstable_cache` (Next 14) | Tag-based ISR in Next 14. `revalidateTag(tag)` is the only mechanism available; the calls are isolated in `revalidateSite()` so migrating to `unstable_cacheTag`/`revalidateTag(tag, 'max')` in Next 15 is a one-file change. |

---

## Loader

**The ZipLoader never shows fake progress.**

- **Known work** (uploads): real `xhr.upload.onprogress` events. The image bytes go browser →
  Cloudinary, never through the Next.js server, so the bytes counted are the bytes sent.
- **Unknown work** (route transitions, admin saves): progress approaches 92% asymptotically and
  only reaches 100% when the awaited promise resolves. The curve's steepness comes from the
  network profile, so a slow connection visibly takes longer instead of lying about being close.
- **Network detection**: `navigator.connection` (Chromium) when present; otherwise measured
  `performance.now()` task durations plus sampled frame cadence. `isNetworkAware={false}` forces
  the measured-only path.
- **De-escalation** is honest too: a slow tier does not just crawl, it says
  "Working on a slow connection…" after 4.5s and "Still working… slow connection" after 9s.

**Assumption**: the visual metaphor (zipper opening, photographs fanning out) was designed from
the brief's "unzipping" wording. It is the one place the design is our own rather than specified.

---

## Data model

- `SiteConfig` is a **singleton** (`key: "default"`, unique, immutable). Everything on the
  public site that is not a service, a gallery image or an inquiry lives here: identity, bio,
  contact details, social links, navigation, stat row, skills, experience timeline, hero
  settings, section visibility and the closing CTA.
- `DEFAULT_CONFIG` in `lib/defaults.ts` is generic placeholder copy used as a **fallback only**
  (fresh clone before seeding, or a database blip). It is never written to the database by the
  app, and every value in it is editable from the dashboard.
- `Inquiry` stores `notified` so a Resend failure is visible without losing the message.
- `LoginAttempt` has a TTL index — the counter cleans itself up.

### Additions beyond the brief

The brief listed site configuration, services, gallery images and inquiries. These were added
because the brief also demanded that nav, socials, hero appearance and section visibility be
admin-editable:

- `stats`, `skills`, `experience`, `coverageArea` — the About page and hero stat row.
- `nav`, `social` — header/footer links and social icons.
- `hero` (media type, image/video, poster, overlay strength, alignment) and `sections`
  (per-section visibility) — for "Appearance".
- `cta` — the closing call-to-action band, editable with the contact details.
- `user.email`, `user.lastLoginAt`, `user.failedAttempts`, `user.lockedUntil` — needed for
  "Account" and for the login lockout to survive restarts.
- `Inquiry.phone`, `Inquiry.service` — the contact form asks for a phone number and which
  service the visitor is interested in; the inbox displays both.

**Assumption**: "every service" means the service list is DB-driven, which it is. A small set
of static editorial labels (section eyebrows, "See the work", the security notes in Account)
remains hardcoded UI copy — they are chrome, not studio content, and the schema was not
widened to carry them.

---

## Auth and security

- Middleware (`src/middleware.ts`) blocks unauthenticated `/admin/*` at the edge; every admin
  page additionally calls `requireAdminPage()` and every mutation calls `requireAdmin()`. Two
  independent locks, because a misconfigured matcher is a common way to expose an admin panel.
- Default credentials are public knowledge by definition, so: seed with
  `SEED_ADMIN_PASSWORD` for anything real, and change the password after the first sign-in. The
  Account page says this where it matters.
- Rate limiting: 6 failures per IP + username, then an exponential cool-off, persisted in
  MongoDB. In-memory only would reset on every serverless cold start.
- Passwords are bcrypt-hashed (cost 12) and re-hashed on every change. Plaintext is never
  stored or logged.
- `api_key` and `cloud_name` are exposed to the browser on purpose — that is what makes signed
  direct uploads possible. The API *secret* never leaves the server.

**Trade-off**: the request IP is captured in a module-level variable set by the NextAuth route
handler, because the credentials `authorize()` callback receives no request object. This is
correct for a single-instance Node server and for most serverless platforms, but is not
reliable across aggressively parallel instances. Swapping in a platform-provided header
(`x-forwarded-for`, `x-vercel-forwarded-for`) is a small, isolated change in `lib/auth.ts`.

---

## Public data access

Server components read MongoDB **directly** rather than fetching `/api/*` over HTTP. One less
network hop, no self-request latency, no serialisation round trip. The public REST routes still
exist and return the same shapes for external consumers, so both paths are covered.

**Trade-off**: `getServices`/`getGalleryImages` accept an `includeInactive` flag and
`unstable_cache` key parts include it, so the inactive list never contaminates the public cache.
The admin pages bypass the cache entirely and read the models directly.

---

## Accessibility

- Greyscale-only means state can never be communicated by hue alone: pins, unread dots, focus
  rings and toggles all have a shape or text label as well.
- The lightbox is a real dialog: focus moves in on open, is trapped, and returns to the trigger
  on close. `Esc` and arrow keys work, and the open frame is reflected in `?photo=<id>` so a
  specific image can be linked.
- `prefers-reduced-motion` disables the loader jitter and the scroll reveals.
- Gallery alt text is required (falling back to the title), and editable per image.

---

## Known limitations

1. **No automated tests.** The verification here is `npm run typecheck`, `npm run lint` and
   `npm run build`, plus manual checks. `MONGODB_URI`, the Cloudinary keys and `RESEND_API_KEY`
   were not available in this environment, so the live upload path, the email path and the seed
   have not been executed end to end.
2. **Residual npm advisories.** `npm audit` reports 5 (4 high, 1 critical), all inside the
   `next@14.2.35` dependency tree and its `postcss@8.4.31` / `glob@10` transitives:

   | Advisory chain | Fix offered by npm | Why it was not applied |
   |---|---|---|
   | Next.js (many: RSC DoS, cache poisoning, image-optimizer RCE, middleware bypass) | `next@16.3.6` | Breaking major upgrade. The brief fixed the stack at Next 14 + React 18; Next 16 requires React 19. |
   | `postcss@8.4.31` (XSS in stringify, `sourceMappingURL` file read) | `postcss@8.5.28` | The top-level devDependency **was** bumped to 8.5.28, but Next pins its own copy. An `overrides.next.postcss` entry was tried and npm declined to apply it (the tree reported `invalid`). Next 14 uses the compiled PostCSS bundled in `next/dist/compiled` at build time, so the advisory is build-tooling-only here. |
   | `glob@10.4.x` (CLI `--cmd` injection) | `eslint-config-next@16` | Dev-only, CLI-only, not reachable from the running app. |

   Before deploying, run `npm audit` and decide whether the Next 14 → 16 upgrade (plus React 19)
   is worth the migration. This is a deliberate, documented trade-off of the fixed stack, not an
   oversight. npm 11 also declined to run the `esbuild` / `unrs-resolver` postinstall scripts;
   the build and the seed script both run correctly without them.
3. **Single admin, no roles.** `role` is a single `"admin"` enum. Multi-user support would need
   a real role model and an invitation flow.
4. **Cloudinary assets are the source of truth for uploads.** Deleting a gallery record destroys
   the Cloudinary asset; the reverse (deleting the asset in the Cloudinary UI) leaves an
   orphaned record with a broken image.
5. **Section visibility, not section reordering.** Sections can be shown or hidden but not
   dragged into a new order — the brief asked for appearance control, not layout freedom.
