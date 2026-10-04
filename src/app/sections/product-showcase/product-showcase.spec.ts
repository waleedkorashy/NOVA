import { TestBed } from '@angular/core/testing';
import type { Product } from '../../shared/types/product';
import { ProductShowcase } from './product-showcase';

/**
 * Fixture catalogue.
 *
 * Deliberately NOT `PRODUCTS`. The section must be provably data-source agnostic,
 * and a test that imported the real catalogue could not tell "derived from the
 * data" apart from "hard-coded to these six names". These two pieces exist only
 * to prove that whatever is passed in is what gets rendered.
 */
const FIXTURES: readonly Product[] = [
  {
    id: 'first',
    slug: 'first',
    name: 'Fixture First',
    category: 'Sofa',
    price: 1000,
    currency: 'EUR',
    summary: 'The first fixture summary.',
    materials: ['Oak', 'Wool'],
    image: { src: 'first.webp', alt: 'A first fixture.', width: 1200, height: 1500 },
  },
  {
    id: 'second',
    slug: 'second',
    name: 'Fixture Second',
    category: 'Chair',
    price: 2000,
    currency: 'EUR',
    summary: 'The second fixture summary.',
    image: { src: 'second.webp', alt: 'A second fixture.', width: 1200, height: 1500 },
  },
  {
    id: 'third',
    slug: 'third',
    name: 'Fixture Third',
    category: 'Table',
    price: 3000,
    currency: 'EUR',
    summary: 'The third fixture summary.',
    image: { src: 'third.webp', alt: 'A third fixture.', width: 1200, height: 1500 },
  },
];

