# ngx-copilot-platform — 2026.08 Public Proof Edition

This release packages `ngx-copilot-platform` as the **Platform** layer of the public AI frontend architecture ecosystem.

## Positioning

**A full-stack Angular copilot platform with a typed SDK, backend-owned trust boundary, grounded retrieval, approvals, tools, explicit failure semantics, and a deterministic public Failure Lab.**

## What is new in this edition

- public GitHub Pages showcase plus `/failure-lab`;
- SDK contracts for streaming events, citations, approvals, tool timelines, adapter errors, and RAG results;
- deterministic SSE-disconnect, retrieval-unavailable, approval-rejected, policy-disabled-tool, and recovered-retry scenarios;
- route verification and post-deploy smoke checks that treat the Failure Lab as part of the public deployment contract;
- an optimized `platform-failure-lab.gif` embedded above the fold;
- reproducible Playwright capture for main demo and degraded-state proof;
- clearer frontend SDK ↔ backend policy/RAG/tool boundary documentation.

## Public proof

- Live demo: https://ankitparekh007.github.io/ngx-copilot-platform/
- Failure Lab: https://ankitparekh007.github.io/ngx-copilot-platform/failure-lab
- Public proof: `docs/public-proof.md`
- Visual walkthrough: `docs/assets/public-proof/platform-failure-lab.gif`
- npm package: `@ankit-parekh-007/ngx-copilot-sdk`

## Suggested GitHub Release title

`2026.08 Public Proof Edition — Angular Copilot SDK + Failure Lab`

## Suggested release summary

The 2026.08 `ngx-copilot-platform` release turns the flagship platform into a reviewer-ready full-stack proof: a reusable Angular SDK, backend-owned auth/RAG/approval boundaries, explicit semantic failures, a public deterministic Failure Lab, deployment verification, and an optimized recruiter walkthrough.

Start with the live demo, then open `/failure-lab` to inspect what the SDK/backend contract does when retrieval, approvals, policies, or streaming fail.

## Best launch links

| Audience | Link |
| --- | --- |
| Architect / recruiter | `docs/public-proof.md` |
| Angular developer | live demo + npm SDK |
| Backend/platform engineer | backend package and architecture docs |
| Reliability/security reviewer | `/failure-lab` |

## Verification before publishing a GitHub Release

Require the full repository CI to remain green across SDK lint/build/tests, demo/admin/example builds, backend typecheck/tests/build, and the GitHub Pages route/deployment checks.

## Release boundary

The Failure Lab is deterministic public proof, not a representation of production incidents. Browser/tool capabilities remain governed by backend configuration and policy.

## Release date

2026-08-10
