# GitHub Ingestion Example

Demonstrates how the ngx-copilot-platform backend ingests GitHub repositories into the Supabase vector store for RAG retrieval.

## What it does

1. Clones or fetches a GitHub repo via the GitHub API (using `GITHUB_TOKEN`)
2. Chunks TypeScript/Angular source files into semantically meaningful pieces
3. Generates OpenAI embeddings for each chunk
4. Stores chunks + embeddings in Supabase `pgvector` for retrieval

## API Endpoint

```
POST /api/ingestion/github
Authorization: Bearer cpk_master_your_key
Content-Type: application/json

{
  "repoUrl": "https://github.com/owner/repo",
  "branch": "main"
}
```

## Service source

The ingestion logic is in `github-ingestion.service.ts` (sourced from `packages/backend/lib/services/github-ingestion.ts`).

## Prerequisites

Set these in `packages/backend/.env.local`:

```env
GITHUB_TOKEN=ghp_your_token
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-key
```

## Run

```bash
# Start the backend
pnpm --filter @ngx-copilot/backend dev

# Trigger ingestion
curl -X POST http://localhost:3001/api/ingestion/github \
  -H "Authorization: Bearer cpk_master_your_key" \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/AnkitParekh007/ngx-copilot-platform", "branch": "master"}'
```
