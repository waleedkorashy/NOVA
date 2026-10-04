import { Component } from '@angular/core';

/**
 * Site footer.
 *
 * Complete as of M7. It renders the `<footer>` landmark required by the a11y
 * strategy, the wordmark returning to the top of the document, the four
 * in-page navigation links, the copyright line, and the fictional-brand
 * disclosure.
 *
 * The disclosure is a hard portfolio-integrity requirement — NOVA is not a real
 * company — so it lives in the structure rather than being bolted on, and
 * `spec.ts` asserts it.
 *
 * There is no contact mechanism here of any kind, by approved D4: no `mailto:`,
 * no `tel:`, no address, no invented account. See the template for why plan §7's
 * "social placeholders" were deliberately not built.
 */
@Component({
  selector: 'site-footer',
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.scss',
})
export class SiteFooter {
  protected readonly year = new Date().getFullYear();
}
