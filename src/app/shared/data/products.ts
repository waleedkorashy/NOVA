import type { Product } from '../types/product';

import formaSofa from '../../../assets/images/nova-forma-sofa.webp';
import arcLounge from '../../../assets/images/nova-arc-lounge.webp';
import lineChair from '../../../assets/images/nova-line-chair.webp';
import frameSideboard from '../../../assets/images/nova-frame-sideboard.webp';
import lowTable from '../../../assets/images/nova-low-table.webp';
import haloLamp from '../../../assets/images/nova-halo-lamp.webp';

/**
 * The catalogue.
 *
 * ## This is the seam a future API replaces
 *
 * Plan §4.3 commits to one thing: an ASP.NET Core endpoint can take over this file
 * without any component changing. Two properties make that true, and both are
 * load-bearing:
 *
 *  1. **The components never import this.** `app.html` passes the array into
 *     `<app-featured-collection [products]="products" />`, and the section takes it
 *     as an `input.required<readonly Product[]>()`. `product-card` takes a single
 *     `Product`. Nothing below this line knows the catalogue exists.
 *
 *  2. **`image.src` is a string, not an import.** The `import` statements above are
 *     a *build-time convenience*, and they are confined to this file: the builder
 *     resolves each one to a fingerprinted `/media/*.webp` URL and hands that
 *     string to `ProductImage.src`. An API returns a URL string in exactly the same
 *     shape, so swapping the source changes these six lines and nothing else. If
 *     the image were held as a module reference, that swap would become a redesign.
 *
 * That is the whole point of the type shape. Everything else here is data.
 *
 * ## Rules this data obeys
 *
 * - **Fictional only.** NOVA is a fictional brand; so are these six pieces. No
 *   real product, maker, stockist or price is reproduced.
 * - **No social proof.** No reviews, ratings, star counts, customer counts, awards,
 *   press or sales figures appear anywhere in this file, and none may be added
 *   (approved decision D2 — `src/assets/images/ATTRIBUTION.md`).
 * - **Copy describes form, not virtue.** `summary` and `materials` state what a
 *   piece *is*. Nothing claims durability ratings, sustainability credentials,
 *   production methods or popularity, because NOVA has no such record.
 * - **Alt text carries no `NOVA` token.** These are licensed third-party
 *   photographs, so `product-card.spec.ts` asserts the alt text never claims the
 *   picture shows a NOVA product. The alt describes only what is visible.
 * - **`materials` is optional.** Where a piece has nothing worth specifying, the
 *   field is left out and the card drops the line, rather than padding it.
 */
export const PRODUCTS: readonly Product[] = [
  {
    id: 'forma-sofa',
    slug: 'forma-sofa',
    name: 'NOVA Forma Sofa',
    category: 'Sofa',
    price: 3480,
    currency: 'EUR',
    summary: 'A low modular sofa with a deep seat and a slim arm.',
    materials: ['Solid oak frame', 'Wool felt', 'Natural latex'],
    image: {
      src: formaSofa,
      alt: 'Low grey modular sofa with a wide seat and slim arms, in a bare room with daylight from the left.',
      width: 1200,
      height: 1500,
    },
  },
  {
    id: 'arc-lounge',
    slug: 'arc-lounge',
    name: 'NOVA Arc Lounge',
    category: 'Lounge Chair',
    price: 1290,
    currency: 'EUR',
    summary: 'A curved back rail drawn in one continuous line over a woven seat.',
    materials: ['Solid ash', 'Paper cord'],
    image: {
      src: arcLounge,
      alt: 'Wooden lounge chair with a curved back and a woven seat, angled beside a plain wall.',
      width: 1200,
      height: 1500,
    },
  },
  {
    id: 'line-chair',
    slug: 'line-chair',
    name: 'NOVA Line Chair',
    category: 'Dining Chair',
    price: 460,
    currency: 'EUR',
    summary: 'Four legs and a flat back, sized to disappear into a room.',
    materials: ['Solid oak'],
    image: {
      src: lineChair,
      alt: 'Simple wooden dining chair with a flat back and four tapered legs, on a plain pale ground.',
      width: 1200,
      height: 1500,
    },
  },
  {
    id: 'frame-sideboard',
    slug: 'frame-sideboard',
    name: 'NOVA Frame Sideboard',
    category: 'Sideboard',
    price: 2340,
    currency: 'EUR',
    summary: 'A long shallow case on an open frame, doors set back from the edge.',
    materials: ['Solid oak', 'Oak veneer'],
    image: {
      src: frameSideboard,
      alt: 'Long wooden sideboard with inset doors and tapered legs, standing against a wall beneath a round mirror.',
      width: 1200,
      height: 1500,
    },
  },
  {
    id: 'low-table',
    slug: 'low-table',
    name: 'NOVA Low Table',
    category: 'Coffee Table',
    price: 890,
    currency: 'EUR',
    summary: 'A low table with a thin top carried on a recessed base.',
    materials: ['Solid oak'],
    image: {
      src: lowTable,
      alt: 'Low wooden coffee table with a cut flower laid across its top, seen from a low angle.',
      width: 1200,
      height: 1500,
    },
  },
  {
    id: 'halo-lamp',
    slug: 'halo-lamp',
    name: 'NOVA Halo Lamp',
    category: 'Floor Lamp',
    price: 520,
    currency: 'EUR',
    summary: 'A single shade on a slender stem, weighted by a flat base.',
    materials: ['Anodised aluminium', 'Linen shade'],
    image: {
      src: haloLamp,
      alt: 'Lit floor lamp with a pale shade on a slender stem, standing beside a table and chairs.',
      width: 1200,
      height: 1500,
    },
  },
];
