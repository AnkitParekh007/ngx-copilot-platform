# Failure and Recovery Demo

Open the Angular demo at `/failure-lab` to inspect deterministic failure behavior built from the public `@ankit-parekh-007/ngx-copilot-sdk` contracts.

## Reviewer walkthrough

### 1. SSE disconnect

The event sequence starts a session and message, emits a partial chunk, then emits a recoverable `CopilotAdapterError` with code `STREAM_DISCONNECTED`. There is no `done` event and the UI claims no completed response, citations, or execution.

Choose **Retry from request boundary**. The recovered scenario preserves the same safe request-context snapshot, restores grounded sources, shows a tool proposal in `awaiting_approval`, and stops without claiming execution while approval remains pending.

### 2. Retrieval failure

The deterministic adapter error uses `RETRIEVAL_FAILED`. No `sources` or `tool-timeline` event is emitted, the citation surface is empty, and the result explicitly says trusted evidence is unavailable.

### 3. Approval rejected

The event sequence includes:

- grounded `sources`
- `tool-timeline` with `awaiting_approval`
- `approval-required`
- `approval-resolved` with `decision: rejected`
- a final `tool-timeline` item with `status: skipped`

The terminal claim is **not executed**.

### 4. Tool disabled

Grounded evidence remains visible while the tool timeline shows `status: skipped` and an explicit policy explanation. The UI does not hide the disabled action and does not report success.

## SDK contracts exercised

The demo uses public SDK types rather than a parallel demo vocabulary:

- `CopilotEvent`
- `CopilotAdapterError`
- `RagResult`
- `ToolTimelineItem`
- `ApprovalRequest`

The Angular scenario spec asserts the event ordering and terminal claims.

## Backend contract

`packages/backend/lib/copilot-failure-contract.ts` defines the backend semantic contract for the same four failure classes. Backend tests assert that:

- stream disconnects are recoverable but non-executed
- retrieval failures suppress sources and tools
- approval rejection cannot execute
- disabled tools remain explicitly non-executed

This helper does not perform retrieval or execution. It records what the backend is allowed to claim so adapters and UI surfaces can stay truthful.

## Validation

The repository CI now runs:

```bash
pnpm --filter @ankit-parekh-007/ngx-copilot-sdk test:coverage
pnpm --filter demo-app test -- --watch=false --browsers=ChromeHeadless
pnpm --filter demo-app build
pnpm --filter @ngx-copilot/backend typecheck
pnpm --filter @ngx-copilot/backend test
pnpm --filter @ngx-copilot/backend build
```

## Screenshot set

Capture these states after deployment:

1. `/failure-lab` — SSE disconnect before retry
2. `/failure-lab` — recovered stream after retry, with citations and pending approval
3. `/failure-lab` — retrieval failure with zero citations/tools
4. `/failure-lab` — rejected approval with skipped timeline item
5. `/failure-lab` — tool disabled with explicit policy reason

The global mock disclosure remains visible throughout the demo so none of these states can be mistaken for live production execution.
