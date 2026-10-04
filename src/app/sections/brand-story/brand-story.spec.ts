import { TestBed } from '@angular/core/testing';
import { BrandStory } from './brand-story';

async function render() {
  const fixture = TestBed.createComponent(BrandStory);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('BrandStory', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandStory],
    }).compileComponents();
  });

  it('owns #about on the real section, so the nav anchor has one target', async () => {
    const root = await render();

    // Plan §4.4 assigns #about to this component, replacing the M1 shell
    // placeholder. Exactly one of it: a duplicate id silently breaks fragment
    // scrolling.
    expect(root.querySelectorAll('#about')).toHaveLength(1);
    expect(root.querySelector('#about')?.tagName).toBe('SECTION');
    expect(root.querySelector('section.story')?.getAttribute('id')).toBe('about');
  });

  it('is a named region labelled by its own h2', async () => {
    const root = await render();
    const section = root.querySelector('section.story');

    expect(section?.getAttribute('aria-labelledby')).toBe('about-title');

    // Exactly two ids: #about plus the h2 that `aria-labelledby` points at.
    expect(root.querySelectorAll('[id]')).toHaveLength(2);
    expect(root.querySelector('#about-title')?.tagName).toBe('H2');
  });

  it('is built from text, and says so by rendering no image at all', async () => {
    const root = await render();

    // Plan §7 sketches a portrait here. No image could be sourced with honest
    // attribution, and every approved asset already appears elsewhere on the
    // page. This asserts the deviation deliberately rather than leaving it to
    // drift: adding a picture here needs a real source and a real attribution
    // entry, not a fetch that happened to work. See brand-story.ts.
    expect(root.querySelectorAll('img')).toHaveLength(0);
    expect(root.querySelectorAll('figure, picture, svg')).toHaveLength(0);

    // The section still has to be substantial — text-only is not an excuse for a
    // two-line filler block.
    const paragraphs = root.querySelectorAll('.prose p');
    expect(paragraphs.length).toBeGreaterThanOrEqual(3);
    for (const p of Array.from(paragraphs)) {
      expect(p.textContent?.trim().length ?? 0).toBeGreaterThan(80);
    }
    expect(root.querySelectorAll('.story__creed-item')).toHaveLength(3);
  });

  it('reuses the global primitives rather than restating them', async () => {
    const root = await render();

    // `.container`, `.section` and `.prose` come from the global stylesheet, so the
    // section inherits the fluid scale and spacing with no component CSS of its own
    // duplicating them. `.section` is on the <section> and `.container` on the div
    // inside it, so they are asserted separately rather than as one compound
    // selector.
    expect(root.querySelector('section.story.section')).toBeTruthy();
    expect(root.querySelector('.container')).toBeTruthy();
    expect(root.querySelector('.prose.story__prose')).toBeTruthy();
    expect(root.querySelector('ul.list-reset.story__creed')).toBeTruthy();
  });

  it('renders the three statements as a list, with no tab stops', async () => {
    const root = await render();
    const creed = root.querySelector('.story__creed');

    // `role="list"` sits alongside `.list-reset` because stripping markers with CSS
    // alone makes Safari and VoiceOver drop the list semantics entirely.
    expect(creed?.tagName).toBe('UL');
    expect(creed?.getAttribute('role')).toBe('list');
    expect(creed?.querySelectorAll(':scope > li')).toHaveLength(3);

    // A philosophy section with links is usually a disguised nav, and there is
    // nowhere honest for those links to go.
    expect(root.querySelectorAll('a[href]')).toHaveLength(0);
    expect(root.querySelectorAll('[tabindex]')).toHaveLength(0);
  });

  it('keeps the heading outline at a single h2', async () => {
    const root = await render();

    // The statements are list items, not headings, so this section contributes one
    // h2 to the page and nothing deeper. The Hero owns the only h1.
    expect(root.querySelectorAll('h1')).toHaveLength(0);
    expect(root.querySelectorAll('h2')).toHaveLength(1);
    expect(root.querySelectorAll('h3, h4, h5, h6')).toHaveLength(0);
  });

  it('holds no form or interactive elements', async () => {
    const root = await render();

    // Plan §4 explicitly rules out company data: there is no founding date, no
    // location, no team, no contact field here to be invented, and the component
    // takes no inputs at all.
    expect(root.querySelectorAll('input, textarea, select, button')).toHaveLength(0);
    expect(root.querySelectorAll('form')).toHaveLength(0);
  });

  it('does not repeat the Hero', async () => {
    const root = await render();
    const text = (root.textContent ?? '').toLowerCase();

    // The page's positioning already lands in the Hero. Reusing its distinctive
    // phrases here would make the second half of the page feel like a recap, which
    // is the failure this section exists to avoid.
    for (const phrase of [
      'made slowly',
      'proportioned rather than decorated',
      'made to be kept',
      'collection no. 01',
    ]) {
      expect(text, `duplicates the Hero: "${phrase}"`).not.toContain(phrase);
    }
  });

  it('invents no company history, figures or contact details', async () => {
    const root = await render();
    const text = root.textContent ?? '';

    // NOVA is a self-initiated design study, so the copy argues the philosophy and
    // stops. What it must not acquire is the texture that makes invented copy
    // convincing: a date, a place, a headcount, a performance figure, a way to
    // contact anyone.
    expect(text).not.toMatch(/\b(19|20)\d{2}\b/); // founding or "since" years
    expect(text).not.toMatch(/\d+\s*(%|per cent|percent)\b/i); // performance claims
    expect(text).not.toMatch(/\b\d+\s*(employees|staff|people|clients|pieces in stock)\b/i);
    expect(text).not.toMatch(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i); // email
    expect(text).not.toMatch(/\+?\d[\d\s()-]{7,}/); // phone
    expect(text).not.toMatch(/[€$£]\s?\d/); // prices
    expect(text).not.toMatch(/\b(founded|established|headquartered|based in|certified)\b/i);
  });

  it('carries no fabricated social proof', async () => {
    const root = await render();
    const text = root.textContent ?? '';

    // \b on BOTH sides, and plurals listed explicitly: a leading-only guard matches
    // the "star" inside "start" and turns the check into a false-positive generator.
    expect(text).not.toMatch(
      /\b(reviews?|ratings?|rated|stars?|testimonials?|customers?|awards?)\b/i,
    );
    expect(text).not.toMatch(/[★☆]/);
  });
});
