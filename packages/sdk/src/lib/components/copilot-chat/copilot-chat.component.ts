import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  ViewChild,
  AfterViewChecked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CopilotMessage } from '../../models/copilot-message.model';
import { CopilotContext } from '../../models/copilot-context.model';
import { CopilotService } from '../../services/copilot.service';
import { StreamingMessageComponent } from '../streaming-message/streaming-message.component';
import { COPILOT_MARKDOWN_RENDERER } from '../../tokens/copilot-markdown-renderer.token';

/**
 * Chat thread + composer component.
 *
 * **Standalone usage (controlled mode):**
 * ```html
 * <ngx-copilot-chat
 *   [messages]="messages"
 *   [isStreaming]="isStreaming"
 *   (send)="onSend($event)" />
 * ```
 *
 * **Service-wired mode (recommended):**
 * ```html
 * <ngx-copilot-chat [useService]="true" [context]="{ route: '/dashboard' }" />
 * ```
 * When `useService` is `true`, the component reads from and writes to
 * `CopilotService` directly. The `send` output still fires for logging/analytics.
 *
 * **Markdown rendering:**
 * Provide `COPILOT_MARKDOWN_RENDERER` in `app.config.ts`:
 * ```ts
 * import { marked } from 'marked';
 * { provide: COPILOT_MARKDOWN_RENDERER, useValue: (md: string) => marked.parse(md) }
 * ```
 *
 * **Component-level CopilotService scoping:**
 * To run two independent copilot instances on the same page, add `CopilotService`
 * to each host component's `providers` array:
 * ```ts
 * @Component({ providers: [CopilotService] })
 * export class MyCopilotHost {}
 * ```
 *
 * **CSS custom properties (theme):**
 * `--border`, `--bg-card-solid`, `--text`, `--text-subtle`, `--text-muted`,
 * `--accent-light`, `--border-strong`, `--callout-danger-bg`, `--callout-danger-text`,
 * `--callout-danger-border`
 */
