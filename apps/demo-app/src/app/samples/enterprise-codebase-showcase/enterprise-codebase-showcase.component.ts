import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CopilotMessage,
  CopilotShellComponent,
  RagResult,
  ToolTimelineItem,
} from '@ankitparekh007/ngx-copilot-sdk';
import {
  FEATURE_TABS,
  FILE_TREE,
  CODE_SNIPPETS,
  PRODUCT_TABLE_ROWS,
  VALIDATION_ISSUES,
  APPROVAL_QUEUE,
  SYNDICATION_JOBS,
  KPI_DATA,
  CODEBASE_PROMPTS,
  type FeatureTab,
  type FileNode,
  type CodebasePrompt,
} from './retailops-codebase-demo.data';
import { RetailopsStatusBadgeComponent } from '../shared/retailops-status-badge.component';
import { RetailopsKpiCardComponent } from '../shared/retailops-kpi-card.component';

/** Flattened tree node for rendering without recursion */
interface FlatNode {
  node: FileNode;
  depth: number;
}

function flattenTree(nodes: FileNode[], depth = 0): FlatNode[] {
  const result: FlatNode[] = [];
  for (const node of nodes) {
    result.push({ node, depth });
    if (node.type === 'folder' && node.children) {
      result.push(...flattenTree(node.children, depth + 1));
    }
  }
  return result;
}

