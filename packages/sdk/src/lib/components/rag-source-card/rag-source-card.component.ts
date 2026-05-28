import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RagResult } from '../../models/rag-result.model';

/**
 * Renders a single RAG citation card showing title, confidence score, code path info, snippet, and tags.
 *
 * **CSS custom properties (theme via host or global stylesheet):**
 * - `--border` — card border color
 * - `--bg-card-solid` — card background
 * - `--text` — primary text
 * - `--text-subtle` — metadata text
 * - `--text-muted` — snippet text
 * - `--bg-muted` — tag background
 * - `--accent` — link and score highlight color
 */
@Component({
  selector: 'ngx-rag-source-card',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <article class="source-card">
      <div class="source-meta">
        <span class="source-type">{{ source.sourceType ?? 'knowledge-base' }}</span>
        <span class="source-score" aria-label="Relevance score {{ source.score | number:'1.0-2' }}">
          {{ source.score | number:'1.0-2' }}
        </span>
      </div>
      <h4>{{ source.title }}</h4>
      @if (source.repo || source.branch || source.filePath) {
        <p class="path-line">
          @if (source.repo) { {{ source.repo }} }
          @if (source.branch) { &nbsp;·&nbsp;{{ source.branch }} }
          @if (source.filePath) { &nbsp;—&nbsp;{{ source.filePath }} }
        </p>
      }
      <p class="snippet">{{ source.snippet }}</p>
      @if (source.tags?.length) {
        <p class="tags">
          @for (tag of source.tags!; track tag) {
            <span class="tag">{{ tag }}</span>
          }
        </p>
      }
      @if (source.sourceUrl) {
        <a [href]="source.sourceUrl" target="_blank" rel="noreferrer">Open source ↗</a>
      }
    </article>
  `,
  styles: [`
    .source-card {
      border: 1px solid var(--border, #dbe4f0);
      border-radius: 1rem;
      padding: 1rem;
      background: var(--bg-card-solid, #fff);
      color: var(--text, #0f172a);
      display: grid;
      gap: 0.5rem;
    }
    .source-meta {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      color: var(--text-subtle, #475569);
      font-size: 0.85rem;
    }
    .source-score { font-variant-numeric: tabular-nums; }
    h4 { margin: 0; font-size: 1rem; }
    .path-line {
      margin: 0;
      font-size: 0.8rem;
      color: var(--text-muted, #64748b);
      font-family: ui-monospace, monospace;
      word-break: break-all;
    }
    .snippet { margin: 0; color: var(--text-muted, #334155); }
    .tags { margin: 0; display: flex; flex-wrap: wrap; gap: 0.35rem; }
    .tag {
      font-size: 0.72rem;
      padding: 0.15rem 0.45rem;
      border-radius: 999px;
      background: var(--bg-muted, #f1f5f9);
      color: var(--text-subtle, #475569);
    }
    a { color: var(--accent, #1d4ed8); text-decoration: none; font-size: 0.88rem; }
    a:hover { text-decoration: underline; }
  `],
})
export class RagSourceCardComponent {
  @Input({ required: true }) source!: RagResult;
}
