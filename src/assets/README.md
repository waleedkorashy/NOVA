# NOVA — asset pipeline

**Fonts are copied verbatim; images are imported.** The two paths differ on purpose:

- `src/assets` has an `ignore: ["images/**/*"]` entry in `angular.json`, so fonts, licence files and
  this README land un-hashed in `dist/nova/browser/assets`. Filenames are stable so `index.html`
  font preloads and CSS `@font-face` agree on the URL.
- Images under `src/assets/images/` are **excluded** from that glob and instead `import`ed from
  TypeScript. `angular.json` maps `.webp` to esbuild's `file` loader, so an import resolves to a
  content-hashed file emitted under `dist/nova/browser/media/`, and yields its runtime URL — which is
  what `NgOptimizedImage` requires. `src/assets.d.ts` declares the module type.
- Consequence: an image placed in `public/` or referenced by a hand-written `/assets/images/...`
  string will 404, because that path is never emitted. Importing is enforced by the build, not by
  convention.

## Budgets and hard limits

| Constraint                       | Limit    |
| -------------------------------- | -------- |
| Per image                        | ≤ 250 KB |
| All images combined              | ≤ 3 MB   |
| Deploy file count (Cloudflare)   | < 20,000 |
| Largest single file (Cloudflare) | < 25 MiB |

Current usage: **~180 KB** of fonts (two variable subsets, no licence text counted) plus **~1.63 MB**
of photography across **10** images, leaving ~1.4 MB of headroom under the 3 MB total. Every image is
inside the ≤ 250 KB per-image limit.

Compress before committing — use WebP or AVIF, never PNG for photographic content, and never ship a
raw un-subset font.

## Fonts must be real WOFF2

`fontTools.subset.save_font()` selects the output **container** from `Options.flavor`, not from the
file extension. With `flavor` unset it writes a TrueType/sfnt container (`00 01 00 00`) into a file
called `*.woff2`, and every browser rejects it when `@font-face` declares
`format('woff2-variations')` — silently falling back to the system stack, with no build error.

After any font rebuild, confirm the first four bytes are `wOF2` (`119, 79, 70, 50`). A green
`npm run build` does not check this.

## Licensing rules

Every asset must be traceable to a licence that permits use here. Record provenance in
`images/ATTRIBUTION.md` at the moment of download — not afterwards.

- **Fonts** — Newsreader and Archivo, SIL OFL 1.1, from the Google Fonts repository. Licence text
  ships next to each file in `fonts/`. Redistribution is permitted provided the OFL travels with the
  font. Both are self-hosted variable subsets with no external requests.
- **Photography** — Unsplash only, and only assets obtained **from the Unsplash website itself**.
  Downloading via the Unsplash API is prohibited for this project because API access imposes a
  mandatory, separate Unsplash + photographer attribution requirement that this landing page cannot
  satisfy without inventing a credit block. Web downloads carry the standard Unsplash licence.
  Photographer credit is still recorded in `images/ATTRIBUTION.md` regardless of licence.
- **Never** download assets at random. No unlicensed images, no scraped stock, no AI-generated filler.
- **Never** fabricate a claim attached to an asset — no stock photo implying a testimonial, a
  customer, or a fabrication step NOVA does not perform.

## Serving images

Use `NgOptimizedImage` with explicit `width` and `height` for static images. It is not compatible
with inline base64 data URIs. Always set both dimensions to prevent layout shift.

In this Angular version `NgOptimizedImage` has **no per-image `loader` input** — the loader comes from
the `IMAGE_LOADER` token. To ship more than one width of a local file, scope a loader to the
component that owns the image (see `src/app/sections/hero/hero.ts`) rather than adding a global
provider, and declare the widths with `ngSrcset`:

```html
<img
  [ngSrc]="image"
  ngSrcset="960w, 1800w"
  [sizes]="sizes"
  [width]="1800"
  [height]="2250"
  priority
  alt="…"
/>
```

The loader is called once per declared width, so it maps each width to the matching imported file.
`priority` (not `loading`) is what marks the LCP image; it sets `loading="eager"` and
`fetchpriority="high"` automatically. Hashed `/media/*.webp` files are cached immutably via
`public/_headers`.

## Layout shape

```
src/assets/
  fonts/                 <- self-hosted OFL variable fonts + licence files
    Archivo-Variable.woff2      49,568 B  wght 100-900 (wdth pinned at 100)
    Archivo-OFL.txt
    Newsreader-Variable.woff2  134,572 B  wght 300-800, opsz 24-72
    Newsreader-OFL.txt
  images/                <- curated photography, IMPORTED (not copied, not public/)
    ATTRIBUTION.md
    nova-hero-960.webp    190,040 B  960x640   Claudio Schwarz · Unsplash
    nova-hero-1800.webp   245,804 B  1800x1200 Claudio Schwarz · Unsplash
```

## M2 placeholders are gone

`hero-TEMPORARY-*.webp` were flat-colour swatches used only to prove the import → fingerprint →
`NgOptimizedImage` pipeline while no photograph was available. They have been deleted along with the
guard test that blocked their shipping. The Hero now uses the real photograph by Claudio Schwarz;
provenance is in `images/ATTRIBUTION.md`.
