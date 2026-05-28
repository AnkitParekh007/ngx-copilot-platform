import { inject, Injectable, Signal, computed, signal } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { retry } from 'rxjs/operators';
import { COPILOT_BACKEND_ADAPTER } from '../tokens/copilot-backend-adapter.token';
import { COPILOT_CONFIG } from '../tokens/copilot-config.token';
import { CopilotBackendAdapter } from '../adapters/copilot-backend.adapter';
import { CopilotAdapterError } from '../adapters/copilot-adapter-error.model';
import { CopilotEvent } from '../adapters/copilot-event.model';
import { CopilotRequest } from '../adapters/copilot-request.model';
import { CopilotMode } from '../models/copilot-config.model';
import { CopilotContext } from '../models/copilot-context.model';
import { CopilotMessage } from '../models/copilot-message.model';
import { RagResult } from '../models/rag-result.model';
import { ApprovalRequest } from '../models/approval-request.model';
import { ToolTimelineItem } from '../models/tool-timeline-item.model';
import { MockCopilotBackendAdapter } from '../adapters/mock-copilot-backend.adapter';
import { ToolRegistryService } from './tool-registry.service';

/**
 * Central state service for the copilot SDK.
 *
 * Provided at root by default. To scope a second independent copilot instance
 * to a specific component subtree, add `CopilotService` to the component's
 * `providers` array — Angular will create a fresh instance for that subtree:
 *
 * ```ts
 * @Component({
 *   providers: [CopilotService],
 *   // ...
 * })
 * export class MyScopedCopilotComponent {}
 * ```
 *
 * The component's `<ngx-copilot-shell [useService]="true">` will then pick up
 * the scoped instance instead of the global root one.
 */
@Injectable({ providedIn: 'root' })
export class CopilotService {
  private readonly config = inject(COPILOT_CONFIG, { optional: true });
  private readonly adapter = inject(COPILOT_BACKEND_ADAPTER, { optional: true });
  private readonly toolRegistry = inject(ToolRegistryService);

  private readonly _messages = signal<CopilotMessage[]>([]);
  private readonly _sources = signal<RagResult[]>([]);
  private readonly _timeline = signal<ToolTimelineItem[]>([]);
  private readonly _approval = signal<ApprovalRequest | undefined>(undefined);
  private readonly _isStreaming = signal(false);
  private readonly _error = signal<CopilotAdapterError | undefined>(undefined);
  private readonly _activeMode = signal<CopilotMode>('ask');
  private readonly _sessionId = signal<string | undefined>(undefined);
  private readonly _systemPrompt = signal<string | undefined>(undefined);

  private streamSub?: Subscription;
  private _lastRequest?: { content: string; context?: CopilotContext };
  private readonly fallbackAdapter = new MockCopilotBackendAdapter();

  readonly messages: Signal<CopilotMessage[]> = this._messages.asReadonly();
  readonly sources: Signal<RagResult[]> = this._sources.asReadonly();
  readonly timeline: Signal<ToolTimelineItem[]> = this._timeline.asReadonly();
  readonly approval: Signal<ApprovalRequest | undefined> = this._approval.asReadonly();
  readonly isStreaming: Signal<boolean> = this._isStreaming.asReadonly();
  readonly error: Signal<CopilotAdapterError | undefined> = this._error.asReadonly();
  readonly activeMode: Signal<CopilotMode> = this._activeMode.asReadonly();
  /** Session ID emitted by the backend on the first `session-started` event. */
  readonly sessionId: Signal<string | undefined> = this._sessionId.asReadonly();

  readonly hasConfig = computed(() => !!this.config);
  readonly statusLabel = computed(() => this.config?.statusLabel ?? 'Preview SDK');

  constructor() {
    if (this.config?.defaultMode) {
      this._activeMode.set(this.config.defaultMode);
    }
  }

  get endpoint(): string {
    return this.config?.apiBaseUrl ?? '';
  }

