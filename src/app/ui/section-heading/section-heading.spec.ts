import { TestBed } from '@angular/core/testing';
import { SectionHeading } from './section-heading';

describe('SectionHeading', () => {
  function render(inputs: { eyebrow?: string; title: string; lede?: string; id?: string }) {
    const fixture = TestBed.createComponent(SectionHeading);
    fixture.componentRef.setInput('title', inputs.title);

    // Set only what the caller passed, so "optional and absent" is genuinely
    // absent rather than set to undefined.
    for (const key of ['eyebrow', 'lede', 'id'] as const) {
      const value = inputs[key];
      if (value !== undefined) {
        fixture.componentRef.setInput(key, value);
      }
    }

    return fixture;
  }

  it('renders eyebrow, title and lede in order', async () => {
    const fixture = render({
      eyebrow: 'The Collection',
      title: 'Six pieces, made to be kept.',
      lede: 'Proportion first, decoration last.',
    });
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('.eyebrow')?.textContent?.trim()).toBe('The Collection');
    expect(root.querySelector('h2')?.textContent?.trim()).toBe('Six pieces, made to be kept.');
    expect(root.querySelector('.lede')?.textContent?.trim()).toBe(
      'Proportion first, decoration last.',
    );
  });

  it('sets the title as an h2 so section titles stay peers of each other', async () => {
    const fixture = render({ title: 'A title' });
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;

    // The page has a single h1 in the Hero, so every section title is an h2 and
    // nothing here may introduce another heading level.
    expect(root.querySelectorAll('h2')).toHaveLength(1);
    expect(root.querySelectorAll('h1, h3, h4, h5, h6')).toHaveLength(0);
  });

  it('puts the supplied id on the title, so aria-labelledby resolves', async () => {
    const fixture = render({ title: 'A title', id: 'collection-title' });
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    const heading = root.querySelector('h2');

    // The id must be on the heading itself — the element that provides the
    // accessible name — not on an anonymous wrapper.
    expect(heading?.id).toBe('collection-title');
  });

  it('omits the optional parts entirely rather than rendering them empty', async () => {
    const fixture = render({ title: 'A title' });
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;

    // No stray empty <p> for a screen reader to announce, and no empty id.
    expect(root.querySelector('.eyebrow')).toBeNull();
    expect(root.querySelector('.lede')).toBeNull();
    expect(root.querySelector('h2')?.hasAttribute('id')).toBe(false);
  });
});
