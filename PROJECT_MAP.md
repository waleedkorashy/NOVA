# NOVA — Project Map

Companion to [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) and [`AGENTS.md`](./AGENTS.md).

**Legend** — `CURRENT` = exists in the repo now · `PLANNED` = designed, not yet built ·
`DECISION` = awaiting sign-off · `APPROVED` = settled, executing per plan.

**Status: M0, M1 and M2 COMPLETE.** D1 executed: `@angular/router` is **uninstalled**, `app.routes.ts`
is deleted, and navigation is native in-page anchors. The app renders a real shell — skip link,
sticky `site-header` with a signal-driven panel, `<main id="main">`, minimal `site-footer` — and no
longer displays the Angular welcome splash. `<app-hero>` sits first inside `<main>` and owns the
page's single `h1`, a responsive priority image, and the two hero CTAs.

M2 ships the real photograph — Claudio Schwarz, Unsplash licence, provenance in
`src/assets/images/ATTRIBUTION.md` — delivered at 960 and 1800 wide and served by a component-scoped
`IMAGE_LOADER`. The 1800px variant was re-encoded in place to **245,804 B**, inside the ≤ 250 KB
per-image budget, with the layout and loader untouched. Verified in Chrome at all six required
widths: `prettier --check` clean, `ng build` clean, Vitest 27/27, full M1 regression green,
`hero.scss` 884 B against the 4 kB budget.

> M2 originally set the Hero frame to 4:5 portrait against this 3:2 landscape photograph, so
> `object-fit: cover` cropped ~47% of its width. **That was changed in M4** — the frame is now the
> photograph's own 3:2, bounded by `--hero-media-max`, with nothing cropped and the image held inside
> the page gutters. The M2 milestone table below still records the 4:5 behaviour as it was at M2.

**M3 (Featured Collection) is complete.** Six products, real photography, mounted and verified.

**M4 (Brand Values + Craft & Process) is complete.** Three numbered principles on the alternating
surface, then a full-width inverted band carrying a three-step making narrative. Verified.

**M5 (Editorial / Journal) is complete.** `<app-editorial>` now owns `#journal` and the M1
placeholder is gone, so the Hero's `View Lookbook` CTA — which has pointed at that fragment since M2
— lands on real content. One large 4:5 frame, an offset caption, and a bottom-aligned pull-quote
column. Deliberately the page's one non-grid section.

**M6 (Product Showcase + Brand Story) is complete.** `<app-product-showcase>` presents one dominant
piece from the existing catalogue with a sticky frame and a scrolling detail column on desktop, and
demotes the other five to a ruled text index. `<app-brand-story>` now owns `#about`, so the last M1
placeholder but `#contact` is gone and all three landed nav anchors resolve to real content.

Neither new section declares a nav anchor of its own beyond that: plan §4.4 fixes the approved set at
`#collection` / `#journal` / `#about` / `#contact`, and Product Showcase is not one of them, so it
holds only its `h2` label.

> **Two deliberate deviations from plan §7, both documented rather than worked around.**
>
> 1. **`product-card` is not reused in the Showcase.** Plan §7 lists the card as having two reuse
>    sites. The card is image-over-text and vertical; a sticky showcase needs the image in one column
>    with the text in another. Adding a `layout` input to force the fit would spread one primitive
>    across two compositions, so the Showcase composes the product directly from the `Product`
>    contract instead. Only the plan's aspirational second site is unmet — the component still exists
>    and is still used by the Collection.
> 2. **Brand Story has no image.** Plan §7 sketches a portrait there. Unsplash could not be reached
>    to verify a source (`unsplash.com` 401, `source.unsplash.com` 503, the CDN path unreachable), and
>    every approved asset is already displayed elsewhere on the page — Hero, six Collection cards,
>    Editorial — so reusing one would duplicate a picture the user has just seen and would need alt
>    text nobody can check without viewing the file. No image was added and
>    `src/assets/images/ATTRIBUTION.md` is unchanged. The section is built from typography instead,
>    which is also what keeps it from reading as a second Editorial.

---

## [TECH_STACK]

### Runtime

| Layer       | Technology                                       | Version | Status                                                                        |
| ----------- | ------------------------------------------------ | ------- | ----------------------------------------------------------------------------- |
| Framework   | Angular (standalone, zoneless, no SSR)           | 22.2.1  | `CURRENT`                                                                     |
| Build       | `@angular/build:application` (esbuild)           | 22.2.0  | `CURRENT`                                                                     |
| CLI         | `@angular/cli` + `@schematics/angular`           | 22.2.0  | `CURRENT`                                                                     |
| Language    | TypeScript (`strict` implicit via TS 6 defaults) | 6.0.3   | `CURRENT`                                                                     |
| Styles      | SCSS, `printWidth` 100, single quotes            | —       | `CURRENT`                                                                     |
| Routing     | **none** — native in-page anchors (D1)           | —       | `REMOVED in M1`, verified absent from `package.json`, the lockfile and `src/` |
| Reactive    | `rxjs`                                           | ~7.8.0  | `CURRENT`                                                                     |
| Forms       | `@angular/forms` (Signal Forms available)        | ^22.1.0 | `CURRENT`, unused                                                             |
| Test runner | Vitest via `@angular/build:unit-test`            | 4.1.11  | `CURRENT`                                                                     |
| Test DOM    | jsdom                                            | 28.0.0  | `CURRENT`                                                                     |
| Format      | Prettier (only style tool — no ESLint)           | 3.8.1   | `CURRENT`                                                                     |
| Package mgr | npm (`packageManager: npm@11.19.0`)              | 11.19.0 | `CURRENT`                                                                     |
| Node        | 24.x local and on Cloudflare Pages               | 24.20.0 | `CURRENT`                                                                     |

### Deploy

| Setting          | Value                                                                                      | Status    |
| ---------------- | ------------------------------------------------------------------------------------------ | --------- |
| Host             | Cloudflare Pages (Git integration, no wrangler config)                                     | `CURRENT` |
| Build command    | `npm run build`                                                                            | `CURRENT` |
| Output dir       | `dist/nova/browser` (**not** `dist/nova`)                                                  | `CURRENT` |
| Framework preset | None                                                                                       | `CURRENT` |
| SPA fallback     | `public/_redirects` → `/* /index.html 200`                                                 | `CURRENT` |
| Headers          | `public/_headers` — immutable hashed assets, no-cache `index.html`, nosniff/frame/referrer | `CURRENT` |
| Limits           | 20,000 files · 25 MiB per file                                                             | `CURRENT` |
| CI               | none                                                                                       | `PENDING` |

### Planned additions

| Concern          | Choice                                                           | Rationale                                                         |
| ---------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------- |
| Display typeface | **Newsreader** variable (`opsz`,`wght`), self-hosted woff2       | OFL 1.1 confirmed; calm editorial serif fits Scandinavian-premium |
| UI typeface      | **Archivo** variable (`wght`,`wdth`), self-hosted woff2          | OFL 1.1 confirmed; neutral grotesque, deliberately not Inter      |
| Photography      | Unsplash, downloaded **manually (never via API)**                | Free commercial use; API use would impose mandatory attribution   |
| Iconography      | Authored inline SVG (`currentColor`)                             | Licence-clean, ~1 kB, themeable                                   |
| Animation        | CSS transitions/keyframes + one `IntersectionObserver` directive | No library                                                        |
| New runtime deps | **zero**                                                         | Brief constraint                                                  |
| New dev deps     | zero planned; `vitest-axe` optional, needs approval              | —                                                                 |

---

## [ SYSTEM_FLOW ]

### Current flow (as built, end of M2 — Hero complete)

```
src/main.ts
  └─ bootstrapApplication(App, appConfig)
       ├─ app.config.ts providers
       │    └─ provideBrowserGlobalErrorListeners()     ← provideRouter REMOVED (D1)
       └─ src/app/app.ts  (class App, selector app-root)
            └─ app.html
                 ├─ <a class="skip-link" href="#main">     first focusable element
                 ├─ <site-header [(menuOpen)]>            sticky; one <nav>, signal-driven panel
                 ├─ <main id="main" [inert]>
                 │    ├─ <app-hero>                        M2 — h1 · 2 CTAs · priority image
                  │    ├─ <app-featured-collection>      M3 — owns #collection · 6 product cards
                  │    ├─ <app-brand-values>             M4 — 3 principles · no id
                  │    ├─ <app-craft-process>            M4 — 3 steps · no id
│    ├─ <app-editorial>                M5 — owns #journal · 1 image · not a grid
                  │    ├─ <app-product-showcase>        M6 — no id · 1 piece + 5-item index · sticky desktop
│    ├─ <app-brand-story>             M6 — owns #about · text only · no image
                  │    └─ <app-final-cta>               M7 — owns #contact · centred · 1 action

                  └─ <site-footer [inert]>                 wordmark → #top · nav ×4 · copyright · fictional disclosure

src/styles.scss  →  @use → src/styles/{_reset,_tokens,_typography,_layout,_components,_motion,_utilities}.scss
                    ⇒ styles-*.css  (10.45 kB compiled)   ← global layer, exempt from anyComponentStyle
src/app/app.scss (0 B — no shell styling since M7 retired the last placeholder)
src/app/sections/hero/hero.scss (884 B — Hero composition only)
src/app/sections/editorial/editorial.scss (M5 — 1,503 B; the one non-grid composition)
src/app/sections/product-showcase/product-showcase.scss (M6 — 2,726 B compiled; sticky frame + index rows)
src/app/sections/brand-story/brand-story.scss (M6 — 1,066 B compiled; grid geometry + creed type only)
src/app/shared/data/products.ts (M3 — PRODUCTS; the only module that imports product images)
src/assets.d.ts  → declares `*.webp` so images can be imported and fingerprinted
src/assets/      fonts/ (Newsreader + Archivo woff2, OFL .txt)  images/ (ATTRIBUTION.md +
                  nova-hero-{960,1800}.webp — imported, not copied)  README.md
public/  → favicon.{svg,ico}, apple-touch-icon.png, og-image.jpg, _redirects, _headers   (copied verbatim into output)
```

No `app.routes.ts`. No `RouterOutlet`. No router reference remains anywhere in `src/`.

Verified build: `160.34 kB` raw / `47.22 kB` transfer → `dist/nova/browser/`. M1 was
`148.78 kB` / `43.84 kB` (M0 baseline `226.23 kB` / `62.07 kB`), so M2 adds ~11.6 kB raw /
~3.4 kB transfer for the Hero.
Fonts are real WOFF2 (`wOF2` magic verified) — 184 kB for both, preloaded with `crossorigin`, and
confirmed `status: loaded` in Chrome at every tested width (not merely present in the build).

**Image delivery changed in M2.** Images are no longer copied verbatim from `src/assets`: that glob
now carries `ignore: ["images/**/*"]`, and `.webp` is mapped to esbuild's `file` loader so images are
**imported**, emitted content-hashed under `dist/nova/browser/media/`, and served with
`Cache-Control: immutable` by a new `/*.webp` rule in `public/_headers`. Fonts still copy verbatim to
`/assets/fonts`, because `index.html` preloads them by stable URL.

