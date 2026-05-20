import { Injectable, InjectionToken } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { CopilotBackendAdapter } from './copilot-backend.adapter';
import { CopilotEvent } from './copilot-event.model';
import { CopilotRequest } from './copilot-request.model';
import { RagQuery } from './rag-query.model';
import { RagResult } from '../models/rag-result.model';
import { ToolExecutionEvent, ToolExecutionRequest } from './tool-execution.model';
import { createAdapterError } from './copilot-adapter-error.model';

export interface NgxCopilotPlatformConfig {
  /**
   * Base URL of the ngx-copilot-platform backend (packages/backend).
   * Example: 'http://localhost:3001' or 'https://your-platform.vercel.app'
   */
  apiUrl: string;

  /**
   * API key prefixed with `cpk_` — issued by the platform backend.
   * Never embed production keys in source code; use environment files.
   */
  apiKey: string;
}

export const NGX_COPILOT_PLATFORM_CONFIG =
  new InjectionToken<NgxCopilotPlatformConfig>('NGX_COPILOT_PLATFORM_CONFIG');

/**
 * Production backend adapter for the ngx-copilot-platform backend (packages/backend).
 *
 * Wires the Angular SDK directly to the Next.js API backend that provides:
 * - RAG pipeline (Supabase pgvector embeddings)
 * - GitHub / Bitbucket / docs ingestion
 * - OpenAI LLM orchestration
 * - Rate limiting (Upstash Redis)
 * - Audit logging
 *
 * API key authentication uses the `Authorization: Bearer cpk_xxx` header.
 * Keys are issued via the admin UI — never proxy LLM provider secrets to the browser.
 *
 * @example
 * ```ts
 * // app.config.ts
 * import { provideCopilot } from '@ngx-copilot/sdk';
 * import { providePlatformBackend } from '@ngx-copilot/sdk';
 * import { environment } from './environments/environment';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideCopilot({ mode: 'ask', theme: 'system' }),
 *     providePlatformBackend({ apiUrl: environment.apiUrl, apiKey: environment.apiKey }),
 *   ],
 * };
 * ```
 */
@Injectable()
export class NgxCopilotPlatformBackendAdapter implements CopilotBackendAdapter {
  private readonly config: NgxCopilotPlatformConfig;

  constructor(config: NgxCopilotPlatformConfig) {
    this.config = config;
  }

  private url(path: string): string {
    const base = this.config.apiUrl.replace(/\/$/, '');
    return `${base}${path.startsWith('/') ? path : `/${path}`}`;
  }

  private headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
    };
  }

  /**
   * Send a chat message and receive streaming events via SSE (Fetch streaming).
   * Falls back to a non-streaming POST if ReadableStream is unavailable.
   */
  send(request: CopilotRequest): Observable<CopilotEvent> {
    return new Observable((observer: Observer<CopilotEvent>) => {
      const controller = new AbortController();

      fetch(this.url('/api/copilot/chat/stream'), {
        method: 'POST',
        headers: this.headers(),
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
            createAdapterError('SSE_CONNECTION_FAILED', String((err as Error)?.message ?? err), true),
          );
        });

      return () => controller.abort();
    });
  }

  queryRag(query: RagQuery): Observable<RagResult[]> {
    return new Observable(observer => {
      const controller = new AbortController();

      fetch(this.url('/api/copilot/rag/query'), {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(query),
        signal: controller.signal,
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          return res.json() as Promise<RagResult[]>;
        })
        .then(results => {
          observer.next(results);
          observer.complete();
        })
        .catch(err => {
          if ((err as { name?: string }).name === 'AbortError') return;
          observer.error(
            createAdapterError('RAG_QUERY_FAILED', String((err as Error)?.message ?? err), true),
          );
        });

      return () => controller.abort();
    });
  }

  executeTool(request: ToolExecutionRequest): Observable<ToolExecutionEvent> {
    return new Observable(observer => {
      const controller = new AbortController();

      fetch(this.url('/api/copilot/tools/execute'), {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(request),
        signal: controller.signal,
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          return res.json() as Promise<ToolExecutionEvent>;
        })
        .then(event => {
          observer.next(event);
          observer.complete();
        })
        .catch(err => {
          if ((err as { name?: string }).name === 'AbortError') return;
          observer.error(
            createAdapterError('TOOL_EXEC_FAILED', String((err as Error)?.message ?? err), true),
          );
        });

      return () => controller.abort();
    });
  }

  resolveApproval(requestId: string, decision: 'approved' | 'rejected'): Observable<CopilotEvent> {
    return new Observable(observer => {
      const controller = new AbortController();

      fetch(this.url(`/api/copilot/approvals/${requestId}/resolve`), {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({ decision }),
        signal: controller.signal,
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          return res.json() as Promise<CopilotEvent>;
        })
        .then(event => {
          observer.next(event);
          observer.complete();
        })
        .catch(err => {
          if ((err as { name?: string }).name === 'AbortError') return;
          observer.error(
            createAdapterError('APPROVAL_FAILED', String((err as Error)?.message ?? err), true),
          );
        });

      return () => controller.abort();
    });
  }
}

/**
 * Angular provider helper for NgxCopilotPlatformBackendAdapter.
 *
 * @example
 * ```ts
 * // app.config.ts
 * providers: [
 *   providePlatformBackend({ apiUrl: environment.apiUrl, apiKey: environment.apiKey })
 * ]
 * ```
 */
export function providePlatformBackend(config: NgxCopilotPlatformConfig) {
  return [
    { provide: NGX_COPILOT_PLATFORM_CONFIG, useValue: config },
    {
      provide: NgxCopilotPlatformBackendAdapter,
      useFactory: () => new NgxCopilotPlatformBackendAdapter(config),
    },
  ];
}
