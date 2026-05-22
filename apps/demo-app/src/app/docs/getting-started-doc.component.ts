import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocsCodeBlockComponent } from './docs-code-block.component';

@Component({
  selector: 'app-getting-started-doc',
  standalone: true,
  imports: [RouterLink, DocsCodeBlockComponent],
  template: `
    <div class="article-header">
      <div class="header-meta">
        <span class="header-category">Getting Started</span>
        <span class="badge badge-preview">Preview</span>
      </div>
      <h1>Installation</h1>
      <p class="header-desc">
        Install the SDK, register the Angular provider, add <code>&lt;ngx-copilot-shell&gt;</code>,
        and run a fully functional AI copilot locally — no backend, no API keys.
      </p>
    </div>

    <h2 id="install">Install</h2>
    <p>Add the package from npm:</p>
    <app-docs-code-block language="bash" [code]="installCmd" />

    <h3>Peer dependencies</h3>
    <p>The SDK requires the following peers — install them if not already present:</p>
    <app-docs-code-block language="bash" [code]="peersCmd" />
    <div class="deps-table">
      <table>
        <thead><tr><th>Package</th><th>Required version</th></tr></thead>
        <tbody>
          <tr><td><code>&#64;angular/core</code></td><td><code>^20.0.0</code></td></tr>
          <tr><td><code>&#64;angular/common</code></td><td><code>^20.0.0</code></td></tr>
          <tr><td><code>rxjs</code></td><td><code>^7.8.0</code></td></tr>
        </tbody>
      </table>
    </div>

    <h2 id="configure">Configure providers</h2>
    <p>
      Call <code>provideCopilot()</code> once in your root <code>appConfig</code>.
      This registers the backend adapter, the copilot service, and all config tokens.
    </p>
    <app-docs-code-block language="typescript" [code]="configExample" />
    <p>
      <code>apiBaseUrl</code> points to your own backend — the SDK never calls any LLM provider
      directly. See <a routerLink="/docs/configuration">Configuration</a> for all options.
    </p>

    <h2 id="add-shell">Add the copilot shell</h2>
    <p>
      Import <code>CopilotShellComponent</code> into any standalone component and add the element.
      With <code>[useService]="true"</code>, the shell drives <code>CopilotService</code> internally
      — managing messages, streaming state, sources, timeline, and approvals as reactive signals.
    </p>
    <app-docs-code-block language="typescript" [code]="shellExample" />
    <p>
      Omit <code>[useService]</code> (or set it to <code>false</code>) to manage all state
      manually via <code>&#64;Input()</code> bindings and <code>&#64;Output()</code> events.
    </p>

    <h2 id="mock-backend">Mock backend — no API keys</h2>
    <p>
      During local development, use the built-in <code>MockCopilotBackendAdapter</code>.
      It simulates streaming token delivery, RAG source injection, tool timeline steps, and
      approval gates entirely in the browser — no server, no credentials.
    </p>
    <app-docs-code-block language="typescript" [code]="mockExample" />
    <div class="callout callout-info">
      <div>
        <strong>Zero-config demo:</strong> The <a routerLink="/">homepage</a> and both
        <a routerLink="/samples/enterprise-codebase">RetailOps PXM</a> sample routes run on the
        mock adapter. Open them to see real streaming, RAG cards, tool timelines, and approval gates.
      </div>
    </div>

    <h2 id="security">Security: provider credentials belong on your server</h2>
    <div class="callout callout-danger">
      <div>
        <strong>Never embed LLM provider API keys in Angular.</strong>
        OpenAI, Anthropic, Gemini, Cohere, and all similar credentials must stay on your backend.
        <code>apiBaseUrl</code> points to <em>your</em> server — it holds credentials securely,
        orchestrates provider calls, and streams a typed event sequence back to the SDK.
        The browser never sees a raw provider response.
      </div>
    </div>
    <p>
      Your backend receives the <code>CopilotRequestPayload</code> and is responsible for:
    </p>
    <ul>
      <li>Authenticating and authorizing the user request</li>
      <li>Orchestrating the LLM provider call with your server-side API key</li>
      <li>Optionally running RAG retrieval and injecting <code>RagResult[]</code></li>
      <li>Streaming typed <code>CopilotEvent</code> objects back to the SDK via SSE</li>
      <li>Emitting approval gates for destructive agentic actions</li>
    </ul>
    <p>
      See <a routerLink="/docs/adapters">Backend Adapters</a> for the full event contract and
      custom adapter implementation guide.
    </p>
  `,
})
export class GettingStartedDocComponent {
  readonly installCmd = `npm install @ankit-parekh-007/ngx-copilot-sdk`;

  readonly peersCmd = `npm install @angular/core@^20 @angular/common@^20 rxjs@^7.8`;

  readonly configExample = `import { provideCopilot } from '@ankit-parekh-007/ngx-copilot-sdk';

export const appConfig = {
  providers: [
    provideCopilot({
      apiBaseUrl: '/api/copilot',  // your backend endpoint
      defaultMode: 'ask',
      enableRagSources: true,
      enableToolTimeline: true,
      enableApprovals: true,
    }),
  ],
};`;

  readonly shellExample = `import { CopilotShellComponent } from '@ankit-parekh-007/ngx-copilot-sdk';

@Component({
  standalone: true,
  imports: [CopilotShellComponent],
  template: \`
    <ngx-copilot-shell
      title="Product copilot"
      [context]="{ route: '/products/42', userRole: 'editor' }"
      [useService]="true" />
  \`,
})
export class ProductPageComponent {}`;

  readonly mockExample = `import { provideCopilot, MockCopilotBackendAdapter } from '@ankit-parekh-007/ngx-copilot-sdk';

export const appConfig = {
  providers: [
    provideCopilot({
      apiBaseUrl: '/api/copilot',
      adapterOverride: MockCopilotBackendAdapter, // no real backend needed
    }),
  ],
};`;
}
