import { JsonPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { CopilotMode } from '../../models/copilot-config.model';
import { CopilotContext } from '../../models/copilot-context.model';
import { CopilotMessage } from '../../models/copilot-message.model';
import { RagResult } from '../../models/rag-result.model';
import { ApprovalRequest } from '../../models/approval-request.model';
import { ToolTimelineItem } from '../../models/tool-timeline-item.model';
import { CopilotService } from '../../services/copilot.service';
import { AgentModeSelectorComponent } from '../agent-mode-selector/agent-mode-selector.component';
import { CopilotChatComponent } from '../copilot-chat/copilot-chat.component';
import { RagSourceCardComponent } from '../rag-source-card/rag-source-card.component';
import { ToolCallTimelineComponent } from '../tool-call-timeline/tool-call-timeline.component';
import { ApprovalCardComponent } from '../approval-card/approval-card.component';

/**
 * All-in-one copilot workspace: chat panel, context inspector, RAG citations,
 * tool execution timeline, approval gate, and mode selector.
 *
 * **Minimal setup (service-wired — recommended):**
 * ```html
 * <ngx-copilot-shell [context]="{ route: router.url }" />
 * ```
 * `useService` defaults to `true`. The shell reads all state from `CopilotService`.
 *
 * **Controlled mode (manual data binding):**
 * ```html
 * <ngx-copilot-shell
 *   [useService]="false"
 *   [messages]="myMessages"
 *   [isStreaming]="myIsStreaming"
 *   (messageSent)="onSend($event)" />
 * ```
 *
 * **Multi-instance (component-level scope):**
 * Add `CopilotService` to the host component's `providers` array so each shell
 * instance gets its own independent state:
 * ```ts
 * @Component({ providers: [CopilotService] })
 * export class MyCopilotPage {}
 * ```
 *
 * **ng-content slots:**
 * - `[slot='shell-header']` — extra content in the header row (e.g. export button)
 * - `[slot='shell-footer']` — content below the mode selector
 *
 * **CSS custom properties (full list):**
 * - `--bg-card-solid` — panel card backgrounds
 * - `--bg-muted` — subtle section backgrounds
 * - `--bg-card` — inner card backgrounds (semi-transparent)
 * - `--text` — primary text
 * - `--text-muted` — secondary text
 * - `--text-subtle` — metadata / label text
 * - `--accent` — primary brand color (blue)
 * - `--accent-2` — secondary brand color (purple)
 * - `--accent-light` — tinted accent background
 * - `--accent-text` — text color on accent backgrounds
 * - `--border` — default border color
 * - `--border-strong` — emphasized border color
 * - `--shadow-sm` — card box-shadow
 * - `--callout-danger-bg/text/border` — error callout colors
 * - `--callout-warning-bg/text/border` — approval warning colors
 * - `--callout-success-bg/text/border` — success state colors
 * - `--code-bg` / `--code-text` — Markdown code block colors
 */
@Component({
  selector: 'ngx-copilot-shell',
  standalone: true,
  imports: [
    JsonPipe,
    AgentModeSelectorComponent,
    CopilotChatComponent,
    RagSourceCardComponent,
    ToolCallTimelineComponent,
    ApprovalCardComponent,
  ],
  template: `
    <section class="shell">
      <header class="hero">
        <div>
          <p class="eyebrow">{{ statusLabel }}</p>
          <h2>{{ title }}</h2>
          <p>{{ subtitle }}</p>
        </div>
        <div class="hero-end">
          <ng-content select="[slot='shell-header']" />
          <button type="button" class="reset" (click)="onReset()" [disabled]="isStreaming">
            Reset session
          </button>
        </div>
      </header>

      <div class="grid">
        <section class="panel">
          <h3>Copilot chat</h3>
          <ngx-copilot-chat
            [messages]="resolvedMessages()"
            [isStreaming]="isStreaming"
            [streamingContent]="streamingContent()"
            [errorMessage]="errorMessage()"
            [showComposer]="showComposer"
            [useService]="useService"
            [context]="context"
            (send)="messageSent.emit($event)" />
        </section>

        @if (showContext) {
          <aside class="panel panel-context">
            <h3>Context</h3>
            <pre>{{ context | json }}</pre>
          </aside>
        }
      </div>

      @if (showSources || showTimeline) {
        <div class="grid grid-secondary">
          @if (showSources) {
            <section class="panel">
              <h3>RAG sources</h3>
              @if (!resolvedSources().length) {
                <p class="muted">No sources yet.</p>
              } @else {
                <div class="cards">
                  @for (source of resolvedSources(); track source.id) {
                    <ngx-rag-source-card [source]="source" />
                  }
                </div>
              }
            </section>
          }

          @if (showTimeline) {
            <section class="panel">
              <h3>Tool timeline</h3>
              <ngx-tool-call-timeline [items]="resolvedTimeline()" />
            </section>
          }
        </div>
      }

      @if (resolvedApproval(); as approvalRequest) {
        <section class="panel">
          <h3>Approval required</h3>
          <ngx-approval-card
            [request]="approvalRequest"
            [disabled]="isStreaming"
            (approve)="onApprove($event)"
            (reject)="onReject($event)" />
        </section>
      }

      <footer class="footer">
        <ngx-agent-mode-selector
          [modes]="modes"
          [modeLabels]="modeLabels"
          [activeMode]="resolvedMode()"
          [disabled]="isStreaming"
          (modeChange)="onModeChange($event)" />
        <ng-content select="[slot='shell-footer']" />
      </footer>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .shell {
      display: grid;
      gap: 1rem;
      padding: 1rem;
      background: linear-gradient(180deg, color-mix(in srgb, var(--bg-card-solid, #ffffff) 92%, white 8%) 0%, color-mix(in srgb, var(--bg-muted, #eef4ff) 86%, white 14%) 100%);
      color: var(--text, #0f172a);
      border-radius: 1.5rem;
      border: 1px solid var(--border, #dbe4f0);
    }
    .hero {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: start;
      flex-wrap: wrap;
    }
    .hero-end {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .eyebrow {
      margin: 0 0 0.35rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--accent, #1d4ed8);
      font-size: 0.82rem;
    }
    h2, h3, p, pre { margin: 0; }
    .grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: minmax(0, 1.75fr) minmax(280px, 1fr);
    }
    .grid-secondary { align-items: start; }
    .panel {
      display: grid;
      gap: 0.8rem;
      border-radius: 1.25rem;
      background: var(--bg-card, rgba(255, 255, 255, 0.92));
      padding: 1rem;
      border: 1px solid var(--border, #dbe4f0);
      box-shadow: var(--shadow-sm, none);
    }
    .panel h3 { color: var(--text, #0f172a); }
    .panel-context pre {
      white-space: pre-wrap;
      word-break: break-word;
      font-size: 0.86rem;
      line-height: 1.65;
      color: var(--code-text, #e6edf3);
      background: var(--code-bg, #111827);
      border: 1px solid var(--border, #dbe4f0);
      border-radius: 0.95rem;
      padding: 0.95rem 1rem;
      overflow: auto;
    }
    .cards { display: grid; gap: 0.75rem; }
    .muted { color: var(--text-muted, #64748b); font-size: 0.9rem; }
    .footer {
      border-top: 1px solid var(--border, #dbe4f0);
      padding-top: 0.75rem;
      display: grid;
      gap: 0.5rem;
    }
    .reset {
      border: 1px solid var(--border, #cbd5e1);
      background: var(--bg-card-solid, #fff);
      color: var(--text, #0f172a);
      border-radius: 999px;
      padding: 0.45rem 0.9rem;
      cursor: pointer;
      white-space: nowrap;
    }
    .reset:disabled { opacity: 0.55; cursor: not-allowed; }
    @media (max-width: 900px) {
      .grid { grid-template-columns: 1fr; }
    }
  `],
})
export class CopilotShellComponent {
  @Input() title = 'Angular copilot shell';
  @Input() subtitle = 'Unified workspace for chat, context, citations, tools, and approvals.';
  @Input() statusLabel = 'ngx-copilot SDK';
  @Input() modes: CopilotMode[] = ['ask', 'plan', 'execute', 'debug'];
  @Input() modeLabels: Partial<Record<CopilotMode, string>> = {};
  @Input() activeMode: CopilotMode = 'ask';
  /** Context passed to each message sent via the service. Defaults to an empty root context. */
  @Input() context: CopilotContext = { route: '' };
  @Input() messages: CopilotMessage[] = [];
  @Input() sources: RagResult[] = [];
  @Input() timeline: ToolTimelineItem[] = [];
  @Input() approval?: ApprovalRequest;
  @Input() showComposer = true;
  @Input() showSources = true;
  @Input() showTimeline = true;
  /** Show the context JSON inspector panel. Useful for debugging; hide in production. */
  @Input() showContext = false;
  /**
   * When `true` (default), all state is read from and written to `CopilotService`.
   * Set to `false` for fully controlled mode where you pass data via inputs.
   */
  @Input() useService = true;

