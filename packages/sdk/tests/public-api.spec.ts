import '@angular/compiler';
import test from 'node:test';
import assert from 'node:assert/strict';

// Verify every symbol documented in docs/public-api-contract.md is importable.
import {
  // Token + provider
  COPILOT_CONFIG,
  provideCopilot,
  // Config model
  normalizeCopilotConfig,
  // Models
  // (interfaces only — verified by TypeScript, runtime check via import)
  getApprovalTone,
  tokenizePrompt,
  // Services
  CopilotService,
  ContextProviderService,
  RagAdapterService,
  StreamingAdapterService,
  ToolRegistryService,
  // Components
  AgentModeSelectorComponent,
  ApprovalCardComponent,
  CopilotChatComponent,
  CopilotShellComponent,
  RagSourceCardComponent,
  StreamingMessageComponent,
  ToolCallTimelineComponent,
} from '../src/public-api';

test('COPILOT_CONFIG token is defined', () => {
  assert.ok(COPILOT_CONFIG, 'COPILOT_CONFIG should be defined');
});

test('provideCopilot is a function', () => {
  assert.equal(typeof provideCopilot, 'function');
});

test('normalizeCopilotConfig is a function', () => {
  assert.equal(typeof normalizeCopilotConfig, 'function');
});

test('getApprovalTone is a function', () => {
  assert.equal(typeof getApprovalTone, 'function');
});

test('tokenizePrompt is a function', () => {
  assert.equal(typeof tokenizePrompt, 'function');
});

test('CopilotService is a class', () => {
  assert.equal(typeof CopilotService, 'function');
});

test('ContextProviderService is a class', () => {
  assert.equal(typeof ContextProviderService, 'function');
});

test('RagAdapterService is a class', () => {
  assert.equal(typeof RagAdapterService, 'function');
});

test('StreamingAdapterService is a class', () => {
  assert.equal(typeof StreamingAdapterService, 'function');
});

test('ToolRegistryService is a class', () => {
  assert.equal(typeof ToolRegistryService, 'function');
});

test('all component classes are defined', () => {
  for (const [name, cls] of [
    ['AgentModeSelectorComponent', AgentModeSelectorComponent],
    ['ApprovalCardComponent', ApprovalCardComponent],
    ['CopilotChatComponent', CopilotChatComponent],
    ['CopilotShellComponent', CopilotShellComponent],
    ['RagSourceCardComponent', RagSourceCardComponent],
    ['StreamingMessageComponent', StreamingMessageComponent],
    ['ToolCallTimelineComponent', ToolCallTimelineComponent],
  ] as const) {
    assert.ok(cls, `${name} should be defined`);
    assert.equal(typeof cls, 'function', `${name} should be a class`);
  }
});
