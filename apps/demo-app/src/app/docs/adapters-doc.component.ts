import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocsCodeBlockComponent } from './docs-code-block.component';

@Component({
  selector: 'app-adapters-doc',
  standalone: true,
  imports: [RouterLink, DocsCodeBlockComponent],
  template: `
    <div class="article-header">
      <div class="header-meta">
        <span class="header-category">Core Concepts</span>
        <span class="badge badge-preview">Preview</span>
      </div>
      <h1>Backend Adapters</h1>
      <p class="header-desc">
        The adapter pattern separates copilot UI rendering from backend communication,
        ensuring provider credentials never reach the browser.
      </p>
    </div>

    <h2 id="why-adapters">Why adapters?</h2>
    <p>
      LLM providers require API keys that <strong>must never be exposed to the browser</strong>.
      The adapter pattern enforces this boundary cleanly: your Angular app communicates only
      with <em>your own</em> backend API, which holds credentials and orchestrates AI provider calls.
    </p>

    <!-- Architecture diagram -->
    <div class="arch-diagram">
      <div class="arch-col">
        <div class="arch-label">Browser</div>
        <div class="arch-box arch-sdk">
          <span>Angular app</span>
          <span class="arch-sub">ngx-copilot-sdk</span>
        </div>
      </div>
      <div class="arch-arrow-col">
        <div class="arch-arrow-line">
          <span class="arch-arrow-label">CopilotBackendAdapter</span>
          <span class="arch-arrow-sub">Observable&lt;CopilotEvent&gt;</span>
        </div>
      </div>
      <div class="arch-col">
        <div class="arch-label">Your server</div>
        <div class="arch-box arch-backend">
          <span>Backend API</span>
          <span class="arch-sub">Auth + secrets</span>
        </div>
      </div>
      <div class="arch-arrow-col arch-arrow-right">
        <div class="arch-arrow-line">
          <span class="arch-arrow-label">API key (secret)</span>
        </div>
      </div>
      <div class="arch-col">
        <div class="arch-label">Cloud</div>
        <div class="arch-box arch-provider">
          <span>LLM Provider</span>
          <span class="arch-sub">OpenAI / Anthropic / ...</span>
        </div>
      </div>
    </div>

    <h2 id="mock-adapter">MockCopilotBackendAdapter</h2>
    <p>
      <span class="badge badge-frontend-safe">Frontend safe</span>
    </p>
    <p>
      Simulates streaming, RAG source injection, tool timeline steps, and approval gates entirely
      in the browser. No credentials, no backend, no network requests.
      Powers the <a routerLink="/">homepage demo</a> and both RetailOps PXM sample routes.
    </p>
    <app-docs-code-block language="typescript" [code]="mockAdapterExample" />

    <h2 id="http-adapter">HttpCopilotBackendAdapter</h2>
    <p>
      <span class="badge badge-backend-required">Backend required</span>
    </p>
    <p>
      POSTs to <code>apiBaseUrl + '/chat'</code> and reads a Server-Sent Events stream.
      Your backend must emit events conforming to the <code>CopilotEvent</code> discriminated union.
      See <code>docs/api-design.md</code> in the repository for the full SSE event contract.
    </p>
    <table>
      <thead><tr><th>Event type</th><th>Payload</th><th>Purpose</th></tr></thead>
      <tbody>
        <tr><td><code>token</code></td><td><code>&#123; text: string &#125;</code></td><td>Streaming assistant token</td></tr>
        <tr><td><code>rag_sources</code></td><td><code>&#123; sources: RagResult[] &#125;</code></td><td>Citation cards for this response</td></tr>
        <tr><td><code>tool_step</code></td><td><code>&#123; item: ToolTimelineItem &#125;</code></td><td>Tool timeline step update</td></tr>
        <tr><td><code>approval_request</code></td><td><code>&#123; request: ApprovalRequest &#125;</code></td><td>Gate requiring user confirmation</td></tr>
        <tr><td><code>done</code></td><td>—</td><td>Stream complete</td></tr>
        <tr><td><code>error</code></td><td><code>&#123; message: string &#125;</code></td><td>Backend error</td></tr>
      </tbody>
    </table>

    <h2 id="custom-adapters">Custom adapters</h2>
    <p>
      Implement the <code>CopilotBackendAdapter</code> interface to integrate any streaming backend —
      WebSockets, gRPC-Web, or a custom SSE schema:
    </p>
    <app-docs-code-block language="typescript" [code]="customAdapterExample" />

    <div class="callout callout-danger">
      <div>
        <strong>No provider secrets in the browser — ever.</strong>
        Your adapter receives a session-scoped auth token, not an LLM API key.
        OpenAI, Anthropic, Cohere, or any other provider credentials must remain on
        your backend service.
      </div>
    </div>
  `,
  styles: [`
    .arch-diagram {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0;
      padding: 1.25rem 1.5rem;
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      margin: 1.25rem 0 1.5rem;
      overflow-x: auto;
    }

    .arch-col { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; }

    .arch-label {
      font-size: 0.67rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: var(--text-subtle);
    }

    .arch-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.2rem;
      padding: 0.65rem 1rem;
      border-radius: var(--radius-md);
      border: 1.5px solid var(--border-strong);
      background: var(--bg);
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text);
      white-space: nowrap;
      min-width: 110px;
      text-align: center;
    }

    .arch-sub { font-size: 0.72rem; font-weight: 400; color: var(--text-muted); }

    .arch-sdk      { border-color: var(--accent); color: var(--accent); }
    .arch-backend  { border-color: var(--border-strong); }
    .arch-provider { border-color: var(--border-strong); color: var(--text-muted); }

    .arch-arrow-col {
      display: flex;
      align-items: center;
      padding: 0 0.5rem;
      min-width: 120px;
    }

    .arch-arrow-line {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.15rem;
      width: 100%;
      position: relative;
    }

    .arch-arrow-line::before {
      content: '';
      display: block;
      width: 100%;
      height: 1.5px;
      background: var(--border-strong);
    }

    .arch-arrow-label {
      font-size: 0.67rem;
      font-weight: 600;
      color: var(--text-subtle);
      white-space: nowrap;
    }

    .arch-arrow-sub {
      font-size: 0.62rem;
      color: var(--text-subtle);
      font-family: monospace;
      white-space: nowrap;
    }
  `],
})
export class AdaptersDocComponent {
  readonly mockAdapterExample = `import { provideCopilot, MockCopilotBackendAdapter } from '@ankitparekh007/ngx-copilot-sdk';

export const appConfig = {
  providers: [
    provideCopilot({
      apiBaseUrl: '/api/copilot',
      adapterOverride: MockCopilotBackendAdapter,
    }),
  ],
};`;

  readonly customAdapterExample = `import {
  CopilotBackendAdapter,
  CopilotRequestPayload,
  CopilotEvent,
} from '@ankitparekh007/ngx-copilot-sdk';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MyBackendAdapter implements CopilotBackendAdapter {
  send(payload: CopilotRequestPayload): Observable<CopilotEvent> {
    // Call your backend and return an Observable<CopilotEvent>.
    // The SDK subscribes and renders each event as it arrives.
    return new Observable(observer => {
      // ... your streaming implementation
    });
  }
}`;
}
