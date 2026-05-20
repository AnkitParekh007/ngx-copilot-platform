import { Injectable } from '@angular/core';
import { Observable, concat, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CopilotBackendAdapter } from './copilot-backend.adapter';
import { CopilotEvent } from './copilot-event.model';
import { CopilotRequest } from './copilot-request.model';
import { RagQuery } from './rag-query.model';
import { RagResult } from '../models/rag-result.model';
import { ApprovalRequest } from '../models/approval-request.model';
import { ToolTimelineItem } from '../models/tool-timeline-item.model';
import { ToolExecutionEvent, ToolExecutionRequest } from './tool-execution.model';
import { tokenizePrompt } from '../services/streaming-adapter.service';

@Injectable()
export class MockCopilotBackendAdapter implements CopilotBackendAdapter {
  private sessionId = `session-${Date.now()}`;
  private pendingApprovals = new Map<string, ApprovalRequest>();

  send(request: CopilotRequest): Observable<CopilotEvent> {
    const messageId = `msg-${Date.now()}`;
    const tokens = tokenizePrompt(request.message);
    const content = tokens.join('');

    const streamChunks: CopilotEvent[] = [
      { type: 'session-started', sessionId: this.sessionId },
      { type: 'message-start', messageId },
      ...tokens.map((token, index) => ({
        type: 'message-chunk' as const,
        messageId,
        content: token + (index < tokens.length - 1 ? ' ' : ''),
      })),
    ];

    const sources: RagResult[] = [
      {
        id: 'rag-mock-1',
        title: 'Policy handbook',
        snippet: 'Mock retrieval result for local preview.',
        score: 0.88,
        sourceType: 'knowledge-base',
      },
    ];

    const timeline: ToolTimelineItem[] = [
      {
        id: 'tool-mock-1',
        toolName: 'lookupAccount',
        status: 'succeeded',
        summary: 'Loaded account context from mock backend.',
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
      },
    ];

    const approval: ApprovalRequest = {
      id: `approval-${Date.now()}`,
      title: 'Send customer update',
      reason: 'Mock approval gate for preview demos.',
      actionSummary: `Apply changes suggested for: ${request.message.slice(0, 80)}`,
      riskLevel: 'medium',
    };
    this.pendingApprovals.set(approval.id, approval);

    const complete: CopilotEvent[] = [
      {
        type: 'message-complete',
        message: {
          id: messageId,
          role: 'assistant',
          content,
          createdAt: new Date().toISOString(),
          sources,
        },
      },
      { type: 'sources', sources },
      { type: 'tool-timeline', items: timeline },
      { type: 'approval-required', request: approval },
      { type: 'done' },
    ];

    return concat(
      ...streamChunks.map(event => of(event).pipe(delay(30))),
      ...complete.map(event => of(event).pipe(delay(20))),
    );
  }

  queryRag(query: RagQuery): Observable<RagResult[]> {
    return of([
      {
        id: 'rag-query-1',
        title: `Results for "${query.query}"`,
        snippet: 'Mock RAG response — wire HttpCopilotBackendAdapter for real data.',
        score: 0.75,
        sourceType: 'knowledge-base',
      },
    ]);
  }

  executeTool(request: ToolExecutionRequest): Observable<ToolExecutionEvent> {
    const requestId = `tool-req-${Date.now()}`;
    const events: ToolExecutionEvent[] = [
      { type: 'started', toolName: request.toolName, requestId },
      { type: 'progress', requestId, summary: 'Mock tool execution in progress.' },
    ];

    if (request.requiresApproval && !request.approvalRequestId) {
      events.push({
        type: 'approval-required',
        request: {
          id: `approval-tool-${Date.now()}`,
          title: `Approve ${request.toolName}`,
          reason: 'Tool requires human approval before execution.',
          actionSummary: JSON.stringify(request.input),
          riskLevel: 'high',
        },
      });
      return concat(...events.map(e => of(e).pipe(delay(25))));
    }

    events.push({ type: 'completed', requestId, output: { ok: true, mock: true } });
    return concat(...events.map(e => of(e).pipe(delay(25))));
  }

  resolveApproval(requestId: string, decision: 'approved' | 'rejected'): Observable<CopilotEvent> {
    const pending = this.pendingApprovals.get(requestId);
    if (!pending) {
      return throwError(() => ({
        code: 'APPROVAL_NOT_FOUND',
        message: `No pending approval for id ${requestId}`,
        recoverable: true,
      }));
    }
    this.pendingApprovals.delete(requestId);
    return of({ type: 'approval-resolved', requestId, decision });
  }
}
