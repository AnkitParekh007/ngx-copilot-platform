import test from 'node:test';
import assert from 'node:assert/strict';
import { createComponent } from './test-bed.harness';
import { CopilotShellComponent } from '../../src/lib/components/copilot-shell/copilot-shell.component';

test('CopilotShellComponent renders with manual inputs', async () => {
  const fixture = await createComponent(CopilotShellComponent);
  // useService=false so passed [messages] are used directly, not from CopilotService
  fixture.componentInstance.useService = false;
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

test('CopilotShellComponent defaults useService to true', async () => {
  const fixture = await createComponent(CopilotShellComponent);
  fixture.detectChanges();
  assert.equal(fixture.componentInstance.useService, true);
});

test('CopilotShellComponent context defaults to empty route', async () => {
  const fixture = await createComponent(CopilotShellComponent);
  fixture.detectChanges();
  assert.equal(fixture.componentInstance.context.route, '');
});
