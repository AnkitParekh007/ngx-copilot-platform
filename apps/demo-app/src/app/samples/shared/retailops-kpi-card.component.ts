import { Component, input } from '@angular/core';

@Component({
  selector: 'app-retailops-kpi-card',
  standalone: true,
  template: `
    <div class="kpi-card">
      <div class="kpi-label">{{ label() }}</div>
      <div class="kpi-value">{{ value() }}</div>
      @if (change()) {
        <div class="kpi-change" [class.positive]="isPositive()" [class.negative]="!isPositive()">
          {{ isPositive() ? '↑' : '↓' }} {{ change() }}
        </div>
      }
    </div>
  `,
  styles: [`
    .kpi-card {
      padding: 0.85rem 1rem;
      border: 1px solid var(--border);
      border-radius: var(--radius-md, 0.5rem);
      background: var(--bg);
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
    .kpi-label { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-subtle, #9ca3af); }
    .kpi-value { font-size: 1.5rem; font-weight: 800; color: var(--text, #111827); letter-spacing: -0.03em; }
    .kpi-change { font-size: 0.75rem; font-weight: 600; }
    .kpi-change.positive { color: #16a34a; }
    .kpi-change.negative { color: #dc2626; }
    :root[data-resolved-theme="dark"] .kpi-change.positive { color: #86efac; }
    :root[data-resolved-theme="dark"] .kpi-change.negative { color: #fca5a5; }
  `],
})
export class RetailopsKpiCardComponent {
  readonly label = input<string>('');
  readonly value = input<string>('0');
  readonly change = input<string>('');
  readonly isPositive = input<boolean>(true);
}
