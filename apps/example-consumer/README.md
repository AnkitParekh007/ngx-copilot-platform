# example-consumer

Minimal Angular 20 app for validating the real platform adapter path:

- Angular SDK: `@ankit-parekh-007/ngx-copilot-sdk`
- Backend: `packages/backend`

This app is a development and integration surface. It is not meant to ship with committed backend URLs or keys.

## What it proves

- `provideCopilot()` can be combined with `providePlatformBackend()`
- `NgxCopilotPlatformBackendAdapter` speaks the backend contract used by `packages/backend`
- `<ngx-copilot-shell>` can run against the live backend without adapter-specific component code

## Quick start

### 1. Start the backend

```bash
cp packages/backend/.env.example packages/backend/.env.local
corepack pnpm --filter @ngx-copilot/backend dev
```

### 2. Provide runtime config

Set runtime config before bootstrapping the Angular app:

```ts
window.__COPILOT_RUNTIME_CONFIG__ = {
  apiUrl: 'https://your-backend-host',
  apiKey: 'cpk_dev_your_key_from_env_local',
};
```

The key must exist in `COPILOT_API_KEYS` or in the backend `api_keys` table.

### 3. Start the consumer

```bash
corepack pnpm --filter example-consumer dev
```

### 4. Optional backend contract smoke test

```bash
COPILOT_API_KEY=cpk_dev_your_key_from_env_local node scripts/smoke-platform-backend.mjs
```

## Runtime contract

- `POST /api/copilot/chat/stream` with JSON `CopilotRequest`
- `POST /api/copilot/rag/query` returning raw `RagResult[]`
- `Authorization: Bearer cpk_*` for API-key auth

## Key files

| File | Purpose |
|---|---|
| `src/app/app.config.ts` | Registers the platform backend adapter |
| `src/app/app.component.ts` | Renders the copilot shell and runtime-config status |
| `src/environments/environment.ts` | Reads `window.__COPILOT_RUNTIME_CONFIG__` |
| `src/environments/environment.prod.ts` | Empty production defaults; values must be injected at runtime |