@Component({
  selector: 'app-enterprise-codebase-showcase',
  standalone: true,
  imports: [RouterLink, CopilotShellComponent, RetailopsStatusBadgeComponent, RetailopsKpiCardComponent],
  host: { class: 'codebase-host' },
  template: `
    <div class="codebase-wrap">
      <!-- Header bar -->
      <div class="codebase-header">
        <nav class="crumb" aria-label="Breadcrumb">
          <a routerLink="/">Live demo</a>
          <span class="sep">/</span>
          <span>Codebase Copilot</span>
        </nav>
        <div class="header-meta">
          <span class="repo-badge">
            <span class="repo-icon">⬡</span>
            retailops-pxm-web
          </span>
          <span class="branch-badge">main</span>
          <span class="mock-pill">100% mock data</span>
        </div>
      </div>

      <!-- Three-pane layout -->
      <div class="three-pane">

        <!-- LEFT PANE: App preview -->
        <div class="pane pane-app">
          <div class="pane-label">App Preview</div>

          <!-- Feature tabs -->
          <div class="feature-tabs" role="tablist" aria-label="RetailOps features">
            @for (tab of featureTabs; track tab.id) {
              <button
                role="tab"
                [attr.aria-selected]="selectedTab().id === tab.id"
                class="feature-tab"
                [class.active]="selectedTab().id === tab.id"
                (click)="selectTab(tab)">
                {{ tab.label }}
              </button>
            }
          </div>

          <!-- Tab content -->
          <div class="tab-content">

            @if (selectedTab().id === 'dashboard') {
              <div class="kpi-grid">
                @for (kpi of kpiData; track kpi.label) {
                  <app-retailops-kpi-card
                    [label]="kpi.label"
                    [value]="kpi.value"
                    [change]="kpi.change"
                    [isPositive]="kpi.isPositive" />
                }
              </div>
            }

            @if (selectedTab().id === 'product-onboarding') {
              <div class="data-table-wrap">
                <table class="data-table" aria-label="Product onboarding list">
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Ch.</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of productRows; track row.id) {
                      <tr>
                        <td class="sku-cell">{{ row.id }}</td>
                        <td class="name-cell">{{ row.name }}</td>
                        <td>{{ row.category }}</td>
                        <td>
                          <app-retailops-status-badge [tone]="row.status" [label]="row.status" />
                        </td>
                        <td class="channels-cell">{{ row.channels }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }

            @if (selectedTab().id === 'bulk-upload') {
              <div class="bulk-upload-preview">
                <div class="upload-dropzone">
                  <div class="upload-icon">⬆</div>
                  <p class="upload-label">Drop CSV or XLSX file here</p>
                  <p class="upload-hint">Max 50MB · 10,000 rows per job</p>
                  <button class="upload-btn" type="button">Browse files</button>
                </div>
                <div class="recent-jobs">
                  <div class="section-title">Recent Jobs</div>
                  <div class="job-row">
                    <span class="job-name">catalog-may-2026.csv</span>
                    <app-retailops-status-badge tone="syndicated" label="Completed" />
                    <span class="job-rows">4,812 rows</span>
                  </div>
                  <div class="job-row">
                    <span class="job-name">apparel-update.xlsx</span>
                    <app-retailops-status-badge tone="failed" label="3 errors" />
                    <span class="job-rows">211 rows</span>
                  </div>
                  <div class="job-row">
                    <span class="job-name">footwear-q2.csv</span>
                    <app-retailops-status-badge tone="running" label="Running" />
                    <span class="job-rows">1,043 rows</span>
                  </div>
                </div>
              </div>
            }

            @if (selectedTab().id === 'validation') {
              <div class="data-table-wrap">
                <table class="data-table" aria-label="Validation issues">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Field</th>
                      <th>Issue</th>
                      <th>Sev.</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (issue of validationIssues; track issue.productId + issue.field) {
                      <tr>
                        <td class="name-cell">{{ issue.productName }}</td>
                        <td><code class="field-code">{{ issue.field }}</code></td>
                        <td class="issue-cell">{{ issue.issue }}</td>
                        <td>
                          <app-retailops-status-badge
                            [tone]="issue.severity === 'error' ? 'rejected' : 'pending'"
                            [label]="issue.severity" />
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }

            @if (selectedTab().id === 'approval') {
              <div class="data-table-wrap">
                <table class="data-table" aria-label="Approval queue">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Product</th>
                      <th>By</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of approvalQueue; track row.id) {
                      <tr>
                        <td class="sku-cell">{{ row.id }}</td>
                        <td class="name-cell">{{ row.productName }}</td>
                        <td>{{ row.submittedBy }}</td>
                        <td>
                          <app-retailops-status-badge
                            [tone]="row.status === 'approved' ? 'approved' : row.status === 'rejected' ? 'rejected' : 'pending'"
                            [label]="row.status" />
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }

            @if (selectedTab().id === 'syndication') {
              <div class="data-table-wrap">
                <table class="data-table" aria-label="Syndication jobs">
                  <thead>
                    <tr>
                      <th>Channel</th>
                      <th>Prods.</th>
                      <th>Status</th>
                      <th>Started</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (job of syndicationJobs; track job.id) {
                      <tr>
                        <td class="name-cell">{{ job.channelName }}</td>
                        <td>{{ job.productCount }}</td>
                        <td>
                          <app-retailops-status-badge
                            [tone]="job.status"
                            [label]="job.status" />
                        </td>
                        <td class="date-cell">{{ job.startedAt }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }

          </div>
        </div>

        <!-- MIDDLE PANE: File tree -->
        <div class="pane pane-tree">
          <div class="pane-label">File Explorer</div>
          <div class="file-tree" role="tree" aria-label="Project file tree">
            @for (flat of flatNodes; track flat.node.name + flat.depth) {
              @if (flat.node.type === 'folder') {
                <div class="tree-folder" [style.padding-left.px]="flat.depth * 14 + 8">
                  <span class="folder-icon">▸</span>
                  <span class="tree-name">{{ flat.node.name }}</span>
                </div>
              } @else {
                <button
                  type="button"
                  class="tree-file"
                  [class.selected]="selectedFile()?.name === flat.node.name"
                  [style.padding-left.px]="flat.depth * 14 + 8"
                  (click)="selectFile(flat.node)">
                  <span class="file-icon">{{ getFileIcon(flat.node.name) }}</span>
                  <span class="tree-name">{{ flat.node.name }}</span>
                </button>
              }
            }
          </div>

          @if (selectedFile()) {
            <div class="code-preview">
              <div class="code-preview-header">
                <span class="code-file-name">{{ selectedFile()!.name }}</span>
                <span class="code-file-kind">TS</span>
              </div>
              <pre class="code-block">{{ getSnippet(selectedFile()!) }}</pre>
            </div>
          }
        </div>

        <!-- RIGHT PANE: Copilot -->
        <div class="pane pane-copilot">
          <div class="pane-label">Codebase Copilot</div>
          <div class="prompt-chips" aria-label="Suggested prompts">
            @for (prompt of codbasePrompts; track prompt.text) {
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
              title="RetailOps PXM navigator"
              subtitle="Mock retrieval over retailops-pxm-web · main"
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
    .codebase-wrap {
      display: flex;
      flex-direction: column;
      height: calc(100vh - 64px);
      min-height: 600px;
      overflow: hidden;
    }
    .codebase-header {
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
    .crumb { font-size: 0.92rem; color: var(--text-muted, #475569); }
    .crumb a { color: var(--accent); text-decoration: none; }
    .crumb a:hover { text-decoration: underline; }
    .sep { margin: 0 0.3rem; }
    .header-meta { display: flex; align-items: center; gap: 0.5rem; }
    .repo-badge {
      display: inline-flex; align-items: center; gap: 0.3rem;
      padding: 0.2rem 0.55rem;
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 6px;
      font-size: 0.84rem; font-weight: 600;
      color: var(--text, #0f172a);
      background: var(--bg-muted, #f8fafc);
    }
    .repo-icon { font-size: 0.9rem; }
    .branch-badge {
      display: inline-flex; align-items: center;
      padding: 0.2rem 0.5rem;
      border: 1px solid var(--border, #d1d5db);
      border-radius: 6px;
      font-size: 0.78rem; font-weight: 700;
      color: var(--text-muted, #374151);
      background: var(--bg-subtle, #f9fafb);
    }
    .mock-pill {
      font-size: 0.76rem;
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
      gap: 0;
    }
    .pane {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border-right: 1px solid var(--border, #e2e8f0);
    }
    .pane:last-child { border-right: none; }
    .pane-app { width: 320px; min-width: 260px; flex-shrink: 0; }
    .pane-tree { width: 280px; min-width: 220px; flex-shrink: 0; background: var(--bg-muted, #f8fafc); }
    .pane-copilot { flex: 1; min-width: 300px; }
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
    .feature-tabs {
      display: flex;
      overflow-x: auto;
      scrollbar-width: none;
      border-bottom: 1px solid var(--border, #e2e8f0);
      flex-shrink: 0;
      background: var(--bg, #fff);
    }
    .feature-tabs::-webkit-scrollbar { display: none; }
    .feature-tab {
      flex-shrink: 0;
      padding: 0.45rem 0.75rem;
      font-size: 0.8rem;
      font-weight: 500;
      border: none;
      background: none;
      cursor: pointer;
      color: var(--text-subtle, #64748b);
      border-bottom: 2px solid transparent;
      transition: color 0.15s, border-color 0.15s;
      white-space: nowrap;
      font-family: inherit;
    }
    .feature-tab:hover { color: var(--text, #0f172a); }
    .feature-tab.active {
      color: var(--accent);
      border-bottom-color: var(--accent);
      font-weight: 600;
    }
    .tab-content {
      flex: 1;
      overflow: auto;
      padding: 0.75rem;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }
    .data-table-wrap { overflow: auto; }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.8rem;
    }
    .data-table th {
      padding: 0.4rem 0.5rem;
      text-align: left;
      font-weight: 600;
      font-size: 0.74rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-subtle, #64748b);
      border-bottom: 1px solid var(--border, #e2e8f0);
      white-space: nowrap;
    }
    .data-table td {
      padding: 0.4rem 0.5rem;
      border-bottom: 1px solid var(--border, #f1f5f9);
      vertical-align: middle;
    }
    .data-table tr:hover td { background: var(--bg-muted, #f8fafc); }
    .sku-cell { font-family: monospace; font-size: 0.78rem; color: var(--text-muted); white-space: nowrap; }
    .name-cell { max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .channels-cell { text-align: center; }
    .date-cell { font-size: 0.74rem; color: var(--text-muted); white-space: nowrap; }
    .issue-cell { max-width: 120px; font-size: 0.78rem; }
    .field-code {
      font-family: monospace;
      font-size: 0.76rem;
      background: var(--bg-muted, #f1f5f9);
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
    }
    .bulk-upload-preview { display: flex; flex-direction: column; gap: 1rem; }
    .upload-dropzone {
      border: 2px dashed var(--border, #cbd5e1);
      border-radius: 0.75rem;
      padding: 1.25rem 1rem;
      text-align: center;
      color: var(--text-subtle, #64748b);
    }
    .upload-icon { font-size: 1.5rem; margin-bottom: 0.3rem; }
    .upload-label { margin: 0 0 0.2rem; font-size: 0.85rem; font-weight: 600; color: var(--text, #0f172a); }
    .upload-hint { margin: 0 0 0.65rem; font-size: 0.82rem; }
    .upload-btn {
      padding: 0.32rem 0.8rem;
      border: 1px solid var(--accent);
      border-radius: 6px;
      background: var(--accent-light);
      color: var(--accent-text, var(--accent));
      font-size: 0.84rem;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
    }
    .recent-jobs { display: flex; flex-direction: column; gap: 0.35rem; }
    .section-title { font-size: 0.76rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-subtle, #94a3b8); margin-bottom: 0.25rem; }
    .job-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.32rem 0.5rem;
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 6px;
      background: var(--bg, #fff);
    }
    .job-name { flex: 1; font-size: 0.78rem; font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .job-rows { font-size: 0.74rem; color: var(--text-subtle, #64748b); white-space: nowrap; }
    .file-tree {
      flex: 1;
      overflow: auto;
      padding: 0.4rem 0;
      font-size: 0.84rem;
    }
    .tree-folder {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.22rem 0.5rem;
      color: var(--text-subtle, #475569);
      user-select: none;
      font-size: 0.82rem;
    }
    .folder-icon { font-size: 0.55rem; color: #94a3b8; flex-shrink: 0; }
    .tree-file {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      width: 100%;
      padding: 0.22rem 0.5rem;
      border: none;
      background: none;
      text-align: left;
      cursor: pointer;
      color: var(--text, #374151);
      border-radius: 4px;
      transition: background 0.1s;
      font-size: 0.82rem;
      font-family: inherit;
    }
    .tree-file:hover { background: var(--accent-light); }
    .tree-file.selected { background: var(--accent-light); color: var(--accent); font-weight: 600; }
    .file-icon { font-size: 0.82rem; flex-shrink: 0; }
    .tree-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .code-preview {
      border-top: 1px solid var(--border, #e2e8f0);
      flex-shrink: 0;
      max-height: 200px;
      display: flex;
      flex-direction: column;
    }
    .code-preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.3rem 0.65rem;
      background: #0d1117;
      border-bottom: 1px solid rgba(255,255,255,0.07);
      flex-shrink: 0;
    }
    .code-file-name { font-size: 0.78rem; font-weight: 600; color: #e6edf3; font-family: monospace; }
    .code-file-kind { font-size: 0.68rem; color: rgba(230,237,243,0.58); text-transform: uppercase; letter-spacing: 0.05em; }
    .code-block {
      flex: 1;
      overflow: auto;
      background: #0d1117;
      color: #e6edf3;
      margin: 0;
      padding: 0.6rem 0.75rem;
      font-size: 0.76rem;
      line-height: 1.6;
      white-space: pre;
      font-family: 'Fira Code', 'Cascadia Code', monospace;
    }
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
      font-size: 0.8rem;
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
export class EnterpriseCodebaseShowcaseComponent {
  readonly featureTabs = FEATURE_TABS;
  readonly kpiData = KPI_DATA;
  readonly productRows = PRODUCT_TABLE_ROWS;
  readonly validationIssues = VALIDATION_ISSUES;
  readonly approvalQueue = APPROVAL_QUEUE;
  readonly syndicationJobs = SYNDICATION_JOBS;
  readonly flatNodes: FlatNode[] = flattenTree(FILE_TREE);
  readonly codbasePrompts = CODEBASE_PROMPTS;

  selectedTab = signal<FeatureTab>(FEATURE_TABS[0]);
  selectedFile = signal<FileNode | null>(null);
  selectedPrompt = signal<CodebasePrompt | null>(null);

  messages = computed<CopilotMessage[]>(() => {
    const prompt = this.selectedPrompt();
    if (!prompt) {
      return [{
        id: 'seed-welcome',
        role: 'assistant',
        content: 'Select a prompt chip above to explore mock RAG citations and tool timelines for the RetailOps PXM codebase. Click a file in the explorer to preview its source.',
        createdAt: new Date().toISOString(),
      }];
    }
    const stamp = new Date().toISOString();
    return [
      { id: `u-${stamp}`, role: 'user', content: prompt.text, createdAt: stamp },
      {
        id: `a-${stamp}`,
        role: 'assistant',
        content: prompt.answer,
        createdAt: stamp,
        sources: prompt.sources.map((s, i) => ({
          id: `src-${i}`,
          title: s.title,
          snippet: s.snippet,
          score: s.score,
          sourceType: s.fileKind,
          filePath: s.filePath,
          fileKind: s.fileKind,
          repo: 'retailops-pxm-web',
          branch: 'main',
        } as RagResult)),
      },
    ];
  });

  sources = computed<RagResult[]>(() => {
    const prompt = this.selectedPrompt();
    if (!prompt) return [];
    return prompt.sources.map((s, i) => ({
      id: `src-${i}`,
      title: s.title,
      snippet: s.snippet,
      score: s.score,
      sourceType: s.fileKind,
      filePath: s.filePath,
      fileKind: s.fileKind,
      repo: 'retailops-pxm-web',
      branch: 'main',
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

  selectTab(tab: FeatureTab): void {
    this.selectedTab.set(tab);
  }

  selectFile(node: FileNode): void {
    this.selectedFile.set(node);
  }

  selectPrompt(prompt: CodebasePrompt): void {
    this.selectedPrompt.set(prompt);
  }

  resetSession(): void {
    this.selectedPrompt.set(null);
    this.selectedFile.set(null);
  }

  onSend(content: string): void {
    const trimmed = content.trim();
    if (!trimmed) return;
    const match = this.codbasePrompts.find(p => p.text.toLowerCase() === trimmed.toLowerCase());
    if (match) {
      this.selectPrompt(match);
    }
  }

  getSnippet(node: FileNode): string {
    if (!node.snippetKey) return `// No preview available for ${node.name}`;
    return CODE_SNIPPETS[node.snippetKey] ?? `// No snippet for ${node.snippetKey}`;
  }

  getFileIcon(name: string): string {
    if (name.endsWith('.service.ts')) return '⚙';
    if (name.endsWith('.component.ts')) return '◻';
    if (name.endsWith('.guard.ts')) return '⊕';
    if (name.endsWith('.model.ts')) return '◈';
    return '◦';
  }
}
