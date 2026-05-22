import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CopilotContext, CopilotShellComponent } from '@ankitparekh007/ngx-copilot-sdk';

@Component({
  selector: 'app-live-demo',
  standalone: true,
  imports: [RouterLink, CopilotShellComponent],
  template: `
    <!-- Hero -->
    <section class="hero" aria-label="SDK introduction">
      <div class="hero-eyebrow">
        <span class="eyebrow-chip">Open-source</span>
        <span class="eyebrow-chip">Angular 20</span>
        <span class="eyebrow-chip eyebrow-preview">0.1.0 Preview</span>
      </div>
      <h1 class="hero-title">
        AI Copilot UI for<br><span class="accent-text">Angular Enterprise Apps</span>
      </h1>
      <p class="hero-subtitle">
        Drop a fully-wired copilot shell into any Angular workspace.
        RAG citations, tool timelines, approval gates, streaming — production-safe adapter pattern keeps provider secrets off the browser.
      </p>
      <div class="hero-actions">
        <a routerLink="/docs/getting-started" class="btn-primary">Get started &rarr;</a>
        <a routerLink="/docs" class="btn-secondary">Documentation</a>
        <a href="https://github.com/AnkitParekh007/ngx-copilot-platform"
           target="_blank" rel="noopener noreferrer" class="btn-ghost">
          GitHub &#8599;
        </a>
      </div>

      <!-- Install box -->
      <div class="install-box">
        <span class="install-label">npm</span>
        <code class="install-cmd">npm install &#64;ankitparekh007/ngx-copilot-sdk</code>
        <button class="copy-btn" (click)="copyInstall()" [class.copied]="installCopied()" aria-label="Copy install command">
          @if (installCopied()) {
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 5" stroke="#22c55e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          } @else {
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="5" y="2" width="9" height="11" rx="1.5" stroke="currentColor" stroke-width="1.5"/><rect x="2" y="5" width="9" height="11" rx="1.5" stroke="currentColor" stroke-width="1.5" fill="white"/></svg>
          }
        </button>
      </div>
      <p class="install-req">Requires Angular ^20.0.0 &middot; RxJS ^7.8.0</p>
    </section>

    <!-- Feature cards -->
    <section class="section" aria-label="Features">
      <h2 class="section-title">Everything you need</h2>
      <p class="section-desc">Built specifically for Angular enterprise apps — not a wrapped React component, not a generic chatbot widget.</p>
      <div class="feature-grid">
        <div class="feature-card">
          <div class="feat-icon-wrap feat-blue">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
          </div>
          <strong>Copilot Shell</strong>
          <span>Full chat UI: streaming, mode selector (ask / plan / execute / debug), composer, and session reset.</span>
        </div>
        <div class="feature-card">
          <div class="feat-icon-wrap feat-violet">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 12h6m-3-3v6m-7 0a9 9 0 1118 0 9 9 0 01-18 0z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
          </div>
          <strong>RAG Citation Cards</strong>
          <span>File-path citations for codebase copilots. Documentation URL citations for knowledge-base copilots.</span>
        </div>
        <div class="feature-card">
          <div class="feat-icon-wrap feat-amber">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v5l3 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
          </div>
          <strong>Tool Timeline</strong>
          <span>Step-by-step visualisation of multi-tool agent operations with running / succeeded / failed / skipped states.</span>
        </div>
        <div class="feature-card">
          <div class="feat-icon-wrap feat-green">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <strong>Approval Gates</strong>
          <span>Neutral / warning / destructive confirmation cards — user controls consequential agentic operations.</span>
        </div>
        <div class="feature-card">
          <div class="feat-icon-wrap feat-slate">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <strong>Adapter Boundary</strong>
          <span>One interface. Your backend handles LLM calls. Provider secrets never touch the browser.</span>
        </div>
        <div class="feature-card">
          <div class="feat-icon-wrap feat-indigo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <strong>Angular-native</strong>
          <span>Signals, standalone components, typed models. Works with <code>provideCopilot()</code> in one line.</span>
        </div>
      </div>
    </section>

    <!-- Architecture preview -->
    <section class="section arch-section" aria-label="Architecture">
      <h2 class="section-title">How it fits your stack</h2>
      <p class="section-desc">The adapter boundary keeps the SDK UI layer decoupled from your backend provider. One <code>Observable&lt;CopilotEvent&gt;</code> stream drives everything.</p>
      <div class="arch-diagram">
        <div class="arch-layer arch-app">
          <span class="arch-label">Your Angular App</span>
          <div class="arch-chip"><code>&lt;ngx-copilot-shell&gt;</code></div>
          <div class="arch-chip"><code>provideCopilot(config)</code></div>
        </div>
        <div class="arch-arrow">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span>CopilotBackendAdapter</span>
        </div>
        <div class="arch-layer arch-backend">
          <span class="arch-label">Your Backend</span>
          <div class="arch-chip chip-backend">LLM Provider</div>
          <div class="arch-chip chip-backend">Vector DB / RAG</div>
          <div class="arch-chip chip-backend">Auth / Secrets</div>
        </div>
      </div>
    </section>

    <!-- Why Angular teams -->
    <section class="section why-section" aria-label="Why Angular teams">
      <h2 class="section-title">Built for Angular enterprise teams</h2>
      <div class="why-grid">
        <div class="why-item">
          <span class="why-check">&#10003;</span>
          <div>
            <strong>No React dependencies</strong>
            <span>Pure Angular. No wrapper, no iframe, no CSS bleed from a foreign framework.</span>
          </div>
        </div>
        <div class="why-item">
          <span class="why-check">&#10003;</span>
          <div>
            <strong>Typed models all the way down</strong>
            <span><code>RagResult</code>, <code>ToolTimelineItem</code>, <code>ApprovalRequest</code> — all TypeScript interfaces, no <code>any</code>.</span>
          </div>
        </div>
        <div class="why-item">
          <span class="why-check">&#10003;</span>
          <div>
            <strong>Provably safe for enterprise</strong>
            <span>Approval gates, adapter isolation, and mock-first development mean AI features ship safely.</span>
          </div>
        </div>
        <div class="why-item">
          <span class="why-check">&#10003;</span>
          <div>
            <strong>Local development without API keys</strong>
            <span><code>MockCopilotBackendAdapter</code> simulates streaming, RAG, tool steps, and approvals without any credentials.</span>
          </div>
        </div>
      </div>
    </section>

    <!-- RetailOps PXM callout -->
    <section class="section" aria-label="Enterprise demo">
      <div class="demo-callout">
        <div class="demo-callout-content">
          <div class="demo-callout-badge">Fictional enterprise demo</div>
          <h2 class="demo-callout-title">RetailOps PXM</h2>
          <p class="demo-callout-desc">
            A full mock enterprise demo — codebase copilot (Angular services, guards, components) and documentation copilot (PM / QA / support queries). No real company, repository, or API.
          </p>
          <div class="demo-callout-actions">
            <a routerLink="/samples/enterprise-codebase" class="btn-demo">Codebase Copilot &rarr;</a>
            <a routerLink="/samples/enterprise-docs" class="btn-demo btn-demo-secondary">Documentation Copilot &rarr;</a>
          </div>
        </div>
        <div class="demo-callout-visual" aria-hidden="true">
          <div class="mock-card">
            <div class="mock-file-chip"><span class="mock-dot"></span>bulk-upload.service.ts</div>
            <div class="mock-file-chip"><span class="mock-dot"></span>approval.service.ts</div>
            <div class="mock-file-chip"><span class="mock-dot"></span>role.guard.ts</div>
            <div class="mock-file-chip"><span class="mock-dot"></span>sku-status.model.ts</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Preview disclaimer -->
    <div class="disclaimer" role="note">
      <strong>Preview SDK — 0.1.0:</strong>
      This SDK is under active development. APIs may change before 1.0.
      It does not include real LLM provider integrations in the browser — provider secrets belong behind your backend adapter.
      All RetailOps PXM demo data is entirely fictional.
    </div>

    <!-- Live copilot -->
    <section class="section" aria-label="Interactive mock copilot">
      <h2 class="section-title">Try the mock copilot</h2>
      <p class="section-desc">
        Powered by <code>MockCopilotBackendAdapter</code> — no API keys, no backend, no credentials required.
        Send any message to exercise streaming, RAG cards, tool timeline, and approval gates.
      </p>
      <ngx-copilot-shell
        title="Enterprise account copilot"
        subtitle="Mock adapter — all responses are canned, no LLM calls made."
        [context]="context"
        [useService]="true" />
    </section>
  `,
  styles: [`
    :host { display: block; }

    /* Hero */
    .hero {
      padding: clamp(2rem, 6vw, 4rem) clamp(1.5rem, 4vw, 3rem);
      border-radius: 1.5rem;
      background:
        radial-gradient(ellipse 900px 500px at 70% -10%, rgba(99,102,241,0.25) 0%, transparent 60%),
        linear-gradient(160deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
      color: #f8fafc;
      margin-bottom: 2.5rem;
      border: 1px solid rgba(148,163,184,0.15);
      box-shadow: 0 32px 80px rgba(15,23,42,0.35);
    }

    .hero-eyebrow { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1.25rem; }

    .eyebrow-chip {
      font-size: 0.76rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      border: 1px solid rgba(148,163,184,0.25);
      color: #94a3b8;
    }

    .eyebrow-preview {
      background: rgba(99,102,241,0.2);
      border-color: rgba(99,102,241,0.4);
      color: #a5b4fc;
    }

    .hero-title {
      font-size: clamp(2rem, 5vw, 3.25rem);
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.1;
      margin: 0 0 1rem;
    }

    .accent-text { color: #818cf8; }

    .hero-subtitle {
      font-size: clamp(1rem, 2vw, 1.1rem);
      color: rgba(226,232,240,0.8);
      line-height: 1.65;
      max-width: 600px;
      margin: 0 0 1.75rem;
    }

    .hero-actions { display: flex; flex-wrap: wrap; gap: 0.6rem; margin-bottom: 1.75rem; }

    .btn-primary {
      background: #6366f1;
      color: #fff;
      padding: 0.6rem 1.4rem;
      border-radius: 999px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      transition: background 0.15s;
    }
    .btn-primary:hover { background: #4f46e5; }

    .btn-secondary {
      background: rgba(255,255,255,0.1);
      color: #e2e8f0;
      padding: 0.6rem 1.4rem;
      border-radius: 999px;
      text-decoration: none;
      font-size: 0.9rem;
      border: 1px solid rgba(255,255,255,0.18);
      transition: background 0.15s;
    }
    .btn-secondary:hover { background: rgba(255,255,255,0.16); }

    .btn-ghost { color: #94a3b8; padding: 0.6rem 1rem; text-decoration: none; font-size: 0.9rem; transition: color 0.12s; }
    .btn-ghost:hover { color: #e2e8f0; }

    .install-box {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      background: rgba(0,0,0,0.35);
      border: 1px solid rgba(148,163,184,0.2);
      border-radius: 0.75rem;
      padding: 0.65rem 1rem;
      max-width: 500px;
    }

    .install-label {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #ef4444;
      background: rgba(239,68,68,0.12);
      border: 1px solid rgba(239,68,68,0.25);
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      flex-shrink: 0;
    }

    .install-cmd {
      font-family: 'Fira Code', 'Cascadia Code', monospace;
      font-size: 0.9rem;
      color: #86efac;
      flex: 1;
    }

    .copy-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: none;
      background: rgba(255,255,255,0.08);
      color: #94a3b8;
      border-radius: 6px;
      cursor: pointer;
      flex-shrink: 0;
      transition: background 0.12s, color 0.12s;
    }
    .copy-btn:hover { background: rgba(255,255,255,0.15); color: #f8fafc; }
    .copy-btn.copied { background: rgba(34,197,94,0.15); }

    .install-req { font-size: 0.82rem; color: rgba(148,163,184,0.82); margin: 0.6rem 0 0; }

    /* Section shared */
    .section { margin-bottom: 2.5rem; }
    .section-title { font-size: 1.4rem; font-weight: 700; color: var(--text); margin: 0 0 0.4rem; letter-spacing: -0.01em; }
    .section-desc { color: var(--text-muted); font-size: 1rem; margin: 0 0 1.3rem; line-height: 1.72; }
    .section-desc code { background: var(--bg-subtle); padding: 0.1rem 0.35rem; border-radius: 4px; font-size: 0.85rem; color: var(--text-muted); }

    /* Feature grid */
    .feature-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.85rem; }

    .feature-card {
      padding: 1.1rem 1.15rem;
      border-radius: 1rem;
      border: 1px solid var(--border);
      background: var(--bg-card);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: grid;
      gap: 0.35rem;
      transition: box-shadow 0.15s, border-color 0.15s;
    }
    .feature-card:hover { box-shadow: var(--shadow-md); border-color: var(--border-strong); }

    .feat-icon-wrap {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.15rem;
    }
    .feat-blue   { background: rgba(91,140,255,0.15);  color: #5b8cff; }
    .feat-violet { background: rgba(167,139,250,0.15); color: #a78bfa; }
    .feat-amber  { background: rgba(251,146,60,0.15);  color: #fb923c; }
    .feat-green  { background: rgba(52,211,153,0.15);  color: #34d399; }
    .feat-slate  { background: rgba(148,163,184,0.12); color: var(--text-muted); }
    .feat-indigo { background: rgba(99,102,241,0.15);  color: #818cf8; }

    .feature-card strong { font-size: 1rem; color: var(--text); }
    .feature-card span { font-size: 0.93rem; color: var(--text-muted); line-height: 1.58; }
    .feature-card code { font-size: 0.86rem; background: var(--bg-subtle); color: var(--text); padding: 0.1rem 0.3rem; border-radius: 3px; }

    @media (max-width: 900px) {
      .feature-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    @media (max-width: 640px) {
      .feature-grid { grid-template-columns: 1fr; }
    }

    /* Architecture */
    .arch-section { }
    .arch-diagram {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      flex-wrap: wrap;
    }

    .arch-layer {
      flex: 1;
      min-width: 180px;
      padding: 1.1rem 1.25rem;
      border-radius: 1rem;
      display: grid;
      gap: 0.5rem;
    }

    .arch-app { background: rgba(91,140,255,0.08); border: 1px solid rgba(91,140,255,0.22); }
    .arch-backend { background: rgba(52,211,153,0.08); border: 1px solid rgba(52,211,153,0.22); }

    .arch-label {
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-muted);
      margin-bottom: 0.15rem;
    }

    .arch-chip {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 0.35rem 0.65rem;
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .chip-backend { border-color: rgba(52,211,153,0.3); background: rgba(52,211,153,0.12); color: #34d399; }

    .arch-arrow {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
      flex-shrink: 0;
      font-size: 0.78rem;
      color: var(--accent);
      font-weight: 600;
      letter-spacing: 0.04em;
    }

    /* Why section */
    .why-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.85rem; }

    .why-item {
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
      padding: 1rem 1.1rem;
      border-radius: 0.875rem;
      border: 1px solid var(--border);
      background: var(--bg-card);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }

    .why-check {
      font-size: 1rem;
      color: #34d399;
      background: rgba(52,211,153,0.15);
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-weight: 700;
      margin-top: 0.15rem;
    }

    .why-item strong { display: block; font-size: 0.98rem; color: var(--text); margin-bottom: 0.25rem; }
    .why-item span { font-size: 0.92rem; color: var(--text-muted); line-height: 1.58; }
    .why-item code { font-size: 0.84rem; background: var(--bg-subtle); color: var(--text); padding: 0.1rem 0.3rem; border-radius: 3px; }

    /* Demo callout */
    .demo-callout {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 1.5rem;
      align-items: center;
      padding: 1.75rem 2rem;
      border-radius: 1.25rem;
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #1e1b4b 100%);
      border: 1px solid rgba(99,102,241,0.35);
      color: #f8fafc;
    }

    @media (max-width: 640px) { .demo-callout { grid-template-columns: 1fr; } }

    .demo-callout-badge {
      display: inline-block;
      font-size: 0.74rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: #fbbf24;
      border: 1px solid rgba(251,191,36,0.35);
      background: rgba(251,191,36,0.1);
      padding: 0.18rem 0.6rem;
      border-radius: 999px;
      margin-bottom: 0.65rem;
    }

    .demo-callout-title { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; margin: 0 0 0.6rem; }
    .demo-callout-desc { font-size: 0.9rem; color: rgba(226,232,240,0.82); line-height: 1.6; margin: 0 0 1.1rem; }
    .demo-callout-actions { display: flex; flex-wrap: wrap; gap: 0.6rem; }

    .btn-demo {
      background: #6366f1;
      color: #fff;
      padding: 0.5rem 1.1rem;
      border-radius: 999px;
      text-decoration: none;
      font-size: 0.94rem;
      font-weight: 600;
      transition: background 0.15s;
    }
    .btn-demo:hover { background: #4f46e5; }
    .btn-demo-secondary { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.18); }
    .btn-demo-secondary:hover { background: rgba(255,255,255,0.18); }

    .demo-callout-visual { }

    .mock-card {
      display: grid;
      gap: 0.4rem;
      min-width: 200px;
    }

    .mock-file-chip {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 6px;
      padding: 0.4rem 0.75rem;
      font-size: 0.84rem;
      color: #c7d2fe;
      font-family: monospace;
    }

    .mock-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #6366f1;
      flex-shrink: 0;
    }

    /* Disclaimer */
    .disclaimer {
      padding: 0.85rem 1.1rem;
      background: var(--callout-warning-bg);
      border: 1px solid var(--callout-warning-border);
      border-radius: 0.75rem;
      font-size: 0.94rem;
      color: var(--callout-warning-text);
      line-height: 1.55;
      margin-bottom: 2.5rem;
    }
    .disclaimer strong { color: var(--callout-warning-text); }
  `],
})
export class LiveDemoComponent {
  installCopied = signal(false);

  copyInstall(): void {
    navigator.clipboard.writeText('npm install @ankitparekh007/ngx-copilot-sdk').then(() => {
      this.installCopied.set(true);
      setTimeout(() => this.installCopied.set(false), 2000);
    });
  }

  readonly context: CopilotContext = {
    route: '/accounts/enterprise/42',
    title: 'Enterprise account workspace',
    userRole: 'support_manager',
    tenantId: 'north-america',
    selectedRecordId: 'account-42',
    visibleFields: ['status', 'owner', 'contractTier'],
    metadata: { region: 'us-east', escalationLevel: 'high' },
  };
}
