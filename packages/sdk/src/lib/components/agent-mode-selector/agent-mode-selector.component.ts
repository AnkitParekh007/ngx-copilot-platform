import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CopilotMode } from '../../models/copilot-config.model';

@Component({
  selector: 'ngx-agent-mode-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="mode-selector" aria-label="Copilot modes">
      <button
        *ngFor="let mode of modes"
        type="button"
        class="mode-chip"
        [class.active]="mode === activeMode"
        [attr.aria-pressed]="mode === activeMode"
        [disabled]="disabled"
        (click)="modeChange.emit(mode)">
        {{ mode }}
      </button>
    </nav>
  `,
  styles: [`
    .mode-selector { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .mode-chip {
      border: 1px solid #cbd5e1;
      background: #fff;
      border-radius: 999px;
      padding: 0.45rem 0.8rem;
      text-transform: capitalize;
      cursor: pointer;
    }
    .mode-chip.active {
      background: #0f172a;
      color: #fff;
      border-color: #0f172a;
    }
    .mode-chip:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
  `],
})
export class AgentModeSelectorComponent {
  @Input() modes: CopilotMode[] = ['ask', 'plan', 'execute', 'debug'];
  @Input() activeMode: CopilotMode = 'ask';
  @Input() disabled = false;
  @Output() readonly modeChange = new EventEmitter<CopilotMode>();
}
