import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CopilotMessage,
  CopilotShellComponent,
  RagResult,
  ToolTimelineItem,
} from '@ankitparekh007/ngx-copilot-sdk';
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
    <div class="docs-page">
      <section class="hero-card">
        <div class="hero-copy">
          <nav class="crumb" aria-label="Breadcrumb">
            <a routerLink="/">Live demo</a>
            <span>/</span>
            <span>RetailOps PXM documentation copilot</span>
          </nav>
          <div class="hero-eyebrow">
            <span class="eyebrow-badge">Documentation knowledge base</span>
            <span class="eyebrow-badge">Grounded URL citations</span>
            <span class="eyebrow-badge accent">Operator-safe mock data</span>
          </div>
          <h1>Design a docs experience where AI answers feel reviewable, not guessed.</h1>
          <p class="hero-desc">
            This sample treats the documentation site as a <strong>knowledge surface</strong>, not just a stack
            of markdown pages. Product, QA, and support users can navigate articles directly, ask operational
            questions, and verify every answer against canonical documentation URLs.
          </p>
          <div class="hero-actions">
            <a routerLink="/docs/rag-sources" class="hero-btn hero-btn-primary">Read citation model</a>
            <a routerLink="/docs/backend-contract" class="hero-btn hero-btn-secondary">Event stream contract</a>
          </div>
        </div>

        <aside class="hero-meta">
          <div class="meta-card">
            <div class="meta-label">Host</div>
            <div class="meta-value">docs.retailops-pxm.example</div>
            <div class="meta-sub">Illustrative documentation host for PM, QA, and support readers</div>
          </div>
          <div class="meta-card">
            <div class="meta-label">Answer behavior</div>
            <div class="meta-value">URL-grounded guidance</div>
            <div class="meta-sub">Every answer maps back to articles, workflow docs, or permission tables</div>
          </div>
          <div class="meta-card meta-card-warning">
            <div class="meta-label">Safety</div>
            <div class="meta-value">Mock only</div>
            <div class="meta-sub">No live docs search, no real tenant content, no external API writes</div>
          </div>
        </aside>
      </section>

      <section class="summary-strip">
        <div class="summary-card">
          <span class="summary-label">Audience</span>
          <strong>PM · QA · Support</strong>
          <span>Same corpus, different questions, shared trust model.</span>
        </div>
        <div class="summary-card">
          <span class="summary-label">Content shape</span>
          <strong>{{ docsArticles.length }} canonical articles</strong>
          <span>Lifecycle, onboarding, approvals, troubleshooting, and permissions.</span>
        </div>
        <div class="summary-card">
          <span class="summary-label">AI UX</span>
          <strong>Prompt → citation → article</strong>
          <span>Answers are navigable instead of opaque.</span>
        </div>
      </section>

      <section class="workspace-grid">
        <aside class="surface-card nav-card">
          <div class="section-head compact">
            <div>
              <div class="section-eyebrow">Knowledge map</div>
              <h2>Browse canonical articles</h2>
              <p>Category-driven information architecture keeps operators oriented before they ask the copilot.</p>
            </div>
          </div>

          <nav class="article-nav" aria-label="Documentation articles">
            @for (category of categoryKeys; track category) {
              <section class="nav-section">
                <div class="nav-section-title">{{ category }}</div>
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

        <article class="surface-card article-card">
          <div class="section-head">
            <div>
              <div class="section-eyebrow">Reader view</div>
              <h2>{{ selectedArticle().title }}</h2>
              <p>{{ selectedArticle().intro }}</p>
            </div>
            <div class="article-meta-stack">
              <span class="article-category">{{ selectedArticle().category }}</span>
              <span class="article-badge">{{ selectedArticle().badge }}</span>
            </div>
          </div>

          <div class="article-layout">
            <div class="article-flow-card">
              <div class="flow-stat">
                <span class="flow-label">Why this page exists</span>
                <strong>Operator trust through inspectable docs</strong>
              </div>
              <div class="flow-steps">
                <div class="flow-step">Find the relevant workflow page</div>
                <div class="flow-step">Ask the copilot for task-specific guidance</div>
                <div class="flow-step">Verify answer against cited article URLs</div>
              </div>
            </div>

            <div class="article-sections">
              @for (section of selectedArticle().sections; track section.heading) {
                <section class="article-section">
                  <h3>{{ section.heading }}</h3>
                  <p>{{ section.body }}</p>
                </section>
              }

              @if (selectedArticle().table) {
                <section class="article-section article-table-panel">
                  @if (selectedArticle().table!.caption) {
                    <div class="table-panel-head">
                      <strong>{{ selectedArticle().table!.caption }}</strong>
                      <span>Reference matrix</span>
                    </div>
                  }
                  <div class="table-scroll">
                    <table class="article-table" aria-label="{{ selectedArticle().table!.caption }}">
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
          </div>
        </article>
      </section>

      <section class="copilot-grid">
        <article class="surface-card prompt-panel">
          <div class="section-head compact">
            <div>
              <div class="section-eyebrow">Suggested support prompts</div>
              <h2>Ask practical product and process questions</h2>
            </div>
          </div>

          <div class="prompt-chips" aria-label="Suggested prompts">
            @for (prompt of docsPrompts; track prompt.text) {
              <button
                type="button"
                class="prompt-chip"
                [class.active]="selectedPrompt()?.text === prompt.text"
                (click)="selectPrompt(prompt)">
                {{ prompt.text }}
              </button>
            }
          </div>

          <div class="prompt-insight" *ngIf="selectedPrompt() as prompt; else emptyPromptState">
            <div class="insight-label">Cited article targets</div>
            <div class="insight-list">
              @for (articleId of prompt.sourceIds; track articleId) {
                <span class="insight-pill">{{ labelForSource(articleId) }}</span>
              }
            </div>
            <div class="insight-meta">{{ prompt.timeline.length }} retrieval steps power the transcript on the right.</div>
          </div>
          <ng-template #emptyPromptState>
            <div class="empty-insight">
              Choose a prompt chip to see which documentation pages ground the answer and how the article view updates alongside the copilot.
            </div>
          </ng-template>
        </article>

        <article class="surface-card copilot-panel">
          <div class="section-head compact">
            <div>
              <div class="section-eyebrow">Grounded documentation copilot</div>
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
      padding: 2rem 1.25rem 3rem;
    }

    .docs-page {
      width: min(1380px, 100%);
      margin: 0 auto;
      display: grid;
      gap: 1.5rem;
    }

    .hero-card,
    .surface-card {
      border: 1px solid var(--border);
      background: var(--bg-card);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      box-shadow: var(--shadow-md);
    }

    .hero-card {
      display: grid;
      grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.85fr);
      gap: 1.25rem;
      padding: 1.5rem;
      border-radius: 1.75rem;
      background:
        radial-gradient(circle at top right, rgba(167, 139, 250, 0.18), transparent 34%),
        radial-gradient(circle at bottom left, rgba(56, 189, 248, 0.12), transparent 28%),
        var(--bg-card);
    }

    .crumb {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      margin-bottom: 0.9rem;
      font-size: 0.92rem;
      color: var(--text-muted);
    }

    .crumb a {
      color: var(--accent);
      text-decoration: none;
    }

    .hero-eyebrow {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem;
      margin-bottom: 0.85rem;
    }

    .eyebrow-badge {
      padding: 0.25rem 0.65rem;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: var(--bg-muted);
      color: var(--text-subtle);
      font-size: 0.76rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .eyebrow-badge.accent {
      background: var(--callout-warning-bg);
      border-color: var(--callout-warning-border);
      color: var(--callout-warning-text);
    }

    h1 {
      margin: 0;
      font-size: clamp(2rem, 4vw, 3rem);
      line-height: 1.06;
      letter-spacing: -0.035em;
      color: var(--text);
    }

    .hero-desc {
      margin: 1rem 0 0;
      max-width: 760px;
      font-size: 1rem;
      line-height: 1.8;
      color: var(--text-muted);
    }

    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.7rem;
      margin-top: 1.35rem;
    }

    .hero-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 42px;
      padding: 0.7rem 1rem;
      border-radius: 999px;
      border: 1px solid var(--border);
      text-decoration: none;
      font-weight: 700;
    }

    .hero-btn-primary {
      background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
      color: white;
      border-color: transparent;
    }

    .hero-btn-secondary {
      background: var(--bg-muted);
      color: var(--text);
    }

    .hero-meta {
      display: grid;
      gap: 0.85rem;
      align-content: start;
    }

    .meta-card {
      padding: 1rem 1.05rem;
      border-radius: 1.15rem;
      border: 1px solid var(--border);
      background: color-mix(in srgb, var(--bg-card-solid) 82%, transparent 18%);
    }

    .meta-card-warning {
      border-color: var(--callout-warning-border);
      background: var(--callout-warning-bg);
    }

    .meta-label {
      font-size: 0.74rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-subtle);
      margin-bottom: 0.35rem;
    }

    .meta-value {
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--text);
      margin-bottom: 0.25rem;
    }

    .meta-sub {
      font-size: 0.9rem;
      line-height: 1.6;
      color: var(--text-muted);
    }

    .summary-strip {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.85rem;
    }

    .summary-card {
      padding: 1rem 1.05rem;
      border-radius: 1.2rem;
      border: 1px solid var(--border);
      background: var(--bg-card);
      box-shadow: var(--shadow-sm);
      display: grid;
      gap: 0.25rem;
    }

    .summary-label {
      font-size: 0.74rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-subtle);
    }

    .summary-card strong {
      font-size: 1.05rem;
      color: var(--text);
    }

    .summary-card span:last-child {
      color: var(--text-muted);
      line-height: 1.6;
      font-size: 0.92rem;
    }

    .workspace-grid {
      display: grid;
      grid-template-columns: minmax(260px, 0.72fr) minmax(0, 1.28fr);
      gap: 1.25rem;
      align-items: start;
    }

    .copilot-grid {
      display: grid;
      grid-template-columns: minmax(320px, 0.9fr) minmax(0, 1.1fr);
      gap: 1.25rem;
      align-items: start;
    }

    .surface-card {
      border-radius: 1.5rem;
      padding: 1.25rem;
      display: grid;
      gap: 1rem;
    }

    .section-head {
      display: flex;
      align-items: start;
      justify-content: space-between;
      gap: 1rem;
    }

    .section-head.compact {
      margin-bottom: -0.2rem;
    }

    .section-eyebrow {
      margin-bottom: 0.35rem;
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--accent);
    }

    .section-head h2 {
      margin: 0;
      font-size: 1.35rem;
      line-height: 1.2;
      letter-spacing: -0.02em;
      color: var(--text);
    }

    .section-head p {
      margin: 0.45rem 0 0;
      color: var(--text-muted);
      line-height: 1.7;
      font-size: 0.95rem;
    }

    .nav-card {
      position: sticky;
      top: calc(var(--topnav-height) + 1.2rem);
      max-height: calc(100vh - var(--topnav-height) - 2.4rem);
      overflow: hidden;
      align-content: start;
    }

    .article-nav {
      overflow: auto;
      display: grid;
      gap: 0.8rem;
      padding-right: 0.1rem;
    }

    .nav-section {
      display: grid;
      gap: 0.45rem;
    }

    .nav-section-title {
      font-size: 0.76rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-subtle);
    }

    .nav-item {
      display: grid;
      gap: 0.25rem;
      width: 100%;
      padding: 0.8rem 0.9rem;
      border-radius: 1rem;
      border: 1px solid var(--border);
      background: var(--bg-muted);
      color: var(--text);
      cursor: pointer;
      text-align: left;
      font-family: inherit;
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

    .article-meta-stack {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem;
      justify-content: end;
    }

    .article-category,
    .article-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.4rem 0.75rem;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: var(--bg-muted);
      font-size: 0.84rem;
      font-weight: 700;
      white-space: nowrap;
    }

    .article-category {
      color: var(--text);
    }

    .article-badge {
      color: var(--accent);
      border-color: var(--border-strong);
    }

    .article-layout {
      display: grid;
      gap: 1rem;
    }

    .article-flow-card,
    .article-section,
    .article-table-panel,
    .prompt-insight {
      border: 1px solid var(--border);
      background: var(--bg-muted);
      border-radius: 1.15rem;
    }

    .article-flow-card {
      padding: 1rem 1.05rem;
      display: grid;
      gap: 1rem;
    }

    .flow-label,
    .table-panel-head span,
    .insight-label {
      font-size: 0.74rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-subtle);
    }

    .flow-stat strong {
      display: block;
      margin-top: 0.25rem;
      font-size: 1rem;
      color: var(--text);
    }

    .flow-steps {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.7rem;
    }

    .flow-step {
      padding: 0.9rem;
      border-radius: 0.95rem;
      border: 1px solid var(--border);
      background: var(--bg-card-solid);
      color: var(--text-muted);
      line-height: 1.6;
      font-size: 0.9rem;
    }

    .article-sections {
      display: grid;
      gap: 1rem;
    }

    .article-section {
      padding: 1rem 1.05rem;
    }

    .article-section h3 {
      margin: 0 0 0.55rem;
      font-size: 1rem;
      color: var(--text);
    }

    .article-section p {
      margin: 0;
      color: var(--text-muted);
      line-height: 1.75;
      font-size: 0.94rem;
    }

    .article-table-panel {
      padding: 1rem 1.05rem;
      display: grid;
      gap: 0.8rem;
    }

    .table-panel-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .table-panel-head strong {
      color: var(--text);
      font-size: 1rem;
    }

    .table-scroll {
      overflow: auto;
      max-width: 100%;
    }

    .article-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    .article-table th {
      padding: 0.72rem 0.7rem;
      text-align: left;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-subtle);
      border-bottom: 1px solid var(--border);
      white-space: nowrap;
    }

    .article-table td {
      padding: 0.72rem 0.7rem;
      border-bottom: 1px solid color-mix(in srgb, var(--border) 70%, transparent 30%);
      color: var(--text-muted);
      vertical-align: top;
      line-height: 1.6;
    }

    .article-table tr:last-child td {
      border-bottom: none;
    }

    .article-table tr:hover td {
      background: color-mix(in srgb, var(--accent-light) 45%, transparent 55%);
    }

    .prompt-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.55rem;
    }

    .prompt-chip {
      padding: 0.55rem 0.9rem;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: var(--bg-muted);
      color: var(--text-muted);
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: border-color 0.15s, color 0.15s, transform 0.15s, box-shadow 0.15s;
    }

    .prompt-chip:hover,
    .prompt-chip.active {
      color: var(--accent);
      border-color: var(--border-strong);
      box-shadow: 0 10px 24px rgba(99, 102, 241, 0.12);
      transform: translateY(-1px);
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

    .empty-insight {
      padding: 1rem;
      border-radius: 1.1rem;
      border: 1px dashed var(--border-strong);
      background: color-mix(in srgb, var(--accent-light) 35%, transparent 65%);
      color: var(--text-muted);
      line-height: 1.7;
    }

    .copilot-panel ngx-copilot-shell {
      display: block;
    }

    @media (max-width: 1180px) {
      .hero-card,
      .workspace-grid,
      .copilot-grid {
        grid-template-columns: 1fr;
      }

      .summary-strip,
      .flow-steps {
        grid-template-columns: 1fr;
      }

      .nav-card {
        position: static;
        max-height: none;
      }
    }

    @media (max-width: 760px) {
      :host {
        padding: 1.1rem 0.8rem 2rem;
      }

      .docs-page {
        gap: 1rem;
      }

      .hero-card,
      .surface-card {
        padding: 1rem;
        border-radius: 1.15rem;
      }

      .section-head,
      .table-panel-head {
        display: grid;
        grid-template-columns: 1fr;
      }

      .article-meta-stack {
        justify-content: start;
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
