import { TestBed } from '@angular/core/testing';
import { FinalCta } from './final-cta';

describe('FinalCta', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinalCta],
    }).compileComponents();
  });

  it('owns #contact on a real, self-named section', async () => {
    const fixture = TestBed.createComponent(FinalCta);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    const section = root.querySelector('section#contact');
    expect(section).toBeTruthy();
    expect(section?.tagName).toBe('SECTION');

    // The nav target must be a labelled region, not a bare anchor. `id` is on the
    // section because it is the fragment target; `aria-labelledby` points at the
    // h2 because that is what gives the region its accessible NAME.
    expect(section?.getAttribute('aria-labelledby')).toBe('contact-title');
    expect(root.querySelector('#contact-title')?.tagName).toBe('H2');

    // Retired M1 scaffold: a placeholder must not come back.
    expect(section?.classList.contains('shell-anchor')).toBe(false);
  });

  it('carries exactly one id of its own — the anchor plus the heading label', async () => {
    const fixture = TestBed.createComponent(FinalCta);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    // Same shape as Editorial and Brand Story: an anchor-owning section that
    // also names itself legitimately holds two ids. A third would mean it had
    // started claiming another approved anchor.
    expect(root.querySelectorAll('[id]')).toHaveLength(2);
  });

  it('has one action, and it points at the page’s primary CTA target', async () => {
    const fixture = TestBed.createComponent(FinalCta);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    const actions = Array.from(root.querySelectorAll('a[href]'));
    expect(actions).toHaveLength(1);

    // Plan §4.4 fixes this: the CTA button shares the Collection's target rather
    // than inventing a destination, so the page has a single primary CTA.
    expect(actions[0].getAttribute('href')).toBe('#collection');
    expect(actions[0].textContent?.trim()).toBe('Explore the Collection');
  });

  it('contains no contact mechanism of any kind', async () => {
    const fixture = TestBed.createComponent(FinalCta);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    // Approved D4 and AGENTS.md: NOVA is fictional, so there is no real channel
    // to offer. The section must not gesture at one.
    expect(root.querySelector('form')).toBeNull();
    expect(root.querySelector('input, textarea, select, button')).toBeNull();
    expect(root.querySelector('a[href^="mailto:"]')).toBeNull();
    expect(root.querySelector('a[href^="tel:"]')).toBeNull();

    const text = root.textContent ?? '';
    expect(text).not.toMatch(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
  });

  it('carries no fabricated social proof or invented business detail', async () => {
    const fixture = TestBed.createComponent(FinalCta);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const text = root.textContent ?? '';

    // \b on both sides: a leading-only guard matches innocent words — "stars?"
    // hits the "star" inside "start", which is exactly the word this section's
    // copy uses. Plurals explicit so reviews/testimonials are still caught.
    expect(text).not.toMatch(
      /\b(reviews?|ratings?|rated|stars?|testimonials?|customers?|awards?)\b/i,
    );

    // No invented business facts: no phone numbers, no street addresses, no
    // registration or certification language.
    expect(text).not.toMatch(/\+?\d[\d\s().-]{7,}\d/);
    expect(text).not.toMatch(
      /\b(registered|incorporat\w*|certified|certification|ltd|inc|gmbh)\b/i,
    );

    // No generic SaaS CTA language.
    expect(text).not.toMatch(/\b(sign up|get started|subscribe|free trial|book a demo)\b/i);
  });

  it('keeps the heading hierarchy correct — an h2, and no second h1', async () => {
    const fixture = TestBed.createComponent(FinalCta);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    // The page's only h1 lives in the Hero; every section is its peer, so this
    // section's title is an h2 and nothing here introduces another h1.
    expect(root.querySelectorAll('h1')).toHaveLength(0);
    expect(root.querySelectorAll('h2')).toHaveLength(1);
  });

  it('adds exactly one tab stop', async () => {
    const fixture = TestBed.createComponent(FinalCta);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    const focusable = root.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    expect(focusable).toHaveLength(1);
    expect(focusable[0].tagName).toBe('A');

    // A native anchor to a real in-page target: no role, no tabindex, so nothing
    // to fake and no extra stop for a keyboard user.
    expect(focusable[0].getAttribute('role')).toBeNull();
    expect(focusable[0].getAttribute('tabindex')).toBeNull();
    expect(focusable[0].hasAttribute('aria-disabled')).toBe(false);
  });
});
