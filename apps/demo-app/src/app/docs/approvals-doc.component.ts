import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocsCodeBlockComponent } from './docs-code-block.component';

@Component({
  selector: 'app-approvals-doc',
  standalone: true,
  imports: [RouterLink, DocsCodeBlockComponent],
  template: `
    <div class="article-header">
      <div class="header-meta">
        <span class="header-category">Core Concepts</span>
        <span class="badge badge-preview">Preview</span>
      </div>
      <h1>Approval Workflows</h1>
      <p class="header-desc">
        Human-in-the-loop confirmation gates that pause AI agent execution and require explicit
        user sign-off before any destructive, irreversible, or high-impact action proceeds.
      </p>
    </div>

    <h2 id="use-cases">Why agentic AI needs approval gates</h2>
    <p>
      Agentic copilots can execute real-world actions — not just answer questions. When a model proposes
      to bulk-delete records, publish to a live sales channel, or trigger an external API on a user's
      behalf, the user must have a clear, intentional opportunity to confirm or reject that action.
      This is the foundation of safe, enterprise-grade agentic AI.
    </p>
    <p>Approval gates are appropriate when the agent proposes to:</p>
    <ul>
      <li>Bulk-change product statuses across a PXM system</li>
      <li>Publish or syndicate products to live commerce channels</li>
      <li>Delete or archive records permanently</li>
      <li>Send notifications or emails on behalf of the user</li>
      <li>Execute multi-step workflows with external side-effects</li>
      <li>Trigger financial transactions or billing changes</li>
    </ul>

    <h2 id="approval-request">ApprovalRequest shape</h2>
    <p>
      Your backend emits an <code>approval_request</code> SSE event containing an
      <code>ApprovalRequest</code> object. The SDK renders a gate card and blocks further
      streaming until the user decides.
    </p>
    <app-docs-code-block language="typescript" [code]="approvalRequestExample" />

    <h2 id="tone-levels">Tone levels</h2>
    <p>
      Use the <code>tone</code> field to communicate severity. The SDK renders each tone
      with a distinct visual treatment:
    </p>
    <table>
      <thead>
        <tr><th>Tone</th><th>Visual</th><th>When to use</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><code>neutral</code></td>
          <td>Default card style</td>
          <td>Low-impact confirmations — report generation, read-only previews, sending a draft.</td>
        </tr>
        <tr>
          <td><code>warning</code></td>
          <td>Amber accent</td>
          <td>Significant but potentially reversible actions — channel publishing, status changes, bulk edits.</td>
        </tr>
        <tr>
          <td><code>destructive</code></td>
          <td>Red accent</td>
          <td>Irreversible actions — bulk deletes, archival, external API calls, financial changes.</td>
        </tr>
      </tbody>
    </table>

    <h2 id="wiring">Wiring in the shell</h2>
    <p>
      When <code>[useService]="true"</code>, the shell handles approval state automatically.
      For manual control, bind <code>[approval]</code> and listen to <code>(approvalDecision)</code>:
    </p>
    <app-docs-code-block language="typescript" [code]="wiringExample" />

    <h2 id="safe-vs-risky">Safe vs risky actions</h2>
    <div class="action-grid">
      <div class="action-col action-safe">
        <div class="action-heading">Safe — no gate needed</div>
        <ul>
          <li>Answering a question</li>
          <li>Summarising a record</li>
          <li>Generating a draft report</li>
          <li>Searching documentation</li>
          <li>Previewing a change plan</li>
        </ul>
      </div>
      <div class="action-col action-risky">
        <div class="action-heading">Risky — gate required</div>
        <ul>
          <li>Publishing products to Amazon</li>
          <li>Deleting 47 SKU records</li>
          <li>Sending email notifications</li>
          <li>Archiving approved products</li>
          <li>Triggering a billing change</li>
        </ul>
      </div>
    </div>

    <h2 id="live-example">Live example</h2>
    <p>
      The <a routerLink="/showcase">Component Showcase</a> includes three approval states:
      <code>approval-pending</code>, <code>approval-approved</code>, and
      <code>approval-rejected</code>.
    </p>

    <div class="callout callout-success">
      <div>
        <strong>Enterprise-safe by design.</strong> Approval gates give users full agency over
        consequential actions before execution. Always surface a gate for operations that cannot
        be easily undone. When in doubt, use <code>tone: 'warning'</code>.
      </div>
    </div>
  `,
  styles: [`
    .action-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.85rem;
      margin: 1.25rem 0 1.5rem;
    }

    @media (max-width: 520px) { .action-grid { grid-template-columns: 1fr; } }

    .action-col {
      padding: 1rem 1.1rem;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
    }

    .action-safe   { background: var(--callout-success-bg); border-color: var(--callout-success-border); }
    .action-risky  { background: var(--callout-danger-bg);  border-color: var(--callout-danger-border); }

    .action-heading {
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 0.5rem;
    }

    .action-safe  .action-heading { color: var(--callout-success-text); }
    .action-risky .action-heading { color: var(--callout-danger-text); }

    .action-col ul {
      margin: 0;
      padding-left: 1.1rem;
      font-size: 0.85rem;
    }

    .action-safe  ul { color: var(--callout-success-text); }
    .action-risky ul { color: var(--callout-danger-text); }
  `],
})
export class ApprovalsDocComponent {
  readonly approvalRequestExample = `const request: ApprovalRequest = {
  id: 'approval-syndicate-all',
  title: 'Syndicate 47 products to Amazon',
  description:
    'This will publish all APPROVED products to your Amazon Seller Central account. ' +
    'Products already in SYNDICATED state will be skipped. ' +
    'This action cannot be undone from the copilot.',
  tone: 'warning',    // 'neutral' | 'warning' | 'destructive'
  requestedAt: new Date().toISOString(),
};`;

  readonly wiringExample = `// Template
// <ngx-copilot-shell
//   [approval]="pendingApproval"
//   (approvalDecision)="onDecision($event)" />

pendingApproval: ApprovalRequest | undefined;

onDecision(decision: ApprovalDecision): void {
  if (decision.approved) {
    this.executeSyndication();
  }
  this.pendingApproval = undefined; // dismiss the gate
}`;
}
