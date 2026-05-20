import test from 'node:test';
import assert from 'node:assert/strict';
import { createComponent } from './test-bed.harness';
import { ToolCallTimelineComponent } from '../../src/lib/components/tool-call-timeline/tool-call-timeline.component';

test('ToolCallTimelineComponent renders empty list without crashing', async () => {
  const fixture = await createComponent(ToolCallTimelineComponent);
  fixture.componentInstance.items = [];
  fixture.detectChanges();

  assert.equal(fixture.nativeElement.querySelectorAll('li').length, 0);
});

test('ToolCallTimelineComponent renders tool items', async () => {
  const fixture = await createComponent(ToolCallTimelineComponent);
  fixture.componentInstance.items = [
    {
      id: 't1',
      toolName: 'lookup',
      status: 'succeeded',
      summary: 'done',
      startedAt: new Date().toISOString(),
    },
  ];
  fixture.detectChanges();

  assert.match(fixture.nativeElement.textContent, /lookup/);
});
