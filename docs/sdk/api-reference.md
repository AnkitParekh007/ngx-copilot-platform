# API Reference

## provideCopilot(config)

Registers SDK configuration through Angular dependency injection.

## CopilotConfig

- `apiBaseUrl`: backend API URL.
- `defaultMode`: ask, plan, execute, or debug.
- `enableApprovals`: renders approval UI.
- `enableRagSources`: renders RAG citations.
- `enableToolTimeline`: renders tool execution timeline.

## CopilotContext

Safe page context: route, title, user role, tenant id, selected record id, and metadata.

## ToolDefinition

Typed tool contract with name, description, approval requirement, and execute function.

## RagResult

UI-ready retrieved source with title, snippet, score, and optional URL.
