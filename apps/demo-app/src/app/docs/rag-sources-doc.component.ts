import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocsCodeBlockComponent } from './docs-code-block.component';

@Component({
  selector: 'app-rag-sources-doc',
  standalone: true,
  imports: [RouterLink, DocsCodeBlockComponent],
  template: `
    <div class="article-header">
      <div class="header-meta">
        <span class="header-category">Core Concepts</span>
        <span class="badge badge-preview">Preview</span>
      </div>
      <h1>RAG Sources</h1>
      <p class="header-desc">
        Retrieval-Augmented Generation citation cards — file-path references for codebase copilots,
        documentation URLs for knowledge-base copilots.
      </p>
    </div>

    <h2 id="how-it-works">How it works</h2>
    <p>
      When your backend retrieves relevant chunks during a copilot response, it injects them
      as <code>RagResult</code> objects into the event stream. The SDK attaches them to the
      assistant message and renders <code>RagSourceCard</code> components below the answer.
    </p>
    <ol>
      <li>User sends a message — SDK emits it through <code>CopilotBackendAdapter.send()</code>.</li>
      <li>Your backend queries a vector store or search index for relevant chunks.</li>
      <li>Backend emits a <code>rag_sources</code> event with <code>RagResult[]</code> payload.</li>
      <li>SDK displays source cards — each linking to its file path or documentation URL.</li>
    </ol>

    <div class="callout callout-info">
      <div>
        RAG source cards are a UI concern only. The SDK does not perform retrieval itself —
        retrieval happens entirely on your backend. The browser only receives the formatted
        <code>RagResult[]</code> payload to render.
      </div>
    </div>

    <h2 id="file-path-citations">File-path citations (codebase copilot)</h2>
    <p>
      When <code>filePath</code> is set, the source card renders as a code reference showing
      repository, branch, file kind, and path. Use this for codebase navigation copilots
      where users need to locate specific files.
    </p>
    <app-docs-code-block language="typescript" [code]="filePathExample" />

    <h2 id="documentation-citations">Documentation URL citations (docs copilot)</h2>
    <p>
      When <code>sourceUrl</code> is set, the card renders as a documentation article link.
      Use this for product documentation or knowledge-base copilots.
    </p>
    <app-docs-code-block language="typescript" [code]="docUrlExample" />

    <h2 id="hybrid-retrieval">Hybrid retrieval</h2>
    <p>
      A single response can include both codebase and documentation sources simultaneously.
      This is useful for engineering copilots that serve questions spanning both "where is
      the code?" and "what does the spec say?".
    </p>
    <app-docs-code-block language="typescript" [code]="hybridExample" />

    <h2 id="live-examples">Live examples with RetailOps PXM</h2>
    <p>
      Both enterprise sample routes demonstrate RAG citations using fictional <strong>RetailOps PXM</strong>
      mock data — no vector database, no embeddings, no retrieval API is called.
    </p>
    <div class="doc-card-grid">
      <a routerLink="/samples/enterprise-codebase" class="doc-card">
        <strong>Codebase Copilot</strong>
        <span>File-path citations from <code>retailops-pxm-web · main</code>. Covers services, guards, models.</span>
      </a>
      <a routerLink="/samples/enterprise-docs" class="doc-card">
        <strong>Documentation Copilot</strong>
        <span>Article URL citations from <code>docs.retailops-pxm.example</code>. Covers onboarding, syndication, approvals.</span>
      </a>
    </div>

    <h2 id="best-practices">Best practices for trustworthy citations</h2>
    <ul>
      <li><strong>Include a relevance score.</strong> Expose the <code>score</code> field so users can see how confident the retrieval was.</li>
      <li><strong>Keep snippets short.</strong> Aim for 2–4 sentences of context — enough for the user to recognise the source without reading the whole document.</li>
      <li><strong>Provide clickable links.</strong> Set <code>sourceUrl</code> or a working <code>filePath</code> deep-link so users can verify the citation themselves.</li>
      <li><strong>Tag sources semantically.</strong> Use <code>tags</code> and <code>fileKind</code> to group and filter sources in complex retrieval scenarios.</li>
      <li><strong>Rank before injecting.</strong> Send only the top-N results. Flooding the UI with low-score sources erodes user trust.</li>
    </ul>
  `,
})
export class RagSourcesDocComponent {
  readonly filePathExample = `const codeSource: RagResult = {
  id: 'code-bulk-upload',
  title: 'bulk-upload.service.ts',
  snippet: 'Handles CSV parsing, row validation, batch import, and retry logic.',
  score: 0.93,
  sourceType: 'angular-service',
  repo: 'retailops-pxm-web',
  branch: 'main',
  filePath: 'src/app/features/bulk-upload/bulk-upload.service.ts',
  fileKind: 'service',
  tags: ['bulk-upload', 'validation'],
};`;

  readonly docUrlExample = `const docSource: RagResult = {
  id: 'doc-product-onboarding',
  title: 'Product Onboarding',
  snippet: 'Step-by-step guide for creating products in RetailOps PXM.',
  score: 0.92,
  sourceType: 'documentation',
  sourceUrl: 'https://docs.retailops-pxm.example/product-onboarding',
  tags: ['onboarding', 'product'],
};`;

  readonly hybridExample = `// Backend emits both in the same rag_sources event
const mixedSources: RagResult[] = [
  {
    id: 'code-approval-service',
    sourceType: 'angular-service',
    filePath: 'src/app/features/approval/approval.service.ts',
    fileKind: 'service',
    title: 'approval.service.ts',
    snippet: 'Submits ApprovalDecision and updates SKU status.',
    score: 0.91,
  },
  {
    id: 'doc-approval-workflow',
    sourceType: 'documentation',
    sourceUrl: 'https://docs.retailops-pxm.example/approval-workflow',
    title: 'Approval Workflow',
    snippet: 'Describes the four-stage product approval process.',
    score: 0.88,
  },
];`;
}
