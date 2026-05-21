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

### Option A — SDK only (mock backend, no server required)

```bash
npm install @ankitparekh007/ngx-copilot-sdk
```

```ts
// app.config.ts
import { provideCopilot } from '@ankitparekh007/ngx-copilot-sdk';

export const appConfig: ApplicationConfig = {
  providers: [
    // All config fields are optional. The mock adapter is used by default.
    provideCopilot({ defaultMode: 'ask' }),
  ],
};
```

```html
<!-- any component template -->
<ngx-copilot-shell />
```

The mock adapter simulates streaming, RAG citations, tool timelines, and approval gates
without any backend or API keys. Use this for local development and UI work.

---

### Option B — Full stack (real backend integration)

```bash
git clone https://github.com/AnkitParekh007/ngx-copilot-platform.git
cd ngx-copilot-platform
pnpm install

cp packages/backend/.env.example packages/backend/.env.local
# Fill in: SUPABASE_*, KV_REST_*, COPILOT_API_KEYS, OPENAI_API_KEY

pnpm --filter @ngx-copilot/backend dev    # starts Next.js API on :3001
pnpm --filter example-consumer dev        # starts Angular consumer on :4200
```

```ts
// app.config.ts — wires the Angular SDK to the platform backend
import { provideCopilot, providePlatformBackend } from '@ankitparekh007/ngx-copilot-sdk';
import { environment } from './environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCopilot({ defaultMode: 'ask' }, { useMockBackend: false }),
    providePlatformBackend({
      apiUrl: environment.apiUrl,   // 'http://localhost:3001' in dev
      apiKey: environment.apiKey,   // 'cpk_dev_your_key' — never hardcode in production
    }),
  ],
};
```

```ts
// environments/environment.ts  (development — committed)
export const environment = {
  apiUrl: 'http://localhost:3001',
  apiKey: 'cpk_dev_replace_with_your_key',
};

// environments/environment.prod.ts  (production — values injected at build time)
export const environment = {
  apiUrl: process.env['API_URL'] ?? '',
  apiKey: process.env['API_KEY'] ?? '',
};
```

> **Security note:** `cpk_` API keys authenticate with the backend, not with OpenAI or Supabase.
> The backend holds those provider secrets. Never embed production keys in Angular source code.

---

### Option C — Custom backend adapter

Implement `CopilotBackendAdapter` to connect any backend:

```ts
import { CopilotBackendAdapter, CopilotRequest, CopilotEvent } from '@ankitparekh007/ngx-copilot-sdk';
import { Observable } from 'rxjs';

class MyAdapter implements CopilotBackendAdapter {
  send(request: CopilotRequest): Observable<CopilotEvent> {
    // return an Observable<CopilotEvent> from your own API
  }
}

// app.config.ts
provideCopilot({ defaultMode: 'ask' }, { backendAdapter: new MyAdapter() })
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
