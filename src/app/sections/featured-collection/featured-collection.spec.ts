import { TestBed } from '@angular/core/testing';
import type { Product } from '../../shared/types/product';
import { FeaturedCollection } from './featured-collection';

/**
 * Six fictional pieces, matching the six grid positions.
 *
 * These are fixtures, not `PRODUCTS` — the section must render data it has never
 * seen. The intrinsic sizes are deliberately left mismatched (a square, a
 * landscape, three portraits) rather than all set to the real catalogue's 4:5,
 * because that mismatch is the property worth proving here: every frame is 4 / 5
 * regardless of the source ratio, and `object-fit: cover` absorbs the difference
 * without distortion. `src` values are plain strings, as they would be from an
 * API, so no test of this section depends on the real catalogue or its assets.
 */
const CATALOGUE: readonly Product[] = [
  {
    id: 'havn-chair',
    slug: 'havn-lounge-chair',
    name: 'Havn Lounge Chair',
    category: 'Lounge Chair',
    price: 1480,
    currency: 'EUR',
    summary: 'A low solid-oak frame carrying a loose wool seat pad.',
    materials: ['Solid oak', 'Wool felt'],
    image: {
      src: '/media/nova-product-havn-lounge-chair-1000.webp',
      alt: 'Oak lounge chair with a grey wool seat pad beside a plastered wall.',
      width: 1000,
      height: 1000,
    },
  },
  {
    id: 'birk-table',
    slug: 'birk-dining-table',
    name: 'Birk Dining Table',
    category: 'Dining Table',
    price: 2650,
    currency: 'EUR',
    summary: 'A four-seat table with a wedged-tenon top and square legs.',
    materials: ['Solid oak'],
    image: {
      src: '/media/nova-product-birk-dining-table-1000.webp',
      alt: 'Oak dining table with four chairs in a daylit room.',
      width: 1000,
      height: 1250,
    },
  },
  {
    id: 'fjell-stool',
    slug: 'fjell-stool',
    name: 'Fjell Stool',
    category: 'Stool',
    price: 320,
    currency: 'EUR',
    summary: 'A turned three-legged stool, left unlacquered.',
    materials: ['Solid ash'],
    image: {
      src: '/media/nova-product-fjell-stool-1000.webp',
      alt: 'Three-legged ash stool standing on a pale floor.',
      width: 1000,
      height: 1333,
    },
  },
  {
    id: 'linde-shelf',
    slug: 'linde-shelving',
    name: 'Linde Shelving',
    category: 'Shelving',
    price: 1890,
    currency: 'EUR',
    summary: 'Four fixed shelves on through-tenoned uprights.',
    materials: ['Solid birch'],
    image: {
      src: '/media/nova-product-linde-shelving-1000.webp',
      alt: 'Open birch shelving holding a single ceramic vessel.',
      width: 1000,
      height: 1250,
    },
  },
  {
    id: 'rod-sideboard',
    slug: 'rod-sideboard',
    name: 'Rod Sideboard',
    category: 'Sideboard',
    price: 3400,
    currency: 'EUR',
    summary: 'A long credenza with sliding fronts and recessed pulls.',
    materials: ['Solid walnut'],
    image: {
      src: '/media/nova-product-rod-sideboard-1000.webp',
      alt: 'Long walnut sideboard against a plain wall.',
      width: 1000,
      height: 667,
    },
  },
  {
    id: 'mork-bench',
    slug: 'mork-bench',
    name: 'Mork Bench',
    category: 'Bench',
    price: 1240,
    currency: 'EUR',
    summary: 'A hall bench with a single wedged-tenon rail.',
    materials: ['Solid oak', 'Leather'],
    image: {
      src: '/media/nova-product-mork-bench-1000.webp',
      alt: 'Oak bench with a folded leather cushion in an entryway.',
      width: 1000,
      height: 1250,
    },
  },
];

function render(products: readonly Product[]) {
  const fixture = TestBed.createComponent(FeaturedCollection);
  fixture.componentRef.setInput('products', products);
  return fixture;
}

