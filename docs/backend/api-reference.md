# API Reference

Complete API reference for the ngx-copilot-sdk backend.

## Base URL

```
https://your-backend.example.com/api/copilot
```

---

## Chat Endpoints

### POST /chat

Send a message and receive a non-streaming response.

**Request:**
```typescript
interface CopilotRequest {
  conversationId?: string;
  message: CopilotMessage;
  mode: 'ask' | 'plan' | 'agent';
  context?: CopilotContext;
  history?: CopilotMessage[];
}

interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface CopilotContext {
  currentRoute?: string;
  currentPage?: string;
  selectedEntity?: {
    type: string;
    id: string;
    data?: Record<string, unknown>;
  };
  userRole?: string;
  tenantId?: string;
  metadata?: Record<string, unknown>;
}
```

**Response:**
```typescript
interface CopilotResponse {
  conversationId: string;
  message: CopilotMessage;
  sources?: RagResult[];
  plan?: WorkflowPlan;
  toolTimeline?: ToolTimelineItem[];
  suggestions?: FollowUpSuggestion[];
  approvalRequired?: ApprovalRequest;
}
```

---

### GET /chat/stream

Stream a response using Server-Sent Events.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `conversationId` | string | No | Existing conversation ID |
| `message` | string | Yes | User message (URL encoded) |
| `mode` | string | Yes | `ask`, `plan`, or `agent` |
| `context` | string | No | JSON-encoded CopilotContext |

**Response:** Server-Sent Events stream

```typescript
interface CopilotEvent {
  type: CopilotEventType;
  payload: unknown;
  timestamp: string;
}

type CopilotEventType =
  | 'thinking'
  | 'text_chunk'
  | 'sources'
  | 'tool_start'
  | 'tool_progress'
  | 'tool_complete'
  | 'plan_ready'
  | 'approval_required'
  | 'suggestions'
  | 'complete'
  | 'error';
```

**Event Payloads:**

```typescript
// thinking
{ status: 'Analyzing your request...' }

// text_chunk
{ delta: 'partial text', index: 0 }

// sources
{ sources: RagResult[] }

// tool_start
{ toolId: string, toolName: string, description: string }

// tool_progress
{ toolId: string, progress: number, status: string }

// tool_complete
{ toolId: string, result: unknown, success: boolean }

// plan_ready
{ plan: WorkflowPlan }

// approval_required
{ approval: ApprovalRequest }

// suggestions
{ suggestions: FollowUpSuggestion[] }

// complete
{ messageId: string, conversationId: string }

// error
{ code: string, message: string }
```

---

## RAG Endpoints

### POST /rag/query

Search documentation and code using semantic similarity.

**Request:**
```typescript
interface RagQuery {
  query: string;
  sources?: ('documentation' | 'code' | 'all')[];
  filters?: {
    repoSlug?: string;
    branch?: string;
    componentType?: string;
    tags?: string[];
  };
  limit?: number;
  threshold?: number;
}
```

**Response:**
```typescript
interface RagQueryResponse {
  results: RagResult[];
  query: string;
  totalResults: number;
}

interface RagResult {
  id: string;
  type: 'documentation' | 'code';
  title: string;
  content: string;
  url?: string;
  filePath?: string;
  lineStart?: number;
  lineEnd?: number;
  similarity: number;
  componentType?: string;
  repoSlug?: string;
  branch?: string;
  tags?: string[];
}
```

---

## Tool Endpoints

### POST /tools/execute

Execute a tool action (typically called by the AI agent).

**Request:**
```typescript
interface ToolExecutionRequest {
  conversationId: string;
  toolName: string;
  toolCallId: string;
  parameters: Record<string, unknown>;
  requiresApproval?: boolean;
}
```

**Response:**
```typescript
interface ToolExecutionResponse {
  toolCallId: string;
  status: 'completed' | 'pending_approval' | 'failed';
  result?: unknown;
  error?: string;
  approvalId?: string;
}
```

---

## Approval Endpoints

### POST /approvals/:id/resolve

Approve or reject a pending action.

**Request:**
```typescript
interface ApprovalResolution {
  approved: boolean;
  reason?: string;
}
```

**Response:**
```typescript
interface ApprovalResolutionResponse {
  success: boolean;
  approvalId: string;
  status: 'approved' | 'rejected';
  executionResult?: unknown;
}
```

### GET /approvals

List pending approvals.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `conversationId` | string | Filter by conversation |
| `status` | string | `pending`, `approved`, `rejected` |

**Response:**
```typescript
interface ApprovalListResponse {
  approvals: ApprovalRequest[];
}

interface ApprovalRequest {
  id: string;
  conversationId: string;
  actionType: string;
  actionName: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  parameters: Record<string, unknown>;
  consequences?: string[];
  createdAt: string;
}
```

---

## Ingestion Endpoints

### POST /ingestion/github

Ingest an Angular repository from GitHub.

**Request:**
```typescript
interface GitHubIngestionRequest {
  // Option 1: owner + repo
  owner?: string;
  repo?: string;
  
  // Option 2: full URL
  repoUrl?: string;
  
  // Common options
  branch?: string;
  token?: string; // Required for private repos
  paths?: string[]; // Specific paths to scan
  excludePaths?: string[]; // Paths to exclude
}
```

**Response:**
```typescript
interface IngestionResponse {
  success: boolean;
  jobId: string;
  message: string;
}
```

### POST /ingestion/bitbucket

Ingest an Angular repository from Bitbucket.

**Request:**
```typescript
interface BitbucketIngestionRequest {
  workspace: string;
  repoSlug: string;
  branch?: string;
  username: string;
  appPassword: string;
  paths?: string[];
  excludePaths?: string[];
}
```

### POST /ingestion/documentation

Crawl and ingest a documentation website.

**Request:**
```typescript
interface DocumentationIngestionRequest {
  url: string;
  maxDepth?: number;
  maxPages?: number;
  allowedDomains?: string[];
  excludePatterns?: string[];
  selectors?: {
    content?: string;
    title?: string;
    exclude?: string[];
  };
}
```

### GET /ingestion/:provider

Get ingestion job status.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `jobId` | string | Job ID to check status |
| `action` | string | `status`, `branches`, `repos` |

**Response:**
```typescript
interface IngestionJob {
  id: string;
  type: 'documentation' | 'github' | 'bitbucket';
  source: string;
  branch?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  totalItems: number;
  processedItems: number;
  error?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}
```

### DELETE /ingestion/:provider

Clear ingested data for a source.

**Request:**
```typescript
interface ClearIngestionRequest {
  source: string; // repo slug or URL
  branch?: string;
}
```

---

## Error Handling

All endpoints return errors in a consistent format:

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
```

**Common Error Codes:**

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_REQUEST` | 400 | Missing or invalid parameters |
| `UNAUTHORIZED` | 401 | Invalid or missing authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | External service down |

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/chat/stream` | 60 requests/minute |
| `/rag/query` | 120 requests/minute |
| `/tools/execute` | 30 requests/minute |
| `/ingestion/*` | 10 requests/hour |

---

## WebSocket Alternative

For real-time bidirectional communication, a WebSocket endpoint is also available:

```
wss://your-backend.example.com/api/copilot/ws
```

**Message Format:**
```typescript
interface WebSocketMessage {
  type: 'request' | 'event' | 'ping' | 'pong';
  payload: CopilotRequest | CopilotEvent;
  id?: string;
}
```
