import test from 'node:test';
import assert from 'node:assert/strict';
import { createComponent } from './test-bed.harness';
import { RagSourceCardComponent } from '../src/lib/components/rag-source-card/rag-source-card.component';

test('RagSourceCardComponent renders source title', async () => {
  const fixture = await createComponent(RagSourceCardComponent);
  fixture.componentInstance.source = {
    id: '1',
    title: 'Handbook',
    snippet: 'Snippet',
    score: 0.9,
    sourceType: 'knowledge-base',
  };
  fixture.detectChanges();

  assert.match(fixture.nativeElement.textContent, /Handbook/);
});
