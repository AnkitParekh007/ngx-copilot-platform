/**
 * Post-build script: strips the pnpm-only `publishConfig.directory` field from
 * dist/sdk/package.json before publish.
 *
 * `publishConfig.directory` is a pnpm workspace extension used to symlink the
 * compiled dist output into consuming apps' node_modules. It should not appear
 * in the package that lands on npm — it's noise for npm users and could confuse
 * tools that don't understand the pnpm extension.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distPkg = resolve(__dirname, '../../../dist/sdk/package.json');

const pkg = JSON.parse(readFileSync(distPkg, 'utf8'));

if (pkg.publishConfig?.directory) {
  delete pkg.publishConfig.directory;
  // If publishConfig is now empty (only had directory), remove entirely.
  if (Object.keys(pkg.publishConfig).length === 0) {
    delete pkg.publishConfig;
  }
  writeFileSync(distPkg, JSON.stringify(pkg, null, 2) + '\n');
  console.log('strip-publish-dir: removed publishConfig.directory from dist/sdk/package.json');
} else {
  console.log('strip-publish-dir: publishConfig.directory not present, nothing to strip');
}
