import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-retailops-pxm-demo-doc',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="article-header">
      <div class="header-meta">
        <span class="header-category">Examples</span>
        <span class="badge badge-mock-only">Mock only</span>
      </div>
      <h1>RetailOps PXM Demo</h1>
      <p class="header-desc">
        A fictional enterprise Product Experience Management platform used to demonstrate
        ngx-copilot-sdk in a realistic, complex Angular context.
      </p>
    </div>

    <div class="callout callout-danger">
      <div>
        <strong>Fictional data only.</strong> RetailOps PXM is not a real product, company, or customer.
        No live repository, LLM, vector database, or documentation service is called.
        All examples use static client-side mock data. The domain
        <code>docs.retailops-pxm.example</code> uses the RFC 2606 reserved <code>.example</code> TLD.
      </div>
    </div>

    <h2 id="what-is">What is RetailOps PXM?</h2>
    <p>
      RetailOps PXM is a fictional enterprise <strong>Product Experience Management</strong> platform
      built to show how <code>ngx-copilot-sdk</code> behaves in a realistic enterprise Angular workspace.
      The platform spans eight fictional feature areas:
    </p>
    <div class="feature-list">
      <div class="feature-item">
        <strong>Product Onboarding</strong>
        <span>Create, categorise, add attributes and variants.</span>
      </div>
      <div class="feature-item">
        <strong>Bulk Upload</strong>
        <span>CSV/XLSX import with column mapping and error reporting.</span>
      </div>
      <div class="feature-item">
        <strong>Validation Center</strong>
        <span>Required fields, category rules, image requirements.</span>
      </div>
      <div class="feature-item">
        <strong>Approval Workflow</strong>
        <span>Draft → Validated → Reviewed → Approved/Rejected.</span>
      </div>
      <div class="feature-item">
        <strong>Channel Syndication</strong>
        <span>Publish to Amazon, Shopify, Google Shopping, B2B portals.</span>
      </div>
      <div class="feature-item">
        <strong>SKU Status Lifecycle</strong>
        <span>12-state machine from DRAFT through ARCHIVED.</span>
      </div>
      <div class="feature-item">
        <strong>Dashboard Analytics</strong>
        <span>KPI cards, queue depth, failed validation counts.</span>
      </div>
      <div class="feature-item">
        <strong>Audit Log</strong>
        <span>Immutable actor/action record.</span>
      </div>
    </div>

    <h2 id="why-it-exists">Why it exists</h2>
    <p>
      To meaningfully demonstrate a codebase + documentation copilot, you need more than a toy example.
      RetailOps PXM provides three things:
    </p>
    <ul>
      <li>A plausible Angular codebase — services, guards, models, and components an engineer would navigate.</li>
      <li>A realistic documentation site — articles a PM, QA lead, or support agent would query.</li>
      <li>Questions that span both sources — for hybrid retrieval demonstrations.</li>
    </ul>

    <h2 id="live-demos">Live demo routes</h2>
    <div class="doc-card-grid">
      <a routerLink="/samples/enterprise-codebase" class="doc-card">
        <strong>Codebase Copilot</strong>
        <span>
          File-path citations from <code>retailops-pxm-web · main</code>.
          Mock tool timeline shows route analysis, service search, and snippet retrieval.
        </span>
      </a>
      <a routerLink="/samples/enterprise-docs" class="doc-card">
        <strong>Documentation Copilot</strong>
        <span>
          Article URL citations from <code>docs.retailops-pxm.example</code>.
          RAG cards for onboarding, syndication, approval, and SKU status topics.
        </span>
      </a>
    </div>

    <h2 id="sample-questions">Sample questions to try</h2>

    <h3>Codebase copilot questions</h3>
    <ul>
      <li>Where is the bulk upload flow implemented?</li>
      <li>Which service submits products for validation?</li>
      <li>Which components handle approval decisions?</li>
      <li>Which guard checks role-based access?</li>
      <li>How is the SKU status lifecycle modelled?</li>
    </ul>

    <h3>Documentation copilot questions</h3>
    <ul>
      <li>How does product onboarding work?</li>
      <li>What should a user do when syndication fails?</li>
      <li>Explain the SKU status lifecycle.</li>
      <li>Which roles can approve products?</li>
      <li>What happens when validation fails?</li>
    </ul>

    <h3>Hybrid questions (spans both sources)</h3>
    <ul>
      <li>Where is the approval service and what does the approval spec say?</li>
      <li>How is the bulk upload implemented and what does the error guide say?</li>
    </ul>

    <h2 id="technical-scope">Technical scope</h2>
    <p>
      All copilot answers are <strong>static canned responses</strong> keyed to the prompt chips.
      No backend, embeddings, vector DB, or LLM calls are made at any point.
    </p>
    <table>
      <thead><tr><th>Area</th><th>What is included</th></tr></thead>
      <tbody>
        <tr><td>Angular codebase</td><td>Mock Observable services, typed models, functional guards — in <code>examples/retailops-pxm/angular-codebase/</code></td></tr>
        <tr><td>Documentation site</td><td>10 markdown articles — in <code>examples/retailops-pxm/docs-site/docs/</code></td></tr>
        <tr><td>Ingestion manifests</td><td>docs-manifest.json, codebase-manifest.json, sample-questions.json</td></tr>
        <tr><td>Live demo</td><td>Canned response components — in <code>projects/demo-app/src/app/samples/</code></td></tr>
        <tr><td>Domains used</td><td><code>docs.retailops-pxm.example</code> (RFC 2606 reserved .example TLD)</td></tr>
        <tr><td>API calls</td><td>None — all data returned via RxJS <code>of()</code> with mock delays</td></tr>
      </tbody>
    </table>

    <h2 id="what-this-proves">What this proves about ngx-copilot-sdk</h2>
    <ul>
      <li>The SDK renders convincing copilot UIs with real streaming, RAG cards, and tool timelines.</li>
      <li>Codebase and documentation copilots are both supported with different citation card types.</li>
      <li>The mock adapter enables full development and demo flows without any backend or credentials.</li>
      <li>The approval gate pattern works end-to-end with typed decision events.</li>
    </ul>

    <div class="callout callout-info">
      <div>
        <strong>Note:</strong> The RetailOps PXM demo does not claim that ngx-copilot-sdk includes
        a real retrieval pipeline or LLM integration. Retrieval and orchestration happen on your backend.
        The SDK provides the Angular UI layer only.
      </div>
    </div>
  `,
  styles: [`
    .feature-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 0.65rem;
      margin: 1rem 0 1.5rem;
    }

    .feature-item {
      padding: 0.75rem 0.9rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
      background: var(--bg-subtle);
      display: grid;
      gap: 0.2rem;
    }

    .feature-item strong { font-size: 0.875rem; color: var(--text); }
    .feature-item span   { font-size: 0.82rem;  color: var(--text-muted); }
  `],
})
export class RetailOpsPxmDemoDocComponent {}
