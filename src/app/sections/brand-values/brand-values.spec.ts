import { TestBed } from '@angular/core/testing';
import { BrandValues } from './brand-values';

function render() {
  const fixture = TestBed.createComponent(BrandValues);
  return fixture;
}

describe('BrandValues', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandValues],
    }).compileComponents();
  });

  it('renders three principles, in the order they are argued', async () => {
    const fixture = render();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    const titles = Array.from(root.querySelectorAll('.numbered__title')).map((h3) =>
      h3.textContent?.trim(),
    );

    expect(titles).toEqual([
      'Proportion settles it.',
      'The joint stays visible.',
      'It should age, not expire.',
    ]);
  });

  it('is a named region labelled by its own h2', async () => {
    const fixture = render();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    const section = root.querySelector('section');

    expect(section?.getAttribute('aria-labelledby')).toBe('values-title');

    const label = root.querySelector('#values-title');
    expect(label?.tagName).toBe('H2');
    expect(label?.textContent?.trim()).toBe('Three decisions, restated.');
  });

  it('does not claim #about, which plan §4.4 assigns to brand-story in M6', async () => {
    const fixture = render();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;

    // The four approved nav anchors are #collection, #about, #journal and
    // #contact. #about belongs to <app-brand-story> (M6). Taking it here would
    // give the id two owners — this section and the M1 shell placeholder — so
    // this section deliberately declares no id at all.
    expect(root.querySelector('section')?.id).toBe('');
    expect(root.querySelector('#about')).toBeNull();
  });

  it('keeps the document outline unbroken: one h2 here, h3 per principle', async () => {
    const fixture = render();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;

    // h1 belongs to the Hero alone; every section is a peer, so this contributes
    // exactly one h2 and three h3 and never skips a level.
    expect(root.querySelectorAll('h1')).toHaveLength(0);
    expect(root.querySelectorAll('h2')).toHaveLength(1);
    expect(root.querySelectorAll('h3')).toHaveLength(3);
  });

  it('keeps the list semantics while removing the markers', async () => {
    const fixture = render();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    const list = root.querySelector('ol');

    // `.list-reset` strips the markers, which would otherwise make Safari and
    // VoiceOver drop the list entirely. `role="list"` is what preserves it.
    expect(list?.getAttribute('role')).toBe('list');
    expect(list?.classList.contains('list-reset')).toBe(true);
    expect(list?.querySelectorAll(':scope > li')).toHaveLength(3);
  });

  it('hides the visible index numerals from assistive tech', async () => {
    const fixture = render();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    const indices = Array.from(root.querySelectorAll('.values__index'));

    expect(indices.map((el) => el.textContent?.trim())).toEqual(['01', '02', '03']);

    // The <ol> already exposes position ("list, 3 items"). Announcing the
    // decorative numeral as well would read "1 of 3, list item, 01" — order
    // stated twice for one principle.
    for (const index of indices) {
      expect(index.getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('builds each principle from the shared numbered-column pattern', async () => {
    const fixture = render();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;

    // The pattern lives in the global layer precisely because Craft & Process
    // reuses it; if these columns stop using it, the two sections can drift.
    expect(root.querySelectorAll('li.numbered')).toHaveLength(3);

    for (const item of Array.from(root.querySelectorAll('li.numbered'))) {
      expect(item.querySelector('.numbered__title')?.tagName).toBe('H3');
      expect(item.querySelector('.numbered__body')).toBeTruthy();
    }
  });

  it('uses no imagery, so the section cannot become a stock-photo row', async () => {
    const fixture = render();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;

    // Principles are carried by type and whitespace. An image here would add
    // weight to the initial bundle and the asset budget for decoration the
    // approved direction does not ask for.
    expect(root.querySelectorAll('img, svg, picture, video')).toHaveLength(0);
  });

  it('carries no fabricated social proof anywhere in the section', async () => {
    const fixture = render();
    await fixture.whenStable();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    // AGENTS.md forbids ratings, reviews, star counts, customer counts, press
    // logos and testimonials, and D2 replaced the planned testimonial block with
    // this section — so the risk is highest here. Checked on rendered content,
    // not asserted in a comment.
    // Trailing \b on both sides: without it \bstars?\b matches the "star" inside
    // "start", so the guard fires on innocent copy instead of on social proof.
    expect(text).not.toMatch(
      /\b(reviews?|ratings?|rated|stars?|testimonials?|customers?|awards?)\b/i,
    );
    expect(text).not.toMatch(/[★☆]/);

    // And the specific fabrication shapes a "principles" section drifts into:
    // a trading history, a credential, or a numeric performance claim.
    expect(text).not.toMatch(/\b(since|est\.?|founded|established)\s*(19|20)\d\d/i);
    expect(text).not.toMatch(/\b(certified|accredited|guarantee[ds]?|warranty|warranted)\b/i);
    expect(text).not.toMatch(/\d+\s*(%|percent)/);
    expect(text).not.toMatch(/[€$£]\s?\d/);
  });
});