### Planned flow

```
src/main.ts
  └─ bootstrapApplication(App, appConfig)
       └─ app.ts  (shell)
             ├─ <a class="skip-link" href="#main">Skip to content</a>
             ├─ <site-header>        sticky wordmark + nav; signal-driven mobile panel
             ├─ <main id="main">
             │    ├─ <app-hero>                    LCP · priority image
             │    ├─ <app-featured-collection>     ← PRODUCTS[]
             │    ├─ <app-brand-values>            3 principles
             │    ├─ <app-craft-process>           dark band · replaces Testimonials (D2)
             │    ├─ <app-editorial>               lifestyle, not a grid
             │    ├─ <app-product-showcase>        sticky image + detail (desktop)
             │    ├─ <app-brand-story>             philosophy
             │    └─ <app-final-cta>               closes journey
             └─ <site-footer>        nav · social placeholders · fictional disclosure

Styling flow (single global entry — the 8 kB defence)
  src/styles.scss
    └─ @use → _reset · _tokens · _typography · _layout · _components · _motion · _utilities
         ⇒ ONE styles-*.css, NOT a component style ⇒ budgeted against `initial` (1 MB), not
           `anyComponentStyle` (8 kB)

Data flow (API-ready, no backend today)
  shared/data/products.ts  (const PRODUCTS: readonly Product[])
    → app-featured-collection, app-product-showcase
  future: HttpClient.get<Product[]>('/api/products') — no template change required

Motion flow (progressive enhancement — built in M8)
  [novaReveal] ─► RevealCoordinator (ONE IntersectionObserver, rootMargin 0px 0px 10% 0px)
                    ├─ canArm()? no  (reduced motion, or no IO) ─► .is-revealed, no motion state
                    └─ canArm()? yes ─► .reveal (hidden) ─► intersects ─► .is-revealed + unobserve()
  base state = visible  ⇒  no JS / no IO ⇒ content still readable
  stagger: [novaRevealIndex] ─► data-reveal-index ─► --duration-reveal + --stagger × n
  variant: novaReveal="image" ─► .reveal--image on the <img> inside the overflow:hidden .figure

  The bottom rootMargin is POSITIVE on purpose. A negative margin ("reveal a bit
  later") permanently strands the last stretch of a fully scrolled page: the document
  bottom sits flush with the viewport bottom, so anything in the final N% is forever
  below the shrunken observer root and stays at opacity 0. Positive can only ever fire
  early, which is harmless. Found by m8.mjs stranding 9 of 24 reveals.

Nav flow (no router — D1 EXECUTED in M1)
  ONE <nav aria-label="Primary">, natively rendered in both presentations.
  semantic in-page anchors + scroll-behavior: smooth + scroll-margin-top (80px) to clear the
  sticky 57px bar — verified in-browser as a computed value, not assumed.

  Collection  #collection  → <app-featured-collection>
  About       #about       → <app-brand-story>
  Journal     #journal     → <app-editorial>        (no Journal section planned — see below)
  Contact     #contact     → <app-final-cta>        (no form, no email address)
  CTA button  #collection  → "Explore the Collection"

  < 60rem  panel (display:none when closed · focus moves in · Tab trapped · inert behind)
  ≥ 60rem  inline row · trigger removed from the a11y tree
```

> **Breakpoint raised from `md 768` to `60rem` (960px) in M1.** Measured in Chrome, not guessed: the
> inline row needs ~705px for four links plus the 267px CTA, and the wordmark ~104px — ~809px before
> gutters. At 768px the row overflowed its container by ~100px. Tablets in the 768–959px range now
> use the panel, which is correct for that width anyway. `$bp-nav` (SCSS) and
> `INLINE_NAV_MIN_WIDTH_REM` (TS) must stay equal — the former decides where the panel becomes inline,
> the latter dismisses it.

> **"Journal" mapping — CONFIRMED, and now BUILT.** The nav label "Journal" maps to the
> `app-editorial` component via `id="journal"`. **No separate Journal section was created**; the
> approved 12-component architecture is unchanged; this is a deliberate label/component mapping.
> `#journal` became a real target in **M5**, `#about` in **M6** and `#contact` in **M7**.
> All four are real sections and **zero** `.shell-anchor` placeholders remain.

---

## [ARCHITECTURE]

### Style budget mechanics — the governing constraint

Verified in `node_modules/@angular/build`:

- `tools/esbuild/budget-stats.js:48-64` — component CSS is a metafile output tagged
  `ng-component`, recorded with `size: entry.bytes` = its **compiled** CSS, labelled with the
  component's **input** `.scss` path.
- `utils/bundle-calculator.js:230` (`AnyComponentStyleCalculator`) — selects every asset flagged
  `componentStyle`; `budget-stats.js:31-33` shows the global stylesheet is never tagged.

Therefore:

1. `@use`-ing a shared partial inside a component `.scss` **does not** share bytes — the compiled
   output counts in full against that component's 8 kB.
2. The global `styles.scss` is **exempt** from `anyComponentStyle` and is measured only against
   `initial` (500 kB warn / 1 MB error) — ~125× more headroom.

**Rule:** shared/reusable styling → global layer. A component `.scss` holds only what is genuinely
its own. Working limit = the **4 kB warning**, not the 8 kB error.

Budgets are **unmodified** and stay that way as the first-line solution.

> This mechanic is also documented in `AGENTS.md`, so sessions that never read the plan still
> inherit the constraint.

### Planned component tree

```
src/app/
├── app.ts|html|scss|spec.ts        shell
├── app.config.ts                   (router removed)
├── app.routes.ts                   DELETED (D1)
├── layout/
│   ├── site-header/                nav · mobile menu · signal state
│   └── site-footer/
├── sections/                       one component per page section
│   ├── hero/                       LCP
│   ├── featured-collection/        the only legitimate card grid
│   ├── brand-values/               3 principles, numbered columns · CURRENT (M4)
│   ├── craft-process/              replaces Testimonials (D2) · CURRENT (M4)
│   ├── editorial/                  lifestyle, deliberately not a grid · CURRENT (M5) — owns #journal
│   ├── product-showcase/           one piece, sticky frame + ruled text index · CURRENT (M6) — no id
│   ├── brand-story/                philosophy, text only · CURRENT (M6) — owns #about
│   └── final-cta/                  CURRENT (M7) — owns #contact · centred · one action
├── ui/                             ≥3 genuine reuse sites only
│   ├── button/                     6+ sites · variant via input()
│   ├── product-card/               2 sites
│   └── section-heading/            6 sites
└── shared/
    ├── types/product.ts            Product, ProductImage
    ├── data/products.ts            PRODUCTS: readonly Product[]
    └── directives/reveal.ts        IntersectionObserver, unobserves after firing
```

**Anti-fragmentation:** one component per section. No layout components, no icon component until
≥3 uses, no wrapper divs-as-components.

### Planned global SCSS layer

| Partial            | Contents                                                                |
| ------------------ | ----------------------------------------------------------------------- |
| `_reset.scss`      | modern reset                                                            |
| `_tokens.scss`     | colour, fluid type scale, spacing, motion as CSS custom properties      |
| `_typography.scss` | base type, `clamp()` scale, 65ch measure — carries most responsive work |
| `_layout.scss`     | `.container`, `.grid-12`, `.stack`, `.cluster`                          |
| `_components.scss` | shared patterns: `.btn`, `.eyebrow`, `.rule`, `.link-underline`         |
| `_motion.scss`     | keyframes, reveal states, `prefers-reduced-motion` override             |
| `_utilities.scss`  | `.visually-hidden`, overflow guards                                     |

### Design tokens (proposed)

- **Colour** — warm near-monochrome: `--nova-paper #F3F0EA`, `--nova-ink #17150F`,
  `--nova-ink-soft #4A453D`, `--nova-muted #6B6459`, `--nova-line #D8D1C5`, `--nova-night #14120E`.
  Single accent `--nova-clay #8F4E2E` (deliberately darkened from `#A85F3C`, which measured
  ~4.2:1 and fails AA at body size). **All ratios to be confirmed with AXE during implementation.**
  The accent is restrained but **not numerically capped** — used intentionally for hierarchy,
  emphasis, interaction, or brand identity, kept visually consistent, never used decoratively or
  excessively. The composition determines frequency.
- **Type** — Newsreader (display) + Archivo (UI), both variable, both OFL 1.1.
- **Space** — 8px base, 4px half-step, `--space-3xs`…`--space-5xl`;
  `--section-y: clamp(4rem, 2rem + 8vw, 10rem)`.
- **Layout** — 12-col grid, `min(100% - 2*gutter, 1440px)`, `100%` never `100vw`.

### Responsive model

