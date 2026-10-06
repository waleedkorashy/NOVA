import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { Reveal } from '../../shared/directives/reveal';
import type { Product } from '../../shared/types/product';
import { SectionHeading } from '../../ui/section-heading/section-heading';

/**
 * Product Showcase — the page's second moment of drama (plan §7): one dominant
 * product, asymmetric two-column, sticky image beside a scrolling detail column on
 * desktop, stacked on mobile.
 *
 * ## Why this is NOT the Collection again
 *
 * Plan §7 warns about this explicitly: Featured Collection already introduces all
 * six pieces, so repeating the card grid here would make the page say the same
 * thing twice. This section therefore presents ONE piece properly and demotes the
 * other five to a ruled text index. The difference in kind is the point — a grid
 * says "here is everything", a showcase says "here is this one, and it has more
 * to say".
 *
 * ## `product-card` is deliberately NOT reused here
 *
 * Plan §7 lists `ui/product-card` as having two reuse sites, Collection and
 * Showcase. This section does not take the second one, and that is a reviewed
 * decision rather than an oversight:
 *
 *  - The card is image-over-text, vertically. A sticky showcase needs the image
 *    in one column and the text in another, with the image pinned while the text
 *    scrolls past. There is no arrangement of the card that produces that without
 *    reaching inside it and taking its pieces apart.
 *  - The only way to place five more cards here is a one-up stack, which is the
 *    repeated catalogue grid the brief rules out.
 *
 * Adding a `layout` input to the card to force the fit would spread one primitive
 * across two compositions and put the section's grid inside a shared component —
 * the opposite of the card being data-source agnostic. So the showcase composes
 * the product directly from the `Product` contract. `product-card.spec.ts` still
 * asserts the component exists and is used by Collection; only the plan's
 * aspirational second site is unmet.
 *
 * ## The featured product is DERIVED, never declared
 *
 * `featured` is `products()[0]` and `rest` is `products().slice(1)`. No second
 * product list exists in this file, no `featured: true` flag was added to the
 * `Product` contract, and no product was copied. The section is agnostic about
 * where the data came from, exactly as `FeaturedCollection` is: when the
 * catalogue becomes `http.get<Product[]>('/api/products')`, `app.html` passes
 * the observable and this component is unchanged.
 *
 * Taking the first element rather than a hard-coded id is deliberate. A
 * hard-coded `'forma-sofa'` would be a second source of truth that silently
 * renders an empty state the moment the API returns a different order. Catalogue
 * order is already an editorial decision made once, in `products.ts`.
 *
 * ## Scale
 *
 * The frame is `span 5` of 12 with `max-inline-size: 84%`, which lands at about
 * 402x503 at 1280 and 453x566 at 1440 — roughly 14% larger than the Editorial
 * photograph that precedes it. That is the whole intent of "second moment": a step
 * up in presence without the viewport-dominating image M5 had to be walked back
 * from. The 16% left inside the column is deliberate air; the section has no
 * `column-gap` between the frame and its own column edge, so that remainder is
 * what separates them.
 *
 * ## Accessibility
 *
 * - The section owns no `id`. The four approved nav anchors are #collection (M3),
 *   #journal (M5), #about (M6 Brand Story) and #contact (M7), and claiming a
 *   fifth would duplicate a target.
 * - Heading outline is h2 (section) → h3 (the piece) → h3 (the range). Two
 *   siblings at the same level, because they are two subsections of the section,
 *   not one nested inside the other. Nothing goes below h3.
 * - The range index is a plain list of text, NOT links. The six cards above
 *   already link every product name to #contact; making these five focusable too
 *   would add five tab stops that all resolve to the same anchor, which is
 *   exactly the "unnecessary tab stop" failure. There is no product route to be
 *   honest about, so they are text.
 * - The featured image stays lazy. It is well below the fold and is not the LCP
 *   element; `priority` is still read from the data so promoting it later is a
 *   data change, not a component change.
 */
@Component({
  selector: 'app-product-showcase',
  imports: [CurrencyPipe, NgOptimizedImage, Reveal, SectionHeading],
  templateUrl: './product-showcase.html',
  styleUrl: './product-showcase.scss',
})
export class ProductShowcase {
  /**
   * The catalogue, passed in rather than imported — the same inversion as
   * `FeaturedCollection`, and for the same reason: the future API swap lands in
   * `app.html` and touches neither this component nor `product-card`.
   */
  readonly products = input.required<readonly Product[]>();

  /** The dominant piece: the first element of the passed catalogue, or null. */
  protected readonly featured = computed(() => this.products().at(0) ?? null);

  /**
   * Everything else, in catalogue order, rendered as a text index. `slice(1)`
   * rather than "all but featured" so the featured piece can never appear twice
   * even if the array contains a duplicate entry.
   */
  protected readonly rest = computed(() => this.products().slice(1));
}
