# Streaming Adapter

`StreamingAdapterService` models token or chunk delivery for copilot responses.

The current mock behavior:
- tokenizes a synthetic response
- emits ordered chunks
- marks the final chunk with `done: true`

This keeps the UI contract testable before any real SSE, WebSocket, or fetch-stream implementation is wired in.