Mobile-first, base = 360px. Breakpoints `sm 480` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1440`.
Verified against required widths 360 / 390 / 768 / 1024 / 1280 / 1440+.

M1 verification method, worth reusing: **Chrome DevTools Protocol**, not `--window-size`. `--window-size`
is not a viewport control — asking for 360px yields a 504px CSS viewport and silently skips every
mobile breakpoint. `Emulation.setDeviceMetricsOverride` is the only reliable way. At each width the
harness asserts: exact viewport, no horizontal overflow, no element extending past the viewport, sticky
positioning, header height vs `--header-offset`, all four anchors present, `scroll-margin-top`
computed, exactly one `Primary` landmark, `h1` count 0, both fonts `loaded`, correct nav
presentation, ≥44px targets, panel full-bleed, focus inside the panel, background `inert`, Escape
closing and restoring focus, and `inert` released on close. All checks pass at all six widths.

> **Vitest cannot catch `display: none` focus bugs.** jsdom loads no component stylesheets, so a
> panel hidden by CSS is still focusable there. The focus-on-open test passed in Vitest while failing
> in Chrome, because `focus()` on a still-`display: none` subtree is a silent no-op. Fixed with
> `afterNextRender` (focus runs after host bindings are applied); the comment in `toggle()` records it.

### Portfolio integrity

Fictional disclosure in the footer. No testimonials, ratings, customer counts, press logos,
revenue, or invented contact details. `ATTRIBUTION.md` credits Unsplash photographers although the
licence does not require it.

---

## [ORPHANS & PENDING]

### Approved decisions

| ID     | Decision                                                        | Outcome                                                                                                                                                                                                                                                            | Executes in    |
| ------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| **D1** | Remove `@angular/router` + `<router-outlet>` + `app.routes.ts`? | **`APPROVED` — remove.** Single-page landing page; navigation uses semantic anchors. Multi-page routing, if ever needed, is a **separate change**.                                                                                                                 | **M1**         |
| **D2** | Include a Testimonials section?                                 | **`APPROVED` — omit.** No testimonials, reviews, ratings, star ratings, customer counts, press logos, or fabricated social proof. Craft & Process replaces it, told through materials, craftsmanship, construction, design process — never as real-world evidence. | **M4**         |
| D3     | Currency                                                        | **`APPROVED`** — EUR via `CurrencyPipe`, value carried on the data object                                                                                                                                                                                          | M3             |
| D4     | Footer contact                                                  | **`APPROVED`** — inert placeholder, no `mailto:`, no invented details                                                                                                                                                                                              | **BUILT (M7)** |
| D5     | Add `vitest-axe` / `axe-core` as a dev dependency?              | **Deferred / optional.** Adds a dependency; manual keyboard + screen-reader review is the M9 baseline.                                                                                                                                                             | M11 (opt.)     |

> **D1 sequencing — EXECUTED.** Router removal edits `app.config.ts`, `app.ts`, `app.routes.ts`, and
> `package.json` — application structure. M0 (Foundations) was styling and assets only, so the router
> **stayed installed through M0** and was removed at the start of M1. All four are now clean.

> **D2 integrity rule.** Enforced as a hard acceptance criterion: M4 verifies the rendered DOM
> contains no ratings, star counts, customer counts, or press logos.

### Orphans / inconsistencies found in the current repo

| Item                  | Detail                                                                                                                       | Action                                                                                    |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| ~~Dead routing~~      | ~~`app.routes.ts` is `[]` while `app.ts` imports `RouterOutlet`~~                                                            | **Resolved in M1** — package, lockfile, `app.ts` and routes cleaned                       |
| ~~Scaffold coupling~~ | ~~`app.spec.ts` formerly asserted the Angular splash~~                                                                       | **Resolved in M1** — 5 shell tests replace the splash assertion                           |
| ~~Stale docs~~        | ~~`README.md` claimed CLI `22.1.7` (installed 22.2.x) and documented `ng e2e`, which fails with `Cannot find "e2e" target`~~ | **Resolved in M10** — both gone; `AGENTS.md` keeps the `ng e2e` warning                   |
| ~~Empty styles~~      | ~~`src/styles.scss` = 1 comment; `styles-*.css` = 0 bytes~~                                                                  | **Resolved in M0** — 7 partials, 9.77 kB compiled                                         |
| ~~Empty `app.scss`~~  | ~~`src/app/app.scss` = 0 bytes~~                                                                                             | **Resolved in M1** — 208 B for anchor placeholders only                                   |
| ~~Placeholder meta~~  | ~~`index.html` title "Nova", no description/theme-color/OG~~                                                                 | **Resolved in M0** — full metadata + 2 font preloads                                      |
| ~~Placeholder UI~~    | ~~`app.html` is the Angular welcome splash~~                                                                                 | **Resolved in M1** — real shell; splash gone                                              |
| ~~Favicon~~           | ~~Default Angular `favicon.ico`; no SVG icon or `apple-touch-icon`~~                                                         | **Resolved in M8/M9** — SVG monogram + ICO + `apple-touch-icon`                           |
| ~~Image pipeline~~    | ~~`.webp` could not be `import`ed — the builder had no loader for it, so local images had no fingerprinted URL~~             | **Resolved in M2** — `file` loader + `src/assets.d.ts` + `/media` output                  |
| AGENTS.md updated     | Verified `anyComponentStyle` mechanics + the global-layer rule are now documented for future sessions                        | **Done** — see "Style budget mechanics" below                                             |
| ~~No CI~~             | ~~Nothing runs on push or PR~~                                                                                               | **Done in M9** — `.github/workflows/deploy.yml` runs format → build → test → Pages deploy |

### Open items

| Item                       | Detail                                                                                                                            | Needs                                                                                                      |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| D5 automated a11y tooling  | `vitest-axe` / `axe-core` would add a dev dependency                                                                              | Explicit approval (deferred)                                                                               |
| **Hero photograph**        | ~~M2 blocked: no licensed image obtainable from the build env~~                                                                   | **Resolved** — supplied by the maintainer; Claudio Schwarz, recorded in `images/ATTRIBUTION.md`            |
| Hero `alt` text            | ~~Describes the intended art direction, not the delivered photograph~~                                                            | **Resolved** — describes the actual photograph; spec asserts no `NOVA` token                               |
| ~~Hero 1800px file size~~  | ~~`nova-hero-1800.webp` is 595 KB vs the ≤ 250 KB per-image limit, as supplied~~                                                  | **Resolved** — re-encoded in place to 245,804 B                                                            |
| ~~Product photography~~    | ~~M3 blocked: no product images exist, so `PRODUCTS` cannot be written and `#collection` stays a placeholder~~                    | **Resolved** — six approved photos supplied, cropped to 1200×1500 WebP and wired through `PRODUCTS`        |
| ~~Product attribution~~    | ~~Photographer names for the six supplied photos could not be resolved automatically — Unsplash returns 401 to every route~~      | **Resolved** — maintainer confirmed all six credits manually; recorded verbatim in `images/ATTRIBUTION.md` |
| `.figure` had no `display` | The shared figure frame was `inline`, where `width`/`height`/`aspect-ratio` do not apply, so any consumer silently lost its ratio | **Resolved in M3** — `display: block` in `_components.scss`; only consumer was the product card            |

### Done — M0 Foundations

| Area            | Detail                                                                                                                                                                                                                        |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tokens          | Palette, semantic aliases, fluid type, spacing, layout, motion and focus as `:root` custom properties — `_tokens.scss`                                                                                                        |
| Global layer    | 7 partials loaded from `src/styles.scss` in reset → tokens → typography → layout → components → motion → utilities order                                                                                                      |
| Typography      | Newsreader (display, `opsz 24-72`) + Archivo (UI, `wght 100-900`), both self-hosted variable WOFF2 with real `wOF2` magic, `font-display: swap`, `font-synthesis-weight: none`, root-absolute `src`, matching `unicode-range` |
| Layout          | `.container` (percentage-based, never `100vw`), 12-col `.grid`, `.section` + `--alt`/`--invert`/`--tight`, `.stack`, `.cluster`, `[id]` scroll-margin                                                                         |
| Shared patterns | `.btn` (`--primary`/`--secondary`/`--invert`), `.rule`, `.figure` (+`--zoom`), one global `:focus-visible` treatment                                                                                                          |
| Motion          | Purposeful only, compositor-friendly (`transform`/`opacity`); reveal is progressive enhancement and collapses under `prefers-reduced-motion`                                                                                  |
| A11y utilities  | `.visually-hidden`, `.skip-link` (off-screen until focused), `.min-w-0`, `.media-cover`/`--contain`                                                                                                                           |
| Contrast        | Every text pair computed against the WCAG 2.2 luminance formula — all AA, most AAA. `--nova-ink` on `--nova-night` is 1.02:1 and is flagged unusable in `_tokens.scss`                                                        |
| Assets          | `src/assets/README.md` (limits + licensing), `images/ATTRIBUTION.md` provenance register — empty, no images downloaded                                                                                                        |
| Metadata        | Title, description, theme-color, canonical, OG/Twitter card, and `crossorigin` preloads for both fonts                                                                                                                        |
| Caching         | `/assets/fonts/*.woff2` → 30-day immutable in `public/_headers` (unhashed filenames must not get the one-year hashed treatment)                                                                                               |

### Done — M1 Shell + Navigation

