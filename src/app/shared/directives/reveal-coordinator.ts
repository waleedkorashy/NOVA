import { DestroyRef, Service, inject } from '@angular/core';

/** Runs once, when an element is safe to reveal. */
export type RevealCallback = () => void;

/**
 * Owns the single `IntersectionObserver` behind every scroll reveal.
 *
 * There is exactly one of these per app, and every `Reveal` registers with it. A
 * per-directive observer would mean one observer (and one callback queue entry)
 * per revealed element; the brief rules out "dozens of independent animations",
 * and a single observer is also what keeps that from becoming a scroll-handler.
 *
 * ## The root margin is POSITIVE, and that is the load-bearing decision
 *
 * An earlier draft used `0px 0px -15% 0px`, intending to wait until an element
 * had travelled a little way into the viewport before revealing it. That is a
 * well-known trick and it is wrong for a page of unknown height.
 *
 * A negative bottom margin shrinks the observer root, so an element only counts
 * as intersecting while it is inside the shrunk box. Once the page is scrolled to
 * the very bottom, the document bottom sits flush with the viewport bottom, so
 * anything in the final 15% of the document is permanently BELOW the root and can
 * never intersect again. Those elements stay at `opacity: 0` for good: the page
 * looks finished, and a chunk of it is missing. The M8 harness caught exactly
 * this, stranding 9 of 24 reveals.
 *
 * A positive bottom margin moves the failure to the harmless end: an element can
 * reveal slightly EARLY, but it can never fail to reveal at all. For a reveal,
 * only one of those two mistakes is a bug worth designing around.
 *
 * The cost is that a reveal just below the fold may fire on load. That is
 * acceptable, and arguably correct: the element is genuinely on screen, so
 * animating it in is honest rather than a flash.
 */
@Service()
export class RevealCoordinator {
  private readonly destroyRef = inject(DestroyRef);

  /** Positive bottom margin, so an element can only ever reveal too early. */
  private static readonly ROOT_MARGIN = '0px 0px 10% 0px';

  private observer: IntersectionObserver | null = null;

  private motionQuery: MediaQueryList | null = null;
  private readonly motionListeners = new Set<() => void>();

  /**
   * Strong `Map`, not `WeakMap`, because the reduced-motion flush has to iterate
   * every pending element. That makes `unregister()` load-bearing rather than
   * optional: the directive pairs register/unregister through its own `DestroyRef`,
   * and `onDestroy` below clears the map and disconnects the observer as a
   * backstop.
   */
  private readonly pending = new Map<Element, RevealCallback>();

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.observer?.disconnect();
      this.observer = null;
      this.pending.clear();

      const query = this.motionQuery;
      if (query) {
        for (const listener of this.motionListeners) {
          query.removeEventListener('change', listener);
        }
      }
      this.motionListeners.clear();
      this.motionQuery = null;
    });
  }

  /**
   * Whether this element may be animated at all.
   *
   * False when there is no `IntersectionObserver` to drive the reveal (the
   * content must not be left waiting on an observer that will never fire) or when
   * the visitor has asked for reduced motion.
   */
  canArm(): boolean {
    if (typeof IntersectionObserver === 'undefined') {
      return false;
    }
    return !this.prefersReducedMotion();
  }

  /**
   * Start watching `element`.
   *
   * If it cannot be armed the callback runs immediately instead of being
   * registered, so the element is reported as revealed rather than silently left
   * pending forever.
   */
  register(element: Element, onReveal: RevealCallback): void {
    if (!this.canArm()) {
      onReveal();
      return;
    }

    this.ensureObserver();
    this.watchMotionPreference();

    this.pending.set(element, onReveal);
    this.observer?.observe(element);
  }

  /** Stop watching `element`. Safe to call for an element that was never armed. */
  unregister(element: Element): void {
    this.pending.delete(element);
    this.observer?.unobserve(element);
  }

  private ensureObserver(): void {
    if (this.observer || typeof IntersectionObserver === 'undefined') {
      return;
    }

    this.observer = new IntersectionObserver(this.handleIntersections, {
      rootMargin: RevealCoordinator.ROOT_MARGIN,
      threshold: 0,
    });
  }

  private readonly handleIntersections: IntersectionObserverCallback = (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) {
        continue;
      }

      const element = entry.target;

      // Unobserve before revealing. A reveal is one-time by definition, and
      // leaving the target observed means it fires again on every re-entry.
      this.observer?.unobserve(element);

      const reveal = this.pending.get(element);
      this.pending.delete(element);
      reveal?.();
    }
  };

  /**
   * Watch for reduced motion being turned on mid-session.
   *
   * Arming happens once, at construction. Without this, a visitor who enables the
   * preference after load would keep seeing reveals on elements that had not
   * scrolled into view yet. The list is drained here instead.
   */
  private watchMotionPreference(): void {
    if (this.motionQuery || typeof matchMedia !== 'function') {
      return;
    }

    this.motionQuery = matchMedia('(prefers-reduced-motion: reduce)');

    const flush = (): void => {
      this.flushPendingIfReduced();
    };
    this.motionListeners.add(flush);
    this.motionQuery.addEventListener('change', flush);
  }

  private flushPendingIfReduced(): void {
    if (!this.prefersReducedMotion()) {
      return;
    }

    for (const [element, reveal] of this.pending) {
      this.observer?.unobserve(element);
      reveal();
    }
    this.pending.clear();
  }

  private prefersReducedMotion(): boolean {
    if (typeof matchMedia !== 'function') {
      return false;
    }
    return matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
