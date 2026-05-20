import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApprovalRequest, getApprovalTone } from '../../models/approval-request.model';

@Component({
  selector: 'ngx-approval-card',
  standalone: true,
  imports: [CommonModule],
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
      <div class="actions" *ngIf="!request.decision">
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
      <p *ngIf="request.decision" class="decision" role="status">Decision: {{ request.decision }}</p>
    </section>
  `,
  styles: [`
    .approval-card {
      border-radius: 1rem;
      padding: 1rem;
      display: grid;
      gap: 0.75rem;
      border: 1px solid #f59e0b;
      background: #fffbeb;
    }
    .approval-card[data-tone='critical'] {
      border-color: #ef4444;
      background: #fef2f2;
    }
    .approval-card[data-tone='resolved'] {
      border-color: #22c55e;
      background: #f0fdf4;
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
      color: #92400e;
    }
    h4, p { margin: 0; }
    .summary { color: #334155; }
    .actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    button {
      border: none;
      border-radius: 999px;
      background: #0f172a;
      color: #fff;
      padding: 0.6rem 1rem;
      cursor: pointer;
    }
    button:disabled { opacity: 0.55; cursor: not-allowed; }
    .secondary { background: #e2e8f0; color: #0f172a; }
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
