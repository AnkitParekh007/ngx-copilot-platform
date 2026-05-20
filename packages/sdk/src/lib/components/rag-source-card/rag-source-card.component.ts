import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RagResult } from '../../models/rag-result.model';

@Component({
  selector: 'ngx-rag-source-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="source-card">
      <div class="source-meta">
        <span class="source-type">{{ source.sourceType ?? 'knowledge-base' }}</span>
        <span class="source-score">{{ source.score | number: '1.0-2' }}</span>
      </div>
      <h4>{{ source.title }}</h4>
      <p *ngIf="source.repo || source.branch || source.filePath" class="path-line">
        <ng-container *ngIf="source.repo">{{ source.repo }}</ng-container
        ><ng-container *ngIf="source.branch"> · {{ source.branch }}</ng-container
        ><ng-container *ngIf="source.filePath"> — {{ source.filePath }}</ng-container>
      </p>
      <p class="snippet">{{ source.snippet }}</p>
      <p *ngIf="source.tags?.length" class="tags">
        <span *ngFor="let tag of source.tags" class="tag">{{ tag }}</span>
      </p>
      <a *ngIf="source.sourceUrl" [href]="source.sourceUrl" target="_blank" rel="noreferrer">Open source</a>
    </article>
  `,
  styles: [`
    .source-card {
      border: 1px solid #dbe4f0;
      border-radius: 1rem;
      padding: 1rem;
      background: #fff;
      display: grid;
      gap: 0.5rem;
    }
    .source-meta {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      color: #475569;
      font-size: 0.85rem;
    }
    h4 { margin: 0; font-size: 1rem; }
    .path-line {
      margin: 0;
      font-size: 0.8rem;
      color: #64748b;
      font-family: ui-monospace, monospace;
      word-break: break-all;
    }
    .snippet { margin: 0; color: #334155; }
    .tags { margin: 0; display: flex; flex-wrap: wrap; gap: 0.35rem; }
    .tag {
      font-size: 0.72rem;
      padding: 0.15rem 0.45rem;
      border-radius: 999px;
      background: #f1f5f9;
      color: #475569;
    }
    a { color: #1d4ed8; text-decoration: none; }
  `],
})
export class RagSourceCardComponent {
  @Input({ required: true }) source!: RagResult;
}
