import { Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';

import { Reveal, type RevealVariant } from './reveal';

/**
 * Contract tests for the reveal directive.
 *
 * The two tests worth reading first are `does not write the image variant when
 * reduced motion is on` and `writes no stagger hooks when not armed`. Both guard a
 * bug that shipped into an earlier draft of this file and was invisible to every
 * other check in the suite: the host bindings wrote `.reveal--image` and
 * `data-reveal-index` unconditionally, while only `.reveal` was conditional, and
 * the stylesheet's image rule did not require `.reveal`. Reduced-motion visitors
 * therefore got two photographs rendered at `opacity: 0`.
 *
 * jsdom does not apply `styles.scss`, so no test here can prove the image is
 * actually visible. That assertion belongs to the browser harness
 * (`m8.mjs`), which reads computed opacity. What these tests guarantee is the
 * JS-side half: the state that makes content invisible is never written unless
 * the same state also owns the transition that reveals it.
 */
describe('Reveal', () => {
  /** Stand-in for the browser observer, recording every instance so sharing is testable. */
  class FakeIntersectionObserver implements IntersectionObserver {
    static instances: FakeIntersectionObserver[] = [];

    readonly observed = new Set<Element>();
    readonly root = null;
    readonly rootMargin: string;
    readonly thresholds: readonly number[] = [];
    readonly scrollMargin = '';

    private readonly callback: IntersectionObserverCallback;

    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      this.callback = callback;
      this.rootMargin = options?.rootMargin ?? '';
      FakeIntersectionObserver.instances.push(this);
    }

    observe(target: Element): void {
      this.observed.add(target);
    }

    unobserve(target: Element): void {
      this.observed.delete(target);
    }

    disconnect(): void {
      this.observed.clear();
    }

    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }

    /** Fire the callback as the browser would when `target` crosses the root. */
    trigger(target: Element, isIntersecting: boolean): void {
      this.callback([{ target, isIntersecting } as IntersectionObserverEntry], this);
    }
  }

  /** `matchMedia` stub whose single query instance can be flipped and dispatched on. */
  class FakeMediaQueryList {
    readonly media = '(prefers-reduced-motion: reduce)';
    onchange = null;
    matches: boolean;

    private readonly listeners = new Set<(event: MediaQueryListEvent) => void>();

    constructor(matches: boolean) {
      this.matches = matches;
    }

    addEventListener(_type: string, listener: (event: MediaQueryListEvent) => void): void {
      this.listeners.add(listener);
    }

    removeEventListener(_type: string, listener: (event: MediaQueryListEvent) => void): void {
      this.listeners.delete(listener);
    }

    dispatchEvent(): boolean {
      for (const listener of this.listeners) {
        listener({ matches: this.matches } as MediaQueryListEvent);
      }
      return true;
    }

    set(matches: boolean): void {
      this.matches = matches;
      this.dispatchEvent();
    }
  }

  @Component({
    imports: [Reveal],
    template: `<div novaReveal [novaReveal]="variant()" [novaRevealIndex]="index()"></div>`,
  })
  class Host {
    readonly variant = signal<RevealVariant>('');
    readonly index = signal<number | null>(null);
  }

  const originalObserver = globalThis.IntersectionObserver;
  const originalMatchMedia = globalThis.matchMedia;

  let query: FakeMediaQueryList;

  /** Install both stubs. `observer: false` simulates an environment without one. */
  function install(options: { reducedMotion: boolean; observer?: boolean }): void {
    FakeIntersectionObserver.instances = [];

    query = new FakeMediaQueryList(options.reducedMotion);
    globalThis.matchMedia = ((): FakeMediaQueryList => query) as unknown as typeof matchMedia;

    if (options.observer === false) {
      delete (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver;
    } else {
      globalThis.IntersectionObserver =
        FakeIntersectionObserver as unknown as typeof IntersectionObserver;
    }
  }

  function create(options: { variant?: RevealVariant; index?: number } = {}): {
    fixture: ComponentFixture<Host>;
    element: HTMLElement;
  } {
    const fixture = TestBed.createComponent(Host);
    // Inputs must be set before the first change detection, because that is what
    // constructs the directive and reads `canArm()`.
    fixture.componentInstance.variant.set(options.variant ?? '');
    fixture.componentInstance.index.set(options.index ?? null);
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('div') as HTMLElement;
    return { fixture, element };
  }

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [Host] });
    install({ reducedMotion: false });
  });

  afterEach(() => {
    globalThis.IntersectionObserver = originalObserver;
    globalThis.matchMedia = originalMatchMedia;
  });

  describe('when motion is allowed', () => {
    it('arms the element but does not reveal it yet', () => {
      const { element } = create();

      expect(element.classList.contains('reveal')).toBe(true);
      expect(element.classList.contains('is-revealed')).toBe(false);
    });

    it('reveals when the element intersects, then stops observing it', () => {
      const { fixture, element } = create();
      const observer = FakeIntersectionObserver.instances[0];

      observer.trigger(element, true);
      fixture.detectChanges();

      expect(element.classList.contains('is-revealed')).toBe(true);
      expect(observer.observed.has(element)).toBe(false);
    });

    it('does not reveal while the element is outside the root', () => {
      const { fixture, element } = create();
      const observer = FakeIntersectionObserver.instances[0];

      observer.trigger(element, false);
      fixture.detectChanges();

      expect(element.classList.contains('is-revealed')).toBe(false);
      expect(observer.observed.has(element)).toBe(true);
    });

    it('applies the image variant only for variant="image"', () => {
      const image = create({ variant: 'image' });
      expect(image.element.classList.contains('reveal--image')).toBe(true);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ imports: [Host] });
      install({ reducedMotion: false });

      const plain = create();
      expect(plain.element.classList.contains('reveal--image')).toBe(false);
    });

    it('distinguishes "not staggered" from "first in a stagger group"', () => {
      // Absent index: no attribute. Writing "0" here would add a
      // `transition-delay: calc(var(--stagger) * 0)` to every plain novaReveal.
      const unstaggered = create();
      expect(unstaggered.element.getAttribute('data-reveal-index')).toBeNull();
      expect(unstaggered.element.style.getPropertyValue('--reveal-index')).toBe('');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ imports: [Host] });
      install({ reducedMotion: false });

      // Explicit 0 is written, so the group is readable from the DOM.
      const first = create({ index: 0 });
      expect(first.element.getAttribute('data-reveal-index')).toBe('0');
      expect(first.element.style.getPropertyValue('--reveal-index')).toBe('0');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ imports: [Host] });
      install({ reducedMotion: false });

      const third = create({ index: 2 });
      expect(third.element.getAttribute('data-reveal-index')).toBe('2');
      expect(third.element.style.getPropertyValue('--reveal-index')).toBe('2');
    });

    it('shares one observer across every revealed element', () => {
      const first = create();
      create();

      expect(FakeIntersectionObserver.instances).toHaveLength(1);
      expect(FakeIntersectionObserver.instances[0].observed.size).toBe(2);
      expect(first.element.classList.contains('reveal')).toBe(true);
    });

    it('uses a positive bottom margin so nothing at the foot of the page can be stranded', () => {
      create();

      const rootMargin = FakeIntersectionObserver.instances[0].rootMargin;
      // Index 2 is the bottom edge in both the 3-value (`top right bottom`) and
      // 4-value (`top right bottom left`) forms, so this reads the same either way.
      const bottom = rootMargin.trim().split(/\s+/)[2];

      expect(rootMargin.trim()).not.toBe('');
      expect(bottom).toBeDefined();
      // "0" is the failure mode: it means an element at the very foot of a fully
      // scrolled page can never intersect the root and stays hidden for good.
      expect(Number.parseFloat(bottom)).toBeGreaterThan(0);
    });

    it('reveals everything pending when reduced motion is switched on mid-session', () => {
      const { fixture, element } = create();

      expect(element.classList.contains('is-revealed')).toBe(false);

      query.set(true);
      fixture.detectChanges();

      expect(element.classList.contains('is-revealed')).toBe(true);
    });
  });

  describe('when reduced motion is requested', () => {
    beforeEach(() => {
      install({ reducedMotion: true });
    });

    it('never arms, so no hidden state is ever written', () => {
      const { element } = create();

      expect(element.classList.contains('reveal')).toBe(false);
      expect(element.classList.contains('is-revealed')).toBe(true);
    });

    it('does not write the image variant', () => {
      const { element } = create({ variant: 'image' });

      // Regression: a bare `.reveal--image` matched the stylesheet's
      // `.reveal--image:not(.is-revealed)` rule and pinned the photo to
      // opacity 0 with nothing able to bring it back.
      expect(element.classList.contains('reveal--image')).toBe(false);
    });

    it('writes no stagger hooks', () => {
      const { element } = create({ index: 3 });

      expect(element.getAttribute('data-reveal-index')).toBeNull();
      expect(element.style.getPropertyValue('--reveal-index')).toBe('');
    });

    it('constructs no observer at all', () => {
      create();

      expect(FakeIntersectionObserver.instances).toHaveLength(0);
    });
  });

  describe('when IntersectionObserver is unavailable', () => {
    beforeEach(() => {
      install({ reducedMotion: false, observer: false });
    });

    it('resolves immediately and writes no motion state', () => {
      const { element } = create({ variant: 'image', index: 1 });

      expect(element.classList.contains('reveal')).toBe(false);
      expect(element.classList.contains('reveal--image')).toBe(false);
      expect(element.classList.contains('is-revealed')).toBe(true);
      expect(element.getAttribute('data-reveal-index')).toBeNull();
    });
  });

  describe('teardown', () => {
    it('unregisters destroyed elements', () => {
      const { fixture, element } = create();
      const observer = FakeIntersectionObserver.instances[0];

      expect(observer.observed.has(element)).toBe(true);

      fixture.destroy();

      expect(observer.observed.has(element)).toBe(false);
    });
  });
});
