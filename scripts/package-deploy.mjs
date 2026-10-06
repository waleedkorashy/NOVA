// Stage the production build for Cloudflare Pages.
//
// Wrangler deploys a *folder*, not a zip, so this copies the browser output to
// `deploy/` with `index.html` sitting at the folder's own root. Copying rather
// than pointing Wrangler at dist/nova/browser keeps the upload root obvious —
// uploading `dist` or `dist/nova` by hand nests index.html one or two levels
// deep and every route 404s.
//
// Uses only Node built-ins, so this adds no dependency.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

const SRC = resolve('dist/nova/browser');
const OUT = resolve('deploy');

if (!existsSync(SRC)) {
  console.error(`No build found at ${SRC}\nRun \`npm run build\` first.`);
  process.exit(1);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(SRC, OUT, { recursive: true });

const count = (dir) =>
  readdirSync(dir, { withFileTypes: true }).reduce(
    (total, entry) => total + (entry.isDirectory() ? count(join(dir, entry.name)) : 1),
    0,
  );

const staged = count(OUT);
if (!existsSync(join(OUT, 'index.html'))) {
  console.error('Staging failed: index.html is not at the deploy root.');
  process.exit(1);
}

console.log(`Staged ${staged} files in ${OUT} (index.html at the root)`);
