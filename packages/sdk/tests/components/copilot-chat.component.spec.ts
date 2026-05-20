import test from 'node:test';
import assert from 'node:assert/strict';
import { createComponent } from './test-bed.harness';
import { CopilotChatComponent } from '../../src/lib/components/copilot-chat/copilot-chat.component';

test('CopilotChatComponent renders empty state', async () => {
  const fixture = await createComponent(CopilotChatComponent);
  fixture.detectChanges();

  assert.match(fixture.nativeElement.textContent, /Ask a question/);
});

test('CopilotChatComponent emits send on submit', async () => {
  const fixture = await createComponent(CopilotChatComponent);
  let payload = '';
  fixture.componentInstance.send.subscribe(value => (payload = value));
  fixture.componentInstance.draft = 'hello';
  fixture.detectChanges();
  fixture.componentInstance.submit();

  assert.equal(payload, 'hello');
});
