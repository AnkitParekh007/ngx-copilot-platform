import '@angular/compiler';
import test from 'node:test';
import assert from 'node:assert/strict';
import { lastValueFrom } from 'rxjs';
import { toArray } from 'rxjs/operators';

import {
  ContextProviderService,
  RagAdapterService,
  StreamingAdapterService,
  ToolRegistryService,
  getApprovalTone,
  normalizeCopilotConfig,
  tokenizePrompt,
} from '../src/public-api';

test('provider config normalization applies defaults and preserves overrides', () => {
  const config = normalizeCopilotConfig({
    apiBaseUrl: '/api/copilot',
    defaultMode: 'debug',
    enableApprovals: false,
  });

  assert.equal(config.apiBaseUrl, '/api/copilot');
  assert.equal(config.defaultMode, 'debug');
  assert.equal(config.enableApprovals, false);
  assert.equal(config.enableRagSources, true);
  assert.equal(config.statusLabel, 'Experimental architecture reference');
});

test('context provider serializes tenant, visible fields, and sanitized metadata', () => {
  const service = new ContextProviderService();
  const result = service.serialize({
    route: '/accounts/42',
    tenantId: 'tenant-1',
    visibleFields: ['status', 'owner'],
    metadata: { safe: 'yes', skip: undefined },
  });

  assert.deepEqual(result, {
    route: '/accounts/42',
    title: undefined,
    userRole: undefined,
    tenantId: 'tenant-1',
    selectedRecordId: undefined,
    visibleFields: ['status', 'owner'],
    metadata: { safe: 'yes' },
  });
});

test('tool registry registers, lists, retrieves, and checks approval requirement', () => {
  const service = new ToolRegistryService();

  service.register({
    name: 'syncAccount',
    description: 'Sync account data',
    requiresApproval: true,
    execute: async () => ({ ok: true }),
  });

  assert.equal(service.list().length, 1);
  assert.equal(service.get('syncAccount')?.description, 'Sync account data');
  assert.equal(service.requiresApproval('syncAccount'), true);
  assert.equal(service.requiresApproval('missingTool'), false);
});

test('rag adapter normalizes partial backend results', () => {
  const service = new RagAdapterService();
  const result = service.normalize([{ title: 'Policy doc', score: 0.91 }]);

  assert.deepEqual(result[0], {
    id: 'rag-1',
    title: 'Policy doc',
    snippet: 'No snippet available.',
    score: 0.91,
    sourceType: 'knowledge-base',
  });
});

test('streaming adapter tokenizes and emits final done state', async () => {
  assert.deepEqual(tokenizePrompt('hello world').slice(-2), ['hello', 'world']);

  const service = new StreamingAdapterService();
  const chunks = await lastValueFrom(service.stream('hello world').pipe(toArray()));

  assert.equal(chunks.at(-1)?.done, true);
  assert.match(chunks.map(chunk => chunk.text).join(''), /hello world/);
});

test('approval config tone reflects risk and decision state', () => {
  assert.equal(
    getApprovalTone({
      id: 'approval-1',
      title: 'Delete record',
      reason: 'High-risk data mutation.',
      actionSummary: 'Delete record 42',
      riskLevel: 'high',
    }),
    'critical',
  );

  assert.equal(
    getApprovalTone({
      id: 'approval-2',
      title: 'Send draft',
      reason: 'Already reviewed.',
      actionSummary: 'Send outreach draft',
      riskLevel: 'medium',
      decision: 'approved',
    }),
    'resolved',
  );
});
