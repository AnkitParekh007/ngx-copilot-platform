import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
<main class="min-h-screen bg-background text-foreground p-8">
  <div class="max-w-5xl mx-auto">

    <header class="mb-12">
      <h1 class="text-4xl font-bold mb-4 bg-gradient-to-r from-[var(--copilot-ask)] to-[var(--copilot-agent)] bg-clip-text text-transparent">
        Angular Copilot Backend
      </h1>
      <p class="text-xl text-muted-foreground">
        Next.js API backend compatible with
        <code class="text-sm bg-muted px-2 py-1 rounded">&#64;ankitparekh007/ngx-copilot-sdk</code>
      </p>
    </header>

    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">API Endpoints</h2>
      <p class="text-muted-foreground mb-6">
        These endpoints are designed to work with the <code class="text-sm bg-muted px-1 rounded">HttpCopilotBackendAdapter</code> from ngx-copilot-sdk.
      </p>

      <div class="space-y-4">

        <div class="p-6 rounded-xl border border-border bg-card">
          <div class="flex items-center gap-3 mb-3">
            <span class="px-2 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-500 rounded">POST</span>
            <code class="text-lg">/api/copilot/chat</code>
          </div>
          <p class="text-sm text-muted-foreground mb-3">
            Non-streaming chat endpoint. Returns a complete <code class="text-xs bg-muted px-1 rounded">CopilotResponse</code>.
          </p>
          <details class="text-sm">
            <summary class="cursor-pointer text-muted-foreground hover:text-foreground">Request/Response</summary>
            <pre class="mt-2 p-4 bg-muted rounded-lg overflow-x-auto text-xs">{{ chatEndpointExample }}</pre>
          </details>
        </div>

        <div class="p-6 rounded-xl border border-border bg-card">
          <div class="flex items-center gap-3 mb-3">
            <span class="px-2 py-1 text-xs font-semibold bg-blue-500/20 text-blue-500 rounded">GET</span>
            <code class="text-lg">/api/copilot/chat/stream</code>
          </div>
          <p class="text-sm text-muted-foreground mb-3">
            SSE streaming endpoint. Emits <code class="text-xs bg-muted px-1 rounded">CopilotEvent</code> objects.
          </p>
          <details class="text-sm">
            <summary class="cursor-pointer text-muted-foreground hover:text-foreground">Query Parameters &amp; Events</summary>
            <pre class="mt-2 p-4 bg-muted rounded-lg overflow-x-auto text-xs">{{ streamEndpointExample }}</pre>
          </details>
        </div>

        <div class="p-6 rounded-xl border border-border bg-card">
          <div class="flex items-center gap-3 mb-3">
            <span class="px-2 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-500 rounded">POST</span>
            <code class="text-lg">/api/copilot/rag/query</code>
          </div>
          <p class="text-sm text-muted-foreground mb-3">
            RAG search endpoint. Returns <code class="text-xs bg-muted px-1 rounded">RagResult[]</code>.
          </p>
          <details class="text-sm">
            <summary class="cursor-pointer text-muted-foreground hover:text-foreground">Request/Response</summary>
            <pre class="mt-2 p-4 bg-muted rounded-lg overflow-x-auto text-xs">{{ ragEndpointExample }}</pre>
          </details>
        </div>

        <div class="p-6 rounded-xl border border-border bg-card">
          <div class="flex items-center gap-3 mb-3">
            <span class="px-2 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-500 rounded">POST</span>
            <code class="text-lg">/api/copilot/tools/execute</code>
          </div>
          <p class="text-sm text-muted-foreground mb-3">
            Tool execution endpoint. Returns <code class="text-xs bg-muted px-1 rounded">ToolExecutionEvent</code>.
          </p>
          <details class="text-sm">
            <summary class="cursor-pointer text-muted-foreground hover:text-foreground">Request/Response</summary>
            <pre class="mt-2 p-4 bg-muted rounded-lg overflow-x-auto text-xs">{{ toolsEndpointExample }}</pre>
          </details>
        </div>

        <div class="p-6 rounded-xl border border-border bg-card">
          <div class="flex items-center gap-3 mb-3">
            <span class="px-2 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-500 rounded">POST</span>
            <code class="text-lg">/api/copilot/approvals/[id]/resolve</code>
          </div>
          <p class="text-sm text-muted-foreground mb-3">
            Resolve approval request. Returns <code class="text-xs bg-muted px-1 rounded">CopilotEvent</code> (approval-resolved).
          </p>
          <details class="text-sm">
            <summary class="cursor-pointer text-muted-foreground hover:text-foreground">Request/Response</summary>
            <pre class="mt-2 p-4 bg-muted rounded-lg overflow-x-auto text-xs">{{ approvalsEndpointExample }}</pre>
          </details>
        </div>

      </div>
    </section>

    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">Ingestion Endpoints</h2>
      <div class="space-y-4">

        <div class="p-6 rounded-xl border border-border bg-card">
          <div class="flex items-center gap-3 mb-3">
            <span class="px-2 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-500 rounded">POST</span>
            <code class="text-lg">/api/ingestion/documentation</code>
          </div>
          <p class="text-sm text-muted-foreground">
            Crawl and ingest documentation from a website URL. Stores chunks with embeddings in Supabase pgvector.
          </p>
        </div>

        <div class="p-6 rounded-xl border border-border bg-card">
          <div class="flex items-center gap-3 mb-3">
            <span class="px-2 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-500 rounded">POST</span>
            <code class="text-lg">/api/ingestion/github</code>
          </div>
          <p class="text-sm text-muted-foreground mb-3">
            Scan and ingest Angular repository from GitHub. Works with both public repos and private repos (with token).
          </p>
          <details class="text-sm">
            <summary class="cursor-pointer text-muted-foreground hover:text-foreground">Request/Response</summary>
            <pre class="mt-2 p-4 bg-muted rounded-lg overflow-x-auto text-xs">{{ githubIngestionExample }}</pre>
          </details>
        </div>

        <div class="p-6 rounded-xl border border-border bg-card">
          <div class="flex items-center gap-3 mb-3">
            <span class="px-2 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-500 rounded">POST</span>
            <code class="text-lg">/api/ingestion/bitbucket</code>
          </div>
          <p class="text-sm text-muted-foreground mb-3">
            Scan and ingest Angular repository from Bitbucket. Requires App Password authentication.
          </p>
          <details class="text-sm">
            <summary class="cursor-pointer text-muted-foreground hover:text-foreground">Request/Response</summary>
            <pre class="mt-2 p-4 bg-muted rounded-lg overflow-x-auto text-xs">{{ bitbucketIngestionExample }}</pre>
          </details>
        </div>

      </div>
    </section>

    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">Angular SDK Integration</h2>
      <div class="p-6 rounded-xl border border-border bg-card font-mono text-sm space-y-6">
        <div>
          <p class="text-muted-foreground mb-2 font-sans"># Install ngx-copilot-sdk</p>
          <code class="block text-[var(--copilot-ask)]">npm install &#64;ankitparekh007/ngx-copilot-sdk</code>
        </div>
        <div>
          <p class="text-muted-foreground mb-2 font-sans"># Configure in app.config.ts</p>
          <pre class="text-[var(--copilot-ask)] whitespace-pre-wrap">{{ sdkConfigExample }}</pre>
        </div>
        <div>
          <p class="text-muted-foreground mb-2 font-sans"># Add copilot shell to your app</p>
          <pre class="text-[var(--copilot-ask)] whitespace-pre-wrap">{{ sdkUsageExample }}</pre>
        </div>
      </div>
    </section>

    <section>
      <h2 class="text-2xl font-semibold mb-4">Type Definitions</h2>
      <p class="text-muted-foreground mb-4">
        All types are defined in <code class="text-sm bg-muted px-1 rounded">lib/types/copilot.ts</code> and aligned with ngx-copilot-sdk contracts.
      </p>
      <div class="grid md:grid-cols-2 gap-4">
        <div class="p-4 rounded-lg border border-border bg-card">
          <h4 class="font-semibold mb-2">Core Models</h4>
          <ul class="text-sm text-muted-foreground space-y-1">
            <li><code class="text-xs bg-muted px-1 rounded">CopilotMessage</code></li>
            <li><code class="text-xs bg-muted px-1 rounded">RagResult</code></li>
            <li><code class="text-xs bg-muted px-1 rounded">ApprovalRequest</code></li>
            <li><code class="text-xs bg-muted px-1 rounded">ToolTimelineItem</code></li>
          </ul>
        </div>
        <div class="p-4 rounded-lg border border-border bg-card">
          <h4 class="font-semibold mb-2">Adapter Models</h4>
          <ul class="text-sm text-muted-foreground space-y-1">
            <li><code class="text-xs bg-muted px-1 rounded">CopilotRequest</code></li>
            <li><code class="text-xs bg-muted px-1 rounded">CopilotResponse</code></li>
            <li><code class="text-xs bg-muted px-1 rounded">CopilotEvent</code></li>
            <li><code class="text-xs bg-muted px-1 rounded">CopilotContext</code></li>
          </ul>
        </div>
      </div>
    </section>

  </div>
