import { Observable } from 'rxjs';
import { CopilotEvent } from './copilot-event.model';
import { CopilotRequest } from './copilot-request.model';
import { RagQuery } from './rag-query.model';
import { RagResult } from '../models/rag-result.model';
import { ToolExecutionEvent, ToolExecutionRequest } from './tool-execution.model';

/**
 * Backend contract for copilot orchestration. Implementations must not expose
 * provider API keys to the browser — only your own backend endpoints.
 *
 * **Required:**
 * - `send()` — handles a user message and emits a stream of {@link CopilotEvent}s.
 *
 * **Optional streaming upgrade:**
 * - `sendStream()` — like `send()` but signals that it uses a true SSE/chunked
 *   streaming path. When present, `CopilotService` prefers it over `send()`.
 *   Use this on adapters where `send()` returns a blocking JSON response and you
 *   want a separate streaming entry point (e.g. `HttpCopilotBackendAdapter`).
 *
 * **Optional capabilities:**
 * - `queryRag()` — RAG lookup against your backend retrieval API.
 * - `executeTool()` — tool execution stream with approval awareness.
 * - `resolveApproval()` — resolve a pending approval (approve or reject).
 */
export interface CopilotBackendAdapter {
  /** Non-streaming (or internally-streaming) copilot response. Always required. */
  send(request: CopilotRequest): Observable<CopilotEvent>;

  /**
   * Streaming SSE upgrade. When implemented, `CopilotService` calls this
   * instead of `send()` for chat messages.
   * Expected to emit the same {@link CopilotEvent} discriminated union as `send()`.
   */
  sendStream?(request: CopilotRequest): Observable<CopilotEvent>;

  /** Optional RAG lookup against your backend retrieval API. */
  queryRag?(query: RagQuery): Observable<RagResult[]>;

  /** Optional tool execution stream with approval awareness. */
  executeTool?(request: ToolExecutionRequest): Observable<ToolExecutionEvent>;

  /** Resolve a pending approval (approve or reject). */
  resolveApproval?(requestId: string, decision: 'approved' | 'rejected'): Observable<CopilotEvent>;
}
