import { Component, computed, signal } from '@angular/core';
import {
  ApprovalCardComponent,
  RagSourceCardComponent,
  ToolCallTimelineComponent,
} from '@ankit-parekh-007/ngx-copilot-sdk';
import {
  FailureLabScenarioId,
  buildFailureLabScenario,
  retryFailureLabScenario,
} from './failure-scenarios';

@Component({
  selector: 'app-failure-lab',
  standalone: true,
  imports: [RagSourceCardComponent, ToolCallTimelineComponent, ApprovalCardComponent],
  template: `
    <section class="lab" aria-labelledby="failure-lab-title">
      <header class="lab-header">
        <div>
          <p class="eyebrow">SDK contract lab</p>
          <h1 id="failure-lab-title">Failure and recovery, end to end</h1>
          <p class="lead">
            Deterministic API-key-free scenarios rendered from the same public SDK event,
            source, timeline, approval, and adapter-error contracts a real Angular consumer uses.
          </p>
        </div>
        <span class="mock-pill">Mock events · real SDK contracts</span>
      </header>

      <div class="scenario-tabs" role="tablist" aria-label="Failure lab scenarios">
        @for (option of scenarios; track option.id) {
          <button
            type="button"
            role="tab"
            [attr.aria-selected]="scenario().id === option.id"
            [class.active]="scenario().id === option.id"
            (click)="select(option.id)">
            <strong>{{ option.label }}</strong>
            <span>{{ option.detail }}</span>
          </button>
        }
      </div>

      <div class="lab-grid">
        <main class="lab-main">
          <article class="card result-card">
            <div class="card-heading">
              <div>
                <p class="eyebrow">Terminal UI claim</p>
                <h2>{{ scenario().label }}</h2>
              </div>
              <span class="terminal" [attr.data-claim]="scenario().terminalClaim">
                {{ terminalLabel() }}
              </span>
            </div>
            <p>{{ scenario().description }}</p>
            <div class="result-copy">
              <strong>What the interface is allowed to say</strong>
              <p>{{ scenario().result }}</p>
            </div>
            @if (scenario().retryable) {
              <button type="button" class="retry" (click)="retry()">Retry from request boundary</button>
            }
            <p class="announcement" aria-live="polite" aria-atomic="true">{{ announcement() }}</p>
          </article>

          <article class="card">
            <div class="card-heading">
              <div>
                <p class="eyebrow">SSE / SDK event sequence</p>
                <h2>Inspectable runtime contract</h2>
              </div>
              <span class="count">{{ scenario().events.length }} events</span>
            </div>
            <ol class="event-list">
              @for (event of scenario().events; track $index) {
                <li>
                  <span class="event-type">{{ event.type }}</span>
                  <code>{{ describeEvent(event) }}</code>
                </li>
              }
            </ol>
          </article>

          <article class="card boundary">
            <p class="eyebrow">Enforcement boundary</p>
            <h2>Visible frontend state is not permission</h2>
            <p>
              Production retrieval authorization, provider credentials, approval enforcement,
              idempotent execution, tool permissions, and audit logging remain backend responsibilities.
              This route only simulates the public SDK contract in deterministic mock mode.
            </p>
          </article>
        </main>

        <aside class="lab-side">
          <article class="card">
            <p class="eyebrow">Retained request context</p>
            <h2>Safe snapshot</h2>
            <ul class="context-list">
              @for (item of scenario().requestContext; track item) {
                <li><code>{{ item }}</code></li>
              }
            </ul>
            @if (scenario().recovered) {
              <p class="recovered">Retry reused this exact visible-context snapshot.</p>
            }
          </article>

          <article class="card">
            <div class="card-heading compact">
              <div>
                <p class="eyebrow">Grounding</p>
                <h2>Citations</h2>
              </div>
              <span class="count">{{ scenario().sources.length }}</span>
            </div>
            @if (scenario().sources.length) {
              <div class="stack">
                @for (source of scenario().sources; track source.id) {
                  <ngx-rag-source-card [source]="source" />
                }
              </div>
            } @else {
              <p class="empty">No citations render for this failure state.</p>
            }
          </article>

          <article class="card">
            <div class="card-heading compact">
              <div>
                <p class="eyebrow">Tool execution</p>
                <h2>Timeline</h2>
              </div>
              <span class="count">{{ scenario().timeline.length }}</span>
            </div>
            @if (scenario().timeline.length) {
              <ngx-tool-call-timeline [items]="scenario().timeline" />
            } @else {
              <p class="empty">No tool plan is rendered for this failure state.</p>
            }
          </article>

          @if (scenario().approval; as request) {
            <article class="card">
              <p class="eyebrow">Human decision</p>
              <ngx-approval-card [request]="request" />
            </article>
          }
        </aside>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .lab { max-width: 1440px; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; display: grid; gap: 1rem; }
    .lab-header, .card-heading { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; }
    .lab-header h1 { margin: .2rem 0 .55rem; font-size: clamp(2rem, 4vw, 3.4rem); letter-spacing: -.04em; }
    .lead { max-width: 78ch; margin: 0; color: var(--text-muted, #64748b); line-height: 1.65; }
    .eyebrow { margin: 0 0 .35rem; color: var(--accent, #5b8cff); text-transform: uppercase; letter-spacing: .09em; font-size: .75rem; font-weight: 800; }
    .mock-pill, .count, .terminal { display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; padding: .45rem .7rem; font-weight: 800; font-size: .78rem; }
    .mock-pill { color: #fbbf24; border: 1px solid rgba(245,158,11,.35); background: rgba(245,158,11,.08); white-space: nowrap; }
    .scenario-tabs { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: .65rem; }
    .scenario-tabs button { min-height: 68px; border: 1px solid var(--border, #dbe4f0); border-radius: .9rem; background: var(--bg-card, #fff); color: var(--text, #111827); padding: .8rem; text-align: left; cursor: pointer; display: grid; gap: .25rem; font: inherit; }
    .scenario-tabs button span { color: var(--text-muted, #64748b); font-size: .8rem; }
    .scenario-tabs button:hover, .scenario-tabs button.active { border-color: var(--accent, #5b8cff); box-shadow: 0 10px 30px rgba(59,130,246,.09); }
    button:focus-visible { outline: 3px solid color-mix(in srgb, var(--accent, #5b8cff) 40%, transparent); outline-offset: 2px; }
    .lab-grid { display: grid; grid-template-columns: minmax(0,1.35fr) minmax(330px,.65fr); gap: 1rem; }
    .lab-main, .lab-side, .stack { display: grid; gap: 1rem; align-content: start; }
    .card { border: 1px solid var(--border, #dbe4f0); border-radius: 1rem; background: var(--bg-card, #fff); padding: 1rem; }
    .card h2 { margin: .1rem 0 .45rem; font-size: 1.15rem; }
    .card p { line-height: 1.55; }
    .compact { align-items: center; }
    .count { background: var(--bg-subtle, #f1f5f9); color: var(--text-muted, #64748b); }
    .terminal[data-claim='failed'] { background: #fee2e2; color: #991b1b; }
    .terminal[data-claim='not-executed'] { background: #fef3c7; color: #92400e; }
    .terminal[data-claim='none'] { background: #dbeafe; color: #1d4ed8; }
    .terminal[data-claim='completed'] { background: #dcfce7; color: #166534; }
    .result-copy { margin: .85rem 0; padding: .9rem; border-left: 4px solid var(--accent, #5b8cff); border-radius: .7rem; background: var(--bg-subtle, #f8fafc); }
    .result-copy p { margin-bottom: 0; }
    .retry { min-height: 44px; border: 0; border-radius: 999px; background: var(--accent, #5b8cff); color: #fff; padding: .7rem 1rem; font-weight: 800; cursor: pointer; }
    .announcement { min-height: 1.35rem; margin: .7rem 0 0; color: var(--text-muted, #64748b); font-size: .85rem; }
    .event-list { list-style: none; padding: 0; margin: 0; display: grid; gap: .55rem; }
    .event-list li { display: grid; grid-template-columns: 145px 1fr; gap: .7rem; padding: .7rem; border: 1px solid var(--border, #e2e8f0); border-radius: .75rem; background: var(--bg-subtle, #f8fafc); }
    .event-type { font-weight: 800; color: var(--accent, #2563eb); }
    code { overflow-wrap: anywhere; white-space: pre-wrap; color: var(--text-muted, #475569); }
    .context-list { margin: 0; padding-left: 1.1rem; display: grid; gap: .5rem; }
    .recovered { padding: .7rem; border-radius: .7rem; background: #dcfce7; color: #166534; }
    .empty { padding: .8rem; border: 1px dashed var(--border, #cbd5e1); border-radius: .7rem; color: var(--text-muted, #64748b); }
    .boundary { border-color: rgba(245,158,11,.45); background: color-mix(in srgb, var(--bg-card, #fff) 94%, #f59e0b); }
    @media (max-width: 1000px) { .scenario-tabs { grid-template-columns: repeat(2,minmax(0,1fr)); } .lab-grid { grid-template-columns: 1fr; } }
    @media (max-width: 640px) { .lab-header, .card-heading { display: grid; } .scenario-tabs { grid-template-columns: 1fr; } .event-list li { grid-template-columns: 1fr; } }
  `],
})
export class FailureLabComponent {
  readonly scenarios: ReadonlyArray<{ id: FailureLabScenarioId; label: string; detail: string }> = [
    { id: 'sse-disconnect', label: 'SSE disconnect', detail: 'Recoverable stream failure' },
    { id: 'retrieval-failure', label: 'Retrieval failure', detail: 'No fabricated citations' },
    { id: 'approval-rejected', label: 'Approval rejected', detail: 'Terminal non-executed state' },
    { id: 'tool-disabled', label: 'Tool disabled', detail: 'Policy block stays visible' },
  ];

