# NOVA — image attribution

Provenance record for every photograph shipped in `src/assets/images`. **One row per file.**
Record it at download time, not later.

## Rules

1. **Unsplash website downloads only.** Do not use the Unsplash API — API access imposes a
   separate mandatory attribution requirement that this project has deliberately declined. See
   `src/assets/README.md`.
2. **Record the specific asset URL**, not just the photographer name. A bare name is not provenance.
3. **Record the photographer**, even though the standard Unsplash licence does not require a credit.
4. **No fabricated claims.** Do not caption an image with a testimonial, a customer name, a review,
   a rating, or a fabrication step NOVA does not actually perform. Editorial captions describe what
   the photograph shows, nothing more.
5. Compress to ≤ 250 KB (WebP or AVIF) before committing, and check the actual file size.
6. Delete the row if the file is deleted. A stale entry is worse than no entry.

## Register

One row per delivered file. Rows for the same photograph at two widths repeat the
credit — a file with no row is a file with no provenance.

| File                  | Asset URL                                                              | Photographer    | Licence  | Retrieved  | Bytes   | Caption / alt text                                                                                                                        |
| --------------------- | ---------------------------------------------------------------------- | --------------- | -------- | ---------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `nova-hero-960.webp`  | https://unsplash.com/photos/a-room-with-a-couch-and-chairs-lc0gdYqrRzs | Claudio Schwarz | Unsplash | 2026-10-01 | 190,040 | Interior with a sofa and two lounge chairs on wood flooring, a patterned wall, daylight from a window and warm pendant lighting overhead. |
| `nova-hero-1800.webp` | https://unsplash.com/photos/a-room-with-a-couch-and-chairs-lc0gdYqrRzs | Claudio Schwarz | Unsplash | 2026-10-01 | 245,804 | _(same photograph as above — the 1800px variant)_                                                                                         |

Dimensions: 960×640 and 1800×1200, both 3:2 landscape. WebP (`RIFF`/`WEBP` container verified).

## Product photography — M3 collection

Six collection cards, all normalised to **1200×1500 (4:5) WebP**. Every one is
`RIFF`/`WEBP`/`VP8` verified, ≤ 250 KB, and carries the alt text used in
`src/app/shared/data/products.ts`.

> **Photographer credits were confirmed by the maintainer by opening each source
> page directly.** They were not resolved automatically: Unsplash returns
> **HTTP 401** to automated requests on every route tried (the page URLs below,
> `unsplash.com/napi/photos/<id>` and the API host), and the supplied originals
> carried no EXIF to fall back on. The names below are therefore the maintainer's
> manual reading of the credit line on each page, recorded here as-is.

| File                        | Asset URL                                                                                  | Photographer                      | Licence  | Retrieved  | Bytes   | Caption / alt text                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------- | -------- | ---------- | ------- | -------------------------------------------------------------------------------------------------------- |
| `nova-forma-sofa.webp`      | https://unsplash.com/photos/a-modern-gray-sectional-sofa-in-a-minimalist-room-MRx-rSdOKtk  | Costa Live (@vendedorescostalive) | Unsplash | 2026-10-02 | 76,842  | Low grey modular sofa with a wide seat and slim arms, in a bare room with daylight from the left.        |
| `nova-arc-lounge.webp`      | https://unsplash.com/photos/wooden-lounge-chair-with-woven-seat-and-back-6-UGgxSGblE       | The_iop                           | Unsplash | 2026-10-02 | 245,008 | Wooden lounge chair with a curved back and a woven seat, angled beside a plain wall.                     |
| `nova-line-chair.webp`      | https://unsplash.com/photos/a-simple-wooden-chair-stands-on-a-white-background-WsGw2d7qq7Q | ObjectType RAW                    | Unsplash | 2026-10-02 | 39,294  | Simple wooden dining chair with a flat back and four tapered legs, on a plain pale ground.               |
| `nova-frame-sideboard.webp` | https://unsplash.com/photos/a-living-room-with-a-dresser-and-a-mirror-HfArPZ6pBM0          | Jacalyn Beales                    | Unsplash | 2026-10-02 | 228,556 | Long wooden sideboard with inset doors and tapered legs, standing against a wall beneath a round mirror. |
| `nova-low-table.webp`       | https://unsplash.com/photos/brown-wooden-table-with-flower-on-top-5-YtsyQGeyw              | mahdi bondar                      | Unsplash | 2026-10-02 | 248,768 | Low wooden coffee table with a cut flower laid across its top, seen from a low angle.                    |
| `nova-halo-lamp.webp`       | https://unsplash.com/photos/lighted-floor-lamp-near-table-and-chairs-46qWb-Qao_o           | Vishnu Vk                         | Unsplash | 2026-10-02 | 222,248 | Lit floor lamp with a pale shade on a slender stem, standing beside a table and chairs.                  |

