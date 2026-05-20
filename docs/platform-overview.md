# Platform Overview

`ngx-copilot-platform` is a full-stack monorepo that combines two complementary systems:

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  Angular App (your enterprise app)                               │
│                                                                  │
│  ┌─────────────────────────────────────┐                        │
│  │  @ankitparekh007/ngx-copilot-sdk   │                        │
│  │  ┌─────────────────────────────┐    │                        │
│  │  │  <ngx-copilot-shell>        │    │                        │
│  │  │  CopilotShellComponent      │    │                        │
│  │  │  RagSourceCardComponent     │    │                        │
│  │  │  ToolCallTimelineComponent  │    │                        │
│  │  │  ApprovalCardComponent      │    │                        │
│  │  └──────────────┬──────────────┘    │                        │
│  │                 │  CopilotBackendAdapter                     │
│  │  ┌──────────────▼──────────────┐    │                        │
│  │  │  NgxCopilotPlatformBackend  │    │                        │
│  │  │  Adapter (cpk_ auth + SSE)  │    │                        │
│  │  └──────────────┬──────────────┘    │                        │
│  └─────────────────│───────────────────┘                        │
└────────────────────│───────────────────────────────────────────┘
                     │  HTTPS + SSE
                     ▼
┌──────────────────────────────────────────────────────────────────┐
│  packages/backend  (Next.js — self-hosted, any platform)         │
│                                                                  │
│  /api/copilot/chat/stream   ← SSE streaming chat                │
│  /api/copilot/rag/query     ← Vector search                     │
│  /api/copilot/tools/execute ← Tool execution                    │
│  /api/copilot/approvals/*/resolve ← Approval resolution        │
│  /api/ingestion/github      ← Repo ingestion                    │
│  /api/ingestion/bitbucket   ← Repo ingestion                    │
│  /api/ingestion/documentation ← Web/docs ingestion              │
│  /api/health                ← Health check                      │
│                                                                  │
│  ┌──────────┐  ┌─────────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Supabase │  │  OpenAI     │  │ Upstash  │  │  Playwright │  │
│  │ pgvector │  │  Embeddings │  │  Redis   │  │  (crawler)  │  │
│  └──────────┘  └─────────────┘  └──────────┘  └────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. Adapter Pattern (SDK)

The SDK's `CopilotBackendAdapter` interface decouples UI components from any backend. Three adapters ship out of the box:

| Adapter | Use case |
|---|---|
| `MockCopilotBackendAdapter` | Local dev, tests, CI — zero dependencies |
| `HttpCopilotBackendAdapter` | Generic HTTP/SSE backend (bring your own) |
| `NgxCopilotPlatformBackendAdapter` | **This platform's backend** (recommended) |

### 2. API Key Authentication

The backend uses `cpk_` prefixed API keys — never LLM provider keys. Angular apps authenticate as:
```
Authorization: Bearer cpk_your_key_here
```
Keys are set in `packages/backend/.env.local` as `COPILOT_API_KEYS=cpk_key1,cpk_key2`.

### 3. Streaming via SSE

Chat responses stream token-by-token via Server-Sent Events (fetch streaming). The `NgxCopilotPlatformBackendAdapter` handles SSE parsing and maps events to the SDK's `CopilotEvent` discriminated union.

### 4. Vector Store (Supabase)

All ingested content is stored as pgvector embeddings in Supabase. The RAG pipeline:
1. Ingestion: chunk → embed (OpenAI) → store in Supabase
2. Retrieval: embed query → cosine similarity search → return top-k chunks
3. Augmentation: inject chunks into LLM prompt → stream response

## Quick Navigation

| What you want | Where to look |
|---|---|
| Use the SDK in an Angular app | `apps/example-consumer/` |
| SDK component API | `packages/sdk/src/lib/components/` |
| Backend API endpoints | `packages/backend/app/api/` |
| Ingest a GitHub repo | `examples/github-ingestion/` |
| Ingest a Bitbucket repo | `examples/bitbucket-ingestion/` |
| Full enterprise demo | `examples/enterprise-rag-demo/` |
| Admin panel | `apps/admin-ui/` |
| Live docs + showcase | https://ankitparekh007.github.io/ngx-copilot-platform/ |
