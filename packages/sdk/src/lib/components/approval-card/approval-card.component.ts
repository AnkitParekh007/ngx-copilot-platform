import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApprovalRequest, getApprovalTone } from '../../models/approval-request.model';

/**
 * Renders a pending approval gate with Approve / Reject actions.
 *
 * The card color reflects `riskLevel` (`low` → neutral, `medium` → caution, `high` → critical).
 * Once a `decision` is set on the request the action buttons are hidden and the decision is shown.
 *
 * Use `<ng-content>` to project extra content (e.g. diff previews) inside the card.
 */
@Component({
  selector: 'ngx-approval-card',
  standalone: true,
  template: `
    <section class="approval-card" [attr.data-tone]="tone" aria-label="Approval request">
      <div class="approval-header">
        <div>
          <p class="eyebrow">Approval required</p>
          <h4>{{ request.title }}</h4>
        </div>
        <span class="risk" [attr.aria-label]="'Risk level ' + request.riskLevel">{{ request.riskLevel }}</span>
      </div>
      <p>{{ request.reason }}</p>
      <p class="summary">{{ request.actionSummary }}</p>
      <ng-content />
      @if (!request.decision) {
        <div class="actions">
          <button
            type="button"
            [disabled]="disabled"
            [attr.aria-label]="'Approve ' + request.title"
            (click)="approve.emit(request.id)">
            Approve
          </button>
          <button
            type="button"
            class="secondary"
            [disabled]="disabled"
            [attr.aria-label]="'Reject ' + request.title"
            (click)="reject.emit(request.id)">
            Reject
          </button>
        </div>
      } @else {
        <p class="decision" role="status">Decision: {{ request.decision }}</p>
      }
    </section>
  `,
  styles: [`
    .approval-card {
      border-radius: 1rem;
      padding: 1rem;
      display: grid;
      gap: 0.75rem;
      border: 1px solid var(--callout-warning-border, #f59e0b);
      background: var(--callout-warning-bg, #fffbeb);
      color: var(--text, #0f172a);
    }
    .approval-card[data-tone='critical'] {
      border-color: var(--callout-danger-border, #ef4444);
      background: var(--callout-danger-bg, #fef2f2);
    }
    .approval-card[data-tone='resolved'] {
      border-color: var(--callout-success-border, #22c55e);
      background: var(--callout-success-bg, #f0fdf4);
    }
    .approval-header {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: start;
    }
    .eyebrow, .risk, .decision {
      margin: 0;
      font-size: 0.85rem;
      text-transform: uppercase;
      color: var(--callout-warning-text, #92400e);
    }
    .approval-card[data-tone='critical'] .eyebrow,
    .approval-card[data-tone='critical'] .risk,
    .approval-card[data-tone='critical'] .decision { color: var(--callout-danger-text, #b91c1c); }
    .approval-card[data-tone='resolved'] .eyebrow,
    .approval-card[data-tone='resolved'] .risk,
    .approval-card[data-tone='resolved'] .decision { color: var(--callout-success-text, #166534); }
    h4, p { margin: 0; }
    .summary { color: var(--text-muted, #334155); }
    .actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    button {
      border: none;
      border-radius: 999px;
      background: var(--text, #0f172a);
      color: var(--bg-card-solid, #fff);
      padding: 0.6rem 1rem;
      cursor: pointer;
    }
    button:disabled { opacity: 0.55; cursor: not-allowed; }
    .secondary {
      background: var(--bg-card-solid, #e2e8f0);
      color: var(--text, #0f172a);
      border: 1px solid var(--border, #cbd5e1);
    }
  `],
})
export class ApprovalCardComponent {
  @Input({ required: true }) request!: ApprovalRequest;
  @Input() disabled = false;
  @Output() readonly approve = new EventEmitter<string>();
  @Output() readonly reject = new EventEmitter<string>();

  get tone() {
    return getApprovalTone(this.request);
  }
}
