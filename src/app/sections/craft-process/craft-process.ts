import { Component } from '@angular/core';

import { SectionHeading } from '../../ui/section-heading/section-heading';

/**
 * Craft & Process — a three-step making narrative on an inverted band (M4).
 *
 * ## What replaced the testimonials, and what this must not become
 *
 * Approved decision D2 removed the originally-planned social-proof block from
 * the landing page and replaced it with a Craft & Process section. That makes
 * this the section most likely to drift back into what it was meant to replace:
 * three numbered boxes that quietly re-read as a feature grid, or — the worse
 * failure — that pick up "trusted by / rated / as seen in" framing while doing it.
 *
 * So two constraints are structural, not stylistic:
 *
 *  1. **It states method, not evidence.** The content is what gets decided and
 *     in what order: which material, how it is joined, how it is finished. Those
 *     are verifiable-sounding but claim nothing about volume, certification,
 *   location, staffing or customers. `craft-process.spec.ts` checks the rendered
 *     copy for the fabrication shapes this section is prone to.
 *
 *  2. **It is not three cards.** No border box, no radius, no shadow, no
 *     surface change, no icon. The hairline above each step and the oversized
 *     display numeral are the only devices, and both come from the shared
 *     `.numbered` pattern in `_components.scss`.
 *
 * ## Why the numerals are loud here and quiet in Brand Values
 *
 * Two sections, both numbered, adjacent in the document. If both set the same
 * index treatment they read as one repeated block and the page loses its
 * rhythm. Here the numeral is set in the display face at three times eyebrow
 * size, because on an inverted band it is the only element carrying brand
 * colour and it needs to anchor the composition. In `brand-values` the index is
 * a small tracked label. Different role, different treatment, deliberately.
 *
 * ## Contrast
 *
 * Every foreground on this band comes from an inverted token via
 * `.section--invert`: `--color-text-invert` (16.45:1) for the h3,
 * `--color-text-invert-soft` (8.87:1) for the body, `--color-accent-invert`
 * (8.46:1) for the numeral. All clear WCAG AA 4.5:1 for body text with room to
 * spare. Note that `--color-text` on this band is 1.02:1 — effectively
 * invisible — so any child that forgets to inherit the invert tokens will fail
 * loudly rather than subtly. That is the intended failure mode.
 */
@Component({
  selector: 'app-craft-process',
  imports: [SectionHeading],
  templateUrl: './craft-process.html',
  styleUrl: './craft-process.scss',
})
export class CraftProcess {}
