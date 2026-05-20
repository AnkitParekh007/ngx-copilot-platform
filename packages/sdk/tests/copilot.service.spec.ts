import './setup-zone';
import '@angular/compiler';
import test from 'node:test';
import assert from 'node:assert/strict';
import { TestBed } from '@angular/core/testing';
import { provideCopilot } from '../src/lib/tokens/copilot-config.token';
import { CopilotService } from '../src/lib/services/copilot.service';
import { initComponentTesting } from './components/test-bed.harness';

test('CopilotService sendMessage updates messages and completes streaming', async () => {
  await initComponentTesting();
  TestBed.configureTestingModule({
    providers: [provideCopilot({ apiBaseUrl: '/api/copilot', defaultMode: 'plan' })],
  });

  const service = TestBed.inject(CopilotService);
  service.sendMessage('hello preview');

  await new Promise(resolve => setTimeout(resolve, 1200));

  assert.ok(service.messages().length >= 1);
  assert.equal(service.isStreaming(), false);
});

test('CopilotService resetSession clears state', async () => {
  await initComponentTesting();
  TestBed.configureTestingModule({
    providers: [provideCopilot({ apiBaseUrl: '/api/copilot' })],
  });

  const service = TestBed.inject(CopilotService);
  service.sendMessage('reset me');
  await new Promise(resolve => setTimeout(resolve, 1200));
  service.resetSession();

  assert.equal(service.messages().length, 0);
  assert.equal(service.sources().length, 0);
  assert.equal(service.timeline().length, 0);
  assert.equal(service.approval(), undefined);
});

test('CopilotService setMode updates active mode', async () => {
  await initComponentTesting();
  TestBed.configureTestingModule({
    providers: [provideCopilot({ apiBaseUrl: '/api/copilot', defaultMode: 'ask' })],
  });

  const service = TestBed.inject(CopilotService);
  service.setMode('debug');
  assert.equal(service.activeMode(), 'debug');
});

test('CopilotService without config sets recoverable error', async () => {
  await initComponentTesting();
  TestBed.configureTestingModule({});
  const service = TestBed.inject(CopilotService);
  service.sendMessage('orphan message');
  assert.equal(service.error()?.code, 'COPILOT_NOT_CONFIGURED');
});
