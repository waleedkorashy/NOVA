import { TestBed } from '@angular/core/testing';
import { CraftProcess } from './craft-process';

function render() {
  const fixture = TestBed.createComponent(CraftProcess);
  return fixture;
}

describe('CraftProcess', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CraftProcess],
    }).compileComponents();
  });

  it('renders the three steps in working order', async () => {
    const fixture = render();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    const titles = Array.from(root.querySelectorAll('.numbered__title')).map((h3) =>
      h3.textContent?.trim(),
    );

    expect(titles).toEqual([
      'Material first.',
      'Joinery, not hardware.',
      'A finish that can be repaired.',
    ]);
  });

  it('is a named region labelled by its own h2', async () => {
    const fixture = render();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    const section = root.querySelector('section');

    expect(section?.getAttribute('aria-labelledby')).toBe('craft-title');

    const label = root.querySelector('#craft-title');
    expect(label?.tagName).toBe('H2');
    expect(label?.textContent?.trim()).toBe('How a piece gets made.');
  });

  it('renders as an inverted band, so it never claims one of the four nav anchors', async () => {
    const fixture = render();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    const section = root.querySelector('section');

    // The band is the section's own background rather than a full-bleed wrapper,
    // which is why it can be edge-to-edge without `100vw` and without a
    // negative-margin escape hatch. See craft-process.scss.
    expect(section?.classList.contains('section--invert')).toBe(true);

    // #collection M3, #about M6, #journal M5, #contact M7 — none of them here.
    expect(section?.id).toBe('');
    expect(root.querySelector('#about')).toBeNull();
    expect(root.querySelector('#contact')).toBeNull();
  });

  it('keeps the document outline unbroken: one h2 here, h3 per step', async () => {
    const fixture = render();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelectorAll('h1')).toHaveLength(0);
    expect(root.querySelectorAll('h2')).toHaveLength(1);
    expect(root.querySelectorAll('h3')).toHaveLength(3);
  });

  it('keeps the ordered-list semantics while removing the markers', async () => {
    const fixture = render();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    const list = root.querySelector('ol');

    // These steps are a sequence, so the list is ordered rather than unordered.
    // `role="list"` preserves the semantics that `.list-reset` would otherwise
    // make Safari and VoiceOver drop.
    expect(list?.tagName).toBe('OL');
    expect(list?.getAttribute('role')).toBe('list');
    expect(list?.classList.contains('list-reset')).toBe(true);
    expect(list?.querySelectorAll(':scope > li')).toHaveLength(3);
  });

  it('hides the oversized step numerals from assistive tech', async () => {
    const fixture = render();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    const indices = Array.from(root.querySelectorAll('.craft__index'));

    expect(indices.map((el) => el.textContent?.trim())).toEqual(['01', '02', '03']);

    // The <ol> exposes position already; announcing the numeral as well would
    // state the order twice per step.
    for (const index of indices) {
      expect(index.getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('states method rather than evidence, and invents no facts about scale', async () => {
    const fixture = render();
    await fixture.whenStable();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    // The lede promises method, so the copy has to keep that promise: the steps
    // below must not introduce the scale claims it disclaims.
    expect(text).not.toMatch(/\b(scale|volume|units? produced|output)\b/i);
    expect(text).not.toMatch(/\b(every|each) (single|one) piece\b/i);

    // Named techniques are fine — they describe method. A facility, a headcount,
    // a lead time or a credential is a claim about a business that does not
    // exist, and none of those may appear.
    expect(text).not.toMatch(
      /\b(workshop|factory|studio|warehouse|fleet|artisans?|craftspeople)\b/i,
    );
    expect(text).not.toMatch(/\b(certified|accredited|guarantee[ds]?|warranty|iso\s?\d+|fsc)\b/i);
    expect(text).not.toMatch(/\b(\d+\s*(employees?|people|staff|craftsmen|makers))\b/i);
    expect(text).not.toMatch(/\b(handmade in|made in|sourced from|shipped from)\b/i);
    expect(text).not.toMatch(/\b\d+\s*(days?|weeks?|months?|years?)\b/i);
    expect(text).not.toMatch(/\b(sustainab\w+|eco[- ]?friendly|carbon neutral)\b/i);
  });

  it('carries no fabricated social proof anywhere in the section', async () => {
    const fixture = render();
    await fixture.whenStable();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    // This section replaced the planned testimonial block (approved D2), so it is
    // the section most likely to drift back into one. Checked on rendered
    // content, not asserted in a comment.
    // Trailing \b on both sides: without it \bstars?\b matches the "star" inside
    // "start", so the guard fires on innocent copy instead of on social proof.
    expect(text).not.toMatch(
      /\b(reviews?|ratings?|rated|stars?|testimonials?|customers?|awards?)\b/i,
    );
    expect(text).not.toMatch(/[★☆]/);
  });

  it('uses no imagery and no card affordances', async () => {
    const fixture = render();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;

    // Three sibling blocks of content is the exact shape that turns into a SaaS
    // feature grid. The guard is structural: the shared pattern gives them a
    // hairline and a numeral and nothing else, and no box is introduced here.
    expect(root.querySelectorAll('img, svg, picture, video')).toHaveLength(0);
    expect(root.querySelectorAll('li.numbered')).toHaveLength(3);
    expect(root.querySelectorAll('button, a')).toHaveLength(0);

    for (const step of Array.from(root.querySelectorAll('li.numbered'))) {
      expect(step.querySelector('.numbered__title')?.tagName).toBe('H3');
      expect(step.querySelector('.numbered__body')).toBeTruthy();
    }
  });

  it('adds nothing focusable, so the tab order is unchanged by this section', async () => {
    const fixture = render();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;

    // Static content with no interactive elements is the correct outcome here:
    // there is no step to "activate", and a focusable step would imply one.
    expect(root.querySelectorAll('[tabindex], button, a, input, select, textarea')).toHaveLength(0);
  });
});
