# RAG Adapter

`RagAdapterService` normalizes retrieved evidence into UI-ready `RagResult` records.

Why this matters:
- backend payloads are often inconsistent
- UI components need a stable citation shape
- teams usually want to enrich results with source type and URL metadata

The mock implementation is intentionally simple. Its job in this repo is to show the adapter boundary, not to pretend there is a production retrieval layer.
