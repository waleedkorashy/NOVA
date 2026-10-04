import { IMAGE_LOADER, NgOptimizedImage, type ImageLoaderConfig } from '@angular/common';
import { Component } from '@angular/core';

import { SectionHeading } from '../../ui/section-heading/section-heading';

import editorialLarge from '../../../assets/images/nova-editorial-1200.webp';
import editorialSmall from '../../../assets/images/nova-editorial-640.webp';

/** Narrowest delivered variant; anything at or below this width uses it. */
const SMALL_VARIANT_WIDTH = 640;

/**
 * Editorial / Lifestyle — the page's quiet break between the collection and
 * whatever comes next (M5).
 *
 * ## Why this section exists, and what it must not become
 *
 * The page so far argues a product: a hero promise, a catalogue, three principles,
 * a method. Everything up to here is either a specification or a claim. This is
 * the first section whose only job is ATMOSPHERE — the room the furniture is
 * imagined to live in. Plan §7 asks for it to be "intentionally not a grid", with
 * "one large image, an offset caption block, generous negative space, a pull-quote
 * in the display serif", and that is exactly what is built here.
 *
 * The two failure modes it has to avoid, in order of likelihood:
 *
 *  1. **A second product grid.** The Featured Collection is the one legitimate
 *     card grid on the page. Repeating a smaller version of it here would make the
 *     page read as a template. So there is no list, no `ui-product-card`, and
 *     exactly one image.
 *  2. **A second Craft & Process.** M4 proved that numbered prose blocks drift
 *     back into SaaS feature grids when left alone. Nothing here is numbered,
 *     boxed, shadowed, or given a surface change.
 *
 * ## Copy discipline
 *
 * This is a fictional brand concept, so the copy states atmosphere and philosophy
 * and asserts nothing factual about a business: no customers, no years, no awards,
 * no sustainability statistics, no reviews, no manufacturing claims. Every sentence
 * is either a description of how a room behaves or an editorial position. That is a
 * structural property, not a tone preference, so `editorial.spec.ts` asserts the
 * rendered text against the same fabrication vocabulary `craft-process.spec.ts`
 * uses, rather than trusting review to catch it.
 *
 * ## Image
 *
 * `nova-editorial-{640,1200}.webp` — photograph by Alexander Lunyov (@sunify).
 * Provenance, licence and the per-file crop note are recorded in
 * `src/assets/images/ATTRIBUTION.md`.
 *
 * The source is 4160×6240 (2:3 portrait). It is downscaled to both variants with
 * NO crop, so the delivered pixels are the whole frame; the 4:5 crop you see is
 * applied at render time by `object-fit: cover` on the frame, not baked into the
 * file. That is deliberate: it keeps the source recoverable and the art direction
 * changeable in CSS.
 *
 * ## `#journal`
 *
 * Plan §4.4 maps the "Journal" nav item onto this component because no separate
 * Journal section is planned — `app-editorial` is the page's most editorial,
 * image-led content and reads naturally as journal material. So `id="journal"` is
 * declared HERE, on the real section, and the M1 `#journal` placeholder has been
 * removed from the shell. There is exactly one owner, which is what keeps
 * fragment navigation from silently breaking (app.spec.ts asserts the count).
 */
@Component({
  selector: 'app-editorial',
  imports: [NgOptimizedImage, SectionHeading],
  // Same scoped-loader approach as the Hero, and for the same reason: a global
  // loader would be invented infrastructure every later image would have to adopt.
  // It only participates in this component's own image.
  providers: [
    {
      provide: IMAGE_LOADER,
      useValue: (config: ImageLoaderConfig): string => {
        if (config.src !== editorialLarge) {
          return config.src;
        }
        return (config.width ?? Number.POSITIVE_INFINITY) <= SMALL_VARIANT_WIDTH
          ? editorialSmall
          : editorialLarge;
      },
    },
  ],
  templateUrl: './editorial.html',
  styleUrl: './editorial.scss',
})
export class Editorial {
  readonly image = editorialLarge;

  /**
   * Share of the viewport the frame occupies, so the browser can pick a variant
   * before the file downloads.
   *
   * Derived from the grid spans in `editorial.scss`: the image is 5 of 12 columns
   * at 64rem (≈37% of the viewport at 1024/1280/1440), 4 of 6 at 48rem (≈61% at
   * 768), and the full container below that (≈90% at 360/390). Rounded up, because
   * under-hinting here costs a 155 kB file where 53 kB would do.
   */
  readonly sizes = '(min-width: 64rem) 31vw, (min-width: 48rem) 46vw, 76vw';

  /** Intrinsic dimensions of the largest delivered file — reserves space, prevents CLS. */
  readonly width = 1200;
  readonly height = 1800;
}