async function render(products: readonly Product[] = FIXTURES) {
  const fixture = TestBed.createComponent(ProductShowcase);
  fixture.componentRef.setInput('products', products);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('ProductShowcase', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductShowcase],
    }).compileComponents();
  });

  it('is a named region labelled by its own h2, and owns no anchor', async () => {
    const root = await render();

    const section = root.querySelector('section.showcase');
    expect(section?.getAttribute('aria-labelledby')).toBe('showcase-title');

    // The four approved nav anchors are #collection, #journal, #about and
    // #contact. This section is none of them, so the only id it may hold is the
    // heading label — a second id would be an unreferenced or duplicated target.
    expect(root.querySelectorAll('[id]')).toHaveLength(1);
    expect(root.querySelector('#showcase-title')?.tagName).toBe('H2');
    expect(section?.hasAttribute('id')).toBe(false);
  });

  it('presents one dominant piece rather than repeating the card grid', async () => {
    const root = await render();

    // Featured Collection already introduces all six pieces, so this section
    // shows one. `ui-product-card` must not appear here: plan §7 lists it as a
    // second reuse site, but a card grid here would duplicate the Collection.
    expect(root.querySelectorAll('ui-product-card')).toHaveLength(0);
    expect(root.querySelectorAll('.showcase__frame')).toHaveLength(1);
    expect(root.querySelectorAll('img')).toHaveLength(1);
  });

  it('derives the dominant piece from the data instead of naming one', async () => {
    // If the piece were hard-coded, this would still render "Fixture First".
    const root = await render();

    expect(root.querySelector('.showcase__category')?.textContent?.trim()).toBe('Sofa');
    expect(root.querySelector('.showcase__name')?.textContent?.trim()).toBe('Fixture First');
    expect(root.querySelector('.showcase__summary')?.textContent?.trim()).toBe(
      'The first fixture summary.',
    );
    expect(root.querySelector('.showcase__materials')?.textContent?.trim()).toBe('Oak · Wool');
  });

  it('reverses the data and the dominant piece follows', async () => {
    // The real proof that nothing is hard-coded: hand it a different catalogue
    // and both the dominant piece and the index follow.
    const reversed = [...FIXTURES].reverse();
    const root = await render(reversed);

    expect(root.querySelector('.showcase__name')?.textContent?.trim()).toBe('Fixture Third');
    const names = Array.from(root.querySelectorAll('.showcase__index-name')).map((el) =>
      el.textContent?.trim(),
    );
    expect(names).toEqual(['Fixture Second', 'Fixture First']);
  });

  it('accounts for every product exactly once', async () => {
    const root = await render();

    // 1 dominant + (n - 1) indexed = n. Anything else means a product was
    // dropped or shown twice.
    const indexed = root.querySelectorAll('.showcase__index-row').length;
    expect(indexed).toBe(FIXTURES.length - 1);

    const rendered = [
      root.querySelector('.showcase__name')?.textContent?.trim(),
      ...Array.from(root.querySelectorAll('.showcase__index-name')).map((el) =>
        el.textContent?.trim(),
      ),
    ];
    expect(new Set(rendered).size).toBe(FIXTURES.length);
  });

  it('renders the index as a list, as text rather than as five more tab stops', async () => {
    const root = await render();

    const list = root.querySelector('.showcase__index');
    expect(list?.tagName).toBe('UL');
    // `role="list"` alongside `.list-reset`, because stripping markers with CSS
    // alone makes Safari and VoiceOver drop the list semantics.
    expect(list?.getAttribute('role')).toBe('list');
    expect(list?.querySelectorAll(':scope > li')).toHaveLength(2);

    // The Collection cards already link every product name to #contact. Five more
    // focusable rows resolving to the same anchor would be pure tab-stop bloat,
    // and there is no product route to be honest about.
    expect(root.querySelectorAll('a[href]')).toHaveLength(0);
    expect(root.querySelectorAll('[tabindex]')).toHaveLength(0);
  });

  it('keeps the heading outline flat at h2 -> h3', async () => {
    const root = await render();

    expect(root.querySelectorAll('h2')).toHaveLength(1);
    // The piece name and "The rest of the collection" are siblings at h3: two
    // subsections of the section, not one nested inside the other. Nothing below
    // h3 exists.
    expect(root.querySelectorAll('h3')).toHaveLength(2);
    expect(root.querySelectorAll('h4, h5, h6')).toHaveLength(0);
  });

  it('renders the featured image with dimensions, alt text and no priority', async () => {
    const root = await render();
    const image = root.querySelector('img')!;

    // Intrinsic size reserves the box, so the lazy image cannot reflow the page.
    expect(image.getAttribute('width')).toBe('1200');
    expect(image.getAttribute('height')).toBe('1500');

    // Well below the fold and not the LCP element, so it must stay lazy.
    expect(image.getAttribute('loading')).toBe('lazy');
    expect(image.getAttribute('fetchpriority')).not.toBe('high');

    expect(image.getAttribute('alt')).toBe('A first fixture.');
  });

  it('never lets alt text claim the photograph shows a NOVA piece', async () => {
    // These are licensed third-party photographs, so the alt text describes what
    // is visible and must not imply the furniture is NOVA product.
    // `product-card.spec.ts` asserts the same rule for the cards above.
    const root = await render();
    const alt = root.querySelector('img')?.getAttribute('alt') ?? '';

    expect(alt).not.toBe('');
    expect(alt).not.toMatch(/\bNOVA\b/);
  });

  it('formats prices from the numbers rather than from a preformatted string', async () => {
    const root = await render();

    // Zero decimals, symbol currency — a made-to-order catalogue does not quote
    // cents. Rendered from `price` + `currency`, so a future API can change
    // either independently.
    expect(root.querySelector('.showcase__price')?.textContent?.trim()).toMatch(/€[\d,]+/);
    expect(root.querySelector('.showcase__price')?.textContent).not.toContain('.00');

    const prices = Array.from(root.querySelectorAll('.showcase__index-price')).map((el) =>
      el.textContent?.trim(),
    );
    expect(prices).toHaveLength(2);
    expect(prices[0]).toMatch(/[\d,]+/);
  });

  it('omits the materials line when the data has no materials', async () => {
    // `materials` is optional on the contract. Rendering an empty specification
    // line would be worse than dropping it.
    const noMaterials = FIXTURES.map((p) =>
      p.id === 'first' ? { ...p, materials: undefined } : p,
    );
    const root = await render(noMaterials);

    expect(root.querySelector('.showcase__materials')).toBeNull();
  });

  it('omits the index entirely for a single-product catalogue', async () => {
    const root = await render([FIXTURES[0]]);

    expect(root.querySelector('.showcase__name')?.textContent?.trim()).toBe('Fixture First');
    expect(root.querySelector('.showcase__range')).toBeNull();
    expect(root.querySelectorAll('.showcase__index-row')).toHaveLength(0);
  });

  it('states an empty catalogue rather than rendering a heading over nothing', async () => {
    const root = await render([]);

    expect(root.querySelector('.showcase__empty')?.textContent?.trim()).toBe(
      'No pieces are available to view at the moment.',
    );
    expect(root.querySelector('.showcase__spread')).toBeNull();
    expect(root.querySelector('img')).toBeNull();
    // No product is invented to fill the gap.
    expect(root.querySelectorAll('.showcase__name, .showcase__index-row')).toHaveLength(0);
  });

  it('carries no fabricated social proof', async () => {
    const root = await render();
    const text = root.textContent ?? '';

    // \b on BOTH sides: a leading-only guard matches the "star" inside "start",
    // which turns the check into a false-positive generator instead of a real one.
    expect(text).not.toMatch(
      /\b(reviews?|ratings?|rated|stars?|testimonials?|customers?|awards?|bestseller|in stock)\b/i,
    );
    expect(text).not.toMatch(/[★☆]/);
    // No popularity, stock or urgency metrics either.
    expect(text).not.toMatch(/\b(sold|in stock|only \d+ left|popular|bestselling)\b/i);
  });

  it('is not a grid of cards or a set of stat tiles', async () => {
    const root = await render();
    const root$ = root.querySelector('section.showcase') as HTMLElement;

    // The plan's structural prohibition, asserted so it cannot regress quietly:
    // no card affordances, no numbered/stat tiles, no shadowed or rounded chrome.
    expect(root.querySelectorAll('.card')).toHaveLength(0);
    expect(root.querySelectorAll('.numbered')).toHaveLength(0);
    expect(root.querySelectorAll('article')).toHaveLength(0);
    expect(root$.className).not.toMatch(/card|grid--cards/);
  });
});
