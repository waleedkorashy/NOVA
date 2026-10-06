# NOVA — Implementation Plan

Status: **planning only.** No application code has been modified.
Author role: Staff Software Engineer / Tech Lead.
Companion doc: [`PROJECT_MAP.md`](./PROJECT_MAP.md) · Agent rules: [`AGENTS.md`](./AGENTS.md)

---

## 0. Executive summary

NOVA is a single-page marketing site for a fictional premium furniture brand. The technical
risk is not the Angular code — it is the **8 kB `anyComponentStyle` production budget** meeting a
visually rich editorial page. Everything below is shaped by one finding: that budget measures the
**compiled** CSS of each component's style entry point, so the fix is not "write smaller component
styles" but **move shared styling into the global stylesheet**, which is not subject to that budget
at all.

Expected outcome: a 12-component landing page, **zero runtime dependencies added**, **no router**
(D1), **no testimonials** (D2), two self-hosted variable fonts, and a production bundle that stays
well inside the existing `initial` budget without touching `angular.json`.

**Status: approved.** D1–D4 are settled decisions, not open questions. The accent-frequency cap has
been replaced with a restraint-and-intent guideline (§6.1). M0 — Foundations is next, on explicit
instruction; M1 has not started.

---

## 1. Requirements reconciled with the repository

| Requirement                           | Repo reality                                                  | Resolution                                                         |
| ------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------ |
| Standalone Angular 22, zoneless, SCSS | Already true (`zone.js` absent)                               | Preserve. Signals for all interactive state.                       |
| No UI library                         | Only Angular + rxjs + tslib                                   | Add nothing.                                                       |
| No backend                            | None exists                                                   | Static typed data module only.                                     |
| Rich editorial styling                | `anyComponentStyle` 4 kB warn / **8 kB error**                | Global-first styling strategy (§5). Budget untouched.              |
| Responsive 360→1440+                  | Nothing built yet                                             | Mobile-first, fluid type, 5 breakpoints (§8).                      |
| Landing page only                     | `app.routes.ts` is `[]`, `App` renders only `<router-outlet>` | **Approved (D1):** remove the router in M1; semantic anchors (§4). |
| Product data API-ready later          | No data layer                                                 | Typed `Product` interface + const array (§4).                      |
| Portfolio integrity                   | N/A                                                           | Fictional disclosure in footer + README + case study (§14).        |

### Approved decisions

All decisions below were reviewed and **approved**. D1 and D2 are settled and are no longer
questions; D5 remains optional and deferred.

| #      | Decision                                           | Outcome                                                                                                                                                                                                                                                                                                                                                                                               | Executed in |
| ------ | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| **D1** | Remove `@angular/router` and `<router-outlet>`?    | **APPROVED — remove.** This is a single-page landing page and does not need Angular routing. Navigation uses semantic in-page anchors (`#collection`, `#about`, `#journal`, `#contact`). Keep the architecture simple. If NOVA becomes a multi-page application later, routing is introduced as a **separate change**.                                                                                | **M1**      |
| **D2** | Include a Testimonials section?                    | **APPROVED — omit.** No testimonials, reviews, ratings, star ratings, customer counts, press logos, or fabricated social proof of any kind. Replaced by **Craft & Process**, which communicates the fictional design/craft philosophy through specific visual storytelling — materials, craftsmanship, construction, design process. Fictional claims must never be presented as real-world evidence. | **M4**      |
| **D3** | Currency for fictional prices                      | **APPROVED — EUR**, rendered via the built-in `CurrencyPipe`, with the currency carried on the data object so a future API can vary it.                                                                                                                                                                                                                                                               | M3          |
| **D4** | Contact link in footer                             | **APPROVED — inert placeholder.** No `mailto:`, no invented contact details. Clearly non-functional (`aria-disabled`) so it is never mistaken for a working channel.                                                                                                                                                                                                                                  | M7          |
| **D5** | Add `vitest-axe` / `axe-core` as a dev dependency? | **Deferred / optional.** It adds a dependency, so it is not part of the approved foundation. Manual keyboard + screen-reader review is the baseline for M9.                                                                                                                                                                                                                                           | M11 (opt.)  |

> **D1 sequencing note.** Router removal touches `app.config.ts`, `app.ts`, `app.routes.ts`, and
> `package.json` — application structure, not the M0 foundation (tokens, global SCSS, fonts). It is
> therefore **the first action of M1**, not of M0. `@angular/router` remains in `package.json` until
> M1 begins.

> **D2 integrity note.** The "no fabricated social proof" rule is a hard acceptance criterion, not a
> preference. M4's success criterion greps the rendered DOM for ratings, star counts, customer counts,
> and press logos.

---

## 2. Assumptions

1. NOVA's copy, product names, and prices are **invented** and plausible but make no real-world claim
   (no "since 1974", no "10,000 homes", no certification badges).
2. English-only, `lang="en"`, EUR, metric.
3. Single route, single page. Nav items are **in-page anchors**, not routes.
4. Photography depicts interiors/objects. Avoid identifiable faces posing as endorsers — Unsplash
   carries no model/property release warranty.
5. `npm` is the package manager. Node 24.x on Cloudflare Pages.
6. The 8 kB budget is a real architectural constraint, not a number to raise.

---

## 3. Technology decisions

| Concern          | Decision                                                         | Rationale                                                                                    |
| ---------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Framework        | Angular 22.2 standalone, zoneless                                | Already established; matches brief.                                                          |
| Styling          | Plain SCSS + CSS custom properties                               | Tokens resolve at runtime, so component SCSS stays tiny. No CSS-in-JS, no utility framework. |
| Routing          | **None** (D1)                                                    | Zero value on one page; native anchors + `scroll-behavior` are simpler and more robust.      |
| State            | Local `signal()` per component                                   | No global store, no service, no library.                                                     |
| Data             | Typed const module                                               | Trivially swappable for an HTTP call later.                                                  |
| Animations       | CSS transitions/keyframes + one `IntersectionObserver` directive | No library.                                                                                  |
| Images           | `NgOptimizedImage` over imported assets                          | Build-time `srcset` generation, LCP hints, lazy loading.                                     |
| Fonts            | 2 self-hosted variable woff2                                     | No external request, no npm dep.                                                             |
| New runtime deps | **Zero**                                                         | Brief constraint.                                                                            |

---

## 4. Architecture

### 4.1 Folder structure (planned)

