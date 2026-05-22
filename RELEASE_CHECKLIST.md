# Release Checklist

Use this checklist before creating a GitHub Release and triggering the npm publish workflow.

## Pre-release checks

- [ ] `npm run verify` passes locally (`npm test && npm run build && npm run pack:dry`)
- [ ] `CHANGELOG.md` updated with release notes for this version
- [ ] `projects/ngx-copilot-sdk/package.json` version bumped (if applicable)
- [ ] Consumer smoke test completed per [docs/smoke-test.md](docs/smoke-test.md)
- [ ] `docs/public-api-contract.md` reflects any new/changed exports
- [ ] No accidental internal symbols in `public-api.ts`
- [ ] `LICENSE` file present at repo root
- [ ] All CI checks green on `master`

## npm Trusted Publishing (one-time setup)

Only required once before the first publish:

- [ ] npmjs.com Trusted Publisher registered for this repo + workflow (see [docs/npm-publishing.md](docs/npm-publishing.md))
- [ ] `id-token: write` permission confirmed in `publish-npm.yml`

## GitHub Release steps

1. Go to **Releases → Draft a new release**
2. Tag: `v0.1.0`
3. Target: `master`
4. Title: `v0.1.0 — 0.1.0 Preview`
5. Paste release notes below into the body
6. Click **Publish release**
7. Monitor the `publish-npm.yml` workflow run

## Post-publish verification

- [ ] `npm info @ankit-parekh-007/ngx-copilot-sdk` shows version `0.1.0`
- [ ] Package provenance attestation visible on npmjs.com
- [ ] Fresh install smoke test passes (see [docs/smoke-test.md](docs/smoke-test.md))
- [ ] GitHub Release page shows published status

---

## Release notes for v0.1.0

```markdown
## v0.1.0 — 0.1.0 Preview

**Package:** `@ankit-parekh-007/ngx-copilot-sdk`

This is the first npm-published preview release of the Angular copilot SDK.

### What this is

A 0.1.0 preview package. Not production-stable. APIs marked as Preview in
[docs/public-api-contract.md](docs/public-api-contract.md) may change in 0.2.x.

### What's included

- `provideCopilot()` — Angular provider factory for SDK configuration
- `normalizeCopilotConfig()` — config normalization with defaults
- `ContextProviderService` — context serialization for backend calls
- `ToolRegistryService` — tool registration and approval checks
- `RagAdapterService` — RAG result normalization (reference adapter)
- `StreamingAdapterService` — simulated token streaming (reference adapter)
- `CopilotShellComponent` and 6 supporting standalone UI components
- Full TypeScript interfaces for all data models

### Known limitations

- Services are reference adapters — no real backend HTTP integration included
- Components require consumer-provided `@Input()` data
- SSR (server-side rendering) not tested
- Backend integration (NestJS, OpenAI) provided as `.example.ts` files only

### Install

```bash
npm install @ankit-parekh-007/ngx-copilot-sdk
```

Requires Angular ^20.0.0 and RxJS ^7.8.0.

### Compatibility

See [docs/compatibility.md](docs/compatibility.md).

### Migration

See [docs/migration-guide.md](docs/migration-guide.md) — first release, no prior version to migrate from.
```
