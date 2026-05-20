import {
  CopilotContext,
  CopilotMessage,
  RagResult,
  ToolTimelineItem,
} from '@ankitparekh007/ngx-copilot-sdk';

/** Normalized workspace metadata for the mock scenario (no real-repo access). */
export const ENTERPRISE_REPO = 'retailops-pxm-web';
export const ENTERPRISE_BRANCH = 'main';

export const enterpriseCodebaseContext: CopilotContext = {
  route: '/retailops-pxm/product-onboarding/copilot',
  title: `Workspace · ${ENTERPRISE_REPO}`,
  userRole: 'Frontend Engineer',
  tenantId: 'engineering',
  metadata: {
    repo: ENTERPRISE_REPO,
    branch: ENTERPRISE_BRANCH,
    appArea: 'Product Onboarding',
    copilotPurpose: 'Code navigation & onboarding for Angular feature areas',
  },
};

/** Example questions shown as chips — answers are mocked locally only. */
export const CODEBASE_PROMPT_EXAMPLES: string[] = [
  'Where is the bulk upload flow implemented?',
  'Which service submits products for validation?',
  'Which components handle approval decisions?',
  'Which guard checks role-based access?',
];

const ts = (): string => new Date().toISOString();

/** Mock citations aligned with RetailOps PXM Angular layout (illustrative only). */
export const CODEBASE_MOCK_SOURCES: RagResult[] = [
  {
    id: 'code-rag-bulk-upload-page',
    title: 'bulk-upload.page.ts',
    snippet:
      `Main page component for the bulk upload feature. Orchestrates the dropzone, ` +
      `preview table, and import flow. Delegates CSV parsing and row validation to BulkUploadService.`,
    score: 0.95,
    sourceType: 'angular-component',
    repo: ENTERPRISE_REPO,
    branch: ENTERPRISE_BRANCH,
    filePath: 'src/app/features/bulk-upload/bulk-upload.page.ts',
    fileKind: 'component',
    chunkId: 'mock-chunk-bulk-upload-page',
    tags: ['bulk-upload', 'Product Onboarding'],
  },
  {
    id: 'code-rag-bulk-upload-service',
    title: 'bulk-upload.service.ts',
    snippet:
      `Handles CSV/XLSX parsing, row-level validation, batch import, error report export, ` +
      `and retry logic for failed rows. Returns Observable streams for each operation.`,
    score: 0.93,
    sourceType: 'angular-service',
    repo: ENTERPRISE_REPO,
    branch: ENTERPRISE_BRANCH,
    filePath: 'src/app/features/bulk-upload/bulk-upload.service.ts',
    fileKind: 'service',
    chunkId: 'mock-chunk-bulk-upload-svc',
    tags: ['bulk-upload', 'Observable', 'validation'],
  },
  {
    id: 'code-rag-validation-service',
    title: 'validation-center.service.ts',
    snippet:
      `Wraps ValidationApiService. Exposes getValidationIssues(productId), runValidation(productId), ` +
      `and getValidationRules(). Called by ProductOnboardingService after submitForValidation().`,
    score: 0.91,
    sourceType: 'angular-service',
    repo: ENTERPRISE_REPO,
    branch: ENTERPRISE_BRANCH,
    filePath: 'src/app/features/validation-center/validation-center.service.ts',
    fileKind: 'service',
    chunkId: 'mock-chunk-validation-svc',
    tags: ['validation', 'Product Onboarding'],
  },
  {
    id: 'code-rag-product-onboarding-service',
    title: 'product-onboarding.service.ts',
    snippet:
      `Business-logic layer wrapping ProductsApiService. Key method: submitForValidation(id) ` +
      `transitions the product to VALIDATION_PENDING and triggers the validation pipeline.`,
    score: 0.9,
    sourceType: 'angular-service',
    repo: ENTERPRISE_REPO,
    branch: ENTERPRISE_BRANCH,
    filePath: 'src/app/features/product-onboarding/product-onboarding.service.ts',
    fileKind: 'service',
    chunkId: 'mock-chunk-onboarding-svc',
    tags: ['onboarding', 'validation', 'submitForValidation'],
  },
  {
    id: 'code-rag-approval-dialog',
    title: 'approval-decision-dialog.component.ts',
    snippet:
      `Modal dialog presenting Approve / Reject / Request Changes actions for products in ` +
      `READY_FOR_REVIEW state. Delegates to ApprovalService with structured decision payloads.`,
    score: 0.89,
    sourceType: 'angular-component',
    repo: ENTERPRISE_REPO,
    branch: ENTERPRISE_BRANCH,
    filePath: 'src/app/features/approval-queue/approval-decision-dialog.component.ts',
    fileKind: 'component',
    chunkId: 'mock-chunk-approval-dialog',
    tags: ['approval', 'decision', 'dialog'],
  },
  {
    id: 'code-rag-approval-service',
    title: 'approval.service.ts',
    snippet:
      `Provides approveProduct(id, comments), rejectProduct(id, reason), and ` +
      `requestChanges(id, feedback). Each method returns Observable<ApprovalDecision> ` +
      `and updates the product status accordingly.`,
    score: 0.88,
    sourceType: 'angular-service',
    repo: ENTERPRISE_REPO,
    branch: ENTERPRISE_BRANCH,
    filePath: 'src/app/features/approval-queue/approval.service.ts',
    fileKind: 'service',
    chunkId: 'mock-chunk-approval-svc',
    tags: ['approval', 'decision'],
  },
  {
    id: 'code-rag-role-guard',
    title: 'role.guard.ts',
    snippet:
      `Functional CanActivateFn that reads required roles from route.data.roles and compares ` +
      `against the current user's role. Admin always passes. Redirects to /unauthorized on failure.`,
    score: 0.94,
    sourceType: 'angular-guard',
    repo: ENTERPRISE_REPO,
    branch: ENTERPRISE_BRANCH,
    filePath: 'src/app/core/auth/role.guard.ts',
    fileKind: 'guard',
    chunkId: 'mock-chunk-role-guard',
    tags: ['guard', 'RBAC', 'auth'],
  },
  {
    id: 'code-rag-sku-status-model',
    title: 'sku-status.model.ts',
    snippet:
      `Defines the SkuStatus union type with all 12 lifecycle states and the ` +
      `SKU_STATUS_TRANSITIONS constant mapping allowed status transitions for business rule enforcement.`,
    score: 0.87,
    sourceType: 'angular-model',
    repo: ENTERPRISE_REPO,
    branch: ENTERPRISE_BRANCH,
    filePath: 'src/app/core/models/sku-status.model.ts',
    fileKind: 'model',
    chunkId: 'mock-chunk-sku-status-model',
    tags: ['SKU', 'status', 'lifecycle', 'model'],
  },
];

