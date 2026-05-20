export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[var(--copilot-ask)] to-[var(--copilot-agent)] bg-clip-text text-transparent">
            Angular Copilot Backend
          </h1>
          <p className="text-xl text-muted-foreground">
            Next.js API backend compatible with{' '}
            <code className="text-sm bg-muted px-2 py-1 rounded">@ankitparekh007/ngx-copilot-sdk</code>
          </p>
        </header>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">API Endpoints</h2>
          <p className="text-muted-foreground mb-6">
            These endpoints are designed to work with the <code className="text-sm bg-muted px-1 rounded">HttpCopilotBackendAdapter</code> from ngx-copilot-sdk.
          </p>
          
          <div className="space-y-4">
            <div className="p-6 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-500 rounded">POST</span>
                <code className="text-lg">/api/copilot/chat</code>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Non-streaming chat endpoint. Returns a complete <code className="text-xs bg-muted px-1 rounded">CopilotResponse</code>.
              </p>
              <details className="text-sm">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Request/Response</summary>
                <pre className="mt-2 p-4 bg-muted rounded-lg overflow-x-auto text-xs">{`// Request: CopilotRequest
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
}`}</pre>
              </details>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2 py-1 text-xs font-semibold bg-blue-500/20 text-blue-500 rounded">GET</span>
                <code className="text-lg">/api/copilot/chat/stream</code>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                SSE streaming endpoint. Emits <code className="text-xs bg-muted px-1 rounded">CopilotEvent</code> objects.
              </p>
              <details className="text-sm">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Query Parameters & Events</summary>
                <pre className="mt-2 p-4 bg-muted rounded-lg overflow-x-auto text-xs">{`// Query params
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
{ "type": "error", "error": {...} }`}</pre>
              </details>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-500 rounded">POST</span>
                <code className="text-lg">/api/copilot/rag/query</code>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                RAG search endpoint. Returns <code className="text-xs bg-muted px-1 rounded">RagResult[]</code>.
              </p>
              <details className="text-sm">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Request/Response</summary>
                <pre className="mt-2 p-4 bg-muted rounded-lg overflow-x-auto text-xs">{`// Request: RagQuery
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
]`}</pre>
              </details>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-500 rounded">POST</span>
                <code className="text-lg">/api/copilot/tools/execute</code>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Tool execution endpoint. Returns <code className="text-xs bg-muted px-1 rounded">ToolExecutionEvent</code>.
              </p>
              <details className="text-sm">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Request/Response</summary>
                <pre className="mt-2 p-4 bg-muted rounded-lg overflow-x-auto text-xs">{`// Request: ToolExecutionRequest
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
{ "type": "failed", "requestId": "...", "error": "..." }`}</pre>
              </details>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-500 rounded">POST</span>
                <code className="text-lg">/api/copilot/approvals/[id]/resolve</code>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Resolve approval request. Returns <code className="text-xs bg-muted px-1 rounded">CopilotEvent</code> (approval-resolved).
              </p>
              <details className="text-sm">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Request/Response</summary>
                <pre className="mt-2 p-4 bg-muted rounded-lg overflow-x-auto text-xs">{`// Request
{ "decision": "approved" } // or "rejected"

// Response: CopilotEvent
{
  "type": "approval-resolved",
  "requestId": "approval-123",
  "decision": "approved"
}`}</pre>
              </details>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Ingestion Endpoints</h2>
          <div className="space-y-4">
            <div className="p-6 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-500 rounded">POST</span>
                <code className="text-lg">/api/ingestion/documentation</code>
              </div>
              <p className="text-sm text-muted-foreground">
                Crawl and ingest documentation from a website URL. Stores chunks with embeddings in Supabase pgvector.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-500 rounded">POST</span>
                <code className="text-lg">/api/ingestion/github</code>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Scan and ingest Angular repository from GitHub. Works with both public repos and private repos (with token).
              </p>
              <details className="text-sm">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Request/Response</summary>
                <pre className="mt-2 p-4 bg-muted rounded-lg overflow-x-auto text-xs">{`// Request (option 1: owner + repo)
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
// Returns: { "job": { "status": "running", "progress": 45, ... } }`}</pre>
              </details>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-500 rounded">POST</span>
                <code className="text-lg">/api/ingestion/bitbucket</code>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Scan and ingest Angular repository from Bitbucket. Requires App Password authentication.
              </p>
              <details className="text-sm">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Request/Response</summary>
                <pre className="mt-2 p-4 bg-muted rounded-lg overflow-x-auto text-xs">{`// Request
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
}`}</pre>
              </details>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Angular SDK Integration</h2>
          <div className="p-6 rounded-xl border border-border bg-card font-mono text-sm space-y-6">
            <div>
              <p className="text-muted-foreground mb-2 font-sans"># Install ngx-copilot-sdk</p>
              <code className="block text-[var(--copilot-ask)]">npm install @ankitparekh007/ngx-copilot-sdk</code>
            </div>
            <div>
              <p className="text-muted-foreground mb-2 font-sans"># Configure in app.config.ts</p>
              <pre className="text-[var(--copilot-ask)] whitespace-pre-wrap">{`import { provideCopilotConfig } from '@ankitparekh007/ngx-copilot-sdk';

export const appConfig = {
  providers: [
    provideCopilotConfig({
      apiBaseUrl: '${typeof window !== 'undefined' ? window.location.origin : 'https://your-backend.example.com'}/api/copilot',
      defaultMode: 'ask',
      enableApprovals: true,
      enableRagSources: true,
      enableToolTimeline: true,
    }),
  ],
};`}</pre>
            </div>
            <div>
              <p className="text-muted-foreground mb-2 font-sans"># Add copilot shell to your app</p>
              <pre className="text-[var(--copilot-ask)] whitespace-pre-wrap">{`import { CopilotShellComponent } from '@ankitparekh007/ngx-copilot-sdk';

@Component({
  imports: [CopilotShellComponent],
  template: \`<copilot-shell />\`
})
export class AppComponent {}`}</pre>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Type Definitions</h2>
          <p className="text-muted-foreground mb-4">
            All types are defined in <code className="text-sm bg-muted px-1 rounded">lib/types/copilot.ts</code> and aligned with ngx-copilot-sdk contracts.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border bg-card">
              <h4 className="font-semibold mb-2">Core Models</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li><code className="text-xs bg-muted px-1 rounded">CopilotMessage</code></li>
                <li><code className="text-xs bg-muted px-1 rounded">RagResult</code></li>
                <li><code className="text-xs bg-muted px-1 rounded">ApprovalRequest</code></li>
                <li><code className="text-xs bg-muted px-1 rounded">ToolTimelineItem</code></li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <h4 className="font-semibold mb-2">Adapter Models</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li><code className="text-xs bg-muted px-1 rounded">CopilotRequest</code></li>
                <li><code className="text-xs bg-muted px-1 rounded">CopilotResponse</code></li>
                <li><code className="text-xs bg-muted px-1 rounded">CopilotEvent</code></li>
                <li><code className="text-xs bg-muted px-1 rounded">CopilotContext</code></li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
