import { Component, signal, computed } from '@angular/core';
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

/** Group articles by category for sidebar display */
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
    <div class="docs-wrap">
      <!-- Header bar -->
      <div class="docs-header">
        <nav class="crumb" aria-label="Breadcrumb">
          <a routerLink="/">Live demo</a>
          <span class="sep">/</span>
          <span>Documentation Copilot</span>
        </nav>
        <div class="header-meta">
          <span class="site-badge">docs.retailops-pxm.example</span>
          <span class="mock-pill">100% mock data</span>
        </div>
      </div>

      <!-- Three-pane layout -->
      <div class="three-pane">

        <!-- LEFT PANE: Article sidebar -->
        <div class="pane pane-sidebar">
          <div class="pane-label">Articles</div>
          <nav class="article-nav" aria-label="Documentation articles">
            @for (category of categoryKeys; track category) {
              <div class="nav-section">
                <div class="nav-section-title">{{ category }}</div>
                @for (article of groupedArticles.get(category) ?? []; track article.id) {
                  <button
                    type="button"
                    class="nav-item"
                    [class.active]="selectedArticle().id === article.id"
                    (click)="selectArticle(article)">
                    {{ article.title }}
                  </button>
                }
              </div>
            }
          </nav>
        </div>

        <!-- CENTER PANE: Article viewer -->
        <div class="pane pane-article">
          <div class="pane-label">Article</div>
          <div class="article-viewer">
            <div class="article-meta">
              <span class="article-category">{{ selectedArticle().category }}</span>
              <span class="article-badge">{{ selectedArticle().badge }}</span>
            </div>
            <h1 class="article-title">{{ selectedArticle().title }}</h1>
            <p class="article-intro">{{ selectedArticle().intro }}</p>

            @for (section of selectedArticle().sections; track section.heading) {
              <div class="article-section">
                <h2 class="section-heading">{{ section.heading }}</h2>
                <p class="section-body">{{ section.body }}</p>
              </div>
            }

            @if (selectedArticle().table) {
              <div class="article-table-wrap">
                @if (selectedArticle().table!.caption) {
                  <p class="table-caption">{{ selectedArticle().table!.caption }}</p>
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
              </div>
            }
          </div>
        </div>

        <!-- RIGHT PANE: Copilot -->
        <div class="pane pane-copilot">
          <div class="pane-label">Documentation Copilot</div>
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
          <div class="copilot-shell-wrap">
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
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .docs-wrap {
      display: flex;
      flex-direction: column;
      height: calc(100vh - 64px);
      min-height: 600px;
      overflow: hidden;
    }
    .docs-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.6rem 1rem;
      border-bottom: 1px solid var(--border, #e2e8f0);
      background: var(--bg, #fff);
      flex-shrink: 0;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .crumb { font-size: 0.85rem; color: var(--text-subtle, #64748b); }
    .crumb a { color: var(--accent); text-decoration: none; }
    .crumb a:hover { text-decoration: underline; }
    .sep { margin: 0 0.3rem; }
    .header-meta { display: flex; align-items: center; gap: 0.5rem; }
    .site-badge {
      display: inline-flex; align-items: center;
      padding: 0.2rem 0.55rem;
      border: 1px solid var(--border-strong);
      border-radius: 6px;
      font-size: 0.78rem; font-weight: 600;
      color: var(--accent-text, var(--accent));
      background: var(--accent-light);
      font-family: monospace;
    }
    .mock-pill {
      font-size: 0.7rem;
      padding: 0.18rem 0.5rem;
      border-radius: 999px;
      background: var(--callout-warning-bg);
      color: var(--callout-warning-text);
      border: 1px solid var(--callout-warning-border);
      font-weight: 600;
    }
    .three-pane {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    .pane {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border-right: 1px solid var(--border, #e2e8f0);
    }
    .pane:last-child { border-right: none; }
    .pane-sidebar { width: 240px; min-width: 200px; flex-shrink: 0; background: var(--bg-muted, #f8fafc); }
    .pane-article { flex: 1; min-width: 280px; background: var(--bg, #fff); }
    .pane-copilot { width: 340px; min-width: 280px; flex-shrink: 0; }
    .pane-label {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: var(--text-subtle, #94a3b8);
      padding: 0.5rem 0.75rem 0.35rem;
      border-bottom: 1px solid var(--border, #e2e8f0);
      background: var(--bg, #fff);
      flex-shrink: 0;
    }

    /* Sidebar */
    .article-nav {
      flex: 1;
      overflow: auto;
      padding: 0.5rem 0;
    }
    .nav-section { margin-bottom: 0.5rem; }
    .nav-section-title {
      font-size: 0.67rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: var(--text-subtle, #94a3b8);
      padding: 0.35rem 0.85rem 0.2rem;
    }
    .nav-item {
      display: block;
      width: 100%;
      padding: 0.3rem 0.85rem;
      text-align: left;
      border: none;
      background: none;
      font-size: 0.8rem;
      cursor: pointer;
      color: var(--text, #374151);
      border-radius: 0;
      transition: background 0.1s, color 0.1s;
      font-family: inherit;
    }
    .nav-item:hover { background: var(--accent-light); color: var(--accent); }
    .nav-item.active {
      background: var(--accent-light);
      color: var(--accent);
      font-weight: 600;
      border-left: 3px solid var(--accent);
      padding-left: calc(0.85rem - 3px);
    }

    /* Article viewer */
    .article-viewer {
      flex: 1;
      overflow: auto;
      padding: 1.25rem 1.5rem;
    }
    .article-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
    .article-category {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-subtle, #64748b);
    }
    .article-badge {
      font-size: 0.68rem;
      font-weight: 600;
      padding: 0.12rem 0.45rem;
      border-radius: 999px;
      background: var(--pill-accent-bg);
      color: var(--pill-accent-text);
      border: 1px solid var(--pill-accent-border);
    }
    .article-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--text, #0f172a);
      margin: 0 0 0.7rem;
      line-height: 1.3;
      letter-spacing: -0.02em;
    }
    .article-intro {
      font-size: 0.95rem;
      color: var(--text-muted, #475569);
      line-height: 1.7;
      margin: 0 0 1.25rem;
      border-left: 3px solid var(--accent);
      padding-left: 0.85rem;
    }
    .article-section { margin-bottom: 1.25rem; }
    .section-heading {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text, #0f172a);
      margin: 0 0 0.5rem;
      padding-bottom: 0.3rem;
      border-bottom: 1px solid var(--border, #e2e8f0);
    }
    .section-body {
      font-size: 0.88rem;
      color: var(--text, #374151);
      line-height: 1.7;
      margin: 0;
    }

    /* Tables */
    .article-table-wrap { margin-top: 1rem; }
    .table-caption {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--text-subtle, #64748b);
      margin: 0 0 0.5rem;
    }
    .table-scroll { overflow: auto; }
    .article-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.8rem;
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 8px;
      overflow: hidden;
    }
    .article-table th {
      padding: 0.45rem 0.7rem;
      background: var(--bg-muted, #f8fafc);
      font-weight: 700;
      font-size: 0.73rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--text-subtle, #64748b);
      border-bottom: 1px solid var(--border, #e2e8f0);
      white-space: nowrap;
      text-align: left;
    }
    .article-table td {
      padding: 0.4rem 0.7rem;
      border-bottom: 1px solid var(--border, #f1f5f9);
      vertical-align: top;
    }
    .article-table tr:last-child td { border-bottom: none; }
    .article-table tr:hover td { background: var(--bg-muted, #f8fafc); }

    /* Copilot pane */
    .pane-copilot { display: flex; flex-direction: column; }
    .prompt-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      padding: 0.5rem 0.75rem;
      border-bottom: 1px solid var(--border, #e2e8f0);
      flex-shrink: 0;
      background: var(--bg, #fff);
    }
    .prompt-chip {
      padding: 0.28rem 0.65rem;
      border: 1px solid var(--border, #cbd5e1);
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 500;
      cursor: pointer;
      background: var(--bg, #fff);
      color: var(--text, #0f172a);
      transition: border-color 0.15s, box-shadow 0.15s, color 0.15s;
      white-space: nowrap;
      font-family: inherit;
    }
    .prompt-chip:hover, .prompt-chip.active {
      border-color: var(--accent);
      box-shadow: 0 2px 8px var(--glow);
      color: var(--accent);
    }
    .copilot-shell-wrap {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
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
        content: 'Select a prompt chip above to see how the documentation copilot cites canonical articles. Click any article in the sidebar to read it.',
        createdAt: new Date().toISOString(),
      }];
    }
    const stamp = new Date().toISOString();
    const sourcedArticles = DOCS_ARTICLES.filter(a => prompt.sourceIds.includes(a.id));
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
    const sourcedArticles = DOCS_ARTICLES.filter(a => prompt.sourceIds.includes(a.id));
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
    // Also show the first cited article
    if (prompt.sourceIds.length > 0) {
      const article = DOCS_ARTICLES.find(a => a.id === prompt.sourceIds[0]);
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
    const match = this.docsPrompts.find(p => p.text.toLowerCase() === trimmed.toLowerCase());
    if (match) this.selectPrompt(match);
  }
}
