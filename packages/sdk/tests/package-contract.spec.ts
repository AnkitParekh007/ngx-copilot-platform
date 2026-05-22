import '@angular/compiler';
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const cwd = resolve(process.cwd());
const repoRoot = existsSync(resolve(cwd, 'packages', 'sdk', 'package.json'))
  ? cwd
  : resolve(cwd, '..', '..');
const rootPkg = JSON.parse(readFileSync(resolve(repoRoot, 'package.json'), 'utf-8'));
const libPkg = JSON.parse(readFileSync(resolve(repoRoot, 'packages', 'sdk', 'package.json'), 'utf-8'));

// --- Root package ---

test('root package.json is private', () => {
  assert.equal(rootPkg.private, true, 'root package must have "private": true');
});

test('root package.json has build script', () => {
  assert.ok(rootPkg.scripts?.build, 'root package must have a build script');
});

test('root package.json has test script', () => {
  assert.ok(rootPkg.scripts?.test, 'root package must have a test script');
});

test('root package.json has pack script', () => {
  assert.ok(rootPkg.scripts?.pack, 'root package must have a pack script');
});

test('root package.json has pack:dry script', () => {
  assert.ok(rootPkg.scripts?.['pack:dry'], 'root package must have a pack:dry script');
});

test('root package.json has verify script', () => {
  assert.ok(rootPkg.scripts?.verify, 'root package must have a verify script');
});

// --- Library package ---

test('library package name is @ankit-parekh-007/ngx-copilot-sdk', () => {
  assert.equal(libPkg.name, '@ankit-parekh-007/ngx-copilot-sdk');
});

test('library package.json does not have private:true', () => {
  assert.notEqual(libPkg.private, true, 'library package must NOT be private');
});

test('library publishConfig.access is public', () => {
  assert.equal(libPkg.publishConfig?.access, 'public');
});

test('library has MIT license', () => {
  assert.equal(libPkg.license, 'MIT');
});

test('library has repository field', () => {
  assert.ok(libPkg.repository, 'library must have a repository field');
});

test('library has bugs field', () => {
  assert.ok(libPkg.bugs, 'library must have a bugs field');
});

test('library has homepage field', () => {
  assert.ok(libPkg.homepage, 'library must have a homepage field');
});

test('@angular/core is a peerDependency', () => {
  assert.ok(libPkg.peerDependencies?.['@angular/core'], '@angular/core must be a peerDependency');
});

test('@angular/common is a peerDependency', () => {
  assert.ok(libPkg.peerDependencies?.['@angular/common'], '@angular/common must be a peerDependency');
});

test('rxjs is a peerDependency', () => {
  assert.ok(libPkg.peerDependencies?.['rxjs'], 'rxjs must be a peerDependency');
});

test('tslib is a direct dependency', () => {
  assert.ok(libPkg.dependencies?.['tslib'], 'tslib must be a direct dependency');
});

test('sideEffects is false', () => {
  assert.equal(libPkg.sideEffects, false, 'sideEffects must be false for tree-shaking');
});

test('library has author field', () => {
  assert.ok(libPkg.author, 'library must have an author field');
});

test('library has description field', () => {
  assert.ok(libPkg.description, 'library must have a description field');
});

// --- LICENSE file ---

test('LICENSE file exists at repo root', () => {
  let licenseContent: string;
  try {
    licenseContent = readFileSync(resolve(repoRoot, 'LICENSE'), 'utf-8');
  } catch {
    assert.fail('LICENSE file must exist at repo root');
    return;
  }
  assert.ok(licenseContent.includes('MIT'), 'LICENSE file must contain MIT text');
});

// --- README install command ---

test('README install command references scoped package name', () => {
  const readme = readFileSync(resolve(repoRoot, 'README.md'), 'utf-8');
  assert.ok(
    readme.includes('@ankit-parekh-007/ngx-copilot-sdk'),
    'README must reference the scoped package name @ankit-parekh-007/ngx-copilot-sdk',
  );
});
