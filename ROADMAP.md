# Roadmap

## Current — v0.1.0 (Platform Launch)

### SDK (`@ngx-copilot/sdk`)
- [x] `CopilotShellComponent` — full chat shell with streaming
- [x] `RagSourceCardComponent` — citation cards
- [x] `ToolCallTimelineComponent` — multi-step agent visualization
- [x] `ApprovalCardComponent` — approval gate with risk indicators
- [x] `AgentModeSelectorComponent` — ask / plan / execute / debug modes
- [x] `MockCopilotBackendAdapter` — zero-dependency local dev
- [x] `HttpCopilotBackendAdapter` — generic HTTP/SSE adapter
- [x] `NgxCopilotPlatformBackendAdapter` — **NEW** wires to platform backend
- [x] `provideCopilot()` factory, `CopilotContext`
- [x] Light/dark/system theme support
- [x] 18 spec files, GitHub Pages demo, npm Trusted Publishing

### Backend (`packages/backend`)
- [x] RAG pipeline (Supabase pgvector + OpenAI embeddings)
- [x] GitHub repository ingestion
- [x] Bitbucket repository ingestion
- [x] Documentation / web crawling ingestion
- [x] LLM orchestration (Vercel AI SDK + OpenAI)
- [x] `cpk_` API key authentication
- [x] Rate limiting (Upstash Redis)
- [x] Audit logging
- [x] CORS support for Angular SDK apps

### Platform
- [x] pnpm monorepo with Turborepo task caching
- [x] 4 CI/CD workflows (CI, GH Pages, npm publish, Vercel backend deploy)
- [x] `apps/example-consumer` — full-stack Angular integration example
- [x] MIT license, community docs, good first issues

---

## v0.2.0 — Stabilized SDK + Real Backend Examples

- [ ] Stabilize public API exports (no breaking changes guarantee) — [SDK #1]
- [ ] Full `strict: true` TypeScript across all packages
- [ ] `CustomCopilotBackendAdapter` base class with input validation
- [ ] `CopilotContext` structured metadata helpers, `provideRagAdapter()`
- [ ] Angular 19+ compatibility verification — [SDK #4]
- [ ] Generate API docs from SDK surface (TypeDoc) — [SDK #5]
- [ ] Add Storybook for SDK component showcase — [SDK #3]
- [ ] Example: Express/NestJS backend adapter (not just Next.js)

## v0.3.0 — Accessibility + Theming

- [ ] CSS custom property audit, high-contrast theme
- [ ] WCAG 2.1 AA compliance, `aria-live` improvements
- [ ] Full keyboard navigation (Tab/Enter/Escape)
- [ ] Reduced-motion support, RTL layout
- [ ] Custom theme builder in admin UI

## v0.4.0 — Multi-Provider + MCP

- [ ] OpenAI, Anthropic, Gemini adapter presets
- [ ] MCP (Model Context Protocol) server support
- [ ] Tool registry UI in admin panel
- [ ] Session persistence and conversation history
- [ ] Streaming improvements — token-level streaming

## v1.0.0 — Production Stable

- [ ] Stable public API with semver guarantee
- [ ] Enterprise SSO / auth middleware examples
- [ ] Hosted backend option (no Supabase setup required)
- [ ] Performance benchmarks and bundle size guarantees
- [ ] Full documentation site with search