All six are 1200×1500. Total product imagery 1,060,716 B; with the Hero variants,
shipped imagery was 1,496,560 B at the end of M3. M5 adds the two Editorial
variants — see the running total in "Total shipped imagery" below, which is now
the authoritative figure.

### Cropping note

Each product was cropped from the supplied original to 4:5 and re-encoded, never
stretched, so anisotropy stays under 0.05% on all six. Two crops were reviewed
against alternatives and chosen by the owner: `nova-low-table.webp` (variant D)
and `nova-halo-lamp.webp` (variant H). The other four are the initially proposed
crops, kept unchanged.

The six source JPEGs have been deleted. A repository-wide search found no
reference to them in application code, product data, tests, documentation, build
or deployment configuration, and `angular.json` excludes `images/**/*` from the
asset glob, so they were never emitted into the build output. Nothing imported
them: `src/assets.d.ts` declares only `*.webp`, so a `.jpg` import would not have
compiled. This directory now holds the ten shipped images and nothing else, per
rule 6 — no row below describes a file that is no longer here.

## Editorial / lifestyle photography — M5 journal

| File                       | Asset URL                                                                     | Photographer               | Licence  | Retrieved  | Bytes   | Caption / alt text                                                                                |
| -------------------------- | ----------------------------------------------------------------------------- | -------------------------- | -------- | ---------- | ------- | ------------------------------------------------------------------------------------------------- |
| `nova-editorial-640.webp`  | https://unsplash.com/photos/warm-sunlight-pours-through-a-doorway-fhdOrlONrm4 | Alexander Lunyov (@sunify) | Unsplash | 2026-10-03 | 54,652  | Warm sunlight pours through an open doorway into a quiet interior, falling across a wooden floor. |
| `nova-editorial-1200.webp` | https://unsplash.com/photos/warm-sunlight-pours-through-a-doorway-fhdOrlONrm4 | Alexander Lunyov (@sunify) | Unsplash | 2026-10-03 | 159,346 | _(same photograph as above — the 1200px variant)_                                                 |

Supplied by the project owner as a manual download (the automated fetch path is
blocked; see `PROJECT_MAP.md`). Original was 4160×6240 (2:3 portrait), 3,257,534 B.
Both variants are uncropped downscalings of that full frame: 640×960 and 1200×1800.
Neither file is stretched, and no crop is baked in — the 4:5 delivered frame is
applied at render time by `object-fit: cover` on the global `.figure` class, which
keeps the source recoverable and the art direction changeable in CSS.

This is the only second image on the page and it is intentionally the largest
thing in the section, so it is delivered at two widths rather than one:
`editorial.ts` declares `ngSrcset="640w, 1200w"` with a scoped `IMAGE_LOADER`, the
same pattern the Hero uses, and `sizes="(min-width: 64rem) 38vw, (min-width: 48rem)
62vw, 92vw"`. A 360px viewport at 1× picks the 53 kB variant; 2× and above picks
the 156 kB one.

### Total shipped imagery

| Group                         | Bytes                    |
| ----------------------------- | ------------------------ |
| Hero (960 + 1800)             | 435,844                  |
| Product photography (six, M3) | 1,060,716                |
| Editorial (640 + 1200, M5)    | 213,998                  |
| **Total**                     | **1,710,558** (~1.63 MB) |

Inside the ≤ 3 MB limit in `src/assets/README.md`.

### The social card is not in this register, and should not be

`public/og-image.jpg` (1200×630, 47,343 B) ships an image but is deliberately **absent from the
register above**, for two reasons:

1. **It is outside this directory.** The register covers `src/assets/images`; the card lives in
   `public/` and is copied verbatim into the build root, exactly like `_headers` and `_redirects`.
2. **It is generated, not photographed.** It is a typographic composition — `--nova-night` field,
   tracked Archivo wordmark, clay rule, tagline — drawn from this project's own tokens and its own
   OFL font subset. There is no photographer, no source URL and no third-party licence, so a
   register row would have to invent all three. Rule 4 applies: do not caption an asset with a
   provenance that does not exist.

