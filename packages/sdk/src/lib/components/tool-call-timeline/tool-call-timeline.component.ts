import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ToolTimelineItem } from '../../models/tool-timeline-item.model';

@Component({
  selector: 'ngx-tool-call-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ol class="timeline">
      <li *ngFor="let item of items" class="timeline-item">
        <div class="timeline-header">
          <strong>{{ item.toolName }}</strong>
          <span class="status">{{ item.status }}</span>
        </div>
        <p>{{ item.summary }}</p>
      </li>
    </ol>
  `,
  styles: [`
    .timeline {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 0.75rem;
    }
    .timeline-item {
      border-left: 3px solid #3b82f6;
      padding: 0.75rem 0.9rem;
      background: #eff6ff;
      border-radius: 0 1rem 1rem 0;
    }
    .timeline-header {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: baseline;
    }
    .status { text-transform: capitalize; color: #1e40af; font-size: 0.85rem; }
    p { margin: 0.35rem 0 0; color: #1f2937; }
  `],
})
export class ToolCallTimelineComponent {
  @Input() items: ToolTimelineItem[] = [];
}
