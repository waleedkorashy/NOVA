# NOVA

**Live site: https://nova-furniture.pages.dev**

A single-page portfolio site for a **fictional** furniture brand, built to exercise design and
front-end craft rather than to sell anything.

NOVA is a quiet, editorial-leaning landing page: warm paper tones, a serif display face, generous
whitespace, and photography doing most of the talking. It is a frontend-only project — there is no
backend, no API layer, and no CMS.

> **NOVA is not a real company.** Every product, price-free caption, and brand claim on the site is
> invented for this portfolio piece. The site says so in its own footer. There are no testimonials,
> reviews, ratings, customer counts, or press logos anywhere, because a portfolio that fabricates
> social proof is not worth reading.

---

## What's in it

Eight sections and a header/footer shell, in the order they appear on the page:

| Section             | Anchor        | What it does                                                     |
| ------------------- | ------------- | ---------------------------------------------------------------- |
| Hero                | —             | `h1`, two calls to action, priority LCP photograph               |
| Featured Collection | `#collection` | Six product cards, one width each, intrinsic size reserved       |
| Brand Values        | —             | Three principles, no image                                       |
| Craft Process       | —             | Three steps, no image                                            |
| Editorial           | `#journal`    | One large image and a caption — deliberately not a grid          |
| Product Showcase    | —             | One hero piece plus a five-item index; sticky image on desktop   |
| Brand Story         | `#about`      | Text only, no image, zero forms                                  |
| Final CTA           | `#contact`    | Centred closing note with a single action back to the collection |

Navigation is **in-page anchors only**. The router was removed in M1 — there is no `@angular/router`
and no route table, because a one-page site should not ship a router.

