import { DestroyRef, Directive, ElementRef, computed, inject, input, signal } from '@angular/core';

import { RevealCoordinator } from './reveal-coordinator';

/** `''` for the default slide-in, `'image'` for the soft photo settle. */
export type RevealVariant = '' | 'image';

/**
 * The project's single scroll-reveal mechanism (M8).
 *
 * Usage:
 *
 * ```html
 * <h2 novaReveal>Section title</h2>
 * <img novaReveal="image" />
 * <li novaReveal [novaRevealIndex]="i"></li>
 * ```
 *
 * ## The invariant: an armed element is never invisible
 *
 * Three states, and only one of them is hidden:
 *
 * | state    | when                                    | classes            | visible |
 * | -------- | --------------------------------------- | ------------------ | ------- |
 * | armed    | motion is allowed, not yet intersected  | `.reveal`          | NO      |
 * | resolved | intersected, or motion is not allowed   | `.is-revealed`     | yes     |
 * | never    | no `IntersectionObserver` at all          | neither            | yes     |
 *
 * The important property is that **every host binding is gated on `armed()`**,
 * including the variant class and the stagger hooks. An earlier draft wrote
 * `.reveal--image` and `data-reveal-index` unconditionally, while only writing
 * `.reveal` conditionally. Because the stylesheet selected
 * `.reveal--image:not(.is-revealed)` without requiring `.reveal`, a
 * reduced-motion visitor ended up with two editorial photographs stuck at
 * `opacity: 0` — invisible, unreachable by CSS, and invisible to every unit test,
 * because the unit tests were asserting class names and not computed style.
 *
 * Two independent defences now prevent that: `_motion.scss` requires `.reveal` in
 * the image selector, and the classes are not written at all unless armed. The
 * redundancy is deliberate. This is the one bug on this milestone that makes the
 * page unusable for a real group of people, so it is defended at both the layer
 * that writes state and the layer that reads it.
 */
@Directive({
  selector: '[novaReveal]',
  host: {
    '[class.reveal]': 'armed()',
    '[class.reveal--image]': "armed() && novaReveal() === 'image'",
    '[class.is-revealed]': 'resolved()',
    // Attribute and custom property come from one source, so the CSS
    // (`transition-delay`) can never key off a half-written stagger.
    '[attr.data-reveal-index]': 'staggerHook()',
    '[style.--reveal-index]': 'staggerHook()',
  },
})
export class Reveal {
  /** `image` opts into the soft scale treatment. */
  readonly novaReveal = input<RevealVariant>('', { alias: 'novaReveal' });

  /** 0-based position among siblings, used for the stagger delay. */
  readonly novaRevealIndex = input<number | null>(null, { alias: 'novaRevealIndex' });

  private readonly element = inject(ElementRef).nativeElement as Element;
  private readonly coordinator = inject(RevealCoordinator);
  private readonly destroyRef = inject(DestroyRef);

  private readonly isArmed = signal(false);
  private readonly isResolved = signal(false);

  protected readonly armed = this.isArmed.asReadonly();
  protected readonly resolved = this.isResolved.asReadonly();

  /**
   * Stagger offset, or `null` for none.
   *
   * `null` and `0` are deliberately different states, which is why the input
   * defaults to `null` rather than `0`:
   *
   *   * no index given  -> not part of a stagger group -> no attribute at all.
   *     `.reveal[data-reveal-index]` matches on presence, so writing `0` here
   *     would bolt a `transition-delay: calc(var(--stagger) * 0)` onto every
   *     plain `novaReveal` element on the page.
   *   * index `0` given -> first member of a group -> written explicitly, so the
   *     group is self-describing and a staggered list can be verified by reading
   *     the DOM rather than by inferring it from a missing attribute.
   *
   * A `number` default of `0` cannot tell those two apart, which is why the
   * default is `null`.
   */
  protected readonly staggerHook = computed(() => {
    if (!this.isArmed()) {
      return null;
    }
    const index = this.novaRevealIndex();
    return index === null ? null : String(index);
  });

  constructor() {
    if (this.coordinator.canArm()) {
      this.isArmed.set(true);
      this.coordinator.register(this.element, () => this.isResolved.set(true));
    } else {
      // Not animatable. Resolve immediately rather than registering, so the
      // element is never "pending" with nothing that will ever settle it.
      this.isResolved.set(true);
    }

    this.destroyRef.onDestroy(() => this.coordinator.unregister(this.element));
  }
}
