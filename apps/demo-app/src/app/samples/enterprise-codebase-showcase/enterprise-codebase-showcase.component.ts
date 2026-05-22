import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CopilotMessage,
  CopilotShellComponent,
  RagResult,
  ToolTimelineItem,
} from '@ankitparekh007/ngx-copilot-sdk';
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
  dashboard: 'Portfolio health snapshot for catalog readiness, approval queue pressure, and channel delivery.',
  'product-onboarding': 'Operational table for category setup, lifecycle state, and publication readiness.',
  'bulk-upload': 'High-volume importer for CSV/XLSX onboarding with batch retries and validation handling.',
  validation: 'Rule engine output for field-level issues, severity, and release blockers.',
  approval: 'Reviewer workspace for approve, reject, and request-changes actions.',
  syndication: 'Channel dispatch queue for Amazon, Shopify, B2B, and partner feeds.',
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
    <div class="sample-page">
      <section class="hero-card">
        <div class="hero-copy">
          <nav class="crumb" aria-label="Breadcrumb">
            <a routerLink="/">Live demo</a>
            <span>/</span>
            <span>RetailOps PXM codebase copilot</span>
          </nav>
          <div class="hero-eyebrow">
            <span class="eyebrow-badge">Angular workspace sample</span>
            <span class="eyebrow-badge">Human-readable retrieval</span>
            <span class="eyebrow-badge accent">Mock enterprise data</span>
          </div>
          <h1>Explore an Angular product workspace the way an onboarding engineer would.</h1>
          <p class="hero-desc">
            This sample shows how <strong>ngx-copilot-sdk</strong> can sit next to a real application surface,
            a navigable code tree, and a grounded copilot panel. The objective is not “chat about code” in
            the abstract. It is <strong>traceable navigation</strong>: prompts, citations, and tool steps that
            point back to concrete Angular files and feature boundaries.
          </p>
          <div class="hero-actions">
            <a routerLink="/docs/retailops-pxm-demo" class="hero-btn hero-btn-primary">Read demo architecture</a>
            <a routerLink="/docs/adapters" class="hero-btn hero-btn-secondary">Backend adapter model</a>
          </div>
        </div>

        <aside class="hero-meta">
          <div class="meta-card">
            <div class="meta-label">Workspace</div>
            <div class="meta-value">retailops-pxm-web</div>
            <div class="meta-sub">Angular monorepo slice · branch: main</div>
          </div>
          <div class="meta-card">
            <div class="meta-label">Copilot behavior</div>
            <div class="meta-value">Code navigation</div>
            <div class="meta-sub">Grounded file citations, prompt chips, and tool timeline</div>
          </div>
          <div class="meta-card meta-card-warning">
            <div class="meta-label">Safety</div>
            <div class="meta-value">100% mock data</div>
            <div class="meta-sub">No real repo access, no API calls, no credentials</div>
          </div>
        </aside>
      </section>

      <section class="kpi-strip" aria-label="Workspace metrics">
        @for (kpi of kpiData; track kpi.label) {
          <app-retailops-kpi-card
            [label]="kpi.label"
            [value]="kpi.value"
            [change]="kpi.change"
            [isPositive]="kpi.isPositive" />
        }
      </section>

      <section class="overview-grid">
        <article class="surface-card">
          <div class="section-head">
            <div>
              <div class="section-eyebrow">App surface</div>
              <h2>RetailOps product workspace</h2>
              <p>{{ activeTabSummary() }}</p>
            </div>
            <div class="section-tag">{{ selectedTab().label }}</div>
          </div>

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

          <div class="surface-body">
            @if (selectedTab().id === 'dashboard') {
              <div class="dashboard-slab">
                <div class="slab-note">Executive summary</div>
                <p>Merchandising, approval, and syndication health are surfaced before the engineer ever opens the copilot.</p>
                <div class="mini-kpi-grid">
                  @for (kpi of kpiData; track kpi.label) {
                    <div class="mini-kpi">
                      <span class="mini-kpi-label">{{ kpi.label }}</span>
                      <strong>{{ kpi.value }}</strong>
                      <span class="mini-kpi-change" [class.good]="kpi.isPositive">{{ kpi.change }}</span>
                    </div>
                  }
                </div>
              </div>
            }

            @if (selectedTab().id === 'product-onboarding') {
              <div class="table-card">
                <div class="table-header">
                  <strong>Product onboarding queue</strong>
                  <span>Mock SKU lifecycle view</span>
                </div>
                <div class="table-scroll">
                  <table class="data-table" aria-label="Product onboarding list">
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
              <div class="bulk-layout">
                <div class="upload-dropzone">
                  <div class="upload-icon">↑</div>
                  <strong>Drop CSV or XLSX to stage a catalog import</strong>
                  <span>Up to 50MB · 10,000 rows per batch · row-level retry support</span>
                  <button class="upload-btn" type="button">Browse local file</button>
                </div>
                <div class="support-stack">
                  <div class="info-panel">
                    <div class="info-panel-label">Flow highlights</div>
                    <ul>
                      <li>File parsing and schema checks happen in the service layer.</li>
                      <li>Validation issues are materialized before a destructive import step.</li>
                      <li>Error exports allow recovery without rerunning clean rows.</li>
                    </ul>
                  </div>
                  <div class="jobs-panel">
                    <div class="jobs-header">
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
              <div class="table-card">
                <div class="table-header">
                  <strong>Validation issue center</strong>
                  <span>Rule-driven blockers surfaced before approval</span>
                </div>
                <div class="table-scroll">
                  <table class="data-table" aria-label="Validation issues">
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
              </div>
            }

            @if (selectedTab().id === 'approval') {
              <div class="table-card">
                <div class="table-header">
                  <strong>Approval queue</strong>
                  <span>Human sign-off is explicit and stateful</span>
                </div>
                <div class="table-scroll">
                  <table class="data-table" aria-label="Approval queue">
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
              <div class="table-card">
                <div class="table-header">
                  <strong>Channel dispatch jobs</strong>
                  <span>Readiness, retry, and channel-specific status</span>
                </div>
                <div class="table-scroll">
                  <table class="data-table" aria-label="Syndication jobs">
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

        <article class="surface-card">
          <div class="section-head">
            <div>
              <div class="section-eyebrow">Repository navigator</div>
              <h2>Trace the answer back to Angular files</h2>
              <p>Prompt suggestions and file explorer are aligned so the citation model feels inspectable instead of magical.</p>
            </div>
            <div class="repo-meta-stack">
              <span class="repo-badge">retailops-pxm-web</span>
              <span class="branch-badge">main</span>
            </div>
          </div>

          <div class="navigator-grid">
            <div class="explorer-card">
              <div class="subhead">
                <strong>File explorer</strong>
                <span>Mock Angular workspace tree</span>
              </div>
              <div class="file-tree" role="tree" aria-label="Project file tree">
                @for (flat of flatNodes; track flat.node.name + flat.depth) {
                  @if (flat.node.type === 'folder') {
                    <div class="tree-folder" [style.padding-left.px]="flat.depth * 14 + 10">
                      <span class="folder-icon">▸</span>
                      <span class="tree-name">{{ flat.node.name }}</span>
                    </div>
                  } @else {
                    <button
                      type="button"
                      class="tree-file"
                      [class.selected]="selectedFile()?.name === flat.node.name"
                      [style.padding-left.px]="flat.depth * 14 + 10"
                      (click)="selectFile(flat.node)">
                      <span class="file-icon">{{ getFileIcon(flat.node.name) }}</span>
                      <span class="tree-name">{{ flat.node.name }}</span>
                    </button>
                  }
                }
              </div>
            </div>

            <div class="code-card">
              <div class="subhead">
                <strong>{{ selectedFile()?.name ?? 'Select a file' }}</strong>
                <span>{{ selectedFile() ? 'Grounding preview' : 'Choose a node from the explorer' }}</span>
              </div>
              <pre class="code-block">{{ selectedFile() ? getSnippet(selectedFile()!) : emptySnippet }}</pre>
            </div>
          </div>
        </article>
      </section>

      <section class="copilot-grid">
        <article class="surface-card prompt-panel">
          <div class="section-head compact">
            <div>
              <div class="section-eyebrow">Suggested operator prompts</div>
              <h2>Ask about implementation, not just concepts</h2>
            </div>
          </div>

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

          <div class="prompt-insight" *ngIf="selectedPrompt() as prompt; else emptyPromptState">
            <div class="insight-grid">
              <div>
                <div class="insight-label">Likely files</div>
                <div class="insight-list">
                  @for (source of prompt.sources; track source.filePath) {
                    <code>{{ source.filePath }}</code>
                  }
                </div>
              </div>
              <div>
                <div class="insight-label">Tool steps</div>
                <div class="insight-stat">{{ prompt.timeline.length }} retrieval steps</div>
              </div>
            </div>
          </div>
          <ng-template #emptyPromptState>
            <div class="empty-insight">
              Pick a prompt chip to see how the workspace, code citations, and copilot transcript line up.
            </div>
          </ng-template>
        </article>

        <article class="surface-card copilot-panel">
          <div class="section-head compact">
            <div>
              <div class="section-eyebrow">Grounded copilot workspace</div>
              <h2>RetailOps PXM navigator</h2>
              <p>Mock retrieval over Angular services, guards, models, and feature folders.</p>
            </div>
          </div>
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
        </article>
      </section>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      padding: 2rem 1.25rem 3rem;
    }

    .sample-page {
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
      border-radius: 1.75rem;
      padding: 1.5rem;
      background:
        radial-gradient(circle at top right, rgba(99, 102, 241, 0.18), transparent 32%),
        radial-gradient(circle at bottom left, rgba(34, 197, 94, 0.12), transparent 26%),
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

    .kpi-strip {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 0.85rem;
    }

    .overview-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
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

    .section-tag,
    .repo-badge,
    .branch-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.4rem 0.75rem;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: var(--bg-muted);
      color: var(--text);
      font-size: 0.84rem;
      font-weight: 700;
      white-space: nowrap;
    }

    .repo-meta-stack {
      display: flex;
      gap: 0.45rem;
      flex-wrap: wrap;
      justify-content: end;
    }

    .branch-badge {
      color: var(--text-subtle);
    }

    .feature-tabs,
    .prompt-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.55rem;
    }

    .feature-tab,
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

    .feature-tab:hover,
    .prompt-chip:hover,
    .feature-tab.active,
    .prompt-chip.active {
      color: var(--accent);
      border-color: var(--border-strong);
      box-shadow: 0 10px 24px rgba(99, 102, 241, 0.12);
      transform: translateY(-1px);
    }

    .surface-body {
      min-height: 420px;
      display: grid;
      align-content: start;
    }

    .dashboard-slab,
    .table-card,
    .explorer-card,
    .code-card,
    .prompt-insight,
    .jobs-panel,
    .info-panel {
      border: 1px solid var(--border);
      background: var(--bg-muted);
      border-radius: 1.1rem;
    }

    .dashboard-slab {
      padding: 1rem 1.05rem;
      display: grid;
      gap: 1rem;
    }

    .dashboard-slab p {
      margin: 0;
      color: var(--text-muted);
      line-height: 1.7;
    }

    .slab-note,
    .subhead span,
    .table-header span,
    .insight-label {
      font-size: 0.74rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-subtle);
    }

    .mini-kpi-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.75rem;
    }

    .mini-kpi {
      padding: 0.9rem;
      border-radius: 0.95rem;
      background: var(--bg-card-solid);
      border: 1px solid var(--border);
      display: grid;
      gap: 0.25rem;
    }

    .mini-kpi strong {
      font-size: 1.1rem;
      color: var(--text);
    }

    .mini-kpi-label,
    .mini-kpi-change {
      font-size: 0.86rem;
      color: var(--text-muted);
    }

    .mini-kpi-change.good {
      color: var(--callout-success-text);
    }

    .table-card {
      display: grid;
      gap: 0.9rem;
      padding: 1rem;
    }

    .table-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .table-header strong,
    .subhead strong {
      font-size: 1rem;
      color: var(--text);
    }

    .table-scroll {
      overflow: auto;
      max-width: 100%;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    .data-table th {
      padding: 0.72rem 0.7rem;
      text-align: left;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-subtle);
      border-bottom: 1px solid var(--border);
      white-space: nowrap;
    }

    .data-table td {
      padding: 0.72rem 0.7rem;
      border-bottom: 1px solid color-mix(in srgb, var(--border) 70%, transparent 30%);
      vertical-align: middle;
      color: var(--text-muted);
    }

    .data-table tr:last-child td {
      border-bottom: none;
    }

    .data-table tr:hover td {
      background: color-mix(in srgb, var(--accent-light) 45%, transparent 55%);
    }

    .sku-cell,
    .field-code,
    .job-name {
      font-family: "JetBrains Mono", ui-monospace, monospace;
    }

    .sku-cell,
    .date-cell {
      white-space: nowrap;
      font-size: 0.84rem;
    }

    .field-code {
      padding: 0.14rem 0.38rem;
      border-radius: 6px;
      background: var(--bg-card-solid);
      border: 1px solid var(--border);
      color: var(--code-inline-text);
      font-size: 0.8rem;
    }

    .bulk-layout {
      display: grid;
      grid-template-columns: minmax(240px, 1.1fr) minmax(240px, 0.9fr);
      gap: 1rem;
    }

    .upload-dropzone {
      padding: 1.4rem;
      border-radius: 1.1rem;
      border: 1.5px dashed var(--border-strong);
      background: color-mix(in srgb, var(--accent-light) 45%, transparent 55%);
      display: grid;
      gap: 0.45rem;
      justify-items: start;
      align-content: center;
      min-height: 260px;
    }

    .upload-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: grid;
      place-items: center;
      background: var(--bg-card-solid);
      border: 1px solid var(--border);
      color: var(--accent);
      font-size: 1.4rem;
      font-weight: 800;
    }

    .upload-dropzone strong {
      font-size: 1.1rem;
      color: var(--text);
    }

    .upload-dropzone span {
      color: var(--text-muted);
      line-height: 1.6;
    }

    .upload-btn {
      margin-top: 0.55rem;
      padding: 0.65rem 1rem;
      border-radius: 999px;
      border: 1px solid var(--border-strong);
      background: var(--bg-card-solid);
      color: var(--accent);
      cursor: pointer;
      font: inherit;
      font-weight: 700;
    }

    .support-stack {
      display: grid;
      gap: 1rem;
      align-content: start;
    }

    .info-panel,
    .jobs-panel {
      padding: 1rem;
    }

    .info-panel ul {
      margin: 0.65rem 0 0;
      padding-left: 1.15rem;
      color: var(--text-muted);
      line-height: 1.7;
    }

    .jobs-panel {
      display: grid;
      gap: 0.6rem;
    }

    .jobs-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .job-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto auto;
      gap: 0.6rem;
      align-items: center;
      padding: 0.8rem 0.9rem;
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

    .navigator-grid {
      display: grid;
      grid-template-columns: minmax(240px, 0.9fr) minmax(0, 1.1fr);
      gap: 1rem;
      min-height: 520px;
    }

    .explorer-card,
    .code-card {
      overflow: hidden;
      display: grid;
      grid-template-rows: auto 1fr;
    }

    .subhead {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.95rem 1rem 0.8rem;
      border-bottom: 1px solid var(--border);
      flex-wrap: wrap;
    }

    .file-tree {
      overflow: auto;
      padding: 0.55rem 0.4rem 0.7rem;
      max-height: 100%;
    }

    .tree-folder,
    .tree-file {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      width: 100%;
      min-height: 34px;
      padding-top: 0.25rem;
      padding-bottom: 0.25rem;
      border-radius: 0.6rem;
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
    }

    .tree-file:hover,
    .tree-file.selected {
      background: var(--accent-light);
      color: var(--accent);
    }

    .tree-file.selected {
      font-weight: 700;
    }

    .folder-icon,
    .file-icon {
      width: 16px;
      flex-shrink: 0;
      text-align: center;
    }

    .tree-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .code-block {
      margin: 0;
      height: 100%;
      min-height: 360px;
      overflow: auto;
      background: var(--code-bg);
      color: var(--code-text);
      padding: 1rem 1.05rem;
      font-size: 0.84rem;
      line-height: 1.65;
      white-space: pre;
      font-family: "JetBrains Mono", ui-monospace, monospace;
    }

    .prompt-panel {
      align-content: start;
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

    .insight-list code,
    .insight-stat {
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

    .empty-snippet,
    .name-cell,
    .issue-cell {
      color: var(--text-muted);
    }

    @media (max-width: 1180px) {
      .hero-card,
      .overview-grid,
      .copilot-grid,
      .navigator-grid,
      .bulk-layout {
        grid-template-columns: 1fr;
      }

      .kpi-strip {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 760px) {
      :host {
        padding: 1.1rem 0.8rem 2rem;
      }

      .sample-page {
        gap: 1rem;
      }

      .hero-card,
      .surface-card {
        padding: 1rem;
        border-radius: 1.15rem;
      }

      .kpi-strip,
      .mini-kpi-grid {
        grid-template-columns: 1fr;
      }

      .section-head,
      .table-header,
      .jobs-header,
      .subhead,
      .insight-grid {
        grid-template-columns: 1fr;
        display: grid;
      }

      .repo-meta-stack {
        justify-content: start;
      }

      .job-row {
        grid-template-columns: 1fr;
        align-items: start;
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
    if (name.endsWith('.service.ts')) return '⚙';
    if (name.endsWith('.component.ts')) return '◻';
    if (name.endsWith('.guard.ts')) return '⊕';
    if (name.endsWith('.model.ts')) return '◇';
    return '•';
  }
}