export function buildCodebaseSeedTimeline(): ToolTimelineItem[] {
  const t = ts();
  return [
    {
      id: 'tl-code-1',
      toolName: 'Analyze route tree',
      summary:
        `Resolved lazy routes under features/bulk-upload and correlated entry ` +
        `components tied to Product Onboarding.`,
      status: 'succeeded',
      startedAt: t,
      finishedAt: t,
    },
    {
      id: 'tl-code-2',
      toolName: 'Search Angular services',
      summary:
        `Found BulkUploadService at 'src/app/features/bulk-upload/bulk-upload.service.ts' ` +
        `and ProductOnboardingService with submitForValidation method.`,
      status: 'succeeded',
      startedAt: t,
      finishedAt: t,
    },
    {
      id: 'tl-code-3',
      toolName: 'Retrieve source snippets',
      summary:
        `Pulled illustrative snippets from bulk upload feature, validation service, and approval dialog.`,
      status: 'succeeded',
      startedAt: t,
      finishedAt: t,
    },
    {
      id: 'tl-code-4',
      toolName: 'Generate answer',
      summary:
        `Synthesized onboarding-friendly explanation with citations to local file paths.`,
      status: 'succeeded',
      startedAt: t,
      finishedAt: t,
    },
  ];
}

const S = CODEBASE_MOCK_SOURCES;

const SEED_USER = CODEBASE_PROMPT_EXAMPLES[0];