```
src/
├── index.html                     # meta, OG, font preload, JSON-LD-free by design
├── main.ts                        # unchanged
├── styles.scss                    # single global entry -> @use partials below
├── styles/
│   ├── _reset.scss                # modern reset
│   ├── _tokens.scss               # colour / type / space / motion custom properties
│   ├── _typography.scss           # base type, fluid scale, measure
│   ├── _layout.scss               # .container, .grid-12, .stack, .cluster
│   ├── _components.scss           # .btn, .eyebrow, .rule, .link-underline (SHARED)
│   ├── _motion.scss               # keyframes, reveal states, reduced-motion
│   └── _utilities.scss            # visually-hidden, no-overflow, etc.
├── assets/
│   ├── fonts/                     # 2 woff2 + OFL licence files
│   └── images/                    # optimised webp, imported (not public/)
└── app/
    ├── app.ts|html|scss|spec.ts   # shell: skip-link, header, main, footer
    ├── app.config.ts              # router removed (D1)
    ├── app.routes.ts              # DELETED (D1)
    ├── layout/
    │   ├── site-header/           # wordmark, nav, mobile menu (signal-driven)
    │   └── site-footer/
    ├── sections/                  # one component per page section
    │   ├── hero/
    │   ├── featured-collection/
    │   ├── brand-values/
    │   ├── craft-process/         # replaces Testimonials (D2)
    │   ├── editorial/
    │   ├── product-showcase/
    │   ├── brand-story/
    │   └── final-cta/
    ├── ui/                        # genuinely reused primitives
    │   ├── button/                # variant: 'primary' | 'secondary'
    │   ├── product-card/
    │   └── section-heading/       # eyebrow + title, used by 6 sections
    └── shared/
        ├── types/product.ts
        ├── data/products.ts       # typed const array
        └── directives/reveal.ts   # IntersectionObserver scroll reveal
```

### 4.2 Why no `pages/` folder

With one page and no router, a `pages/landing/` wrapper adds a layer that indirection does not
justify. `App` composes `site-header` + sections + `site-footer` directly. This is the
"prefer the simplest maintainable solution" call.

### 4.3 Data model (API-ready)

```ts
// shared/types/product.ts
export interface ProductImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  summary: string;
  materials?: readonly string[];
  image: ProductImage;
}

export const PRODUCTS: readonly Product[] = [/* 6 items */];
```

Mirrors a plausible ASP.NET Core response shape, so a future swap is
`http.get<Product[]>('/api/products')` with no template change. Note
`noPropertyAccessFromIndexSignature` is on — index access, not dot access, on index signatures.

### 4.4 Navigation anchor map (D1)

With the router removed, navigation is native in-page anchors. `scroll-behavior: smooth` plus
`scroll-margin-top` on each section keeps the sticky header from covering the target.

| Nav item   | Anchor        | Target element              | Rationale                                                           |
| ---------- | ------------- | --------------------------- | ------------------------------------------------------------------- |
| Collection | `#collection` | `<app-featured-collection>` | The commercial centrepiece; primary CTA target.                     |
| About      | `#about`      | `<app-brand-story>`         | Brand philosophy — the natural "about NOVA" anchor.                 |
| Journal    | `#journal`    | `<app-editorial>`           | **No dedicated Journal section is planned** — see assumption below. |
| Contact    | `#contact`    | `<app-final-cta>`           | Closes the journey as the point of enquiry. **No form, no email.**  |
| CTA button | `#collection` | "Explore the Collection"    | Same target as Collection, reinforcing the single primary CTA.      |

> **Journal mapping — CONFIRMED.** The brief specifies a _Journal_ nav item but the section list
> contains no Journal section, and **no new section will be created for navigation's sake.** The
> existing `app-editorial` component keeps its name and role and carries `id="journal"`; the nav label
> stays "Journal". The approved 12-component architecture is unchanged. `app-editorial` is the page's
> most editorial, image-led content, so it reads naturally as journal material. This is the only
> place where the nav labels and the section components do not line up 1:1, by design.

**Anchor mapping verification (all four confirmed to target existing planned sections):**

| Anchor        | Host element                | Exists as | Component count impact |
| ------------- | --------------------------- | --------- | ---------------------- |
| `#collection` | `<app-featured-collection>` | §7        | none — existing        |
| `#about`      | `<app-brand-story>`         | §7        | none — existing        |
| `#journal`    | `<app-editorial>`           | §7        | none — existing        |
| `#contact`    | `<app-final-cta>`           | §7        | none — existing        |

All four anchors land on components already in the approved architecture. No section is added, and the
count stays at 12.

Anchors are `id` attributes on the section host elements, not routes. With no router there is no
fragment handling to configure and no `RouterOutlet` to render into.

---

## 5. Styling architecture — the 8 kB constraint

### 5.1 The verified mechanic

From `node_modules/@angular/build/src/tools/esbuild/budget-stats.js`, component CSS is emitted as a
separate metafile output tagged `ng-component`, recorded with `size: entry.bytes` (its **compiled**
CSS) and labelled with the component's **input** `.scss` path. `AnyComponentStyleCalculator`
(`utils/bundle-calculator.js:230`) selects every asset flagged `componentStyle`.

Two consequences:

1. **A component's 200-byte `.scss` that `@use`s a 10 kB partial produces ~10 kB of compiled CSS and
   fails the 8 kB limit.** `@use` does not launder bytes into a shared bucket.
2. **The global `styles.scss` is not tagged `ng-component`**, so it is excluded from
   `anyComponentStyle` entirely and is only measured against the `initial` budget (500 kB warn /
   1 MB error) — roughly **125× more headroom**.

### 5.2 The rule

> Shared and reusable styling lives in `src/styles.scss` and its partials.
> A component `.scss` may contain **only** what is genuinely local to that component.

No component `.scss` may `@use` a shared partial. Components consume the system through CSS custom
properties (inherited at runtime, zero compiled cost) and global classes (already shipped).

### 5.3 Sizing targets

| Layer                    | Content                                              | Target            | Hard ceiling                             |
| ------------------------ | ---------------------------------------------------- | ----------------- | ---------------------------------------- |
| `styles.scss` + partials | reset, tokens, type, layout, shared patterns, motion | 20–35 kB compiled | 200 kB (`initial` budget)                |
| Section component        | own grid placement, own spacing, own image treatment | 0.8–2 kB          | **4 kB** (warn threshold = early signal) |
| `ui/*` component         | component-local only                                 | 0.3–1 kB          | 4 kB                                     |

**Treat the 4 kB warning as the working limit.** Crossing it during review means refactor to the
global layer, not a budget bump.

### 5.4 Typography as the main budget defence

Fluid type via `clamp()` in `_typography.scss` means most responsive type work happens **once** in the
global layer instead of in six component stylesheets. Same for spacing scale, container, and the
12-column grid — one implementation, reused everywhere.

### 5.5 If the budget ever must change

Not as a first move. If, after the global-first refactor, a single component still cannot fit
genuinely local styles in 8 kB, the correct response is to split the component. Only if the
_architecture_ is demonstrably at fault should `angular.json` change — and then with a written
justification, reviewed as a deliberate decision.

