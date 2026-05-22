import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocsCodeBlockComponent } from './docs-code-block.component';

@Component({
  selector: 'app-docs-home',
  standalone: true,
  imports: [RouterLink, DocsCodeBlockComponent],
  template: `
    <div class="article-header">
      <div class="header-meta">
        <span class="header-category">Getting Started</span>
        <span class="badge badge-preview">0.1.0 Preview</span>
      </div>
      <h1>ngx-copilot-sdk</h1>
      <p class="header-desc">
        Production-ready Angular components for embedding agentic AI copilots — streaming chat,
        grounded RAG citations, multi-step tool timelines, and human-in-the-loop approval gates —
        all without exposing provider credentials to the browser.
      </p>
    </div>

    <!-- Quick install -->
    <div class="quick-install-card">
      <span class="qi-label">Install</span>
      <app-docs-code-block language="bash" [code]="installCmd" />
      <p class="qi-note">Requires Angular ^20.0.0 and RxJS ^7.8.0</p>
    </div>

    <!-- SDK stats row -->
    <div class="sdk-stats">
      <div class="stat-item">
        <span class="stat-value">Angular 20</span>
        <span class="stat-label">Required</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">Zero API Keys</span>
        <span class="stat-label">Mock adapter</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">SSE Streaming</span>
        <span class="stat-label">Token-by-token</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">MIT</span>
        <span class="stat-label">Open Source</span>
      </div>
    </div>

    <h2 id="what-is">What is ngx-copilot-sdk?</h2>
    <p>
      <code>&#64;ankitparekh007/ngx-copilot-sdk</code> is a standalone Angular library that provides a
      production-ready agentic copilot UI layer. You wire in your backend; the SDK handles
      streaming token delivery, grounded RAG source citation cards, multi-step tool-call
      visualisation, and human-in-the-loop approval gates — all driven by reactive Angular Signals.
    </p>
    <p>
      The adapter pattern enforces a clean security boundary: your LLM provider credentials live
      on the server. The browser only sees a typed <code>Observable&lt;CopilotEvent&gt;</code>
      stream from your own authenticated API — never a raw provider response.
    </p>

    <h2 id="features">What's included</h2>
    <div class="doc-card-grid included-grid">
      <a routerLink="/docs/getting-started" class="doc-card">
        <strong>Copilot Shell</strong>
        <span>Full streaming chat UI with token-by-token delivery, mode selector (ask / plan / execute / debug), and a message composer — all driven by Angular Signals.</span>
      </a>
      <a routerLink="/docs/rag-sources" class="doc-card">
        <strong>Grounded RAG Citations</strong>
        <span>Citation cards that show the exact file paths and documentation URLs the model grounded its answer in — giving users verifiable provenance.</span>
      </a>
      <a routerLink="/docs/tool-timeline" class="doc-card">
        <strong>Agent Tool Timeline</strong>
        <span>Real-time step-by-step trace of multi-tool agentic operations — each step shows name, status, summary, and timing as events arrive.</span>
      </a>
      <a routerLink="/docs/approvals" class="doc-card">
        <strong>Human-in-the-Loop Gates</strong>
        <span>Approval cards that pause execution and require explicit user confirmation before any destructive or irreversible agentic action proceeds.</span>
      </a>
      <a routerLink="/docs/adapters" class="doc-card">
        <strong>Security Adapter Boundary</strong>
        <span>Observable-based interface that keeps LLM provider credentials on your server. The browser only sees a typed event stream from your own API.</span>
      </a>
      <a routerLink="/docs/adapters" class="doc-card">
        <strong>Zero-Credential Mock Adapter</strong>
        <span>Simulate streaming, RAG source injection, tool timeline steps, and approval gates entirely in the browser — no backend, no API keys needed.</span>
      </a>
    </div>

    <h2 id="choose-path">Start here</h2>
    <div class="path-grid">
      <a routerLink="/docs/getting-started" class="path-card">
        <span class="path-icon">01</span>
        <strong>Embed a copilot in 5 minutes</strong>
        <span>Install, call <code>provideCopilot()</code>, add <code>&lt;ngx-copilot-shell&gt;</code>, wire the mock adapter — no backend needed.</span>
      </a>
      <a routerLink="/docs/rag-sources" class="path-card">
        <span class="path-icon">02</span>
        <strong>Ground answers in your content</strong>
        <span>Surface verifiable file-path and documentation citations using the <code>RagResult</code> model.</span>
      </a>
      <a routerLink="/docs/tool-timeline" class="path-card">
        <span class="path-icon">03</span>
        <strong>Make agent reasoning transparent</strong>
        <span>Show users every tool call, status, and timing the AI took to reach its answer.</span>
      </a>
      <a routerLink="/docs/approvals" class="path-card">
        <span class="path-icon">04</span>
        <strong>Require human sign-off on actions</strong>
        <span>Gate irreversible agentic operations behind explicit user-confirmation cards.</span>
      </a>
      <a routerLink="/docs/adapters" class="path-card">
        <span class="path-icon">05</span>
        <strong>Connect your production backend</strong>
        <span>Implement <code>CopilotBackendAdapter</code> to stream events from your own authenticated API.</span>
      </a>
      <a routerLink="/docs/api" class="path-card">
        <span class="path-icon">06</span>
        <strong>Full API reference</strong>
        <span>Every exported interface, component input, output, Signal, and service method.</span>
      </a>
    </div>

    <h2 id="preview-status">Preview status</h2>
    <div class="callout callout-warning">
      <div>
        <strong>0.1.0 preview —</strong> APIs are stabilising but may change before 1.0.
        UI components, backend adapters, and <code>CopilotService</code> are marked <em>Preview</em>.
        Core config helpers (<code>provideCopilot</code>, model interfaces) target stable-intent.
        Pin the version in production: <code>"&#64;ankitparekh007/ngx-copilot-sdk": "0.1.0"</code>.
      </div>
    </div>

    <h2 id="how-it-works">How it works</h2>
    <p>
      The SDK sits between your Angular application and your backend. It never talks to LLM providers
      directly — your server holds credentials and orchestrates AI provider calls. The browser only sees
      a typed event stream from your own API.
    </p>
    <div class="flow-diagram">
      <div class="flow-step flow-step-browser">
        <div class="flow-step-label">Your Angular app</div>
        <div class="flow-step-body">
          <div class="flow-line"><code>provideCopilot()</code></div>
          <div class="flow-line"><code>&lt;ngx-copilot-shell&gt;</code></div>
          <div class="flow-line flow-dim">RAG cards · Timeline · Gates</div>
        </div>
      </div>
      <div class="flow-arrow">
        <span class="flow-arrow-label">CopilotBackendAdapter</span>
        <span class="flow-arrow-sub">Observable&lt;CopilotEvent&gt;</span>
      </div>
      <div class="flow-step flow-step-server">
        <div class="flow-step-label">Your backend</div>
        <div class="flow-step-body">
          <div class="flow-line"><code>POST /api/copilot/chat</code></div>
          <div class="flow-line flow-dim">Auth · RAG retrieval · SSE stream</div>
          <div class="flow-line flow-dim">Provider credentials (secret)</div>
        </div>
      </div>
      <div class="flow-arrow">
        <span class="flow-arrow-label">API key (never in browser)</span>
      </div>
      <div class="flow-step flow-step-provider">
        <div class="flow-step-label">LLM Provider</div>
        <div class="flow-step-body">
          <div class="flow-line flow-dim">OpenAI · Anthropic</div>
          <div class="flow-line flow-dim">Gemini · Cohere · ...</div>
        </div>
      </div>
    </div>

    <!-- GitHub CTA -->
    <div class="github-cta">
      <div class="cta-content">
        <strong>Open source &middot; MIT License</strong>
        <span>Built in the open. PRs welcome. Star the repo if it helps you.</span>
      </div>
      <div class="cta-actions">
        <a href="https://github.com/AnkitParekh007/ngx-copilot-platform" target="_blank" rel="noopener noreferrer" class="cta-star">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          Star on GitHub
        </a>
        <a href="https://github.com/AnkitParekh007/ngx-copilot-platform/fork" target="_blank" rel="noopener noreferrer" class="cta-fork">Fork</a>
      </div>
    </div>

    <h2 id="retailops-demo">Live enterprise demo — RetailOps PXM</h2>
    <p>
      See every SDK feature working together in a realistic enterprise context. The <strong>RetailOps PXM</strong>
      fictional demo covers a 12-state SKU lifecycle, bulk upload, channel syndication, and a destructive
      approval workflow — all running in the browser with zero real API calls or credentials.
    </p>
    <div class="doc-card-grid demo-grid">
      <a routerLink="/samples/enterprise-codebase" class="doc-card">
        <strong>Codebase Copilot</strong>
        <span>Ask questions about Angular architecture. Answers are grounded in file-path citations from <code>retailops-pxm-web</code> — services, guards, components, and models.</span>
      </a>
      <a routerLink="/samples/enterprise-docs" class="doc-card">
        <strong>Documentation Copilot</strong>
        <span>Ask product and process questions. Answers cite article URLs from <code>docs.retailops-pxm.example</code> — onboarding, syndication, QA, and approval workflows.</span>
      </a>
    </div>
  `,
  styles: [`
    .quick-install-card {
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.1rem 1.35rem 0.75rem;
      margin-bottom: 2rem;
    }

    .qi-label {
      font-size: 0.76rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-subtle);
      display: block;
      margin-bottom: 0.4rem;
    }

    .qi-note {
      font-size: 0.88rem;
      color: var(--text-subtle);
      margin: 0.25rem 0 0;
    }

    /* SDK stats row */
    .sdk-stats {
      display: flex;
      gap: 0;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      margin-bottom: 2.5rem;
    }

    .stat-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.85rem 0.75rem;
      border-right: 1px solid var(--border);
      text-align: center;
      background: var(--bg-subtle);
    }

    .stat-item:last-child { border-right: none; }

    .stat-value {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--accent);
      font-family: monospace;
    }

    .stat-label {
      font-size: 0.78rem;
      color: var(--text-subtle);
      margin-top: 0.15rem;
    }

    /* GitHub CTA */
    .github-cta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1.1rem 1.35rem;
      border-radius: var(--radius-lg);
      border: 1px solid rgba(99,102,241,0.3);
      background: var(--bg-subtle);
      margin: 2rem 0;
      flex-wrap: wrap;
      position: relative;
      overflow: hidden;
    }

    .github-cta::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: var(--radius-lg);
      background: linear-gradient(135deg, rgba(79,70,229,0.06) 0%, rgba(124,58,237,0.06) 100%);
      pointer-events: none;
    }

    .cta-content {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .cta-content strong {
      font-size: 0.925rem;
      color: var(--text);
    }

    .cta-content span {
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .cta-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .cta-star {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.92rem;
      font-weight: 600;
      color: #fff;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      padding: 0.45rem 1rem;
      border-radius: 6px;
      text-decoration: none;
      transition: opacity 0.15s, transform 0.1s;
      white-space: nowrap;
    }

    .cta-star:hover {
      opacity: 0.9;
      transform: translateY(-1px);
      text-decoration: none;
      color: #fff;
    }

    .cta-fork {
      font-size: 0.92rem;
      font-weight: 600;
      color: var(--accent-text);
      background: var(--accent-light);
      border: 1px solid rgba(99,102,241,0.3);
      padding: 0.45rem 0.85rem;
      border-radius: 6px;
      text-decoration: none;
      transition: background 0.15s, border-color 0.15s, transform 0.1s;
      white-space: nowrap;
    }

    .cta-fork:hover {
      background: rgba(99,102,241,0.2);
      border-color: rgba(99,102,241,0.5);
      transform: translateY(-1px);
      text-decoration: none;
    }

    @media (max-width: 600px) {
      .sdk-stats { flex-wrap: wrap; }
      .stat-item { flex: 1 1 45%; border-bottom: 1px solid var(--border); }
      .github-cta { flex-direction: column; align-items: flex-start; }
    }

    .path-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 0.75rem;
      margin: 1.25rem 0 2rem;
    }

    .included-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .demo-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-items: stretch;
    }

    .demo-grid .doc-card {
      height: 100%;
      align-content: start;
    }

    .path-card {
      display: grid;
      gap: 0.3rem;
      padding: 1rem 1.1rem;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      background: var(--bg);
      text-decoration: none;
      color: inherit;
      transition: border-color 0.15s, box-shadow 0.15s, transform 0.1s;
    }

    .path-card:hover {
      border-color: var(--accent);
      box-shadow: var(--shadow-sm);
      transform: translateY(-1px);
      text-decoration: none;
    }

    .path-icon {
      font-size: 0.78rem;
      font-weight: 800;
      color: var(--accent);
      letter-spacing: 0.04em;
      font-family: monospace;
    }

    .path-card strong { font-size: 0.9rem; color: var(--text); }
    .path-card span { font-size: 0.9rem; color: var(--text-muted); line-height: 1.55; }
    .path-card code { font-size: 0.84rem; background: var(--code-inline-bg); color: var(--code-inline-text); padding: 0.1rem 0.3rem; border-radius: 3px; }

    .flow-diagram {
      display: flex;
      align-items: center;
      flex-wrap: nowrap;
      gap: 0;
      padding: 1.25rem 1.5rem;
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      margin: 1.25rem 0 2rem;
      overflow-x: auto;
    }

    .flow-step {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      min-width: 0;
      flex: 1 1 0;
    }

    .flow-step-label {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: var(--text-subtle);
      margin-bottom: 0.25rem;
    }

    .flow-step-body {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
      border: 1.5px solid var(--border);
      background: var(--bg);
    }

    .flow-step-browser .flow-step-body { border-color: var(--accent); }
    .flow-step-server  .flow-step-body { border-color: var(--border-strong); }
    .flow-step-provider .flow-step-body { border-color: var(--border); opacity: 0.75; }

    .flow-line {
      font-size: 0.88rem;
      font-family: monospace;
      color: var(--text);
    }
    .flow-line.flow-dim { color: var(--text-muted); font-size: 0.82rem; }

    .flow-arrow {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.15rem;
      padding: 0 0.75rem;
      min-width: 96px;
      flex: 0 0 96px;
      padding-top: 1.5rem;
    }

    .flow-arrow::before {
      content: '';
      display: block;
      width: 100%;
      height: 1.5px;
      background: var(--border-strong);
      margin-bottom: 0.3rem;
    }

    .flow-arrow-label {
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--text-subtle);
      white-space: nowrap;
      text-align: center;
    }

    .flow-arrow-sub {
      font-size: 0.68rem;
      color: var(--text-subtle);
      font-family: monospace;
      white-space: nowrap;
    }

    @media (max-width: 1100px) {
      .included-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    @media (max-width: 900px) {
      .flow-diagram { flex-wrap: wrap; }
      .flow-step { min-width: 220px; flex: 1 1 220px; }
      .flow-arrow { flex: 1 1 100%; min-width: 0; }
    }

    @media (max-width: 700px) {
      .included-grid,
      .demo-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class DocsHomeComponent {
  readonly installCmd = `npm install @ankitparekh007/ngx-copilot-sdk`;
}