Adding it here would be the first false row in this file.

### Caption versus alt text, for this image only

The rule above ("Alt text must not imply the furniture is NOVA product") is written
about the Hero, and it applies here for the same reason: this is somebody else's
licensed interior, not a photograph of a NOVA piece, so neither the alt text nor
the visible caption may present it as one. `editorial.spec.ts` asserts the alt
text contains no `NOVA` token.

Rule 4 also applies with extra force to a lifestyle image. The visible caption is
restricted to the **subject**; the alt text may add the composition needed to
describe the frame to a screen reader user. Hence:

- **alt** — "A quiet interior in warm afternoon light, with an open doorway casting a bright band across the room." Describes the whole frame.
- **figcaption** — "Warm sun falling through an open doorway, across a wooden floor." The short editorial line a sighted reader sees.

The two are intentionally different registers and must not be collapsed into one
another; `editorial.spec.ts` asserts they are not identical, and that the caption
carries no mood words (`quiet`, `calm`, `serene`, …), since an interpretation
dressed as description is not attribution.

**Unverified.** The interior's contents beyond the doorway, the floor material and
the direction of the light come from the owner's one-line description of the
photograph ("Warm sunlight pours through a doorway") plus the photo's own tags.
They have not been confirmed against the frame itself. If either text is revised,
correct both here and in `editorial.html` together.

### Source file

The original JPEG remains at
`C:\Users\Waleed\Desktop\NOVA PICS\alexander-lunyov-fhdOrlONrm4-unsplash.jpg`,
outside the repository, so that rule 6 ("no row describes a file that is not here")
still holds for this directory. Unlike the six M3 sources, which were deleted after
conversion, it has been left in place because it is the owner's file on their own
machine, not a build artefact this project created.

## Alt text must not imply the furniture is NOVA product

The Hero alt text describes only what is visible in the photograph. This is a licensed third-party
image of somebody else's interior, so it must not be captioned as NOVA furniture, a NOVA collection
piece, or a NOVA fabrication step. `hero.spec.ts` asserts the alt text contains no `NOVA` token, so
the rule cannot regress silently.

## Compression history for the 1800px variant

`nova-hero-1800.webp` arrived at 609,434 B after its dimensions were changed, over the ≤ 250 KB
per-image limit in `src/assets/README.md`. It was then **re-encoded in place** — same photograph,
same 1800×1200 intrinsic dimensions, same composition, still WebP:

```
ffmpeg -i nova-hero-1800.webp -c:v libwebp -quality 53 -compression_level 6 nova-hero-1800.webp
```

609,434 B → **245,804 B** (−59.7%). Measured against the pre-compression file: PSNR 32.86 dB,
SSIM 0.9427, mean absolute difference 4.16/255, and mean luma 102.34 → 102.25 (no tonal shift).
`q=53` was the highest-fidelity setting that still fit the budget; Pillow's encoder was also
tested and plateaued at a lower quality for the same byte count.

Total shipped imagery is now 435,844 B (~436 KB), well inside the ≤ 3 MB total limit. Cloudflare's
25 MiB per-file ceiling is not approached.

**Corrected at M5.** This paragraph previously read "The Hero frame is a 4:5 portrait box while this
photograph is 3:2 landscape, so `object-fit: cover` crops the left and right edges to fit." **That
stopped being true in M4.** The Hero frame is now `3 / 2` — the photograph's own ratio — so
`object-fit: cover` crops **nothing**; the whole frame is delivered, letterboxed inside the page
gutters instead of bleeding to the viewport edge. `--hero-media-max` (`clamp(260px, 56vh, 560px)`)
is what bounds it. The `aspect-ratio` + `cover` pairing is retained, because it is still what
guarantees no distortion, but there is no longer any crop to describe. Left uncorrected it would
have sent the next reader looking for a crop that does not exist.

## Format

```
| <file>.webp | https://unsplash.com/photos/<slug-id> | <Photographer Name> | Unsplash | YYYY-MM-DD | <bytes> | <descriptive alt text> |
```

The `Caption / alt text` column is required. Descriptive alt text is a WCAG AA obligation, not
optional — see `AGENTS.md`, Accessibility. Alt text describes what is visible; it never repeats
adjacent body copy.
