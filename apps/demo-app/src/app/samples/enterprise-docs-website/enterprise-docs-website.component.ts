import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CopilotMessage,
  CopilotShellComponent,
  RagResult,
  ToolTimelineItem,
} from '@ankit-parekh-007/ngx-copilot-sdk';
import {
  DOCS_ARTICLES,
  DOCS_PROMPTS,
  type DocsArticle,
  type DocsPrompt,
} from './retailops-docs-demo.data';

function groupByCategory(articles: DocsArticle[]): Map<string, DocsArticle[]> {
  const map = new Map<string, DocsArticle[]>();
  for (const article of articles) {
    const list = map.get(article.category) ?? [];
    list.push(article);
    map.set(article.category, list);
  }
  return map;
}

@Component({
  selector: 'app-enterprise-docs-website',
  standalone: true,
  imports: [RouterLink, CopilotShellComponent],
  host: { class: 'docs-host' },
  template: `
    <div class="workspace-demo docs-demo">
      <section class="workspace-hero">
        <div>
          <nav class="workspace-crumb" aria-label="Breadcrumb">
            <a routerLink="/">Live demo</a>
            <span>/</span>
            <span>RetailOps PXM documentation copilot</span>
          </nav>
          <div class="workspace-badge-row">
            <span class="workspace-badge">Knowledge base sample</span>
            <span class="workspace-badge">Grounded URL citations</span>
            <span class="workspace-badge workspace-badge-warning">Operator-safe mock data</span>
          </div>
          <h1 class="workspace-title">Documentation answers that feel inspectable because the source material stays in view.</h1>
          <p class="workspace-description">
            This sample treats the documentation site as a <strong>knowledge workspace</strong>, not just a stack of
            articles. Product, QA, and support readers can browse the canon, ask practical process questions, and
            verify every answer against the cited article targets that shaped it.
          </p>
          <div class="workspace-actions">
            <a routerLink="/docs/rag-sources" class="workspace-action workspace-action-primary">Read citation model</a>
            <a routerLink="/docs/backend-contract" class="workspace-action workspace-action-secondary">Review event contract</a>
          </div>
        </div>

        <aside class="workspace-meta-stack">
          <div class="workspace-meta-card">
            <div class="workspace-meta-label">Host</div>
            <div class="workspace-meta-value">docs.retailops-pxm.example</div>
            <div class="workspace-meta-copy">Illustrative documentation host for PM, QA, and support readers.</div>
          </div>
          <div class="workspace-meta-card">
            <div class="workspace-meta-label">Answer behavior</div>
            <div class="workspace-meta-value">URL-grounded guidance</div>
            <div class="workspace-meta-copy">Answers point back to workflows, lifecycle guides, and permissions tables.</div>
          </div>
          <div class="workspace-meta-card workspace-meta-card-warning">
            <div class="workspace-meta-label">Safety</div>
            <div class="workspace-meta-value">Mock only</div>
            <div class="workspace-meta-copy">No live docs search, no real tenant content, and no external writes.</div>
          </div>
        </aside>
      </section>

      <section class="workspace-summary-grid">
        <div class="workspace-stat-card">
          <span class="workspace-subtle-label">Audience</span>
          <strong>PM, QA, and Support</strong>
          <span>Shared corpus, different workflows, one trust model.</span>
        </div>
        <div class="workspace-stat-card">
          <span class="workspace-subtle-label">Content shape</span>
          <strong>{{ docsArticles.length }} canonical articles</strong>
          <span>Lifecycle, onboarding, approvals, troubleshooting, and permissions.</span>
        </div>
        <div class="workspace-stat-card">
          <span class="workspace-subtle-label">AI UX</span>
          <strong>Prompt to citation to article</strong>
          <span>Answers stay reviewable instead of opaque.</span>
        </div>
      </section>

      <section class="workspace-main-grid docs-main-grid">
        <aside class="workspace-panel docs-nav-panel">
          <div class="workspace-section-head compact-head">
            <div>
              <div class="workspace-section-eyebrow">Knowledge map</div>
              <h2>Browse canonical articles</h2>
              <p>Category-first navigation keeps operators oriented before they ask the copilot.</p>
            </div>
          </div>

          <nav class="article-nav" aria-label="Documentation articles">
            @for (category of categoryKeys; track category) {
              <section class="nav-group">
                <div class="nav-group-title">{{ category }}</div>
                @for (article of groupedArticles.get(category) ?? []; track article.id) {
                  <button
                    type="button"
                    class="nav-item"
                    [class.active]="selectedArticle().id === article.id"
                    (click)="selectArticle(article)">
                    <span class="nav-item-title">{{ article.title }}</span>
                    <span class="nav-item-meta">{{ article.badge }}</span>
                  </button>
                }
              </section>
            }
          </nav>
        </aside>

        <article class="workspace-panel article-panel">
          <div class="workspace-section-head">
            <div>
              <div class="workspace-section-eyebrow">Reader view</div>
              <h2>{{ selectedArticle().title }}</h2>
              <p>{{ selectedArticle().intro }}</p>
            </div>
            <div class="article-meta-stack">
              <span class="workspace-pill">{{ selectedArticle().category }}</span>
              <span class="workspace-pill article-badge">{{ selectedArticle().badge }}</span>
            </div>
          </div>

          <div class="article-guidance">
            <div class="workspace-subtle-label">How to use this page</div>
            <div class="guidance-steps">
              <div class="guidance-step">Open the relevant workflow page first.</div>
              <div class="guidance-step">Use the assistant to summarize or locate the policy.</div>
              <div class="guidance-step">Verify the answer against the cited article URL.</div>
            </div>
          </div>

          <div class="article-reader">
            @for (section of selectedArticle().sections; track section.heading) {
              <section class="article-block">
                <h3>{{ section.heading }}</h3>
                <p>{{ section.body }}</p>
              </section>
            }

            @if (selectedArticle().table) {
              <section class="article-block article-table-block">
                @if (selectedArticle().table!.caption) {
                  <div class="workspace-inline-header">
                    <strong>{{ selectedArticle().table!.caption }}</strong>
                    <span>Reference matrix</span>
                  </div>
                }
                <div class="workspace-scroll">
                  <table class="workspace-table" aria-label="{{ selectedArticle().table!.caption }}">
                    <thead>
                      <tr>
                        @for (header of selectedArticle().table!.headers; track header) {
                          <th>{{ header }}</th>
                        }
                      </tr>
                    </thead>
                    <tbody>
                      @for (row of selectedArticle().table!.rows; track $index) {
                        <tr>
                          @for (cell of row; track $index) {
                            <td>{{ cell }}</td>
                          }
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </section>
            }
          </div>
        </article>
      </section>

      <section class="workspace-assistant-grid docs-assistant-grid">
        <article class="workspace-panel prompt-panel">
          <div class="workspace-section-head compact-head">
            <div>
              <div class="workspace-section-eyebrow">Suggested support prompts</div>
              <h2>Ask practical product and process questions</h2>
            </div>
          </div>

          <div class="workspace-chip-row prompt-row" aria-label="Suggested prompts">
            @for (prompt of docsPrompts; track prompt.text) {
              <button
                type="button"
                class="workspace-chip"
                [class.active]="selectedPrompt()?.text === prompt.text"
                (click)="selectPrompt(prompt)">
                {{ prompt.text }}
              </button>
            }
          </div>

          <div class="workspace-panel-muted prompt-insight" *ngIf="selectedPrompt() as prompt; else emptyPromptState">
            <div class="workspace-subtle-label">Cited article targets</div>
            <div class="insight-list">
              @for (articleId of prompt.sourceIds; track articleId) {
                <span class="insight-pill">{{ labelForSource(articleId) }}</span>
              }
            </div>
            <div class="insight-meta">{{ prompt.timeline.length }} retrieval steps shape the transcript on the right.</div>
          </div>
          <ng-template #emptyPromptState>
            <div class="workspace-panel-muted empty-state">
              Choose a prompt chip to see which documentation pages ground the answer and how the article reader updates alongside the copilot.
            </div>
          </ng-template>
        </article>

        <article class="workspace-panel copilot-panel">
          <div class="workspace-section-head compact-head">
            <div>
              <div class="workspace-section-eyebrow">Grounded documentation copilot</div>
              <h2>RetailOps PXM docs assistant</h2>
              <p>Mock retrieval over canonical documentation articles, lifecycle guides, and permission matrices.</p>
            </div>
          </div>
          <ngx-copilot-shell
            title="RetailOps PXM docs"
            subtitle="Mock retrieval over docs.retailops-pxm.example"
            [messages]="messages()"
            [sources]="sources()"
            [timeline]="timeline()"
            [useService]="false"
            [approval]="undefined"
            (messageSent)="onSend($event)"
            (sessionReset)="resetSession()" />
        </article>
      </section>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      padding: 1.8rem 1.25rem 3rem;
    }

    .docs-main-grid {
      grid-template-columns: minmax(260px, 0.72fr) minmax(0, 1.28fr);
    }

    .docs-nav-panel {
      position: sticky;
      top: calc(var(--topnav-height) + 1.2rem);
      max-height: calc(100vh - var(--topnav-height) - 2.4rem);
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      overflow: hidden;
    }

    .article-nav {
      display: grid;
      align-content: start;
      gap: 0.85rem;
      min-height: 0;
      overflow: auto;
      padding-right: 0.1rem;
    }

    .nav-group {
      display: grid;
      gap: 0.45rem;
    }

    .nav-group-title {
      font-size: 0.76rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-subtle);
    }

    .nav-item {
      display: grid;
      gap: 0.22rem;
      width: 100%;
      padding: 0.82rem 0.9rem;
      border-radius: 1rem;
      border: 1px solid var(--border);
      background: var(--bg-muted);
      color: var(--text);
      cursor: pointer;
      text-align: left;
      font-family: inherit;
      transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
    }

    .nav-item:hover,
    .nav-item.active {
      border-color: var(--border-strong);
      background: color-mix(in srgb, var(--accent-light) 45%, transparent 55%);
      box-shadow: 0 10px 24px rgba(99, 102, 241, 0.12);
    }

    .nav-item.active .nav-item-title {
      color: var(--accent);
    }

    .nav-item-title {
      font-size: 0.92rem;
      font-weight: 700;
      line-height: 1.4;
    }

    .nav-item-meta {
      font-size: 0.8rem;
      color: var(--text-subtle);
    }

    .article-panel {
      align-content: start;
    }

    .article-meta-stack {
      display: flex;
      gap: 0.45rem;
      flex-wrap: wrap;
      justify-content: end;
    }

    .article-badge {
      color: var(--accent);
      border-color: var(--border-strong);
    }

    .article-guidance {
      padding: 1rem;
      border-radius: 1.1rem;
      border: 1px solid var(--border);
      background: var(--bg-muted);
      display: grid;
      gap: 0.85rem;
    }

    .guidance-steps {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.75rem;
    }

    .guidance-step {
      padding: 0.9rem;
      border-radius: 1rem;
      border: 1px solid var(--border);
      background: var(--bg-card-solid);
      color: var(--text-muted);
      line-height: 1.65;
      font-size: 0.9rem;
    }

    .article-reader {
      padding: 0.15rem 0.15rem 0;
    }

    .article-block {
      padding: 0.1rem 0 1.35rem;
      border-bottom: 1px solid color-mix(in srgb, var(--border) 72%, transparent 28%);
      margin-bottom: 1.15rem;
    }

    .article-block:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }

    .article-block h3 {
      margin: 0 0 0.6rem;
      font-size: 1.04rem;
      color: var(--text);
    }

    .article-block p {
      margin: 0;
      color: var(--text-muted);
      line-height: 1.8;
      font-size: 0.96rem;
    }

    .article-table-block {
      display: grid;
      gap: 0.9rem;
    }

    .workspace-inline-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .workspace-inline-header strong {
      color: var(--text);
      font-size: 1rem;
    }

    .workspace-inline-header span {
      color: var(--text-subtle);
      font-size: 0.82rem;
    }

    .docs-assistant-grid {
      align-items: stretch;
    }

    .prompt-panel,
    .copilot-panel {
      height: 100%;
      align-content: start;
    }

    .compact-head {
      margin-bottom: -0.1rem;
    }

    .prompt-row {
      overflow-x: auto;
      padding-bottom: 0.2rem;
      scrollbar-width: thin;
    }

    .prompt-insight {
      padding: 1rem;
      display: grid;
      gap: 0.8rem;
    }

    .insight-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem;
    }

    .insight-pill,
    .insight-meta {
      display: inline-flex;
      align-items: center;
      padding: 0.28rem 0.55rem;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: var(--bg-card-solid);
      color: var(--text-muted);
      font-size: 0.82rem;
    }

    .empty-state {
      padding: 1rem;
      border-style: dashed;
      color: var(--text-muted);
      line-height: 1.7;
    }

    @media (max-width: 1199px) {
      .docs-main-grid {
        grid-template-columns: 1fr;
      }

      .guidance-steps {
        grid-template-columns: 1fr;
      }

      .docs-nav-panel {
        position: static;
        max-height: none;
      }
    }

    @media (max-width: 899px) {
      :host {
        padding: 1.1rem 0.8rem 2rem;
      }

      .workspace-inline-header {
        display: grid;
        grid-template-columns: 1fr;
      }

      .article-meta-stack {
        justify-content: start;
      }
    }

    @media (max-width: 639px) {
      .article-guidance,
      .prompt-insight,
      .empty-state {
        padding: 0.9rem;
      }
    }
  `],
})
export class EnterpriseDocsWebsiteComponent {
  readonly docsArticles = DOCS_ARTICLES;
  readonly docsPrompts = DOCS_PROMPTS;
  readonly groupedArticles = groupByCategory(DOCS_ARTICLES);
  readonly categoryKeys = [...this.groupedArticles.keys()];

