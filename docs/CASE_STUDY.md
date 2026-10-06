# NOVA — case study

**Furniture & lifestyle landing page · Angular 22.2 · solo, self-initiated**

- **Live:** <https://nova-furniture.pages.dev>
- **Source:** <https://github.com/waleedkorashy/NOVA>
- **Role:** everything below — art direction, photography selection, design system, Angular
  architecture, motion, accessibility verification, asset pipeline, CI and deployment.

> **NOVA is fictional.** It is a self-initiated portfolio project, not a real company. No real
> product, maker, stockist, customer or price is reproduced, and the page deliberately carries no
> testimonials, ratings, customer counts or press logos. Photographs are licensed editorial stock,
> credited in [`../src/assets/images/ATTRIBUTION.md`](../src/assets/images/ATTRIBUTION.md), used
> as art direction rather than as documentary proof that NOVA makes anything.

---

## Overview and goal

A single-page marketing site for a fictional furniture brand, built to carry an editorial tone
without borrowing anything from the usual agency vocabulary — no centred hero, no card wall, no
gradient button, no testimonial strip.

The goal was a page that feels art-directed rather than assembled, while staying inside three hard
constraints that make it a credible engineering piece rather than a mockup:

1. **Zero runtime dependencies beyond Angular itself.** No animation library, no UI kit, no icon
   package, no analytics, no CSS framework.
2. **WCAG AA as an acceptance criterion**, verified by measurement rather than by eye.
3. **A deploy that fits comfortably inside Cloudflare Pages' limits** and that a reviewer can clone
   and run in one command.

