import { Component } from '@angular/core';
import { DocsCodeBlockComponent } from './docs-code-block.component';

@Component({
  selector: 'app-configuration-doc',
  standalone: true,
  imports: [DocsCodeBlockComponent],
  template: `
    <div class="article-header">
      <div class="header-meta">
        <span class="header-category">Getting Started</span>
        <span class="badge badge-stable">Stable intent</span>
      </div>
      <h1>Configuration</h1>
      <p class="header-desc">
        All <code>CopilotConfig</code> options passed to <code>provideCopilot()</code> —
        backend URL, feature flags, and adapter selection.
      </p>
    </div>

    <h2 id="full-example">Full example</h2>
    <p>Pass a config object to <code>provideCopilot()</code> in your root <code>appConfig</code>:</p>
    <app-docs-code-block language="typescript" [code]="fullExample" />

    <h2 id="options">Options reference</h2>
    <table>
      <thead>
        <tr><th>Option</th><th>Type</th><th>Default</th><th>Description</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><code>apiBaseUrl</code></td><td><code>string</code></td><td>—</td>
          <td><strong>Required.</strong> Base URL for your copilot backend API. Never a direct LLM provider URL.</td>
        </tr>
        <tr>
          <td><code>defaultMode</code></td><td><code>CopilotMode</code></td><td><code>'ask'</code></td>
          <td>Initial agent mode shown in the mode selector.</td>
        </tr>
        <tr>
          <td><code>enableRagSources</code></td><td><code>boolean</code></td><td><code>false</code></td>
          <td>Render RAG citation cards alongside assistant messages.</td>
        </tr>
        <tr>
          <td><code>enableToolTimeline</code></td><td><code>boolean</code></td><td><code>false</code></td>
          <td>Render the tool call step timeline panel.</td>
        </tr>
        <tr>
          <td><code>enableApprovals</code></td><td><code>boolean</code></td><td><code>false</code></td>
          <td>Enable approval gate cards for user-confirmed actions.</td>
        </tr>
        <tr>
          <td><code>adapterOverride</code></td><td><code>Type&lt;CopilotBackendAdapter&gt;</code></td><td>—</td>
          <td>Replace the default HTTP adapter (e.g. <code>MockCopilotBackendAdapter</code>).</td>
        </tr>
      </tbody>
    </table>

    <h2 id="backend-url">Backend URL</h2>
    <p>
      <code>apiBaseUrl</code> is a relative or absolute path to your server.
      The <code>HttpCopilotBackendAdapter</code> appends <code>/chat</code> and expects
      a Server-Sent Events response. Use a relative URL (e.g. <code>/api/copilot</code>)
      to avoid CORS issues in production.
    </p>
    <div class="callout callout-danger">
      <div>
        <strong>Security:</strong> Never set <code>apiBaseUrl</code> to an LLM provider URL directly.
        Always proxy through your own backend that holds provider credentials securely.
      </div>
    </div>

    <h2 id="theme-support">Theme support</h2>
    <p>
      The demo documentation site supports <strong>light</strong>, <strong>dark</strong>, and
      <strong>system</strong> themes. Toggle using the button in the top navigation bar.
      Your preference is persisted in <code>localStorage</code> under
      <code>ngx-copilot-sdk:theme</code>.
    </p>
    <p>
      SDK components are styled with CSS custom properties (<code>--bg</code>, <code>--text</code>,
      <code>--accent</code>, etc.) and can be themed by any host application by redefining those
      tokens in its global stylesheet.
    </p>
    <app-docs-code-block language="css" [code]="themeExample" />
    <div class="callout callout-info">
      <div>
        Theme switching is fully client-side and GitHub Pages compatible.
        No server-side rendering or runtime configuration is required.
      </div>
    </div>
  `,
})
export class ConfigurationDocComponent {
  readonly fullExample = `import { provideCopilot } from '@ankitparekh007/ngx-copilot-sdk';

export const appConfig = {
  providers: [
    provideCopilot({
      apiBaseUrl: '/api/copilot',      // Required
      defaultMode: 'ask',              // 'ask' | 'plan' | 'execute' | 'debug'
      enableRagSources: true,
      enableToolTimeline: true,
      enableApprovals: true,
    }),
  ],
};`;

  readonly themeExample = `/* Override SDK CSS tokens in your global stylesheet */
:root {
  --accent: #7c3aed;        /* violet accent */
  --accent-hover: #6d28d9;
  --accent-light: #ede9fe;
}`;
}
