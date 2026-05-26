# API Reference

Current backend contract for `ngx-copilot-platform`.

## Base URL

```text
https://your-backend.example.com/api/copilot
```

## Chat Endpoints

### `POST /chat`

Non-streaming response.

```ts
interface CopilotRequest {
  sessionId?: string;
  message: string;
  mode: 'ask' | 'plan' | 'execute' | 'debug';
  context?: {
    currentUrl?: string;
    pageTitle?: string;
    selectedText?: string;
    customContext?: Record<string, unknown>;
  };
}
```

```ts
interface CopilotResponse {
  message: CopilotMessage;
  sources?: RagResult[];
}
```

### `POST /chat/stream`

Streaming SSE response. This is the contract used by `NgxCopilotPlatformBackendAdapter`.

Request body:

```ts
interface CopilotRequest {
  sessionId?: string;
  message: string;
  mode: 'ask' | 'plan' | 'execute' | 'debug';
  context?: {
    currentUrl?: string;
    pageTitle?: string;
    selectedText?: string;
    customContext?: Record<string, unknown>;
  };
}
```

Response:

```text
Content-Type: text/event-stream
```

SSE event payloads are newline-delimited `data:` records containing one `CopilotEvent` each:

```ts
type CopilotEvent =
  | { type: 'session-started'; sessionId: string }
  | { type: 'message-start'; messageId: string }
  | { type: 'message-chunk'; messageId: string; content: string }
  | { type: 'message-complete'; message: CopilotMessage }
  | { type: 'sources'; sources: RagResult[] }
  | { type: 'tool-timeline'; items: ToolTimelineItem[] }
  | { type: 'approval-required'; request: ApprovalRequest }
  | { type: 'approval-resolved'; requestId: string; decision: 'approved' | 'rejected' }
  | { type: 'done' }
  | { type: 'error'; error: CopilotAdapterError };
```

## RAG Endpoint

### `POST /rag/query`

Semantic search against ingested docs and code.

```ts
interface RagQuery {
  query: string;
  filters?: {
    sources?: Array<'documentation' | 'code'>;
    repoSlug?: string;
    branch?: string;
    componentType?: string;
  };
  limit?: number;
  threshold?: number;
}
```

Response:

```ts
type RagQueryResponse = RagResult[];
```

## Tool Endpoint

### `POST /tools/execute`

```ts
interface ToolExecutionRequest {
  toolName: string;
  toolCallId: string;
  args: Record<string, unknown>;
  conversationId?: string;
}
```

```ts
type ToolExecutionEvent =
  | { type: 'approval-required'; request: ApprovalRequest }
  | { type: 'completed'; requestId: string; output: Record<string, unknown> }
  | { type: 'failed'; requestId: string; error: string };
```

## Approval Endpoint

### `POST /approvals/:id/resolve`

```ts
interface ApprovalResolutionRequest {
  decision: 'approved' | 'rejected';
}
```

Returns an `approval-resolved` `CopilotEvent`.

## Auth

- SDK/browser clients authenticate with `Authorization: Bearer cpk_*`
- `X-API-Key` is also accepted by the backend auth middleware

## Notes

- `POST /chat/stream` is the authoritative streaming contract for the platform adapter.
- `POST /rag/query` returns a raw `RagResult[]`, not an envelope object.
- Backend mode names are `ask | plan | execute | debug`.