  sendMessage(content: string, context?: CopilotContext): void {
    const trimmed = content.trim();
    if (!trimmed || this._isStreaming()) return;

    const backend = this.resolveAdapter();
    if (!backend) {
      this._error.set({
        code: 'COPILOT_NOT_CONFIGURED',
        message:
          'No copilot backend is configured. ' +
          'Add provideCopilot() to your app.config.ts providers. ' +
          'For a local demo without a server, provideCopilot() uses the mock adapter by default.',
        recoverable: true,
      });
      return;
    }

    this._lastRequest = { content: trimmed, context };
    this._error.set(undefined);
    this._isStreaming.set(true);

    const userMessage: CopilotMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    this._messages.update(messages => [...messages, userMessage]);

    let assistantDraft = '';
    let assistantId = '';

    const request: CopilotRequest = {
      message: trimmed,
      mode: this._activeMode(),
      context,
      systemPrompt: this._systemPrompt(),
    };

    // Prefer sendStream() when the adapter exposes it (true SSE path).
    // Fall back to send() for adapters that stream internally (NgxCopilotPlatformBackendAdapter).
    const stream$ = backend.sendStream
      ? backend.sendStream(request)
      : backend.send(request);

    const retryCount = this.config?.streamRetryCount ?? 2;

    this.streamSub?.unsubscribe();
    this.streamSub = stream$
      .pipe(
        retryCount > 0
          ? retry({
              count: retryCount,
              delay: (_, attempt) => timer(attempt * 1000),
              resetOnSuccess: true,
            })
          : (source => source),
      )
      .subscribe({
        next: event =>
          this.handleEvent(event, {
            onChunk: chunk => { assistantDraft += chunk; },
            getDraft: () => assistantDraft,
            setAssistantId: id => { assistantId = id; },
            getAssistantId: () => assistantId,
          }),
        error: err => {
          this._isStreaming.set(false);
          this._error.set(this.normalizeError(err));
        },
        complete: () => this._isStreaming.set(false),
      });
  }

  /**
   * Retry the last message after a stream failure.
   * No-op when there's no previous message or a stream is already in progress.
   */
  retryLastMessage(): void {
    if (!this._lastRequest || this._isStreaming()) return;
    const { content, context } = this._lastRequest;
    // Remove the failed user message so it's not duplicated on retry.
    this._messages.update(msgs => {
      const idx = [...msgs].reverse().findIndex(m => m.role === 'user' && m.content === content);
      if (idx === -1) return msgs;
      const realIdx = msgs.length - 1 - idx;
      return msgs.filter((_, i) => i !== realIdx);
    });
    this.sendMessage(content, context);
  }

  resetSession(): void {
    this.streamSub?.unsubscribe();
    this._messages.set([]);
    this._sources.set([]);
    this._timeline.set([]);
    this._approval.set(undefined);
    this._error.set(undefined);
    this._isStreaming.set(false);
    this._sessionId.set(undefined);
    this._lastRequest = undefined;
    if (this.config?.defaultMode) {
      this._activeMode.set(this.config.defaultMode);
    }
  }

  setMode(mode: CopilotMode): void {
    this._activeMode.set(mode);
  }

  /**
   * Inject a system-level instruction that is prepended to every request.
   * The prompt is sent to the backend; it is never displayed in the chat UI.
   * Pass `undefined` to clear it.
   */
  setSystemPrompt(prompt: string | undefined): void {
    this._systemPrompt.set(prompt);
  }

  /**
   * Hydrate the conversation with a previously exported message list.
   * Use alongside `exportSession()` for persistence across page reloads.
   *
   * @example
   * ```ts
   * const saved = localStorage.getItem('copilot-session');
   * if (saved) copilot.loadSession(JSON.parse(saved));
   * ```
   */
  loadSession(messages: CopilotMessage[]): void {
    this.streamSub?.unsubscribe();
    this._messages.set([...messages]);
    this._sources.set([]);
    this._timeline.set([]);
    this._approval.set(undefined);
    this._error.set(undefined);
    this._isStreaming.set(false);
  }

  /**
   * Export the current message thread for persistence.
   *
   * @example
   * ```ts
   * localStorage.setItem('copilot-session', JSON.stringify(copilot.exportSession()));
   * ```
   */
  exportSession(): CopilotMessage[] {
    return [...this._messages()];
  }

  approve(requestId: string): void {
    this.resolveApproval(requestId, 'approved');
  }

  reject(requestId: string): void {
    this.resolveApproval(requestId, 'rejected');
  }

