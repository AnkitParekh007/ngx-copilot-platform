import test from 'node:test';
import assert from 'node:assert/strict';
import { createComponent } from './test-bed.harness';
import { StreamingMessageComponent } from '../../src/lib/components/streaming-message/streaming-message.component';

test('StreamingMessageComponent renders content and streaming state', async () => {
  const fixture = await createComponent(StreamingMessageComponent);
  fixture.componentInstance.content = 'partial';
  fixture.componentInstance.loading = true;
  fixture.detectChanges();

  assert.match(fixture.nativeElement.textContent, /partial/);
  assert.match(fixture.nativeElement.textContent, /Streaming/);
});
