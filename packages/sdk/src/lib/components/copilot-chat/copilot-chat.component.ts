import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  AfterViewChecked,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CopilotMessage } from '../../models/copilot-message.model';
import { CopilotService } from '../../services/copilot.service';
import { StreamingMessageComponent } from '../streaming-message/streaming-message.component';

@Component({
  selector: 'ngx-copilot-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, StreamingMessageComponent],
  template: `
    <section class="chat" aria-label="Copilot conversation">
      <div class="chat-thread" #thread>
        <p *ngIf="!messages.length && !isStreaming && !errorMessage" class="empty">
          {{ emptyLabel }}
        </p>

        <article
          *ngFor="let message of messages"
          class="message"
          [attr.data-role]="message.role"
          [attr.aria-label]="message.role + ' message'">
          <p class="message-role">{{ message.role }}</p>
          <p>{{ message.content }}</p>
        </article>

        <ngx-streaming-message
          *ngIf="isStreaming && streamingContent"
          [content]="streamingContent"
          [done]="false"
          [loading]="true" />
      </div>

      <p *ngIf="errorMessage" class="error" role="alert">{{ errorMessage }}</p>

      <form class="composer" (ngSubmit)="submit()" *ngIf="showComposer">
        <label class="sr-only" for="copilot-input">Message</label>
        <textarea
          id="copilot-input"
          name="draft"
          rows="2"
          [(ngModel)]="draft"
          [placeholder]="placeholder"
          [disabled]="disabled || isStreaming"
          (keydown.enter)="onEnter($event)"
          aria-label="Copilot message input"></textarea>
        <button type="submit" [disabled]="disabled || isStreaming || !draft.trim()">
          {{ isStreaming ? 'Sending...' : submitLabel }}
        </button>
      </form>
    </section>
  `,
  styles: [`
    .chat { display: grid; gap: 0.85rem; }
    .chat-thread {
      display: grid;
      gap: 0.85rem;
      max-height: 22rem;
      overflow-y: auto;
    }
    .message {
      border-radius: 1rem;
      padding: 0.9rem 1rem;
      background: var(--bg-card-solid, #fff);
      border: 1px solid var(--border, #dbe4f0);
      color: var(--text, #0f172a);
    }
    .message[data-role='assistant'] {
      background: var(--accent-light, #eff6ff);
      border-color: var(--border-strong, #bfdbfe);
    }
    .message-role {
      margin: 0 0 0.35rem;
      text-transform: capitalize;
      font-size: 0.82rem;
      color: var(--text-subtle, #475569);
    }
    p { margin: 0; }
    .empty { color: var(--text-muted, #64748b); font-size: 0.95rem; }
    .error {
      margin: 0;
      padding: 0.65rem 0.85rem;
      border-radius: 0.75rem;
      background: var(--callout-danger-bg, #fef2f2);
      color: var(--callout-danger-text, #b91c1c);
      border: 1px solid var(--callout-danger-border, #fecaca);
    }
    .composer {
      display: grid;
      gap: 0.5rem;
    }
    textarea {
      resize: vertical;
      min-height: 3rem;
      border-radius: 0.85rem;
      border: 1px solid var(--border, #cbd5e1);
      padding: 0.65rem 0.8rem;
      font: inherit;
      color: var(--text, #0f172a);
      background: var(--bg-card-solid, #ffffff);
    }
    textarea::placeholder { color: var(--text-subtle, #64748b); }
    textarea:disabled { opacity: 0.65; cursor: not-allowed; }
    button {
      justify-self: start;
      border: none;
      border-radius: 999px;
      background: var(--text, #0f172a);
      color: var(--bg-card-solid, #fff);
      padding: 0.55rem 1rem;
      cursor: pointer;
    }
    button:disabled { opacity: 0.55; cursor: not-allowed; }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      border: 0;
    }
  `],
})
export class CopilotChatComponent implements AfterViewChecked {
  @Input() messages: CopilotMessage[] = [];
  @Input() isStreaming = false;
  @Input() streamingContent = '';
  @Input() errorMessage?: string;
  @Input() emptyLabel = 'Ask a question to start the copilot.';
  @Input() placeholder = 'Ask the copilot...';
  @Input() submitLabel = 'Send';
  @Input() showComposer = true;
  @Input() disabled = false;
  @Input() autoScroll = true;
  @Input() useService = false;
  @Input() context?: import('../../models/copilot-context.model').CopilotContext;

  @Output() readonly send = new EventEmitter<string>();

  @ViewChild('thread') private threadRef?: ElementRef<HTMLElement>;

  draft = '';
  private shouldScroll = false;

  private readonly copilot = inject(CopilotService, { optional: true });

  ngAfterViewChecked(): void {
    if (this.autoScroll && this.shouldScroll && this.threadRef) {
      const el = this.threadRef.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.shouldScroll = false;
    }
  }

  onEnter(event: Event): void {
    const keyboard = event as KeyboardEvent;
    if (!keyboard.shiftKey) {
      keyboard.preventDefault();
      this.submit();
    }
  }

  submit(): void {
    const content = this.draft.trim();
    if (!content || this.disabled || this.isStreaming) {
      return;
    }

    if (this.useService && this.copilot) {
      this.copilot.sendMessage(content, this.context);
    } else {
      this.send.emit(content);
    }

    this.draft = '';
    this.shouldScroll = true;
  }
}
