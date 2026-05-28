import { Component } from '@angular/core';
import { DocsCodeBlockComponent } from './docs-code-block.component';

const CHAT_ENDPOINT_SNIPPET = `POST /api/copilot/chat
Content-Type: application/json
Authorization: Bearer <session-token>

{
  "messages": [
    { "role": "user", "content": "Where is the bulk upload service?" }
  ],
  "context": {
    "route": "/app/bulk-upload",
    "userRole": "developer",
    "tenantId": "acme-corp"
  },
  "mode": "ask",
  "stream": true
}`;

const REQUEST_MODEL_SNIPPET = `// TypeScript interface for the request payload
export interface CopilotRequestPayload {
  /** Full conversation history to send as context */
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;

  /** Optional structured context about the current page / user */
  context?: {
    route?: string;
    title?: string;
    userRole?: string;
    tenantId?: string;
    metadata?: Record<string, unknown>;
  };

  /** Copilot interaction mode */
  mode?: 'ask' | 'plan' | 'execute' | 'debug';

  /** Whether to stream the response via SSE (recommended: true) */
  stream?: boolean;
}`;

const RESPONSE_EVENTS_SNIPPET = `// Each event is a Server-Sent Event (SSE) in the format:
// data: <JSON>\\n\\n

// Stream chunk — emit one or more per response
data: {"type":"chunk","delta":"The bulk upload flow is "}

// Followed by more chunks...
data: {"type":"chunk","delta":"split across two files. "}

// RAG sources event — emitted once per response (optional)
data: {"type":"rag_sources","sources":[...]}

// Tool step event — emitted once per agent tool call (optional)
data: {"type":"tool_step","step":{...}}

// Approval request — emitted when agent wants to perform a destructive action
data: {"type":"approval_request","approval":{...}}

// Error event
data: {"type":"error","code":"rate_limited","message":"..."}

// Done — always the last event
data: {"type":"done"}`;

const RAG_PAYLOAD_SNIPPET = `data: {
  "type": "rag_sources",
  "sources": [
    {
      "id": "src-001",
      "title": "bulk-upload.service.ts",
      "snippet": "Handles CSV parsing, row-level validation, batch import, and retry.",
      "score": 0.95,
      "sourceType": "angular-service",
      "filePath": "src/app/features/bulk-upload/bulk-upload.service.ts",
      "fileKind": "service",
      "repo": "retailops-pxm-web",
      "branch": "main"
    },
    {
      "id": "src-002",
      "title": "BulkUpload Guide",
      "snippet": "Step-by-step bulk import guide with error handling.",
      "score": 0.88,
      "sourceType": "documentation",
      "sourceUrl": "https://docs.example.com/bulk-upload"
    }
  ]
}`;

const TOOL_PAYLOAD_SNIPPET = `data: {
  "type": "tool_step",
  "step": {
    "id": "tl-step-abc123",
    "toolName": "Search codebase",
    "summary": "Found BulkUploadService at src/app/features/bulk-upload/",
    "status": "succeeded",
    "startedAt": "2026-05-16T10:00:01.000Z",
    "finishedAt": "2026-05-16T10:00:01.420Z"
  }
}`;

const APPROVAL_PAYLOAD_SNIPPET = `data: {
  "type": "approval_request",
  "approval": {
    "id": "apr-xyz789",
    "action": "bulk_delete_products",
    "summary": "Delete 142 archived products from catalog",
    "detail": "This will permanently remove 142 products with status ARCHIVED. This cannot be undone.",
    "tone": "destructive",
    "metadata": {
      "affectedCount": 142,
      "filter": "status = ARCHIVED"
    }
  }
}`;

const ERROR_PAYLOAD_SNIPPET = `data: {
  "type": "error",
  "code": "rate_limited",
  "message": "Request rate limit exceeded. Please wait 30 seconds.",
  "retryAfterSeconds": 30
}

// Other common error codes:
// "unauthorized"     — session token invalid or expired
// "context_too_long" — message history exceeds model context window
// "provider_error"   — upstream LLM provider returned an error
// "timeout"          — request exceeded the configured timeout`;

const DONE_EVENT_SNIPPET = `// The done event is always the final event in the stream.
// After receiving this, close the SSE connection.
data: {"type":"done"}

// Or with optional metadata:
data: {
  "type": "done",
  "finishedAt": "2026-05-16T10:00:02.140Z",
  "inputTokens": 412,
  "outputTokens": 183
}`;

