import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ApprovalCardComponent,
  ApprovalRequest,
  CopilotChatComponent,
  CopilotMessage,
  CopilotMode,
  AgentModeSelectorComponent,
  RagResult,
  RagSourceCardComponent,
  StreamingMessageComponent,
  ToolCallTimelineComponent,
  ToolTimelineItem,
} from '@ankitparekh007/ngx-copilot-sdk';

type ShowcaseState =
  | 'empty'
  | 'streaming'
  | 'rag'
  | 'approval-pending'
  | 'approval-approved'
  | 'approval-rejected'
  | 'timeline-running'
  | 'timeline-error'
  | 'error';

@Component({
  selector: 'app-showcase',
  standalone: true,
  imports: [
    RouterLink,
    CopilotChatComponent,
    StreamingMessageComponent,
    RagSourceCardComponent,
    ToolCallTimelineComponent,
    ApprovalCardComponent,
    AgentModeSelectorComponent,
  ],
  template: `
    <section class="showcase">
      <nav class="sample-links" aria-label="Enterprise mock samples">
        <a routerLink="/samples/enterprise-codebase">Codebase showcase</a>
        <span class="dot">·</span>
        <a routerLink="/samples/enterprise-docs">Documentation site</a>
      </nav>
      <h2>Component showcase</h2>
      <p class="lead">Preview SDK UI states for local visual review (no hosted Storybook).</p>

      <div class="picker" role="tablist" aria-label="Showcase states">
        @for (option of states; track option.id) {
          <button
            type="button"
            [class.active]="active() === option.id"
            (click)="active.set(option.id)">
            {{ option.label }}
          </button>
        }
      </div>

      <div class="preview">
        @if (showChat()) {
          <ngx-copilot-chat
            [messages]="messages()"
            [isStreaming]="active() === 'streaming'"
            [streamingContent]="streamingText"
            [errorMessage]="active() === 'error' ? 'Mock backend unavailable. Retry when your API is wired.' : undefined"
            [showComposer]="active() === 'empty'" />
        }

        @if (active() === 'streaming') {
          <ngx-streaming-message
            [content]="streamingText"
            [loading]="true" />
        }

        @if (active() === 'rag') {
          <div class="cards">
            @for (source of sampleSources; track source.id) {
              <ngx-rag-source-card [source]="source" />
            }
          </div>
        }

        @if (showTimeline()) {
          <ngx-tool-call-timeline [items]="timeline()" />
        }

        @if (showApproval()) {
          <ngx-approval-card [request]="approval()" />
        }

        <ngx-agent-mode-selector
          class="mode"
          [activeMode]="mode()"
          (modeChange)="mode.set($event)" />
      </div>
    </section>
  `,
  styles: [`
    .showcase { display: grid; gap: 1rem; }
    .sample-links {
      font-size: 0.9rem;
      color: var(--text-muted, #475569);
    }
    .sample-links a { color: var(--accent, #1d4ed8); text-decoration: none; }
    .sample-links a:hover { text-decoration: underline; }
    .dot { margin: 0 0.35rem; color: var(--text-subtle, #94a3b8); }
    .lead { margin: 0; color: var(--text-muted, #475569); }
    .picker { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .picker button {
      border: 1px solid var(--border, #cbd5e1);
      background: var(--bg, #fff);
      color: var(--text-muted, #374151);
      border-radius: 999px;
      padding: 0.4rem 0.75rem;
      cursor: pointer;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
      font-family: inherit;
      font-size: 0.92rem;
    }
    .picker button:hover { border-color: var(--accent); color: var(--accent); }
    .picker button.active { background: var(--accent); color: #fff; border-color: var(--accent); }
    .preview {
      display: grid;
      gap: 1rem;
      padding: 1rem;
      border-radius: 1rem;
      background: var(--bg-subtle, #f8f9fb);
      border: 1px solid var(--border, #dbe4f0);
    }
    .cards { display: grid; gap: 0.75rem; }
    .mode { margin-top: 0.5rem; }
  `],
})
export class ShowcaseComponent {
  readonly states: { id: ShowcaseState; label: string }[] = [
    { id: 'empty', label: 'Empty chat' },
    { id: 'streaming', label: 'Streaming' },
    { id: 'rag', label: 'RAG sources' },
    { id: 'approval-pending', label: 'Approval pending' },
    { id: 'approval-approved', label: 'Approval approved' },
    { id: 'approval-rejected', label: 'Approval rejected' },
    { id: 'timeline-running', label: 'Timeline running' },
    { id: 'timeline-error', label: 'Timeline error' },
    { id: 'error', label: 'Error state' },
  ];

  readonly active = signal<ShowcaseState>('empty');
  readonly mode = signal<CopilotMode>('plan');
  readonly streamingText = 'Streaming assistant response for preview…';

  readonly sampleSources: RagResult[] = [
    {
      id: 's1',
      title: 'Onboarding playbook',
      snippet: 'Escalate blocked activations after 14 days.',
      score: 0.91,
      sourceType: 'playbook',
    },
  ];

  messages(): CopilotMessage[] {
    if (this.active() === 'empty') {
      return [];
    }
    if (this.active() === 'streaming') {
      return [
        {
          id: 'u1',
          role: 'user',
          content: 'Draft a renewal summary.',
          createdAt: new Date().toISOString(),
        },
      ];
    }
    return [
      {
        id: 'u1',
        role: 'user',
        content: 'What should we do next?',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'a1',
        role: 'assistant',
        content: 'Recommend scheduling a success review.',
        createdAt: new Date().toISOString(),
        sources: this.sampleSources,
      },
    ];
  }

  timeline(): ToolTimelineItem[] {
    if (this.active() === 'timeline-running') {
      return [
        {
          id: 't1',
          toolName: 'fetchAccountSummary',
          summary: 'Running account lookup…',
          status: 'running',
        },
      ];
    }
    if (this.active() === 'timeline-error') {
      return [
        {
          id: 't2',
          toolName: 'syncBilling',
          summary: 'Billing sync failed — mock error state.',
          status: 'failed',
        },
      ];
    }
    return [];
  }

  approval(): ApprovalRequest {
    const base: ApprovalRequest = {
      id: 'approval-showcase',
      title: 'Send customer update',
      reason: 'Preview approval card state.',
      actionSummary: 'Email account team with proposed next steps.',
      riskLevel: 'medium',
    };
    if (this.active() === 'approval-approved') {
      return { ...base, decision: 'approved' };
    }
    if (this.active() === 'approval-rejected') {
      return { ...base, decision: 'rejected' };
    }
    return base;
  }

  showChat(): boolean {
    return ['empty', 'streaming', 'rag', 'error'].includes(this.active());
  }

  showTimeline(): boolean {
    return this.active() === 'timeline-running' || this.active() === 'timeline-error';
  }

  showApproval(): boolean {
    return this.active().startsWith('approval');
  }
}