@Component({
  selector: 'ngx-copilot-chat',
  standalone: true,
  imports: [FormsModule, StreamingMessageComponent],
  template: `
    <section class="chat" aria-label="Copilot conversation">
      <div class="chat-thread" #thread [style.max-height]="maxHeight">
        @if (!messages.length && !isStreaming && !errorMessage) {
          <p class="empty">{{ emptyLabel }}</p>
        }

        @for (message of messages; track message.id) {
          <article
            class="message"
            [attr.data-role]="message.role"
            [attr.aria-label]="message.role + ' message'">
            <p class="message-role">{{ message.role }}</p>
            @if (markdownFn && message.role === 'assistant') {
              <div class="md-content" [innerHTML]="safeHtml(message.content)"></div>
            } @else {
              <p>{{ message.content }}</p>
            }
          </article>
        }

        @if (isStreaming && streamingContent) {
          <ngx-streaming-message
            [content]="streamingContent"
            [done]="false"
            [loading]="true" />
        }
      </div>

      @if (errorMessage) {
        <div class="error" role="alert">
          <p>{{ errorMessage }}</p>
          @if (showRetry) {
            <button type="button" class="retry-btn" (click)="onRetry()">Retry</button>
          }
        </div>
      }

      @if (showComposer) {
        <form class="composer" (ngSubmit)="submit()">
          <label class="sr-only" for="copilot-input">Message</label>
          <textarea
            id="copilot-input"
            name="draft"
            rows="2"
            [(ngModel)]="draft"
            [placeholder]="placeholder"
            [disabled]="disabled || isStreaming"
            (keydown.enter)="onEnter($event)"
            aria-label="Copilot message input"></textarea>
          <div class="composer-actions">
            <ng-content select="[slot='composer-extra']" />
            <button type="submit" [disabled]="disabled || isStreaming || !draft.trim()">
              {{ isStreaming ? 'Sending…' : submitLabel }}
            </button>
          </div>
        </form>
      }
    </section>
  `,
  styles: [`
    .chat { display: grid; gap: 0.85rem; }
    .chat-thread {
      display: grid;
      gap: 0.85rem;
      overflow-y: auto;
    }
    .message {
      border-radius: 1rem;
      padding: 0.9rem 1rem;
      background: var(--bg-card-solid, #fff);
      border: 1px solid var(--border, #dbe4f0);
      color: var(--text, #0f172a);
    }
    .message[data-role='assistant'] {
      background: var(--accent-light, #eff6ff);
      border-color: var(--border-strong, #bfdbfe);
    }
    .message-role {
      margin: 0 0 0.35rem;
      text-transform: capitalize;
      font-size: 0.82rem;
      color: var(--text-subtle, #475569);
    }
    p { margin: 0; }
    .md-content { color: var(--text, #0f172a); }
    .md-content :is(p, ul, ol, pre, blockquote) { margin: 0.4rem 0; }
    .md-content code { background: var(--code-bg, #1e293b); color: var(--code-text, #e2e8f0); padding: 0.1em 0.4em; border-radius: 4px; font-size: 0.9em; }
    .md-content pre code { display: block; padding: 0.85rem 1rem; overflow: auto; border-radius: 0.5rem; }
    .empty { color: var(--text-muted, #64748b); font-size: 0.95rem; }
    .error {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
      padding: 0.65rem 0.85rem;
      border-radius: 0.75rem;
      background: var(--callout-danger-bg, #fef2f2);
      color: var(--callout-danger-text, #b91c1c);
      border: 1px solid var(--callout-danger-border, #fecaca);
    }
    .error p { margin: 0; flex: 1; }
    .retry-btn {
      border: 1px solid var(--callout-danger-border, #fecaca);
      background: transparent;
      color: var(--callout-danger-text, #b91c1c);
      border-radius: 999px;
      padding: 0.3rem 0.75rem;
      cursor: pointer;
      font-size: 0.85rem;
      white-space: nowrap;
    }
    .retry-btn:hover { background: var(--callout-danger-border, #fecaca); }
    .composer { display: grid; gap: 0.5rem; }
    .composer-actions { display: flex; align-items: center; justify-content: flex-end; gap: 0.5rem; }
    textarea {
      resize: vertical;
      min-height: 3rem;
      border-radius: 0.85rem;
      border: 1px solid var(--border, #cbd5e1);
      padding: 0.65rem 0.8rem;
      font: inherit;
      color: var(--text, #0f172a);
      background: var(--bg-card-solid, #ffffff);
    }
    textarea::placeholder { color: var(--text-subtle, #64748b); }
    textarea:disabled { opacity: 0.65; cursor: not-allowed; }
    button[type=submit] {
      border: none;
      border-radius: 999px;
      background: var(--text, #0f172a);
      color: var(--bg-card-solid, #fff);
      padding: 0.55rem 1rem;
      cursor: pointer;
    }
    button[type=submit]:disabled { opacity: 0.55; cursor: not-allowed; }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      border: 0;
    }
  `],
})
export class CopilotChatComponent implements AfterViewChecked {
  @Input() messages: CopilotMessage[] = [];
  @Input() isStreaming = false;
  @Input() streamingContent = '';
  @Input() errorMessage?: string;
  @Input() emptyLabel = 'Ask a question to start the copilot.';
  @Input() placeholder = 'Ask the copilot…';
  @Input() submitLabel = 'Send';
  @Input() showComposer = true;
  @Input() showRetry = true;
  @Input() disabled = false;
  @Input() autoScroll = true;
  /**
   * When `true`, the component drives itself via `CopilotService`.
   * The `send` output still fires for analytics/logging.
   * Defaults to `true` — set to `false` for fully controlled mode.
   */
  @Input() useService = true;
  @Input() context?: CopilotContext;
  /**
   * Maximum height of the message thread before it scrolls.
   * Accepts any CSS length value.
   * @example '30rem'  '400px'  '60vh'
   */
  @Input() maxHeight = '22rem';

  @Output() readonly send = new EventEmitter<string>();

  @ViewChild('thread') private threadRef?: ElementRef<HTMLElement>;

  draft = '';
  private shouldScroll = false;

  protected readonly markdownFn = inject(COPILOT_MARKDOWN_RENDERER, { optional: true });
  private readonly sanitizer = inject(DomSanitizer);
  private readonly copilot = inject(CopilotService, { optional: true });

  safeHtml(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.markdownFn!(content));
  }

  ngAfterViewChecked(): void {
    if (this.autoScroll && this.shouldScroll && this.threadRef) {
      const el = this.threadRef.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.shouldScroll = false;
    }
  }

  onEnter(event: Event): void {
    const keyboard = event as KeyboardEvent;
    if (!keyboard.shiftKey) {
      keyboard.preventDefault();
      this.submit();
    }
  }

  onRetry(): void {
    if (this.useService && this.copilot) {
      this.copilot.retryLastMessage();
    }
  }

  submit(): void {
    const content = this.draft.trim();
    if (!content || this.disabled || this.isStreaming) return;

    if (this.useService && this.copilot) {
      this.copilot.sendMessage(content, this.context);
    }
    this.send.emit(content);
    this.draft = '';
    this.shouldScroll = true;
  }
}
