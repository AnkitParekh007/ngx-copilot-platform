import { inject, Injectable, Signal, computed, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { COPILOT_BACKEND_ADAPTER } from '../tokens/copilot-backend-adapter.token';
import { COPILOT_CONFIG } from '../tokens/copilot-config.token';
import { CopilotBackendAdapter } from '../adapters/copilot-backend.adapter';
import { CopilotAdapterError } from '../adapters/copilot-adapter-error.model';
import { CopilotEvent } from '../adapters/copilot-event.model';
import { CopilotMode } from '../models/copilot-config.model';
import { CopilotContext } from '../models/copilot-context.model';
import { CopilotMessage } from '../models/copilot-message.model';
import { RagResult } from '../models/rag-result.model';
import { ApprovalRequest } from '../models/approval-request.model';
import { ToolTimelineItem } from '../models/tool-timeline-item.model';
import { MockCopilotBackendAdapter } from '../adapters/mock-copilot-backend.adapter';

@Injectable({ providedIn: 'root' })
export class CopilotService {
  private readonly config = inject(COPILOT_CONFIG, { optional: true });
  private readonly adapter = inject(COPILOT_BACKEND_ADAPTER, { optional: true });

  private readonly _messages = signal<CopilotMessage[]>([]);
  private readonly _sources = signal<RagResult[]>([]);
  private readonly _timeline = signal<ToolTimelineItem[]>([]);
  private readonly _approval = signal<ApprovalRequest | undefined>(undefined);
  private readonly _isStreaming = signal(false);
  private readonly _error = signal<CopilotAdapterError | undefined>(undefined);
  private readonly _activeMode = signal<CopilotMode>('ask');
  private streamSub?: Subscription;

  readonly messages: Signal<CopilotMessage[]> = this._messages.asReadonly();
  readonly sources: Signal<RagResult[]> = this._sources.asReadonly();
  readonly timeline: Signal<ToolTimelineItem[]> = this._timeline.asReadonly();
  readonly approval: Signal<ApprovalRequest | undefined> = this._approval.asReadonly();
  readonly isStreaming: Signal<boolean> = this._isStreaming.asReadonly();
  readonly error: Signal<CopilotAdapterError | undefined> = this._error.asReadonly();
  readonly activeMode: Signal<CopilotMode> = this._activeMode.asReadonly();

  readonly hasConfig = computed(() => !!this.config);
  readonly statusLabel = computed(() => this.config?.statusLabel ?? 'Preview SDK');

  private readonly fallbackAdapter = new MockCopilotBackendAdapter();

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
    if (!trimmed || this._isStreaming()) {
      return;
    }

    const backend = this.resolveAdapter();
    if (!backend) {
      this._error.set({
        code: 'COPILOT_NOT_CONFIGURED',
        message: 'Copilot is not configured. Call provideCopilot() in your app config.',
        recoverable: true,
      });
      return;
    }

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

    this.streamSub?.unsubscribe();
    this.streamSub = backend
      .send({
        message: trimmed,
        mode: this._activeMode(),
        context,
      })
      .subscribe({
        next: event =>
          this.handleEvent(event, {
            onChunk: chunk => {
              assistantDraft += chunk;
            },
            getDraft: () => assistantDraft,
            setAssistantId: id => {
              assistantId = id;
            },
            getAssistantId: () => assistantId,
          }),
        error: err => {
          this._isStreaming.set(false);
          this._error.set(this.normalizeError(err));
        },
        complete: () => this._isStreaming.set(false),
      });
  }

  resetSession(): void {
    this.streamSub?.unsubscribe();
    this._messages.set([]);
    this._sources.set([]);
    this._timeline.set([]);
    this._approval.set(undefined);
    this._error.set(undefined);
    this._isStreaming.set(false);
    if (this.config?.defaultMode) {
      this._activeMode.set(this.config.defaultMode);
    }
  }

  setMode(mode: CopilotMode): void {
    this._activeMode.set(mode);
  }

  approve(requestId: string): void {
    this.resolveApproval(requestId, 'approved');
  }

  reject(requestId: string): void {
    this.resolveApproval(requestId, 'rejected');
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
      if (index === -1) {
        return [...messages, draft];
      }
      const next = [...messages];
      next[index] = draft;
      return next;
    });
  }

  private resolveAdapter(): CopilotBackendAdapter | null {
    if (this.adapter) {
      return this.adapter;
    }
    if (this.config) {
      return this.fallbackAdapter;
    }
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
