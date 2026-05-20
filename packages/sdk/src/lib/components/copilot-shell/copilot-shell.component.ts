import { CommonModule, JsonPipe } from '@angular/common';
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

@Component({
  selector: 'ngx-copilot-shell',
  standalone: true,
  imports: [
    CommonModule,
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
        <button type="button" class="reset" (click)="onReset()" [disabled]="isStreaming">
          Reset session
        </button>
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

        <aside class="panel panel-context">
          <h3>Context panel</h3>
          <pre>{{ context | json }}</pre>
        </aside>
      </div>

      <div class="grid grid-secondary" *ngIf="showSources || showTimeline">
        <section class="panel" *ngIf="showSources">
          <h3>RAG sources</h3>
          <p *ngIf="!resolvedSources().length" class="muted">No sources yet.</p>
          <div class="cards">
            <ngx-rag-source-card *ngFor="let source of resolvedSources()" [source]="source" />
          </div>
        </section>

        <section class="panel" *ngIf="showTimeline">
          <h3>Tool timeline</h3>
          <ngx-tool-call-timeline [items]="resolvedTimeline()" />
        </section>
      </div>

      <section class="panel" *ngIf="resolvedApproval() as approvalRequest">
        <h3>Approval</h3>
        <ngx-approval-card
          [request]="approvalRequest"
          [disabled]="isStreaming"
          (approve)="onApprove($event)"
          (reject)="onReject($event)" />
      </section>

      <footer class="footer">
        <ngx-agent-mode-selector
          [modes]="modes"
          [activeMode]="resolvedMode()"
          [disabled]="isStreaming"
          (modeChange)="onModeChange($event)" />
      </footer>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .shell {
      display: grid;
      gap: 1rem;
      padding: 1rem;
      background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
      color: #0f172a;
      border-radius: 1.5rem;
      border: 1px solid #dbe4f0;
    }
    .hero {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: start;
      flex-wrap: wrap;
    }
    .eyebrow {
      margin: 0 0 0.35rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #1d4ed8;
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
      background: rgba(255, 255, 255, 0.92);
      padding: 1rem;
      border: 1px solid #dbe4f0;
    }
    .panel-context pre {
      white-space: pre-wrap;
      word-break: break-word;
      font-size: 0.86rem;
      color: #334155;
    }
    .cards { display: grid; gap: 0.75rem; }
    .muted { color: #64748b; font-size: 0.9rem; }
    .footer {
      border-top: 1px solid #dbe4f0;
      padding-top: 0.75rem;
    }
    .reset {
      border: 1px solid #cbd5e1;
      background: #fff;
      border-radius: 999px;
      padding: 0.45rem 0.9rem;
      cursor: pointer;
    }
    .reset:disabled { opacity: 0.55; cursor: not-allowed; }
    @media (max-width: 900px) {
      .grid { grid-template-columns: 1fr; }
    }
  `],
})
export class CopilotShellComponent {
  @Input() title = 'Angular copilot shell';
  @Input() subtitle = 'Preview UI for chat, context, citations, tools, and approvals.';
  @Input() statusLabel = '0.1.0 preview SDK';
  @Input() modes: CopilotMode[] = ['ask', 'plan', 'execute', 'debug'];
  @Input() activeMode: CopilotMode = 'ask';
  @Input() context!: CopilotContext;
  @Input() messages: CopilotMessage[] = [];
  @Input() sources: RagResult[] = [];
  @Input() timeline: ToolTimelineItem[] = [];
  @Input() approval?: ApprovalRequest;
  @Input() showComposer = true;
  @Input() showSources = true;
  @Input() showTimeline = true;
  @Input() useService = false;

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
    if (this.useService && this.copilot) {
      return this.copilot.activeMode();
    }
    return this.localMode() ?? this.activeMode;
  });

  get isStreaming(): boolean {
    return this.useService && this.copilot ? this.copilot.isStreaming() : false;
  }

  streamingContent(): string {
    if (!this.useService || !this.copilot) {
      return '';
    }
    const messages = this.copilot.messages();
    const last = messages[messages.length - 1];
    return last?.role === 'assistant' && this.copilot.isStreaming() ? last.content : '';
  }

  errorMessage(): string | undefined {
    if (!this.useService || !this.copilot) {
      return undefined;
    }
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
    if (this.useService && this.copilot) {
      this.copilot.approve(requestId);
    }
    this.approve.emit(requestId);
  }

  onReject(requestId: string): void {
    if (this.useService && this.copilot) {
      this.copilot.reject(requestId);
    }
    this.reject.emit(requestId);
  }

  onReset(): void {
    if (this.useService && this.copilot) {
      this.copilot.resetSession();
    }
    this.sessionReset.emit();
  }
}
