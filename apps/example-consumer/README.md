# example-consumer

Minimal Angular 20 app demonstrating the full-stack integration:
**`@ankit-parekh-007/ngx-copilot-sdk`** (Angular library) + **`packages/backend`** (Next.js RAG API).

This app closes [ngx-copilot-platform#2](https://github.com/AnkitParekh007/ngx-copilot-platform/issues/2) — a typed backend adapter example for real copilot integrations.

## What it shows

- How to wire `NgxCopilotPlatformBackendAdapter` in `app.config.ts`
- How to use `provideCopilot()` with a real backend adapter
- How to use `<ngx-copilot-shell>` in a standalone component
- How to configure environment-specific `apiUrl` and `apiKey`

## Prerequisites

| Requirement | Version |
|---|---|
| Node.js | >=22 |
| pnpm | >=9 |
| Angular CLI | ^20 |

## Quickstart

**Step 1 — Start the backend**

```bash
# From the monorepo root:
cp packages/backend/.env.example packages/backend/.env.local
# Fill in your Supabase, Upstash, and OpenAI keys in .env.local

corepack pnpm --filter @ngx-copilot/backend dev
# Backend starts on http://localhost:3001
```

**Step 2 — Configure the consumer**

Edit `src/environments/environment.ts`:
```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001',
  apiKey: 'cpk_dev_your_key_from_env_local', // must be in COPILOT_API_KEYS
};
```

**Step 3 — Start the consumer app**

```bash
# From the monorepo root:
corepack pnpm --filter example-consumer dev
# App starts on http://localhost:4201
```

**Optional Step 4 — Verify backend contract without the UI**

```bash
COPILOT_API_KEY=cpk_dev_your_key_from_env_local node scripts/smoke-platform-backend.mjs
```

## Runtime contract

The example consumer uses `NgxCopilotPlatformBackendAdapter`, which currently expects:

- `POST /api/copilot/chat/stream` with a JSON `CopilotRequest` body and SSE events in response
- `POST /api/copilot/rag/query` returning a raw `RagResult[]`
- `Authorization: Bearer cpk_*` for backend authentication

## Key files

| File | Purpose |
|---|---|
| `src/app/app.config.ts` | Wires `NgxCopilotPlatformBackendAdapter` via `provideCopilot()` |
| `src/app/app.component.ts` | Uses `<ngx-copilot-shell>` — no adapter code needed here |
| `src/environments/environment.ts` | `apiUrl` and `apiKey` for local dev |
| `src/environments/environment.prod.ts` | Production overrides |

## Switching to the mock adapter

For local development without a running backend:

```ts
// app.config.ts
import { MockCopilotBackendAdapter } from '@ankit-parekh-007/ngx-copilot-sdk';

provideCopilot(
  { mode: 'ask', theme: 'system' },
  { useMockBackend: true }, // no backendAdapter needed
),
```