| Area              | Detail                                                                                                                                                                                                                                                                                               |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1 router removal | `npm uninstall @angular/router`; `provideRouter` dropped from `app.config.ts`; `RouterOutlet` dropped from `app.ts`; `app.routes.ts` deleted. `npm ls @angular/router` → empty; zero router references in `src/` or the lockfile                                                                     |
| Shell             | `app.html` renders skip link → `site-header` → `<main id="main">` → `site-footer`. The Angular welcome splash is gone                                                                                                                                                                                |
| Header            | ONE `<nav aria-label="Primary">` serving both presentations. Wordmark → `#top`, four anchor links, singular primary CTA → `#collection`                                                                                                                                                              |
| Panel             | Signal `model()` open state two-way bound to the shell; `aria-expanded` + label flip to "Close menu"; Escape closes and restores trigger focus; Tab traps in both directions; anchor activation closes; panel is full-bleed                                                                          |
| Focus timing      | Focus-on-open uses `afterNextRender`, not an `effect` — see the Responsive model note. Vitest alone would have shipped a silent no-op                                                                                                                                                                |
| Background inert  | `<main>` and `<site-footer>` take `inert` while the panel is open and release it on close, so the page behind cannot be reached by pointer, keyboard or screen reader                                                                                                                                |
| Footer            | Shell footer in M1: wordmark, copyright, fictional-brand disclosure. **M7 completes it** — the wordmark becomes a link to `#top`, and a named `Footer` nav lands the four approved anchors. Still no contact mechanism, address, social account or newsletter, by D4                                 |
| Anchors           | All four approved fragments have real, focusable targets: M1 shipped temporary `.shell-anchor` sections, and each was deleted as its section landed (#collection M3, #journal M5, #about M6, #contact M7). `app.spec.ts` asserts the placeholder count is now **zero** so the scaffold cannot return |
| Inline breakpoint | Raised `48rem` → `60rem` after measuring real min-content; tablets 768–959px use the panel                                                                                                                                                                                                           |
| Verification      | `prettier --check` clean · `ng build` clean · 23 Vitest tests pass · 6 real-browser widths × ~20 CDP assertions all pass · component styles `app` 208 B, `site-footer` 775 B, `site-header` 2572 B (all under the 4 kB warn)                                                                         |

### Done — M2 Hero

| Area              | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Component         | `src/app/sections/hero/` → `hero.ts` (class `Hero`, selector `app-hero`), `hero.html`, `hero.scss`, `hero.spec.ts`. First child of `<main>`, above the M1 placeholders                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Composition       | Asymmetric split per plan §7: eyebrow + `h1` + lede + CTAs on the left, large image right. Stacked and full-bleed below `64rem`; two columns at and above it, text `0.82fr` vs image `1.18fr`, image bleeding 0px short of the viewport right edge at 1024/1280/1440                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Copy              | `Collection No. 01` · "Good rooms are made slowly." · lede describing proportion and keeping rather than replacing. Design intent only — no customers, awards, press, certifications, operating history or product claims (D2 integrity)                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| CTAs              | `Explore the Collection` → `#collection` (the one primary CTA) and `View Lookbook` → `#journal` as a real `.btn--secondary`. **Decision:** the plan defines no Lookbook destination; `#journal` was chosen as the least assumptive one-page anchor. **Landed on `<app-editorial>` in M5** — the destination is no longer a placeholder. No route, page or lookbook section was invented                                                                                                                                                                                                                                                                                                             |
| Heading           | The page's single `h1`; the section is `aria-labelledby="hero-title"`; h1 confirmed rendering in Newsreader, not a fallback                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **Photography**   | `nova-hero-1800.webp` (1800×1200, **245,804 B**) + `nova-hero-960.webp` (960×640, 190,040 B) — one photograph, two widths. **Photographer: Claudio Schwarz.** URL: https://unsplash.com/photos/a-room-with-a-couch-and-chairs-lc0gdYqrRzs — Unsplash licence, website download, no API. Recorded in `src/assets/images/ATTRIBUTION.md`                                                                                                                                                                                                                                                                                                                                                              |
| Compression       | The 1800px file was re-encoded in place after its dimensions changed pushed it to 609,434 B. `ffmpeg -c:v libwebp -quality 53 -compression_level 6` → **245,804 B** (−59.7%), under the ≤ 250 KB per-image limit. Quality was chosen by measurement, not guesswork: a quality sweep ranked candidates by PSNR/SSIM against the pre-compression file, and `q=53` was the highest-fidelity setting that still fit. Result: PSNR 32.86 dB, SSIM 0.9427, mean abs diff 4.16/255, mean luma 102.34 → 102.25 (no tonal shift), dimensions still exactly 1800×1200, still WebP. Pillow's encoder was also tested and plateaued at lower quality for the same byte count. Total shipped imagery now ~436 KB |
| Alt text          | "Interior with a sofa and two lounge chairs on wood flooring, a patterned wall, daylight from a window and warm pendant lighting overhead." Describes only what is visible. `hero.spec.ts` asserts the alt text carries no `NOVA` token, so the photograph can never be captioned as NOVA product                                                                                                                                                                                                                                                                                                                                                                                                   |
| Crop / distortion | The photograph is **3:2 landscape** while the Hero frame is pinned to **4:5 portrait**, so `aspect-ratio: 4/5` + `object-fit: cover` crops **~47% of the image width** (53% visible) rather than distorting it. Verified in Chrome: `srcAR=1.5`, `boxAR=0.8`, `object-fit: cover`. With the default `fill` this photograph would have been visibly squashed. **Superseded in M4** — the Hero frame is now 3:2, matching the source, so nothing is cropped                                                                                                                                                                                                                                           |
| Responsive image  | `NgOptimizedImage` + `priority` (→ `loading="eager"`, `fetchpriority="high"`), explicit `1800×1200` to reserve space, `sizes="(min-width: 64rem) 47vw, 100vw"`, `ngSrcset="960w, 1800w"`. Verified in Chrome: 1440@1x fetches the **960w** file (676px needed), 1440@2x fetches the **1800w** file                                                                                                                                                                                                                                                                                                                                                                                                  |
| Loader            | This Angular version has **no per-image `loader` input**, so `hero.ts` scopes an `IMAGE_LOADER` provider to the component that maps requested widths to the two imported files. A global provider in `app.config.ts` would be infrastructure every later image would have to adopt                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Pipeline          | `angular.json`: `.webp` → esbuild `file` loader, plus `ignore: ["images/**/*"]` on the `src/assets` glob so images are imported and fingerprinted into `/media` instead of being copied twice. `src/assets.d.ts` declares `*.webp`. New `/*.webp` immutable rule in `public/_headers`. This is what made the asset importable at all — the builder had no `.webp` loader before M2                                                                                                                                                                                                                                                                                                                  |
| Verification      | `prettier --check` clean · `ng build` clean (`160.34 kB` raw / `47.19 kB` transfer) · **Vitest 27/27 pass** (placeholder guard test removed with the placeholders) · **6 real-browser widths × full M1 regression + Hero assertions ALL PASS**, plus a 1440@2x variant-selection probe · `hero.scss` **884 B** compiled, 3116 B under the 4 kB warn. Confirmed: image decodes at every width, exactly one `h1`, CTAs unchanged, no horizontal overflow, nothing extends past the viewport, bleed 0px short at 1024/1280/1440, M1 panel/inert/Escape/focus checks still green                                                                                                                        |

**Known deviation, resolved:** the 1800px file arrived at 595 KB after its dimensions were changed,
over the ≤ 250 KB per-image limit. It was re-encoded **in place** — same photograph, same
1800×1200 dimensions, still WebP — down to **245,804 B** at `-quality 53`. No layout, crop, loader or
`NgOptimizedImage` change was involved.

### Complete — M3 Product data + Featured Collection

**Mounted and verified against real photography.** `PRODUCTS` is written, the section is wired into
`app.html`, and the `#collection` placeholder is gone — the section owns that id. Every check passes
at six real-browser widths with the six approved assets actually loading.

| Area          | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Data model    | `src/app/shared/types/product.ts` — `Product` + `ProductImage`, all fields `readonly`. API-ready per plan §4.3: `image.src: string` (the fingerprinted URL an API would return, so a component never imports an image), `price: number` + `currency: string`, `materials?: readonly string[]`, `image.priority?: boolean`                                                                                                                                                                                                                                                                                                                                                                   |
| Data source   | `src/app/shared/data/products.ts` exports `PRODUCTS` — six `readonly Product` entries, each `image.src` an ES import the builder rewrites to a fingerprinted `/media/*.webp` URL. The import is confined to this file, which is what keeps the API swap to six lines. Covered by `products.spec.ts` (8 tests): order, unique ids/slugs, whole-number EUR prices, 1200×1500 declared dimensions, media paths, alt text, and the no-social-proof rule checked on the real copy                                                                                                                                                                                                                |
| Wiring        | `app.ts` holds `protected readonly products = PRODUCTS` and `app.html` binds `[products]="products"`. Neither `FeaturedCollection` nor `ProductCard` imports the catalogue, so the future `http.get<Product[]>('/api/products')` lands in `app.html` alone                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Components    | `ui/section-heading/` (eyebrow + `h2` + optional lede, `id` input) · `ui/product-card/` (reusable, `<article>`, name-link only, `aspect` input) · `sections/featured-collection/` (grid + `SectionHeading`, `aria-labelledby`)                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Composition   | From `48rem`: unequal spans on 6 columns (3+3, 2+4, 3+3); from `64rem` explicit 12 columns (7+5, 5+6, 8+4) with row 2 ending at column 11 — **column 12 is a deliberate hole**. Column spans carry all the asymmetry; see the ratio note below                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Ratios        | **Every frame is `4 / 5`.** The varied set `1/1, 4/5, 3/4, 4/5, 3/2, 4/5` was the original editorial intent, but the delivered photography settled it: all six assets are exactly 1200×1500, so a `3 / 2` frame would `cover`-crop ~47% of a photograph's height and `1 / 1` ~20%, discarding the furniture the frame exists to present. Aspect variety that costs 47% of the subject is a defect, not a rhythm. Restoring it is a one-line change to `aspects`                                                                                                                                                                                                                             |
| Row alignment | `align-items: end` on the row. Aligning the _taller_ card is a no-op, so one declaration bottom-aligns every shorter card in every row. Replaced per-item `align-self`, which was landing on the taller card and left row-1 bottoms 107–150px apart                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `.figure` fix | **Global-layer bug fixed.** `.figure` had no `display`, so the `<span>` frame was `inline` — where `width`, `height` and `aspect-ratio` have **no effect**. Every figure silently rendered at the source image's intrinsic 3:2, i.e. the entire ratio composition was never being applied. `display: block` added to `src/styles/_components.scss`                                                                                                                                                                                                                                                                                                                                          |
| Imagery       | Six products, one width each, `loading="lazy"`, `NgOptimizedImage`, explicit intrinsic `width`/`height` (no CLS), `object-fit: cover`. No per-image `srcset` and no second loader — the Hero keeps its component-scoped `IMAGE_LOADER`; six more `srcset` variants would be 6× the assets for one image each. Verified in-browser: all six report `naturalWidth/Height` 1200×1500 from six _different_ `/media` files                                                                                                                                                                                                                                                                       |
| Alt text      | Alt text carries **no `NOVA` token** — these are licensed third-party photographs, so it must not claim the picture shows a NOVA product. Enforced in both `product-card.spec.ts` and the browser harness                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| A11y          | Section is `aria-labelledby` its own `h2` (`id` on the heading, not the host). One `h1` page-wide. `role="list"` + `.list-reset` because Safari drops list semantics from `list-style: none`. One tab stop per card — the name is the link, the image is not separately linked. `:focus-within` mirrors `:hover`; the link turns the accent colour                                                                                                                                                                                                                                                                                                                                          |
| Integrity     | Fictional names/categories/prices only (EUR, D3, `CurrencyPipe`, `'1.0-0'`). No reviews, ratings, sales, counts, awards or business claims anywhere (D2) — and the specs now also reject `handmade`/`small batches`/`sustainable` copy, which is the same failure in a different costume                                                                                                                                                                                                                                                                                                                                                                                                    |
| Verification  | `prettier --check .` clean · `ng build` clean · **Vitest 55/55 pass** (8 files; was 27 at M2, 45 before the catalogue spec) · **6 real-browser widths × all M3 assertions PASS** with real assets: ratios exactly `0.8` at every width, six distinct image sources, all six decoding at 1200×1500, row-1 bottom delta 0px, hole 78.7/98.6/111px at 1024/1280/1440, no horizontal overflow, no pairwise overlap, one `h1`, 1×`h2` + 6×`h3` in section, all alts descriptive, images fingerprinted from `/media`, Tab from the Hero landing on `NOVA Forma Sofa` with a 2px solid ring · **M1+M2 regression re-run with the section mounted: ALL PASS**, incl. 1440@2x Hero variant selection |
| Style budgets | Measured with the section **mounted** (so these are real, not tree-shaken): `featured-collection` **1129 B**, `product-card` **1219 B**, `section-heading` **157 B**, `hero` 884 B, `app` 208 B, `site-header` 2572 B, `site-footer` 775 B — all far under the 4 kB warn. Global `styles.scss` 9,783 B, exempt from `anyComponentStyle`                                                                                                                                                                                                                                                                                                                                                     |
| Bundle        | **180.88 kB raw / 53.10 kB transfer** — against a 500 kB warn / 1 MB error. M2 was 160.36/47.17; the whole M3 tree costs ~20 kB raw                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

**Attribution and asset cleanup closed.** Both remaining M3 loose ends are resolved: the six
photographer credits are confirmed, and the six source JPEGs are deleted.

| Item               | Detail                                                                                                                                                                                                                                                                                                                                                      | Status                                                                                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Photographer names | All six product rows in `src/assets/images/ATTRIBUTION.md` read `_unverified_` because Unsplash returns **HTTP 401** to every automated route (page URL, `napi`, API host) and the supplied JPEGs carried no **EXIF**. A guessed name in a provenance table is a false claim about who made a photograph, so it was left as a marked gap rather than filled | **Resolved** — maintainer opened each of the six Asset URLs and read the credit line; names recorded verbatim, no username invented beyond the one supplied |
| Source JPEGs       | The six originals sat unreferenced in `src/assets/images`: no import in code or data, no test or doc reference, no hit in `angular.json` or `public/`, and `angular.json` excludes `images/**/*` from the asset glob so they were never emitted. `src/assets.d.ts` declares only `*.webp`, so a `.jpg` import could not have compiled                       | **Deleted** — folder now holds the eight shipped images only, per `ATTRIBUTION.md` rule 6                                                                   |

> Three harness bugs found and fixed en route, recorded because each would have hidden a real
> defect: `decode()` on a never-loaded lazy image never settles; the accent-colour assertion read
> the colour mid-`transition`; and — found at M3 — **`innerWidth` is the wrong denominator for
> full-bleed measurements**, because it includes the 15px classic scrollbar that no layout box can
> occupy. That last one reported a phantom 15px shortfall at six widths the moment the page grew
> tall enough to scroll, and it would equally have hidden a genuine `100vw` bleed, since such
> overflow lands _inside_ the `innerWidth` budget. Both harnesses now measure against
> `document.documentElement.clientWidth`, and the M3 overflow check is strictly tighter than before.

### Complete — M4 Brand Values + Craft & Process

**Two sections, mounted and verified.** Three numbered principles on the alternating surface, then a
full-width inverted band carrying a three-step making narrative. Both sections take their structure
from a shared global pattern, and neither declares an `id`.

| Area            | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Anchors         | **Neither section has an `id`, deliberately.** Plan §4.4 assigns `#about` to `<app-brand-story>`, so neither M4 section claims a nav anchor of its own. _(Updated in M6: the `#about` placeholder stopped being the anchor's owner when Brand Story landed, and both sections still sit above their original placeholder slot.)_ `app.spec.ts` asserts each of the four approved ids has **exactly one** owner, and each M4 section asserts its own `section.id === ''`                                |
| Shared pattern  | `.numbered` in `src/styles/_components.scss` — hairline `border-top` + index + `h3` + paragraph, plus a `.section--invert` recolour. It lives in the **global** layer because two components use it; that also prices it against `initial` instead of charging it to both stylesheets. It is explicitly not a card: no border box, radius, shadow or surface fill                                                                                                                                      |
| Brand Values    | `.section--alt` (`--nova-paper-alt`), three `<li class="numbered">`. Spans: 1 column below 48rem → **3 + 3 / 6** at 48rem → **deliberately unequal 5 / 4 / 3** at 64rem, so the columns cannot read as a pricing table and the third principle gets the closing full measure                                                                                                                                                                                                                           |
| Craft Process   | `.section--invert` (`--nova-night`). Spans: 1 column → **3 + 3 / 6** at 48rem → **even 4 / 4 / 4** at 64rem. Even on purpose: a sequence with uneven tracks reads as misalignment, so the editorial weight comes from the inverted surface and the oversized numerals instead. The `:nth-child(3)` placement is restated at 64rem because the more specific 48rem selector would otherwise hold step 3 full width                                                                                      |
| Full-bleed band | The band is the **section's own background**, so it runs edge to edge with no full-bleed utility, no `100vw` and no negative-margin escape hatch. Verified at every width: `x = 0` and `right = clientWidth`                                                                                                                                                                                                                                                                                           |
| Numeral         | Two adjacent numbered sections, deliberately different treatments: Brand Values sets a small tracked UI label, Craft & Process sets a display-serif numeral up to `clamp(2rem, …, 3.25rem)`. Identical treatments would collapse them into one repeated block                                                                                                                                                                                                                                          |
| Lists / a11y    | `<ol role="list" class="list-reset">` on both — the steps are a real sequence. Visible numerals are `aria-hidden`: the `<ol>` already announces position, so exposing them too reads order twice. Each section is `aria-labelledby` its own `h2`; one `h1` page-wide; 1 `h2` + 3 `h3` per section                                                                                                                                                                                                      |
| Keyboard        | **Neither section adds a tab stop** — both are static content, asserted in-browser and in `craft-process.spec.ts`. Neither declares motion of its own; since M8 the only transition on their items is the shared `.reveal` from the global layer, and reduced motion still holds because the directive refuses to arm and the global override collapses the cascade to 0.01 ms (confirmed under emulated media in `m8.mjs` §1)                                                                         |
| Contrast        | Measured in-browser against the **resolved ancestor background**, not assumed: principles 14.55:1 title / 7.58:1 body; steps 16.45:1 title / 8.87:1 body. All clear AA 4.5:1                                                                                                                                                                                                                                                                                                                           |
| Integrity (D2)  | This section **replaced** the planned testimonial block, so the drift risk is highest here. `craft-process.spec.ts` rejects facility, headcount, lead-time, credential, sustainability and scale vocabulary; `brand-values.spec.ts` rejects trading history, credentials and numeric claims; `app.spec.ts` adds a page-level guard scoped to `<main>`                                                                                                                                                  |
| Verification    | `prettier --check .` clean · `ng build` clean · **Vitest 77/77 pass** (10 files; was 55/55 in 8) · **6 real-browser widths × all M4 assertions PASS** — spans 5/4/3 and 4/4/4 confirmed as real pixel widths (539/427/314 and 427/427/427 at 1440), band edge-to-edge, hairlines `1px solid`, `border-radius: 0` and `box-shadow: none` on every column, no overflow, no overlap, no tab stops · **M1–M3 regression re-run with both sections mounted: ALL PASS** (`m3.mjs` and `hero.mjs`, unchanged) |
| Style budgets   | `brand-values` **765 B**, `craft-process` **814 B** compiled — the two smallest component stylesheets on the page, ~3.2 kB of headroom under the 4 kB working limit. Global `styles.scss` 10,215 B, exempt from `anyComponentStyle`                                                                                                                                                                                                                                                                    |
| Bundle          | **186.46 kB raw / 54.14 kB transfer** — against a 500 kB warn / 1 MB error. M3 was 180.88/53.10, so both sections cost ~5.6 kB raw                                                                                                                                                                                                                                                                                                                                                                     |

> Two test-guard bugs found and fixed en route, recorded because both were false-positive
> generators that would have pushed the next milestone toward rewording good copy instead of fixing
> the guard. First, the shared D2 regex `\b(review|rating|…|stars?|…)` had a leading `\b` but **no
> trailing one**, so `\bstars?\b` matched the "star" inside **"start"** and failed on the sentence
> "before they start". `product-card.spec.ts` and `products.spec.ts` already carried the correct
> trailing-`\b` form; the M4 specs adopt it, with explicit plurals so "testimonials" and "reviews"
> are still caught. **The same leading-only bug is still live in `featured-collection.spec.ts:265`** —
> left alone as a frozen M3 file, worth a one-line fix. Second, a whole-page D2 scan is
> fundamentally unable to tell a disclaimer from a claim: `site-footer` legitimately contains the word
> "testimonials" in "No products, testimonials, or offers shown on this site are real". The page-level
> guard is therefore scoped to `<main>`, and `site-footer.spec.ts` continues to assert the disclaimer.

### Complete — M5 Editorial / Lifestyle

**One section, mounted and verified.** It claims `#journal`, retires the M1 placeholder, and is the
page's first content that argues nothing about a product — only about atmosphere.

| Area             | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Anchors          | **Owns `id="journal"`** on a real `<section aria-labelledby="editorial-title">`, and the M1 placeholder is deleted, exactly as M3 did for `#collection`. Plan §4.4 maps the "Journal" nav item here because no separate Journal section is planned. This makes the Hero's `View Lookbook` CTA — `hero.html`, unchanged since M2 — land on real content for the first time. `app.spec.ts` asserts one owner per anchor, that `#journal` is **not** a `.shell-anchor`, and that it resolves inside `<app-editorial>`. The component legitimately holds two ids (`#journal` plus the `h2` label), the first section on the page to do so                                                                     |
| Position         | **Moved up, deliberately.** The M1 placeholders sat `#about, #journal, #contact` in DOM order, so wiring Editorial into its own placeholder slot would have put the M6 brand story _above_ it. It is mounted directly after `<app-craft-process>` so the current DOM matches plan §7's Hero → Collection → Values → Craft → Editorial → Showcase → Story. `app.spec.ts` asserts the full `main > *` order, so this cannot silently invert again                                                                                                                                                                                                                                                           |
| Composition      | Deliberately **not** the global `.grid`, and deliberately **not** `ui-product-card`. One `<figure>`: a `4 / 5` frame (reusing the global `.figure` primitive for overflow, placeholder surface and `object-fit`) with an offset `<figcaption>`, beside a text column holding a `<blockquote>` and one paragraph. Spans 1 column below 48rem → **image 4 of 6 with the text block offset to column 2** at 48rem → **image 5 of 12 with the text block at 7–11 and `align-self: end`** at 64rem. `align-self: end` is what buys the "generous negative space" from plan §7: bottom-aligning leaves the upper right quiet instead of floating a short column in the middle of nothing                        |
| Caption offset   | `padding-inline-start: var(--space-xl)` (48px), **kept at every width**. It is the one device that makes the section read as editorial rather than as a card, and below 48rem there is no second column to misalign against, so resetting it would have dropped the device at the size the page is most often read. At 360px the frame is 320px and 272px (~34ch) of measure remains. Asserted in-browser at all six widths                                                                                                                                                                                                                                                                               |
| Image            | `nova-editorial-{640,1200}.webp` — Alexander Lunyov (@sunify), Unsplash licence, owner-supplied manual download (the automated fetch is blocked). Source 4160×6240 (2:3), **uncropped** at both sizes; the 4:5 frame is applied at render time, not baked in, which keeps the source recoverable. Served at two widths via `ngSrcset="640w, 1200w"` and the Hero's scoped-`IMAGE_LOADER` pattern, so a 360px phone pulls **53 kB** rather than 156 kB                                                                                                                                                                                                                                                     |
| Why 4:5, not 2:3 | The source is 2:3, but a 2:3 frame at full container width is **1,060px tall on a 768px tablet** — the viewport-domination failure the acceptance criteria name. 4:5 keeps every delivered frame between **400px and 690px** across 360/390/768/1024/1280/1440, asserted in-browser against a 700px ceiling                                                                                                                                                                                                                                                                                                                                                                                               |
| Pull-quote       | `--text-pullquote` in `_tokens.scss`, stepped _between_ `--text-h2` and `--text-h3` (36px vs 64px vs 17px at 1024+). At heading scale it would compete with the section title; reusing `--text-h3` would make it indistinguishable from a card name. The token lives in the **global** layer so it costs zero compiled component style. Hairline `border-inline-start`, no box, no radius, no shadow. **No `<cite>`** — the line is the brand's own position and crediting a person or publication would be a fabricated attribution                                                                                                                                                                      |
| No card grid     | `editorial.spec.ts` asserts zero `ui-product-card`, zero `ol`/`ul`, zero `.numbered`, and that the frame carries the global `.figure` class. The risk this guards is real and specific: `ui-product-card` is a reusable primitive, and three or more of them in a row is exactly the SaaS feature grid M4 had to be defended against                                                                                                                                                                                                                                                                                                                                                                      |
| Lists / a11y     | One `h2` and **no `h3`** — there is no subhead, so one would fabricate structure the content does not have. Confirmed outline `H2` in-browser at all six widths, and one `h1` page-wide. `<figure>`/`<figcaption>` for programmatic caption association. Alt text is >20 chars, does not begin "image of", and contains no `NOVA` token (this is somebody else's licensed interior, not a NOVA piece)                                                                                                                                                                                                                                                                                                     |
| Keyboard         | **No links, buttons or tab stops** — nothing in the section goes anywhere, so every focusable element would be a stop that exists only to be skipped (WCAG 2.4.3). Asserted in-browser and in `editorial.spec.ts`. No hover zoom either: `ui-product-card` scales on hover because a catalogue wants that affordance, but a single still image being read should not move under the pointer                                                                                                                                                                                                                                                                                                               |
| Integrity (D2)   | Copy states atmosphere and philosophy and asserts nothing factual — no customers, counts, durations, awards, reviews or sustainability claims. `editorial.spec.ts` reuses the M4 fabrication vocabulary (trailing-`\b`, explicit plurals) and adds the claims that usually arrive _with_ a lifestyle photograph: counts, durations, impact and provenance. `app.spec.ts` keeps the page-level guard scoped to `<main>`                                                                                                                                                                                                                                                                                    |
| Verification     | `prettier --check .` clean · `ng build` clean · **Vitest 88/88 pass** (11 files; was 77/77 in 10) · **6 real-browser widths × all M5 assertions PASS** — `#journal` count 1 on a `<section>` inside the component and not a placeholder, region named by its own `h2`, frame ratio `0.80` at every width, frame ≤ 690px, no overflow, caption indent 48px at every width, aside beside the image at 1024/1280/1440 and below it at 360/390/768, image lazy with `fetchpriority` not `high`, 1200×1800 intrinsic, both variants in the `srcset`, no product cards, no tab stops · **M1–M4 regression re-run with the section mounted: ALL PASS** (`hero.mjs`, `m3.mjs`, `m4.mjs`, `refine.mjs`, unchanged) |
| Style budgets    | `editorial` **1,503 B** compiled — the largest component stylesheet on the page and still ~2.6 kB under the 4 kB working limit. Global `styles.scss` 10,449 B, exempt from `anyComponentStyle`. The section reaches the system only through CSS custom properties and the already-shipped `.figure` / `.container` / `.section` classes, which is why it costs what it does rather than more                                                                                                                                                                                                                                                                                                              |
| Bundle           | **190.44 kB raw / 54.86 kB transfer** — against a 500 kB warn / 1 MB error. M4 was 186.46/54.14, so the whole section plus both images cost ~4 kB raw. Shipped imagery is now **1,710,558 B (~1.63 MB)** against the ≤ 3 MB limit in `src/assets/README.md`                                                                                                                                                                                                                                                                                                                                                                                                                                               |

> Three harness bugs found and fixed en route, recorded for the same reason as the M4 pair: each was
> a guard that would have pushed the next milestone toward rewording correct code to satisfy a wrong
> test. First, the caption check measured `captionBox.x - frameBox.x`, which is **0 at every width
> regardless of the CSS** — padding sits inside the border box, so the caption's left edge is flush
> with the image's however large the indent. It now reads computed `padding-inlineStart`. Second,
> the image assertion waited 350 ms after `scrollIntoView()` and so reported `naturalWidth: 0` — a
> lazy-load race, not a broken image. A direct probe confirmed the image loads and decoded at
> **1200×1800**, and the wait is now 1200 ms. Third, and the most instructive: the srcset check
> asserted _filenames_ ("at 2× it must pick the 1200 file") and failed. The code was right. Angular
> prepends `auto` to `sizes`, and Chrome resolves `auto` against the image's real rendered width, so
> the media conditions never drive the choice in Chrome — it picks off the true gutter-adjusted slot
> of **320px** at 360, not the 331 that `92vw` claims. The check now asserts the invariant that
> actually matters, that no viewport/DPR combination is ever served fewer pixels than the slot needs,
> verified across six combinations (densities 1.00–2.00, all ≥ 1).

> `sizes` is retained despite being inert in Chrome, because it is the documented `NgOptimizedImage`
> pattern, it still guides any UA that honours the media conditions rather than `auto`, and removing it
> would be optimising for today's engine instead of the markup.

### Complete — M6 Product Showcase + Brand Story

| Item            | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Anchors         | `<app-brand-story>` **owns `id="about"`** on a real `<section aria-labelledby="about-title">`, and the M1 placeholder is deleted, exactly as M3 did for `#collection` and M5 for `#journal`. `<app-product-showcase>` declares **no** `id` at all — plan §4.4 fixes the approved set at `#collection` / `#journal` / `#about` / `#contact` and it is none of them, so it holds only its `h2` label. `app.spec.ts` asserts one owner per approved anchor, that `#about` is **not** a `.shell-anchor`, and that exactly one `.shell-anchor` remains (the M7 `#contact`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Position        | Both mounted after `<app-editorial>`, so `main > *` now matches plan §7's Hero → Collection → Values → Craft → Editorial → **Showcase → Story**. `app.spec.ts` asserts the full eight-child order plus the document position of each section, so this cannot silently invert                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Showcase shape  | **Not a second card grid.** Featured Collection already introduces all six pieces, so this section presents ONE properly and demotes the other five to a ruled text index. The difference in kind is the point: a grid says "here is everything", a showcase says "here is this one, and it has more to say". The index is a plain `<ul role="list">` of text — the six cards above already link every product name to `#contact`, so five more focusable rows all resolving to the same anchor would be five tab stops for no new destination                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Showcase layout | Frame `4 / 5` (the delivered ratio of every product photograph, so the box reserves real space and never crops) reusing the global `.figure`. Stacked below `48rem`, capped at `min(94%, 22.5rem)` so a 480px phone does not get a near-full-width frame → **image 3 of 6, detail 4 of 6** at `48rem` (**94%** of container) → **image 5 of 12, detail 7 of 11** at `64rem` (**78%** of container), with `position: sticky`, `align-self: start` and `top: calc(var(--header-offset) + var(--space-xl))`. Final M6 refinement tightened all three caps to keep the Showcase dominant without letting the photograph outgrow the text column (see §M6 visual refinement)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `align-self`    | Load-bearing, not decorative. A grid item that stretches to its row height has no travel left, so `position: sticky` on it silently does nothing while still reporting `sticky`. The row is as tall as the detail column (piece + five index rows), which is what gives the frame somewhere to travel. `m6.mjs` proves the travel exists by scrolling to the middle of the detail column and confirming the frame's viewport `y` moved up. **This assertion is necessary but NOT sufficient, and it passes on a broken pin** — see the sticky caveat in §M6 visual refinement: the declared travel is real, but the page's global `overflow-x: hidden` stops the frame from ever sticking                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Sticky scope    | Desktop only, per plan §7: the `48rem` breakpoint introduces the two-column grid **without** it, and `m6.mjs` asserts `position !== 'sticky'` at 360/390/768 so the effect cannot leak down to phones                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Showcase data   | `featured` is `products()[0]` and `rest` is `products().slice(1)` — derived, never declared. No second product list, no `featured: true` flag added to `Product`, no product copied, and the catalogue still arrives via the `products` input so the future API swap stays a change to `app.html`. A hard-coded `'forma-sofa'` would be a second source of truth that renders an empty state the moment the API reorders. Empty catalogue renders one plain sentence and no invented product                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Showcase type   | Heading outline `h2 → h3 → h3`: two siblings at the same level, because the piece and the range are two subsections of the section, not one nested in the other. Nothing below `h3`. The piece name is sized at `--text-h3`, the same as a card name — dominance in this section comes from the photograph, not from type. Prices render from `price` + `currency` through `CurrencyPipe` at `1.0-0`, so a made-to-order catalogue does not quote cents                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Story shape     | Text-only, two columns: a measure of prose on the left against three ruled lines in the display serif on the right. `.prose` (global) carries the measure and paragraph rhythm; `.list-reset` with `role="list"` carries the creed, because stripping markers with CSS alone makes Safari and VoiceOver drop the list semantics. Prose `span 6` from `64rem`, creed `9 / span 4`, leaving columns 7–8 empty                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Story geometry  | Prose `1 / span 6`, creed `9 / span 4` at `64rem` → a ~255px hole at 1440. **Honest note:** this is _not_ a bigger hole than Editorial's — Editorial also leaves two tracks empty (~299px at 1440). Both sections use the same "thing, hole, thing" vocabulary because it is the page's one compositional idea. What differs is everything else: no photograph, no pull-quote, no offset caption, real paragraph breaks against three ruled lines                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Story copy      | Argues the philosophy and stops. No founding date, no location, no team, no customers, no certification, no sustainability figure — the component has **no inputs at all**, so there is no data field such a claim could be rendered from. `brand-story.spec.ts` scans the rendered text for years, percentages, headcounts, email, phone, currency and `founded/established/certified`, and separately asserts it does **not** reuse the Hero's distinctive phrases                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Verification    | `prettier --check .` clean · `ng build` clean (`200.97 kB` raw / `56.69 kB` transfer, no `anyComponentStyle` warning) · **Vitest 128/128 pass** (14 files; was 114/114 in 13 — `final-cta.spec.ts` 7, `site-footer.spec.ts` 9, `app.spec.ts` +2) · **6 real-browser widths × 294 M6 assertions ALL PASS** — `#about` count 1 on a `<section>` inside the component and not a placeholder, **zero** `.shell-anchor` left with `#contact` resolving to the real `<app-final-cta>` section, frame ratio `0.80` at every width, frame ≤ 0.63 viewport-heights, sticky declared and its scroll travel confirmed at 1024/1280/1440 and absent below `64rem`, frame a genuine step up from the Editorial photograph (293/368/415 vs 278/349/393), all six products accounted for exactly once with the dominant piece equal to the collection's first, five index rows adding no tab stops, zero images and zero forms in Brand Story · **M1–M6 regression re-run with all sections mounted: PASS** (`hero.mjs`, `m3.mjs`, `m4.mjs`, `m6.mjs`, `refine.mjs` green; `m5.mjs` green except one **pre-existing image-density metric mismatch** at 360px — see §M6 visual refinement) |
| Regression note | `m4.mjs` asserted "`#about` is still owned by the M1 placeholder", which M6 legitimately invalidates. Updated in the same change to assert one owner that is **not** a placeholder and **is** inside `<app-brand-story>` — the invariant is kept, only its expected owner moves. M1–M5 also re-verified against the production build in `dist/nova/browser` served statically                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

### M6 visual refinement

A final spacing pass on the two M6 sections. Only two files changed —
`product-showcase.scss` and `brand-story.scss`. No template, no TS, no spec, no data, no asset,
no copy, and no transform. Hero, Featured Collection, all product assets/data/crops, Brand Values,
Craft & Process, Journal, Header/nav, favicon and wordmark were frozen, as was M1–M5 functionality.

| Change                 | Rule                                                                                                                                         | Before → after                                                                                                                              |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Journal → Showcase gap | `.section.showcase` `padding-block-start` drops from `var(--section-y)` to `calc(var(--section-y) * 0.35)`                                   | 164→122 (360), 163→122 (390), 223→162 (768), 264→190 (1024), 304→217 (1280), 330→234 (1440)                                                 |
| Showcase frame         | caps `min(94%, 22.5rem)` base, **94%** at `48rem`, **78%** at `64rem` (was `min(100%, 24rem)` / `84%`)                                       | 305×381→287×358 (360), 335×419→315×394 (390), 338×422→317×397 (768), 315×394→293×366 (1024), 397×496→368×460 (1280), 447×559→415×519 (1440) |
| Index rows             | `.showcase__index-row` padding `space-xs` (12px) → `space-2xs` (8px); **explicit `grid-row: 1; grid-column: 2` on `.showcase__index-price`** | five rows, total 570→380, each 114→76, piece-to-range gap ~64→48                                                                            |
| Showcase detail        | `gap` `space-2xl` (64px) → `space-xl` (48px)                                                                                                 | —                                                                                                                                           |
| Brand Story padding    | `.section.story` `padding-block` → `calc(var(--section-y) * 0.75)`                                                                           | section height 1452→1388 (360), 1368→1304 (390), 970→907 (768), 1023→950 (1024), 988→905 (1280), 929→840 (1440)                             |
| Brand Story spread     | `.story__spread` margin and row gap `space-2xl` (64px) → `space-xl` (48px)                                                                   | head→prose 166→150 (360), 166→150 (390)                                                                                                     |

**Index-row spacing was a layout bug, not just density.** The category cell spans `grid-column: 1 / -1`,
so in source order (name, category, price) the price was auto-placed onto an implicit **third** grid row.
That phantom row was most of the apparent excess. Pinning the price to `row 1 / column 2` restores the
intended two-column row and is why the total falls 190px rather than the ~66px the padding change alone
accounts for. Data, row order, product names, categories, prices, focus behaviour and the name-price
hierarchy are all unchanged; verified at all six widths.

Verified unchanged: Hero and Hero frame, Editorial frame and collection card widths (byte-identical
before/after at all six widths), Brand Story copy and its three creed statements, `transform: none`
on the frame at every width, and no horizontal overflow at any width. The Showcase frame remains a
genuine step up from the Editorial photograph — 293/368/415 vs 278/349/393 at 1024/1280/1440 — so the
section still reads as the visual peak. At 768 the Editorial frame is ~29px larger (317 vs 346); that
inversion predates this refinement and was already present before it.

**Known caveat — `position: sticky` is declared but does not actually pin.** The computed style is
`sticky`, `align-self: start` is correct, and the travel is real (1280: frame 368×460 in a 671px detail
column → 211px of travel; 1440: 415×519 → 152px; offset 128px; frame+offset 588px < 720px and
647px < 900px). But `html` and `body` both set `overflow-x: hidden` in `_reset.scss` (lines 27 and 36),
which makes `body` the nearest scrolling ancestor rather than the viewport, and a sticky element
inside a non-scrolling scrollport never sticks. Measured frame `top` runs 128 → 78 → 28 → −22 → −72
across the scroll — it moves, it never clamps at 128. Forcing `overflow: visible` live makes it pin at
exactly 128px, confirming the mechanism. This is **pre-existing, in a global reset, and outside the
four-edit scope**; it is recorded rather than fixed. Both `m6.mjs` and the `align-self` note above pass
on this layout, which is why the caveat is documented here instead.

**One residual in `m5.mjs`, not a regression.** At 360px it reports the Editorial image "served at least
the pixels it needs" as `density 2.52` against a `2.50` cap. The harness divides the served intrinsic
width by `slot × devicePixelRatio`, but the browser selects a candidate from `sizes`, and this page's
`sizes` is `(min-width: 64rem) 31vw, (min-width: 48rem) 46vw, 76vw` → `76vw` = 274px, at an effective DPR
of 1.25 (Windows 125% scale) = 342px, so 640px is the correct next candidate from the two-entry
`640w, 1200w` set — density 1.87 on the basis the browser actually used. The threshold was **not**
loosened; the inputs are provably untouched by this refinement (the Editorial slot is byte-identical
before/after and `editorial.html`/`editorial.scss` were never opened), and only two files in the whole
repo carry a modification time from this session.

### M7 — Final CTA + Footer (BUILT)

The last section, and the end of the page. Two decisions are worth recording because they diverge from
the literal plan text:

| Question             | Decision                                                                                                                                | Why                                                                                                                                                 |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Is the footer inert? | **No.** `<site-footer>` lost `inert` alongside the Final CTA's arrival, and the header menu again gates `main` + `site-footer` together | The footer is the end of the document; hiding it behind the header's mobile menu trapped keyboard users at the page bottom with no visible way back |
| Social placeholders? | **Not built.** The plan §M7 lists "social placeholders"; the M7 brief forbids inventing accounts and dead controls                      | Four `aria-disabled` links would be a lie and a keyboard trap. `site-footer.spec.ts` asserts none exist. D4's _no invented details_ wins            |

**Final CTA** (`src/app/sections/final-cta/`) owns `id="contact"` on a real
`<section aria-labelledby="contact-title">`, closing `main`. Restrained deliberately: a single centred
`.section--invert` band, an eyebrow, one `h2`, one sentence, and exactly **one** action
(`Explore the Collection` → `#collection`). There is no contact mechanism at all — D4 forbids a
`mailto:`, form, or invented address, so the band is an argument to browse, not a way to get in touch.
Padding is `calc(var(--section-y) * 0.6)` rather than a full section, so it reads as a closing note
instead of competing with Brand Story. `ui-section-heading` is deliberately **not** used: it aligns the
eyebrow to the start edge, which fights the centred composition.

**Footer** becomes the real `<footer>` landmark inside `<site-footer>`: wordmark → `#top`, a nav named
`Footer` carrying the four approved anchors, copyright, and the fictional-brand disclosure verbatim.
Its top margin was removed so the CTA→footer transition is the footer's own top rule — with both
margins the gap was 109px at 1280px wide. Layout is one column below `48rem`, wordmark/nav split above.
`#top` is **owned by the `site-header` host** (`host: { id: 'top' }`); M7 briefly added `id="top"` to
`<body>` and the document-wide duplicate-id check caught it before it shipped. That check is now
permanent in `app.spec.ts`.

`src/app/app.scss` lost its `.shell-anchor` rules in M7 — they styled a class that no longer exists, and
`app.spec.ts` asserts the count is zero, so the dead CSS could not hide a regression.

**Measured** (`m7.mjs`, 360/390/768/1024/1280/1440 + 1280×720 and 1440×900 review viewports; no
horizontal overflow at any width):

| Width | CTA band | CTA pad | `h2` | Button | Footer | Footer link rows  |
| ----- | -------- | ------- | ---- | ------ | ------ | ----------------- |
| 360   | 335px    | 38px    | 36px | 266×50 | 338px  | 2 (Contact wraps) |
| 390   | 336px    | 38px    | 36px | 266×50 | 338px  | 2 (Contact wraps) |
| 768   | 361px    | 56px    | 49px | 266×50 | 262px  | 1                 |
| 1024  | 398px    | 68px    | 57px | 266×50 | 226px  | 1                 |
| 1280  | 430px    | 81px    | 64px | 266×50 | 226px  | 1                 |
| 1440  | 445px    | 88px    | 64px | 266×50 | 226px  | 1                 |

The `h2` stays on **one line at every width** and the lede reflows 3 → 2 lines at `48rem`, so the band
never orphans a word. At 1280×720 the band is 59.7% of viewport height — the largest single element on
the page, which is the intended closing emphasis. Brand Story → CTA whitespace is 86px on mobile
rising to 199px at 1440px; that is `--space-*` plus the CTA's own padding, deliberately short of a
full section break.

**Accessibility** (`m7-a11y.mjs`, computed contrast + focus traversal + outline audit): all CTA and
footer pairs clear AA with margin — CTA eyebrow 8.46:1, `h2` 16.45:1, lede 8.87:1, button label 16.45:1,
footer wordmark 14.55:1, footer links and copyright 7.58:1, and the disclosure **4.66:1**, which lands
just above the 4.5:1 requirement rather than relying on luck. One `h1`, no heading-level skips, one
`main`, one Primary nav and one separately-named Footer nav, no unnamed anchored sections, one CTA tab
stop and five in the footer, every probed focus indicator visible.

**Verification:** `prettier --check .` clean · `ng build` clean (`200.97 kB` raw / `56.69 kB` transfer,
no budget warning) · **Vitest 128/128** across 14 files (`final-cta.spec.ts` 7 new,
`site-footer.spec.ts` 9, `app.spec.ts` +2) · component styles `final-cta` **412 B** and `site-footer`
**1246 B**, far under the 4 kB warn / 8 kB error · **M1–M6 regression re-run with every section
mounted: PASS** — `hero.mjs`, `m3.mjs`, `m4.mjs`, `m6.mjs`, `refine.mjs`, `m7.mjs` and `m7-a11y.mjs` all
exit 0, with `m5.mjs` carrying only the pre-existing density residual documented above.

Two regressions in `hero.mjs` and `m6.mjs` were **expectations that had gone stale**, not product
defects, and both are documented in those harnesses: `hero.mjs` asserted exactly one `<nav>` on the page
(M7 legitimately adds a Footer nav), and `m6.mjs` asserted exactly one remaining `.shell-anchor` (M7
deletes the last one). Neither was weakened — both now assert the stronger, more specific truth.

### Done - M8 Motion

Purposeful motion only, and strictly progressive: the base state of every element is visible, and the
reveal system only ever _adds_ animation. M8 added **one** shared directive, not a family of them —
`_motion.scss` already carried the whole CSS contract and referenced a `shared/directives/reveal.ts`
that did not exist, so the directive and its coordinator fill that gap rather than inventing a second
mechanism. The unused `.curtain` and `.menu-enter` rules it referenced were removed.

| Area           | What shipped                                                                                                                                                                                                                                                                             | Measured                      |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Reveal         | `Reveal` (`[novaReveal]`, `novaReveal="image"`, `[novaRevealIndex]`) over 24 elements: section headings, six collection cards, two three-item staggers, two editorial images, two asides/detail columns, the creed and the CTA block                                                     | `m8.mjs` 71/71                |
| Coordinator    | `RevealCoordinator` — one root `IntersectionObserver` for the whole app, `threshold: 0`, **positive** bottom margin, reduced-motion flush on mid-session change, `DestroyRef` teardown                                                                                                   | `reveal.spec.ts`              |
| Hero           | Untouched. No reveal, `opacity: 1`, no transform on load. No parallax, no scale change                                                                                                                                                                                                   | `m8.mjs`                      |
| Images         | Image reveal sits on the `<img>` inside the `overflow: hidden` `.figure`, never on the frame. `scale(1.04)` is cropped by the frame, so approved dimensions and intrinsic sizes are unchanged and no image asset was touched                                                             | `m8.mjs` layout-shift section |
| Reduced motion | Refuses to arm; durations collapse to 0.01 ms; `scroll-behavior: auto`; `.reveal` forced visible. Nothing is ever left faded out, before or after a scroll                                                                                                                               | `m8.mjs` §1                   |
| Interaction    | CTA only: `translateY(-1px)` on hover (inside `@media (hover: hover)`), `translateY(0)` on press, 150 ms. No `scale()` — a growing button reads as a tappable widget, the SaaS register the page is written against. Nav links, product cards and the menu keep their existing behaviour | `m8.mjs` §7–8                 |
| Mobile menu    | No close transition added. `menuOpen` flips immediately, which is what releases `inert`, restores focus and dismisses the panel; holding the panel for an exit animation would leave a keyboard user's focus outside an on-screen subtree                                                | `m8.mjs` §8                   |
| Composition    | No section moved in document coordinates, document height identical (9140 → 9140), all 9 images decoded, no horizontal overflow at 360/390/768/1024/1280/1440 mid-animation _and_ after, plus 1280×720 and 1440×900                                                                      | `m8.mjs` §4–6                 |
| Regressions    | m3 169 · m4 181 · m5 204 · m6 300 · m7 181 · m7-a11y 21 — **1056 checks, 0 failures**; 142 unit tests                                                                                                                                                                                    | —                             |

**M8 timing was revised after first-pass review.** The initial values read as a flicker rather than a
reveal, so the durations were slowed and given their own easing curve rather than borrowing the
interaction curve. `--duration-reveal` 600 → **850 ms**, images **950 ms** (they read faster than text
at equal duration, so they get the longer tail), stagger **120 ms** for a 3-step maximum of 240 ms.
`--ease-reveal: cubic-bezier(0.4, 0, 0.2, 1)` was added for the motion specifically; `--ease-out` and
`--ease-in-out` were left untouched so no existing transition changed. Measured in-browser:
`m8-timing.mjs` confirmed 0.85 s / 0.95 s, stagger 0 / 0.12 / 0.24 s, `scale(1.04)` unchanged, and
opacity visibly mid-transition. The final M8 gate: `prettier --check` clean · `npm run build`
204.23 kB raw / 57.47 kB transfer · **142/142 unit tests** · `m8.mjs` 71/71 · **1564 individual
assertions, 0 failures**, across hero, m3–m8, refine and m9.

Counting note, because the two conventions disagree by ten. Each harness prints one `PASS` line per
assertion **plus** an end-of-run `ALL CHECKS PASSED` banner, so the ten scripts emit 1574 `PASS`
lines for 1564 real assertions. Earlier drafts of this file quoted 1573 — a mixed convention that
counted the nine regression banners but not m9's. The assertion count is **1564**.

Two **product** defects were found by `m8.mjs` and fixed, both of the "content invisible" class:

1. `.reveal--image` and `data-reveal-index` were written **unconditionally** while only `.reveal` was
   conditional, and the stylesheet selected `.reveal--image:not(.is-revealed)` without requiring
   `.reveal`. Reduced-motion visitors got two editorial photographs pinned at `opacity: 0`, with no
   rule able to restore them. Every host binding is now gated on `armed()`, and the CSS requires
   `.reveal` in the image selector — defended at both the layer that writes state and the one that
   reads it.
2. The negative `rootMargin` described above stranded 9 of 24 reveals permanently.

Two **harness** defects were also fixed, and neither was a page defect: `m3`–`m6` defaulted to port
8099 (they take the URL as `argv[2]`, and all four are green against 4200), and the smooth-scroll
settling in `m8.mjs`/`m7-a11y.mjs` measured mid-animation. `m7-a11y.mjs` also proved to be
input-modality dependent: it walked focus with `next.focus()`, and Chrome correctly withholds
`:focus-visible` from script-driven focus, so the ring only appeared when a keyboard-driving harness
happened to run first. It now primes keyboard modality with a real Tab event.

`m4.mjs` asserted that Brand Values and Craft & Process declare _no_ motion at all — true before M8 and
obsolete after it, since M8 gave both a reveal. The assertion was **restated, not removed**: motion in
those sections must come from the shared `.reveal` and animate only `opacity`/`transform`, which is the
property the original check existed to protect. No existing test was weakened.

### Complete - M9 Hardening

Not another design milestone. Every M0–M8 visual decision was treated as frozen; M9 only fixed things
that were genuinely broken or missing. One new in-browser audit, `m9.mjs`, covers twelve areas —
metadata, social assets, landmarks, heading order, ids, images, control names, focus, contrast,
responsive, performance, and the deployable output — **98 checks, 0 failures**.

Four real defects were found and fixed. None of them is a redesign:

1. **The site header exposed no `banner` landmark.** `<site-header>` is a custom element, so it carried
   no implicit role, and its inner `<div class="bar">` is not a landmark either — so `<main>` and
   `<footer>` were both reachable but the header was not. `site-footer` already used a native
   `<footer>`, which is what made this an asymmetry rather than a decision. Fixed by changing that
   `div` to a native `<header>`, not by adding `role="banner"`, per the native-semantics rule. No CSS
   depended on the element name: `.bar` is styled by class, and the only element selector in the file
   is `.menu-trigger__bars > span`.
2. **`og:image` was a 404.** `src/index.html` pointed at `/og-image.jpg`, which did not exist, while its
   own comment flagged the card as M9 work. `public/og-image.jpg` is now a real 1200×630 card, generated
   from the approved tokens (`--nova-night` field, `--nova-bone` tracked Archivo wordmark at wght 600,
   `--nova-clay-night` eyebrow and rule, `--nova-bone-dim` tagline) and the project's own variable
   fonts, so it cannot drift from the site's palette or typography. Copy is **verbatim** from the
   already-approved `og:description`, so nothing new is claimed about a fictional brand. 46 kB, RGB,
   4:4:4 subsampled. `og:image:width` / `:height` / `:alt` and `twitter:image` / `twitter:image:alt`
   were added so a scraper can lay the card out without decoding it first.
3. **Six pointer targets were under the WCAG 2.5.8 AA floor of 24×24.** Both wordmarks (20 px and
   18 px) and the four footer links (16 px). Padding would have been the obvious fix and the wrong one:
   the header wordmark is a flex item and the footer links sit in a wrapping flex list, so padding would
   have reflowed rows and moved the design. Each link instead grows its hit area with a transparent,
   absolutely positioned `::after`, which extends the region that dispatches clicks with **no layout
   effect at all**. `.footer__list` keeps its `--space-sm` row pitch and the footer does not move; the
   audit asserts both zero layout shift and that no two expanded targets claim the same pixel.
4. **Dev documentation was shipping to production.** The `src/assets` glob copied `**/*` into `/assets`,
   so `src/assets/README.md` was deployed. Added `README.md` to that glob's `ignore` list — narrowly,
   so the two `*-OFL.txt` licence files still ship, because the font licence requires distribution
   alongside the fonts.

Two suspected problems were investigated and dismissed as **not** defects, which is why four fixes
rather than six:

- **`decoding="sync"` on the Hero.** Not a bug. `NgOptimizedImage.getDecoding()` returns `sync` for any
  image marked `priority` and returns _before_ consulting the input (`common.mjs:904`), so this is a
  deliberate framework default for the LCP element and is not overridable. Asserting `async` would have
  been fighting Angular over a non-issue.
- **The 145-character Hero `alt`.** WCAG 1.1.1 sets no length limit, and the text accurately describes
  a detailed interior photograph. An arbitrary character cap was removed rather than the alt text
  shortened to satisfy it.

Five harness defects were also fixed — every one of which would have produced a false failure:
`renderedW > 0` was being used as a proxy for "in the viewport" (a lazy image reserves its box from
`width`/`height`, so it reports a width before it has ever loaded); the fast rAF scroll in the CLS
measurement outran lazy loading, so decode was sampled while requests were still in flight; contrast
was judged against an assumed white background instead of the resolved ancestor; the request count was
asserted against the **dev** server, where each module is a separate request and the count says nothing
about the deployed page; and a `document` reference leaked into Node scope and crashed the run.

**Resolved in M10 — the placeholder is gone.** `canonical`, `og:url`, `og:image` and `twitter:image`
previously pointed at `https://nova.example.com/`, an RFC 2606 reserved placeholder, on the grounds
that inventing a domain would be fabrication. That reasoning was right at the time and wrong now,
because a real production origin **does** exist and is confirmed three ways: the project name
`nova-furniture` in `.github/workflows/deploy.yml` and `package.json`, the same name in the
`README.md` deployment table, and `https://nova-furniture.pages.dev/` serving the built app. All four
tags now use that origin, with `og:image` pointing at
`https://nova-furniture.pages.dev/og-image.jpg`. There is no custom domain, so the Pages host is the
canonical one — not a temporary value waiting to be replaced.

**The deployed build still predates this.** `public/_redirects` serves `index.html` for unmatched
paths, so on the live site `/og-image.jpg` answers **HTTP 200 with `Content-Type: text/html`** — a
missing asset that looks like a present one. Check `Content-Type`, not the status code. The corrected
metadata and the card reach production only on the next `npm run deploy`.

**Deploy artifact** (`dist/nova/browser`): 23 files, 2.07 MiB, largest file 242.9 kB — comfortably
inside Cloudflare's 20,000-file and 25 MiB-per-file limits. Component stylesheet budgets measured by
compiling each `.scss`: largest is `site-header.scss` at **3.44 kB**, under the 4 kB warning; the
global layer is 12.04 kB and exempt from `anyComponentStyle`. All 13 components are green.

### M10 — documentation & case study

Delivered. `docs/CASE_STUDY.md` is the portfolio write-up; `README.md` gained a Motion section and
had three stale claims corrected; `IMPLEMENTATION_PLAN.md` and this map had verification claims that
had been pre-marked ✅ without the work behind them rewritten to match what was actually measured.

Corrections worth recording, because each was a claim a reader could have relied on:

| Claim                                       | Reality                                                                         |
| ------------------------------------------- | ------------------------------------------------------------------------------- |
| "AXE: **zero** serious/critical violations" | **No AXE scan was ever run.** D5 defers `axe-core`; baseline is manual + CDP    |
| "All interactive targets ≥44×44px"          | 44×44 on trigger and CTAs; 24–26px elsewhere. **24×24 is the AA floor** (2.5.8) |
| "Screenshots captured at six widths"        | Captured to a working directory; **none committed**. 320px reflow re-verified   |
| "Collection cards carry `srcset`"           | They ship **one width each**; only Hero and Editorial have `srcset`             |
| `~201 kB raw / ~57 kB transfer`             | **204.23 kB raw / 57.47 kB transfer**                                           |
| `--nova-bone` on `--nova-night` ~15.5:1     | **16.45:1** (recomputed from the shipped token values)                          |
| `--nova-ink` on `--nova-paper` ~15.9:1      | **16.05:1**                                                                     |
| `nova.example.com` absolute URLs            | **https://nova-furniture.pages.dev/**                                           |
| M10 checkmarks (case study, etc.)           | `docs/` did not exist when they were written; delivered properly this pass      |

Contrast ratios were recomputed from `src/styles/_tokens.scss` rather than trusted: all eight §21.3
pairs check out, and the tightest shipping pair is `--nova-muted` on `--nova-paper-alt` at
**4.66:1** (the footer disclosure).

### Not started

**M11 (optional)** — `vitest-axe` / `axe-core` as a dev dependency. Requires explicit approval, since
it is the one thing in the plan that adds a dependency. Nothing else is outstanding.

### Explicitly out of scope

Authentication · registration · cart · checkout · payments · admin dashboard · order management ·
user dashboard · CMS · backend · database · ASP.NET Core API · state-management library ·
animation library · UI component library · automated a11y tooling (deferred by D5).

Product data is modelled so a future ASP.NET Core API can be attached **without changing any
template** — that is the only forward-looking concession.
