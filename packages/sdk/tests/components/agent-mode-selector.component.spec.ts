import test from 'node:test';
import assert from 'node:assert/strict';
import { createComponent } from './test-bed.harness';
import { AgentModeSelectorComponent } from '../../src/lib/components/agent-mode-selector/agent-mode-selector.component';

test('AgentModeSelectorComponent emits modeChange', async () => {
  const fixture = await createComponent(AgentModeSelectorComponent);
  fixture.detectChanges();

  let selected = '';
  fixture.componentInstance.modeChange.subscribe(mode => (selected = mode));

  const button = fixture.nativeElement.querySelector('button');
  button.click();
  assert.equal(selected, 'ask');
});
