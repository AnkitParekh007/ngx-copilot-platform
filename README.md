# ngx-copilot-platform

> Angular AI copilot platform with a publishable SDK, a production-shaped RAG backend, and enterprise-style demos.

[![CI](https://github.com/AnkitParekh007/ngx-copilot-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/AnkitParekh007/ngx-copilot-platform/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@ankitparekh007/ngx-copilot-sdk.svg)](https://www.npmjs.com/package/@ankitparekh007/ngx-copilot-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

This repository demonstrates the full stack behind a serious Angular copilot experience:

- **Frontend SDK:** `@ankitparekh007/ngx-copilot-sdk` ships Angular 20 components for chat, streaming, RAG citations, tool timelines, and approval workflows.
- **Backend platform:** a Next.js RAG service handles ingestion, embeddings, retrieval, streaming, auth boundaries, and rate limiting.
- **Proof through execution:** runnable demos, an example consumer, tests, docs, and deployment workflows validate the architecture end to end.

If you are reviewing this as a recruiter, hiring manager, or engineering lead, the signal is in the combination:

- Angular library design with typed provider and adapter boundaries
- Real backend integration patterns for OpenAI, Supabase pgvector, SSE streaming, and ingestion
- Enterprise UX patterns like approvals, source citations, and tool execution timelines
- Monorepo packaging, CI, publish preparation, and documentation discipline

---

## What this platform proves

- Typed adapter pattern decouples Angular UI from any backend
- Real RAG pipeline: ingest -> embed -> retrieve -> stream
- `cpk_` API key auth keeps LLM credentials off the browser
- SSE streaming from Next.js to Angular via `NgxCopilotPlatformBackendAdapter`
- Enterprise patterns: approval gates, tool timelines, multi-mode copilot shell

**Status:** v0.1.0 preview. The SDK is buildable, tested, and documented. The backend is functional and ready to run with your own Supabase/OpenAI credentials.

---

## Monorepo structure

```text
ngx-copilot-platform/
|-- packages/
|   |-- sdk/              @ankitparekh007/ngx-copilot-sdk - Angular library (publishable)
|   `-- backend/          Next.js RAG API (self-hosted)
|-- apps/
|   |-- demo-app/         Angular docs and showcase
|   |-- admin-ui/         Next.js shadcn/ui admin panel
|   `-- example-consumer/ Angular app wired to the real backend
|-- examples/
|   |-- github-ingestion/
|   |-- bitbucket-ingestion/
|   `-- enterprise-rag-demo/
|-- docs/
|   |-- sdk/
|   |-- backend/
|   `-- platform-overview.md
`-- supabase/             Database migrations and pgvector schema
```

---

## Quick start

### Option A - SDK only

```bash
npm install @ankitparekh007/ngx-copilot-sdk
```

```ts
import { provideCopilot } from '@ankitparekh007/ngx-copilot-sdk';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCopilot({ mode: 'ask', theme: 'system' }, { useMockBackend: true }),
  ],
};
```

```html
<ngx-copilot-shell />
```

### Option B - Full stack

```bash
git clone https://github.com/AnkitParekh007/ngx-copilot-platform.git
cd ngx-copilot-platform
pnpm install

cp packages/backend/.env.example packages/backend/.env.local
# Fill in: SUPABASE_*, KV_REST_*, COPILOT_API_KEYS, OPENAI_API_KEY

pnpm --filter @ngx-copilot/backend dev
pnpm --filter example-consumer dev
```

```ts
import {
  provideCopilot,
  NgxCopilotPlatformBackendAdapter,
} from '@ankitparekh007/ngx-copilot-sdk';

const adapter = new NgxCopilotPlatformBackendAdapter({
  apiUrl: 'http://localhost:3001',
  apiKey: 'cpk_dev_your_key',
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideCopilot({ mode: 'ask', theme: 'system' }, { backendAdapter: adapter }),
  ],
};
```

---

## SDK components

| Component | Description |
|---|---|
| `<ngx-copilot-shell>` | Full chat shell with streaming, sources, timeline, and approvals |
| `<ngx-copilot-chat>` | Message list and composer |
| `<ngx-streaming-message>` | Character-by-character streaming renderer |
| `<ngx-rag-source-card>` | RAG citation card with file path, URL, snippet, and score |
| `<ngx-tool-call-timeline>` | Multi-step agent tool execution visualization |
| `<ngx-approval-card>` | User approval gate with risk indicators and tone |
| `<ngx-agent-mode-selector>` | Mode switcher for ask, plan, execute, and debug |

## Backend ingestion endpoints

| Endpoint | Description |
|---|---|
| `POST /api/ingestion/github` | Ingest a GitHub repository into pgvector |
| `POST /api/ingestion/bitbucket` | Ingest a Bitbucket repository |
| `POST /api/ingestion/documentation` | Crawl and ingest web documentation |
| `GET /api/health` | Health check |

---

## Development commands

```bash
pnpm build
pnpm test
pnpm lint
pnpm build:sdk
pnpm test:sdk
pnpm pack:sdk
pnpm deploy:pages
```

---

## CI/CD

| Workflow | Trigger | Action |
|---|---|---|
| `ci.yml` | Every push or PR | Lint, test, and build workspace targets |
| `deploy-pages.yml` | Push to `main` or manual | Build and deploy the demo app to GitHub Pages |
| `publish-npm.yml` | GitHub Release | Publish `@ankitparekh007/ngx-copilot-sdk` to npm with OIDC |
| `deploy-backend.yml` | Backend changes | Build backend (deploy step is a configurable template) |

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Good first issues live in [GOOD_FIRST_ISSUES.md](./GOOD_FIRST_ISSUES.md).

## License

[MIT](./LICENSE) - Ankit Parekh
