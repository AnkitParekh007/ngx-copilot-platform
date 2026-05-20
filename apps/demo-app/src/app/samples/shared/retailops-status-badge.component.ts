import { Component, input } from '@angular/core';

type StatusTone = 'draft' | 'validated' | 'approved' | 'rejected' | 'syndicated' | 'archived' | 'running' | 'failed' | 'pending';

@Component({
  selector: 'app-retailops-status-badge',
  standalone: true,
  template: `<span class="status-badge" [attr.data-tone]="tone()">{{ label() }}</span>`,
  styles: [`
    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.18rem 0.6rem;
      border-radius: 999px;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    [data-tone="draft"]      { background: #f1f5f9; color: #475569; }
    [data-tone="validated"]  { background: #dbeafe; color: #1e40af; }
    [data-tone="approved"]   { background: #dcfce7; color: #166534; }
    [data-tone="rejected"]   { background: #fee2e2; color: #991b1b; }
    [data-tone="syndicated"] { background: #f0fdf4; color: #166534; }
    [data-tone="archived"]   { background: #f3f4f6; color: #6b7280; }
    [data-tone="running"]    { background: #fef9c3; color: #854d0e; }
    [data-tone="failed"]     { background: #fee2e2; color: #991b1b; }
    [data-tone="pending"]    { background: #fef3c7; color: #92400e; }
    :root[data-resolved-theme="dark"] [data-tone="draft"]      { background: #1e293b; color: #94a3b8; }
    :root[data-resolved-theme="dark"] [data-tone="validated"]  { background: rgba(30,58,138,0.4); color: #93c5fd; }
    :root[data-resolved-theme="dark"] [data-tone="approved"]   { background: rgba(20,83,45,0.4); color: #86efac; }
    :root[data-resolved-theme="dark"] [data-tone="rejected"]   { background: rgba(127,29,29,0.4); color: #fca5a5; }
    :root[data-resolved-theme="dark"] [data-tone="syndicated"] { background: rgba(20,83,45,0.3); color: #86efac; }
    :root[data-resolved-theme="dark"] [data-tone="archived"]   { background: #1e293b; color: #64748b; }
    :root[data-resolved-theme="dark"] [data-tone="running"]    { background: rgba(120,53,15,0.4); color: #fcd34d; }
    :root[data-resolved-theme="dark"] [data-tone="failed"]     { background: rgba(127,29,29,0.4); color: #fca5a5; }
    :root[data-resolved-theme="dark"] [data-tone="pending"]    { background: rgba(120,53,15,0.3); color: #fcd34d; }
  `],
})
export class RetailopsStatusBadgeComponent {
  readonly tone = input<StatusTone>('draft');
  readonly label = input<string>('Draft');
}
