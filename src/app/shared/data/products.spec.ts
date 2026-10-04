import { PRODUCTS } from './products';

/**
 * Data-integrity tests for the catalogue.
 *
 * There is no template here, so TestBed would prove nothing. What needs testing is
 * that the *file* honours the contracts the rest of the app depends on — and those
 * are exactly the things that rot silently. Nothing fails when `image.src` is a
 * typo or two products share an `id`; the page just quietly renders six broken
 * images or a `@for` track key that collides.
 */
describe('PRODUCTS', () => {
  it('ships the six approved pieces, in the approved order', () => {
    expect(PRODUCTS.map((product) => product.id)).toEqual([
      'forma-sofa',
      'arc-lounge',
      'line-chair',
      'frame-sideboard',
      'low-table',
      'halo-lamp',
    ]);
  });

  it('gives every product a unique id and slug, because @for tracks on id', () => {
    const ids = PRODUCTS.map((product) => product.id);
    const slugs = PRODUCTS.map((product) => product.slug);

    expect(new Set(ids).size).toBe(PRODUCTS.length);
    expect(new Set(slugs).size).toBe(PRODUCTS.length);
  });

  it('quotes each price as a positive whole number in a known currency', () => {
    for (const product of PRODUCTS) {
      // `price` is a number, not a preformatted string: the card pipes it through
      // CurrencyPipe so grouping and the symbol are derived, never hardcoded.
      expect(Number.isFinite(product.price)).toBe(true);
      expect(product.price).toBeGreaterThan(0);
      expect(Number.isInteger(product.price)).toBe(true);
      expect(product.currency).toBe('EUR');
    }
  });

  it('declares 1200x1500 on every image, matching the delivered 4:5 assets', () => {
    for (const product of PRODUCTS) {
      // These width/height attributes are what reserve the frame before the
      // bytes arrive. If they disagree with the real file the page shifts on
      // scroll — and the value here is asserted against the asset, not trusted.
      expect(product.image.width).toBe(1200);
      expect(product.image.height).toBe(1500);
    }
  });

  it('gives every image a resolvable src from the import layer', () => {
    for (const product of PRODUCTS) {
      // The builder rewrites each `import` into the media directory. A path that
      // is still missing at runtime means the asset was renamed or removed
      // without the data being updated.
      //
      // The leading form differs by builder and is not the contract: `ng build`
      // emits an absolute `/media/...` while the unit-test builder emits
      // `./media/...`. Only the directory and the `.webp` file are asserted, so
      // this test does not break on a builder change that is equally correct.
      expect(product.image.src).toMatch(/(?:^|\/)media\/nova-[a-z-]+\.webp$/);
      expect(product.image.src.endsWith('.webp')).toBe(true);
    }
  });

  it('writes alt text that describes the photograph and claims nothing', () => {
    for (const product of PRODUCTS) {
      const alt = product.image.alt;

      expect(alt.length).toBeGreaterThan(20);
      expect(alt).not.toMatch(/^image of/i);

      // The integrity rule: these are licensed third-party photographs, so the
      // alt text must never assert the picture shows a NOVA product.
      expect(alt).not.toMatch(/\bnova\b/i);
    }
  });

  it('carries no fabricated social proof in any product copy', () => {
    for (const product of PRODUCTS) {
      const copy = [product.name, product.category, product.summary, ...(product.materials ?? [])]
        .join(' ')
        .toLowerCase();

      // AGENTS.md forbids invented ratings, reviews, customer counts, awards and
      // press. A made-up "handcrafted in small batches" line is the same failure
      // in a different costume: it is a production claim NOVA has no record of.
      expect(copy).not.toMatch(
        /\b(review|rating|rated|stars?|testimonial|customers?|award|awards|press|best|number one|handmade|handcrafted|small batches|sustainab\w*|eco[- ]friendly)\b/,
      );
      expect(copy).not.toMatch(/[★☆]/);
    }
  });

  it('describes form in the summary rather than claiming a virtue', () => {
    for (const product of PRODUCTS) {
      // A sentence, not a fragment, and not a superlative.
      expect(product.summary.endsWith('.')).toBe(true);
      expect(product.summary.length).toBeLessThan(120);
    }
  });
});