  @Output() readonly modeChange = new EventEmitter<CopilotMode>();
  @Output() readonly approve = new EventEmitter<string>();
  @Output() readonly reject = new EventEmitter<string>();
  @Output() readonly messageSent = new EventEmitter<string>();
  @Output() readonly sessionReset = new EventEmitter<void>();

  private readonly copilot = inject(CopilotService, { optional: true });
  private readonly localMode = signal<CopilotMode | null>(null);

  readonly resolvedMessages = computed(() =>
    this.useService && this.copilot ? this.copilot.messages() : this.messages,
  );
  readonly resolvedSources = computed(() =>
    this.useService && this.copilot ? this.copilot.sources() : this.sources,
  );
  readonly resolvedTimeline = computed(() =>
    this.useService && this.copilot ? this.copilot.timeline() : this.timeline,
  );
  readonly resolvedApproval = computed(() =>
    this.useService && this.copilot ? this.copilot.approval() : this.approval,
  );
  readonly resolvedMode = computed(() => {
    if (this.useService && this.copilot) return this.copilot.activeMode();
    return this.localMode() ?? this.activeMode;
  });

  get isStreaming(): boolean {
    return this.useService && this.copilot ? this.copilot.isStreaming() : false;
  }

  streamingContent(): string {
    if (!this.useService || !this.copilot) return '';
    const messages = this.copilot.messages();
    const last = messages[messages.length - 1];
    return last?.role === 'assistant' && this.copilot.isStreaming() ? last.content : '';
  }

  errorMessage(): string | undefined {
    if (!this.useService || !this.copilot) return undefined;
    return this.copilot.error()?.message;
  }

  onModeChange(mode: CopilotMode): void {
    if (this.useService && this.copilot) {
      this.copilot.setMode(mode);
    } else {
      this.localMode.set(mode);
    }
    this.modeChange.emit(mode);
  }

  onApprove(requestId: string): void {
    if (this.useService && this.copilot) this.copilot.approve(requestId);
    this.approve.emit(requestId);
  }

  onReject(requestId: string): void {
    if (this.useService && this.copilot) this.copilot.reject(requestId);
    this.reject.emit(requestId);
  }

  onReset(): void {
    if (this.useService && this.copilot) this.copilot.resetSession();
    this.sessionReset.emit();
  }
}