  selectedArticle = signal<DocsArticle>(DOCS_ARTICLES[0]);
  selectedPrompt = signal<DocsPrompt | null>(null);

  messages = computed<CopilotMessage[]>(() => {
    const prompt = this.selectedPrompt();
    if (!prompt) {
      return [{
        id: 'seed-welcome',
        role: 'assistant',
        content: 'Select a prompt chip to see how the documentation copilot cites canonical articles. Click any article in the knowledge map to inspect the source material directly.',
        createdAt: new Date().toISOString(),
      }];
    }
    const stamp = new Date().toISOString();
    const sourcedArticles = DOCS_ARTICLES.filter((a) => prompt.sourceIds.includes(a.id));
    return [
      { id: `u-${stamp}`, role: 'user', content: prompt.text, createdAt: stamp },
      {
        id: `a-${stamp}`,
        role: 'assistant',
        content: prompt.answer,
        createdAt: stamp,
        sources: sourcedArticles.map((a, i) => ({
          id: `src-${i}`,
          title: a.title,
          snippet: a.intro,
          score: 0.95 - i * 0.03,
          sourceType: 'documentation',
          sourceUrl: `https://docs.retailops-pxm.example/${a.id}`,
          tags: [a.category.toLowerCase()],
        } as RagResult)),
      },
    ];
  });

