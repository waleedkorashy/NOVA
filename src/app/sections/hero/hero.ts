import { IMAGE_LOADER, NgOptimizedImage, type ImageLoaderConfig } from '@angular/common';
import { Component } from '@angular/core';
import heroLarge from '../../../assets/images/nova-hero-1800.webp';
import heroSmall from '../../../assets/images/nova-hero-960.webp';

/** Narrowest delivered variant; anything at or below this width uses it. */
const SMALL_VARIANT_WIDTH = 960;

/**
 * Hero — the LCP element and the only `<h1>` on the page.
 *
 * Composition follows IMPLEMENTATION_PLAN §7: asymmetric split, headline + copy
 * + both CTAs on the left, large lifestyle image on the right. Deliberately NOT
 * the conventional "copy centred above image centred below" marketing stack.
 *
 * The original art direction bled the image off the right edge into a 4:5 portrait
 * frame. At 100% zoom that made the photograph TALLER than a 720px window and threw
 * away half its width, so the frame was pinned to the photograph's own 3:2 and the
 * bleed removed. See the note block in `hero.scss`.
 *
 * ## Image
 *
 * `nova-hero-{960,1800}.webp` — photograph by Claudio Schwarz. Provenance is
 * recorded in `src/assets/images/ATTRIBUTION.md`.
 *
 * The supplied photograph is 3:2 landscape (1800×1200) and the Hero frame is
 * pinned to that same 3:2, so `object-fit: cover` has nothing to crop and the
 * photograph is never distorted or re-cropped to fit a box.
 */
@Component({
  selector: 'app-hero',
  imports: [NgOptimizedImage],
  // `NgOptimizedImage` has no per-image `loader` input in this Angular version —
  // loaders come from the `IMAGE_LOADER` token. Scoping the provider to this
  // component keeps the width mapping local: a global loader in `app.config.ts`
  // would be invented infrastructure that every later image would have to adopt.
  providers: [
    {
      provide: IMAGE_LOADER,
      useValue: (config: ImageLoaderConfig): string => {
        // Only this component's own image participates; anything else passes through.
        if (config.src !== heroLarge) {
          return config.src;
        }
        return (config.width ?? Number.POSITIVE_INFINITY) <= SMALL_VARIANT_WIDTH
          ? heroSmall
          : heroLarge;
      },
    },
  ],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {
  /**
   * `NgOptimizedImage` requires an `ngSrc`; the loader above decides what is
   * actually served, and `ngSrcset` in the template drives which widths it asks for.
   */
  readonly image = heroLarge;

  /**
   * Rough share of the viewport the photograph occupies, set on the element so the
   * browser can choose a variant before the file downloads — the hero is the LCP
   * element, so an un-hinted 1800px file on a phone is a real cost.
   *
   * `45vw` at 64rem up: the image column measures ~48vw at 1440, ~47vw at 1024 and
   * ~39vw on a 1920 display once `--hero-media-max` starts binding, so 45vw sits
   * mid-range. `90vw` below 64rem: the media now sits inside the gutters rather
   * than spanning them, and measures ~89vw at both 360 and 390.
   */
  readonly sizes = '(min-width: 64rem) 45vw, 90vw';

  /** Intrinsic dimensions of the largest delivered file — reserves space, prevents CLS. */
  readonly width = 1800;
  readonly height = 1200;
}
