import { Component, ElementRef, ViewChild, input, signal } from '@angular/core';

/**
 * Themed code block with header label and copy button.
 *
 * Preferred — pass code as input string (copy works perfectly):
 *   <app-docs-code-block language="typescript" [code]="mySnippet" />
 *
 * Fallback — project content (copy reads rendered text):
 *   <app-docs-code-block language="bash">npm install ...</app-docs-code-block>
 *
 * The template renders BOTH {{ code() }} and <ng-content />.
 * When [code] is provided, ng-content is empty (nothing projected).
 * When only ng-content is used, code() is '' so nothing duplicates.
 */
@Component({
  selector: 'app-docs-code-block',
  standalone: true,
  template: `
    <div class="code-block-wrap">
      <div class="code-block-header">
        @if (language() || label()) {
          <span class="code-lang">{{ language() || label() }}</span>
        } @else {
          <span></span>
        }
        <button
          class="copy-btn"
          (click)="copy()"
          [class.copied]="copied()"
          [attr.aria-label]="copied() ? 'Copied!' : 'Copy code'">
          @if (copied()) {
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 8l4 4 8-8" stroke="#86efac" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Copied</span>
          } @else {
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="5.5" y="2" width="8" height="10" rx="1.25" stroke="currentColor" stroke-width="1.4"/>
              <rect x="2" y="4.5" width="8" height="10" rx="1.25" stroke="currentColor" stroke-width="1.4" fill="#0d1117"/>
            </svg>
            <span>Copy</span>
          }
        </button>
      </div>
      <!-- Single <pre> renders code() when provided, ng-content when not.
           Since callers provide one or the other (never both), output is always correct. -->
      <pre class="code-block-pre" #preEl><code>{{ code() }}<ng-content /></code></pre>
    </div>
  `,
  styles: [`
    .code-block-wrap {
      border-radius: var(--radius-md);
      overflow: hidden;
      margin: 1.25rem 0;
      border: 1px solid rgba(255,255,255,0.07);
    }

    .code-block-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--code-bg, #0d1117);
      filter: brightness(0.85);
      padding: 0.45rem 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.07);
      min-height: 36px;
    }

    .code-lang {
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: rgba(230,237,243,0.4);
      font-family: 'Fira Code', 'Cascadia Code', monospace;
    }

    .copy-btn {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.73rem;
      font-weight: 500;
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: var(--radius-xs);
      color: rgba(230,237,243,0.6);
      padding: 0.2rem 0.55rem;
      cursor: pointer;
      font-family: inherit;
      line-height: 1;
    }

    .copy-btn:hover {
      background: rgba(255,255,255,0.13);
      color: #e6edf3;
      border-color: rgba(255,255,255,0.18);
    }

    .copy-btn.copied {
      color: #86efac;
      border-color: rgba(134,239,172,0.25);
      background: rgba(134,239,172,0.08);
    }

    .code-block-pre {
      background: var(--code-bg);
      color: var(--code-text);
      margin: 0;
      padding: 1.1rem 1.25rem;
      overflow-x: auto;
      font-size: 0.84rem;
      line-height: 1.7;
      border-radius: 0;
      tab-size: 2;
      white-space: pre;
    }

    .code-block-pre code {
      background: none;
      color: inherit;
      padding: 0;
      border: none;
      font-size: inherit;
      border-radius: 0;
    }
  `],
})
export class DocsCodeBlockComponent {
  @ViewChild('preEl') preEl?: ElementRef<HTMLPreElement>;

  readonly language = input<string>('');
  readonly label = input<string>('');
  readonly code = input<string>('');

  copied = signal(false);

  copy(): void {
    // Prefer the [code] input; fall back to reading the rendered <pre> text
    const text = this.code().trim() || (this.preEl?.nativeElement?.textContent ?? '').trim();
    if (!text) return;
    navigator.clipboard?.writeText(text).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }
}
