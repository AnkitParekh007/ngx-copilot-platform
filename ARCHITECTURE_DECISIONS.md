# Architecture Decision Records — ngx-copilot-platform

This file records the decisions that define the platform boundary. New decisions should use the same Context → Decision → Alternatives → Consequences format.

## ADR-001 — Keep provider credentials behind the backend

**Context:** Angular applications need model and retrieval capabilities, but browser-delivered secrets are not secrets.

**Decision:** All provider credentials, privileged Supabase access, ingestion, retrieval policy, API-key validation and protected tool execution remain server-side. Angular receives only public runtime configuration and typed events.

**Alternatives considered:** direct provider calls from the browser; embedding long-lived API keys in build-time environment files.

**Consequences:** an additional backend is required, but credential handling, auditing and execution policy have a trustworthy enforcement point.

## ADR-002 — Use a typed event stream between backend and SDK

**Context:** AI interactions have intermediate states—retrieval, streaming text, citations, approvals, tool work, failure and completion.

**Decision:** Normalize backend activity into typed `CopilotEvent` messages delivered over SSE rather than exposing provider-specific streaming payloads directly to Angular components.

**Alternatives considered:** provider-specific browser SDKs; returning only a final JSON response.

**Consequences:** adapters must translate provider behavior, but UI state is deterministic, testable and provider-neutral.

## ADR-003 — Treat approval as a backend-owned state transition

**Context:** a visual approval button without server enforcement is not a security boundary.

**Decision:** Approval state is represented in the UI but resolved by an authenticated backend endpoint. Protected work may proceed only after the backend accepts the transition.

**Alternatives considered:** client-only confirmation; executing first and presenting an informational confirmation afterward.

**Consequences:** more lifecycle state is required, but human-in-the-loop becomes enforceable and auditable.

## ADR-004 — Keep mock adapters explicit

**Context:** contributors need deterministic UI development without provider keys, but mock behavior must never be confused with production capability.

**Decision:** support mock-backed development while clearly separating it from production configuration and disabling incomplete executors.

**Alternatives considered:** requiring live providers for every UI test; silently falling back from production to mock behavior.

**Consequences:** local development is easier while production failure modes remain fail-closed.
