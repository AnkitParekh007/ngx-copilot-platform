# ngx-copilot-platform

> Build Angular copilots that feel product-grade: streaming chat, grounded retrieval, approval gates, and a backend boundary that keeps model credentials off the browser.

[![CI](https://github.com/AnkitParekh007/ngx-copilot-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/AnkitParekh007/ngx-copilot-platform/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@ankit-parekh-007/ngx-copilot-sdk.svg)](https://www.npmjs.com/package/@ankit-parekh-007/ngx-copilot-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

`ngx-copilot-platform` is a full-stack Angular AI workspace built around one core idea:

**the UI should feel native, the backend should stay in control, and every answer should be inspectable.**

This repository packages that idea into three layers:

- `packages/sdk`
  `@ankit-parekh-007/ngx-copilot-sdk`, an Angular 20 SDK for copilot UI, streaming events, citations, approval cards, and adapter-driven integration.
- `packages/backend`
  a Next.js backend that owns auth, retrieval, ingestion, API-key lifecycle, SSE streaming, and approval boundaries.
- `apps/*` and `examples/*`
  demo, admin, and sample surfaces kept in the repo for development, documentation, and showcase flows, not as the direct public product deployment target.

## Why this repo exists

Most AI demos stop at chat.

This one is aimed at the harder product question: **how do you ship a trustworthy copilot inside a real Angular application?**

That means:

- typed Angular components instead of a generic widget
- retrieval-backed answers with visible grounding
- step-by-step tool timeline UI
- approval checkpoints for consequential actions
- backend-owned auth and provider orchestration
- a launch-safe separation between production surfaces and demo surfaces

## Current status

The platform is in a strong integration state for SDK + backend work:

- the SDK builds and its test suite passes
- the backend builds, typechecks, and exposes aligned platform contracts
- public API auth is standardized on `Authorization: Bearer cpk_*` for SDK/API-key clients
- admin API-key lifecycle routes support create, list, rotate, revoke, and metadata updates
- legacy approval mutation routes are removed; approval resolution is authenticated through `/api/copilot/approvals/:id/resolve`
- stubbed browser automation is intentionally disabled until a production executor exists

Important scope boundary:

- `apps/demo-app`, `apps/example-consumer`, and `examples/*` stay in the repository for docs and development workflows
- GitHub Pages is a documentation/showcase deployment, not the production product surface

## Architecture

```text
Angular app
  -> ngx-copilot-sdk
  -> CopilotBackendAdapter
  -> Platform backend
  -> LLM / RAG / approvals / audit / key management
```

The SDK owns rendering and client-side interaction.

The backend owns:

- authentication and API keys
- retrieval and vector-backed grounding
- streaming response delivery
- approval workflows
- ingestion and audit boundaries

That split is deliberate. It keeps provider credentials and execution policy out of the browser while still giving the frontend a clean, typed event stream.

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

### SDK only

```bash
npm install @ankit-parekh-007/ngx-copilot-sdk
```

```ts
import { provideCopilot } from '@ankit-parekh-007/ngx-copilot-sdk';

export const appConfig = {
  providers: [provideCopilot({ defaultMode: 'ask' })],
};
```

The default adapter is mock-backed, which is useful for local UI work and component development.
Keep that mode isolated from public product deployments.

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

`apps/example-consumer` expects runtime config instead of committed keys:

```ts
window.__COPILOT_RUNTIME_CONFIG__ = {
  apiUrl: 'https://your-backend-host',
  apiKey: 'cpk_your_runtime_key',
};
```

To verify the live backend contract without opening the UI:

```bash
COPILOT_API_KEY=cpk_your_runtime_key node scripts/smoke-platform-backend.mjs
```

## Public launch constraints

This repository is designed to be launch-aware, not launch-naive.

Before public rollout:

- do not deploy `apps/demo-app`, `apps/example-consumer`, or `examples/*` as the public product without an explicit production wrapper and runtime configuration strategy
- do not expose disabled browser automation endpoints as if they were live capabilities
- do not hardcode backend URLs or API keys in Angular source files
- keep `CORS_ALLOWED_ORIGINS` explicit in production
- keep execute-mode UI hidden in public launch surfaces until a production browser executor is implemented
- apply Supabase migration `002_align_copilot_modes.sql` before launch so persisted conversation modes match the runtime `ask | plan | execute | debug` contract

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
| `deploy-pages.yml` | Push to `main` (demo-app/sdk paths) or manual | Builds and publishes the demo app to GitHub Pages |
| `release-readiness.yml` | Manual or Release | Smokes a deployed backend using release secrets before public rollout |
| `publish-npm.yml` | GitHub Release | Publishes `@ankit-parekh-007/ngx-copilot-sdk` |

## Repo philosophy

This codebase is opinionated about AI product quality:

- answers should be grounded
- actions should be inspectable
- approvals should be explicit
- browser clients should stay thin
- backend contracts should be typed and testable

If you are building an Angular copilot that has to survive real product requirements, that is the use case this repository is trying to serve.

## License

[MIT](./LICENSE) - Ankit Parekh
