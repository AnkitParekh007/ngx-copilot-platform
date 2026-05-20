import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocsCodeBlockComponent } from './docs-code-block.component';

@Component({
  selector: 'app-tool-timeline-doc',
  standalone: true,
  imports: [RouterLink, DocsCodeBlockComponent],
  template: `
    <div class="article-header">
      <div class="header-meta">
        <span class="header-category">Core Concepts</span>
        <span class="badge badge-preview">Preview</span>
      </div>
      <h1>Tool Timeline</h1>
      <p class="header-desc">
        Real-time visualisation of agentic tool calls — each step shows the tool name, human-readable
        summary, live status, and elapsed timing, giving users full transparency into how the AI
        reached its answer.
      </p>
    </div>

    <h2 id="timeline-item">ToolTimelineItem shape</h2>
    <p>Each step in the timeline is represented by a <code>ToolTimelineItem</code>:</p>
    <app-docs-code-block language="typescript" [code]="timelineItemExample" />

    <h2 id="status-meanings">Status values</h2>
    <table>
      <thead><tr><th>Status</th><th>Meaning</th><th>When to use</th></tr></thead>
      <tbody>
        <tr>
          <td><code>running</code></td><td>In progress</td>
          <td>Emit immediately when the tool call starts.</td>
        </tr>
        <tr>
          <td><code>succeeded</code></td><td>Completed successfully</td>
          <td>Update the step once the tool returns a result.</td>
        </tr>
        <tr>
          <td><code>failed</code></td><td>Error or timeout</td>
          <td>Set when the tool call throws or returns an error result.</td>
        </tr>
        <tr>
          <td><code>skipped</code></td><td>Bypassed intentionally</td>
          <td>Use when the orchestrator decided this tool was not needed.</td>
        </tr>
      </tbody>
    </table>

    <h2 id="typical-sequence">Typical agent tool sequence</h2>
    <p>
      A codebase navigation copilot typically emits the following sequence.
      The SDK renders each step as it arrives from the event stream:
    </p>
    <div class="timeline-demo">
      <div class="tl-step tl-succeeded">
        <div class="tl-num">1</div>
        <div class="tl-body">
          <strong>Analyse route tree</strong>
          <span>Resolved 47 lazy routes and correlated entry-point components.</span>
        </div>
      </div>
      <div class="tl-step tl-succeeded">
        <div class="tl-num">2</div>
        <div class="tl-body">
          <strong>Search Angular services</strong>
          <span>Found 3 services matching "bulk upload" in <code>src/app/features/</code>.</span>
        </div>
      </div>
      <div class="tl-step tl-succeeded">
        <div class="tl-num">3</div>
        <div class="tl-body">
          <strong>Retrieve source snippets</strong>
          <span>Fetched top-5 chunks from the retrieval index.</span>
        </div>
      </div>
      <div class="tl-step tl-succeeded">
        <div class="tl-num">4</div>
        <div class="tl-body">
          <strong>Rank sources</strong>
          <span>Re-ranked by relevance score; discarded 2 below threshold.</span>
        </div>
      </div>
      <div class="tl-step tl-succeeded">
        <div class="tl-num">5</div>
        <div class="tl-body">
          <strong>Generate answer</strong>
          <span>Synthesised a grounded response with file-path citations.</span>
        </div>
      </div>
    </div>

    <h2 id="wiring">Passing timeline to the shell</h2>
    <p>
      The SDK handles rendering automatically when <code>[useService]="true"</code>.
      For manual control, pass the array via <code>[timeline]</code>:
    </p>
    <app-docs-code-block language="typescript" [code]="wiringExample" />

    <h2 id="live-examples">Live examples</h2>
    <p>Both RetailOps PXM sample routes show tool timelines with mock step data:</p>
    <div class="doc-card-grid">
      <a routerLink="/samples/enterprise-codebase" class="doc-card">
        <strong>Codebase Copilot</strong>
        <span>4-step timeline — route analysis, service search, snippet retrieval, answer generation.</span>
      </a>
      <a routerLink="/samples/enterprise-docs" class="doc-card">
        <strong>Documentation Copilot</strong>
        <span>3-step timeline — index search, article retrieval, answer synthesis.</span>
      </a>
    </div>

    <h2 id="why-timeline">Why transparency builds trust in AI agents</h2>
    <p>
      Opaque AI answers feel like magic — and for enterprise users, magic is not trustworthy.
      The tool timeline gives users a verifiable reasoning chain: <em>exactly</em> what the agent did,
      step by step, before producing its answer:
    </p>
    <ul>
      <li>Which tools were called and in what order</li>
      <li>Whether any step failed or was skipped</li>
      <li>How long each step took</li>
      <li>A human-readable summary of what each tool found</li>
    </ul>
    <div class="callout callout-success">
      <div>
        <strong>Transparency = trust.</strong> Enterprise users are more likely to act on copilot
        recommendations when they can verify the reasoning chain themselves. The timeline makes that possible.
      </div>
    </div>
  `,
  styles: [`
    .timeline-demo {
      display: flex;
      flex-direction: column;
      gap: 0;
      margin: 1.25rem 0 1.5rem;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .tl-step {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      padding: 0.85rem 1.1rem;
      border-bottom: 1px solid var(--border);
      background: var(--bg);
    }

    .tl-step:last-child { border-bottom: none; }

    .tl-num {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.72rem;
      font-weight: 700;
      flex-shrink: 0;
      margin-top: 0.1rem;
    }

    .tl-succeeded .tl-num { background: #dcfce7; color: #166534; }
    :root[data-resolved-theme="dark"] .tl-succeeded .tl-num { background: rgba(20,83,45,0.4); color: #86efac; }

    .tl-body { display: flex; flex-direction: column; gap: 0.15rem; }
    .tl-body strong { font-size: 0.875rem; color: var(--text); }
    .tl-body span { font-size: 0.82rem; color: var(--text-muted); }
    .tl-body code { font-size: 0.78rem; background: var(--code-inline-bg); color: var(--code-inline-text); padding: 0.1rem 0.3rem; border-radius: 3px; border: none; }
  `],
})
export class ToolTimelineDocComponent {
  readonly timelineItemExample = `const step: ToolTimelineItem = {
  id: 'tl-step-1',
  toolName: 'Search documentation index',
  summary: 'Matched 4 articles for "product onboarding" with scores above 0.85.',
  status: 'succeeded',    // 'running' | 'succeeded' | 'failed' | 'skipped'
  startedAt: new Date().toISOString(),
  finishedAt: new Date().toISOString(),
};`;

  readonly wiringExample = `// Manual control via @Input()
timeline: ToolTimelineItem[] = [
  {
    id: 'tl-1',
    toolName: 'Search index',
    summary: 'Matched 5 relevant documents.',
    status: 'succeeded',
    startedAt: new Date().toISOString(),
  },
  {
    id: 'tl-2',
    toolName: 'Retrieve chunks',
    summary: 'Fetching source content...',
    status: 'running',
    startedAt: new Date().toISOString(),
  },
];

// Template
// <ngx-copilot-shell [timeline]="timeline" [useService]="false" />`;
}
