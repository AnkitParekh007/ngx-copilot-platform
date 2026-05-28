import { EnvironmentProviders, inject, Injectable, InjectionToken, makeEnvironmentProviders } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Observer } from 'rxjs';
import { CopilotBackendAdapter } from './copilot-backend.adapter';
import { CopilotEvent } from './copilot-event.model';
import { CopilotRequest } from './copilot-request.model';
import { CopilotResponse } from './copilot-response.model';
import { RagQuery } from './rag-query.model';
import { RagResult } from '../models/rag-result.model';
import { ToolExecutionEvent, ToolExecutionRequest } from './tool-execution.model';
import { createAdapterError } from './copilot-adapter-error.model';
import { COPILOT_BACKEND_ADAPTER } from '../tokens/copilot-backend-adapter.token';

export interface HttpCopilotBackendAdapterOptions {
  /**
   * Base URL for your copilot orchestration API (no provider secrets).
   * Must not be empty — a console warning is emitted during development if unset.
   *
   * @example 'https://api.yourapp.com'
   */
  apiBaseUrl: string;
}

export const HTTP_COPILOT_BACKEND_ADAPTER_OPTIONS =
  new InjectionToken<HttpCopilotBackendAdapterOptions>('HTTP_COPILOT_BACKEND_ADAPTER_OPTIONS');

/**
 * Production HTTP/SSE adapter for bring-your-own backend integrations.
 *
 * - `send()` — blocking POST to `${apiBaseUrl}/chat` returning `CopilotResponse`.
 * - `sendStream()` — fetch-based POST SSE stream to `${apiBaseUrl}/chat/stream`.
 *   `CopilotService` automatically prefers `sendStream()` when this adapter is active.
 *
 * This adapter never embeds LLM provider API keys. Authenticate against your own
 * backend via cookies, bearer tokens, or your auth layer.
 *
 * **Setup (app.config.ts):**
 * ```ts
 * import { provideHttpClient } from '@angular/common/http';
 * import { provideCopilot, provideHttpAdapter } from '@ankit-parekh-007/ngx-copilot-sdk';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideHttpClient(),                              // required — HttpClient peer
 *     provideCopilot({ defaultMode: 'ask' }, { useMockBackend: false }),
 *     provideHttpAdapter({ apiBaseUrl: environment.apiUrl }),
 *   ],
 * };
 * ```
 */
@Injectable()
export class HttpCopilotBackendAdapter implements CopilotBackendAdapter {
  private readonly http = inject(HttpClient);
  private readonly options = inject(HTTP_COPILOT_BACKEND_ADAPTER_OPTIONS);

  constructor() {
    if (!this.options.apiBaseUrl) {
      console.warn(
        '[ngx-copilot-sdk] HttpCopilotBackendAdapter: apiBaseUrl is empty. ' +
        'HTTP requests will be sent to the current origin. ' +
        'Pass apiBaseUrl to provideHttpAdapter() or HTTP_COPILOT_BACKEND_ADAPTER_OPTIONS.',
      );
    }
  }

  private url(path: string): string {
    const base = this.options.apiBaseUrl.replace(/\/$/, '');
    return `${base}${path.startsWith('/') ? path : `/${path}`}`;
  }

  /**
   * Non-streaming POST to `/chat`. Returns a single `CopilotResponse`.
   * `CopilotService` will prefer `sendStream()` over this method when both are present.
   */
  send(request: CopilotRequest): Observable<CopilotEvent> {
    return new Observable(observer => {
      const subscription = this.http
        .post<CopilotResponse>(this.url('/chat'), request)
        .subscribe({
          next: response => {
            observer.next({ type: 'message-start', messageId: response.message.id });
            observer.next({ type: 'message-complete', message: response.message });
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
   * Fetch-based POST SSE stream to `/chat/stream`.
   * Uses `ReadableStream` and sends the full `CopilotRequest` as a POST body —
   * safe for large messages and context payloads (no URL length limits).
   * Expected event payloads are `data: <JSON CopilotEvent>\n\n` lines.
   */
  sendStream(request: CopilotRequest): Observable<CopilotEvent> {
    return new Observable((observer: Observer<CopilotEvent>) => {
      const controller = new AbortController();

      fetch(this.url('/chat/stream'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: controller.signal,
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          if (!response.body) {
            throw new Error('Response body is not readable');
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          const pump = (): Promise<void> =>
            reader.read().then(({ done, value }) => {
              if (done) {
                observer.complete();
                return;
              }

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() ?? '';

              for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                const data = line.slice(6).trim();
                if (!data || data === '[DONE]') continue;
                try {
                  const event = JSON.parse(data) as CopilotEvent;
                  observer.next(event);
                  if (event.type === 'done') {
                    reader.cancel();
                    observer.complete();
                    return;
                  }
                  if (event.type === 'error') {
                    reader.cancel();
                    observer.error(event.error);
                    return;
                  }
                } catch {
                  observer.error(
                    createAdapterError('SSE_PARSE_FAILED', `Failed to parse SSE payload: ${data}`, true),
                  );
                  return;
                }
              }

              return pump();
            });

          return pump();
        })
        .catch(err => {
          if ((err as { name?: string }).name === 'AbortError') return;
          observer.error(
            createAdapterError(
              'SSE_CONNECTION_FAILED',
              String((err as Error)?.message ?? err),
              true,
            ),
          );
        });

      return () => controller.abort();
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

/**
 * Angular provider helper for `HttpCopilotBackendAdapter`.
 *
 * Registers the adapter as the `COPILOT_BACKEND_ADAPTER` that `CopilotService` injects.
 * Use alongside `provideCopilot()` and `provideHttpClient()` in `app.config.ts`.
 *
 * @example
 * ```ts
 * import { provideHttpClient } from '@angular/common/http';
 * import { provideCopilot, provideHttpAdapter } from '@ankit-parekh-007/ngx-copilot-sdk';
 * import { environment } from './environments/environment';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideHttpClient(),
 *     provideCopilot({ defaultMode: 'ask' }, { useMockBackend: false }),
 *     provideHttpAdapter({ apiBaseUrl: environment.apiUrl }),
 *   ],
 * };
 * ```
 */
export function provideHttpAdapter(
  options: HttpCopilotBackendAdapterOptions,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: HTTP_COPILOT_BACKEND_ADAPTER_OPTIONS, useValue: options },
    HttpCopilotBackendAdapter,
    { provide: COPILOT_BACKEND_ADAPTER, useExisting: HttpCopilotBackendAdapter },
  ]);
}
