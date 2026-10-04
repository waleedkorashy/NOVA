import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { Component, input } from '@angular/core';
import type { Product } from '../../shared/types/product';

/**
 * Product card — genuinely reusable (plan §7: two sites, Featured Collection and
 * Product Showcase).
 *
 * ## Why it takes a `Product` and nothing else
 *
 * The card has no knowledge of *where* products come from. It renders the
 * `Product` contract from `shared/types/product.ts` and nothing more, which is
 * what makes the future data-source swap invisible here: when `PRODUCTS` becomes
 * `http.get<Product[]>('/api/products')`, this file does not change at all. That
 * is the whole reason the data model was drawn as a standalone contract.
 *
 * ## Interaction
 *
 * The card is an `<article>`, not a link. Making a whole card an `<a>` would put
 * a large unnamed region in the tab order and swallow the price and materials
 * into one enormous accessible name. Instead the product name is the single link,
 * and the card's hover/focus treatment keys off `:focus-within` so keyboard focus
 * on that link produces the same response as pointer hover. One focusable
 * element per card, correctly named.
 *
 * The destination is `#contact`, the approved enquiry anchor (plan §4.4) — this is
 * a portfolio landing page with no product detail route and no backend, so there
 * is nowhere else honest for "I would like to know more about this piece" to go.
 *
 * ## Images
 *
 * The card binds the `src` string it is handed and never imports an image, which
 * is what keeps it data-source agnostic (see `shared/types/product.ts`). Because
 * it renders through `NgOptimizedImage`, the imported-or-API-sourced URL is
 * fingerprinted locally and rendered as-is remotely, and the intrinsic
 * `width`/`height` from the data reserve the box before the bytes arrive.
 *
 * There is deliberately no `IMAGE_LOADER` provider here. The Hero needs one
 * because it is the LCP element and must choose between a 960 and an 1800 wide
 * file; collection cards are a single ~1000px width, so a srcset would add a
 * second file per product for a page position that is already below the fold and
 * lazy. `priority` is still honoured from the data, so promoting a card to LCP
 * later is a data change, not a component change.
 */
@Component({
  selector: 'ui-product-card',
  imports: [CurrencyPipe, NgOptimizedImage],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  /** The product to render. The only required input — everything else is layout. */
  readonly product = input.required<Product>();

  /**
   * CSS `aspect-ratio` for the image frame.
   *
   * Exposed as an input rather than hard-coded because the plan calls for an
   * editorial grid with *varied* image ratios, while this card is reused by the
   * Product Showcase, which wants one consistent ratio. Composition belongs to
   * the section; the card just honours what it is told.
   *
   * Written as a string so any valid ratio works (`'4 / 5'`, `'1 / 1'`, `'3 / 2'`).
   */
  readonly aspect = input('4 / 5');
}
