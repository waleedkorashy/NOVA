import {
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  inject,
  model,
  viewChild,
} from '@angular/core';

interface NavLink {
  readonly label: string;
  readonly fragment: string;
}

/**
 * Width at which the panel becomes the inline nav row.
 *
 * MUST equal `$bp-nav` in `site-header.scss`. Measured in a real browser: the
 * inline row needs ~705px for the links plus CTA, and the wordmark ~104px, so
 * anything below ~809px (before gutters) cannot fit the row without overflow.
 */
export const INLINE_NAV_MIN_WIDTH_REM = 60;

/**
 * Shell header: wordmark, anchor navigation, primary CTA, and the mobile panel.
 *
 * Navigation is native in-page anchors (approved D1). There is no router and no
 * JavaScript scrolling logic — the browser performs the fragment jump, while
 * `scroll-behavior: smooth` (global `_reset.scss`) and `scroll-margin-top`
 * (global `_layout.scss`) make it land clear of the sticky bar.
 *
 * There is exactly ONE `<nav>`. At narrow widths the same element becomes the
 * slide-down panel, so the links are never duplicated in the DOM and there is
 * never more than one `Primary` landmark in the accessibility tree.
 *
 * The breakpoint is shared with the stylesheet via `INLINE_NAV_MIN_WIDTH_REM` /
 * `$bp-nav`. They must not drift: CSS decides where the panel becomes inline,
 * and this class dismisses the panel at the same width.
 *
 * State is signal-based because the app is zoneless — mutating a plain property
 * would not re-render. The open state is a `model()` so the shell can mark
 * `<main>` and `<footer>` inert while the panel is up.
 */
@Component({
  selector: 'site-header',
  templateUrl: './site-header.html',
  styleUrl: './site-header.scss',
  host: {
    id: 'top',
    '(document:keydown.escape)': 'onEscape()',
    '[class.is-open]': 'menuOpen()',
  },
})
export class SiteHeader {
  /** Two-way bound open state; see the class comment for why the shell owns it. */
  readonly menuOpen = model(false);

  readonly navLinks: readonly NavLink[] = [
    { label: 'Collection', fragment: 'collection' },
    { label: 'About', fragment: 'about' },
    { label: 'Journal', fragment: 'journal' },
    { label: 'Contact', fragment: 'contact' },
  ];

  private readonly triggerRef = viewChild<ElementRef<HTMLButtonElement>>('menuTrigger');
  private readonly navRef = viewChild<ElementRef<HTMLElement>>('siteNav');
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  constructor() {
    // If the viewport grows past the inline-nav breakpoint while the panel is
    // open, dismiss it. `menuOpen` is a presentation concern that only applies
    // below the breakpoint; leaving it true would resurface a stale panel if the
    // user shrank the window again.
    if (typeof matchMedia === 'function') {
      const desktop = matchMedia(`(min-width: ${INLINE_NAV_MIN_WIDTH_REM}rem)`);
      const onChange = (event: MediaQueryListEvent) => {
        if (event.matches) {
          this.menuOpen.set(false);
        }
      };
      desktop.addEventListener('change', onChange);
      this.destroyRef.onDestroy(() => desktop.removeEventListener('change', onChange));
    }
  }

  toggle(): void {
    this.menuOpen.update((open) => !open);

    // Opening the panel moves focus into it.
    //
    // This must be `afterNextRender`, not a call inside the effect or the click
    // handler: the panel is revealed by a CSS class on the host, and host
    // bindings are applied late in the render pass. Focusing earlier targets a
    // still-`display: none` subtree, where `focus()` is a silent no-op. Vitest
    // cannot catch this — jsdom never loads component stylesheets, so the panel
    // is always focusable there and the test passes while the browser fails.
    if (this.menuOpen()) {
      afterNextRender(() => this.focusableWithin(this.navRef()?.nativeElement)[0]?.focus(), {
        injector: this.injector,
      });
    }
  }

  /**
   * Escape: close and hand focus back to the trigger so a keyboard user does not
   * lose their place.
   */
  closeAndRestoreFocus(): void {
    if (!this.menuOpen()) {
      return;
    }
    this.menuOpen.set(false);
    this.triggerRef()?.nativeElement.focus();
  }

  /** An activated link closes the panel, then lets the browser perform the jump. */
  onNavigate(): void {
    this.menuOpen.set(false);
  }

  onEscape(): void {
    this.closeAndRestoreFocus();
  }

  /**
   * Keeps Tab inside the nav while it is the temporary panel. Only applies while
   * the panel is open, which is below the inline-nav breakpoint.
   */
  onNavKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || !this.menuOpen()) {
      return;
    }

    const focusable = this.focusableWithin(this.navRef()?.nativeElement);
    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    const nav = this.navRef()?.nativeElement;
    const inside = active instanceof Node && nav?.contains(active) === true;

    if (event.shiftKey && (active === first || !inside)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !inside)) {
      event.preventDefault();
      first.focus();
    }
  }

  private focusableWithin(nav: HTMLElement | undefined): HTMLElement[] {
    if (!nav) {
      return [];
    }
    return [...nav.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')];
  }
}
