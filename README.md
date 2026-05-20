# ngx-copilot-platform

> Full-stack Angular copilot platform — Angular 20 SDK + Next.js RAG backend + enterprise demos

[![CI](https://github.com/AnkitParekh007/ngx-copilot-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/AnkitParekh007/ngx-copilot-platform/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@ngx-copilot/sdk.svg)](https://www.npmjs.com/package/@ngx-copilot/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A production-shaped monorepo that combines:

- **`@ngx-copilot/sdk`** — Reusable Angular 20 components for AI chat, RAG citations, tool timelines, and approval workflows
- **`packages/backend`** — Next.js RAG API with Supabase vector store, OpenAI embeddings, GitHub/Bitbucket ingestion, and rate limiting
- **`apps/example-consumer`** — Minimal Angular app showing the full-stack wiring
- **`apps/demo-app`** — Live documentation and component showcase

---

## What this platform proves

- Typed adapter pattern decouples Angular UI from any backend
- Real RAG pipeline: ingest → embed → retrieve → stream
- `cpk_` API key auth keeps LLM credentials off the browser
- SSE streaming from Next.js to Angular via `NgxCopilotPlatformBackendAdapter`
- Enterprise patterns: approval gates, tool timelines, multi-mode copilot shell

**Status:** v0.1.0 preview — SDK is buildable, tested (18 specs), and documented. Backend is functional but requires your own Supabase/OpenAI credentials.

---

## Monorepo structure

```
ngx-copilot-platform/
├── packages/
│   ├── sdk/              @ngx-copilot/sdk — Angular library (publishable)
│   └── backend/          Next.js RAG API (Vercel-deployed)
├── apps/
│   ├── demo-app/         Angular docs + showcase → GitHub Pages
│   ├── admin-ui/         Next.js shadcn/ui admin panel
│   └── example-consumer/ Angular app wired to real backend ← start here
├── examples/
│   ├── github-ingestion/
│   ├── bitbucket-ingestion/
│   └── enterprise-rag-demo/
├── docs/
│   ├── sdk/              23 SDK documentation files
│   ├── backend/          Backend API docs
│   └── platform-overview.md
└── supabase/             Database migrations (pgvector schema)
```

---

## Quick start

### Option A — SDK only (mock backend, zero setup)

```bash
npm install @ngx-copilot/sdk
```

```ts
// app.config.ts
import { provideCopilot } from '@ngx-copilot/sdk';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCopilot({ mode: 'ask', theme: 'system' }, { useMockBackend: true }),
  ],
};
```

```html
<!-- app.component.html -->
<ngx-copilot-shell />
```

### Option B — Full stack (SDK + platform backend)

```bash
# 1. Clone the monorepo
git clone https://github.com/AnkitParekh007/ngx-copilot-platform.git
cd ngx-copilot-platform
pnpm install

# 2. Configure the backend
cp packages/backend/.env.example packages/backend/.env.local
# Fill in: SUPABASE_*, KV_REST_*, COPILOT_API_KEYS, OPENAI_API_KEY

# 3. Start the backend
pnpm --filter @ngx-copilot/backend dev    # http://localhost:3001

# 4. Start the example consumer
pnpm --filter example-consumer dev        # http://localhost:4201
```

```ts
// apps/example-consumer/src/app/app.config.ts
import { provideCopilot, NgxCopilotPlatformBackendAdapter } from '@ngx-copilot/sdk';

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
| `<ngx-copilot-shell>` | Full chat shell with streaming, sources, timeline, approvals |
| `<ngx-copilot-chat>` | Message list and composer |
| `<ngx-streaming-message>` | Character-by-character streaming renderer |
| `<ngx-rag-source-card>` | RAG citation card (file path, URL, snippet, score) |
| `<ngx-tool-call-timeline>` | Multi-step agent tool execution visualization |
| `<ngx-approval-card>` | User approval gate with risk indicators and tone |
| `<ngx-agent-mode-selector>` | Mode switcher: ask / plan / execute / debug |

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
pnpm build           # Build all packages (Turborepo cached)
pnpm test            # Run all tests
pnpm lint            # Lint all packages
pnpm build:sdk       # Build @ngx-copilot/sdk only
pnpm test:sdk        # Run SDK tests (18 spec files)
pnpm pack:sdk        # Dry-run npm publish
pnpm deploy:pages    # Build demo-app for GitHub Pages
```

---

## CI/CD

| Workflow | Trigger | Action |
|---|---|---|
| `ci.yml` | Every push/PR | Lint, test, build all packages |
| `deploy-pages.yml` | Push to master | Deploy demo-app to GitHub Pages |
| `publish-npm.yml` | GitHub Release | Publish `@ngx-copilot/sdk` to npm (OIDC) |
| `deploy-backend.yml` | Push to master (backend changed) | Deploy backend to Vercel |

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Good first issues in [GOOD_FIRST_ISSUES.md](./GOOD_FIRST_ISSUES.md).

## License

[MIT](./LICENSE) — Ankit Parekh