---

## 6. Design system

### 6.1 Colour

Near-monochrome warm neutral + one restrained clay accent. No gradients, no glass, no shadows.

| Token              | Value     | Use                                   | Contrast on paper |
| ------------------ | --------- | ------------------------------------- | ----------------- |
| `--nova-paper`     | `#F3F0EA` | Page background (warm bone)           | —                 |
| `--nova-paper-alt` | `#EAE5DC` | Secondary surface / alternating band  | —                 |
| `--nova-ink`       | `#17150F` | Primary text                          | 16.05:1           |
| `--nova-ink-soft`  | `#4A453D` | Body / secondary text                 | 8.36:1            |
| `--nova-muted`     | `#6B6459` | Meta, captions, eyebrows              | 5.14:1            |
| `--nova-line`      | `#D8D1C5` | Hairline rules, borders               | decorative only   |
| `--nova-clay`      | `#8F4E2E` | Single accent — links, focus, one CTA | 5.60:1            |
| `--nova-night`     | `#14120E` | Inverted section background           | —                 |
| `--nova-bone`      | `#F3F0EA` | Text on `--nova-night`                | 16.45:1           |

Every ratio above is computed from the shipped token values with the WCAG 2.2 relative-luminance
formula, and is restated on each token in `src/styles/_tokens.scss`. Two of them changed the palette:
`--nova-clay` was darkened from a more attractive `#A85F3C`, which measured **4.23:1** and would fail
AA at body sizes; and `--nova-ink` on `--nova-night` is **1.02:1** — unusable, and recorded as an
explicit warning so no dark section can pair them.

These ratios are **not** machine-verified by an AXE scan, because **D5** defers that tooling to the
optional M11. They are computed from the token values, so a colour change must be recomputed rather
than assumed to be caught automatically.

Discipline: the accent is **restrained but not numerically capped**. Use it intentionally for
hierarchy, emphasis, interaction, or brand identity, and keep it visually consistent. Avoid
excessive accent usage and never use colour decoratively. The final composition decides the
frequency — this is intentional editorial design, not a colour-count rule.

### 6.2 Typography

Two families, both **variable**, both **SIL OFL 1.1** (licence files confirmed present at
`google/fonts/ofl/newsreader/OFL.txt` and `google/fonts/ofl/archivo/OFL.txt`):

- **Newsreader** — variable (`opsz`, `wght`) editorial serif. Display and headings. Calm and
  warm without quirkiness; fits Scandinavian-premium better than a didone (fashion-y) or a
  wonky-vintage serif.
- **Archivo** — variable (`wght`, `wdth`) grotesque. UI, nav, body, labels. Neutral and
  competent; deliberately not Inter, which reads as the default AI/SaaS typeface.

Self-hosted as 2 `woff2` files in `src/assets/fonts/`, `font-display: swap`, preloaded in
`index.html`. Ship the `OFL.txt` files alongside them. Two files total instead of a dozen statics.

Scale (all in `_typography.scss`, mobile-first `clamp()`):

| Token            | Size                                       | Family / weight                           |
| ---------------- | ------------------------------------------ | ----------------------------------------- |
| `--text-display` | `clamp(2.75rem, 1.6rem + 5.2vw, 6.5rem)`   | Newsreader 400, lh 0.95, tracking -0.02em |
| `--text-h2`      | `clamp(2.25rem, 1.5rem + 3.2vw, 4rem)`     | Newsreader 400, lh 1.05                   |
| `--text-h3`      | `clamp(1.5rem, 1.2rem + 1.2vw, 2rem)`      | Newsreader 400                            |
| `--text-body-lg` | `clamp(1.125rem, 1rem + 0.5vw, 1.3125rem)` | Archivo 400, lh 1.6                       |
| `--text-body`    | `1.0625rem`                                | Archivo 400, lh 1.65                      |
| `--text-eyebrow` | `0.75rem`                                  | Archivo 500, uppercase, tracking 0.14em   |

Max measure ~65ch. Fluid type means **no per-component font-size media queries**.

### 6.3 Spacing & layout

8px base (4px half-step), as custom properties: `--space-3xs` … `--space-5xl` (`0.25rem` →
`12rem`). Section rhythm `--section-y: clamp(4rem, 2rem + 8vw, 10rem)` — generous whitespace is
the brand.

Container: `width: min(100% - 2 * var(--gutter), 1440px)`, `--gutter: clamp(1.25rem, 4vw, 4rem)`.
12-column grid, `gap: clamp(1rem, 0.5rem + 1vw, 2rem)`. Asymmetric placement is a layout rule, not an
afterthought: e.g. hero copy spans cols 1–6 with the image bleeding right; the editorial section
offsets its caption to cols 8–12.

**Never `100vw`** — it ignores the scrollbar and causes horizontal overflow. Use `100%`.

---

## 7. Component architecture

| Component                 | Reused?      | Justification                                  |
| ------------------------- | ------------ | ---------------------------------------------- |
| `site-header`             | once         | Owns nav + mobile menu state.                  |
| `site-footer`             | once         | —                                              |
| `hero`                    | once         | LCP element.                                   |
| `featured-collection`     | once         | Owns the featured subset.                      |
| `brand-values`            | once         | 3 principles.                                  |
| `craft-process`           | once         | Replaces Testimonials (D2).                    |
| `editorial`               | once         | Distinctive composition, not a card grid.      |
| `product-showcase`        | once         | Large single-product moment.                   |
| `brand-story`             | once         | Philosophy, distinct from hero copy.           |
| `final-cta`               | once         | Closes the journey.                            |
| `ui/button`               | **6+ sites** | Real reuse: variants via `input()`.            |
| `ui/product-card`         | **2 sites**  | Featured collection + showcase.                |
| `ui/section-heading`      | **6 sites**  | Eyebrow + title + optional lede.               |
| `shared/reveal` directive | 8 sites      | One directive instead of 8 copies of IO logic. |

**Anti-fragmentation rule:** one component per page section, plus three `ui/` primitives and one
directive. No wrapper divs-as-components, no `Icon` component unless ≥3 real uses, no
`container`/`row`/`col` components — those are CSS classes in the global layer.

### Section-by-section composition

Avoiding the "repetitive centred card section" failure:

- **Hero** — asymmetric split, headline + copy + 2 CTAs left, large lifestyle image right bleeding
  off-canvas. `h1` here and nowhere else.
- **Featured Collection** — the one legitimate card grid. Editorial grid (asymmetric spans, varied
  image aspect ratios), not a uniform 3×2. Hover: image scale + caption reveal.
- **Brand Values** — three principles as **numbered editorial columns with hairline rules**, not
  cards. No boxes, no shadows.