The interesting part of the project is not the visual result — it is the number of decisions that
only became decisions because something was measured. Those are in
[Engineering challenges](#engineering-challenges-and-decisions).

## Design direction

The direction was **quiet editorial**, borrowing from printed furniture catalogues rather than from
SaaS landing pages:

- **A warm paper ground, not white.** The base is a bone/paper tone with a near-black warm ink, so
  the page reads as printed stock rather than a screen.
- **Asymmetric grids.** Sections occupy deliberately uneven column spans (image 4 of 6, detail 5 of 12) with text blocks bottom-aligned by `align-self: end`. The empty space is the composition.
- **Restraint in the accent.** A single clay/terracotta accent is used sparingly — for rules, marks
  and emphasis — not as decoration. It is a _deeper_ terracotta than a literal "clay" would be,
  because the obvious clay failed contrast (see [Accessibility](#accessibility)).
- **One idea per section, and often no image at all.** Brand Values, Craft & Process and Brand Story
  are text-only. Density is not the goal; rhythm is.
- **Avoided the two failure modes explicitly.** No uniform grid of identical product cards as the
  centrepiece (the collection is a row, the showcase is a single piece plus an index), and no
  centred-repetition of the same layout more than once down the page.

## UX structure

Eight sections in a header/footer shell. Navigation is **in-page anchors only** — the router was
removed as decision **D1**, because shipping `@angular/router` to serve one page is a dependency the
project does not need.

| #   | Section             | Anchor        | Job                                                                |
| --- | ------------------- | ------------- | ------------------------------------------------------------------ |
| 1   | Hero                | —             | `h1`, two calls to action, priority LCP photograph                 |
| 2   | Featured Collection | `#collection` | Six products as a single row — an index, not a card wall           |
| 3   | Brand Values        | —             | Three principles, no image                                         |
| 4   | Craft Process       | —             | Three steps, communicating the fictional craft philosophy (**D2**) |
| 5   | Editorial           | `#journal`    | One large image and a caption, deliberately not a grid             |
| 6   | Product Showcase    | —             | One hero piece plus a five-item index; sticky image on desktop     |
| 7   | Brand Story         | `#about`      | Text only, no image, no forms                                      |
| 8   | Final CTA           | `#contact`    | Centred closing note with one action back to the collection        |

Two structural choices worth naming:

- **The Showcase is not a second product grid.** It promotes a single `NOVA Forma Sofa` with the
  photograph `position: sticky` on desktop while a five-item index scrolls beside it. Showing the
  same six cards twice is what makes furniture sites feel like catalogues; showing one piece in
  detail is what makes them feel like a brand.
- **The Final CTA and footer offer no way to contact NOVA.** No form, no `mailto:`, no phone, no
  address, no social accounts — decision **D4**, recorded as inert with `aria-disabled`. A portfolio
  that invents a contact channel is asserting something that isn't true.

## Architecture

Angular 22.2, **standalone** and **zoneless** — `zone.js` is not a dependency, so change detection is
signal-driven. Mutations of plain properties or RxJS values outside a signal will not re-render.

```
src/app/
  app.ts                     root; composes header, main, footer
  layout/       site-header · site-footer
  sections/     hero · featured-collection · brand-values · craft-process
                editorial · product-showcase · brand-story · final-cta
  ui/           product-card · section-heading          (the only extracted pieces)
  shared/
    directives/ reveal · reveal-coordinator            (the only motion primitives)
    data/       products.ts                            (the catalogue seam)
    types/      product.ts
```

Ten components plus two directives, and no more. The bar for extraction was **three genuine reuse
sites**; anything below that stays inline, because over-fragmenting a landing page into
micro-components is its own kind of generic.

**Styling is global-first, and that is a budget decision rather than a preference.** `src/styles.scss`
loads seven partials (`_reset`, `_tokens`, `_typography`, `_layout`, `_components`, `_motion`,
`_utilities`) and component `.scss` files hold only what is genuinely local. The reason is measured:
`angular.json` sets `anyComponentStyle` to **4 kB warn / 8 kB error** per component, and the global
stylesheet is exempt from it entirely. Worse, `@use`-ing a shared partial inside a component does
**not** share those bytes — Sass inlines them, so a 200-byte component stylesheet that pulls a 10 kB
partial compiles to 10 kB and fails the build. Shared rules belong in the global layer, where the
headroom is roughly 125× larger.

Components consume the system through **CSS custom properties**, which are inherited at runtime at
zero compiled cost.

## Data strategy

The catalogue is a `readonly Product[]` in one file, and it was written as an explicit **seam a
future API can replace**:

- `app.ts` passes the array into `<app-featured-collection [products]="products" />`.
- Sections take `input.required<readonly Product[]>()`; `product-card` takes a single `Product`.
- **No component imports the data module.** Nothing below that line knows the catalogue exists, so
  swapping the array for an HTTP call touches one file.

There is **no backend, no API layer and no CMS**. Prices are carried on the model in EUR (decision
**D3**, via the built-in `CurrencyPipe`, currency on the data object so a future API could vary it)
but are deliberately **not rendered** — the page does not need to imply commerce.

Photography is imported from TypeScript rather than referenced by path, so esbuild fingerprints
each file and `NgOptimizedImage` receives a real runtime URL. Image metadata travels with the data
(intrinsic `width`/`height`), which is what lets the browser reserve space and avoid CLS.

## Visual system

Tokens live in `src/styles/_tokens.scss` as CSS custom properties.

- **Palette** — warm paper and bone grounds, warm near-black ink, one clay accent. A paired
  `--color-bg-invert` / `--color-text-invert` set lets any section flip to a dark band via
  `.section--invert` and stay readable.
- **Type** — `Newsreader` (variable serif, 300–800, optical size clamped to 24–72) for display;
  `Archivo` (variable sans, width axis pinned to 100) for UI. Both self-hosted, subset, with their
  OFL licences shipped alongside. No external font requests.
- **Spacing & scale** — fluid `clamp()` tokens, so responsive sizing is written **once** in the
  global layer instead of being re-derived in every component's media queries.

Typography carries most of the brand. Display sizes are fluid and asymmetric; the serif/sans split is
strict — serif for voice, sans for interface — so the page never mixes them in one role.

## Responsive design

Verified in a real browser (headless Chrome over CDP) at **320, 360, 390, 768, 1024, 1280 and
1440px**. Mobile is a designed layout, not a squeezed desktop.

- **No horizontal overflow at any width**, measured rather than eyeballed — `scrollWidth` is compared
  against `clientWidth`, with the offending elements named when it fails.
- **Reflow holds to 320px**, so the page survives 200% zoom (WCAG 1.4.10).
- Layout moves by **rebalancing columns**, not by stacking everything: a section that is image-left,
  text-right at 1024px becomes image 3 of 6 with the detail column offset at 768px, and stacks below
  48rem.
- Fluid `clamp()` tokens absorb most of the intermediate range, which is why the component
  stylesheets stay small enough to fit the 8 kB budget at every width.
- Image selection is width-aware at runtime. The Hero declares `ngSrcset="960w, 1800w"`, so a 1440px
  viewport at 1× fetches the 960w file (676px is all it needs) while 2× fetches the 1800w one.

## Accessibility

Held to **WCAG AA**, because a public portfolio should survive a real audit.

- **Native semantics over ARIA roles.** One `h1`, no heading-level skips, two distinctly named
  navigation landmarks (`Primary` / `Footer`).
- **Keyboard**: a skip link to `#main`, a visible focus ring on every interactive element, and a
  mobile menu that traps focus, marks the background `inert`, and closes on `Escape`.
- **Contrast is computed, not estimated.** Every foreground/background pair was run through the WCAG
  2.2 relative-luminance formula. Two results changed the palette:
  - `--nova-ink` on `--nova-night` is **1.02:1 — unusable**, so it is recorded as an explicit warning
    in the tokens and any dark section must use a `*-invert` foreground.
  - The original clay `#a85f3c` **failed AA** (~4.2:1 at body size) and was darkened to `#8f4e2e`
    (**5.60:1**).
  - The tightest pair still shipping is the footer disclosure at **4.66:1**. The rest clear AA
    comfortably, several at AAA.
- **Tap targets** clear the WCAG 2.5.8 AA floor of 24×24px. The menu trigger and CTAs are 44px; the
  wordmark and footer links sit at 24–26px and are enlarged with a transparent `::after` overlay so
  the hit area grows **without changing the type**. They are not 44px everywhere — that is the
  AAA-level target, not the AA requirement.
- **`prefers-reduced-motion` is respected** and the reveal system is built so it cannot be a trap
  (see [Motion](#motion-and-reveal-system)).

One honest caveat: **automated AXE was deliberately not run.** It requires adding `axe-core` as a dev
dependency, which is decision **D5** and only proposed as the optional M11. The verification here is
manual and scripted — contrast computed from token values, and geometry, focus order, landmark
structure and overflow measured in a real browser.

## Motion and reveal system

Motion is **progressive enhancement built on one directive and one coordinator**, with no animation
library.

- `novaReveal` marks an element, `novaReveal="image"` selects the slower image variant, and
  `novaRevealIndex` staggers siblings.
- A single `RevealCoordinator` owns **one** `IntersectionObserver` for the whole page. Per-element
  observers meant 24 of them.
- **Content is visible by default.** The reveal only _adds_ a transform and opacity. If JavaScript
  fails, the observer never fires, or the directive never runs, the page is still completely readable.
  A reveal that hides content by default is a content-invisible failure mode on a public page, and
  that is not a risk worth taking for an entrance animation.
- Reveal is applied by removing an `is-revealed` class, animating `transform` and `opacity` only — so
  **no reveal can cause layout shift**.
- **Timings:** text **850ms**, images **950ms**, sibling stagger **120ms** (`0 / 120 / 240ms`),
  easing `cubic-bezier(0.4, 0, 0.2, 1)`. Images are slower than text because they read as heavier.
- `prefers-reduced-motion: reduce` bypasses the observer entirely and renders everything at its
  resting state, immediately.

## Performance

Measured on the production build:

| Metric                | Result                 | Budget                          |
| --------------------- | ---------------------- | ------------------------------- |
| Initial bundle        | **204.23 kB raw**      | 500 kB warn / 1 MB error        |
| Initial transfer      | **57.47 kB**           | —                               |
| Largest component CSS | **3.44 kB**            | 4 kB warn / 8 kB error          |
| Global stylesheet     | **12.04 kB**           | measured against `initial` only |
| Deploy payload        | **23 files, ~2.07 MB** | 20,000 files / 25 MiB per file  |

Techniques that produced those numbers:

- **`NgOptimizedImage` everywhere** — explicit intrinsic `width`/`height` on every image so the
  browser reserves space and CLS stays at zero; `loading="lazy"` below the fold; `priority` on the
  Hero LCP image so it is preloaded and not lazy.
- **A deliberate decision _not_ to add srcsets everywhere.** The Hero and the Editorial image each
  ship two widths because they are large and appear once. The six collection products ship **one**
  width each: six more `srcset` variants would be six times the assets for one image apiece, so they
  rely on intrinsic sizing and lazy loading instead.
- **Fonts are preloaded and self-hosted**, with stable (unhashed) paths so the preload and the
  `@font-face` agree — see the duplication bug below.
- **No runtime dependencies**, so the JS payload is framework plus application code only.

## Asset strategy

Ten photographs, all WebP, **1,710,558 B (~1.63 MB)** total, against a self-imposed ≤ 250 KB per
file / ≤ 3 MB total limit:

| Group               | Files            | Bytes     |
| ------------------- | ---------------- | --------- |
| Hero                | 960 + 1800 (3:2) | 435,844   |
| Product photography | 6 × 1200×1500    | 1,060,716 |
| Editorial           | 640 + 1200       | 213,998   |

- **Unsplash website downloads only, never the API.** API access imposes a separate mandatory
  attribution requirement that this project has deliberately declined, because satisfying it would
  mean inventing a credit block. Website downloads carry the standard licence. Every file has a
  provenance row recorded at download time — one row per file, with the specific asset URL, the
  photographer, licence, date, byte count and the exact alt text used in the code.
- **The Hero photograph is 3:2 landscape and the Hero frame was moved to 3:2** to match it, so
  `object-fit: cover` crops nothing and the whole frame is delivered. It was originally a 4:5 portrait
  frame, which discarded roughly 47% of the image width.
- **The Editorial image is uncropped at both widths**; its 4:5 frame is applied at render time by
  `object-fit: cover`, which keeps the source recoverable and the art direction changeable in CSS
  without re-encoding anything.
- **Alt text describes only what is visible** in a photograph of somebody else's interior, and never
  implies the furniture is a NOVA piece. Specs assert the alt text contains no `NOVA` token, so the
  rule cannot regress silently.
- The **1200×630 social card** is a designed typographic image generated from the project's own
  tokens and its own Archivo subset — not a stock photo — and carries explicit `og:image:width`,
  `height` and `alt` so a scraper can lay it out without decoding it first.
- Fonts are subset offline with `fonttools` and shipped with their OFL licences.

## Engineering challenges and decisions

**The build passed while every browser rejected the fonts.** `fontTools.subset.save_font()` chooses
the output _container_ from `Options.flavor`, not from the `.woff2` filename. With `flavor` unset it
wrote a plain TrueType/sfnt payload (magic `00 01 00 00`) into files named `*.woff2`. Nothing
failed — build green, Prettier clean, fonts preloaded, sizes plausible — but every browser rejects a
TrueType payload when `@font-face` declares `format('woff2-variations')` and silently falls back to
the system serif. The site would have looked _almost_ right while being none of the approved
typography. Caught only by reading the first four bytes; the fix sets `flavor` explicitly and
asserts the `wOF2` magic on disk before the file is allowed into `src/assets`. The rebuild also
corrected a `wght` axis default that disagreed with CSS, clamped an over-wide `opsz` axis, rewrote
`unicode-range` to match the real subset, and normalised the name table. 346 kB of fonts no browser
would have loaded became **184 kB that they will**.

**Root-absolute font URLs prevent 184 KB of duplication.** A relative `url()` in `@font-face` makes
the bundler re-emit the font into `./media/` under a content hash. The hashed path then disagrees
with the stable path `index.html` preloads, so the preload 404s _and_ the deploy carries a second,
unused copy of both fonts. Root-absolute URLs are left untouched by the CSS pipeline, so exactly one
copy of each is served, at the path the preload points to.

**Contrast had to be computed, because two of the "correct" colours failed.** `--nova-ink` on
`--nova-night` measured **1.02:1**, and the original clay measured ~4.2:1. Neither was visible in a
design tool; both only appeared when token pairs were run through the WCAG 2.2 formula. The palette
carries that reasoning in comments so the values are not "corrected" back.

**The Hero's aspect ratio was wrong for its own photograph.** A 4:5 portrait frame against a 3:2
landscape source cropped ~47% of the width. The obvious fix — a different photograph — would have
meant sourcing new stock. Matching the frame to the source ratio instead solved it with no new asset
and no crop.

**One observer, not twenty-four.** The first reveal implementation created an
`IntersectionObserver` per element. Consolidating into a single coordinator made the observer count
independent of page length, and stopped staggered reveals from drifting against each other.

**A missing asset returns `200`, not `404`.** `public/_redirects` serves `index.html` for unmatched
paths, so on a deployed site a missing file answers `200` with HTML. During the metadata pass this
made an undeployed social image look like it existed. The lesson is now in the README: check
`Content-Type` before concluding a file is live.

**Five decisions were recorded rather than assumed** — the numbered **D1–D5** in
[`../IMPLEMENTATION_PLAN.md`](../IMPLEMENTATION_PLAN.md): remove the router (**D1**), omit
testimonials (**D2**), carry EUR on the data object (**D3**), make the contact affordance an inert
placeholder (**D4**), and defer `axe-core` (**D5**). D2 is the one that most changed the design: the
usual testimonials band was replaced by a Craft & Process section, because the honest way to
communicate a fictional brand's philosophy is to show materials and process rather than borrow
authority from reviews that do not exist.

## Validation

Two independent layers, because jsdom alone proves very little about layout.

**Unit and component tests — Vitest 4 in jsdom**, specs beside their sources across **15 files**,
**142 tests**, all passing. `describe` / `it` / `expect` are globals. Layout, geometry and focus
claims are deliberately _not_ asserted here, because jsdom has no layout engine.

**Real-browser harnesses — headless Chrome over CDP**, driving the actual production build served as
static files (not the dev server) across the seven widths listed above. **1,564 individual assertions
across ten harnesses**, all passing. These assert what jsdom cannot: zero horizontal overflow (naming
the offending elements on failure), frame ratios, sticky positioning, computed contrast, landmark
structure, focus order and ring visibility, reduced-motion behaviour, image `srcset` selection at 1×
and 2×, and effective tap-target geometry including `::after` overlays.

The final count is deliberately stated as **assertions, not `PASS` lines**: each script prints a
`PASS` per assertion plus an end-of-run `ALL CHECKS PASSED` banner, so ten harnesses emit 1574 lines
for 1564 assertions. Two harnesses were worth fixing for their own sake — five defects in the
measurement code would each have produced a false failure (a lazy image's reserved box being read as
"loaded", a scroll animation outrunning decoding, contrast judged against an assumed white
background, and a request count asserted against the dev server where it means nothing).

**The gate, in order:** `npx prettier --check .` → `npm run build` → `npm test --watch=false` →
the browser harnesses. `npm run build` is the only step that runs the Angular template typechecker,
and the harness scripts live outside the repository so they cannot be mistaken for unit tests.

Findings and known caveats are recorded in
[`../PROJECT_MAP.md`](../PROJECT_MAP.md); the approved plan and its numbered decisions are in
[`../IMPLEMENTATION_PLAN.md`](../IMPLEMENTATION_PLAN.md).
