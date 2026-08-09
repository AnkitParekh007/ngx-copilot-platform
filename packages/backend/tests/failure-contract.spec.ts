import assert from 'node:assert/strict';
import test from 'node:test';
import { getBackendFailureContract } from '../lib/copilot-failure-contract.ts';

test('stream disconnect is retryable and never claims execution', () => {
  const contract = getBackendFailureContract('stream-disconnected');
  assert.equal(contract.code, 'STREAM_DISCONNECTED');
  assert.equal(contract.recoverable, true);
  assert.equal(contract.suppressSources, true);
  assert.equal(contract.suppressTools, true);
  assert.equal(contract.execution, 'not-started');
});

test('retrieval failure suppresses ungrounded sources and tools', () => {
  const contract = getBackendFailureContract('retrieval-failed');
  assert.equal(contract.suppressSources, true);
  assert.equal(contract.suppressTools, true);
  assert.match(contract.clientMessage, /Do not render citations/i);
});

test('rejected approval is terminal non-executed', () => {
  const contract = getBackendFailureContract('approval-rejected');
  assert.equal(contract.recoverable, false);
  assert.equal(contract.execution, 'not-started');
  assert.match(contract.clientMessage, /must not execute/i);
});

test('disabled tool is explicit and non-executed', () => {
  const contract = getBackendFailureContract('tool-disabled');
  assert.equal(contract.code, 'TOOL_DISABLED');
  assert.equal(contract.execution, 'not-started');
  assert.match(contract.clientMessage, /non-executed/i);
});
