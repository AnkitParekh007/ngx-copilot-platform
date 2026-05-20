# Architecture

The ngx-copilot-sdk backend provides a complete AI copilot infrastructure for Angular applications. It handles RAG (Retrieval-Augmented Generation), code/documentation ingestion, browser automation, and enterprise approval workflows.

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Angular Application                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      ngx-copilot-sdk (Frontend)                      │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │ Copilot  │ │  Chat    │ │   RAG    │ │  Tool    │ │ Approval │   │   │
│  │  │  Shell   │ │ Messages │ │  Cards   │ │ Timeline │ │   Card   │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │   │
│  │                              │                                       │   │
│  │  ┌──────────────────────────┴────────────────────────────────────┐  │   │
│  │  │              HttpCopilotBackendAdapter (SSE)                   │  │   │
│  │  └──────────────────────────┬────────────────────────────────────┘  │   │
│  └─────────────────────────────┼────────────────────────────────────────┘   │
└────────────────────────────────┼────────────────────────────────────────────┘
                                 │
                    HTTPS (SSE Streaming)
                                 │
┌────────────────────────────────┼────────────────────────────────────────────┐
│                    ngx-copilot-sdk Backend (Next.js)                        │
│  ┌─────────────────────────────┴────────────────────────────────────────┐   │
│  │                         API Routes                                    │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │  /chat   │ │  /rag    │ │ /tools   │ │/approvals│ │/ingestion│   │   │
│  │  │  stream  │ │  query   │ │ execute  │ │ resolve  │ │ github   │   │   │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘   │   │
│  └───────┼────────────┼────────────┼────────────┼────────────┼──────────┘   │
│          │            │            │            │            │              │
│  ┌───────┴────────────┴────────────┴────────────┴────────────┴──────────┐   │
│  │                          Core Services                                │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │   RAG    │ │Embedding │ │ Browser  │ │  Audit   │ │ Copilot  │   │   │
│  │  │ Service  │ │ Service  │ │  Agent   │ │ Service  │ │  Tools   │   │   │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘   │   │
│  └───────┼────────────┼────────────┼────────────┼────────────┼──────────┘   │
└──────────┼────────────┼────────────┼────────────┼────────────┼──────────────┘
           │            │            │            │            │
     ┌─────┴─────┐ ┌────┴────┐ ┌────┴────┐ ┌────┴────┐ ┌─────┴─────┐
     │ Supabase  │ │ OpenAI  │ │Playwright│ │ Supabase│ │  GitHub/  │
     │ pgvector  │ │Embedding│ │ Browser  │ │  Logs   │ │ Bitbucket │
     └───────────┘ └─────────┘ └──────────┘ └─────────┘ └───────────┘
```

## Core Components

### 1. Chat Orchestration

The chat system supports three modes:

| Mode | Purpose | Key Features |
|------|---------|--------------|
| **Ask** | Q&A with RAG | Retrieves docs/code, generates answer with citations |
| **Plan** | Workflow planning | Creates step-by-step plans, requires approval |
| **Agent** | Browser automation | Executes actions in the Angular app via Playwright |

### 2. RAG Pipeline

```
User Query → Embedding → Vector Search → Context Building → LLM → Response
                              │
                    ┌─────────┴─────────┐
                    │                   │
              Documents Table    Code Chunks Table
              (pgvector)         (pgvector)
```

### 3. Ingestion Pipeline

```
Source (GitHub/Bitbucket/Docs URL)
           │
           ▼
    ┌──────────────┐
    │   Crawler    │ ← Fetches files/pages
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │   Parser     │ ← Extracts Angular metadata (components, routes, selectors)
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │   Chunker    │ ← Splits into semantic chunks
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  Embedder    │ ← OpenAI text-embedding-3-small
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  Supabase    │ ← Stores with pgvector
    └──────────────┘
```

### 4. Browser Agent

The browser agent uses Playwright to perform actions in the Angular application:

```
LLM Decision → Tool Call → Action Validator → Risk Assessment
                                                    │
                          ┌─────────────────────────┴─────────────────────────┐
                          │                         │                         │
                      Low Risk                  Medium Risk               High Risk
                     (navigate)               (click, fill)           (submit, delete)
                          │                         │                         │
                   Execute Now              Execute Now              Request Approval
                          │                         │                         │
                          └─────────────────────────┴─────────────────────────┘
                                                    │
                                               Playwright
                                                    │
                                            Angular App (Browser)
```

## Database Schema

### Tables

| Table | Purpose |
|-------|---------|
| `documents` | Crawled documentation with embeddings |
| `code_chunks` | Repository code with embeddings |
| `conversations` | Chat history and context |
| `ingestion_jobs` | Crawl/sync job status |
| `audit_logs` | Enterprise audit trail |
| `browser_sessions` | Playwright session tracking |
| `action_queue` | Pending approval actions |

### Vector Search Functions

- `match_documents(embedding, threshold, count)` - Search documentation
- `match_code_chunks(embedding, threshold, count)` - Search code

## Event Flow (SSE)

The backend streams events to the frontend using Server-Sent Events:

```typescript
type CopilotEventType =
  | 'thinking'        // AI is processing
  | 'text_chunk'      // Streaming text token
  | 'sources'         // RAG results ready
  | 'tool_start'      // Tool execution started
  | 'tool_progress'   // Tool execution progress
  | 'tool_complete'   // Tool execution finished
  | 'plan_ready'      // Plan generated, awaiting approval
  | 'approval_required' // Action needs user confirmation
  | 'complete'        // Response finished
  | 'error'           // Error occurred
```

## Security Model

1. **Action Risk Classification** - All browser actions are classified by risk level
2. **Approval Workflow** - High-risk actions require explicit user approval
3. **Audit Logging** - All actions are logged with full context
4. **No Arbitrary Execution** - LLM cannot execute arbitrary code
5. **Selector Safety** - Prefers data-testid, then ARIA roles, then CSS selectors

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `OPENAI_API_KEY` | Yes | OpenAI API key for embeddings |
| `GITHUB_TOKEN` | No | GitHub PAT for private repos |
| `BITBUCKET_USERNAME` | No | Bitbucket username |
| `BITBUCKET_APP_PASSWORD` | No | Bitbucket app password |
