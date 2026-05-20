import { Component } from '@angular/core';
import { DocsCodeBlockComponent } from './docs-code-block.component';

const TAKE_UNTIL_SNIPPET = `// Cancel in-flight streams when the component is destroyed
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { inject, DestroyRef } from '@angular/core';

@Component({ ... })
export class MyCopilotComponent {
  private destroyRef = inject(DestroyRef);

  startStream(): void {
    this.copilotService
      .chat(this.messages)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: chunk => this.appendChunk(chunk) });
  }
}`;

const TESTING_SNIPPET = `// Unit test with MockCopilotBackendAdapter
import { MockCopilotBackendAdapter } from '@ankitparekh007/ngx-copilot-sdk';

describe('MyCopilotComponent', () => {
  let adapter: MockCopilotBackendAdapter;

  beforeEach(async () => {
    adapter = new MockCopilotBackendAdapter({
      replies: [{ content: 'Mock answer from adapter.' }],
    });

    await TestBed.configureTestingModule({
      imports: [MyCopilotComponent],
      providers: [provideCopilot({ adapter })],
    }).compileComponents();
  });

  it('renders assistant reply', async () => {
    const fixture = TestBed.createComponent(MyCopilotComponent);
    fixture.detectChanges();
    // ... assert rendered content
  });
});`;

