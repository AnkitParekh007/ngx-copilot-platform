import { HttpClient } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { CopilotBackendAdapter } from './copilot-backend.adapter';
import { CopilotEvent } from './copilot-event.model';
import { CopilotRequest } from './copilot-request.model';
import { CopilotResponse } from './copilot-response.model';
import { RagQuery } from './rag-query.model';
import { RagResult } from '../models/rag-result.model';
import { ToolExecutionEvent, ToolExecutionRequest } from './tool-execution.model';
import { createAdapterError } from './copilot-adapter-error.model';

export interface HttpCopilotBackendAdapterOptions {
  /** Base URL for your copilot orchestration API (no provider secrets). */
  apiBaseUrl: string;
}

export const HTTP_COPILOT_BACKEND_ADAPTER_OPTIONS =
  new InjectionToken<HttpCopilotBackendAdapterOptions>('HTTP_COPILOT_BACKEND_ADAPTER_OPTIONS');

/**
 * HTTP/SSE skeleton for production-shaped integrations.
 *
 * - `send` uses POST `/chat` for non-streaming JSON responses.
 * - `sendStream` (via SSE) is documented below — enable when your backend exposes
 *   `text/event-stream` at `${apiBaseUrl}/chat/stream`.
 *
 * This adapter never embeds LLM provider API keys; consumers authenticate
 * against their own backend (cookies, bearer tokens from your auth layer, etc.).
 */
@Injectable()
export class HttpCopilotBackendAdapter implements CopilotBackendAdapter {
  private readonly http = inject(HttpClient);
  private readonly options = inject(HTTP_COPILOT_BACKEND_ADAPTER_OPTIONS);

  private url(path: string): string {
    const base = this.options.apiBaseUrl.replace(/\/$/, '');
    return `${base}${path.startsWith('/') ? path : `/${path}`}`;
  }

  send(request: CopilotRequest): Observable<CopilotEvent> {
    return new Observable(observer => {
      const subscription = this.http
        .post<CopilotResponse>(this.url('/chat'), request)
        .subscribe({
          next: response => {
            observer.next({ type: 'message-start', messageId: response.message.id });
            observer.next({
              type: 'message-complete',
              message: response.message,
            });
            if (response.sources?.length) {
              observer.next({ type: 'sources', sources: response.sources });
            }
            observer.next({ type: 'done' });
            observer.complete();
          },
          error: err =>
            observer.error(
              createAdapterError('HTTP_CHAT_FAILED', String(err?.message ?? err), true),
            ),
        });

      return () => subscription.unsubscribe();
    });
  }

  /**
   * Optional SSE stream. Wire this when your backend supports Server-Sent Events.
   * Expected event payloads are JSON-encoded {@link CopilotEvent} objects.
   */
  sendStream(request: CopilotRequest): Observable<CopilotEvent> {
    return new Observable((observer: Observer<CopilotEvent>) => {
      if (typeof EventSource === 'undefined') {
        observer.error(
          createAdapterError(
            'SSE_UNAVAILABLE',
            'EventSource is not available in this environment.',
            false,
          ),
        );
        return;
      }

      const url = new URL(this.url('/chat/stream'));
      url.searchParams.set('message', request.message);
      url.searchParams.set('mode', request.mode);

      const source = new EventSource(url.toString());

      source.onmessage = event => {
        try {
          const parsed = JSON.parse(event.data) as CopilotEvent;
          observer.next(parsed);
          if (parsed.type === 'done') {
            source.close();
            observer.complete();
          } else if (parsed.type === 'error') {
            source.close();
            observer.error(parsed.error);
          }
        } catch {
          observer.error(
            createAdapterError('SSE_PARSE_FAILED', 'Failed to parse SSE payload.', true),
          );
        }
      };

      source.onerror = () => {
        source.close();
        observer.error(
          createAdapterError('SSE_CONNECTION_FAILED', 'SSE connection failed.', true),
        );
      };

      return () => source.close();
    });
  }

  queryRag(query: RagQuery): Observable<RagResult[]> {
    return this.http.post<RagResult[]>(this.url('/rag/query'), query);
  }

  executeTool(request: ToolExecutionRequest): Observable<ToolExecutionEvent> {
    return this.http.post<ToolExecutionEvent>(this.url('/tools/execute'), request);
  }

  resolveApproval(
    requestId: string,
    decision: 'approved' | 'rejected',
  ): Observable<CopilotEvent> {
    return this.http.post<CopilotEvent>(this.url(`/approvals/${requestId}/resolve`), {
      decision,
    });
  }
}
