import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'ngx-streaming-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="streaming-message" aria-live="polite" [attr.aria-busy]="loading">
      <p>{{ content }}</p>
      <span class="state">{{ done ? 'Complete' : loading ? 'Streaming…' : 'Streaming' }}</span>
    </article>
  `,
  styles: [`
    .streaming-message {
      display: grid;
      gap: 0.35rem;
      padding: 0.9rem 1rem;
      border-radius: 1rem;
      border: 1px solid var(--border-strong, #bfdbfe);
      background: var(--accent-light, #eff6ff);
    }
    p, .state { margin: 0; }
    p { color: var(--text, #0f172a); }
    .state {
      font-size: 0.82rem;
      color: var(--accent, #1d4ed8);
    }
  `],
})
export class StreamingMessageComponent {
  @Input() content = '';
  @Input() done = false;
  @Input() loading = false;
}