@Component({
  selector: 'app-production-checklist-doc',
  standalone: true,
  imports: [DocsCodeBlockComponent],
  template: `
    <div class="article-header">
      <div class="header-meta">
        <span class="header-category">Production Guidance</span>
        <span class="badge badge-backend-required">Backend required</span>
      </div>
      <h1>Production Checklist</h1>
      <p class="header-desc">
        Everything you need to verify before shipping an ngx-copilot-sdk integration to production.
        Work through each section from top to bottom — each one is required, not optional.
      </p>
    </div>

    <div class="callout callout-info">
      <strong>SDK boundary reminder:</strong> ngx-copilot-sdk is a frontend-only rendering SDK.
      It renders messages, RAG citations, tool timelines, and approval gates — it does not call
      LLM providers directly. Your backend is responsible for all provider orchestration.
    </div>

    <!-- 1. API Key Safety -->
    <section id="api-key-safety" class="checklist-section">
      <h2>
        <span class="check-num">01</span>
        API Key Safety
        <span class="section-badge critical">Critical</span>
      </h2>
      <ul class="check-list">
        <li class="check-item">
          <span class="check-icon">✓</span>
          <div>
            <strong>Never put LLM API keys in the browser.</strong> All provider calls (OpenAI, Anthropic,
            Gemini, etc.) must be made from your backend. The browser should only receive streaming chunks
            from your own authenticated API endpoint.
          </div>
        </li>
        <li class="check-item">
          <span class="check-icon">✓</span>
          <div>
            Store API keys in environment variables, secrets managers (AWS Secrets Manager, Azure Key Vault,
            GCP Secret Manager), or equivalent. Never commit them to source control.
          </div>
        </li>
        <li class="check-item">
          <span class="check-icon">✓</span>
          <div>
            Rotate keys on a schedule. Treat any leaked key as compromised immediately.
          </div>
        </li>
      </ul>
    </section>

    <!-- 2. Backend-only provider calls -->
    <section id="backend-provider-calls" class="checklist-section">
      <h2>
        <span class="check-num">02</span>
        Backend-Only Provider Orchestration
        <span class="section-badge critical">Critical</span>
      </h2>
      <ul class="check-list">
        <li class="check-item">
          <span class="check-icon">✓</span>
          <div>
            Implement a <code>/api/copilot/chat</code> endpoint (or equivalent) that accepts
            <code>CopilotRequestPayload</code> from the frontend and proxies to your chosen provider.
            See the <strong>Backend Contract</strong> docs page for the full request/response shape.
          </div>
        </li>
        <li class="check-item">
          <span class="check-icon">✓</span>
          <div>
            Use <code>HttpCopilotBackendAdapter</code> pointing at your own endpoint — not directly
            at any provider URL. Validate the <code>apiBaseUrl</code> is set to your domain.
          </div>
        </li>
        <li class="check-item">
          <span class="check-icon">✓</span>
          <div>
            Rate-limit your endpoint. Apply per-user, per-tenant, and global limits to prevent abuse.
          </div>
        </li>
      </ul>
    </section>

    <!-- 3. Auth / session -->
    <section id="auth-session" class="checklist-section">
      <h2>
        <span class="check-num">03</span>
        Auth / Session Token Per Request
        <span class="section-badge critical">Critical</span>
      </h2>
      <ul class="check-list">
        <li class="check-item">
          <span class="check-icon">✓</span>
          <div>
            Pass your session token (JWT, cookie, or custom header) on every request to
            <code>/api/copilot/chat</code>. Your backend must validate it before processing.
          </div>
        </li>
        <li class="check-item">
          <span class="check-icon">✓</span>
          <div>
            Scope context to the authenticated user. Never let the copilot access data
            the current user is not authorized to see — apply the same auth checks as the rest of your API.
          </div>
        </li>
        <li class="check-item">
          <span class="check-icon">✓</span>
          <div>
            Handle 401/403 responses from the backend by resetting the copilot session and
            redirecting to login, not silently retrying.
          </div>
        </li>
      </ul>
    </section>

    <!-- 4. Request cancellation -->
    <section id="request-cancellation" class="checklist-section">
      <h2>
        <span class="check-num">04</span>
        Request Cancellation
        <span class="section-badge important">Important</span>
      </h2>
      <p class="section-desc">
        Cancel in-flight SSE streams when the user navigates away or the component is destroyed.
        Abandoned streams waste server resources and can cause memory leaks in the browser.
      </p>
      <app-docs-code-block language="typescript" [code]="takeUntilSnippet" />
      <ul class="check-list">
        <li class="check-item">
          <span class="check-icon">✓</span>
          <div>Use <code>takeUntilDestroyed(destroyRef)</code> or <code>takeUntil(destroy$)</code> on all stream subscriptions.</div>
        </li>
        <li class="check-item">
          <span class="check-icon">✓</span>
          <div>Your backend should support client-side abort (via <code>AbortController</code> / <code>HTTP/2 RST_STREAM</code>) to stop provider calls mid-stream.</div>
        </li>
      </ul>
    </section>

    <!-- 5. Retries and timeouts -->
    <section id="retries-timeouts" class="checklist-section">
      <h2>
        <span class="check-num">05</span>
        Retries and Timeouts
        <span class="section-badge important">Important</span>
      </h2>
      <ul class="check-list">
        <li class="check-item">
          <span class="check-icon">✓</span>
          <div>Set a request timeout for streaming responses. A reasonable default is 60 seconds for the first chunk and 30 seconds between chunks. Propagate timeout errors to the UI as a clearly recoverable error state.</div>
        </li>
        <li class="check-item">
          <span class="check-icon">✓</span>
          <div>Apply exponential backoff for transient 5xx errors. Do not retry on 4xx errors (those require user action).</div>
        </li>
        <li class="check-item">
          <span class="check-icon">✓</span>
          <div>Limit retries to 3 attempts maximum. Present a "Try again" action in the UI after exhausting retries.</div>
        </li>
      </ul>
    </section>

    <!-- 6. RAG quality -->
    <section id="rag-quality" class="checklist-section">
      <h2>
        <span class="check-num">06</span>
        RAG Citation Quality
        <span class="section-badge recommended">Recommended</span>
      </h2>
      <ul class="check-list">
        <li class="check-item">
          <span class="check-icon">✓</span>
          <div>Apply a minimum relevance score threshold (e.g., 0.75) before including a source in <code>RagResult[]</code>. Low-quality citations erode user trust more than no citations.</div>
        </li>
        <li class="check-item">
          <span class="check-icon">✓</span>
          <div>Tune chunk sizes for your content type — 512–1024 tokens works well for dense technical docs, 256–512 for FAQs.</div>
        </li>
        <li class="check-item">
          <span class="check-icon">✓</span>
          <div>Cap sources at 5–8 per response. Surfacing 20 low-quality citations is worse than 3 high-quality ones.</div>
        </li>
        <li class="check-item">
          <span class="check-icon">✓</span>
          <div>Provide meaningful <code>snippet</code> text in each <code>RagResult</code> — the SDK renders it in the source card.</div>
        </li>
      </ul>
    </section>

    <!-- 7. Approval gating -->
    <section id="approval-gating" class="checklist-section">
      <h2>
        <span class="check-num">07</span>
        Approval Gating for Destructive Actions
        <span class="section-badge critical">Critical</span>
      </h2>
      <ul class="check-list">
        <li class="check-item">
          <span class="check-icon">✓</span>
          <div>
            Always emit an <code>ApprovalRequest</code> before executing any write, delete, send, or external-side-effect action.
            Never execute destructive actions based solely on model output without human confirmation.
          </div>
        </li>
        <li class="check-item">
          <span class="check-icon">✓</span>
          <div>Use <code>tone: 'destructive'</code> for irreversible actions (delete, purge, publish-all). Use <code>tone: 'caution'</code> for large write operations. Use <code>tone: 'info'</code> for read-only confirmations.</div>
        </li>
        <li class="check-item">
          <span class="check-icon">✓</span>
          <div>Your backend must honor the approval decision — re-verify the user's authorization server-side, do not trust the client-side approval flag alone.</div>
        </li>
      </ul>
    </section>

    <!-- 8. Audit logging -->
    <section id="audit-logging" class="checklist-section">
      <h2>
        <span class="check-num">08</span>
        Audit Logging
        <span class="section-badge critical">Critical</span>
      </h2>
      <ul class="check-list">
        <li class="check-item">
          <span class="check-icon">✓</span>
          <div>Log every approved agentic action server-side: user ID, tenant ID, action type, parameters, timestamp, and outcome.</div>
        </li>
        <li class="check-item">
          <span class="check-icon">✓</span>
          <div>Retain audit logs according to your compliance requirements (SOC 2: 1 year minimum, GDPR: evaluate per data type, HIPAA: 6 years).</div>
        </li>
        <li class="check-item">
          <span class="check-icon">✓</span>
          <div>Make audit logs searchable by user, action type, and date range. Ops teams need this for incident investigation.</div>
        </li>
      </ul>
    </section>

    <!-- 9. Accessibility -->
    <section id="accessibility" class="checklist-section">
      <h2>
        <span class="check-num">09</span>
        Accessibility
        <span class="section-badge important">Important</span>
      </h2>
      <ul class="check-list">
        <li class="check-item">
          <span class="check-icon">✓</span>
          <div>Verify the copilot shell has an accessible name via <code>aria-label</code> on the shell host or dialog wrapper.</div>
        </li>
        <li class="check-item">
          <span class="check-icon">✓</span>
          <div>Ensure streaming messages are announced to screen readers — use <code>aria-live="polite"</code> on the message list container.</div>
        </li>
        <li class="check-item">
          <span class="check-icon">✓</span>
          <div>Test keyboard navigation: Tab to reach the composer, Enter to send, Escape to close modal approvals.</div>
        </li>
        <li class="check-item">
          <span class="check-icon">✓</span>
          <div>Verify sufficient color contrast for all status badges and timeline indicators in both light and dark themes.</div>
        </li>
      </ul>
    </section>

    <!-- 10. Test strategy -->
    <section id="test-strategy" class="checklist-section">
      <h2>
        <span class="check-num">10</span>
        Test Strategy
        <span class="section-badge important">Important</span>
      </h2>
      <p class="section-desc">Use <code>MockCopilotBackendAdapter</code> to test components without real backend calls:</p>
      <app-docs-code-block language="typescript" [code]="testingSnippet" />
      <ul class="check-list">
        <li class="check-item">
          <span class="check-icon">✓</span>
          <div>Unit-test each copilot-connected component with <code>MockCopilotBackendAdapter</code>. Cover: empty state, loading state, assistant reply, RAG sources rendering, timeline rendering, approval gate rendering, error state.</div>
        </li>
        <li class="check-item">
          <span class="check-icon">✓</span>
          <div>Integration-test your adapter + backend contract with a staging environment that mirrors production provider behavior.</div>
        </li>
        <li class="check-item">
          <span class="check-icon">✓</span>
          <div>Add a smoke test that starts the app and sends one message — catches critical regressions before deployment.</div>
        </li>
      </ul>
    </section>

    <!-- 11. Versioning -->
    <section id="versioning" class="checklist-section">
      <h2>
        <span class="check-num">11</span>
        SDK Versioning
        <span class="section-badge recommended">Recommended</span>
      </h2>
      <ul class="check-list">
        <li class="check-item">
          <span class="check-icon">✓</span>
          <div>Pin the SDK version in <code>package.json</code> (no <code>^</code> or <code>~</code> for production). Unexpected minor version bumps can change rendering or behavior.</div>
        </li>
        <li class="check-item">
          <span class="check-icon">✓</span>
          <div>Read the CHANGELOG before upgrading. The SDK is in preview — expect breaking changes between minor versions until 1.0.</div>
        </li>
        <li class="check-item">
          <span class="check-icon">✓</span>
          <div>After upgrading, re-run your full test suite and visually verify all copilot surfaces in staging before promoting to production.</div>
        </li>
      </ul>
    </section>

    <div class="callout callout-success">
      <strong>Done?</strong> If all 11 sections are checked, your integration meets the baseline production
      requirements. Consider also reviewing the <strong>Backend Contract</strong> page to verify your
      SSE event shapes match the SDK's expected format.
    </div>
  `,
  styles: [`
    :host { display: block; }
    .article-header { margin-bottom: 2rem; }
    .header-meta { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.6rem; }
    .header-category { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--text-subtle, #64748b); }
    .badge { font-size: 0.68rem; padding: 0.18rem 0.5rem; border-radius: 999px; font-weight: 700; }
    .badge-backend-required { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
    h1 { font-size: 1.75rem; font-weight: 800; color: var(--text, #0f172a); margin: 0 0 0.65rem; letter-spacing: -0.025em; }
    .header-desc { margin: 0; font-size: 1rem; color: var(--text-subtle, #475569); line-height: 1.65; max-width: 680px; }

    .callout {
      border-radius: 0.65rem;
      padding: 0.85rem 1rem;
      margin: 1.5rem 0;
      font-size: 0.9rem;
      line-height: 1.6;
    }
    .callout-info { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; }
    .callout-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }

    .checklist-section {
      margin-bottom: 2.5rem;
      padding-top: 0.5rem;
    }
    .checklist-section h2 {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text, #0f172a);
      margin: 0 0 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border, #e2e8f0);
    }
    .check-num {
      font-size: 0.75rem;
      font-weight: 800;
      font-family: monospace;
      color: var(--text-subtle, #94a3b8);
      background: var(--bg-muted, #f1f5f9);
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
    }
    .section-badge {
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.15rem 0.45rem;
      border-radius: 999px;
      margin-left: auto;
    }
    .section-badge.critical { background: #fee2e2; color: #991b1b; }
    .section-badge.important { background: #fef3c7; color: #92400e; }
    .section-badge.recommended { background: #dbeafe; color: #1e40af; }

    .section-desc { margin: 0 0 0.75rem; font-size: 0.9rem; color: var(--text-subtle, #475569); }

    .check-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.6rem; }
    .check-item {
      display: flex;
      gap: 0.65rem;
      align-items: flex-start;
      font-size: 0.88rem;
      color: var(--text, #374151);
      line-height: 1.6;
    }
    .check-icon {
      flex-shrink: 0;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #dcfce7;
      color: #166534;
      font-size: 0.65rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 0.1rem;
    }
    code {
      font-family: 'Fira Code', monospace;
      font-size: 0.84em;
      background: var(--bg-muted, #f1f5f9);
      padding: 0.1rem 0.3rem;
      border-radius: 4px;
    }
    :root[data-resolved-theme="dark"] .callout-info { background: rgba(30,58,138,0.2); border-color: rgba(30,58,138,0.4); color: #93c5fd; }
    :root[data-resolved-theme="dark"] .callout-success { background: rgba(20,83,45,0.2); border-color: rgba(20,83,45,0.4); color: #86efac; }
    :root[data-resolved-theme="dark"] .check-num { background: #1e293b; }
    :root[data-resolved-theme="dark"] .check-icon { background: rgba(20,83,45,0.3); color: #86efac; }
    :root[data-resolved-theme="dark"] code { background: #1e293b; }
  `],
})
export class ProductionChecklistDocComponent {
  readonly takeUntilSnippet = TAKE_UNTIL_SNIPPET;
  readonly testingSnippet = TESTING_SNIPPET;
}
