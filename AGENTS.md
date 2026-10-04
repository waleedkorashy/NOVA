# NOVA — agent instructions

Personal portfolio landing page. Frontend only: **no backend, no API layer, no UI component library.**
Stack: Angular 22.2 (standalone, zoneless) · TypeScript 6.0 · SCSS · Vitest · Cloudflare Pages.

## Commands

```bash
npm start                                      # ng serve -> http://localhost:4200
npm run build                                  # production build (default configuration)
npm run watch                                  # incremental development build
npm test -- --watch=false                      # one-shot test run — ALWAYS pass this
npm test -- --watch=false --filter="^App"      # regex over suite + test names
npx ng generate component hero                 # -> src/app/hero/hero.{ts,html,scss}
npx prettier --write .                         # format (this is the only style tool)
npx prettier --check .                         # format check
```

Gotchas:

- **`npm test` watches by default in a TTY.** `watch` is `true` when stdout is a terminal,
  `false` otherwise. An interactive agent will hang on a bare `npm test`. Always use `--watch=false`.
- **There is no lint script and no ESLint.** Prettier is the only style enforcement. Don't invent
  `npm run lint`, and don't claim lint passed.
- **Verify in this order:** `npx prettier --check .` -> `npm run build` -> `npm test -- --watch=false`.
  `npm run build` is the only command that runs the **Angular template typechecker**; a bare
  `npx tsc --noEmit` typechecks TS only and will pass on broken templates. Use
  `npx tsc --noEmit -p tsconfig.app.json` only for fast TS-only feedback.
- **No e2e target exists.** `ng e2e` fails with `Cannot find "e2e" target`, even though `README.md`
  documents it. Don't cite `README.md` as authoritative — it is stale CLI boilerplate.

## Deploy: Cloudflare Pages

Set in the Cloudflare dashboard (no wrangler/Pages config file is committed):

| Setting          | Value               |
| ---------------- | ------------------- |
| Framework preset | None                |
| Build command    | `npm run build`     |
| Build output dir | `dist/nova/browser` |
| Node version     | `24.x`              |

- **The output dir is `dist/nova/browser`, not `dist/nova`.** `angular.json` uses the
  `@angular/build:application` builder, which nests output under `browser/`.
  `3rdpartylicenses.txt` lands one level _above_ it and is not deployed.
- `public/_redirects` and `public/_headers` are copied verbatim into the output root by the
  `public` asset glob in `angular.json`. Verified present in `dist/nova/browser/`. This is why deep
  links work — `_redirects` serves `index.html` for unmatched paths. Editing `public/` changes the
  deployed behavior without any Angular code involved.
- Cloudflare Pages caps a deploy at **20,000 files** and **25 MiB per file**. Prefer
  `NgOptimizedImage` and compressed assets; a naive `assets/` import of large images will silently
  inflate the deploy or blow the file limit.
- Output uses `outputHashing: "all"`, so `/index.html` must stay uncached while hashed bundles are
  immutable. That split is already encoded in `public/_headers`.
- No CI workflow exists yet. Add one if you need PR previews.

## Angular 22 conventions (version-specific — do not apply these to older Angular)

- **Zoneless: `zone.js` is not a dependency.** Change detection is signal-driven. Mutating a plain
  class property or an RxJS value outside a signal/`async` pipe **will not re-render**. Use `signal()`,
  `update()`, `set()`, `computed()`.
- **Do not write `standalone: true`** — it is the default since v20, and all standalone directives
  must be listed in the component's `imports` array.
- **Do not write `changeDetection: ChangeDetectionStrategy.OnPush`** — OnPush is the v22 default.
- **Prefer the `@Service` decorator** over `@Injectable({ providedIn: 'root' })` for new singletons (v22+).
  Use `inject()`, never constructor injection.
- **Signal Forms (`@angular/forms/signals`)** are stable in v22 — use them for new forms over
  template-driven ones. `@angular/forms` is already a dependency.
- Use `input()` / `output()` / `model()` functions, not decorators. `linkedSignal()` for state derived
  from multiple sources that must stay in sync.
- Use native control flow (`@if` / `@for` / `@switch`), and `class` / `style` bindings rather than
  `ngClass` / `ngStyle`.
