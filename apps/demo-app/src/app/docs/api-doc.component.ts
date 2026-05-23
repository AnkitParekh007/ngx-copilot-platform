import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocsCodeBlockComponent } from './docs-code-block.component';

@Component({
  selector: 'app-api-doc',
  standalone: true,
  imports: [RouterLink, DocsCodeBlockComponent],
  template: `
    <div class="article-header">
      <div class="header-meta">
        <span class="header-category">API Reference</span>
        <span class="badge badge-preview">Preview</span>
      </div>
      <h1>API Reference</h1>
      <p class="header-desc">
        All exported symbols from <code>&#64;ankit-parekh-007/ngx-copilot-sdk</code>:
        provider factories, components, services, and model interfaces.
      </p>
    </div>

    <div class="callout callout-info">
      <div>
        <strong>Stability labels:</strong>
        <span class="badge badge-stable">Stable intent</span> — contract unlikely to change before 1.0.
        <span class="badge badge-preview">Preview</span> — may change based on feedback.
      </div>
    </div>

    <!-- provideCopilot -->
    <h2 id="provide-copilot">provideCopilot(config)</h2>
    <p>
      <span class="badge badge-stable">Stable intent</span>
    </p>
    <p>
      Angular provider factory. Call once in <code>appConfig.providers</code>. Registers the
      backend adapter, <code>CopilotService</code>, and all config injection tokens.
    </p>
    <app-docs-code-block language="typescript" [code]="provideCopilotSig" />
    <table>
      <thead><tr><th>Option</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><code>apiBaseUrl</code></td><td><code>string</code></td><td>—</td><td>Required. Base URL of your copilot backend.</td></tr>
        <tr><td><code>defaultMode</code></td><td><code>CopilotMode</code></td><td><code>'ask'</code></td><td>Initial mode shown in the mode selector.</td></tr>
        <tr><td><code>enableRagSources</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Render RAG citation cards alongside messages.</td></tr>
        <tr><td><code>enableToolTimeline</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Render the tool call step timeline panel.</td></tr>
        <tr><td><code>enableApprovals</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Enable approval gate cards.</td></tr>
        <tr><td><code>adapterOverride</code></td><td><code>Type&lt;CopilotBackendAdapter&gt;</code></td><td>—</td><td>Replace the HTTP adapter (e.g. with MockCopilotBackendAdapter).</td></tr>
      </tbody>
    </table>

    <!-- CopilotShellComponent -->
    <h2 id="copilot-shell">CopilotShellComponent</h2>
    <p>
      <span class="badge badge-preview">Preview</span>
    </p>
    <p>
      All-in-one copilot UI: streaming chat, RAG cards, tool timeline, approval gates, and mode
      selector. Selector: <code>ngx-copilot-shell</code>.
    </p>
    <app-docs-code-block language="typescript" [code]="shellInputs" />

    <!-- CopilotService -->
    <h2 id="copilot-service">CopilotService</h2>
    <p>
      <span class="badge badge-preview">Preview</span>
    </p>
    <p>
      Injectable service that drives the shell when <code>[useService]="true"</code>.
      Manages messages, streaming state, sources, timeline, and approvals as reactive signals.
      Provided by <code>provideCopilot()</code> — do not instantiate directly.
    </p>
    <table>
      <thead><tr><th>Signal / method</th><th>Type</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><code>messages</code></td><td><code>Signal&lt;CopilotMessage[]&gt;</code></td><td>All chat messages in the session.</td></tr>
        <tr><td><code>isStreaming</code></td><td><code>Signal&lt;boolean&gt;</code></td><td>True while a streaming response is in-flight.</td></tr>
        <tr><td><code>sources</code></td><td><code>Signal&lt;RagResult[]&gt;</code></td><td>RAG citation results for the last response.</td></tr>
        <tr><td><code>timeline</code></td><td><code>Signal&lt;ToolTimelineItem[]&gt;</code></td><td>Tool step sequence for the last response.</td></tr>
        <tr><td><code>approval</code></td><td><code>Signal&lt;ApprovalRequest | undefined&gt;</code></td><td>Pending approval gate, if any.</td></tr>
        <tr><td><code>send(message)</code></td><td><code>(string) =&gt; void</code></td><td>Submit a user message.</td></tr>
        <tr><td><code>reset()</code></td><td><code>() =&gt; void</code></td><td>Clear the session.</td></tr>
      </tbody>
    </table>

    <!-- CopilotBackendAdapter -->
    <h2 id="backend-adapter">CopilotBackendAdapter</h2>
    <p>
      <span class="badge badge-stable">Stable intent</span>
    </p>
    <p>Interface your backend adapter must satisfy. See <a routerLink="/docs/adapters">Backend Adapters</a> for full implementation guide.</p>
    <app-docs-code-block language="typescript" [code]="adapterInterface" />

    <!-- RagResult -->
    <h2 id="rag-result">RagResult</h2>
    <p>
      Represents a single retrieved source chunk. Rendered as a citation card below the assistant message.
    </p>
    <app-docs-code-block language="typescript" [code]="ragResultInterface" />

    <!-- ToolTimelineItem -->
    <h2 id="tool-timeline-item">ToolTimelineItem</h2>
    <app-docs-code-block language="typescript" [code]="timelineInterface" />

    <!-- ApprovalRequest -->
    <h2 id="approval-models">ApprovalRequest &amp; ApprovalDecision</h2>
    <app-docs-code-block language="typescript" [code]="approvalInterfaces" />

    <!-- CopilotMode -->
    <h2 id="copilot-mode">CopilotMode</h2>
    <app-docs-code-block language="typescript" [code]="copilotMode" />

    <!-- CopilotContext -->
    <h2 id="copilot-context">CopilotContext</h2>
    <p>
      Contextual metadata passed from your Angular page to the backend with every request.
      Enables context-aware copilot responses scoped to the current view.
    </p>
    <app-docs-code-block language="typescript" [code]="copilotContext" />
  `,
})
export class ApiDocComponent {
  readonly provideCopilotSig = `provideCopilot(config: CopilotConfig): EnvironmentProviders`;

