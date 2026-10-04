import { Component, input } from '@angular/core';

/**
 * Section heading — eyebrow, title and optional lede.
 *
 * ## Why it is a component at all
 *
 * Plan §7 budgets six reuse sites for it, and every page section needs the same
 * three-part opening in the same order and the same rhythm. Left to itself each
 * section would re-declare the spacing and eventually drift.
 *
 * ## Why the title is always an `h2`
 *
 * The page has exactly one `h1` and it lives in the Hero. Every section is a
 * peer of every other section, so every section title is an `h2`, and product
 * names inside a section are `h3`. That yields one unbroken outline:
 *
 *   h1  Good rooms are made slowly.        (hero)
 *    └─ h2  Six pieces, made to be kept.  (featured collection)
 *        └─ h3  Havn Lounge Chair         (product card)
 *
 * The level is therefore deliberately NOT an input. Making it configurable
 * would let a caller silently break the document outline, and the repo's own
 * stated rule is that shared patterns do not get speculative configuration
 * ("if a utility is used once, it belongs in the component that uses it" —
 * `_utilities.scss`). Alignment and level variants are added when a section
 * actually needs them, in review.
 *
 * ## The `id` input
 *
 * `id` lands on the `<h2>` itself, not on the host. That is deliberate: a
 * section names itself with `aria-labelledby="collection-title"`, and the id
 * has to be on the element that provides the accessible NAME — the heading —
 * not on an anonymous wrapper. Passing the id in rather than generating one
 * keeps the label/target pairing visible at the call site instead of spread
 * across two files.
 */
@Component({
  selector: 'ui-section-heading',
  templateUrl: './section-heading.html',
  styleUrl: './section-heading.scss',
})
export class SectionHeading {
  /** Small uppercase label above the title. Rendered only when provided. */
  readonly eyebrow = input<string>();

  /** The section title. Rendered as the section's `h2`. */
  readonly title = input.required<string>();

  /** Optional supporting sentence. Rendered only when provided. */
  readonly lede = input<string>();

  /** Optional id for the `<h2>`, so a host section can point `aria-labelledby` at it. */
  readonly id = input<string>();
}
