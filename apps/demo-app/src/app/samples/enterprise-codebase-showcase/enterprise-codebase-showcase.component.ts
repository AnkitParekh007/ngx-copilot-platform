import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CopilotMessage,
  CopilotShellComponent,
  RagResult,
  ToolTimelineItem,
} from '@ankit-parekh-007/ngx-copilot-sdk';
import {
  APPROVAL_QUEUE,
  CODEBASE_PROMPTS,
  CODE_SNIPPETS,
  FEATURE_TABS,
  FILE_TREE,
  KPI_DATA,
  PRODUCT_TABLE_ROWS,
  SYNDICATION_JOBS,
  VALIDATION_ISSUES,
  type CodebasePrompt,
  type FeatureTab,
  type FileNode,
} from './retailops-codebase-demo.data';
import { RetailopsKpiCardComponent } from '../shared/retailops-kpi-card.component';
import { RetailopsStatusBadgeComponent } from '../shared/retailops-status-badge.component';

interface FlatNode {
  node: FileNode;
  depth: number;
}

const TAB_SUMMARIES: Record<string, string> = {
  dashboard: 'Operating snapshot for catalog throughput, review load, and channel readiness.',
  'product-onboarding': 'Merchant-facing onboarding queue with lifecycle state and channel distribution context.',
  'bulk-upload': 'Batch import flow for CSV or XLSX onboarding with validation and retry surfaces.',
  validation: 'Rule center for product quality blockers and remediation handoff.',
  approval: 'Reviewer workspace for approve, reject, and request-changes decisions.',
  syndication: 'Dispatch queue for marketplace and channel publication jobs.',
};

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
  imports: [RouterLink, CopilotShellComponent, RetailopsKpiCardComponent, RetailopsStatusBadgeComponent],
  host: { class: 'codebase-host' },
  template: `
    <div class="workspace-demo codebase-demo">
      <section class="workspace-hero">
        <div>
          <nav class="workspace-crumb" aria-label="Breadcrumb">
            <a routerLink="/">Live demo</a>
            <span>/</span>
            <span>RetailOps PXM codebase copilot</span>
          </nav>
          <div class="workspace-badge-row">
            <span class="workspace-badge">Angular workspace</span>
            <span class="workspace-badge">Grounded code retrieval</span>
            <span class="workspace-badge workspace-badge-warning">100% mock data</span>
          </div>
          <h1 class="workspace-title">Enterprise code navigation with a copilot that cites the files it is talking about.</h1>
          <p class="workspace-description">
            This sample pairs a realistic Angular product surface with a repository navigator and a grounded copilot.
            The point is not generic chat. It is <strong>inspectable implementation guidance</strong>: prompts,
            file-path citations, and tool-step summaries that point back to concrete Angular services, guards,
            components, and models.
          </p>
          <div class="workspace-actions">
            <a routerLink="/docs/retailops-pxm-demo" class="workspace-action workspace-action-primary">Read demo architecture</a>
            <a routerLink="/docs/adapters" class="workspace-action workspace-action-secondary">Review adapter boundary</a>
          </div>
        </div>

        <aside class="workspace-meta-stack">
          <div class="workspace-meta-card">
            <div class="workspace-meta-label">Workspace</div>
            <div class="workspace-meta-value">retailops-pxm-web</div>
            <div class="workspace-meta-copy">Angular monorepo slice for onboarding, validation, approvals, and syndication.</div>
          </div>
          <div class="workspace-meta-card">
            <div class="workspace-meta-label">Copilot purpose</div>
            <div class="workspace-meta-value">Code navigation</div>
            <div class="workspace-meta-copy">Prompt chips, grounded file citations, and step-by-step retrieval trace.</div>
          </div>
          <div class="workspace-meta-card workspace-meta-card-warning">
            <div class="workspace-meta-label">Safety</div>
            <div class="workspace-meta-value">No live repo access</div>
            <div class="workspace-meta-copy">All data is fictional, browser-only, and credential-free.</div>
          </div>
        </aside>
      </section>

      <section class="workspace-kpi-grid" aria-label="Workspace metrics">
        @for (kpi of kpiData; track kpi.label) {
          <app-retailops-kpi-card
            [label]="kpi.label"
            [value]="kpi.value"
            [change]="kpi.change"
            [isPositive]="kpi.isPositive" />
        }
      </section>

      <section class="workspace-main-grid codebase-main-grid">
        <article class="workspace-panel">
          <div class="workspace-section-head">
            <div>
              <div class="workspace-section-eyebrow">Product workspace</div>
              <h2>RetailOps application surface</h2>
              <p>{{ activeTabSummary() }}</p>
            </div>
            <span class="workspace-tag">{{ selectedTab().label }}</span>
          </div>

          <div class="workspace-chip-row tabs-row" role="tablist" aria-label="RetailOps features">
            @for (tab of featureTabs; track tab.id) {
              <button
                role="tab"
                [attr.aria-selected]="selectedTab().id === tab.id"
                class="workspace-chip"
                [class.active]="selectedTab().id === tab.id"
                (click)="selectTab(tab)">
                {{ tab.label }}
              </button>
            }
          </div>

          <div class="workspace-panel-muted workspace-surface-stage">
            @if (selectedTab().id === 'dashboard') {
              <div class="workspace-surface-stack">
                <div class="workspace-inline-header">
                  <strong>Executive dashboard</strong>
                  <span>Readiness, queue pressure, and publishing signal</span>
                </div>
                <div class="mini-kpi-grid">
                  @for (kpi of kpiData; track kpi.label) {
                    <div class="mini-kpi-card">
                      <span class="workspace-subtle-label">{{ kpi.label }}</span>
                      <strong>{{ kpi.value }}</strong>
                      <span class="mini-kpi-trend" [class.good]="kpi.isPositive">{{ kpi.change }}</span>
                    </div>
                  }
                </div>
              </div>
            }

            @if (selectedTab().id === 'product-onboarding') {
              <div class="workspace-surface-stack">
                <div class="workspace-inline-header">
                  <strong>Product onboarding queue</strong>
                  <span>Mock lifecycle and channel distribution view</span>
                </div>
                <div class="workspace-scroll">
                  <table class="workspace-table" aria-label="Product onboarding list">
                    <thead>
                      <tr>
                        <th>SKU</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Channels</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (row of productRows; track row.id) {
                        <tr>
                          <td class="sku-cell">{{ row.id }}</td>
                          <td class="name-cell">{{ row.name }}</td>
                          <td>{{ row.category }}</td>
                          <td><app-retailops-status-badge [tone]="row.status" [label]="row.status" /></td>
                          <td>{{ row.channels }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }

            @if (selectedTab().id === 'bulk-upload') {
              <div class="bulk-grid">
                <div class="bulk-dropzone">
                  <div class="dropzone-icon">&#8593;</div>
                  <strong>Stage a catalog import</strong>
                  <p>Drop CSV or XLSX to simulate the onboarding pipeline. Validation, retry, and reporting stay visible before any commit step.</p>
                  <button type="button" class="workspace-action workspace-action-secondary upload-action">Browse local file</button>
                </div>

                <div class="workspace-surface-stack">
                  <div class="workspace-panel-muted flow-note-card">
                    <div class="workspace-subtle-label">Why this matters</div>
                    <ul>
                      <li>Parsing and schema checks belong in the service layer.</li>
                      <li>Broken rows should not block clean rows from progressing.</li>
                      <li>Operators need exportable error reports and retry paths.</li>
                    </ul>
                  </div>

                  <div class="workspace-panel-muted recent-jobs-card">
                    <div class="workspace-inline-header">
                      <strong>Recent jobs</strong>
                      <span>Illustrative import history</span>
                    </div>
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
              </div>
            }

            @if (selectedTab().id === 'validation') {
              <div class="workspace-surface-stack">
                <div class="workspace-inline-header">
                  <strong>Validation issue center</strong>
                  <span>Rule-driven blockers before review</span>
                </div>
                <div class="workspace-scroll">
                  <table class="workspace-table" aria-label="Validation issues">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Field</th>
                        <th>Issue</th>
                        <th>Severity</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (issue of validationIssues; track issue.productId + issue.field) {
                        <tr>
                          <td class="name-cell">{{ issue.productName }}</td>
                          <td><code>{{ issue.field }}</code></td>
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
              </div>
            }

            @if (selectedTab().id === 'approval') {
              <div class="workspace-surface-stack">
                <div class="workspace-inline-header">
                  <strong>Approval queue</strong>
                  <span>Explicit reviewer checkpoints</span>
                </div>
                <div class="workspace-scroll">
                  <table class="workspace-table" aria-label="Approval queue">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Product</th>
                        <th>Submitted by</th>
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
              </div>
            }

            @if (selectedTab().id === 'syndication') {
              <div class="workspace-surface-stack">
                <div class="workspace-inline-header">
                  <strong>Channel dispatch jobs</strong>
                  <span>Readiness, retry, and marketplace delivery status</span>
                </div>
                <div class="workspace-scroll">
                  <table class="workspace-table" aria-label="Syndication jobs">
                    <thead>
                      <tr>
                        <th>Channel</th>
                        <th>Products</th>
                        <th>Status</th>
                        <th>Started</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (job of syndicationJobs; track job.id) {
                        <tr>
                          <td class="name-cell">{{ job.channelName }}</td>
                          <td>{{ job.productCount }}</td>
                          <td><app-retailops-status-badge [tone]="job.status" [label]="job.status" /></td>
                          <td class="date-cell">{{ job.startedAt }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }
          </div>
        </article>

        <article class="workspace-panel repo-panel">
          <div class="workspace-section-head">
            <div>
              <div class="workspace-section-eyebrow">Repository navigator</div>
              <h2>Inspect the files behind the answer</h2>
              <p>The file tree, code preview, and prompt results are aligned so the copilot feels auditable.</p>
            </div>
            <div class="repo-meta-stack">
              <span class="workspace-pill">retailops-pxm-web</span>
              <span class="workspace-pill workspace-pill-muted">main</span>
            </div>
          </div>

          <div class="repo-grid">
            <section class="workspace-panel-muted explorer-card">
              <div class="repo-card-head">
                <strong>File explorer</strong>
                <span>Mock Angular workspace tree</span>
              </div>
              <div class="file-tree" role="tree" aria-label="Project file tree">
                @for (flat of flatNodes; track flat.node.name + flat.depth) {
                  @if (flat.node.type === 'folder') {
                    <div class="tree-folder" [style.padding-left.px]="flat.depth * 14 + 12">
                      <span class="folder-icon">></span>
                      <span class="tree-name">{{ flat.node.name }}</span>
                    </div>
                  } @else {
                    <button
                      type="button"
                      class="tree-file"
                      [class.selected]="selectedFile()?.name === flat.node.name"
                      [style.padding-left.px]="flat.depth * 14 + 12"
                      (click)="selectFile(flat.node)">
                      <span class="file-icon">{{ getFileIcon(flat.node.name) }}</span>
                      <span class="tree-name">{{ flat.node.name }}</span>
                    </button>
                  }
                }
              </div>
            </section>

            <section class="workspace-panel-muted code-card">
              <div class="repo-card-head">
                <strong>{{ selectedFile()?.name ?? 'Select a file' }}</strong>
                <span>{{ selectedFile() ? 'Grounding preview' : 'Choose a node from the explorer' }}</span>
              </div>
              <pre class="code-block">{{ selectedFile() ? getSnippet(selectedFile()!) : emptySnippet }}</pre>
            </section>
          </div>
        </article>
      </section>

      <section class="workspace-assistant-grid codebase-assistant-grid">
        <article class="workspace-panel prompt-panel">
          <div class="workspace-section-head compact-head">
            <div>
              <div class="workspace-section-eyebrow">Suggested prompts</div>
              <h2>Ask implementation questions operators and engineers actually ask</h2>
            </div>
          </div>

          <div class="workspace-chip-row prompt-row" aria-label="Suggested prompts">
            @for (prompt of codbasePrompts; track prompt.text) {
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
            <div class="insight-grid">
              <div>
                <div class="workspace-subtle-label">Likely files</div>
                <div class="insight-list">
                  @for (source of prompt.sources; track source.filePath) {
                    <code>{{ source.filePath }}</code>
                  }
                </div>
              </div>
              <div class="insight-stat-block">
                <div class="workspace-subtle-label">Tool steps</div>
                <strong>{{ prompt.timeline.length }}</strong>
                <span>retrieval events</span>
              </div>
            </div>
          </div>
          <ng-template #emptyPromptState>
            <div class="workspace-panel-muted empty-state">
              Pick a prompt chip to see how the workspace, code citations, and copilot transcript line up.
            </div>
          </ng-template>
        </article>

        <article class="workspace-panel copilot-panel">
          <div class="workspace-section-head compact-head">
            <div>
              <div class="workspace-section-eyebrow">Grounded copilot workspace</div>
              <h2>RetailOps PXM navigator</h2>
              <p>Mock retrieval over Angular services, guards, models, and feature folders.</p>
            </div>
          </div>

          <ngx-copilot-shell
            title="RetailOps PXM navigator"
            subtitle="Mock retrieval over retailops-pxm-web &middot; main"
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

    .codebase-main-grid {
      grid-template-columns: minmax(0, 1.18fr) minmax(360px, 0.82fr);
    }

    .workspace-surface-stage {
      padding: 1rem;
      min-height: 460px;
    }

    .workspace-surface-stack {
      display: grid;
      gap: 0.95rem;
      align-content: start;
    }

    .workspace-inline-header,
    .repo-card-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.9rem;
      flex-wrap: wrap;
    }

    .workspace-inline-header strong,
    .repo-card-head strong {
      color: var(--text);
      font-size: 1rem;
    }

    .workspace-inline-header span,
    .repo-card-head span {
      color: var(--text-subtle);
      font-size: 0.82rem;
    }

    .tabs-row {
      overflow-x: auto;
      flex-wrap: nowrap;
      padding-bottom: 0.2rem;
      scrollbar-width: thin;
    }

    .repo-meta-stack {
      display: flex;
      gap: 0.45rem;
      flex-wrap: wrap;
      justify-content: end;
    }

    .workspace-pill-muted {
      color: var(--text-subtle);
    }

    .mini-kpi-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.75rem;
    }

    .mini-kpi-card {
      padding: 0.95rem;
      border-radius: 1rem;
      border: 1px solid var(--border);
      background: var(--bg-card-solid);
      display: grid;
      gap: 0.28rem;
    }

    .mini-kpi-card strong {
      font-size: 1.08rem;
      color: var(--text);
    }

    .mini-kpi-trend {
      font-size: 0.84rem;
      color: var(--text-muted);
    }

    .mini-kpi-trend.good {
      color: var(--callout-success-text);
    }

    .sku-cell,
    .job-name {
      font-family: "JetBrains Mono", ui-monospace, monospace;
    }

    .sku-cell,
    .date-cell {
      white-space: nowrap;
      font-size: 0.84rem;
    }

    .name-cell,
    .issue-cell {
      color: var(--text-muted);
    }

    .bulk-grid {
      display: grid;
      grid-template-columns: minmax(240px, 1.08fr) minmax(240px, 0.92fr);
      gap: 1rem;
      align-items: start;
    }

    .bulk-dropzone {
      min-height: 260px;
      padding: 1.25rem;
      border-radius: 1.15rem;
      border: 1.5px dashed var(--border-strong);
      background: color-mix(in srgb, var(--accent-light) 42%, transparent 58%);
      display: grid;
      gap: 0.55rem;
      align-content: center;
      justify-items: start;
    }

    .dropzone-icon {
      width: 48px;
      height: 48px;
      display: grid;
      place-items: center;
      border-radius: 14px;
      border: 1px solid var(--border);
      background: var(--bg-card-solid);
      color: var(--accent);
      font-size: 1.35rem;
      font-weight: 800;
    }

    .bulk-dropzone strong {
      font-size: 1.08rem;
      color: var(--text);
    }

    .bulk-dropzone p {
      margin: 0;
      color: var(--text-muted);
      line-height: 1.7;
    }

    .upload-action {
      margin-top: 0.2rem;
    }

    .flow-note-card,
    .recent-jobs-card {
      padding: 1rem;
    }

    .flow-note-card ul {
      margin: 0.65rem 0 0;
      padding-left: 1.1rem;
      color: var(--text-muted);
      line-height: 1.7;
    }

    .recent-jobs-card {
      display: grid;
      gap: 0.65rem;
    }

    .job-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto auto;
      gap: 0.6rem;
      align-items: center;
      padding: 0.82rem 0.9rem;
      border-radius: 0.95rem;
      border: 1px solid var(--border);
      background: var(--bg-card-solid);
    }

    .job-name {
      font-size: 0.82rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--text);
    }

    .job-rows {
      font-size: 0.82rem;
      color: var(--text-subtle);
      white-space: nowrap;
    }

    .repo-panel {
      align-content: start;
    }

    .repo-grid {
      display: grid;
      grid-template-rows: minmax(280px, 0.9fr) minmax(320px, 1.1fr);
      gap: 0.95rem;
      min-height: 640px;
    }

    .explorer-card,
    .code-card {
      overflow: hidden;
      display: grid;
      grid-template-rows: auto 1fr;
      padding: 0.95rem;
      gap: 0.85rem;
    }

    .file-tree {
      overflow: auto;
      padding: 0.2rem 0;
    }

    .tree-folder,
    .tree-file {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      width: 100%;
      min-height: 36px;
      border-radius: 0.7rem;
      font-size: 0.88rem;
    }

    .tree-folder {
      color: var(--text-subtle);
    }

    .tree-file {
      border: none;
      background: transparent;
      color: var(--text);
      cursor: pointer;
      font-family: inherit;
      text-align: left;
    }

    .tree-file:hover,
    .tree-file.selected {
      background: var(--accent-light);
      color: var(--accent);
    }

    .tree-file.selected {
      font-weight: 700;
      box-shadow: inset 0 0 0 1px var(--border-strong);
    }

    .folder-icon,
    .file-icon {
      width: 18px;
      flex-shrink: 0;
      text-align: center;
      font-size: 0.72rem;
      font-weight: 700;
    }

    .tree-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .code-block {
      margin: 0;
      min-height: 100%;
      overflow: auto;
      background: var(--code-bg);
      color: var(--code-text);
      padding: 1rem 1.05rem;
      font-size: 0.84rem;
      line-height: 1.65;
      white-space: pre;
      font-family: "JetBrains Mono", ui-monospace, monospace;
      border-radius: 1rem;
    }

    .codebase-assistant-grid {
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
    }

    .insight-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 1rem;
      align-items: start;
    }

    .insight-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem;
      margin-top: 0.55rem;
    }

    .insight-list code {
      padding: 0.28rem 0.55rem;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: var(--bg-card-solid);
      color: var(--text-muted);
      font-size: 0.82rem;
    }

    .insight-stat-block {
      display: grid;
      justify-items: end;
      gap: 0.1rem;
      text-align: right;
    }

    .insight-stat-block strong {
      font-size: 1.55rem;
      line-height: 1;
      color: var(--text);
    }

    .insight-stat-block span {
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
      .codebase-main-grid {
        grid-template-columns: 1fr;
      }

      .repo-grid,
      .bulk-grid {
        grid-template-columns: 1fr;
        grid-template-rows: none;
        min-height: 0;
      }
    }

    @media (max-width: 899px) {
      :host {
        padding: 1.1rem 0.8rem 2rem;
      }

      .mini-kpi-grid {
        grid-template-columns: 1fr;
      }

      .insight-grid,
      .workspace-inline-header,
      .repo-card-head {
        grid-template-columns: 1fr;
        display: grid;
      }

      .repo-meta-stack {
        justify-content: start;
      }
    }

    @media (max-width: 639px) {
      .job-row {
        grid-template-columns: 1fr;
        align-items: start;
      }

      .workspace-surface-stage,
      .flow-note-card,
      .recent-jobs-card,
      .explorer-card,
      .code-card,
      .prompt-insight,
      .empty-state {
        padding: 0.9rem;
      }
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
  readonly emptySnippet = `// Select a file from the explorer to inspect the snippet