export const CODEBASE_SEED_MESSAGES: CopilotMessage[] = [
  {
    id: 'msg-u-seed-bulk',
    role: 'user',
    content: SEED_USER,
    createdAt: ts(),
  },
  {
    id: 'msg-a-seed-bulk',
    role: 'assistant',
    content:
      `The bulk upload flow is split across two files. ${S[0].filePath} is the page component ` +
      `that orchestrates the dropzone, column mapper, and preview table. ` +
      `${S[1].filePath} handles the heavy lifting: CSV/XLSX parsing, row-level validation, ` +
      `batch import, error report export, and retry for failed rows.`,
    createdAt: ts(),
    sources: [S[0], S[1]],
  },
];

export function normalizeCodebasePrompt(prompt: string): string {
  return prompt.trim().replace(/\s+/g, ' ').toLowerCase();
}

/** Map normalized user question → assistant reply plus citation view. */
const CANNED_MAP: Record<string, { reply: string; sources: RagResult[] }> = {
  [normalizeCodebasePrompt('Where is the bulk upload flow implemented?')]: {
    reply:
      `Bulk upload spans ${S[0].filePath} (page component with dropzone and preview table) ` +
      `and ${S[1].filePath} (service handling CSV parsing, validation, import, and retry). ` +
      `That split keeps UI orchestration in the component and transport/parsing in the service.`,
    sources: [S[0], S[1]],
  },
  [normalizeCodebasePrompt('Which service submits products for validation?')]: {
    reply:
      `${S[3].title} (${S[3].filePath}) is responsible. Its \`submitForValidation(id)\` method ` +
      `calls the products API and transitions the product to VALIDATION_PENDING. ` +
      `${S[2].title} (${S[2].filePath}) then handles the validation rule checks and issue reporting.`,
    sources: [S[3], S[2]],
  },
  [normalizeCodebasePrompt('Which components handle approval decisions?')]: {
    reply:
      `${S[4].title} (${S[4].filePath}) is the modal presenting Approve / Reject / Request Changes ` +
      `for products in READY_FOR_REVIEW state. It delegates to ${S[5].title} (${S[5].filePath}), ` +
      `which provides the three decision methods returning Observable<ApprovalDecision>.`,
    sources: [S[4], S[5]],
  },
  [normalizeCodebasePrompt('Which guard checks role-based access?')]: {
    reply:
      `${S[6].title} (${S[6].filePath}) is the functional CanActivateFn for RBAC. ` +
      `It reads \`route.data.roles\`, compares against the current user's role, and redirects to ` +
      `/unauthorized on failure. Admin always passes regardless of the required roles list.`,
    sources: [S[6]],
  },
};

export interface CodebaseTurn {
  reply: string;
  sources: RagResult[];
  timeline: ToolTimelineItem[];
}

/** Returns a canned narrative for known prompts — otherwise undefined. */
export function lookupCodebaseTurn(prompt: string): CodebaseTurn | undefined {
  const key = normalizeCodebasePrompt(prompt);
  const hit = CANNED_MAP[key];
  if (!hit) {
    return undefined;
  }
  return {
    reply: hit.reply,
    sources: hit.sources.map(s => ({ ...s })),
    timeline: cloneTimeline(buildCodebaseSeedTimeline()),
  };
}

/** Generic assistant reply when the question is unrecognized (still mock-only). */
export const CODEBASE_FALLBACK_REPLY =
  `This sandbox uses mock answers keyed to the four sample prompts. ` +
  `Try a suggestion chip above to see citations refresh. A real codebase copilot would ` +
  `route prompts through your secure backend—not the browser.`;

function cloneTimeline(items: ToolTimelineItem[]): ToolTimelineItem[] {
  return items.map(i => ({
    ...i,
    id: `${i.id}-${suffix()}`,
  }));
}

function suffix(): string {
  if (typeof globalThis.crypto !== 'undefined' && 'randomUUID' in globalThis.crypto) {
    return globalThis.crypto.randomUUID().slice(0, 8);
  }
  return String(Date.now()).slice(-6);
}
