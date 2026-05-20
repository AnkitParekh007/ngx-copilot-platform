# Bitbucket Ingestion Example

Demonstrates how the ngx-copilot-platform backend ingests Bitbucket repositories into the Supabase vector store for RAG retrieval.

## What it does

1. Fetches source files from a Bitbucket repository via the Bitbucket REST API
2. Chunks TypeScript/Angular source files into semantically meaningful pieces
3. Generates OpenAI embeddings for each chunk
4. Stores chunks + embeddings in Supabase `pgvector` for retrieval

## API Endpoint

```
POST /api/ingestion/bitbucket
Authorization: Bearer cpk_master_your_key
Content-Type: application/json

{
  "workspace": "your-workspace",
  "repoSlug": "your-repo",
  "branch": "main"
}
```

## Service source

The ingestion logic is in `bitbucket-ingestion.service.ts` (sourced from `packages/backend/lib/services/bitbucket-ingestion.ts`).

## Prerequisites

Set these in `packages/backend/.env.local`:

```env
BITBUCKET_USERNAME=your-username
BITBUCKET_APP_PASSWORD=your-app-password
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-key
```

## Run

```bash
# Start the backend
pnpm --filter @ngx-copilot/backend dev

# Trigger ingestion
curl -X POST http://localhost:3001/api/ingestion/bitbucket \
  -H "Authorization: Bearer cpk_master_your_key" \
  -H "Content-Type: application/json" \
  -d '{"workspace": "my-workspace", "repoSlug": "my-repo", "branch": "main"}'
```
