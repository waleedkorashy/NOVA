import { Component, input } from '@angular/core';
import type { Product } from '../../shared/types/product';
import { ProductCard } from '../../ui/product-card/product-card';
import { SectionHeading } from '../../ui/section-heading/section-heading';

/**
 * Featured Collection — the commercial centrepiece and the `#collection` anchor
 * target that the header nav and the Hero's primary CTA both point at.
 *
 * ## Composition, and why it is not a 3x2 grid
 *
 * Plan §7 calls this "the one legitimate card grid", with the explicit caveat
 * that it must read as an *editorial* grid: asymmetric spans and varied image
 * ratios, not a uniform matrix. A uniform 3x2 of identical cards is the single
 * most reliable way to make an editorial page look like a SaaS pricing table, so
 * the layout here is deliberately uneven at every breakpoint — see the SCSS for
 * the column spans.
 *
 * ## Data
 *
 * `products` is an input rather than a direct import of `PRODUCTS`. That is a
 * deliberate inversion of the usual pattern and it buys two things:
 *
 *  1. The future data-source swap (plan §4.3: `http.get<Product[]>('/api/products')`)
 *     lands in `app.html` as `<app-featured-collection [products]="products$" />`
 *     and does not touch this component at all.
 *  2. The section is testable in isolation with fixture data, with no module-level
 *     import to stub out.
 *
 * The alternative — importing `PRODUCTS` here — would make every test of this
 * section depend on the real catalogue, which is exactly the coupling the plan's
 * data model exists to prevent.
 */
@Component({
  selector: 'app-featured-collection',
  imports: [ProductCard, SectionHeading],
  templateUrl: './featured-collection.html',
  styleUrl: './featured-collection.scss',
})
export class FeaturedCollection {
  /**
   * The products to present. Passed in rather than imported so the section is
   * agnostic about where the data came from.
   */
  readonly products = input.required<readonly Product[]>();

  /**
   * Image ratio per grid position, as CSS `aspect-ratio` strings.
   *
   * Position-keyed rather than product-keyed on purpose: the rhythm is a property
   * of *this* section's composition, not of the products. Reordering or filtering
   * the catalogue should not silently change which product gets a portrait crop.
   * `product-card` reads this via `[aspect]`; the Showcase reuses the same card
   * with a single consistent ratio instead.
   *
   * **Every position is `4 / 5`.** This was originally a varied set
   * (`1 / 1, 4 / 5, 3 / 4, 4 / 5, 3 / 2, 4 / 5`), and the variety was real
   * editorial intent — but the delivered photography settled it. All six approved
   * assets are normalised to exactly 1200×1500 (4:5), so a `3 / 2` frame would
   * `cover`-crop ~47% of a photograph's height and `1 / 1` ~20%, throwing away
   * furniture the crop was supposed to present. Aspect variety that costs 47% of
   * the subject is a defect, not a rhythm.
   *
   * So the asymmetry moves to where it costs nothing: unequal column spans, the
   * deliberate column-12 hole, and `align-items: end` per row (see the SCSS).
   * The card frames still honour `aspect-ratio`, so restoring a varied set later
   * is a one-line change to this array and no template edit.
   */
  protected readonly aspects: readonly string[] = [
    '4 / 5',
    '4 / 5',
    '4 / 5',
    '4 / 5',
    '4 / 5',
    '4 / 5',
  ];
}
