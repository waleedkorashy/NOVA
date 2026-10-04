// Ambient declarations for assets imported from TypeScript.
//
// `.webp` is mapped to esbuild's `file` loader in angular.json, so an import
// resolves at build time to the hashed, emitted file and yields its runtime URL —
// that is what `NgOptimizedImage` needs. Images are therefore imported from
// `src/assets/images/`, never copied via the `src/assets` asset glob and never
// placed in `public/`, so every deployed image is fingerprinted and cacheable.
//
// See `public/_headers` for the matching immutable cache rule.

declare module '*.webp' {
  const src: string;
  export default src;
}