  sources = computed<RagResult[]>(() => {
    const prompt = this.selectedPrompt();
    if (!prompt) return [];
    const sourcedArticles = DOCS_ARTICLES.filter((a) => prompt.sourceIds.includes(a.id));
    return sourcedArticles.map((a, i) => ({
      id: `src-${i}`,
      title: a.title,
      snippet: a.intro,
      score: 0.95 - i * 0.03,
      sourceType: 'documentation',
      sourceUrl: `https://docs.retailops-pxm.example/${a.id}`,
      tags: [a.category.toLowerCase()],
    } as RagResult));
  });

  timeline = computed<ToolTimelineItem[]>(() => {
    const prompt = this.selectedPrompt();
    if (!prompt) return [];
    const stamp = new Date().toISOString();
    return prompt.timeline.map((t, i) => ({
      id: `tl-${i}`,
      toolName: t.toolName,
      summary: t.summary,
      status: t.status,
      startedAt: stamp,
      finishedAt: stamp,
    }));
  });

  selectArticle(article: DocsArticle): void {
    this.selectedArticle.set(article);
  }

  selectPrompt(prompt: DocsPrompt): void {
    this.selectedPrompt.set(prompt);
    if (prompt.sourceIds.length > 0) {
      const article = DOCS_ARTICLES.find((a) => a.id === prompt.sourceIds[0]);
      if (article) this.selectedArticle.set(article);
    }
  }

  resetSession(): void {
    this.selectedPrompt.set(null);
    this.selectedArticle.set(DOCS_ARTICLES[0]);
  }

  onSend(content: string): void {
    const trimmed = content.trim();
    if (!trimmed) return;
    const match = this.docsPrompts.find((p) => p.text.toLowerCase() === trimmed.toLowerCase());
    if (match) this.selectPrompt(match);
  }

  labelForSource(articleId: string): string {
    return DOCS_ARTICLES.find((article) => article.id === articleId)?.title ?? articleId;
  }
}
