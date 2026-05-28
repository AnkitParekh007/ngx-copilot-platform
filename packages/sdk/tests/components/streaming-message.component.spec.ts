import test from 'node:test';
import assert from 'node:assert/strict';
import { createComponent } from './test-bed.harness';
import { StreamingMessageComponent } from '../../src/lib/components/streaming-message/streaming-message.component';

test('StreamingMessageComponent renders content', async () => {
  const fixture = await createComponent(StreamingMessageComponent);
  fixture.componentInstance.content = 'partial response';
  fixture.componentInstance.loading = true;
  fixture.detectChanges();

  assert.match(fixture.nativeElement.textContent, /partial response/);
});

test('StreamingMessageComponent shows animated indicator while loading', async () => {
  const fixture = await createComponent(StreamingMessageComponent);
  fixture.componentInstance.content = 'typing...';
  fixture.componentInstance.loading = true;
  fixture.componentInstance.done = false;
  fixture.detectChanges();

  // The .state element exists and has aria-label indicating streaming
  const stateEl = fixture.nativeElement.querySelector('.state');
  assert.ok(stateEl, 'streaming indicator should be rendered');
});

test('StreamingMessageComponent hides indicator when done', async () => {
  const fixture = await createComponent(StreamingMessageComponent);
  fixture.componentInstance.content = 'complete';
  fixture.componentInstance.loading = false;
  fixture.componentInstance.done = true;
  fixture.detectChanges();

  const stateEl = fixture.nativeElement.querySelector('.state');
  assert.equal(stateEl, null, 'streaming indicator should not render when done');
});
