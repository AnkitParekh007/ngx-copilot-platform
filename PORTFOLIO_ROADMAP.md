# Portfolio Roadmap — ngx-copilot-platform

The roadmap is prioritized around architectural proof rather than feature count.

## Now — strengthen production boundaries

- keep SDK/backend contracts synchronized and versioned
- expand failure-state tests for stream interruption, retrieval failure and rejected approvals
- document authentication, CORS, runtime configuration and migration requirements as release gates
- keep incomplete executors disabled rather than demoing them as production capability

## Next — observability and evaluation

- add trace correlation from request → retrieval → provider → approval/tool events
- expose safe latency/error metrics without leaking prompt or secret data
- add retrieval/citation quality fixtures and regression evaluation
- document SLO/SLA assumptions for a self-hosted deployment

## Later — governed execution

- add a production-grade executor behind explicit tool policy
- add idempotency and replay protection for consequential actions
- add richer audit/event export
- add tenant-aware policy boundaries where deployment requirements justify them

## Open-source quality gates

- architecture changes include an ADR update
- public capabilities are represented by tests or explicit demo/planned labels
- breaking SDK contracts require migration notes
- screenshots and live demos must not imply unimplemented backend behavior
