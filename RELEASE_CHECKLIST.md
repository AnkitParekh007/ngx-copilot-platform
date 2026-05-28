# Release Checklist

Use this checklist before creating a GitHub Release and triggering the npm publish workflow.

## Pre-release checks

- [ ] `pnpm run verify` passes locally (`pnpm test:sdk && pnpm lint:sdk && pnpm build:sdk && pnpm pack:sdk`)
- [ ] `CHANGELOG.md` updated with release notes for this version
- [ ] `packages/sdk/package.json` version bumped
- [ ] Consumer smoke test completed per [docs/sdk/smoke-test.md](docs/sdk/smoke-test.md)
- [ ] `docs/sdk/public-api-contract.md` reflects any new/changed exports
- [ ] No accidental internal symbols in `public-api.ts`
- [ ] `LICENSE` file present at repo root
- [ ] All CI checks green on `main`

## npm Trusted Publishing (one-time setup)

Only required once before the first publish:

- [ ] npmjs.com Trusted Publisher registered for this repo + workflow (see [docs/sdk/npm-publishing.md](docs/sdk/npm-publishing.md))
  - Repository owner: `AnkitParekh007`
  - Repository name: `ngx-copilot-platform`
  - Workflow filename: `publish-npm.yml`
- [ ] `id-token: write` permission confirmed in `publish-npm.yml`

## GitHub Release steps

1. Go to **Releases → Draft a new release**
2. Tag: `v0.1.1`
3. Target: `main`
4. Title: `v0.1.1 — 0.1.1 Preview`
5. Paste release notes below into the body
6. Click **Publish release**
7. Monitor the `publish-npm.yml` workflow run

## Post-publish verification

- [ ] `npm info @ankit-parekh-007/ngx-copilot-sdk` shows latest version
- [ ] Package provenance attestation visible on npmjs.com
- [ ] Fresh install smoke test passes (see [docs/sdk/smoke-test.md](docs/sdk/smoke-test.md))
- [ ] GitHub Release page shows published status

---

## Release notes template

```markdown
## v0.1.1 — Preview

**Package:** `@ankit-parekh-007/ngx-copilot-sdk`

### Install

```bash
npm install @ankit-parekh-007/ngx-copilot-sdk
```

Requires Angular ^20.0.0 and RxJS ^7.8.0.

### Compatibility

See [docs/sdk/compatibility.md](docs/sdk/compatibility.md).

### Migration

See [docs/sdk/migration-guide.md](docs/sdk/migration-guide.md).
```
