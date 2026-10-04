import { TestBed } from '@angular/core/testing';
import { Editorial } from './editorial';

function render() {
  return TestBed.createComponent(Editorial);
}

describe('Editorial', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Editorial],
    }).compileComponents();
  });

  it('owns #journal on the real section, so the nav anchor has one target', async () => {
    const fixture = render();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;

    // Plan §4.4 assigns #journal to this component. The id must be on an element
    // inside the component, not on a leftover shell placeholder, and there must
    // be exactly one of it — a duplicate id silently breaks fragment scrolling,
    // and `aria-labelledby` on the wrapper would target nothing.
    expect(root.querySelectorAll('#journal')).toHaveLength(1);
    expect(root.querySelector('#journal')?.tagName).toBe('SECTION');
    expect(root.querySelector('section.editorial')?.getAttribute('id')).toBe('journal');
  });

  it('is a named region labelled by its own h2', async () => {
    const fixture = render();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    const section = root.querySelector('section.editorial');

    expect(section?.getAttribute('aria-labelledby')).toBe('editorial-title');

    // Exactly one id inside the component: the heading that `aria-labelledby`
    // points at. `craft-process.spec.ts` asserts the same invariant, and the
    // reason it is worth asserting is that a second id here would be an
    // unreferenced anchor.
    expect(root.querySelectorAll('[id]')).toHaveLength(2); // #journal + the h2 label
    expect(root.querySelector('#editorial-title')?.tagName).toBe('H2');
  });

  it('renders one image, captioned, with dimensions and non-empty alt text', async () => {
    const fixture = render();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    const images = Array.from(root.querySelectorAll('img'));

    // One large image is the whole composition (plan §7). A second image would
    // turn the section into a gallery, which is the product grid by other means.
    expect(images).toHaveLength(1);

    const image = images[0];

    // Intrinsic size on the element is what reserves layout space. Without it the
    // lazy-loaded image reflows the page into it on arrival.
    expect(image.getAttribute('width')).toBe('1200');
    expect(image.getAttribute('height')).toBe('1800');

    // Below the fold and not marked priority, so NgOptimizedImage lazy-loads it.
    // `loading` is reflected onto the DOM by the directive, and the directive also
    // lowers fetch priority on anything without `priority` — so this image is the
    // opposite of the Hero's, which is the point of placing it here.
    expect(image.getAttribute('loading')).toBe('lazy');
    expect(image.getAttribute('fetchpriority')).not.toBe('high');

    // Alt text: present, and not a placeholder. The descriptive wording is
    // checked in the next test so a failure here points at the attribute, not at
    // the copy.
    const alt = image.getAttribute('alt') ?? '';
    expect(alt.length).toBeGreaterThan(20);
    expect(alt.toLowerCase()).not.toMatch(/^(image|photo|picture|graphic)\b/);
    expect(alt).not.toContain('NOVA');

    const caption = root.querySelector('figcaption');
    expect(caption?.textContent?.trim()).toBeTruthy();
    expect(caption?.closest('figure')).toBeTruthy();
  });

  it('describes only what the photograph shows, and never repeats the alt text', async () => {
    const fixture = render();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    const alt = (root.querySelector('img')?.getAttribute('alt') ?? '').toLowerCase();
    const caption = (root.querySelector('figcaption')?.textContent ?? '').toLowerCase();

    // ATTRIBUTION.md rule 4 for a lifestyle image: the caption states the subject
    // or location; it must not speculate about mood or meaning. "Quiet", "calm",
    // "serene" are interpretations dressed as description.
    expect(caption).not.toMatch(/\b(quiet|calm|serene|peaceful|cozy|cosy|tranquil|inviting)\b/);

    // A screen reader user gets the alt text directly after the caption. The two
    // are different registers by design — full scene vs short editorial line — so
    // a duplicate would make the same sentence read twice.
    expect(caption).not.toBe(alt);
    expect(alt).not.toBe(caption);
  });

  it('carries a display-serif pull quote with no invented attribution', async () => {
    const fixture = render();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    const quote = root.querySelector('blockquote.editorial__quote');

    expect(quote).toBeTruthy();
    expect(quote?.textContent?.trim()).toBeTruthy();

    // A <cite> would name a person or publication. The line is the brand's own
    // position; there is nobody to credit, so inventing one would be a fabricated
    // claim (AGENTS.md).
    expect(quote?.querySelector('cite')).toBeNull();
    expect(quote?.querySelectorAll('p')).toHaveLength(1);
  });

  it('is not a grid and adds no card affordances', async () => {
    const fixture = render();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;

    // The guard that matters most for this section. `ui-product-card` is a
    // reusable primitive that any future section could reach for, and three or
    // more of them in a row is exactly the SaaS feature grid the design rejected.
    expect(root.querySelectorAll('ui-product-card')).toHaveLength(0);
    expect(root.querySelectorAll('ol, ul')).toHaveLength(0);
    expect(root.querySelectorAll('li')).toHaveLength(0);

    // No numbered step index — that is `craft-process`'s device, not this one's.
    expect(root.querySelectorAll('.numbered, .craft__index, .values__index')).toHaveLength(0);

    // Square, unraised, surface-free: the brand's established depth device is
    // whitespace. A card would need one of these.
    const frame = root.querySelector('.editorial__frame');
    expect(frame).toBeTruthy();
    expect(root.querySelectorAll('.card')).toHaveLength(0);

    // Reuses the global `.figure` primitive rather than restating its overflow /
    // placeholder / object-fit rules.
    expect(frame?.classList.contains('figure')).toBe(true);
  });

  it('carries no fabricated social proof or unverifiable claims', async () => {
    const fixture = render();
    await fixture.whenStable();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    // Trailing \b on both sides: without it \bstars?\b matches the "star" inside
    // "start", so the guard fires on innocent copy instead of on social proof.
    expect(text).not.toMatch(
      /\b(reviews?|ratings?|rated|stars?|testimonials?|customers?|awards?)\b/i,
    );
    expect(text).not.toMatch(/[★☆]/);

    // This is the section most likely to drift into lifestyle marketing, so the
    // commercial claims that usually arrive with a photograph get their own
    // guard: no counts, no durations, no impact or provenance claims.
    expect(text).not.toMatch(/\b(\d+\s*(customers?|clients?|pieces|orders?|reviews?))\b/i);
    expect(text).not.toMatch(/\b\d+\s*(days?|weeks?|months?|years?)\b/i);
    expect(text).not.toMatch(
      /\b(sustainab\w+|eco[- ]?friendly|carbon neutral|carbon[- ]?neutral)\b/i,
    );
    expect(text).not.toMatch(/\b(handmade in|made in|sourced from|shipped from)\b/i);
  });

  it('does not claim #collection, #about or #contact', async () => {
    const fixture = render();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;

    // #collection is M3's, #about is M6 brand-story's, #contact is M7's. Taking
    // any of them would duplicate an anchor and break the one-owner-per-target
    // invariant `app.spec.ts` asserts across the whole page.
    expect(root.querySelector('#collection')).toBeNull();
    expect(root.querySelector('#about')).toBeNull();
    expect(root.querySelector('#contact')).toBeNull();
  });

  it('adds nothing focusable, so the tab order is unchanged by this section', async () => {
    const fixture = render();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;

    // Nothing here goes anywhere. A link or button would be a tab stop that exists
    // only to be skipped (WCAG 2.4.3). The Hero's "View Lookbook" CTA is the one
    // control that points at this section, and it lives in the Hero.
    expect(root.querySelectorAll('[tabindex], button, a, input, select, textarea')).toHaveLength(0);
  });
});
