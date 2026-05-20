import '@angular/compiler';
import test from 'node:test';
import assert from 'node:assert/strict';

import { ToolRegistryService } from '../src/public-api';

test('register and list tools', () => {
  const service = new ToolRegistryService();
  service.register({
    name: 'syncAccount',
    description: 'Sync account data',
    requiresApproval: true,
    execute: async () => ({ ok: true }),
  });

  const tools = service.list();
  assert.equal(tools.length, 1);
  assert.equal(tools[0].name, 'syncAccount');
});

test('get returns registered tool by name', () => {
  const service = new ToolRegistryService();
  service.register({
    name: 'fetchInsights',
    description: 'Fetch AI insights',
    requiresApproval: false,
    execute: async () => ({}),
  });

  const tool = service.get('fetchInsights');
  assert.ok(tool, 'expected tool to be found');
  assert.equal(tool?.description, 'Fetch AI insights');
});

test('get returns undefined for unknown tool', () => {
  const service = new ToolRegistryService();
  assert.equal(service.get('nonexistent'), undefined);
});

test('requiresApproval returns true for approval-required tools', () => {
  const service = new ToolRegistryService();
  service.register({
    name: 'deleteRecord',
    description: 'Delete a record',
    requiresApproval: true,
    execute: async () => ({}),
  });
  assert.equal(service.requiresApproval('deleteRecord'), true);
});

test('requiresApproval returns false for non-approval tools', () => {
  const service = new ToolRegistryService();
  service.register({
    name: 'readRecord',
    description: 'Read a record',
    requiresApproval: false,
    execute: async () => ({}),
  });
  assert.equal(service.requiresApproval('readRecord'), false);
});

test('requiresApproval returns false for unknown tools', () => {
  const service = new ToolRegistryService();
  assert.equal(service.requiresApproval('unknown'), false);
});

test('list returns empty array when no tools registered', () => {
  const service = new ToolRegistryService();
  assert.deepEqual(service.list(), []);
});

test('multiple tools can be registered independently', () => {
  const service = new ToolRegistryService();
  service.register({ name: 'toolA', description: 'A', requiresApproval: false, execute: async () => ({}) });
  service.register({ name: 'toolB', description: 'B', requiresApproval: true, execute: async () => ({}) });
  assert.equal(service.list().length, 2);
});
