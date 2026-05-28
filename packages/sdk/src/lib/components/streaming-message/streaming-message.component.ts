import { Component, inject, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { COPILOT_MARKDOWN_RENDERER } from '../../tokens/copilot-markdown-renderer.token';

/**
 * Renders a single streaming assistant message with an animated typing indicator.
 *
 * - Set `[loading]="true"` while chunks are arriving.
 * - Set `[done]="true"` when the stream completes.
 * - Provide `COPILOT_MARKDOWN_RENDERER` in `app.config.ts` for Markdown rendering.
 * - Use `<ng-content>` slot to project custom content below the message.
 */
@Component({
  selector: 'ngx-streaming-message',
  standalone: true,
  template: `
    <article class="streaming-message" aria-live="polite" [attr.aria-busy]="loading">
      @if (markdownFn) {
        <div class="content md" [innerHTML]="safeHtml(content)"></div>
      } @else {
        <p class="content">{{ content }}@if (loading && !done) {<span class="cursor" aria-hidden="true"></span>}</p>
      }
      @if (loading && !done) {
        <span class="state" aria-label="Streaming response">
          <span class="dot"></span><span class="dot"></span><span class="dot"></span>
        </span>
      }
      <ng-content />
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
    .content { margin: 0; color: var(--text, #0f172a); }
    .md :is(p, ul, ol, pre, blockquote) { margin: 0.4rem 0; }
    .md code { background: var(--code-bg, #1e293b); color: var(--code-text, #e2e8f0); padding: 0.1em 0.4em; border-radius: 4px; font-size: 0.9em; }
    .md pre code { display: block; padding: 0.85rem 1rem; overflow: auto; border-radius: 0.5rem; }
    .state { display: flex; gap: 4px; align-items: center; }

    /* Animated typing dots */
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--accent, #1d4ed8);
      animation: copilot-bounce 1.2s ease-in-out infinite;
    }
    .dot:nth-child(2) { animation-delay: 0.2s; }
    .dot:nth-child(3) { animation-delay: 0.4s; }

    @keyframes copilot-bounce {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }

    /* Inline cursor for plain-text mode */
    .cursor {
      display: inline-block;
      width: 2px;
      height: 1em;
      background: var(--accent, #1d4ed8);
      margin-left: 2px;
      vertical-align: text-bottom;
      animation: copilot-blink 1s step-end infinite;
    }

    @keyframes copilot-blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
  `],
})
export class StreamingMessageComponent {
  @Input() content = '';
  @Input() done = false;
  @Input() loading = false;

  protected readonly markdownFn = inject(COPILOT_MARKDOWN_RENDERER, { optional: true });
  private readonly sanitizer = inject(DomSanitizer);

  safeHtml(md: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.markdownFn!(md));
  }
}