- **Craft & Process** — full-width dark band; horizontal 3-step process with numerals. Trust via
  specificity (materials, joinery, finishing).
- **Editorial / Lifestyle** — intentionally **not** a grid. One large image, an offset caption
  block, generous negative space, a pull-quote in the display serif.
- **Product Showcase** — single hero product, asymmetric two-column, sticky image + scrolling
  detail on desktop; stacked on mobile. The page's second moment of drama.
- **Brand Story** — two-column editorial text + portrait/detail image. Deliberately different
  rhythm from the Editorial section so the page does not feel like two of the same thing.
- **Final CTA** — restrained, centred, single action. Echoes hero without duplicating it.
- **Footer** — wordmark, nav columns, social placeholders, fictional-brand disclosure, copyright.

---

## 8. Responsive strategy

Mobile-first. The base layout is designed for **360px**, not squeezed down from 1280px.

| Token      | Min width | What changes                                                                         |
| ---------- | --------- | ------------------------------------------------------------------------------------ |
| base       | 0         | Single column, stacked, full-bleed images, hamburger nav.                            |
| `--bp-sm`  | 480px     | Larger gutters, 2-up where it helps.                                                 |
| `--bp-md`  | 768px     | **Target breakpoint.** Grid becomes active, nav becomes inline, tablet product grid. |
| `--bp-lg`  | 1024px    | Asymmetric desktop compositions, sticky showcase, full gutters.                      |
| `--bp-xl`  | 1280px    | Container reaches max width; type at upper clamp.                                    |
| `--bp-2xl` | 1440px+   | Container caps at 1440; whitespace grows.                                            |

Verified against the required widths: 360, 390, 768, 1024, 1280, 1440+.

Per-breakpoint attention: navigation (hamburger → inline with the menu state torn down, not merely
hidden), typography (fluid, so continuous), image cropping (per-breakpoint `aspect-ratio` +
`object-fit`, art-directed via `<picture>`/srcset where a crop genuinely differs), product layouts,
CTA sizing (min 44×44px touch targets), section composition.

**Horizontal overflow** is a named acceptance check at every milestone — the most common mobile
defect. `overflow-x: clip` on `body` is a safety net, never the fix.

---

## 9. Asset strategy

### 9.1 Photography — Unsplash

Licence verified: free for commercial and non-commercial use, **no attribution required**
(appreciated), irrevocable and worldwide.

> **Critical constraint:** attribution to Unsplash _and_ the photographer _with a link_ becomes
> **mandatory if images are obtained through the Unsplash API**. Therefore: **download manually
> from unsplash.com. Do not use the API.** This is a licensing requirement, not a preference.

Also note the licence forbids _compiling images to replicate a similar or competing service_. Using a
curated set as brand editorial imagery is fine; do not turn the page into a searchable stock
gallery.

Handling pipeline (one-time, offline):

1. Select ~14–18 images: interiors, furniture details, materials/textures, lifestyle.
2. Record photographer + source URL per file in `src/assets/images/ATTRIBUTION.md`.
3. Resize: hero ≤ 2000px wide, showcase ≤ 1800px, cards ≤ 1000px.
4. Convert to WebP (AVIF optional).
5. Keep **every file ≤ 250 kB**, **total image payload ≤ 3 MB**.

Targets: LCP image ≤ 200 kB. Everything below the fold lazy-loads.

Tooling: convert offline (e.g. `cwebp`, ImageMagick, or a throwaway `sharp` script that is **not**
committed). Do not add an image dependency to `package.json`.

Images live in `src/assets/images/` and are **imported** (not referenced from `public/`) so
`NgOptimizedImage` can generate responsive `srcset` at build time. `public/` stays for
`_redirects`/`_headers`/favicon only.

### 9.2 Fonts

