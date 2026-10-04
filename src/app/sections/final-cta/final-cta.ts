import { Component } from '@angular/core';

/**
 * Final CTA — plan §7's closing statement, and the M7 owner of `#contact`.
 *
 * ## What it is not
 *
 * There is no form, no `mailto:`, no `tel:`, no address and no invented contact
 * detail anywhere in this component, by approved decision D4 and the portfolio
 * integrity rules in AGENTS.md. NOVA is a fictional brand, so there is no real
 * channel to point at. The section therefore closes the story by returning the
 * reader to the work itself: its single action is the same in-page anchor the
 * Hero and the header already use, so the page has exactly one primary CTA
 * target across its whole length (plan §4.4, "CTA button").
 *
 * ## Why the CTA is not a link that pretends to be a channel
 *
 * A "Contact us" link with no destination, or one wired to a fabricated address,
 * is the failure mode D4 exists to prevent. Rather than ship a control that
 * looks actionable and is not, this section states the invitation and points at
 * something that genuinely exists — the collection — and the footer carries the
 * fictional-brand disclosure. Nothing here can be mistaken for a working inbox.
 *
 * ## No component imports
 *
 * `ui-section-heading` is deliberately NOT used. It is the shared three-part
 * opening for the five content sections and it is start-aligned by design
 * (`justify-items: start`, title capped at 22ch). Plan §7 asks this section to be
 * "restrained, centred", and the only way to centre the primitive's internals
 * from here would be `::ng-deep`, which breaks encapsulation. So the eyebrow,
 * title and lede are authored directly against the global `.eyebrow` / `h2` /
 * `.lede` classes, which carry all the typography; this component owns only the
 * centring and the measure.
 */
@Component({
  selector: 'app-final-cta',
  templateUrl: './final-cta.html',
  styleUrl: './final-cta.scss',
})
export class FinalCta {}