// Retrieval citations in the copilot point back to these workspace paths.`;

  selectedTab = signal<FeatureTab>(FEATURE_TABS[0]);
  selectedFile = signal<FileNode | null>(null);
  selectedPrompt = signal<CodebasePrompt | null>(null);

  readonly activeTabSummary = computed(() => TAB_SUMMARIES[this.selectedTab().id] ?? '');

  messages = computed<CopilotMessage[]>(() => {
    const prompt = this.selectedPrompt();
    if (!prompt) {
      return [{
        id: 'seed-welcome',
        role: 'assistant',
        content: 'Select a prompt chip to explore grounded file citations and tool steps for the RetailOps PXM Angular workspace. Use the file explorer to inspect the cited snippets.',
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
    const match = this.codbasePrompts.find((p) => p.text.toLowerCase() === trimmed.toLowerCase());
    if (match) {
      this.selectPrompt(match);
    }
  }

  getSnippet(node: FileNode): string {
    if (!node.snippetKey) return `// No preview available for ${node.name}`;
    return CODE_SNIPPETS[node.snippetKey] ?? `// No snippet for ${node.snippetKey}`;
  }

  getFileIcon(name: string): string {
    if (name.endsWith('.service.ts')) return 'svc';
    if (name.endsWith('.component.ts')) return 'cmp';
    if (name.endsWith('.guard.ts')) return 'g';
    if (name.endsWith('.model.ts')) return 'mdl';
    return 'ts';
  }
}