- Host bindings go in the `host` object of the decorator, never `@HostBinding` / `@HostListener`.
- `NgOptimizedImage` for all static images. It does **not** work for inline base64 images.

## TypeScript

- **TypeScript 6.0 makes `strict` the implicit default.** No tsconfig in this repo contains
  `"strict": true` — strict checks are still fully on (verified: an implicit `any` parameter is a
  `TS7006` error). Don't "fix" the missing flag or assume strict is off.
- `tsconfig.json` is a solution-style file with `files: []` that references `tsconfig.app.json`
  and `tsconfig.spec.json`. App code is `include: ["src/**/*.ts"]` with `**/*.spec.ts` excluded.
- Extra guards already enabled: `noImplicitOverride`, `noPropertyAccessFromIndexSignature`
  (use bracket access for index signatures), `noImplicitReturns`, `noFallthroughCasesInSwitch`.
- Prefer inference for obvious types; use `unknown` rather than `any`.

## Architecture and layout

Single app `nova`. No workspace libraries, no monorepo — do not create a `projects/` tree.

```
src/main.ts                 bootstrapApplication(App, appConfig)
src/app/app.ts              root component, class App, selector app-root
src/app/app.config.ts       ApplicationConfig providers
src/app/app.routes.ts       routes: Routes = []   <-- currently EMPTY
src/app/app.html            Angular welcome splash (scaffold placeholder — replace)
src/styles.scss             the ONLY global stylesheet
src/styles/                 _reset _tokens _typography _layout _components _motion _utilities
src/assets/                 fonts/ (OFL woff2) + images/ + README.md   (see src/assets/README.md)
public/                     static assets + _redirects + _headers
```

- **`app.routes.ts` is an empty array while `app.ts` imports `RouterOutlet`.** The root component
  renders only the router outlet, so it currently displays nothing but the placeholder `app.html`.
- **Routing is approved for removal (milestone M1).** NOVA is a single-page landing page, so
  `@angular/router`, `<router-outlet>`, and `app.routes.ts` are all being deleted; navigation becomes
  semantic in-page anchors (`#collection`, `#about`, `#journal`, `#contact`). **This has not happened
  yet** — the dependency is still installed. Do not add new routes or `routerLink`s; the target state
  has no router. If you find `RouterOutlet` still wired up, M1 has not run yet.
- Full architecture, milestones, and the approved design system: `IMPLEMENTATION_PLAN.md` and
  `PROJECT_MAP.md`. Read those before building any section — they carry decisions and constraints
  that are not derivable from the code.
- **2025 file-name style guide is active** (Angular CLI default in v22). `ng g c hero` produces
  `hero/hero.ts`, `hero/hero.html`, `hero.scss` — **not** `hero.component.ts`. Class is `Hero`,
  default selector `app-hero` (prefix `app` in `angular.json`). Template/style URLs are relative
  to the component's TS file.
- The `@schematics/angular:component` entry in `angular.json` sets `style: "scss"`, so generated
  components get `.scss` by default.
- `src/app/app.scss` is still **0 bytes** and that is correct — no component has styles yet. View
  encapsulation is `Emulated` (default).

### Bundle budgets — these fail the build

From `angular.json` `configurations.production.budgets`:

| Type                | Warn   | Error |
| ------------------- | ------ | ----- |
| `initial`           | 500 kB | 1 MB  |
| `anyComponentStyle` | 4 kB   | 8 kB  |

- **Any single component's compiled SCSS over 8 kB fails `npm run build`.** This is the most likely
  way a design-heavy landing page breaks the build. Split styles into shared partials under
  `src/styles.scss` or child components rather than growing one component stylesheet.
- Current baseline: **216 kB raw / ~59 kB transfer** initial. Recheck before adding a heavy dependency.

#### How `anyComponentStyle` is actually measured — read this before writing any component SCSS

Verified in the installed builder, not assumed:

- `@angular/build/src/tools/esbuild/budget-stats.js:48-64` emits each **component** stylesheet as a
  separate metafile output tagged `ng-component`, recorded with `size: entry.bytes` — its
  **compiled CSS** — and labelled with that component's **input `.scss` path**.
