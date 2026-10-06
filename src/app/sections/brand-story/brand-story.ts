import { Component } from '@angular/core';

import { Reveal } from '../../shared/directives/reveal';
import { SectionHeading } from '../../ui/section-heading/section-heading';
/**
 * Brand Story — plan §7's "two-column editorial text + portrait/detail image", and
 * the owner of the `#about` nav anchor.
 *
 * ## Why there is no image in this section
 *
 * The plan calls for a portrait/detail image here. M6 could not add one honestly,
 * and inventing one was not an option:
 *
 *  1. `src/assets/images/ATTRIBUTION.md` and the asset README record Unsplash as
 *     the only permitted source, obtained from the website and never via the API.
 *     `unsplash.com` answers **401** to this environment's HTTP client and to the
 *     fetch tool, so the photo page — the only place the photographer and the exact
 *     source URL are published — cannot be read. `source.unsplash.com` is retired
 *     (503) and `images.unsplash.com` needs the internal `photo-<hash>` path that
 *     lives in that same blocked HTML.
 *  2. Reusing an approved asset was the other option, and every approved image is
 *     already on the page: the Hero, six collection cards, and the Editorial
 *     photograph. Showing any of them a second time inside the same scroll reads
 *     as a mistake, and the brief rules out adding media to fill space.
 *  3. Even with a file in hand, alt text must describe only what is actually
 *     visible. Nothing in this environment can look at an image, so a new
 *     photograph could only have been captioned by guessing.
 *
 * So the section is built from typography, which is also the honest answer to the
 * plan's intent: it asks for "deliberately different rhythm from the Editorial
 * section", and a text spread with no photograph cannot be mistaken for a second
 * Editorial. This deviation is recorded in `PROJECT_MAP.md`.
 *
 * ## No factual claims, by construction
 *
 * NOVA is a self-initiated portfolio concept, so there is no history to tell.
 * This component takes no data and has no inputs, which is the structural
 * guarantee: there is no field from which a founding date, a location, a headcount
 * or a certification could be rendered. Everything here is authored copy about the
 * design idea, and `brand-story.spec.ts` asserts the absence of those claims
 * rather than trusting review to catch them.
 *
 * ## Why the story does not restate the Hero
 *
 * Plan §7 and the M6 acceptance criteria both require it. The Hero's argument is
 * tempo and restraint — "Good rooms are made slowly", proportioned rather than
 * decorated, made to be kept instead of replaced. This section deliberately
 * argues something else: negative space as the thing being designed, ordinary
 * weekdays as the only real test, and the etymology of the name. The spec asserts
 * the Hero's phrases are absent here, so the overlap cannot creep back in.
 */
@Component({
  selector: 'app-brand-story',
  imports: [Reveal, SectionHeading],
  templateUrl: './brand-story.html',
  styleUrl: './brand-story.scss',
})
export class BrandStory {}
