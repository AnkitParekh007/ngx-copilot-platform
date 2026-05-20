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
        An Angular SDK for embedding AI copilot shells, RAG citation cards, tool timelines,
        and approval workflows into enterprise applications — without putting provider secrets in the browser.
      </p>
    </div>

    <!-- Quick install -->
    <div class="quick-install-card">
      <span class="qi-label">Install</span>
      <app-docs-code-block language="bash" [code]="installCmd" />
      <p class="qi-note">Requires Angular ^20.0.0 and RxJS ^7.8.0</p>
    </div>

    <h2 id="what-is">What is ngx-copilot-sdk?</h2>
    <p>
      <code>&#64;ankitparekh007/ngx-copilot-sdk</code> is a standalone Angular library that gives you a
      production-ready copilot UI layer. You supply the backend; the SDK handles
      streaming chat, RAG source cards, tool-step visualisation, and user-gated approval flows.
    </p>
    <p>
      The adapter pattern keeps your LLM provider credentials on the server — the browser only
      sees an <code>Observable&lt;CopilotEvent&gt;</code> stream from your own API.
    </p>

    <h2 id="features">What's included</h2>
    <div class="doc-card-grid">
      <a routerLink="/docs/getting-started" class="doc-card">
        <strong>Copilot Shell</strong>
        <span>Full chat UI with streaming, mode selector (ask / plan / execute / debug), and composer.</span>
      </a>
      <a routerLink="/docs/rag-sources" class="doc-card">
        <strong>RAG Source Cards</strong>
        <span>Citation cards for file-path references (codebase) and documentation URLs.</span>
      </a>
      <a routerLink="/docs/tool-timeline" class="doc-card">
        <strong>Tool Timeline</strong>
        <span>Step-by-step visualisation of multi-tool agent operations with status and timing.</span>
      </a>
      <a routerLink="/docs/approvals" class="doc-card">
        <strong>Approval Gates</strong>
        <span>User-gated confirmation cards — neutral, warning, or destructive tone.</span>
      </a>
      <a routerLink="/docs/adapters" class="doc-card">
        <strong>Adapter Boundary</strong>
        <span>Clean Observable interface between UI and your backend. Secrets never reach the browser.</span>
      </a>
      <a routerLink="/docs/adapters" class="doc-card">
        <strong>Mock Adapter</strong>
        <span>Simulate streaming, RAG, timeline, and approvals locally — no API keys needed.</span>
      </a>
    </div>

    <h2 id="choose-path">Choose your path</h2>
    <div class="path-grid">
      <a routerLink="/docs/getting-started" class="path-card">
        <span class="path-icon">01</span>
        <strong>I want to embed a copilot shell</strong>
        <span>Install the SDK, call <code>provideCopilot()</code>, add <code>&lt;ngx-copilot-shell&gt;</code>.</span>
      </a>
      <a routerLink="/docs/rag-sources" class="path-card">
        <span class="path-icon">02</span>
        <strong>I want to show RAG citations</strong>
        <span>Learn the <code>RagResult</code> model and how source cards render.</span>
      </a>
      <a routerLink="/docs/tool-timeline" class="path-card">
        <span class="path-icon">03</span>
        <strong>I want to visualize agent tool steps</strong>
        <span>Understand <code>ToolTimelineItem</code> and the timeline panel.</span>
      </a>
      <a routerLink="/docs/approvals" class="path-card">
        <span class="path-icon">04</span>
        <strong>I want approval workflows</strong>
        <span>Gate destructive actions behind user-confirmed approval cards.</span>
      </a>
      <a routerLink="/docs/adapters" class="path-card">
        <span class="path-icon">05</span>
        <strong>I want to connect a real backend</strong>
        <span>Implement <code>CopilotBackendAdapter</code> and wire up your streaming endpoint.</span>
      </a>
      <a routerLink="/docs/api" class="path-card">
        <span class="path-icon">06</span>
        <strong>I need the full API reference</strong>
        <span>All exported interfaces, inputs, outputs, and service APIs.</span>
      </a>
    </div>

    <h2 id="preview-status">Preview status</h2>
    <div class="callout callout-warning">
      <div>
        <strong>0.1.0 preview:</strong> APIs are stabilising but may change before 1.0.
        UI components, backend adapters, and <code>CopilotService</code> are marked <em>Preview</em>.
        Core config helpers (<code>provideCopilot</code>, model interfaces) target stable-intent.
        Do not use in production without pinning the version.
      </div>
    </div>

    <h2 id="screenshots">Screenshots to add before launch</h2>
    <p class="ph-note">
      These placeholders will be replaced with real screenshots when the GitHub Pages site is live.
      Capture them by running <code>npm run start:demo</code> and visiting each route.
    </p>
    <div class="screenshot-grid">
      <div class="screenshot-placeholder">
        <span class="ph-icon">💬</span>
        <strong>Copilot Shell</strong>
        <span>Streaming chat + mode selector</span>
      </div>
      <div class="screenshot-placeholder">
        <span class="ph-icon">📎</span>
        <strong>RAG Source Cards</strong>
        <span>File-path + documentation citations</span>
      </div>
      <div class="screenshot-placeholder">
        <span class="ph-icon">🔧</span>
        <strong>Tool Timeline</strong>
        <span>5-step agent execution trace</span>
      </div>
      <div class="screenshot-placeholder">
        <span class="ph-icon">✅</span>
        <strong>Approval Gate</strong>
        <span>Warning-tone confirmation card</span>
      </div>
      <div class="screenshot-placeholder">
        <span class="ph-icon">🗂</span>
        <strong>RetailOps Codebase Demo</strong>
        <span>/samples/enterprise-codebase</span>
      </div>
      <div class="screenshot-placeholder">
        <span class="ph-icon">📄</span>
        <strong>RetailOps Docs Demo</strong>
        <span>/samples/enterprise-docs</span>
      </div>
    </div>

    <h2 id="retailops-demo">Live enterprise demo</h2>
    <p>
      The <strong>RetailOps PXM</strong> fictional demo shows the SDK in a realistic enterprise context:
      a 12-state SKU lifecycle, bulk upload, channel syndication, and an approval workflow — all with mock data.
      No real API, no credentials, no real company.
    </p>
    <div class="doc-card-grid">
      <a routerLink="/samples/enterprise-codebase" class="doc-card">
        <strong>Codebase Copilot</strong>
        <span>File-path RAG citations from <code>retailops-pxm-web</code> — Angular services, guards, components.</span>
      </a>
      <a routerLink="/samples/enterprise-docs" class="doc-card">
        <strong>Documentation Copilot</strong>
        <span>Article URL citations from <code>docs.retailops-pxm.example</code> — PM, QA, and support queries.</span>
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
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-subtle);
      display: block;
      margin-bottom: 0.4rem;
    }

    .qi-note {
      font-size: 0.82rem;
      color: var(--text-subtle);
      margin: 0.25rem 0 0;
    }

    .ph-note {
      font-size: 0.85rem;
      color: var(--text-subtle);
      margin: 0 0 0.85rem;
    }

    .ph-note code {
      font-size: 0.8rem;
      background: var(--code-inline-bg);
      color: var(--code-inline-text);
      padding: 0.1rem 0.35rem;
      border-radius: 3px;
      border: 1px solid var(--border);
    }

    .path-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 0.75rem;
      margin: 1.25rem 0 2rem;
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
      font-size: 0.72rem;
      font-weight: 800;
      color: var(--accent);
      letter-spacing: 0.04em;
      font-family: monospace;
    }

    .path-card strong { font-size: 0.9rem; color: var(--text); }
    .path-card span { font-size: 0.82rem; color: var(--text-muted); line-height: 1.45; }
    .path-card code { font-size: 0.78rem; background: var(--code-inline-bg); color: var(--code-inline-text); padding: 0.1rem 0.3rem; border-radius: 3px; }
  `],
})
export class DocsHomeComponent {
  readonly installCmd = `npm install @ankitparekh007/ngx-copilot-sdk`;
}
