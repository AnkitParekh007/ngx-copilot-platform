#!/usr/bin/env node
/**
 * Verifies that index.html and 404.html exist after build:gh-pages,
 * and prints a checklist of SPA routes.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const candidates = ['dist/demo-app/browser', 'dist/demo-app'];
const buildDir = candidates.find(c => existsSync(resolve(c, 'index.html')));

if (!buildDir) {
  console.error('❌  Build output not found. Run npm run build:gh-pages first.');
  process.exit(1);
}

const routes = [
  '/',
  '/docs',
  '/docs/getting-started',
  '/docs/api',
  '/docs/configuration',
  '/docs/adapters',
  '/docs/rag-sources',
  '/docs/tool-timeline',
  '/docs/approvals',
  '/docs/retailops-pxm-demo',
  '/docs/production-checklist',
  '/docs/backend-contract',
  '/showcase',
  '/samples/enterprise-codebase',
  '/samples/enterprise-docs',
];

const hasIndex = existsSync(resolve(buildDir, 'index.html'));
const has404   = existsSync(resolve(buildDir, '404.html'));

console.log(`\n📁  Build directory: ${buildDir}`);
console.log(`${hasIndex ? '✅' : '❌'}  index.html`);
console.log(`${has404   ? '✅' : '❌'}  404.html (SPA fallback)\n`);

console.log('SPA route coverage (all served by index.html / 404.html):');
routes.forEach(r => console.log(`  ✅  ${r}`));

if (!hasIndex || !has404) {
  console.error('\n❌  Missing build files. Run npm run build:gh-pages.');
  process.exit(1);
}

console.log('\n✅  All routes covered by SPA fallback.\n');
