import { Observable } from 'rxjs';
import { CopilotEvent } from './copilot-event.model';
import { CopilotRequest } from './copilot-request.model';
import { RagQuery } from './rag-query.model';
import { RagResult } from '../models/rag-result.model';
import { ToolExecutionEvent, ToolExecutionRequest } from './tool-execution.model';

/**
 * Backend contract for copilot orchestration. Implementations must not expose
 * provider API keys to the browser — only your own backend endpoints.
 */
export interface CopilotBackendAdapter {
  /** Stream copilot events for a user message (Observable-based). */
  send(request: CopilotRequest): Observable<CopilotEvent>;

  /** Optional RAG lookup against your backend retrieval API. */
  queryRag?(query: RagQuery): Observable<RagResult[]>;

  /** Optional tool execution stream with approval awareness. */
  executeTool?(request: ToolExecutionRequest): Observable<ToolExecutionEvent>;

  /** Resolve a pending approval (approve or reject). */
  resolveApproval?(requestId: string, decision: 'approved' | 'rejected'): Observable<CopilotEvent>;
}
