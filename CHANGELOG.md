# Changelog

All notable changes to this public proof project will be documented here.

## Unreleased

## 0.1.1 - 2026-05-28

- Bump SDK version to 0.1.1.
- Add favicon, web manifest, robots.txt, and sitemap to demo app.
- Add SEO meta tags: canonical URL, Open Graph, Twitter Card to demo app.
- Add CSP meta tag and noscript fallback to demo app index.html.
- Add mock-demo disclosure badge to live demo hero and nav shell.
- Add `assets` glob in `angular.json` to correctly include `public/` in build output.
- Add auto-deploy trigger (push to `main`) to `deploy-pages.yml`.
- Add `example-consumer` build step to CI.
- Fix `publish-npm.yml` action versions (`checkout@v5` → `@v4`, `setup-node@v6` → `@v4`).
- Update `RELEASE_CHECKLIST.md`: branch `master` → `main`, version references updated.
- Add `.github/CODEOWNERS` for automated PR review assignment.
- Add `.github/dependabot.yml` for weekly automated dependency updates.
- Add production CORS origin to `packages/backend/.env.example`.
- Tighten bundle budgets in `apps/demo-app/angular.json`.

## 0.1.0 - npm preview readiness

- Add `CopilotBackendAdapter` contract, mock adapter, and HTTP/SSE skeleton.
- Upgrade `CopilotService` to signal-based orchestration with send/reset/mode/approval APIs.
- Improve standalone UI components (composer, streaming, empty/error states).
- Add component tests (TestBed + jsdom), Angular ESLint, and consumer smoke test script.
- Add runnable `projects/demo-app` with live mock demo and `/showcase` route.
- Update docs and CI for lint, smoke test, and demo build.

## 0.1.0 - Initial Public Proof

- Added README and architecture documentation.
- Added TypeScript-oriented models, mocks, or pattern examples.
- Added recruiter and contribution surfaces for public review.
