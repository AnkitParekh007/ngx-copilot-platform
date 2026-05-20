import '@angular/compiler';
import test from 'node:test';
import assert from 'node:assert/strict';

import { getApprovalTone } from '../src/public-api';

const base = { id: 'a1', title: 'T', reason: 'R', actionSummary: 'S' };

test('high riskLevel without decision returns critical tone', () => {
  assert.equal(getApprovalTone({ ...base, riskLevel: 'high' }), 'critical');
});

test('medium riskLevel without decision returns caution tone', () => {
  assert.equal(getApprovalTone({ ...base, riskLevel: 'medium' }), 'caution');
});

test('low riskLevel without decision returns neutral tone', () => {
  assert.equal(getApprovalTone({ ...base, riskLevel: 'low' }), 'neutral');
});

test('approved decision returns resolved tone regardless of risk level', () => {
  assert.equal(getApprovalTone({ ...base, riskLevel: 'high', decision: 'approved' }), 'resolved');
  assert.equal(getApprovalTone({ ...base, riskLevel: 'medium', decision: 'approved' }), 'resolved');
  assert.equal(getApprovalTone({ ...base, riskLevel: 'low', decision: 'approved' }), 'resolved');
});

test('rejected decision returns resolved tone', () => {
  assert.equal(getApprovalTone({ ...base, riskLevel: 'high', decision: 'rejected' }), 'resolved');
});

test('resolved tone differs from critical for same high-risk request that was approved', () => {
  const unresolved = getApprovalTone({ ...base, riskLevel: 'high' });
  const resolved = getApprovalTone({ ...base, riskLevel: 'high', decision: 'approved' });
  assert.notEqual(unresolved, resolved);
});