The Final CTA and footer deliberately provide **no way to contact NOVA**: no form, no `mailto:`, no
phone number, no address, no social accounts. A design decision, documented as **D4** in
[`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md), so the portfolio never has to invent a contact
detail that does not exist.

---

## Stack

Deliberately small. There are **no runtime dependencies beyond Angular itself** — no animation
library, no UI component kit, no icon package, no analytics.

- **Angular 22.2** — standalone components, **zoneless** (`zone.js` is not a dependency), signal-driven
  change detection
- **TypeScript 6.0** — strict mode is implicitly on
- **SCSS** — one global stylesheet with partials; no CSS framework
- **Vitest 4** via `@angular/build:unit-test`, in **jsdom**
- **Prettier** — the only style tool. There is no ESLint config, on purpose
- **Cloudflare Pages** — static hosting, no server

---

## Getting started

Node **24.x** to match the deploy target.

```bash
npm install
npm start          # http://localhost:4200
```

### Commands

```bash
npm start                             # dev server with reload on http://localhost:4200
npm run build                         # production build (the only command that typechecks templates)
npm run watch                         # incremental development build
npm test -- --watch=false             # one-shot test run
npm test -- --watch=false --filter="^App"   # regex over suite + test names
npx prettier --write .                # format
npx prettier --check .                # format check (there is no lint script)
```

**Two gotchas worth knowing up front:**

1. `npm test` **watches by default** when stdout is a terminal. In a non-interactive shell (CI, an
   agent, a script) it runs once and exits. Always pass `--watch=false` when you want a single pass.
2. `npm run build` is the **only** command that runs Angular's template typechecker. A bare
   `npx tsc --noEmit` typechecks TypeScript only and will happily pass a broken template.

### Verifying a change

```bash
npx prettier --check .    # 1. formatting
npm run build             # 2. templates + budgets
npm test -- --watch=false # 3. unit tests
```

---

## How it is put together

```
src/
  main.ts                 bootstrapApplication
  app/
    app.ts / .html        shell: skip link, header, main, footer
    app.config.ts         application providers
    sections/             one component per section (8)
    layout/               site-header, site-footer
  styles.scss             the ONLY global stylesheet
  styles/                 _reset _tokens _typography _layout _components _motion _utilities
  assets/
    fonts/                self-hosted OFL variable fonts + licences
    images/               photography, imported from TypeScript (see assets/README.md)
public/                   _redirects + _headers (copied verbatim into the deploy root)
```

### Where styles live — the rule that matters most

**Shared and reusable styling goes in `src/styles.scss` and its partials. A component stylesheet
contains only what is genuinely local to that component.**

This is not a style preference, it is enforced by the build. `angular.json` sets an
`anyComponentStyle` budget of **4 kB warning / 8 kB error** on each component's compiled CSS, and
`@use`-ing a shared partial does _not_ share those bytes — Sass inlines them, so a 200-byte
`hero.scss` that pulls in a 10 kB partial fails the build. The global stylesheet is exempt from that
budget and measured only against the `initial` bundle.

Components therefore consume the design system through **CSS custom properties** (inherited at
runtime, zero compiled cost) and global classes like `.btn`, `.eyebrow`, `.lede`, `.container` and
`.section--invert`. Put the next reusable rule in the global layer, not in a fourth component.

Current baseline: **204.23 kB raw / 57.47 kB transfer** initial, against a 500 kB / 1 MB budget.

---

## Design system

Tokens live in `src/styles/_tokens.scss` as CSS custom properties.

- **Palette** — warm paper and bone grounds, near-black ink, a clay accent. There is a paired
  `--color-bg-invert` / `--color-text-invert` set so a section can flip to a dark band with
  `.section--invert` and stay readable.
- **Type** — `Newsreader` (variable serif, 300–800, optical size 24–72) for display; `Archivo`
  (variable sans, width pinned at 100) for UI. Both self-hosted subsets with their OFL licences
  shipped alongside; no external font requests.
- **Spacing & scale** — fluid `clamp()` tokens, so responsive sizing is written once in the global
  layer instead of being re-derived in every component's media queries.

### Assets

Fonts are **copied** (stable filenames, so `index.html` preloads and `@font-face` agree); images are
**imported** from TypeScript so esbuild fingerprints them and `NgOptimizedImage` gets a runtime URL.
The rules, budgets, and the WOFF2 magic-byte trap are documented in
[`src/assets/README.md`](src/assets/README.md) — read it before adding an image or rebuilding a font.

Every asset is traceable to a licence. Photography is Unsplash only, downloaded from the website
(not the API), with provenance recorded in `images/ATTRIBUTION.md`.

---

## Motion

Motion is **progressive enhancement over an IntersectionObserver**, built on one directive and one
coordinator. There is no animation library.

- `novaReveal` marks an element, `novaReveal="image"` marks the slower image variant, and
  `novaRevealIndex` staggers siblings.
- A single `RevealCoordinator` owns **one** observer for the whole page and dispatches to whichever
  elements have entered the viewport. Per-element observers meant 24 of them.
- **Content is visible by default.** The reveal only _adds_ a transform, so if the directive or the
  observer never runs — JS off, observer unsupported, a mid-page error — the page is still readable.
  Nothing is ever hidden behind an animation that might not fire.
- Elements are revealed by removing an `is-revealed` class. That animates `transform` and `opacity`
  only, so **no reveal can cause layout shift**.
- Final timings: text **850ms**, images **950ms**, sibling stagger **120ms** (`0 / 120 / 240ms`),
  easing `cubic-bezier(0.4, 0, 0.2, 1)`.
- `prefers-reduced-motion: reduce` bypasses the observer entirely and renders everything at its
  resting state, immediately.

Both directives live in `src/app/shared/directives/`, and the CSS in `src/styles/_motion.scss`.

---

## Accessibility

Held to **WCAG AA**, because a public portfolio has to survive a real audit.

- Native semantic elements over ARIA roles; one `h1`, no heading-level skips
- Skip link to `#main`, a visible focus ring on every interactive element
- Two navigation landmarks, distinctly named (`Primary` / `Footer`)
- Every text pair meets 4.5:1 — the tightest is the footer disclosure at **4.66:1**
- Interactive targets clear the WCAG 2.5.8 AA floor of 24×24px. The wordmark and footer links sit
  at exactly 24–26px; the menu trigger and CTAs are 44px. Text-sized targets are enlarged with a
  transparent `::after` overlay rather than padding, so the hit area grows without changing the
  type. **They are not 44px everywhere** — that is the AAA-level target, not the AA requirement.
- No horizontal overflow down to **320px**, so the page reflows at 200% zoom (WCAG 1.4.10)
- `prefers-reduced-motion` is respected

Axis, colour contrast, focus order, and tap-target geometry are verified per milestone in a real
browser over CDP, not only in jsdom. Automated **AXE was deliberately not run** — it needs a dev
dependency, which is decision **D5** in [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md) and only
proposed as the optional M11. The verification here is manual and scripted, not a linting pass.

---

## Testing

**Vitest 4** with specs beside the sources (`*.spec.ts`). `describe` / `it` / `expect` are globals —
do not import them from `vitest`.

```ts
import { TestBed } from '@angular/core/testing';

await TestBed.configureTestingModule({ imports: [MyComponent] }).compileComponents();
const fixture = TestBed.createComponent(MyComponent);
await fixture.whenStable(); // before asserting async output
```

Tests default to **jsdom**, not a real browser, so DOM APIs jsdom lacks will fail here while working
in production. Pass `--browsers` to run in a real browser.

Visual and layout claims are checked separately by CDP harnesses driving headless Chrome across
360 / 390 / 768 / 1024 / 1280 / 1440 widths, plus a 320px reflow pass. Those scripts live outside the
repo; the findings and known caveats are recorded in [`PROJECT_MAP.md`](PROJECT_MAP.md).

---

## Live site

**https://nova-furniture.pages.dev**

Deployed on Cloudflare Pages. The `nova.pages.dev` subdomain was not an option — it is already owned
by an unrelated GitHub Pages site, so it sits outside Cloudflare's namespace and can never be claimed
here.

## Deploying

This is a **Direct Upload** project, deployed with Wrangler rather than the dashboard or a Git
integration. That is a one-way door: Cloudflare does not allow switching a Direct Upload project to
Git integration afterwards, so there is no automatic deploy on push — run `npm run deploy` instead.

```bash
npm run deploy
```

That runs the production build, stages it, and uploads it in one step. The individual pieces:

```bash
npm run build           # -> dist/nova/browser
npm run deploy:package  # -> deploy/  (flat copy, index.html at the root)
npx wrangler pages deploy deploy --project-name nova-furniture --branch main
```

Wrangler is invoked through `npx` rather than added as a dependency, so installing this project does
not pull a deploy tool into `node_modules`. First run needs `npx wrangler login`.

| Setting            | Value               |
| ------------------ | ------------------- |
| Project name       | `nova-furniture`    |
| Production branch  | `main`              |
| Deploy directory   | `deploy/`           |
| Node version       | `24.x`              |
| Build output (raw) | `dist/nova/browser` |

Three things that catch people out:

- **The upload root must contain `index.html`.** `npm run deploy:package` exists for this reason. The
  raw build output is nested (`dist` → `nova` → `browser`), so uploading `dist` or `dist/nova` puts
  `index.html` one or two levels deep and every route 404s. Uploading `dist/nova/browser` by hand
  works, but is easy to get wrong.
- **`public/_redirects` and `public/_headers` are copied verbatim into the upload root.** `_redirects`
  serves `index.html` for unmatched paths, which is what makes deep links work — **edit `public/`,
  not Angular code, to change that.** `_headers` keeps `/index.html` uncached while hashed bundles
  are immutable, which matters because `outputHashing` is `all`.
- **The dashboard's drag-and-drop uploader is not worth using here.** It stalls on the nested `media/`
  folder and reports nothing useful. Wrangler uploaded the same 23 files in about 4 seconds.

Cloudflare caps a deploy at **20,000 files** and **25 MiB per file**, which is why images go through
`NgOptimizedImage` rather than being imported wholesale. The current build output is **23 files,
~2.07 MB** — far inside both caps.

Because this is a Direct Upload project, nothing deploys on push; the live site only changes when
`npm run deploy` runs. That matters when debugging metadata: `public/_redirects` serves `index.html`
for unmatched paths, so **a missing asset answers `200` with HTML instead of a `404`**. Check the
`Content-Type` before concluding a file is deployed.

Wrangler needs `deploy/` to be a folder — it does not accept a zip. Only the dashboard accepts a zip,
which is the other reason the dashboard path is not the one to use.

### Automatic deploys on push

`.github/workflows/deploy.yml` runs the same deploy on every push to `main`, so once the secrets
below are set you never need `npm run deploy` again. It runs formatting, build and tests first, so a
broken change cannot reach production.

Note that this is **not** Cloudflare's Git integration — it is GitHub Actions calling
`wrangler pages deploy`, which keeps working on a Direct Upload project. It cannot be replaced by Git
integration later, only complemented.

Two repository secrets are required. Both are set under
**Settings → Secrets and variables → Actions → New repository secret**.

#### 1. `CLOUDFLARE_API_TOKEN`

1. Open the [Account API tokens](https://dash.cloudflare.com/profile/api-tokens) page.
2. **Create Token**.
3. Either use the **Edit Cloudflare Workers** template, or choose **Create Custom Token** and add:
   - Permission: `Account` → `Cloudflare Pages` → `Edit`
   - Account Resources: **Include** → your single account (not "All accounts")
4. Copy the token — Cloudflare shows it once.

`Account → Cloudflare Pages → Edit` is the minimum for `wrangler pages deploy`. If you also expect to
deploy Workers later, add `Account → Workers Scripts → Edit`.

#### 2. `CLOUDFLARE_ACCOUNT_ID`

The account ID for the account that owns the project. Find it by running:

```bash
npx wrangler whoami
```

It prints an **Account ID** line for the account that owns the project. That value is account-specific
and is not reproduced here. The Cloudflare Pages deployment is used for production hosting. It also
appears in the Cloudflare dashboard URL when a project is selected.

#### A note on the token

A `CLOUDFLARE_API_TOKEN` is effectively a deploy key: anyone holding it can publish to your Pages
project. It belongs in GitHub's secret store and nowhere else — not in `wrangler.toml`, not in a
`.env` that gets committed, not in a workflow file. The workflow references it only as
`${{ secrets.CLOUDFLARE_API_TOKEN }}`.

If the token ever leaks, revoke it in the same dashboard page and create a replacement. Rotating it
means updating the GitHub secret, nothing else.

You can confirm CI is wired up by pushing any commit and watching the **Deploy to Cloudflare Pages**
run in the repository's Actions tab. Until the secrets exist the workflow will fail at the deploy
step with an authentication error — the build and test steps still run first.

---

## Project documentation

Three files carry the reasoning that is not recoverable from the code:

- **[`docs/CASE_STUDY.md`](docs/CASE_STUDY.md)** — the portfolio write-up: design direction,
  architecture, data strategy, accessibility, performance, and the engineering decisions
- **[`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md)** — the approved plan, milestone by milestone,
  and the numbered decisions (D1–D5) with their rationale
- **[`PROJECT_MAP.md`](PROJECT_MAP.md)** — the living architecture map: composition tree, component
  inventory, per-milestone measurements, verification results, and known caveats

If you change the design system or the section structure, update `PROJECT_MAP.md` in the same
change.

---

## Conventions worth respecting

A few rules that are easy to break by accident:

- **Zoneless.** Change detection is signal-driven. Mutating a plain property or an RxJS value
  outside a signal or `async` pipe will not re-render. Use `signal()`, `update()`, `computed()`.
- **Don't write `standalone: true`** — it is the default since v20, and every standalone directive
  must be listed in the component's `imports` array.
- **Don't write `changeDetection: ChangeDetectionStrategy.OnPush`** — OnPush is the v22 default.
- **Use `input()` / `output()` / `model()`**, not decorators. Prefer the `@Service` decorator over
  `@Injectable({ providedIn: 'root' })`, and `inject()` over constructor injection.
- **No new dependencies without discussion.** The project ships zero runtime dependencies and no UI
  library; that restraint is the point.
- **No fabricated claims** — no testimonials, reviews, ratings, customer counts, or press logos. D4
  replaced testimonials with a Craft & Process section for exactly this reason.

---

## Licence

No `LICENSE` file has been added yet — that choice belongs to the repository owner.

Bundled assets keep their own terms: fonts are SIL OFL 1.1 (licence text ships in
`src/assets/fonts/`), photography is under the Unsplash licence with provenance in
`images/ATTRIBUTION.md`.
