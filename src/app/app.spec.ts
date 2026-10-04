import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('creates the shell', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the header and footer landmarks', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('site-header')).toBeTruthy();
    expect(root.querySelector('main#main')).toBeTruthy();
    expect(root.querySelector('site-footer')).toBeTruthy();
  });

  it('exposes the skip link as the first focusable element', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    const skip = root.querySelector<HTMLAnchorElement>('a.skip-link');
    expect(skip).toBeTruthy();
    expect(skip?.getAttribute('href')).toBe('#main');
    expect(root.querySelector('a.skip-link')).toBe(root.querySelectorAll('a[href], button')[0]);
  });

  it('provides all four approved anchor targets', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    for (const id of ['collection', 'about', 'journal', 'contact']) {
      expect(root.querySelector(`#${id}`), `missing #${id}`).toBeTruthy();
    }
  });

  it('hands the real catalogue to the collection section rather than a placeholder', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    // M3 replaced the `#collection` scaffold placeholder with the real section,
    // and `#collection` is now owned by FeaturedCollection rather than declared
    // in the shell. Asserting the id here as well would mean one id in two
    // places, so the section is the only declaration.
    const section = root.querySelector('app-featured-collection #collection');
    expect(section).toBeTruthy();
    expect(root.querySelector('.shell-anchor#collection')).toBeNull();

    // Six cards from the real PRODUCTS, so the section is actually populated
    // rather than rendering its empty state.
    expect(root.querySelectorAll('app-featured-collection ui-product-card')).toHaveLength(6);
    expect(root.querySelector('app-featured-collection .collection__empty')).toBeNull();
  });

  it('renders the hero first inside main, with the page’s only h1', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    const main = root.querySelector('main#main');
    expect(main?.firstElementChild?.tagName).toBe('APP-HERO');

    // M2 owns the single page-level h1. Later milestones add sections below it
    // and must not introduce a second one.
    expect(root.querySelectorAll('h1')).toHaveLength(1);
    expect(root.querySelector('app-hero h1')?.textContent?.trim()).toBe(
      'Good rooms are made slowly.',
    );
  });

  it('renders the sections in plan order', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    const order = Array.from(root.querySelectorAll('main > *')).map((el) =>
      el.tagName.toLowerCase(),
    );

    // Plan §7 fixes the section order. M4 inserted two deliberately unaddressed
    // sections; M5 added one that owns #journal, M6 added two more, of which
    // Brand Story owns #about, and M7 added the eighth, which owns #contact. The
    // placeholder count falling 3 -> 2 -> 1 -> 0 is the visible proof the M1
    // placeholders were removed rather than shadowed: #journal went in M5,
    // #about in M6, #contact in M7. There are none left.
    expect(order).toEqual([
      'app-hero',
      'app-featured-collection',
      'app-brand-values',
      'app-craft-process',
      'app-editorial',
      'app-product-showcase',
      'app-brand-story',
      'app-final-cta',
    ]);

    // Position in the document, asserted rather than implied: M5's section must
    // land AFTER Craft and BEFORE the #about owner. The M1 placeholders
    // were authored #about, #journal, #contact in that DOM order, so wiring
    // Editorial into its own placeholder slot would have silently put the M6
    // brand story above it — the page would read Craft → About → Editorial, which
    // is not plan §7's composition.
    const main = root.querySelector('main#main')!;
    const collection = root.querySelector('app-featured-collection')!;
    const values = root.querySelector('app-brand-values')!;
    const craft = root.querySelector('app-craft-process')!;
    const editorial = root.querySelector('app-editorial')!;
    const showcase = root.querySelector('app-product-showcase')!;
    const story = root.querySelector('app-brand-story')!;
    const about = root.querySelector('#about')!;
    const cta = root.querySelector('app-final-cta')!;
    const contact = root.querySelector('#contact')!;

    expect(
      collection.compareDocumentPosition(values) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(values.compareDocumentPosition(craft) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(
      craft.compareDocumentPosition(editorial) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      editorial.compareDocumentPosition(showcase) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(showcase.compareDocumentPosition(story) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(story.compareDocumentPosition(about) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(
      editorial.compareDocumentPosition(about) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    // M7 closes the sequence: the Final CTA is the last child of main, after
    // Brand Story, and it is where #contact lives.
    expect(cta).toBeTruthy();
    expect(main?.lastElementChild?.tagName).toBe('APP-FINAL-CTA');
    expect(story.compareDocumentPosition(cta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(about.compareDocumentPosition(contact) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('gives each of the four nav anchors exactly one owner', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    // #collection is owned by FeaturedCollection, #journal by Editorial, #about by
    // BrandStory and #contact by FinalCta. All four M1 placeholders are retired as
    // of M7. A count above 1 for any of these means an id got declared twice —
    // the failure mode that breaks fragment navigation silently.
    for (const id of ['collection', 'about', 'journal', 'contact']) {
      expect(root.querySelectorAll(`#${id}`), `#${id} owner count`).toHaveLength(1);
    }

    // M7's headline structural claim: the scaffold is gone for good, not merely
    // relocated. A non-zero count here means a placeholder was re-added.
    expect(root.querySelectorAll('.shell-anchor')).toHaveLength(0);

    expect(root.querySelectorAll('app-brand-values [id]')).toHaveLength(1); // the h2 label
    expect(root.querySelectorAll('app-craft-process [id]')).toHaveLength(1); // the h2 label
    // Editorial is the first section that both owns a nav anchor and carries its
    // own accessible name, so it legitimately holds two ids: #journal and the h2
    // that `aria-labelledby` points at. Brand Story is in the same position.
    expect(root.querySelectorAll('app-editorial [id]')).toHaveLength(2);
    expect(root.querySelectorAll('app-brand-story [id]')).toHaveLength(2);

    // Product Showcase is NOT a nav target, so it holds exactly one id — the h2
    // label. If it ever grew a second, it would be claiming an approved anchor.
    expect(root.querySelectorAll('app-product-showcase [id]')).toHaveLength(1);

    // Final CTA is the fourth nav-anchor owner and the last section, so it holds
    // exactly two ids: #contact and the h2 that `aria-labelledby` points at.
    expect(root.querySelectorAll('app-final-cta [id]')).toHaveLength(2);

    // The nav anchor must resolve to a real section rather than a leftover
    // placeholder paragraph — the Hero's "View Lookbook" CTA has pointed at
    // #journal since M2 and previously landed on placeholder text.
    const journal = root.querySelector('#journal');
    expect(journal?.classList.contains('shell-anchor')).toBe(false);
    expect(journal?.closest('app-editorial')).toBeTruthy();
    expect(journal?.getAttribute('aria-labelledby')).toBe('editorial-title');

    // Same check for #about after M6: the shell placeholder is gone, and the nav
    // resolves to a labelled section that is not a scaffold leftover.
    const about = root.querySelector('#about');
    expect(about?.classList.contains('shell-anchor')).toBe(false);
    expect(about?.tagName).toBe('SECTION');
    expect(about?.closest('app-brand-story')).toBeTruthy();
    expect(about?.getAttribute('aria-labelledby')).toBe('about-title');
    expect(root.querySelector('.shell-anchor#about')).toBeNull();

    // M7, same check for #contact: the shell placeholder is deleted and the nav
    // resolves to the real Final CTA section, which is the last child of main.
    const contact = root.querySelector('#contact')!;
    expect(contact?.classList.contains('shell-anchor')).toBe(false);
    expect(contact?.tagName).toBe('SECTION');
    expect(contact?.closest('app-final-cta')).toBeTruthy();
    expect(contact?.getAttribute('aria-labelledby')).toBe('contact-title');
    expect(root.querySelector('.shell-anchor#contact')).toBeNull();
  });

  it('declares every id exactly once in the whole document', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    // Page-wide, because a duplicate id is invisible to any single component's
    // test: M7 briefly declared `id="top"` on <body> while site-header already
    // owned it via `host: { id: 'top' }`, and only a document-level count caught
    // it. One owner per id, everywhere.
    const counts = new Map<string, number>();
    for (const el of Array.from(root.querySelectorAll('[id]'))) {
      counts.set(el.id, (counts.get(el.id) ?? 0) + 1);
    }
    const duplicated = Array.from(counts)
      .filter(([, n]) => n > 1)
      .map(([id, n]) => `${id} x${n}`);
    expect(duplicated, `duplicate ids: ${duplicated.join(', ')}`).toHaveLength(0);

    // The home target the footer wordmark reuses is the header's own host id.
    const tops = root.querySelectorAll('#top');
    expect(tops).toHaveLength(1);
    expect(tops[0].tagName).toBe('SITE-HEADER');
  });

  it('resolves every navigation destination to a real owner', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    // The header nav and the footer nav must point at sections that actually
    // exist in this document — the failure being a link whose href matches
    // nothing, which silently does nothing when clicked.
    const navHrefs = Array.from(
      root.querySelectorAll('site-header a[href^="#"], site-footer a[href^="#"]'),
    ).map((a) => a.getAttribute('href'));

    expect(navHrefs.length).toBeGreaterThan(0);
    for (const href of navHrefs) {
      expect(root.querySelector(href!), `${href} has no owner`).toBeTruthy();
    }

    // ...and each destination is owned exactly once.
    for (const href of new Set(navHrefs)) {
      expect(root.querySelectorAll(href!), `${href} owner count`).toHaveLength(1);
    }
  });

  it('feeds the Showcase from the same catalogue as the Collection, not a copy', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    // M6 must derive its dominant piece from the same `products` binding the
    // Collection uses, rather than declaring a second list. The shell-level proof
    // is that both sections name the SAME first product: two independent hard-coded
    // lists would agree today and drift the first time the API reordered anything.
    const firstCardName = root
      .querySelector('app-featured-collection .card__link')
      ?.textContent?.trim();
    const showcaseName = root.querySelector('.showcase__name')?.textContent?.trim();

    expect(firstCardName).toBeTruthy();
    expect(showcaseName).toBe(firstCardName);

    // Six products in, six accounted for: one dominant piece plus a five-item text
    // index, each appearing exactly once across the section.
    const rendered = [
      showcaseName,
      ...Array.from(root.querySelectorAll('.showcase__index-name')).map((el) =>
        el.textContent?.trim(),
      ),
    ];
    expect(rendered).toHaveLength(6);
    expect(new Set(rendered).size).toBe(6);

    // The index is plain text, so it must not introduce links the cards above
    // already provide, nor a second id claiming an approved anchor.
    expect(root.querySelectorAll('app-product-showcase a[href]')).toHaveLength(0);
    expect(root.querySelectorAll('app-product-showcase [id]')).toHaveLength(1);
  });

  it('carries no fabricated social proof anywhere on the page', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    // The page-level guard. Each section also asserts this against its own
    // rendered text, but a section test cannot catch copy added to the shell or
    // to a shared component — this one can.
    //
    // Scoped to <main> on purpose. The footer legitimately contains the word
    // "testimonials" in its disclaimer ("No products, testimonials, or offers
    // shown on this site are real"), so a whole-page word scan cannot tell a
    // disclaimer from a claim. site-footer.spec.ts already asserts that
    // disclaimer separately; this guard is about section copy, so it must not
    // read the footer.
    const main = root.querySelector('main');
    const text = main?.textContent ?? '';

    // Note the trailing \b on BOTH sides. A leading-only guard silently matches
    // innocent words — \bstars?\b hits the "star" inside "start" — which turns
    // the check into a false-positive generator instead of a real one. Plurals
    // are explicit so "testimonials" and "reviews" are still caught.
    expect(text).not.toMatch(
      /\b(reviews?|ratings?|rated|stars?|testimonials?|customers?|awards?)\b/i,
    );
    expect(text).not.toMatch(/[★☆]/);
  });

  it('does not mark the page inert while the menu is closed', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('main')?.hasAttribute('inert')).toBe(false);
    expect(root.querySelector('site-footer')?.hasAttribute('inert')).toBe(false);
  });
});
