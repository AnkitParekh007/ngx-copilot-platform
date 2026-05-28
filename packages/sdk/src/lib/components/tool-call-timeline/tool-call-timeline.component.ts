import { Component, Input } from '@angular/core';
import { ToolTimelineItem } from '../../models/tool-timeline-item.model';

/**
 * Renders a chronological list of tool execution steps.
 * Border and background colors reflect execution status automatically.
 *
 * **Status colors (via CSS `data-status` attribute):**
 * - `succeeded` → green
 * - `failed` → red
 * - `running` → blue (accent)
 * - `awaiting_approval` → amber
 * - `queued` / `skipped` → subtle grey
 */
@Component({
  selector: 'ngx-tool-call-timeline',
  standalone: true,
  template: `
    @if (items.length === 0) {
      <p class="empty">No tool calls yet.</p>
    } @else {
      <ol class="timeline">
        @for (item of items; track item.id) {
          <li class="timeline-item" [attr.data-status]="item.status">
            <div class="timeline-header">
              <strong>{{ item.toolName }}</strong>
              <span class="status">{{ item.status.replace('_', ' ') }}</span>
            </div>
            <p>{{ item.summary }}</p>
            @if (item.startedAt && item.finishedAt) {
              <p class="duration">{{ durationMs(item.startedAt, item.finishedAt) }}ms</p>
            }
          </li>
        }
      </ol>
    }
  `,
  styles: [`
    .empty { margin: 0; color: var(--text-muted, #64748b); font-size: 0.9rem; }
    .timeline {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 0.75rem;
    }
    .timeline-item {
      border-left: 3px solid var(--accent, #3b82f6);
      padding: 0.75rem 0.9rem;
      background: var(--accent-light, #eff6ff);
      border-radius: 0 1rem 1rem 0;
    }
    .timeline-item[data-status='succeeded'] {
      border-color: var(--callout-success-border, #22c55e);
      background: var(--callout-success-bg, #f0fdf4);
    }
    .timeline-item[data-status='failed'] {
      border-color: var(--callout-danger-border, #ef4444);
      background: var(--callout-danger-bg, #fef2f2);
    }
    .timeline-item[data-status='awaiting_approval'] {
      border-color: var(--callout-warning-border, #f59e0b);
      background: var(--callout-warning-bg, #fffbeb);
    }
    .timeline-item[data-status='queued'],
    .timeline-item[data-status='skipped'] {
      border-color: var(--border, #cbd5e1);
      background: var(--bg-subtle, #f8fafc);
    }
    .timeline-header {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: baseline;
    }
    strong { color: var(--text, #0f172a); }
    .status {
      text-transform: capitalize;
      color: var(--accent, #1e40af);
      font-size: 0.85rem;
    }
    .timeline-item[data-status='succeeded'] .status { color: var(--callout-success-text, #166534); }
    .timeline-item[data-status='failed'] .status { color: var(--callout-danger-text, #b91c1c); }
    .timeline-item[data-status='awaiting_approval'] .status { color: var(--callout-warning-text, #92400e); }
    p { margin: 0.35rem 0 0; color: var(--text-muted, #1f2937); font-size: 0.9rem; }
    .duration { font-size: 0.78rem; color: var(--text-subtle, #475569); margin-top: 0.25rem; }
  `],
})
export class ToolCallTimelineComponent {
  @Input() items: ToolTimelineItem[] = [];

  durationMs(startedAt: string, finishedAt: string): number {
    return Math.round(new Date(finishedAt).getTime() - new Date(startedAt).getTime());
  }
}
