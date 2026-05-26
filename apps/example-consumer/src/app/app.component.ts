import { Component } from '@angular/core';
import { CopilotShellComponent } from '@ankit-parekh-007/ngx-copilot-sdk';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CopilotShellComponent],
  template: `
    <div class="app-layout">
      <header class="app-header">
        <h1>ngx-copilot-platform - Example Consumer</h1>
        <p class="subtitle">
          Angular 20 app wired to the platform backend contract
        </p>
      </header>

      <main class="app-main">
        <aside class="context-panel">
          <h2>Context</h2>
          <p>
            This app uses <code>NgxCopilotPlatformBackendAdapter</code> to send
            messages to <code>packages/backend</code> at
            <code>{{ apiUrl || 'runtime-config required' }}</code>.
          </p>
          <p>
            The backend authenticates with your configured <code>cpk_</code> API
            key, runs RAG against your Supabase vector store, and streams
            responses back via Server-Sent Events.
          </p>
          <p *ngIf="!isConfigured" class="warning">
            Runtime configuration is missing. Define
            <code>window.__COPILOT_RUNTIME_CONFIG__</code> with
            <code>apiUrl</code> and <code>apiKey</code> before using this app
            against a live backend.
          </p>
          <h3>Quickstart</h3>
          <ol>
            <li>Copy <code>packages/backend/.env.example</code> to <code>.env.local</code></li>
            <li>Run <code>pnpm --filter @ngx-copilot/backend dev</code></li>
            <li>Provide <code>window.__COPILOT_RUNTIME_CONFIG__</code> with your backend URL and API key</li>
            <li>Run <code>pnpm --filter example-consumer dev</code></li>
          </ol>
        </aside>

        <section class="copilot-panel">
          <ngx-copilot-shell [modes]="supportedModes" />
        </section>
      </main>
    </div>
  `,
  styles: [`
    .app-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .app-header {
      padding: 1.5rem 2rem;
      border-bottom: 1px solid #e5e7eb;
      background: #fff;
    }
    .app-header h1 { margin: 0; font-size: 1.25rem; font-weight: 600; }
    .subtitle { margin: 0.25rem 0 0; color: #6b7280; font-size: 0.875rem; }
    .app-main {
      flex: 1;
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 0;
    }
    .context-panel {
      padding: 1.5rem;
      border-right: 1px solid #e5e7eb;
      background: #f9fafb;
      overflow-y: auto;
    }
    .context-panel h2 { margin-top: 0; font-size: 1rem; font-weight: 600; }
    .context-panel h3 { font-size: 0.875rem; font-weight: 600; margin-top: 1.5rem; }
    .context-panel p, .context-panel li { font-size: 0.875rem; color: #374151; line-height: 1.5; }
    .context-panel code {
      background: #e5e7eb;
      padding: 0.125rem 0.25rem;
      border-radius: 0.25rem;
      font-size: 0.8125rem;
    }
    .warning {
      color: #991b1b;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 0.5rem;
      padding: 0.75rem;
    }
    .copilot-panel {
      display: flex;
      flex-direction: column;
      height: calc(100vh - 73px);
    }
    ngx-copilot-shell {
      flex: 1;
    }
  `],
})
export class AppComponent {
  readonly supportedModes = ['ask', 'plan', 'debug'] as const;
  readonly apiUrl = environment.apiUrl;
  readonly isConfigured = !!environment.apiUrl && !!environment.apiKey;
}
