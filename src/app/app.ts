import { Component, signal } from '@angular/core';
import { SiteFooter } from './layout/site-footer/site-footer';
import { SiteHeader } from './layout/site-header/site-header';
import { PRODUCTS } from './shared/data/products';
import { BrandStory } from './sections/brand-story/brand-story';
import { BrandValues } from './sections/brand-values/brand-values';
import { CraftProcess } from './sections/craft-process/craft-process';
import { Editorial } from './sections/editorial/editorial';
import { FeaturedCollection } from './sections/featured-collection/featured-collection';
import { FinalCta } from './sections/final-cta/final-cta';
import { Hero } from './sections/hero/hero';
import { ProductShowcase } from './sections/product-showcase/product-showcase';

/**
 * Application shell: skip link, header, main, footer.
 *
 * There is no router outlet (approved D1 — this is a single-page landing page),
 * so the shell renders the layout directly and navigation is native anchors.
 *
 * `menuOpen` lives here rather than inside `site-header` because the shell is
 * what makes the rest of the page `inert` while the mobile panel is up. The
 * header owns the menu's behaviour; the shell owns what happens to everything
 * else.
 *
 * `products` is the shell's read of the catalogue. It is a `protected` field
 * bound in `app.html` rather than an import inside the section, which is what
 * keeps the future data-source swap (plan §4.3) to this file plus one provider:
 * when the catalogue moves to an API, `app.html` becomes
 * `[products]="products$"` and neither `FeaturedCollection` nor `ProductCard`
 * changes.
 */
@Component({
  selector: 'app-root',
  imports: [
    SiteHeader,
    SiteFooter,
    Hero,
    FeaturedCollection,
    BrandValues,
    CraftProcess,
    Editorial,
    ProductShowcase,
    BrandStory,
    FinalCta,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly menuOpen = signal(false);
  protected readonly products = PRODUCTS;
}