  /**
   * Execute a tool registered via `ToolRegistryService` locally in the browser.
   * Updates the tool timeline signal automatically.
   * For server-side tool execution, use the backend adapter's `executeTool()`.
   */
  async executeLocalTool(toolName: string, input?: unknown): Promise<void> {
    const tool = this.toolRegistry.get(toolName);
    if (!tool) {
      throw new Error(`Tool "${toolName}" is not registered. Call ToolRegistryService.register() first.`);
    }

    const id = `local-${toolName}-${Date.now()}`;
    const started: ToolTimelineItem = {
      id,
      toolName,
      status: 'running',
      summary: `Running ${toolName}…`,
      startedAt: new Date().toISOString(),
    };
    this._timeline.update(t => [...t, started]);

    try {
      const context = this.config ? { route: this.config.apiBaseUrl ? '/copilot' : '' } : { route: '' };
      await tool.execute(context, input);
      this._timeline.update(t =>
        t.map(item =>
          item.id === id
            ? { ...item, status: 'succeeded', summary: `${toolName} completed.`, finishedAt: new Date().toISOString() }
            : item,
        ),
      );
    } catch (err) {
      this._timeline.update(t =>
        t.map(item =>
          item.id === id
            ? { ...item, status: 'failed', summary: String(err instanceof Error ? err.message : err), finishedAt: new Date().toISOString() }
            : item,
        ),
      );
    }
  }

  private resolveApproval(requestId: string, decision: 'approved' | 'rejected'): void {
    const backend = this.resolveAdapter();
    if (!backend?.resolveApproval) {
      this._approval.update(current =>
        current?.id === requestId ? { ...current, decision } : current,
      );
      return;
    }

    backend.resolveApproval(requestId, decision).subscribe({
      next: event => this.handleEvent(event),
      error: err => this._error.set(this.normalizeError(err)),
    });
  }

  private handleEvent(
    event: CopilotEvent,
    stream?: {
      onChunk: (chunk: string) => void;
      getDraft: () => string;
      setAssistantId: (id: string) => void;
      getAssistantId: () => string;
    },
  ): void {
    switch (event.type) {
      case 'session-started':
        this._sessionId.set(event.sessionId);
        break;
      case 'message-start':
        stream?.setAssistantId(event.messageId);
        break;
      case 'message-chunk':
        stream?.onChunk(event.content);
        this.upsertStreamingAssistant(
          stream?.getAssistantId() ?? event.messageId,
          stream?.getDraft() ?? event.content,
        );
        break;
      case 'message-complete':
        this._messages.update(messages => {
          const withoutDraft = messages.filter(m => m.id !== event.message.id);
          return [...withoutDraft, event.message];
        });
        break;
      case 'sources':
        this._sources.set(event.sources);
        break;
      case 'tool-timeline':
        this._timeline.set(event.items);
        break;
      case 'approval-required':
        this._approval.set(event.request);
        break;
      case 'approval-resolved':
        this._approval.update(current =>
          current?.id === event.requestId ? { ...current, decision: event.decision } : current,
        );
        break;
      case 'done':
        this._isStreaming.set(false);
        break;
      case 'error':
        this._error.set(event.error);
        this._isStreaming.set(false);
        break;
      default:
        break;
    }
  }

  private upsertStreamingAssistant(id: string, content: string): void {
    const draft: CopilotMessage = {
      id,
      role: 'assistant',
      content,
      createdAt: new Date().toISOString(),
    };
    this._messages.update(messages => {
      const index = messages.findIndex(m => m.id === id);
      if (index === -1) return [...messages, draft];
      const next = [...messages];
      next[index] = draft;
      return next;
    });
  }

  private resolveAdapter(): CopilotBackendAdapter | null {
    if (this.adapter) return this.adapter;
    if (this.config) return this.fallbackAdapter;
    return null;
  }

  private normalizeError(err: unknown): CopilotAdapterError {
    if (err && typeof err === 'object' && 'code' in err && 'message' in err) {
      return err as CopilotAdapterError;
    }
    return {
      code: 'COPILOT_STREAM_FAILED',
      message: err instanceof Error ? err.message : String(err),
      recoverable: true,
    };
  }
}
