import { ComponentFixture, TestBed } from '@angular/core/testing';
import { INLINE_NAV_MIN_WIDTH_REM, SiteHeader } from './site-header';

describe('SiteHeader', () => {
  let fixture: ComponentFixture<SiteHeader>;
  let header: SiteHeader;
  let root: HTMLElement;
  let mediaQueries: Array<{
    query: string;
    emit(next: { matches: boolean }): void;
  }>;

  const trigger = () => root.querySelector<HTMLButtonElement>('button.menu-trigger')!;
  const nav = () => root.querySelector<HTMLElement>('nav')!;

  beforeEach(async () => {
    // jsdom ships no layout engine and no matchMedia, so the desktop-breakpoint
    // listener cannot be exercised without a stub. Registered BEFORE the
    // component is created, because the component subscribes in its constructor.
    mediaQueries = [];
    vi.stubGlobal('matchMedia', (query: string) => {
      const listeners = new Set<(event: MediaQueryListEvent) => void>();
      const entry = {
        query,
        matches: false,
        media: query,
        onchange: null,
        addEventListener: (_: string, fn: (event: MediaQueryListEvent) => void) =>
          listeners.add(fn),
        removeEventListener: (_: string, fn: (event: MediaQueryListEvent) => void) =>
          listeners.delete(fn),
        addListener: (fn: (event: MediaQueryListEvent) => void) => listeners.add(fn),
        removeListener: (fn: (event: MediaQueryListEvent) => void) => listeners.delete(fn),
        dispatchEvent: () => true,
        emit: (next: { matches: boolean }) => {
          entry.matches = next.matches;
          for (const fn of listeners) {
            fn({ matches: next.matches } as MediaQueryListEvent);
          }
        },
      };
      mediaQueries.push(entry);
      return entry as unknown as MediaQueryList;
    });

    await TestBed.configureTestingModule({
      imports: [SiteHeader],
    }).compileComponents();

    fixture = TestBed.createComponent(SiteHeader);
    header = fixture.componentInstance;
    root = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the wordmark, four nav links, and the primary CTA', () => {
    expect(root.querySelector('.wordmark')?.textContent?.trim()).toBe('NOVA');

    const links = [...root.querySelectorAll<HTMLAnchorElement>('.nav__link')];
    expect(links.map((a) => a.textContent?.trim())).toEqual([
      'Collection',
      'About',
      'Journal',
      'Contact',
    ]);

    const cta = root.querySelector<HTMLAnchorElement>('.nav__cta');
    expect(cta?.getAttribute('href')).toBe('#collection');
    expect(cta?.textContent?.trim()).toBe('Explore the Collection');
  });

  it('gives the wordmark a Home destination and an accessible name', () => {
    const mark = root.querySelector<HTMLAnchorElement>('.wordmark');

    // A real link to the top of the document, not a bare glyph or a div.
    expect(mark?.tagName).toBe('A');
    expect(mark?.getAttribute('href')).toBe('#top');

    // The visible word alone does not say where it goes, so the destination is
    // supplied by an accessible name — and the visible glyph stays "NOVA".
    expect(mark?.getAttribute('aria-label')).toBe('NOVA — Home');

    // The label is the accessible name, so the glyph must not be announced
    // a second time.
    const glyph = root.querySelector('.wordmark__text');
    expect(glyph?.getAttribute('aria-hidden')).toBe('true');
    expect(glyph?.textContent?.trim()).toBe('NOVA');
  });

  it('keeps the wordmark keyboard reachable as the first tab stop', () => {
    // DOM order is tab order here: there is no tabindex anywhere in the header.
    const focusable = [...root.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')];

    expect(focusable[0]?.classList.contains('wordmark')).toBe(true);
    expect(root.querySelectorAll('[tabindex]').length).toBe(0);
  });

  it('points every nav link at the approved fragment', () => {
    const links = [...root.querySelectorAll<HTMLAnchorElement>('.nav__link')];
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '#collection',
      '#about',
      '#journal',
      '#contact',
    ]);
  });

  it('exposes a single Primary nav landmark', () => {
    const navs = [...root.querySelectorAll('nav')];
    expect(navs).toHaveLength(1);
    expect(navs[0].getAttribute('aria-label')).toBe('Primary');
  });

  it('uses a real button with aria-expanded and aria-controls', () => {
    const button = trigger();
    expect(button.type).toBe('button');
    expect(button.getAttribute('aria-controls')).toBe('site-nav');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('aria-label')).toBe('Open menu');
  });

  it('updates the accessible label with the open state', async () => {
    trigger().click();
    await fixture.whenStable();
    expect(trigger().getAttribute('aria-label')).toBe('Close menu');

    trigger().click();
    await fixture.whenStable();
    expect(trigger().getAttribute('aria-label')).toBe('Open menu');
  });

  // The panel's visibility is driven entirely by this host class, so assert the
  // class rather than a computed style — jsdom applies no component stylesheet.
  it('reflects the open state onto the host so CSS can show the panel', async () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('is-open')).toBe(false);

    trigger().click();
    await fixture.whenStable();
    expect(host.classList.contains('is-open')).toBe(true);

    trigger().click();
    await fixture.whenStable();
    expect(host.classList.contains('is-open')).toBe(false);
  });

  it('moves focus into the panel when it opens', async () => {
    trigger().click();
    await fixture.whenStable();

    const links = [...nav().querySelectorAll<HTMLElement>('.nav__link')];
    expect(document.activeElement).toBe(links[0]);
  });

  it('toggles aria-expanded on click', async () => {
    trigger().click();
    await fixture.whenStable();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(header.menuOpen()).toBe(true);

    trigger().click();
    await fixture.whenStable();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    trigger().click();
    await fixture.whenStable();
    expect(header.menuOpen()).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();

    expect(header.menuOpen()).toBe(false);
    expect(document.activeElement).toBe(trigger());
  });

  it('ignores Escape when the menu is already closed', async () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(header.menuOpen()).toBe(false);
  });

  it('closes when an anchor link is activated', async () => {
    trigger().click();
    await fixture.whenStable();

    root.querySelector<HTMLAnchorElement>('.nav__link')!.click();
    await fixture.whenStable();
    expect(header.menuOpen()).toBe(false);
  });

  it('closes when the viewport crosses into inline-nav width', async () => {
    trigger().click();
    await fixture.whenStable();
    expect(header.menuOpen()).toBe(true);

    // jsdom has no layout engine, so the stub registered in beforeEach is what
    // the component subscribed to. Drive it directly.
    mediaQueries
      .find((m) => m.query === `(min-width: ${INLINE_NAV_MIN_WIDTH_REM}rem)`)!
      .emit({
        matches: true,
      });
    await fixture.whenStable();

    expect(header.menuOpen()).toBe(false);
  });

  it('keeps focus inside the nav while open, wrapping at both ends', async () => {
    trigger().click();
    await fixture.whenStable();

    const focusables = [...nav().querySelectorAll<HTMLElement>('a[href]')];
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    last.focus();
    nav().dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(first);

    first.focus();
    nav().dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }),
    );
    expect(document.activeElement).toBe(last);
  });

  it('does not trap focus when the menu is closed', async () => {
    const links = [...nav().querySelectorAll<HTMLElement>('.nav__link')];
    links[0].focus();
    nav().dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(links[0]);
  });
});
