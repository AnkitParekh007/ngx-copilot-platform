# ngx-copilot-platform

> Angular AI copilot platform with a publishable SDK, a self-hosted RAG backend, and isolated demo/example surfaces.

[![CI](https://github.com/AnkitParekh007/ngx-copilot-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/AnkitParekh007/ngx-copilot-platform/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@ankit-parekh-007/ngx-copilot-sdk.svg)](https://www.npmjs.com/package/@ankit-parekh-007/ngx-copilot-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

This repository contains three distinct layers:

- `packages/sdk`: `@ankit-parekh-007/ngx-copilot-sdk`, an Angular 20 copilot UI and adapter SDK.
- `packages/backend`: a Next.js backend that owns auth, retrieval, ingestion, streaming, and approval boundaries.
- `apps/*` and `examples/*`: demo, admin, and sample surfaces kept in the repo for development and documentation, but not intended to define the production deployment target.

## Current status

- The SDK builds and its test suite passes.
- The backend builds, typechecks, and exposes aligned platform contracts.
- Public API auth is standardized on `Authorization: Bearer cpk_*` for SDK/API-key clients.
- Stubbed browser automation is disabled from the public execution path until a production executor is implemented.
- Demo/example apps remain in the repository, but GitHub Pages deployment is manual-only and should stay separate from any public product deployment.
- Admin API-key lifecycle endpoints are available for create, list, rotate, revoke, and metadata updates through master-key protected routes.

## Platform contract

| Endpoint | Method | Contract |
|---|---|---|
| `/api/copilot/chat` | `POST` | Returns `CopilotResponse` |
| `/api/copilot/chat/stream` | `POST` | Accepts `CopilotRequest` JSON and returns SSE `CopilotEvent` messages |
| `/api/copilot/rag/query` | `POST` | Returns raw `RagResult[]` |
| `/api/copilot/tools/execute` | `POST` | Only production-enabled tools are executable; disabled tools return `501` |
| `/api/copilot/approvals/:id/resolve` | `POST` | Resolves approval requests |
| `/api/admin/api-keys` | `GET`, `POST` | List and create API keys with master-key auth |
| `/api/admin/api-keys/:id` | `PATCH` | Update API-key metadata and active state |
| `/api/admin/api-keys/:id/rotate` | `POST` | Rotate an API key and return the new plaintext key once |
| `/api/admin/api-keys/:id/revoke` | `POST` | Revoke an API key |

## Quick start

### SDK-only

```bash
npm install @ankit-parekh-007/ngx-copilot-sdk
```

```ts
import { provideCopilot } from '@ankit-parekh-007/ngx-copilot-sdk';

export const appConfig = {
  providers: [provideCopilot({ defaultMode: 'ask' })],
};
```

The default adapter is mock-backed for local UI work. Keep that mode isolated from public product deployments.

### Full stack

```bash
git clone https://github.com/AnkitParekh007/ngx-copilot-platform.git
cd ngx-copilot-platform
pnpm install

cp packages/backend/.env.example packages/backend/.env.local
# Fill in SUPABASE_*, OPENAI_API_KEY, optional KV_REST_*, and COPILOT_API_KEYS

corepack pnpm --filter @ngx-copilot/backend dev
corepack pnpm --filter example-consumer dev
```

`apps/example-consumer` now expects runtime config instead of committed keys:

```ts
window.__COPILOT_RUNTIME_CONFIG__ = {
  apiUrl: 'https://your-backend-host',
  apiKey: 'cpk_your_runtime_key',
};
```

Use the smoke script to verify the backend contract directly:

```bash
COPILOT_API_KEY=cpk_your_runtime_key node scripts/smoke-platform-backend.mjs
```

## Launch constraints

- Do not deploy `apps/demo-app`, `apps/example-consumer`, or `examples/*` as the public product without an explicit production wrapper and runtime configuration strategy.
- Do not expose disabled browser automation endpoints as if they were live capabilities.
- Do not hardcode backend URLs or API keys in Angular source files.
- Keep `CORS_ALLOWED_ORIGINS` explicit in production. Development-only localhost permissiveness is handled in middleware, not by production defaults.
- Keep execute-mode UI hidden in public launch surfaces until a production browser executor is implemented.

## Verification

These commands currently pass in the repository:

```bash
corepack pnpm --filter @ngx-copilot/backend typecheck
corepack pnpm --filter @ngx-copilot/backend test
corepack pnpm --filter @ngx-copilot/backend build
corepack pnpm --filter @ankit-parekh-007/ngx-copilot-sdk test
corepack pnpm --filter example-consumer build
corepack pnpm --filter admin-ui build
```

## CI/CD

| Workflow | Trigger | Purpose |
|---|---|---|
| `ci.yml` | Every push and PR | SDK tests, backend typecheck/tests, workspace builds |
| `deploy-pages.yml` | Manual only | Builds and publishes the demo app intentionally |
| `release-readiness.yml` | Manual or Release | Smokes a deployed backend using release secrets before public rollout |
| `publish-npm.yml` | GitHub Release | Publishes `@ankit-parekh-007/ngx-copilot-sdk` |

## License

[MIT](./LICENSE) - Ankit Parekh
