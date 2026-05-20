#!/usr/bin/env node
/**
 * Post-build script for GitHub Pages SPA fallback.
 * Copies index.html → 404.html so Angular Router works on direct URL navigation.
 * Detects Angular 17+ browser/ subdirectory automatically.
 */
import { existsSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

// Script runs from apps/demo-app/; Angular outputs to ../../dist/demo-app (monorepo root)
const candidates = [
  join('..', '..', 'dist', 'demo-app', 'browser'),
  join('..', '..', 'dist', 'demo-app'),
];

let outDir = null;
for (const dir of candidates) {
  if (existsSync(join(dir, 'index.html'))) {
    outDir = dir;
    break;
  }
}

if (!outDir) {
  console.error('❌  index.html not found in any of:');
  candidates.forEach(c => console.error('   ', c));
  console.error('   Run npm run build:gh-pages first.');
  process.exit(1);
}

const src = join(outDir, 'index.html');
const dest = join(outDir, '404.html');
copyFileSync(src, dest);
console.log(`✅  Copied ${src} → ${dest}`);
console.log(`📁  Deploy directory: ${outDir}`);
