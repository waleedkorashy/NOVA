import { TestBed } from '@angular/core/testing';
import type { Product } from '../../shared/types/product';
import { ProductCard } from './product-card';

/**
 * Fixtures, not catalogue data.
 *
 * `src` is a plain string path here rather than an ES import, which is exactly
 * how an image arrives from a future API. The card must render either without
 * caring where the string came from — that is the property under test.
 */
const CHAIR: Product = {
  id: 'chair',
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
    height: 800,
  },
};

const STOOL: Product = {
  id: 'stool',
  slug: 'flekke-stool',
  name: 'Flekke Stool',
  category: 'Stool',
  price: 320,
  currency: 'EUR',
  summary: 'A turned three-legged stool, left unlacquered.',
  image: {
    src: '/media/nova-product-flekke-stool-1000.webp',
    alt: 'Three-legged oak stool against a pale plaster wall.',
    width: 1000,
    height: 1250,
  },
};

function render(product: Product = CHAIR) {
  const fixture = TestBed.createComponent(ProductCard);
  fixture.componentRef.setInput('product', product);
  return fixture;
}

describe('ProductCard', () => {
  it('renders the product from data alone, with no knowledge of its source', async () => {
    const fixture = render();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('.card__category')?.textContent?.trim()).toBe('Lounge Chair');
    expect(root.querySelector('h3')?.textContent?.trim()).toBe('Havn Lounge Chair');
    expect(root.querySelector('.card__summary')?.textContent?.trim()).toBe(
      'A low solid-oak frame carrying a loose wool seat pad.',
    );

    // Materials read as one specification line, not as tags or pills.
    expect(root.querySelector('.card__materials')?.textContent?.trim()).toBe(
      'Solid oak · Wool felt',
    );
    expect(root.querySelectorAll('.card__materials span')).toHaveLength(0);
  });

  it('renders the price from the number and currency, not a preformatted string', async () => {
    const fixture = render();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    const price = root.querySelector('.card__price')?.textContent?.trim() ?? '';

    // Grouped and carrying the currency symbol — a made-to-order catalogue does
    // not quote cents, so no decimal tail.
    expect(price).toContain('1,480');
    expect(price).not.toContain('1480');
    expect(price).not.toContain('.00');
    expect(price).toMatch(/€|EUR/);
  });

  it('binds the image from data with reserved space, accurate alt text and lazy loading', async () => {
    const fixture = render();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    const img = root.querySelector('img');

    expect(img?.getAttribute('src')).toBe(CHAIR.image.src);
    expect(img?.getAttribute('width')).toBe('1000');
    expect(img?.getAttribute('height')).toBe('800');

    // Below the fold, so never eager: six eager images would compete with the
    // Hero for bandwidth.
    expect(img?.getAttribute('loading')).not.toBe('eager');
    expect(img?.getAttribute('fetchpriority')).not.toBe('high');

    const alt = img?.getAttribute('alt') ?? '';
    expect(alt).toBe(CHAIR.image.alt);
    expect(alt.length).toBeGreaterThan(20);
    expect(alt).not.toMatch(/^image of/i);

    // A photograph is not evidence the piece is a NOVA product, so the alt text
    // must not claim it is (AGENTS.md integrity rule, mirrored from hero.spec).
    expect(alt).not.toMatch(/\bnova\b/i);
  });

  it('exposes exactly one focusable element, named with the product', async () => {
    const fixture = render();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    const links = Array.from(root.querySelectorAll('a'));

    // One stop per card: the whole card is not a link, and the image is not a
    // second link to the same place.
    expect(links).toHaveLength(1);
    expect(links[0].textContent?.trim()).toBe('Havn Lounge Chair');
    expect(links[0].getAttribute('href')).toBe('#contact');

    // The card is an article, not a link, so it is not one giant tab stop.
    expect(root.querySelector('article')).toBeTruthy();
    expect(root.querySelector('article > a')).toBeNull();
  });

  it('omits the materials line when the data has none', async () => {
    const fixture = render(STOOL);
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('.card__materials')).toBeNull();
    expect(root.querySelector('.card__summary')?.textContent?.trim()).toBe(
      'A turned three-legged stool, left unlacquered.',
    );
  });

  it('carries no fabricated social proof in its copy', async () => {
    const fixture = render();
    await fixture.whenStable();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    // No ratings, reviews, star counts or customer counts may ever appear.
    expect(text).not.toMatch(/\b(review|rating|rated|stars?|testimonial|customers?)\b/i);
    expect(text).not.toMatch(/[★☆]/);
  });
});