  readonly shellInputs = `// Inputs
@Input() title?: string
@Input() subtitle?: string
@Input() statusLabel?: string
@Input() context?: CopilotContext
@Input() messages: CopilotMessage[] = []
@Input() sources: RagResult[] = []
@Input() timeline: ToolTimelineItem[] = []
@Input() approval?: ApprovalRequest
@Input() useService: boolean = false
@Input() modes: CopilotMode[] = ['ask', 'plan', 'execute', 'debug']
@Input() activeMode: CopilotMode = 'ask'

// Outputs
@Output() messageSent: EventEmitter<string>
@Output() sessionReset: EventEmitter<void>
@Output() modeChange: EventEmitter<CopilotMode>
@Output() approvalDecision: EventEmitter<ApprovalDecision>`;

  readonly adapterInterface = `interface CopilotBackendAdapter {
  send(payload: CopilotRequestPayload): Observable<CopilotEvent>;
}`;

  readonly ragResultInterface = `interface RagResult {
  id: string;
  title: string;
  snippet: string;
  score: number;               // 0–1 relevance score
  sourceType: string;          // 'angular-service' | 'documentation' | ...
  sourceUrl?: string;          // documentation URL citation
  filePath?: string;           // codebase file-path citation
  fileKind?: string;           // 'component' | 'service' | 'model' | 'guard' | ...
  repo?: string;
  branch?: string;
  chunkId?: string;
  tags?: string[];
}`;

  readonly timelineInterface = `interface ToolTimelineItem {
  id: string;
  toolName: string;
  summary: string;
  status: 'running' | 'succeeded' | 'failed' | 'skipped';
  startedAt: string;           // ISO 8601
  finishedAt?: string;         // ISO 8601
}`;

  readonly approvalInterfaces = `interface ApprovalRequest {
  id: string;
  title: string;
  description: string;
  tone: 'neutral' | 'warning' | 'destructive';
  requestedAt: string;         // ISO 8601
}

interface ApprovalDecision {
  requestId: string;
  approved: boolean;
  decidedAt: string;           // ISO 8601
}`;

  readonly copilotMode = `type CopilotMode = 'ask' | 'plan' | 'execute' | 'debug';`;

  readonly copilotContext = `interface CopilotContext {
  route?: string;              // current Angular route path
  title?: string;              // page / record title
  userRole?: string;           // RBAC role for context-aware answers
  tenantId?: string;
  selectedRecordId?: string;
  visibleFields?: string[];    // fields visible to the user in this view
  metadata?: Record<string, unknown>;
}`;
}
