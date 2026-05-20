import '@angular/compiler';
import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeCopilotConfig } from '../src/public-api';

test('normalizeCopilotConfig applies all defaults when only apiBaseUrl is provided', () => {
  const config = normalizeCopilotConfig({ apiBaseUrl: '/api/copilot' });
  assert.equal(config.apiBaseUrl, '/api/copilot');
  assert.equal(config.defaultMode, 'ask');
  assert.equal(config.enableApprovals, true);
  assert.equal(config.enableRagSources, true);
  assert.equal(config.enableToolTimeline, true);
});

test('normalizeCopilotConfig preserves all explicit overrides', () => {
  const config = normalizeCopilotConfig({
    apiBaseUrl: '/api/copilot',
    defaultMode: 'debug',
    enableApprovals: false,
    enableRagSources: false,
    enableToolTimeline: false,
    statusLabel: 'Custom label',
  });
  assert.equal(config.defaultMode, 'debug');
  assert.equal(config.enableApprovals, false);
  assert.equal(config.enableRagSources, false);
  assert.equal(config.enableToolTimeline, false);
  assert.equal(config.statusLabel, 'Custom label');
});

test('normalizeCopilotConfig statusLabel default matches architecture reference message', () => {
  const config = normalizeCopilotConfig({ apiBaseUrl: '/api/copilot' });
  assert.equal(config.statusLabel, 'Experimental architecture reference');
});

test('normalizeCopilotConfig accepts all valid CopilotMode values', () => {
  for (const mode of ['ask', 'plan', 'execute', 'debug'] as const) {
    const config = normalizeCopilotConfig({ apiBaseUrl: '/api', defaultMode: mode });
    assert.equal(config.defaultMode, mode);
  }
});
