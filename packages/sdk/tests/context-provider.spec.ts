import '@angular/compiler';
import test from 'node:test';
import assert from 'node:assert/strict';

import { ContextProviderService } from '../src/public-api';

test('serialize preserves all provided fields', () => {
  const service = new ContextProviderService();
  const result = service.serialize({
    route: '/accounts/42',
    title: 'Account Detail',
    userRole: 'admin',
    tenantId: 'tenant-1',
    selectedRecordId: 'rec-99',
    visibleFields: ['status', 'owner'],
    metadata: { env: 'prod' },
  });

  assert.equal(result.route, '/accounts/42');
  assert.equal(result.title, 'Account Detail');
  assert.equal(result.userRole, 'admin');
  assert.equal(result.tenantId, 'tenant-1');
  assert.equal(result.selectedRecordId, 'rec-99');
  assert.deepEqual(result.visibleFields, ['status', 'owner']);
  assert.deepEqual(result.metadata, { env: 'prod' });
});

test('serialize strips undefined metadata values', () => {
  const service = new ContextProviderService();
  const result = service.serialize({
    route: '/accounts/42',
    tenantId: 'tenant-1',
    visibleFields: ['status', 'owner'],
    metadata: { safe: 'yes', skip: undefined },
  });

  assert.deepEqual(result.metadata, { safe: 'yes' });
  assert.ok(!('skip' in (result.metadata ?? {})), 'undefined metadata key should be stripped');
});

test('serialize handles missing optional fields with undefined', () => {
  const service = new ContextProviderService();
  const result = service.serialize({ route: '/dashboard' });

  assert.equal(result.route, '/dashboard');
  assert.equal(result.title, undefined);
  assert.equal(result.userRole, undefined);
  assert.equal(result.tenantId, undefined);
  assert.equal(result.selectedRecordId, undefined);
});

test('serialize handles empty visibleFields array', () => {
  const service = new ContextProviderService();
  const result = service.serialize({ route: '/accounts/1', visibleFields: [] });
  assert.deepEqual(result.visibleFields, []);
});
