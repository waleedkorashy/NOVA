import { TestBed } from '@angular/core/testing';
import { SiteFooter } from './site-footer';

describe('SiteFooter', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteFooter],
    }).compileComponents();
  });

  it('renders the wordmark and a copyright line', async () => {
    const fixture = TestBed.createComponent(SiteFooter);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('.footer__wordmark')?.textContent?.trim()).toBe('NOVA');

    const copyright = root.querySelector('.footer__copyright')?.textContent ?? '';
    expect(copyright).toContain(String(new Date().getFullYear()));
    expect(copyright).toContain('NOVA');
  });

  it('renders the wordmark as a link back to the top of the document', async () => {
    const fixture = TestBed.createComponent(SiteFooter);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    // It is a link, not a bare <p>: the wordmark is the page's "return to top"
    // affordance, and it deliberately reuses the home target the header
    // wordmark already uses (`#top`, owned by the site-header host element)
    // rather than introducing a fifth anchor of its own.
    const wordmark = root.querySelector<HTMLAnchorElement>('a.footer__wordmark');
    expect(wordmark?.textContent?.trim()).toBe('NOVA');
    expect(wordmark?.getAttribute('href')).toBe('#top');
  });

  it('renders the footer contentinfo landmark', async () => {
    const fixture = TestBed.createComponent(SiteFooter);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    // The a11y strategy requires a real `footer` element, not just a custom
    // element named site-footer.
    expect(root.querySelector('footer')).toBeTruthy();
    expect(root.querySelector('nav[aria-label="Footer"]')).toBeTruthy();
  });

  it('navigates to the four approved anchors and nothing else', async () => {
    const fixture = TestBed.createComponent(SiteFooter);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    const hrefs = Array.from(root.querySelectorAll('.footer__list a')).map((a) =>
      a.getAttribute('href'),
    );

    // Every destination is an in-page anchor to a real section. No duplicate
    // ids, no invented paths, no router.
    expect(hrefs).toEqual(['#collection', '#about', '#journal', '#contact']);

    // Each link has real text — no icon-only or empty anchors.
    const labels = Array.from(root.querySelectorAll('.footer__list a')).map((a) =>
      a.textContent?.trim(),
    );
    expect(labels).toEqual(['Collection', 'About', 'Journal', 'Contact']);
    for (const label of labels) {
      expect(label).toBeTruthy();
    }
  });

  it('does not ship the social placeholders plan §7 sketched', async () => {
    const fixture = TestBed.createComponent(SiteFooter);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    // Deliberate omission, asserted so it cannot be reintroduced by accident.
    // NOVA is fictional: any account would be invented, and dead links would be
    // fake controls that keyboard users can tab into for no reason.
    expect(root.querySelectorAll('a[target="_blank"]')).toHaveLength(0);
    expect(root.querySelectorAll('a[href*="instagram"]')).toHaveLength(0);
    expect(root.querySelectorAll('a[href*="linkedin"]')).toHaveLength(0);
    expect(root.querySelectorAll('a[href*="twitter"], a[href*="x.com"]')).toHaveLength(0);
    expect(root.querySelectorAll('a[href^="http"]')).toHaveLength(0);

    // And no inert stand-ins dressed as links either.
    expect(root.querySelectorAll('[aria-disabled="true"]')).toHaveLength(0);
  });

  it('adds only the five expected tab stops', async () => {
    const fixture = TestBed.createComponent(SiteFooter);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    // Wordmark + four nav links. Nothing decorative is focusable.
    const focusable = root.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    expect(focusable).toHaveLength(5);
    expect(root.querySelectorAll('button')).toHaveLength(0);
    expect(root.querySelectorAll('[tabindex]')).toHaveLength(0);
  });

  it('carries the fictional-brand disclosure', async () => {
    const fixture = TestBed.createComponent(SiteFooter);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    const disclosure = root.querySelector('.footer__disclosure')?.textContent?.toLowerCase() ?? '';
    expect(disclosure).toContain('fictional');
  });

  it('contains no invented contact details', async () => {
    const fixture = TestBed.createComponent(SiteFooter);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    // D4: the footer contact is an inert placeholder. No live contact mechanism.
    expect(root.querySelector('a[href^="mailto:"]')).toBeNull();
    expect(root.querySelector('a[href^="tel:"]')).toBeNull();

    const text = root.textContent ?? '';
    expect(text).not.toMatch(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);

    // Nor an invented street address, phone number or registration detail. The
    // copyright year is the only number the footer is allowed to contain.
    expect(text).not.toMatch(/\+?\d[\d\s().-]{7,}\d/);
    expect(text).not.toMatch(
      /\b(registered|incorporat\w*|certified|certification|ltd|inc|gmbh)\b/i,
    );
  });

  it('contains no fabricated social proof', async () => {
    const fixture = TestBed.createComponent(SiteFooter);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    // Word-ban assertions are useless here: the disclosure legitimately names
    // "testimonials" in order to negate them. Assert on the *shape* of a claim
    // instead — a score, a star glyph, a headcount, or a customer count.
    const text = root.textContent ?? '';
    expect(text).not.toMatch(/\d\s*\/\s*5/);
    expect(text).not.toMatch(/[★☆]/);
    expect(text).not.toMatch(/\d[\d,.]*\s*\+?\s*(customers|clients|reviews|happy)/i);
  });
});