</main>
  `,
})
export class HomeComponent {
  readonly chatEndpointExample = `// Request: CopilotRequest
{
  "sessionId": "optional-session-id",
  "message": "How does SKU syndication work?",
  "mode": "ask", // ask | plan | execute | debug
  "context": {
    "route": "/products",
    "title": "Product List"
  }
}

// Response: CopilotResponse
{
  "message": {
    "id": "msg-123",
    "role": "assistant",
    "content": "SKU syndication is...",
    "createdAt": "2024-01-01T00:00:00Z",
    "sources": [...]
  },
  "sources": [...]
}`;

  readonly streamEndpointExample = `// Query params
?message=How+does+syndication+work&mode=ask&sessionId=optional

// SSE Events (CopilotEvent union type):
{ "type": "session-started", "sessionId": "..." }
{ "type": "message-start", "messageId": "..." }
{ "type": "message-chunk", "messageId": "...", "content": "..." }
{ "type": "message-complete", "message": {...} }
{ "type": "sources", "sources": [...] }
{ "type": "tool-timeline", "items": [...] }
{ "type": "approval-required", "request": {...} }
{ "type": "done" }
{ "type": "error", "error": {...} }`;

  readonly ragEndpointExample = `// Request: RagQuery
{
  "query": "upload workflow",
  "context": { "route": "/uploads" },
  "limit": 10
}