@Component({
  selector: 'app-backend-contract-doc',
  standalone: true,
  imports: [DocsCodeBlockComponent],
  template: `
    <div class="article-header">
      <div class="header-meta">
        <span class="header-category">Production Guidance</span>
        <span class="badge badge-backend-required">Backend required</span>
      </div>
      <h1>Backend Contract</h1>
      <p class="header-desc">
        The HTTP API and Server-Sent Events format your backend must implement for
        <code>HttpCopilotBackendAdapter</code> to connect. Covers the request model, all SSE event
        types (chunks, RAG sources, tool steps, approval gates, errors, done), and deployment headers.
      </p>
    </div>

    <div class="callout callout-info">
      <strong>Local development:</strong> Use <code>MockCopilotBackendAdapter</code> to develop and test
      without a backend. Switch to <code>HttpCopilotBackendAdapter</code> pointing at your staging endpoint
      when you are ready to test the full integration end-to-end.
    </div>

    <!-- Chat endpoint -->
    <section id="chat-endpoint" class="contract-section">
      <h2>Chat Endpoint</h2>
      <p>
        Expose a single HTTP POST endpoint that accepts the conversation history and context,
        calls your LLM provider, and streams the response back as Server-Sent Events (SSE).
      </p>
      <app-docs-code-block language="http" [code]="chatEndpointSnippet" />
    </section>

    <!-- Request model -->
    <section id="request-model" class="contract-section">
      <h2>Request Model</h2>
      <p>Full TypeScript interface for the request body. All fields except <code>messages</code> are optional.</p>
      <app-docs-code-block language="typescript" [code]="requestModelSnippet" />
    </section>

    <!-- Response events -->
    <section id="response-events" class="contract-section">
      <h2>SSE Response Event Stream</h2>
      <p>
        Responses are streamed as <a href="https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events" target="_blank" rel="noopener">Server-Sent Events</a>.
        Each event is a JSON object with a <code>type</code> discriminant.
        The stream always ends with a <code>done</code> event.
      </p>
      <app-docs-code-block language="text" [code]="responseEventsSnippet" />
    </section>

    <!-- RAG payload -->
    <section id="rag-payload" class="contract-section">
      <h2>RAG Sources Event</h2>
      <p>
        Emit one <code>rag_sources</code> event per response to populate the SDK's citation cards.
        Emit it before or alongside the first <code>chunk</code> event — the SDK renders sources as soon as it receives them.
        See <code>RagResult</code> in the API Reference for all available fields.
      </p>
      <app-docs-code-block language="json" [code]="ragPayloadSnippet" />
    </section>

    <!-- Tool payload -->
    <section id="tool-payload" class="contract-section">
      <h2>Tool Step Event</h2>
      <p>
        Emit one <code>tool_step</code> event for each agent tool call to populate the SDK's tool timeline.
        Emit steps in real time as tools complete — the timeline renders incrementally.
        The <code>status</code> field must be one of: <code>succeeded</code>, <code>running</code>, or <code>failed</code>.
      </p>
      <app-docs-code-block language="json" [code]="toolPayloadSnippet" />
    </section>

    <!-- Approval payload -->
    <section id="approval-payload" class="contract-section">
      <h2>Approval Request Event</h2>
      <p>
        Emit an <code>approval_request</code> event when the agent wants to perform a potentially destructive or
        irreversible action. The SDK will pause execution and render an approval gate for the user.
        Only proceed after receiving confirmation via the <code>approvalDecision</code> output event.
      </p>
      <p>
        The <code>tone</code> field controls how the gate is styled: <code>destructive</code> (red) for irreversible
        actions, <code>caution</code> (amber) for large write operations, <code>info</code> (blue) for read-only confirmations.
      </p>
      <app-docs-code-block language="json" [code]="approvalPayloadSnippet" />
    </section>

    <!-- Error payload -->
    <section id="error-payload" class="contract-section">
      <h2>Error Event</h2>
      <p>
        Emit an <code>error</code> event when the request cannot be completed. Always follow with
        a <code>done</code> event so the SDK knows the stream has ended. The SDK surfaces the
        <code>message</code> field in the chat UI.
      </p>
      <app-docs-code-block language="json" [code]="errorPayloadSnippet" />
    </section>

    <!-- Done event -->
    <section id="done-event" class="contract-section">
      <h2>Done Event</h2>
      <p>
        The <code>done</code> event must be the last event in every SSE stream — whether the response
        completed normally or ended with an error. The SDK uses it to transition out of the loading state.
        Optional token usage metadata is available for billing or analytics.
      </p>
      <app-docs-code-block language="json" [code]="doneEventSnippet" />
    </section>

    <section class="sse-note" aria-labelledby="sse-headers-title">
      <div class="sse-note-head">
        <span class="sse-note-badge">Streaming</span>
        <h2 id="sse-headers-title">HTTP headers for SSE</h2>
      </div>
      <p class="sse-note-copy">
        Your backend endpoint should return these headers on the streaming route:
      </p>
      <div class="sse-header-list">
        <code>Content-Type: text/event-stream</code>
        <code>Cache-Control: no-cache</code>
        <code>X-Accel-Buffering: no</code>
      </div>
      <p class="sse-note-foot">
        Use <code>X-Accel-Buffering: no</code> when you are serving SSE through Nginx, and disable any
        response buffering middleware for this route so chunks flush immediately.
      </p>
    </section>
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
    .contract-section { margin-bottom: 2.5rem; }
    .contract-section h2 {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--text, #0f172a);
      margin: 0 0 0.65rem;
      padding-bottom: 0.4rem;
      border-bottom: 1px solid var(--border, #e2e8f0);
    }
    .contract-section p {
      font-size: 0.9rem;
      color: var(--text, #374151);
      line-height: 1.65;
      margin: 0 0 0.75rem;
    }
    .sse-note {
      margin-top: 2rem;
      padding: 1.1rem 1.15rem;
      border-radius: 1rem;
      border: 1px solid var(--border, #e2e8f0);
      background:
        radial-gradient(circle at top right, color-mix(in srgb, var(--accent, #4f46e5) 10%, transparent) 0%, transparent 24%),
        linear-gradient(180deg, color-mix(in srgb, var(--bg-subtle, #ffffff) 96%, transparent 4%), color-mix(in srgb, var(--bg-muted, #f8fafc) 92%, transparent 8%));
      box-shadow: var(--shadow-sm, none);
    }
    .sse-note-head {
      display: flex;
      align-items: center;
      gap: 0.7rem;
      flex-wrap: wrap;
      margin-bottom: 0.55rem;
    }
    .sse-note-head h2 {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
      color: var(--text, #0f172a);
      border: none;
      padding: 0;
    }
    .sse-note-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.22rem 0.62rem;
      border-radius: 999px;
      background: var(--accent-light, rgba(99,102,241,0.12));
      border: 1px solid var(--border-strong, rgba(99,102,241,0.28));
      color: var(--accent-text, #4338ca);
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .sse-note-copy,
    .sse-note-foot {
      margin: 0;
      font-size: 0.92rem;
      line-height: 1.65;
      color: var(--text, #334155);
    }
    .sse-header-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.55rem;
      margin: 0.9rem 0 0.85rem;
    }
    .sse-header-list code {
      display: inline-flex;
      align-items: center;
      min-height: 36px;
      padding: 0.42rem 0.72rem;
      border-radius: 999px;
      border: 1px solid color-mix(in srgb, var(--border, #dbe4f0) 85%, transparent 15%);
      background: color-mix(in srgb, var(--bg-card-solid, #ffffff) 88%, var(--accent-light, rgba(99,102,241,0.12)) 12%);
      color: var(--text, #0f172a);
      box-shadow: var(--shadow-sm, none);
    }
    a { color: #1d4ed8; }
    code {
      font-family: 'Fira Code', monospace;
      font-size: 0.84em;
      background: var(--bg-muted, #f1f5f9);
      padding: 0.1rem 0.3rem;
      border-radius: 4px;
    }
    :host-context([data-resolved-theme="dark"]) .callout-info,
    :host-context([data-theme="dark"]) .callout-info {
      background: rgba(30,58,138,0.2);
      border-color: rgba(30,58,138,0.4);
      color: #93c5fd;
    }
    :host-context([data-resolved-theme="dark"]) code,
    :host-context([data-theme="dark"]) code {
      background: #1e293b;
    }
    :host-context([data-resolved-theme="dark"]) .sse-note,
    :host-context([data-theme="dark"]) .sse-note {
      background:
        radial-gradient(circle at top right, rgba(91, 140, 255, 0.14) 0%, transparent 24%),
        linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.98));
      border-color: rgba(91, 140, 255, 0.24);
      box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
    }
    :host-context([data-resolved-theme="dark"]) .sse-note-head h2,
    :host-context([data-theme="dark"]) .sse-note-head h2,
    :host-context([data-resolved-theme="dark"]) .sse-note-copy,
    :host-context([data-theme="dark"]) .sse-note-copy,
    :host-context([data-resolved-theme="dark"]) .sse-note-foot,
    :host-context([data-theme="dark"]) .sse-note-foot {
      color: #d6deee;
    }
    :host-context([data-resolved-theme="dark"]) .sse-note-badge,
    :host-context([data-theme="dark"]) .sse-note-badge {
      background: rgba(91, 140, 255, 0.14);
      border-color: rgba(91, 140, 255, 0.3);
      color: #c5d4ff;
    }
    :host-context([data-resolved-theme="dark"]) .sse-header-list code,
    :host-context([data-theme="dark"]) .sse-header-list code {
      background: rgba(30, 41, 59, 0.96);
      border-color: rgba(91, 140, 255, 0.28);
      color: #e8eefc;
      box-shadow: none;
    }
  `],
})
export class BackendContractDocComponent {
  readonly chatEndpointSnippet = CHAT_ENDPOINT_SNIPPET;
  readonly requestModelSnippet = REQUEST_MODEL_SNIPPET;
  readonly responseEventsSnippet = RESPONSE_EVENTS_SNIPPET;
  readonly ragPayloadSnippet = RAG_PAYLOAD_SNIPPET;
  readonly toolPayloadSnippet = TOOL_PAYLOAD_SNIPPET;
  readonly approvalPayloadSnippet = APPROVAL_PAYLOAD_SNIPPET;
  readonly errorPayloadSnippet = ERROR_PAYLOAD_SNIPPET;
  readonly doneEventSnippet = DONE_EVENT_SNIPPET;
}
