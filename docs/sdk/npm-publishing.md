# npm Publishing Guide

This document explains how `@ankitparekh007/ngx-copilot-sdk` is published to npm, including the Trusted Publishing setup.

## Package identity

- **Scoped name:** `@ankitparekh007/ngx-copilot-sdk`
- **Access:** public
- **Registry:** https://registry.npmjs.org

## Publishing method: npm Trusted Publishing (OIDC)

This package uses [npm Trusted Publishing](https://docs.npmjs.com/generating-provenance-statements) — no `NPM_TOKEN` secret is required.

### How it works

1. GitHub Actions exchanges an OIDC token with npmjs.com.
2. npmjs.com verifies the token matches the registered Trusted Publisher (this repo + workflow).
3. The publish proceeds with provenance attestation — consumers can verify the package was built from this exact commit.

### One-time setup on npmjs.com

1. Log in to [npmjs.com](https://npmjs.com).
2. Navigate to the `@ankitparekh007/ngx-copilot-sdk` package page.
3. Go to **Settings → Publishing → Trusted Publishers**.
4. Click **Add Trusted Publisher** and fill in:
   - **Ecosystem:** npm
   - **Repository owner:** `ankitparekh007`
   - **Repository name:** `ngx-copilot-sdk`
   - **Workflow filename:** `publish-npm.yml`
   - **Environment name:** *(leave blank or set `npm-publish`)*
5. Save. No secret tokens needed after this step.

> The workflow requires `id-token: write` permission — already set in `.github/workflows/publish-npm.yml`.

## Release process

1. Merge all changes to `master`.
2. Run `npm run verify` locally to confirm tests, build, and dry-run all pass.
3. Update `CHANGELOG.md`.
4. Create a GitHub Release:
   - Tag: `v0.1.0`
   - Title: `v0.1.0 — 0.1.0 Preview`
   - Body: paste from `RELEASE_CHECKLIST.md` release notes section.
5. The `publish-npm.yml` workflow triggers automatically on release publish.
6. Verify the package appears on npmjs.com within ~2 minutes.

## Manual publish (fallback)

If Trusted Publishing is not yet configured:

```bash
npm run build
cd dist/ngx-copilot-sdk
npm publish --access public
```

You will be prompted for credentials or a token.

## Verification after publish

```bash
npm info @ankitparekh007/ngx-copilot-sdk
npm install @ankitparekh007/ngx-copilot-sdk --dry-run
```

Then run the consumer smoke test in [docs/smoke-test.md](./smoke-test.md).
