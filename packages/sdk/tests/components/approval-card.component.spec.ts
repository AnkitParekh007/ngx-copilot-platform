import test from 'node:test';
import assert from 'node:assert/strict';
import { createComponent } from './test-bed.harness';
import { ApprovalCardComponent } from '../../src/lib/components/approval-card/approval-card.component';

test('ApprovalCardComponent emits approve and reject', async () => {
  const fixture = await createComponent(ApprovalCardComponent);
  fixture.componentInstance.request = {
    id: 'a-1',
    title: 'Delete record',
    reason: 'Risky',
    actionSummary: 'Delete #42',
    riskLevel: 'high',
  };
  fixture.detectChanges();

  let approved = '';
  let rejected = '';
  fixture.componentInstance.approve.subscribe(id => (approved = id));
  fixture.componentInstance.reject.subscribe(id => (rejected = id));

  const buttons = fixture.nativeElement.querySelectorAll('button');
  buttons[0].click();
  buttons[1].click();

  assert.equal(approved, 'a-1');
  assert.equal(rejected, 'a-1');
});
