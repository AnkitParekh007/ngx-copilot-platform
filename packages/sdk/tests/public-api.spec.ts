import '@angular/compiler';
import test from 'node:test';
import assert from 'node:assert/strict';

// Verify every symbol documented in docs/public-api-contract.md is importable.
import {
  // Tokens + providers
  COPILOT_CONFIG,
  COPILOT_BACKEND_ADAPTER,
  COPILOT_MARKDOWN_RENDERER,
  provideCopilot,
  providePlatformBackend,
  provideHttpAdapter,
  // Config model
  normalizeCopilotConfig,
  // Models
  getApprovalTone,
  tokenizePrompt,
  // Services
  CopilotService,
  ContextProviderService,
  RagAdapterService,
  StreamingAdapterService,
  ToolRegistryService,
  // Adapters
  MockCopilotBackendAdapter,
  HttpCopilotBackendAdapter,
  NgxCopilotPlatformBackendAdapter,
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

test('COPILOT_BACKEND_ADAPTER token is defined', () => {
  assert.ok(COPILOT_BACKEND_ADAPTER);
});

test('COPILOT_MARKDOWN_RENDERER token is defined', () => {
  assert.ok(COPILOT_MARKDOWN_RENDERER);
});

test('provideHttpAdapter is a function', () => {
  assert.equal(typeof provideHttpAdapter, 'function');
});

test('providePlatformBackend is a function', () => {
  assert.equal(typeof providePlatformBackend, 'function');
});

test('MockCopilotBackendAdapter is a class', () => {
  assert.equal(typeof MockCopilotBackendAdapter, 'function');
});

test('HttpCopilotBackendAdapter is a class', () => {
  assert.equal(typeof HttpCopilotBackendAdapter, 'function');
});

test('NgxCopilotPlatformBackendAdapter is a class', () => {
  assert.equal(typeof NgxCopilotPlatformBackendAdapter, 'function');
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
