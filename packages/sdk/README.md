# @ankit-parekh-007/ngx-copilot-sdk

> Angular 20 SDK for AI copilot chat, streaming responses, RAG citations, tool timelines, and approval workflows.

[![npm](https://img.shields.io/npm/v/@ankit-parekh-007/ngx-copilot-sdk.svg)](https://www.npmjs.com/package/@ankit-parekh-007/ngx-copilot-sdk)
[![CI](https://github.com/AnkitParekh007/ngx-copilot-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/AnkitParekh007/ngx-copilot-platform/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/AnkitParekh007/ngx-copilot-platform/blob/main/LICENSE)

## Installation

```bash
npm install @ankit-parekh-007/ngx-copilot-sdk
```

**Peer dependencies** — install alongside the SDK if not already in your project:

```bash
npm install @angular/common @angular/core @angular/forms @angular/platform-browser rxjs
```

---

## Quick start — mock demo (no backend required)

```ts
// app.config.ts
import { provideCopilot } from '@ankit-parekh-007/ngx-copilot-sdk';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCopilot({ defaultMode: 'ask' }),
    // ... other providers
  ],
};
```

```html
<!-- any component template -->
<ngx-copilot-shell [context]="{ route: '/dashboard' }" />
```

The shell works immediately with a built-in mock adapter — no backend needed for UI development.

---

## Connecting a real backend

### Option A — ngx-copilot-platform backend (recommended)

Use the companion Next.js backend (`packages/backend`) which handles OpenAI orchestration, Supabase RAG, rate limiting, and audit logging.

```ts
// app.config.ts
import { provideCopilot, providePlatformBackend } from '@ankit-parekh-007/ngx-copilot-sdk';
import { environment } from './environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCopilot({ defaultMode: 'ask' }),
    providePlatformBackend({
      apiUrl: environment.apiUrl,   // e.g. 'https://your-backend.example.com'
      apiKey: environment.apiKey,   // cpk_* key issued by the admin API
    }),
  ],
};
```

API keys use `Authorization: Bearer cpk_*` — never embed provider secrets in Angular.

### Option B — Bring your own backend (HTTP adapter)

If you have an existing backend that exposes SSE at `/chat/stream`:

```ts
// app.config.ts
import { provideHttpClient } from '@angular/common/http';  // required!
import { provideCopilot, provideHttpAdapter } from '@ankit-parekh-007/ngx-copilot-sdk';
import { environment } from './environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),                               // ← must be before provideHttpAdapter
    provideCopilot({ defaultMode: 'ask' }, { useMockBackend: false }),
    provideHttpAdapter({ apiBaseUrl: environment.apiUrl }),
  ],
};
```

`HttpCopilotBackendAdapter` exposes two paths:
- `send()` → POST `/chat` (non-streaming JSON)
- `sendStream()` → POST `/chat/stream` (fetch-based SSE) — `CopilotService` automatically prefers this

### Option C — Custom adapter

Implement `CopilotBackendAdapter` and provide it yourself:

```ts
import { CopilotBackendAdapter, CopilotEvent, CopilotRequest, COPILOT_BACKEND_ADAPTER } from '@ankit-parekh-007/ngx-copilot-sdk';
import { Observable } from 'rxjs';

export class MyAdapter implements CopilotBackendAdapter {
  send(request: CopilotRequest): Observable<CopilotEvent> {
    // return your Observable<CopilotEvent> stream
  }
}

// In app.config.ts providers:
{ provide: COPILOT_BACKEND_ADAPTER, useClass: MyAdapter }
```

---

## Components

### `<ngx-copilot-shell>` — All-in-one workspace

The recommended entry point. Shows chat, RAG citations, tool timeline, approval gate, and mode selector in one pre-wired layout.

```html
<ngx-copilot-shell
  [context]="{ route: router.url, userRole: 'admin', tenantId: org.id }"
  [modes]="['ask', 'plan']"
  [modeLabels]="{ ask: 'Chat', plan: 'Planning' }"
  [showSources]="true"
  [showTimeline]="true"
  (sessionReset)="onReset()" />
```

**Key inputs:**

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `context` | `CopilotContext` | `{ route: '' }` | Sent with every message |
| `useService` | `boolean` | `true` | Wire to `CopilotService` (recommended) |
| `modes` | `CopilotMode[]` | all four | Modes to show in the selector |
| `modeLabels` | `Partial<Record<CopilotMode, string>>` | `{}` | Override chip labels |
| `showSources` | `boolean` | `true` | Show RAG citations panel |
| `showTimeline` | `boolean` | `true` | Show tool execution timeline |
| `showContext` | `boolean` | `false` | Show context JSON inspector |
| `title` | `string` | `'Angular copilot shell'` | Header title |

**ng-content slots:**

```html
<ngx-copilot-shell [context]="ctx">
  <!-- Extra button in the header row -->
  <button slot="shell-header" (click)="export()">Export</button>
  <!-- Content below the mode selector -->
  <p slot="shell-footer" class="hint">Press Enter to send, Shift+Enter for newline.</p>
</ngx-copilot-shell>
```

### `<ngx-copilot-chat>` — Chat only

```html
<ngx-copilot-chat
  [useService]="true"
  [context]="{ route: '/orders' }"
  [maxHeight]="'30rem'"
  (send)="onMessageSent($event)" />
```

**Key inputs:** `useService` (default `true`), `maxHeight` (default `'22rem'`), `showRetry` (default `true`), `placeholder`, `emptyLabel`.

**ng-content slot:**

```html
<ngx-copilot-chat [useService]="true" [context]="ctx">
  <button slot="composer-extra" (click)="attachFile()">Attach</button>
</ngx-copilot-chat>
```

### Other components

| Component | Selector | Description |
|-----------|----------|-------------|
| `AgentModeSelectorComponent` | `ngx-agent-mode-selector` | Mode chip bar |
| `ApprovalCardComponent` | `ngx-approval-card` | Approval gate (approve/reject) |
| `RagSourceCardComponent` | `ngx-rag-source-card` | Single citation card |
| `ToolCallTimelineComponent` | `ngx-tool-call-timeline` | Execution step list |
| `StreamingMessageComponent` | `ngx-streaming-message` | Animated streaming bubble |

---

## `CopilotService` — State API

```ts
import { CopilotService } from '@ankit-parekh-007/ngx-copilot-sdk';

@Component({ /* ... */ })
export class MyComponent {
  readonly copilot = inject(CopilotService);

  // Signals (read-only)
  messages   = this.copilot.messages;    // Signal<CopilotMessage[]>
  sources    = this.copilot.sources;     // Signal<RagResult[]>
  timeline   = this.copilot.timeline;   // Signal<ToolTimelineItem[]>
  approval   = this.copilot.approval;   // Signal<ApprovalRequest | undefined>
  isStreaming = this.copilot.isStreaming; // Signal<boolean>
  error      = this.copilot.error;      // Signal<CopilotAdapterError | undefined>
  activeMode = this.copilot.activeMode; // Signal<CopilotMode>
  sessionId  = this.copilot.sessionId;  // Signal<string | undefined>

  // Methods
  send()         { this.copilot.sendMessage('Hello', { route: this.router.url }); }
  retry()        { this.copilot.retryLastMessage(); }
  reset()        { this.copilot.resetSession(); }
  changeMode()   { this.copilot.setMode('plan'); }
  setPrompt()    { this.copilot.setSystemPrompt('Always reply in French.'); }

  // Session persistence
  save()         { localStorage.setItem('session', JSON.stringify(this.copilot.exportSession())); }
  restore()      { this.copilot.loadSession(JSON.parse(localStorage.getItem('session') ?? '[]')); }

  // Client-side tool execution
  run()          { this.copilot.executeLocalTool('lookupOrder', { orderId: '123' }); }
}
```

### Multi-instance (component-level scoping)

`CopilotService` is `providedIn: 'root'` — a single global instance by default.
To run two independent copilots on the same page, add `CopilotService` to each host component's `providers`:

```ts
@Component({
  providers: [CopilotService],   // creates a fresh instance for this subtree
  template: `<ngx-copilot-shell [context]="ctx" />`,
})
export class OrdersCopilot {}
```

---

## Context threading

`CopilotContext` carries page-level information (route, user role, tenant, selected record) to the backend with every message. Pass it consistently from the component that owns the current route down to `<ngx-copilot-shell>` or `CopilotService.sendMessage()`:

```ts
// In your page component:
protected readonly ctx = computed((): CopilotContext => ({
  route: this.router.url,
  title: this.pageTitle(),
  userRole: this.authService.role(),
  tenantId: this.orgService.currentId(),
  selectedRecordId: this.selectedOrder()?.id,
}));
```

```html
<ngx-copilot-shell [context]="ctx()" />
```

Use `ContextProviderService.serialize()` when building a custom adapter to normalize the context before sending it to your backend.

---

## Markdown rendering

By default, assistant messages render as plain text. To enable Markdown:

```ts
// app.config.ts
import { marked } from 'marked';                        // npm install marked
import { COPILOT_MARKDOWN_RENDERER } from '@ankit-parekh-007/ngx-copilot-sdk';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: COPILOT_MARKDOWN_RENDERER,
      useValue: (md: string) => marked.parse(md, { async: false }) as string,
    },
    // ... other providers
  ],
};
```

The rendered HTML is passed through `DomSanitizer.bypassSecurityTrustHtml()`.
For production use, add [`DOMPurify`](https://github.com/cure53/DOMPurify) to sanitize before returning:

```ts
useValue: (md: string) => DOMPurify.sanitize(marked.parse(md) as string)
```

---

## Client-side tools

Register tools at startup with `ToolRegistryService` and execute them via `CopilotService.executeLocalTool()`:

```ts
// In app.config.ts:
{
  provide: APP_INITIALIZER,
  useFactory: (registry: ToolRegistryService) => () => {
    registry.register({
      name: 'fetchWeather',
      description: 'Get current weather for a city',
      requiresApproval: false,
      execute: async (_ctx, input) => {
        const { city } = input as { city: string };
        return fetch(`/api/weather?city=${city}`).then(r => r.json());
      },
    });
  },
  deps: [ToolRegistryService],
  multi: true,
}
```

```ts
// In a component:
await this.copilot.executeLocalTool('fetchWeather', { city: 'London' });
// Timeline signal updates automatically.
```

---

## Theming — CSS custom properties

All components use CSS custom properties. Set them on `:root` or on the `ngx-copilot-shell` host element to theme the entire SDK:

| Variable | Purpose |
|----------|---------|
| `--bg-card-solid` | Panel card backgrounds |
| `--bg-card` | Inner card backgrounds (semi-transparent) |
| `--bg-muted` / `--bg-subtle` | Subtle section backgrounds |
| `--text` | Primary text |
| `--text-muted` | Secondary / body text |
| `--text-subtle` | Metadata / label text |
| `--accent` | Primary brand color (default blue) |
| `--accent-2` | Secondary brand color (default purple) |
| `--accent-light` | Tinted accent background |
| `--accent-text` | Text color on accent backgrounds |
| `--border` | Default border color |
| `--border-strong` | Emphasized border |
| `--shadow-sm` | Card box-shadow |
| `--callout-danger-bg/text/border` | Error / danger callout |
| `--callout-warning-bg/text/border` | Warning / approval callout |
| `--callout-success-bg/text/border` | Success callout |
| `--code-bg` / `--code-text` | Markdown code block colors |

---

## Session persistence

```ts
// Save on reset or navigation away
this.copilot.resetSession(); // or listen to (sessionReset) from the shell

// Export before navigation
const session = this.copilot.exportSession(); // CopilotMessage[]
sessionStorage.setItem('copilot', JSON.stringify(session));

// Restore on next visit
const saved = sessionStorage.getItem('copilot');
if (saved) this.copilot.loadSession(JSON.parse(saved));
```

---

## Stream retry

The service automatically retries failed streams up to `streamRetryCount` times (default: 2) with exponential back-off (1s, 2s). Configure in `provideCopilot()`:

```ts
provideCopilot({ defaultMode: 'ask', streamRetryCount: 3 })
```

Set `streamRetryCount: 0` to disable automatic retry. Use `retryLastMessage()` for user-triggered retry from the error UI.

---

## License

MIT — [Ankit Parekh](https://github.com/AnkitParekh007)
