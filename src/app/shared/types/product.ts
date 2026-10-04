/**
 * Product contract — the one shape every product in this project has.
 *
 * ## Why this file exists separately from the data
 *
 * This is a *type*, not data. It carries no values and imports nothing, so a
 * component can depend on the shape of a product without depending on where
 * products come from. `PRODUCTS` (the local fixture source) lives in
 * `shared/data/products.ts`; components depend on this file only.
 *
 * ## Why it is shaped like this
 *
 * The brief is explicit that a future ASP.NET Core API must be able to replace
 * the local data source *without a component redesign*. That only works if the
 * local source already looks like the remote one, so every field here is
 * something a catalogue endpoint would plausibly return:
 *
 *   - `id` is a stable machine identifier, `slug` the URL-facing one. Two
 *     fields because they are genuinely different concerns: sorting and
 *     tracking by `id`, addressing by `slug`.
 *   - `price` is a NUMBER and `currency` a separate string, never a
 *     preformatted string. Formatting is the template's job (`CurrencyPipe`,
 *     decision D3), so a future API can change the amount or the currency
 *     independently and no template changes.
 *   - `image` is required and carries `width`/`height`, because
 *     `NgOptimizedImage` cannot reserve space without intrinsic dimensions and
 *     a card grid with no reserved space is a CLS generator.
 *
 * The important property is that `image.src` is a plain `string`. Locally it is
 * populated by an ES module import, which is what makes the bundler emit a
 * content-hashed URL, but the *type* does not care where the string came from.
 * An API response carrying `/media/nova-product-havn-chair.webp` satisfies it
 * unchanged, which is precisely why `product-card` binds `[ngSrc]` and never
 * imports an image itself.
 *
 * ## Naming
 *
 * Every field is optional-safe on the read side only where a real API would be
 * sparse (`materials`, `image.priority`). Nothing that the UI depends on to
 * render correctly is optional.
 */

/**
 * One image of one product.
 *
 * `alt` is required rather than optional on purpose. An optional `alt` is how
 * decorative-by-omission bugs ship: someone adds a product, forgets the field,
 * and the type system says nothing. Making it required means the compiler asks
 * the question. Every alt string describes only what is visible in the frame
 * and must never imply the photograph shows a NOVA product (AGENTS.md).
 */
export interface ProductImage {
  /** Fingerprinted URL of the image, from an ES import or a future API. */
  readonly src: string;

  /**
   * Describes what is visible in the photograph. Never a caption that implies
   * the subject is a NOVA product, never marketing copy.
   */
  readonly alt: string;

  /** Intrinsic width in px. Reserves layout space, so no CLS on load. */
  readonly width: number;

  /** Intrinsic height in px. */
  readonly height: number;

  /**
   * Eager-load this image with `fetchpriority="high"`.
   *
   * Only the LCP image should ever set this. Everything below the fold must
   * stay lazy, because six eager images would compete with the Hero for
   * bandwidth on the one page that has to load fast.
   */
  readonly priority?: boolean;
}

/**
 * A single piece in the NOVA collection. Fictional, as the brief requires.
 *
 * Copy fields (`summary`, `materials`) describe form and materials only. No
 * field exists for ratings, review counts, customer counts or any other social
 * proof, because AGENTS.md forbids fabricating them — the absence is
 * deliberate, not an oversight, and it means such content cannot be added
 * without editing this contract in review.
 */
export interface Product {
  /** Stable machine identifier. Used as the `@for` track key. */
  readonly id: string;

  /** URL-facing identifier. Reserved for a future product route. */
  readonly slug: string;

  /** Product name as displayed. Also the card's accessible link name. */
  readonly name: string;

  /**
   * Category, shown as the card's eyebrow — "Lounge Chair", "Dining Table".
   * Editorial taxonomy, not a filter facet: there is no filtering in this
   * milestone and no filter UI is implied by this field.
   */
  readonly category: string;

  /** Price as a NUMBER. Never preformatted — see D3. */
  readonly price: number;

  /** ISO 4217 code. All current products are EUR, but it travels with the data. */
  readonly currency: string;

  /** One or two sentences on form, proportion and materials. */
  readonly summary: string;

  /** Named materials, rendered as one specification line. Optional. */
  readonly materials?: readonly string[];

  /** Primary image. Required — see the interface note above. */
  readonly image: ProductImage;
}