- `AnyComponentStyleCalculator` (`@angular/build/src/utils/bundle-calculator.js:230`) selects every
  asset flagged `componentStyle`, so each is measured individually against the 4 kB / 8 kB limit.

Two consequences that are easy to get wrong:

1. **`@use`-ing a shared SCSS partial inside a component's stylesheet does NOT share bytes.** A
   200-byte `hero.scss` that `@use`s a 10 kB partial compiles to ~10 kB and **fails the 8 kB error**.
   Sass inlining is what makes the number large; there is no shared pool to borrow from.
2. **The global `styles.scss` is never tagged `ng-component`** (`budget-stats.js:31-33` filters it
   out), so it is **exempt from `anyComponentStyle` entirely** and is measured only against
   `initial` — 500 kB warn / 1 MB error, roughly 125x the headroom.

**The rule:** shared and reusable styling goes in `src/styles.scss` and its `_partials`; a component
`.scss` contains **only** what is genuinely local to that component. Components consume the system
through CSS custom properties (inherited at runtime, zero compiled cost) and global classes (already
shipped). Prefer fluid `clamp()` type and spacing tokens in the global layer so responsive work is
written once instead of in every component's media queries.

**Treat the 4 kB warning as the working limit.** If a component crosses it, move the shared part into
the global layer or split the component. Do **not** raise `anyComponentStyle` in `angular.json` as
the first response — the budgets are deliberately strict and raising them is a last resort requiring
an explicit written justification.

## Testing

- **Vitest 4** via the `@angular/build:unit-test` builder (`angular.json` `test` target). Not Karma,
  not Jest. There is no `vitest.config.*` and no separate test config — options come from `ng test` flags.
- **jsdom, not a real browser, by default.** DOM APIs that jsdom lacks will fail here but work in
  production. Pass `--browsers` to run in a real browser.
- `describe` / `it` / `expect` are **globals** — `tsconfig.spec.json` sets `types: ["vitest/globals"]`.
  Do not import them from `vitest`.
- Use `TestBed.configureTestingModule({ imports: [Component] })` for standalone components; there are
  no NgModules to import.
- `await fixture.whenStable()` before asserting on rendered async output.
- Specs live beside sources as `*.spec.ts`. Useful flags: `--filter` (regex), `--include`,
  `--list-tests`, `--coverage`.

## Known scaffold coupling

`src/app/app.spec.ts:21` asserts the root template renders `<h1>Hello, {{ title() }}</h1>`, which is
part of the ~20 kB Angular welcome splash in `src/app/app.html` (line 246). **Replacing `app.html`
with the real landing page will break that test** — update or delete the assertion in the same change,
or the suite will fail for a reason unrelated to your work.

## Project rules that are not negotiable

- **No fabricated social proof.** Never add testimonials, reviews, ratings, star ratings, customer
  counts, press logos, revenue, or conversion figures. Approved decision D2 replaced testimonials
  with a Craft & Process section. This is a portfolio integrity requirement, not a style preference.
- **No invented contact details.** No real email addresses, phone numbers, or addresses.
- **No backend scope creep.** This is a landing page. Auth, cart, checkout, payments, dashboards, CMS,
  and APIs are explicitly out of scope unless newly requested.
- **No new dependencies without explicit approval.** The project ships zero runtime dependencies and
  no animation or UI library.
- **Verify fonts are real WOFF2, not just named `.woff2`.** `fontTools.subset.save_font()` chooses
  the output container from `Options.flavor`, **not** from the file extension. With `flavor` unset it
  silently writes a TrueType/sfnt container (magic `00 01 00 00`) into a file called `*.woff2`. Every
  browser rejects that when `@font-face` declares `format('woff2-variations')` and falls back to the
  system serif/sans — no build error, no console warning about the _font_, just a design that quietly
  stops being NOVA. **Check the first four bytes are `wOF2` (`119,79,70,50`) after any font rebuild.**
  This already happened once and was only caught by inspecting magic bytes, not by the build.
- **Budgets stay as they are.** Do not raise `anyComponentStyle` as the first response to a styling
  overflow — refactor to the global layer first (§ above).

## Accessibility

This is a public portfolio, so it is held to WCAG AA: it must pass AXE checks, with correct focus
management, color contrast, and ARIA attributes. Prefer native semantic elements over ARIA roles.
