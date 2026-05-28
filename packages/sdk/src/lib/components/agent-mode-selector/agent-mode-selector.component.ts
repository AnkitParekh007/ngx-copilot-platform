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
      border: 1px solid var(--border, #cbd5e1);
      background: color-mix(in srgb, var(--bg-card-solid, #ffffff) 92%, var(--bg-subtle, #f8fafc) 8%);
      color: var(--text, #0f172a);
      border-radius: 999px;
      padding: 0.45rem 0.8rem;
      text-transform: capitalize;
      cursor: pointer;
      font-weight: 600;
      transition: background-color 0.16s ease, border-color 0.16s ease, color 0.16s ease, transform 0.16s ease;
    }
    .mode-chip:hover:not(:disabled) {
      border-color: var(--border-strong, #94a3b8);
      background: color-mix(in srgb, var(--accent-light, rgba(99, 102, 241, 0.12)) 55%, var(--bg-card-solid, #ffffff) 45%);
      color: var(--accent-text, var(--accent, #1d4ed8));
      transform: translateY(-1px);
    }
    .mode-chip.active {
      background: linear-gradient(135deg, var(--accent, #4f46e5) 0%, var(--accent-2, #7c3aed) 100%);
      color: #ffffff;
      border-color: transparent;
      box-shadow: 0 10px 24px color-mix(in srgb, var(--accent, #4f46e5) 28%, transparent);
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
