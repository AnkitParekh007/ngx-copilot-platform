import '@angular/compiler';
import test from 'node:test';
import assert from 'node:assert/strict';

import { RagAdapterService } from '../src/public-api';

test('normalize fills missing snippet with default text', () => {
  const service = new RagAdapterService();
  const results = service.normalize([{ title: 'Policy doc', score: 0.91 }]);

  assert.equal(results[0].snippet, 'No snippet available.');
});

test('normalize assigns sequential ids', () => {
  const service = new RagAdapterService();
  const results = service.normalize([
    { title: 'Doc A', score: 0.9 },
    { title: 'Doc B', score: 0.8 },
  ]);
  assert.equal(results[0].id, 'rag-1');
  assert.equal(results[1].id, 'rag-2');
});

test('normalize preserves provided title and score', () => {
  const service = new RagAdapterService();
  const results = service.normalize([{ title: 'Playbook', score: 0.95 }]);
  assert.equal(results[0].title, 'Playbook');
  assert.equal(results[0].score, 0.95);
});

test('normalize sets default sourceType to knowledge-base', () => {
  const service = new RagAdapterService();
  const results = service.normalize([{ title: 'Doc', score: 0.5 }]);
  assert.equal(results[0].sourceType, 'knowledge-base');
});

test('normalize sets sourceUrl to undefined when not provided', () => {
  const service = new RagAdapterService();
  const results = service.normalize([{ title: 'Doc', score: 0.5 }]);
  assert.equal(results[0].sourceUrl, undefined);
});

test('normalize preserves optional repo and filePath fields', () => {
  const service = new RagAdapterService();
  const results = service.normalize([
    {
      title: 'svc',
      score: 0.5,
      repo: 'portal',
      branch: 'main',
      filePath: 'src/app/x.ts',
      fileKind: 'service',
      chunkId: 'c1',
      tags: ['sku'],
    },
  ]);
  assert.equal(results[0].repo, 'portal');
  assert.equal(results[0].filePath, 'src/app/x.ts');
  assert.deepEqual(results[0].tags, ['sku']);
});

test('normalize returns empty array for empty input', () => {
  const service = new RagAdapterService();
  assert.deepEqual(service.normalize([]), []);
});

test('normalize handles multiple results correctly', () => {
  const service = new RagAdapterService();
  const results = service.normalize([
    { title: 'First', score: 0.99 },
    { title: 'Second', score: 0.75 },
    { title: 'Third', score: 0.60 },
  ]);
  assert.equal(results.length, 3);
  assert.equal(results[2].id, 'rag-3');
});