describe('FeaturedCollection', () => {
  it('renders one card per product, in the order given', async () => {
    const fixture = render(CATALOGUE);
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelectorAll('ui-product-card')).toHaveLength(6);

    const names = Array.from(root.querySelectorAll('.card__name')).map((h3) =>
      h3.textContent?.trim(),
    );
    expect(names).toEqual([
      'Havn Lounge Chair',
      'Birk Dining Table',
      'Fjell Stool',
      'Linde Shelving',
      'Rod Sideboard',
      'Mork Bench',
    ]);
  });

  it('is a named region anchored at #collection, labelled by its own h2', async () => {
    const fixture = render(CATALOGUE);
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    const section = root.querySelector('section');

    // The nav anchor targets #collection, and the region announces its own name.
    expect(section?.id).toBe('collection');
    expect(section?.getAttribute('aria-labelledby')).toBe('collection-title');

    const label = root.querySelector('#collection-title');
    expect(label?.tagName).toBe('H2');
    expect(label?.textContent?.trim()).toBe('Six pieces, made to be kept.');
  });

  it('keeps the document outline unbroken: one h2 here, h3 per product', async () => {
    const fixture = render(CATALOGUE);
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;

    // h1 belongs to the Hero alone, so this section contributes exactly one h2
    // and never jumps a level.
    expect(root.querySelectorAll('h1')).toHaveLength(0);
    expect(root.querySelectorAll('h2')).toHaveLength(1);
    expect(root.querySelectorAll('h3')).toHaveLength(6);
  });

  it('gives every card image alt text sourced from the data', async () => {
    const fixture = render(CATALOGUE);
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    const images = Array.from(root.querySelectorAll('img'));

    expect(images).toHaveLength(6);

    for (const image of images) {
      const alt = image.getAttribute('alt') ?? '';
      expect(alt.length).toBeGreaterThan(20);
      expect(alt).not.toMatch(/^image of/i);
      expect(alt).not.toMatch(/\bnova\b/i);
    }
  });

  it('keeps the list semantics while removing the bullets', async () => {
    const fixture = render(CATALOGUE);
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    const list = root.querySelector('ul');

    // `.list-reset` strips the bullets, which would otherwise make Safari and
    // VoiceOver drop the list entirely. `role="list"` is what preserves it.
    expect(list?.getAttribute('role')).toBe('list');
    expect(list?.classList.contains('list-reset')).toBe(true);
    expect(list?.querySelectorAll(':scope > li')).toHaveLength(6);
  });

  it('frames every card at 4 / 5, matching the delivered photography', async () => {
    const fixture = render(CATALOGUE);
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;

    // The composition's asymmetry now lives entirely in the column spans. Every
    // card frame is 4 / 5 because every delivered asset is exactly 1200x1500:
    // a `3 / 2` frame would `cover`-crop ~47% of a photograph's height, which
    // throws away the furniture the frame exists to present. This test exists to
    // make that trade-off explicit rather than incidental — reintroducing varied
    // ratios is a decision, and it has to fail here first.
    const ratios = Array.from(root.querySelectorAll('.card__figure')).map((figure) =>
      (figure as HTMLElement).style.getPropertyValue('--card-aspect').trim(),
    );

    expect(ratios).toEqual(['4 / 5', '4 / 5', '4 / 5', '4 / 5', '4 / 5', '4 / 5']);
  });

  it('positions each card by index, so the ratio array wraps on a longer list', async () => {
    const fixture = render([...CATALOGUE, CATALOGUE[0], CATALOGUE[1]]);
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;

    // `aspects[i % aspects.length]` is what keeps an eighth product rendering
    // with a valid ratio instead of `undefined` leaking into the CSS custom
    // property and the frame collapsing to zero height.
    const ratios = Array.from(root.querySelectorAll('.card__figure')).map((figure) =>
      (figure as HTMLElement).style.getPropertyValue('--card-aspect').trim(),
    );

    expect(ratios).toHaveLength(8);
    expect(new Set(ratios)).toEqual(new Set(['4 / 5']));
    expect(ratios.every((ratio) => ratio.length > 0)).toBe(true);
  });

  it('states an empty collection plainly instead of inventing products', async () => {
    const fixture = render([]);
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelectorAll('ui-product-card')).toHaveLength(0);
    expect(root.querySelector('.collection__empty')?.textContent?.trim()).toBe(
      'No pieces are available to view at the moment.',
    );

    // The section heading still renders — a bare heading over nothing would look
    // like a broken page.
    expect(root.querySelector('h2')).toBeTruthy();
  });

  it('carries no fabricated social proof anywhere in the section', async () => {
    const fixture = render(CATALOGUE);
    await fixture.whenStable();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    // AGENTS.md forbids ratings, reviews, star counts, customer counts, press
    // logos and testimonials. The D2 integrity rule is checked on rendered
    // content, not merely asserted in a comment.
    expect(text).not.toMatch(/\b(review|rating|rated|stars?|testimonial|customers?|award)/i);
    expect(text).not.toMatch(/[★☆]/);
  });
});
