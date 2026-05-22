# Public API Contract

**Package:** `@ankit-parekh-007/ngx-copilot-sdk`  
**Version:** 0.1.x  
**Entry point:** `projects/ngx-copilot-sdk/src/public-api.ts`

---

## Stability classifications

| Classification | Meaning |
|----------------|---------|
| **Stable**     | No breaking changes within 0.1.x. Breaking changes require a version bump per versioning policy. |
| **Preview**    | Shape may change between 0.x minor versions. Exported for early adopter feedback. |
| **Internal**   | Not exported. May change at any time. Do not reference via deep imports. |

---

## Stable 0.1.x APIs

These symbols are exported from `public-api.ts` and considered stable for the 0.1.x series.

### Token

| Symbol | File | Notes |
|--------|------|-------|
| `COPILOT_CONFIG` | `tokens/copilot-config.token` | Angular `InjectionToken` for config |
| `provideCopilot` | `tokens/copilot-config.token` | Provider factory function |

### Configuration

| Symbol | File | Notes |
|--------|------|-------|
| `CopilotConfig` | `models/copilot-config.model` | Main configuration interface |
| `CopilotMode` | `models/copilot-config.model` | `'ask' \| 'plan' \| 'execute' \| 'debug'` |
| `normalizeCopilotConfig` | `models/copilot-config.model` | Applies defaults to partial config |

### Models

| Symbol | File | Notes |
|--------|------|-------|
| `CopilotContext` | `models/copilot-context.model` | Route + tenant context shape |
| `CopilotMessage` | `models/copilot-message.model` | Chat message shape |
| `ToolDefinition` | `models/tool-definition.model` | Tool registration contract |
| `RagResult` | `models/rag-result.model` | RAG citation shape (optional `repo`, `branch`, `filePath`, `fileKind`, `chunkId`, `tags` for code/doc UX) |
| `ApprovalRequest` | `models/approval-request.model` | Approval card data shape |
| `ApprovalTone` | `models/approval-request.model` | `'neutral' \| 'caution' \| 'critical' \| 'resolved'` |
| `getApprovalTone` | `models/approval-request.model` | Pure function deriving tone from request |
| `ToolTimelineItem` | `models/tool-timeline-item.model` | Timeline entry shape |

### Services

| Symbol | File | Notes |
|--------|------|-------|
| `ContextProviderService` | `services/context-provider.service` | Serializes context for backend calls |
| `ToolRegistryService` | `services/tool-registry.service` | Register and look up tool definitions |

### Utilities

| Symbol | File | Notes |
|--------|------|-------|
| `tokenizePrompt` | `services/streaming-adapter.service` | Splits prompt string into tokens |

---

## Preview APIs

These symbols are exported but their shape or behavior may change in 0.2.0 or later.

### Services

| Symbol | File | Caveat |
|--------|------|--------|
| `CopilotService` | `services/copilot.service` | Signal-based orchestration; pairs with backend adapter |
| `CopilotBackendAdapter` | `adapters/copilot-backend.adapter` | Implement for your orchestration API |
| `MockCopilotBackendAdapter` | `adapters/mock-copilot-backend.adapter` | Default mock for demo/local |
| `HttpCopilotBackendAdapter` | `adapters/http-copilot-backend.adapter` | HTTP/SSE skeleton — not a full client |
| `COPILOT_BACKEND_ADAPTER` | `tokens/copilot-backend-adapter.token` | Override mock backend in DI |
| `RagAdapterService` | `services/rag-adapter.service` | Normalizes citation payloads |
| `StreamingAdapterService` | `services/streaming-adapter.service` | Simulated token stream helper |

### UI Components

All exported components are **preview** in 0.1.x. Input/output shapes may change.

| Symbol | File | Caveat |
|--------|------|--------|
| `CopilotShellComponent` | `components/copilot-shell` | Composition shell; layout API not final |
| `CopilotChatComponent` | `components/copilot-chat` | Message thread display |
| `AgentModeSelectorComponent` | `components/agent-mode-selector` | Mode button group |
| `ApprovalCardComponent` | `components/approval-card` | Approval UI card |
| `RagSourceCardComponent` | `components/rag-source-card` | RAG citation card |
| `StreamingMessageComponent` | `components/streaming-message` | Token-by-token message display |
| `ToolCallTimelineComponent` | `components/tool-call-timeline` | Tool execution timeline |

---

## Internal APIs (not exported)

These exist in the source but are intentionally not part of the public API.

- Adapter example files (`adapters/nestjs-copilot-adapter.example.ts`, `adapters/openai-adapter.example.ts`) — illustrative only
- Internal component template logic and styling
- Any `private` or `protected` class members

Do not reference these via deep imports (e.g., `@ankit-parekh-007/ngx-copilot-sdk/lib/...`). Only the barrel export `@ankit-parekh-007/ngx-copilot-sdk` is supported.

---

## Breaking-change policy before 1.0

During `0.x`:

- **Stable symbols** will not have breaking changes within the same minor (0.1.x).
- **Preview symbols** may change between minor versions (0.1 → 0.2).
- All breaking changes are documented in `CHANGELOG.md` and `docs/migration-guide.md`.

At `1.0.0`:
- All currently-stable symbols become fully stable.
- Breaking changes only on major version bumps (1.0 → 2.0).
- Preview symbols are either promoted to stable or removed before 1.0.
