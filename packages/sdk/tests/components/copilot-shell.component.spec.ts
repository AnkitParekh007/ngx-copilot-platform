import test from 'node:test';
import assert from 'node:assert/strict';
import { createComponent } from './test-bed.harness';
import { CopilotShellComponent } from '../src/lib/components/copilot-shell/copilot-shell.component';

test('CopilotShellComponent renders with manual inputs', async () => {
  const fixture = await createComponent(CopilotShellComponent);
  fixture.componentInstance.context = { route: '/demo' };
  fixture.componentInstance.messages = [
    {
      id: 'm1',
      role: 'user',
      content: 'Hi',
      createdAt: new Date().toISOString(),
    },
  ];
  fixture.detectChanges();

  assert.match(fixture.nativeElement.textContent, /Hi/);
  assert.match(fixture.nativeElement.textContent, /Reset session/);
});