- 2 `woff2` files, Latin subset, variable, self-hosted in `src/assets/fonts/`.
- Download from `fonts.google.com/specimen/*` (not the API; the licence is identical either way).
- Ship `OFL.txt` for both families.
- Subset unused axes with `fonttools` offline (e.g. drop Archivo's `wdth` if unused) — Python CLI,
  not an npm dep.
- `font-display: swap`; `font-synthesis: none`; preload both in `index.html`.
- Fallback stacks defined in `--font-display` / `--font-ui` so first paint is never blocked.

### 9.3 Logo

Authored inline SVG wordmark + minimal geometric mark. Original, ~1 kB, licence-clean, inherits
`currentColor` for the light/dark sections.

### 9.4 Cloudflare Pages budget

20,000 files / 25 MiB per file. With ~18 images + 2 fonts + bundles, the deploy lands in the low
hundreds of files and a few MB — comfortably inside limits. Re-check `dist/nova/browser` contents at
M8.

---

## 10. Animation strategy

Purposeful only. No animation library.

| Moment                | Technique                          | Notes                                            |
| --------------------- | ---------------------------------- | ------------------------------------------------ |
| Section reveal        | `reveal` directive + CSS           | IO adds `.is-revealed` once, then `unobserve()`. |
| Image reveal          | CSS `clip-path` / `scale` keyframe | Transform/opacity only.                          |
| Product hover         | CSS transition                     | Image scale + caption fade.                      |
| CTA micro-interaction | CSS transition                     | Underline/scale, ≤200ms.                         |
| Mobile menu           | CSS transition on a signal         | Opacity + small translate.                       |

**Reveal is progressive enhancement:** content is visible by default; the directive only _adds_ the
hidden-then-reveal state. If JS fails or IO never fires, nothing is invisible. This is the
accessibility-correct pattern and avoids a blank page.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Global, in `_motion.scss`. Durations 150–600ms, `ease-out`, staggered ≤80ms. Compositor-only
properties (`transform`, `opacity`) so animation never triggers layout.

**Zoneless:** all animation state is CSS-driven or a `signal()`; nothing depends on zone.js.

---

## 11. Accessibility strategy

WCAG 2.2 AA. This is a public portfolio — accessibility is a graded criterion, not a checkbox.

- **Structure:** skip-link → `#main` as first focusable element. Landmarks: `header`, `nav`
  (`aria-label="Primary"`), `main`, `footer`. One `h1` (hero); `h2` per section; `h3` within.
- **Mobile nav:** real `<button>` with `aria-expanded` + `aria-controls`; focus moves into the panel
  on open; focus **trapped** while open; `Escape` closes and **returns focus to the trigger**;
  background content made `inert`; panel closed at desktop width (removed from a11y tree, not just
  `display: none`).
- **Focus:** global `:focus-visible` ring using `--nova-clay`, ≥3:1 against adjacent colours,
  `outline-offset` so it never clips. Never `outline: none`.
- **Contrast:** tokens chosen to clear 4.5:1 for body text and 3:1 for UI/large text; verified by
  AXE, not by eye.
- **Images:** meaningful `alt` describing the composition; `alt=""` for decorative; explicit
  `width`/`height` to prevent CLS.
- **Touch targets:** ≥44×44px for nav, CTAs, and menu controls.
- **Motion:** `prefers-reduced-motion` honoured globally (§10).
- **Zoom/text scaling:** layout survives 200% zoom and 400% reflow at 320px width.
- **Colour independence:** the accent is never the sole carrier of meaning.

Tooling: manual keyboard walkthrough + screen-reader spot check are the baseline. Automated AXE
(`vitest-axe`/`axe-core`) would add a dev dependency — **requires approval**; proposed as optional
in M9.

---

## 12. SEO strategy

No SSR, so all metadata is static in `src/index.html`.

- `<title>`: `NOVA — Premium Furniture & Lifestyle`
- Meta description, ~155 chars, benefit-led, no keyword stuffing.
- `<meta name="theme-color">` matching `--nova-paper`.
- **Open Graph + Twitter card** with a purpose-built 1200×630 share image (designed, not a random
  screenshot).
- `lang="en"`, viewport, canonical URL.
- Favicon set: existing `favicon.ico` + authored SVG icon + `apple-touch-icon`.
- Semantic HTML and alt text do the structural work.
- **No `Review` / `AggregateRating` / `offers` JSON-LD.** A fictional brand emitting review
  structured data would be fabricated evidence and violates search-engine policy. Only truthful
  `Organization`-level metadata, and only if it adds value.

---

## 13. Performance strategy

- `NgOptimizedImage` for every image; `priority` on **only** the hero LCP image.
- Below-fold images lazy-load by default; explicit `width`/`height` everywhere.
- Fonts: 2 preloaded woff2, `font-display: swap`, no external origins.
- Angular's production `inlineCritical` (on by default) keeps critical CSS in `index.html`.
- `outputHashing: "all"` + the existing `public/_headers` gives immutable caching for hashed assets
  and `no-cache` for `index.html`.
- Removing the router (D1) removes the single largest avoidable JS payload.
- Zero new runtime dependencies. Target: **initial total < 350 kB raw / < 100 kB transfer**. The
  zero-app-code scaffold was 216 kB / 59 kB; the finished site measures **204.23 kB / 57.47 kB**, so
  every kilobyte added by the application was more than paid for by removing the router and the
  scaffold splash.
- Animations compositor-only; no layout thrash; IO observers unobserved after firing.

---

## 14. Portfolio integrity

Enforced, not aspirational:

1. **No fabricated proof.** No revenue, conversion rates, customer counts, ratings, or testimonials.
2. **No fake endorsement.** No invented press logos, awards, or "as featured in".
3. **No real contact details.** Footer contact is an inert placeholder (D4).
4. **Visible disclosure.** A muted footer line: _"NOVA is a fictional brand created as a portfolio
   concept project. Product names, prices and imagery are illustrative."_
5. **Attribution is honest.** `ATTRIBUTION.md` credits Unsplash photographers even though the
   licence does not require it.
6. **Case study framing.** Documented as self-initiated, with the developer role stated plainly.

---

## 15. Testing strategy

Vitest 4 + jsdom via `@angular/build:unit-test`. Colocated `*.spec.ts`. Run with
`npm test -- --watch=false`.

Test **behaviour and accessibility attributes**, not layout (jsdom has no layout engine, so
assertions about computed size are meaningless).

| Target               | Assertions                                                               |
| -------------------- | ------------------------------------------------------------------------ |
| `App`                | Creates; renders `<main>`, skip-link target, header, footer.             |
| `site-header`        | Menu toggles `aria-expanded`; `Escape` closes; focus returns to trigger. |
| `ui/button`          | Renders correct element (`<a>` vs `<button>`) from inputs.               |
| `ui/product-card`    | Name, category, formatted price, `alt` text present.                     |
| `ui/section-heading` | Eyebrow + heading level render.                                          |
| `reveal`             | Adds `.is-revealed` on intersection; **unobserves** after firing.        |
| `hero`               | Single `h1`; both CTAs present and correctly labelled.                   |

jsdom constraints to plan for: **no `IntersectionObserver`** (stub it), no layout/scroll
measurement, no `matchMedia` reliability for reduced-motion (assert the CSS instead). Prefer
asserting on ARIA state over CSS classes where both are possible.

Replace the scaffold `app.spec.ts` assertion on `Hello, nova` in the same change that replaces
`app.html` — it is coupled to the 20 kB Angular welcome splash (`AGENTS.md`).

---

## 16. Build verification strategy

Order matters. Run before every milestone is called done:

```bash
npx prettier --check .                  # formatting
npm run build                          # template typecheck + budgets  <-- the gate
npm test -- --watch=false              # unit tests
```

- `npm run build` is the **only** command that runs the Angular template typechecker and enforces
  budgets. `npx tsc --noEmit -p tsconfig.app.json` is fast TS-only feedback and will happily pass a
  broken template.
- Watch for `anyComponentStyle` **warnings at 4 kB** — that is the architectural tripwire. A warning
  means refactor to the global layer _now_.
- Confirm `dist/nova/browser/` contains `index.html`, hashed bundles, `_redirects`, `_headers`, and
  that total size is sane. **Note the output dir is `dist/nova/browser`, not `dist/nova`.**
- Manual checks per milestone: keyboard walkthrough, reduced-motion emulation, and the six target
  widths.

---

## 17. Milestones

Each has a **binary, verifiable** success criterion. Dependencies are explicit.

### M0 — Foundations — _no application-code changes; styling and assets only_

Design tokens, global SCSS layer, fonts, base typography, layout primitives. Touches `src/styles.scss`,
new `src/styles/*`, `src/assets/**`, and `src/index.html` only. **The router stays installed until
M1** — router removal is application structure, not a foundation concern (D1 sequencing note, §1).

- ✅ `src/styles.scss` + 7 partials (`_reset`, `_tokens`, `_typography`, `_layout`, `_components`,
  `_motion`, `_utilities`); tokens as CSS custom properties on `:root`.
- ✅ 2 woff2 self-hosted with OFL files (`Newsreader`, `Archivo`), preloaded from `index.html`.
  **Both verified as genuine WOFF2 by magic bytes** (`wOF2`), not just by filename:
  Newsreader 134,572 B / 398 glyphs / `wght 300–800`, `opsz 24–72`; Archivo 49,568 B / 397 glyphs /
  `wght 100–900`, `wdth` pinned at 100. 184 kB for both.
- ✅ `_typography.scss` proves fluid scale without component-level media queries — the whole type
  scale is `clamp()` on tokens.
- ✅ `npm run build` clean, global CSS **9.75 kB** compiled (< 60 kB target), **no**
  `anyComponentStyle` entries (no component has a stylesheet yet), `npm test -- --watch=false` green
  (2 passed), `npx prettier --check .` clean.
- ✅ `package.json` and all of `src/app/` byte-for-byte unchanged (`app.html` 20,187 B,
  `app.scss` 0 B, `@angular/router` still installed, `app.routes.ts` still present).
- ⚠️ **`angular.json` has one deliberate addition** — a `src/assets` → `/assets` entry in
  `build.options.assets`. This is a necessary consequence of the plan's own requirement to serve
  fonts from a stable path (§21), not a silent scope change; budgets were not touched. Without it the
  bundler re-emits the fonts into `./media/` under content hashes, which then disagrees with the
  `index.html` preloads — guaranteed 404 plus a duplicated ~184 kB in the deploy.
- ✅ Deploy artifact verified in `dist/nova/browser`: 12 files / 0.4 MB total (Cloudflare caps:
  20,000 files, 25 MiB per file); largest single file `Newsreader-Variable.woff2` at 131.4 KB.
- ✅ Palette contrast computed against the WCAG 2.2 luminance formula — every text pair clears AA,
  most clear AAA (see §21 table). Re-measured from the shipped token values in M9; **not** re-checked
  with AXE, which D5 defers.

**M0 status: complete.** Next on explicit instruction is **M1**, which executes D1 (router removal).

### M1 — App shell + navigation — _depends on M0_

Skip-link, `site-header` with responsive anchor nav, `site-footer`, `App` composition. **Executes the
approved D1**: remove `provideRouter` from `app.config.ts`, drop `<router-outlet>` from `app.ts`,
delete `app.routes.ts`, uninstall `@angular/router`. Wire the four anchor targets per §4.4.

- ✅ Mobile menu: opens/closes, `aria-expanded` correct, `Escape` closes, focus returns to trigger,
  focus trapped, no horizontal scroll at 360px. Desktop nav has no leftover `aria-hidden` panel.
  ✅ Keyboard-only traversal reaches every nav item. ✅ `npm test -- --watch=false` green.

### M2 — Hero — _depends on M1_

Headline, copy, both CTAs, hero image, LCP.

- ✅ Exactly one `<h1>`. ✅ "Explore the Collection" is the visually dominant CTA; "View Lookbook"
  is clearly secondary — only one primary CTA in the viewport. ✅ Hero image ≤ 200 kB, `priority`,
  explicit dimensions, no CLS. ✅ `hero.scss` **< 4 kB**. ✅ Lighthouse LCP < 2.5s locally.

### M3 — Product data + Featured Collection — _depends on M2_

Typed `Product` model, 6 fictional products, `product-card`, `section-heading`, `button`.

- ✅ `PRODUCTS` is `readonly Product[]`; prices render via `CurrencyPipe` in EUR. ✅ Hover/focus
  state visible on card **and** keyboard-focusable. ✅ Alt text present on all 6 images.
  ✅ Cards render as an asymmetric editorial grid at 768/1024/1440.
  ✅ `product-card.scss` + `featured-collection.scss` each **< 4 kB**.

### M4 — Brand Values + Craft & Process — _depends on M3_

Three brand principles, plus the **Craft & Process** section that replaces Testimonials under the
approved D2. Craft & Process communicates the fictional design philosophy through specific visual
storytelling — materials, craftsmanship, construction, design process — never as real-world evidence.

- ✅ **No testimonial, review, rating, star rating, customer count, press logo, or fabricated social
  proof anywhere in the DOM** — verified by content inspection, not just assertion.
- ✅ Craft & Process uses concrete specifics (named materials, joinery, finishing techniques) rather
  than vague superlatives, and reads as a design narrative rather than a marketing claim.
- ✅ Values read as numbered editorial columns with hairline rules — no cards, no shadows, no rounded
  containers. ✅ Dark band meets 4.5:1. ✅ Both components **< 4 kB**.

### M5 — Editorial / Lifestyle — _depends on M4_

Distinctive composition, deliberately not a grid.

- ✅ Visually distinct from M4's rhythm — verified by screenshot, not by assertion. ✅ Caption
  offset on desktop, reflows sensibly at 360px. ✅ Large image ≤ 250 kB, lazy-loaded.
  ✅ `editorial.scss` **< 4 kB**.

### M6 — Product Showcase + Brand Story — _depends on M5_

Two-column sticky showcase; two-column philosophy story.

- ✅ Story copy does not duplicate hero copy — reviewed for overlap. ✅ Sticky behaviour desktop
  only; stacks on mobile with no jank. ✅ Both **< 4 kB**.

### M7 — Final CTA + Footer — _depends on M6_

Closing CTA; footer with disclosure.

- ✅ Fictional-brand disclosure present in footer text. ✅ Social links are placeholders with no
  real URLs and no invented contact details. ✅ Contrast ≥ 4.5:1 in footer. ✅ **< 4 kB**.

### M8 — Motion + reveal — _depends on M3_

`reveal` directive, section reveals, hover polish.

- ✅ All content visible with JS disabled. ✅ `prefers-reduced-motion: reduce` disables all motion
  and reveals content instantly. ✅ Observers `unobserve()` after firing. ✅ No animation library in
  `package.json`. ✅ Animations compositor-only (no layout-triggering properties).

### M9 — Responsive, accessibility, performance, assets — _depends on M7 + M8_

Full sweep.

- ✅ **No horizontal overflow at any width**, verified by measurement across **320, 360, 390, 768,
  1024, 1280, 1440px** — mobile is a designed layout, not a squeezed desktop. Layout screenshots
  were captured into a local working directory for visual review; **none are committed to the
  repository**, so "responsive screenshots" in M10 means the tested widths and the measurements,
  not image files.
- ✅ Interactive targets clear the WCAG 2.5.8 AA floor of **24×24px**: 44×44 on the menu trigger and
  CTAs, 24–26px on the wordmark and footer links, enlarged with a transparent `::after` hit area so
  the type does not change. The original wording here — "all interactive targets ≥44×44px" — was an
  AAA-level target recorded as though it were the AA requirement. It is not, and the smaller targets
  are deliberate.
- ✅ **320px reflow / 200% zoom passes** (WCAG 1.4.10), re-measured in M10.
- ✅ Keyboard-only pass; focus visible everywhere; skip-link works; menu panel traps focus, marks the
  background `inert`, and closes on `Escape`.
- ✅ Contrast computed from the shipped token values on every pair; tightest shipping pair is the
  footer disclosure at **4.66:1**.
- ⚠️ **AXE was never run.** It requires `axe-core`, which **D5** defers to the optional M11; the M9
  baseline is manual review plus the CDP harnesses. The previous "AXE: **zero** serious/critical
  violations" checkmark was written into the plan before any scan existed. It has been removed rather
  than left standing as evidence of work that did not happen.
- ✅ `dist/nova/browser` verified: `_redirects` + `_headers` present in the output root, initial
  bundle **204.23 kB raw / 57.47 kB transfer**, deploy payload **23 files / ~2.07 MB** — far inside
  Cloudflare's 20,000-file and 25 MiB-per-file caps.

### M10 — Documentation & case study — _depends on M9_

Portfolio packaging.

- ✅ `README.md` is current: no stale CLI version, no non-existent `ng e2e`, Cloudflare Pages settings
  and the Direct-Upload deploy path documented, and the `200`-with-HTML `_redirects` trap explained.
  Corrected during M10: the claim that the six collection cards carry `srcset` (they ship **one**
  width each), a stale `~201 kB` bundle figure, and the absence of any motion documentation.
- ✅ `src/assets/images/ATTRIBUTION.md` complete, with every byte count reconciled against the files
  on disk (10 images, 1,710,558 B). `public/og-image.jpg` is recorded as **generated**, not
  photographic, so it correctly carries no photographer row.
- ✅ **`docs/CASE_STUDY.md` created** — overview and goal, design direction, UX structure,
  architecture, data strategy, visual system, responsive design, accessibility, motion and the reveal
  system, performance, asset strategy, engineering challenges and decisions, and validation, plus the
  live URL and repository link.
- ✅ Fictional framing stated in `README.md`, the footer and the case study. No fabricated metrics,
  testimonials, ratings, customer counts, press logos or contact details anywhere.
- ✅ Absolute metadata URLs corrected from the `nova.example.com` placeholder to the real origin
  **https://nova-furniture.pages.dev/** in `canonical`, `og:url`, `og:image` and `twitter:image`.
  There is no custom domain, so the Pages host is the canonical one — confirmed in
  `.github/workflows/deploy.yml`, `package.json`, and against the live site.
- ✅ False verification claims corrected rather than carried forward: AXE (M9 above), the 44×44
  target wording (M9 above), and the pre-marked M10 checkmarks that had been written before
  `docs/` existed.
- ⚠️ **Outstanding, and it needs credentials rather than code.** The deployed build predates the M9
  and M10 work, so the corrected metadata and the social card reach the live site only on the next
  `npm run deploy`. Until then, do not treat the live HTML as current. Verify with a `Content-Type`
  check: `_redirects` answers `200` with `index.html` for a missing file, so a `200` alone proves
  nothing.

### Optional M11 — Automated a11y testing

`vitest-axe` / `axe-core` as a dev dependency. **Requires explicit approval** (new dependency).

---

## 18. Risks & mitigations

| #   | Risk                                                        | Likelihood | Impact           | Mitigation                                                                                                                                                                              |
| --- | ----------------------------------------------------------- | ---------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | **`anyComponentStyle` 8 kB exceeded** by a rich section     | High       | Build fails      | Global-first strategy (§5); component `@use` of shared partials banned; 4 kB warning treated as the working limit; refactor to global layer, never raise the budget first.              |
| R2  | Design reads as "generic AI site"                           | Medium     | Portfolio damage | Asymmetric editorial grids, no uniform card walls, no centred-repetition, restrained type, accent applied intentionally rather than decoratively; screenshot review at every milestone. |
| R3  | Stock photos look inconsistent (mixed colour temp/crop)     | Medium     | Visual quality   | Curate tightly, apply one consistent grade, crop to a fixed set of aspect ratios, art-direct per section.                                                                               |
| R4  | Unsplash API used accidentally → attribution obligation     | Low        | Licensing        | Document "download manually, never via API" in `ATTRIBUTION.md` + plan; record photographer per file.                                                                                   |
| R5  | Font licence or axis-subsetting error                       | Low        | Licensing/perf   | OFL confirmed in `google/fonts`; ship `OFL.txt`; subset offline with `fonttools`, never as an npm dep.                                                                                  |
| R6  | Fabricated testimonials creep in                            | Medium     | Integrity        | D2 = omit; explicit M4 criterion greps the DOM for ratings/counts/press logos.                                                                                                          |
| R7  | Scope creep into cart/auth/backend                          | Medium     | Schedule         | §15 scope-protection list is binding; data model is the only forward-looking concession.                                                                                                |
| R8  | Zoneless reactivity bug (state mutates, nothing re-renders) | Medium     | Subtle UX bugs   | Signals only; no plain-property mutation; no RxJS outside `toSignal`/`async`.                                                                                                           |
| R9  | Horizontal overflow on mobile                               | Medium     | Mobile quality   | Named acceptance check at every milestone; `100%` not `100vw`; measure, don't eyeball.                                                                                                  |
| R10 | jsdom masks real-browser issues (IO, layout)                | Medium     | False confidence | Manual verification per milestone in a real browser; `--browsers` when a test needs it.                                                                                                 |
| R11 | Image payload bloats the Cloudflare deploy                  | Low        | Deploy/perf      | ≤250 kB/file, ≤3 MB total, WebP, verified file count and size at M9.                                                                                                                    |
| R12 | Over-fragmentation into micro-components                    | Medium     | Unmaintainable   | One component per section; extract only at ≥3 genuine reuse sites; no layout components.                                                                                                |

---

## 19. Success criteria (project-level)

The project is done when **all** hold:

1. `npx prettier --check .`, `npm run build`, `npm test -- --watch=false` all pass.
2. **Zero** `anyComponentStyle` warnings at 4 kB and zero errors; `angular.json` budgets unmodified.
3. **Zero** new runtime dependencies; no animation library; no UI library.
4. Measured across **320, 360, 390, 768, 1024, 1280, 1440px**: **no** horizontal overflow and no
   clipped content. Layout screenshots are a review aid held outside the repository.
5. Full keyboard traversal works — skip link, visible focus ring, trapped menu focus, `Escape` to
   close, background `inert`. Contrast computed from token values; every text pair ≥ 4.5:1 and
   tap targets ≥ 24×24px (WCAG AA). **An AXE scan is not part of this criterion**, per D5; it is
   proposed as the optional M11.
6. `prefers-reduced-motion` fully honoured; all content visible without JS.
7. Initial bundle < 350 kB raw / < 100 kB transfer — **measured: 204.23 kB raw / 57.47 kB transfer.**
8. Deploy artifact verified in `dist/nova/browser` with `_redirects` and `_headers` intact.
9. Zero fabricated claims in code, copy, or docs; fictional disclosure present in the footer.
10. Case study complete with live demo URL and repository link — **delivered as
    [`docs/CASE_STUDY.md`](docs/CASE_STUDY.md) in M10.**

---

## 20. Approval status and next step

**Plan approved** with D1 (remove router), D2 (omit testimonials), D3 (EUR), D4 (inert contact), and
the accent-frequency adjustment incorporated. D5 (automated a11y tooling) remains optional.

**M0 through M9 are complete and visually approved.** The next step on explicit instruction is
**M10 — documentation & case study**, which is delivered in `docs/CASE_STUDY.md` plus corrections to
this plan, `README.md`, `PROJECT_MAP.md`, `AGENTS.md`, `ATTRIBUTION.md` and the absolute URLs in
`src/index.html`. **M11 remains optional and has not been started** — it needs explicit approval for
the `axe-core` dev dependency that D5 defers.

One claim in this plan was corrected rather than allowed to stand: the M9 section previously carried
a checkmark reading "AXE: zero serious/critical violations". No scan was ever run, because D5 defers
the tooling. The checkmark has been replaced with what was actually verified.

Resolved during M0: the **"Journal" nav anchor** maps to `<app-editorial>` (`id="journal"`) because
no Journal section is planned (§4.4). Confirmed — no ninth section, no change to milestone
sequencing.

---

## 21. M0 implementation notes

Three decisions are worth recording because they are easy to undo by accident.

### 21.0 The font files were briefly not WOFF2 at all

Worth recording because the build could not have caught it. `fontTools.subset.save_font()` picks the
output **container** from `Options.flavor`, not from the `.woff2` filename. With `flavor` unset it
wrote a plain TrueType/sfnt container (magic `00 01 00 00`) into files named `*.woff2`. Nothing
failed: the build was green, Prettier was clean, the fonts were preloaded, the sizes looked
plausible. But every browser rejects a TrueType payload when `@font-face` declares
`format('woff2-variations')` and falls back to the system stack — so the site would have looked
_almost_ right while being none of the approved typography. No build error, no warning about the
font.

Caught only by reading the first four bytes. The rebuild sets `options.flavor = "woff2"` explicitly
and re-verifies the `wOF2` magic on disk before writing to `src/assets`. The rebuild also fixed two
related defects found at the same time:

| Issue                                                                       | Fix                                                       |
| --------------------------------------------------------------------------- | --------------------------------------------------------- |
| TrueType bytes in a `.woff2` container                                      | `options.flavor = "woff2"` + magic-byte assertion         |
| `wght` default was 400 in CSS but 600 in the file (upstream named instance) | axis default forced to 400 to match `--weight-regular`    |
| `Newsreader` `opsz` allowed 6–72                                            | clamped to 24–72, since it is display-only in this design |
| `unicode-range` used Google's stock list, not the actual subset             | rewritten to match the ranges really baked in             |
| Name table read `Newsreader 16pt` / `Archivo SemiBold`                      | normalised to `Newsreader` / `Archivo` + `Regular`        |

Result: 346 kB of fonts that no browser would have loaded became 184 kB that they will. **Always
check magic bytes on a font rebuild; a green build proves nothing about font validity.**

### 21.1 Font paths are root-absolute, and that is deliberate

`@font-face` in `_typography.scss` uses `url('/assets/fonts/Newsreader-Variable.woff2')`, **not** a
relative path. A relative `url()` makes the bundler re-emit the font into `./media/` under a content
hash. The hashed path then disagrees with the stable path `index.html` preloads — the preload 404s
_and_ the deploy carries a second, unused copy of both fonts (~184 KB wasted). Root-absolute URLs are
left untouched by the CSS pipeline, so exactly one copy of each font is served, at the path the
preload points to.

This is what required the single `angular.json` assets entry. Because those filenames are not
hashed, `public/_headers` gives `/assets/fonts/*.woff2` a 30-day immutable cache rather than the
one-year treatment hashed bundles get — long enough to be invisible, short enough that swapping a
font can still reach returning visitors.

### 21.2 Shared styling is global, by measurement not preference

`src/styles.scss` loads the seven partials and nothing else. Component `.scss` files will hold only
what is local to their component. This is the mechanism documented in `AGENTS.md`: the global
stylesheet is never tagged `ng-component`, so it is measured against `initial` (500 kB warn / 1 MB
error) and is entirely exempt from `anyComponentStyle` (4 kB warn / 8 kB error) — roughly 125× the
headroom per stylesheet. The budget cost of moving shared rules global is zero; the cost of leaving
them per-component is the 8 kB cliff.

### 21.3 Contrast was computed, not estimated

Every foreground/background pair in `_tokens.scss` was run through the WCAG 2.2 relative-luminance
formula. Two results shaped the palette:

- **`--nova-ink` on `--nova-night` is 1.02:1 — unusable.** Recorded as an explicit warning in
  `_tokens.scss`. Any section on `--nova-night` must pair with a `*-invert` foreground token.
- **The original clay `#a85f3c` failed AA** (~4.2:1 at body size) and was darkened to `#8f4e2e`
  (5.60:1). This is why the accent reads as a deeper terracotta than a literal "clay" would.

Computed ratios:

| Foreground           | Background     | Ratio | Level |
| -------------------- | -------------- | ----- | ----- |
| `--nova-ink`         | `--nova-paper` | 16.05 | AAA   |
| `--nova-ink-soft`    | `--nova-paper` | 8.36  | AAA   |
| `--nova-muted`       | `--nova-paper` | 5.14  | AA    |
| `--nova-clay`        | `--nova-paper` | 5.60  | AA    |
| `--nova-bone`        | `--nova-night` | 16.45 | AAA   |
| `--nova-bone-dim`    | `--nova-night` | 8.87  | AAA   |
| `--nova-clay-night`  | `--nova-night` | 8.46  | AAA   |
| `--nova-bone-strong` | `--nova-clay`  | 6.27  | AA    |

These ratios are re-measured from the shipped token values on every visual milestone. They are **not**
served by an AXE scan — D5 defers that tooling — so a colour edit here must be re-computed, not
assumed to be caught automatically.

### 21.4 Scroll reveal is progressive enhancement

`.reveal:not(.is-revealed)` hides content, which is only safe because the `reveal` directive (M8)
applies that state itself and only after confirming it can animate the element back. The class is
never server-rendered as hidden. If JavaScript fails, `IntersectionObserver` never fires, or
`prefers-reduced-motion: reduce` is set, content stays fully visible. A hidden-by-default reveal
would be a content-invisible failure mode on a public portfolio.

### 21.5 Asset pipeline

`src/assets/README.md` records the limits (≤ 250 KB/image, ≤ 3 MB total) and the licensing rules.
The Unsplash **API is prohibited** here: API access imposes a separate mandatory Unsplash +
photographer attribution requirement that the landing page cannot satisfy without inventing a credit
block. Website downloads carry the standard licence. `src/assets/images/ATTRIBUTION.md` is the
provenance register — one row per file, recorded at download time. No images were added in M0.
