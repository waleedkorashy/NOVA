import { TestBed } from '@angular/core/testing';
import { Hero } from './hero';

describe('Hero', () => {
  it('renders the section with the page h1, copy and both CTAs', async () => {
    const fixture = TestBed.createComponent(Hero);
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    const heading = root.querySelector('h1');

    expect(heading).toBeTruthy();
    expect(heading?.textContent?.trim()).toBe('Good rooms are made slowly.');
    expect(root.querySelector('.eyebrow')?.textContent?.trim()).toBe('Collection No. 01');

    const ctas = Array.from(root.querySelectorAll('.hero__actions a'));
    expect(ctas.map((a) => [a.textContent?.trim(), a.getAttribute('href')])).toEqual([
      ['Explore the Collection', '#collection'],
      ['View Lookbook', '#journal'],
    ]);

    // The primary CTA is the only dominant action in the viewport.
    expect(root.querySelectorAll('.btn--primary')).toHaveLength(1);
  });

  it('exposes exactly one h1 and labels the region by that heading', async () => {
    const fixture = TestBed.createComponent(Hero);
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    const section = root.querySelector('section');

    expect(root.querySelectorAll('h1')).toHaveLength(1);
    expect(section?.getAttribute('aria-labelledby')).toBe('hero-title');
    expect(root.querySelector('#hero-title')?.tagName).toBe('H1');
  });

  it('serves responsive variants eagerly, with reserved space and accurate alt text', async () => {
    const fixture = TestBed.createComponent(Hero);
    await fixture.whenStable();

    const img = (fixture.nativeElement as HTMLElement).querySelector('img');
    expect(img).toBeTruthy();

    // LCP element: must not be lazy, and must reserve space to avoid CLS.
    expect(img?.getAttribute('loading')).toBe('eager');
    expect(img?.getAttribute('width')).toBe('1800');
    expect(img?.getAttribute('height')).toBe('1200');
    expect(img?.getAttribute('srcset')).toContain('960w');
    expect(img?.getAttribute('srcset')).toContain('1800w');
    expect(img?.getAttribute('sizes')).toBeTruthy();

    // Meaningful, not "image of".
    const alt = img?.getAttribute('alt') ?? '';
    expect(alt.length).toBeGreaterThan(20);
    expect(alt).not.toMatch(/^image of/i);

    // The photograph is not NOVA product, so the alt text must not imply that it is.
    expect(alt).not.toMatch(/\bnova\b/i);
  });
});
