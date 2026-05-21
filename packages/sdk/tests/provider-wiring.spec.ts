/**
 * Provider wiring tests.
 *
 * Validates all three supported wiring patterns:
 *  1. Mock backend (default — no backend required)
 *  2. Direct custom adapter via provideCopilot() options
 *  3. Platform backend via providePlatformBackend()
 *
 * Also validates README-style minimal setup compiles and works.
 */
import './setup-zone';
import '@angular/compiler';
import test from 'node:test';
import assert from 'node:assert/strict';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { provideCopilot } from '../src/lib/tokens/copilot-config.token';
import { providePlatformBackend, NgxCopilotPlatformBackendAdapter } from '../src/lib/adapters/platform-backend.adapter';
import { COPILOT_BACKEND_ADAPTER } from '../src/lib/tokens/copilot-backend-adapter.token';
import { COPILOT_CONFIG } from '../src/lib/tokens/copilot-config.token';
import { MockCopilotBackendAdapter } from '../src/lib/adapters/mock-copilot-backend.adapter';
import { CopilotService } from '../src/lib/services/copilot.service';
import { CopilotBackendAdapter } from '../src/lib/adapters/copilot-backend.adapter';
import { CopilotRequest } from '../src/lib/adapters/copilot-request.model';
import { CopilotEvent } from '../src/lib/adapters/copilot-event.model';
import { initComponentTesting } from './components/test-bed.harness';

// ── helpers ──────────────────────────────────────────────────────────────────

/** Minimal fake adapter for testing direct-adapter wiring. */
class FakeAdapter implements CopilotBackendAdapter {
  readonly calls: CopilotRequest[] = [];

  send(request: CopilotRequest) {
    this.calls.push(request);
    return of<CopilotEvent>({ type: 'done' });
  }
}

// ── tests ─────────────────────────────────────────────────────────────────────

test('wiring: mock backend — provideCopilot() with no options registers MockCopilotBackendAdapter', async () => {
  await initComponentTesting();
  TestBed.configureTestingModule({
    providers: [provideCopilot()],
  });

  const adapter = TestBed.inject(COPILOT_BACKEND_ADAPTER);
  assert.ok(adapter instanceof MockCopilotBackendAdapter, 'should inject MockCopilotBackendAdapter');
});

test('wiring: mock backend — CopilotService is usable without apiBaseUrl (README mock-only setup)', async () => {
  await initComponentTesting();
  TestBed.configureTestingModule({
    providers: [provideCopilot({ defaultMode: 'ask' })],
  });

  const service = TestBed.inject(CopilotService);
  service.sendMessage('hello mock');

  await new Promise(resolve => setTimeout(resolve, 1200));

  assert.ok(service.messages().length >= 1, 'should have at least the user message');
  assert.equal(service.isStreaming(), false, 'streaming should be complete');
  assert.equal(service.error(), undefined, 'should have no error');
});

test('wiring: mock backend — COPILOT_CONFIG reflects provided values', async () => {
  await initComponentTesting();
  TestBed.configureTestingModule({
    providers: [provideCopilot({ defaultMode: 'debug', statusLabel: 'Test preview' })],
  });

  const config = TestBed.inject(COPILOT_CONFIG);
  assert.equal(config.defaultMode, 'debug');
  assert.equal(config.statusLabel, 'Test preview');
  assert.equal(config.apiBaseUrl, '', 'apiBaseUrl defaults to empty string for mock setup');
});

test('wiring: custom adapter — provideCopilot() with backendAdapter uses supplied adapter', async () => {
  await initComponentTesting();
  const fakeAdapter = new FakeAdapter();

  TestBed.configureTestingModule({
    providers: [provideCopilot({ defaultMode: 'ask' }, { backendAdapter: fakeAdapter })],
  });

  const injectedAdapter = TestBed.inject(COPILOT_BACKEND_ADAPTER);
  assert.strictEqual(injectedAdapter, fakeAdapter, 'should inject the supplied adapter instance');
});

test('wiring: custom adapter — CopilotService.sendMessage routes through custom adapter', async () => {
  await initComponentTesting();
  const fakeAdapter = new FakeAdapter();

  TestBed.configureTestingModule({
    providers: [provideCopilot({}, { backendAdapter: fakeAdapter })],
  });

  const service = TestBed.inject(CopilotService);
  service.sendMessage('adapter test');

  await new Promise(resolve => setTimeout(resolve, 50));

  assert.equal(fakeAdapter.calls.length, 1, 'adapter.send() should have been called once');
  assert.equal(fakeAdapter.calls[0].message, 'adapter test');
});

test('wiring: platform backend — providePlatformBackend() registers NgxCopilotPlatformBackendAdapter as COPILOT_BACKEND_ADAPTER', async () => {
  await initComponentTesting();

  TestBed.configureTestingModule({
    providers: [
      provideCopilot({ defaultMode: 'ask' }, { useMockBackend: false }),
      ...providePlatformBackend({ apiUrl: 'http://localhost:3001', apiKey: 'cpk_test_key' }),
    ],
  });

  const adapter = TestBed.inject(COPILOT_BACKEND_ADAPTER);
  assert.ok(
    adapter instanceof NgxCopilotPlatformBackendAdapter,
    'COPILOT_BACKEND_ADAPTER should be NgxCopilotPlatformBackendAdapter',
  );
});

test('wiring: platform backend — NgxCopilotPlatformBackendAdapter is also injectable by class token', async () => {
  await initComponentTesting();

  TestBed.configureTestingModule({
    providers: [
      provideCopilot({ defaultMode: 'ask' }, { useMockBackend: false }),
      ...providePlatformBackend({ apiUrl: 'http://localhost:3001', apiKey: 'cpk_test_key' }),
    ],
  });

  const byClass = TestBed.inject(NgxCopilotPlatformBackendAdapter);
  const byToken = TestBed.inject(COPILOT_BACKEND_ADAPTER);
  assert.strictEqual(byClass, byToken, 'class-token and COPILOT_BACKEND_ADAPTER should be the same instance');
});

test('wiring: platform backend — does not conflict with provideCopilot() mock default when useMockBackend:false', async () => {
  await initComponentTesting();

  // useMockBackend: false means provideCopilot does NOT register the mock.
  // providePlatformBackend fills in COPILOT_BACKEND_ADAPTER.
  TestBed.configureTestingModule({
    providers: [
      provideCopilot({}, { useMockBackend: false }),
      ...providePlatformBackend({ apiUrl: 'http://localhost:3001', apiKey: 'cpk_x' }),
    ],
  });

  const adapter = TestBed.inject(COPILOT_BACKEND_ADAPTER);
  assert.ok(!(adapter instanceof MockCopilotBackendAdapter), 'should NOT inject MockCopilotBackendAdapter');
  assert.ok(adapter instanceof NgxCopilotPlatformBackendAdapter, 'should inject NgxCopilotPlatformBackendAdapter');
});