// Response: RagResult[]
[
  {
    "id": "chunk-123",
    "title": "Upload Component",
    "snippet": "The upload component handles...",
    "score": 0.89,
    "sourceType": "code",
    "filePath": "src/app/upload/upload.component.ts",
    "fileKind": "component",
    "repo": "angular-app",
    "branch": "main"
  }
]`;

  readonly toolsEndpointExample = `// Request: ToolExecutionRequest
{
  "toolName": "navigate",
  "input": { "url": "/products" },
  "requiresApproval": false
}

// Response: ToolExecutionEvent
{ "type": "started", "toolName": "navigate", "requestId": "..." }
// or
{ "type": "approval-required", "request": {...} }
// or
{ "type": "completed", "requestId": "...", "output": {...} }
// or
{ "type": "failed", "requestId": "...", "error": "..." }`;

  readonly approvalsEndpointExample = `// Request
{ "decision": "approved" } // or "rejected"

// Response: CopilotEvent
{
  "type": "approval-resolved",
  "requestId": "approval-123",
  "decision": "approved"
}`;

  readonly githubIngestionExample = `// Request (option 1: owner + repo)
{
  "owner": "AnkitParekh007",
  "repo": "ngx-copilot-sdk",
  "branch": "main",
  "token": "ghp_xxx" // optional for public repos
}

// Request (option 2: full URL)
{
  "repoUrl": "https://github.com/AnkitParekh007/ngx-copilot-platform",
  "branch": "main",
  "token": "ghp_xxx" // optional for public repos
}

// Response
{
  "success": true,
  "jobId": "job-uuid",
  "message": "Started ingesting AnkitParekh007/ngx-copilot-sdk (branch: main)"
}

// GET /api/ingestion/github?action=branches&owner=...&repo=...
// Returns: { "branches": [{ "name": "main", "isDefault": true }] }

// GET /api/ingestion/github?jobId=...
// Returns: { "job": { "status": "running", "progress": 45, ... } }`;

  readonly bitbucketIngestionExample = `// Request
{
  "workspace": "my-workspace",
  "repoSlug": "angular-app",
  "branch": "main",
  "username": "bitbucket-username",
  "appPassword": "app-password"
}

// Response
{
  "success": true,
  "jobId": "job-uuid",
  "message": "Started ingesting angular-app (branch: main)"
}`;

  readonly sdkConfigExample = `import { provideCopilotConfig } from '@ankitparekh007/ngx-copilot-sdk';

export const appConfig = {
  providers: [
    provideCopilotConfig({
      apiBaseUrl: \`\${window.location.origin}/api/copilot\`,
      defaultMode: 'ask',
      enableApprovals: true,
      enableRagSources: true,
      enableToolTimeline: true,
    }),
  ],
};`;

  readonly sdkUsageExample = `import { CopilotShellComponent } from '@ankitparekh007/ngx-copilot-sdk';

@Component({
  imports: [CopilotShellComponent],
  template: \`<copilot-shell />\`
})
export class AppComponent {}`;
}
