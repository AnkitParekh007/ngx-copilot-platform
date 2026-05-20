# Contributing to ngx-copilot-platform

Thank you for your interest in contributing! This is a pnpm monorepo combining an Angular SDK, a Next.js RAG backend, and several demo/example apps.

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | >=22 |
| pnpm | >=9 (`npm install -g pnpm`) |
| Angular CLI | ^20 (`pnpm add -g @angular/cli`) |

## Setup

```bash
git clone https://github.com/AnkitParekh007/ngx-copilot-platform.git
cd ngx-copilot-platform
pnpm install
```

## Workspace structure

```
packages/sdk/       — @ngx-copilot/sdk Angular library (publishable)
packages/backend/   — Next.js RAG API backend (private, self-hosted)
apps/demo-app/      — Angular docs + showcase site (GitHub Pages)
apps/admin-ui/      — Next.js admin panel (self-hosted)
apps/example-consumer/ — Angular integration example (local dev)
examples/           — Standalone ingestion and integration examples
```

## Key commands

```bash
# Build everything
pnpm build

# Run all tests
pnpm test

# Lint everything
pnpm lint

# --- SDK-specific ---
pnpm build:sdk          # Build the Angular library
pnpm test:sdk           # Run 18 spec files
pnpm lint:sdk           # ESLint
pnpm pack:sdk           # Dry-run npm pack

# --- Apps ---
pnpm --filter demo-app dev          # Demo app on :4200
pnpm --filter example-consumer dev  # Consumer example on :4201
pnpm --filter admin-ui dev          # Admin UI on :3000
pnpm --filter @ngx-copilot/backend dev  # Backend API on :3001

# --- Deploy ---
pnpm deploy:pages       # Build + GH Pages (requires master push)
```

## Backend local setup

```bash
cp packages/backend/.env.example packages/backend/.env.local
# Fill in: SUPABASE_*, KV_REST_*, COPILOT_API_KEYS, OPENAI_API_KEY
pnpm --filter @ngx-copilot/backend dev
```

## SDK development workflow

1. Edit source in `packages/sdk/src/lib/`
2. Build: `pnpm build:sdk`
3. Tests auto-pick up built output — run: `pnpm test:sdk`
4. The `apps/demo-app` uses the SDK via `workspace:*` — run it to visually verify

## Before submitting a PR

```bash
pnpm verify   # runs: test + lint + build:sdk + pack:dry
```

## Good first issues

See [GOOD_FIRST_ISSUES.md](./GOOD_FIRST_ISSUES.md) for a curated list of beginner-friendly contributions.
