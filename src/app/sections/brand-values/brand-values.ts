import { Component } from '@angular/core';

import { Reveal } from '../../shared/directives/reveal';
import { SectionHeading } from '../../ui/section-heading/section-heading';

/**
 * Brand Values — three principles, stated once (M4).
 *
 * ## Why this is static markup and not a data array
 *
 * The obvious move is to mirror `FeaturedCollection` and declare a
 * `readonly BrandValue[]` with an `@for`. That would be wrong here, and the
 * difference is worth recording so nobody "fixes" it later.
 *
 * `PRODUCTS` is data because something else owns it and something else may
 * replace it — plan §4.3 commits to an API swap, and the section takes
 * `input.required<readonly Product[]>()` precisely so it can be fed by a source
 * it does not know about. A second consumer of the catalogue exists already
 * (the M6 showcase), which is what makes the seam real.
 *
 * These three principles have no second consumer, will never come from an
 * endpoint, and are not expected to change between builds. Putting them in a
 * typed array would invent a data layer for copy that is authored once, and it
 * would put the words one indirection away from the sentence order they are
 * supposed to be read in. They live in the template.
 *
 * The test that matters is therefore a *rendered* assertion, not a data one —
 * see `brand-values.spec.ts`, which reads the DOM so the copy that ships is the
 * copy that is checked.
 *
 * ## What this section must never do
 *
 * AGENTS.md forbids fabricated social proof, and approved decision D2 replaced
 * the originally-planned testimonial block with this section. So the content
 * here is *design position*, not *evidence*: principles, intent, and the reason
 * a decision was made. No customer counts, no review scores, no press, no
 * awards, no years of trading, no certification. A principle stated as a
 * principle ("the joint stays visible") is honest; the same sentence dressed as
 * a claim ("trusted by 400 makers") would not be.
 *
 * ## M8
 *
 * `Reveal` is the heading plus a 0/1/2 stagger across the three columns. This is
 * the one section where the stagger is the point: three equal-rank principles
 * arriving in order is the argument, rendered as timing.
 */
@Component({
  selector: 'app-brand-values',
  imports: [Reveal, SectionHeading],
  templateUrl: './brand-values.html',
  styleUrl: './brand-values.scss',
})
export class BrandValues {}
