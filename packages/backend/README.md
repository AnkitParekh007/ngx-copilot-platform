# @ngx-copilot/backend

Next.js backend adapter for the [ngx-copilot-sdk](https://www.npmjs.com/package/@ankit-parekh-007/ngx-copilot-sdk).

Provides the SSE streaming endpoint, RAG search, tool approval gates, and API key management that the Angular SDK connects to.

## Documentation

- **[Integration Guide](../../docs/backend/integration-guide.md)** — deployment options, environment variables, CORS setup
- **[API Reference](../../docs/backend/api-reference.md)** — endpoint contract, request/response shapes
- **[Architecture](../../docs/backend/architecture.md)** — adapter pattern, auth middleware, Supabase schema

## Quick start

```bash
cp .env.example .env   # fill in Supabase, OpenAI, and Redis credentials
pnpm install
pnpm dev               # starts Next.js on http://localhost:3000
```

Required environment variables are documented in [`.env.example`](./.env.example).

## Health check

```
GET /api/health
```

Returns `{ status: "ok" }` (200) when all dependencies are reachable, or `{ status: "degraded" }` (503) when a dependency is unavailable.