  readonly scenario = signal(buildFailureLabScenario('sse-disconnect'));
  readonly announcement = signal('SSE disconnect scenario loaded. Retry is available from the request boundary.');
  readonly terminalLabel = computed(() => this.scenario().terminalClaim.replace('-', ' '));

  select(id: FailureLabScenarioId): void {
    this.scenario.set(buildFailureLabScenario(id));
    this.announcement.set(`${this.scenario().label} scenario loaded. ${this.scenario().result}`);
  }

  retry(): void {
    this.scenario.update(current => retryFailureLabScenario(current));
    this.announcement.set(
      this.scenario().recovered
        ? 'SSE retry recovered with the same request context. Execution remains unclaimed while approval is pending.'
        : 'This scenario does not expose a retry action.',
    );
  }

  describeEvent(event: ReturnType<typeof buildFailureLabScenario>['events'][number]): string {
    switch (event.type) {
      case 'session-started': return `sessionId=${event.sessionId}`;
      case 'message-start': return `messageId=${event.messageId}`;
      case 'message-chunk': return `content=${event.content}`;
      case 'message-complete': return `messageId=${event.message.id}`;
      case 'sources': return `sources=${event.sources.length}`;
      case 'tool-timeline': return event.items.map(item => `${item.toolName}:${item.status}`).join(', ');
      case 'approval-required': return `request=${event.request.id}`;
      case 'approval-resolved': return `request=${event.requestId}; decision=${event.decision}`;
      case 'error': return `${event.error.code}; recoverable=${event.error.recoverable}`;
      case 'done': return 'stream closed';
    }
  }
}
