import {
  CopilotContext,
  CopilotMessage,
  RagResult,
  ToolTimelineItem,
} from '@ankit-parekh-007/ngx-copilot-sdk';

/** Documentation host used for the mock scenario (illustrative .example domain only). */
export const DOCS_SITE_HOST = 'docs.retailops-pxm.example';

export const enterpriseDocsContext: CopilotContext = {
  route: '/docs/retailops-pxm/copilot',
  title: `Documentation · ${DOCS_SITE_HOST}`,
  userRole: 'Product Manager',
  tenantId: 'docs-readers',
  metadata: {
    documentationSite: DOCS_SITE_HOST,
    productArea: 'RetailOps PXM',
    audienceRoles: ['Product Manager', 'QA', 'Support'],
  },
};

export const DOCS_PROMPT_EXAMPLES: string[] = [
  'How does product onboarding work?',
  'What should a user do when syndication fails?',
  'Explain SKU status lifecycle.',
  'Which roles can approve products?',
];

const ts = (): string => new Date().toISOString();

const base = `https://${DOCS_SITE_HOST}`;

/** Mock doc hub links — no live integration; illustrative .example URLs only. */
export const DOCS_MOCK_SOURCES: RagResult[] = [
  {
    id: 'doc-retailops-overview',
    title: 'RetailOps PXM Overview',
    snippet:
      `Orientation hub for RetailOps PXM users: navigation, roles, and cross-links ` +
      `to product onboarding, channel syndication, and reporting topics.`,
    score: 0.93,
    sourceType: 'documentation',
    sourceUrl: `${base}/getting-started`,
    tags: ['hub', 'overview'],
  },
  {
    id: 'doc-product-onboarding',
    title: 'Product Onboarding',
    snippet:
      `Step-by-step guide for creating products: category selection, required attributes, ` +
      `media upload, variant/SKU creation, draft save, and validation submission.`,
    score: 0.92,
    sourceType: 'documentation',
    sourceUrl: `${base}/product-onboarding`,
    tags: ['onboarding', 'product'],
  },
  {
    id: 'doc-dashboard-analytics',
    title: 'Dashboard Analytics',
    snippet:
      `KPI cards covering product counts by status, approval queue depth, failed validations, ` +
      `channel readiness percentages, and recent import job summaries.`,
    score: 0.89,
    sourceType: 'documentation',
    sourceUrl: `${base}/dashboard-analytics`,
    tags: ['analytics', 'dashboard'],
  },
  {
    id: 'doc-channel-syndication',
    title: 'Channel Syndication',
    snippet:
      `End-to-end syndication journey: channel mapping, readiness checks, publish queue, ` +
      `retry logic, and channel-specific validation rules for Amazon, Shopify, and B2B portals.`,
    score: 0.9,
    sourceType: 'documentation',
    sourceUrl: `${base}/channel-syndication`,
    tags: ['syndication', 'channels'],
  },
  {
    id: 'doc-sku-status-lifecycle',
    title: 'SKU Status Lifecycle',
    snippet:
      `State machine for SKU lifecycle: DRAFT → VALIDATION_PENDING → READY_FOR_REVIEW → ` +
      `APPROVED → READY_FOR_SYNDICATION → SYNDICATED, with transition rules and business logic.`,
    score: 0.91,
    sourceType: 'documentation',
    sourceUrl: `${base}/sku-status-lifecycle`,
    tags: ['SKU', 'lifecycle', 'status'],
  },
  {
    id: 'doc-approval-workflow',
    title: 'Approval Workflow',
    snippet:
      `Role-based approval flow covering draft, validation, review, approval, rejection, ` +
      `and needs-changes states. Includes escalation rules and audit trail details.`,
    score: 0.88,
    sourceType: 'documentation',
    sourceUrl: `${base}/approval-workflow`,
    tags: ['approval', 'workflow', 'roles'],
  },
  {
    id: 'doc-troubleshooting',
    title: 'Troubleshooting',
    snippet:
      `Step-by-step resolution guides for upload failures, SKUs stuck in validation, ` +
      `rejected products, channel sync failures, and missing required attributes.`,
    score: 0.87,
    sourceType: 'documentation',
    sourceUrl: `${base}/troubleshooting`,
    tags: ['troubleshooting', 'errors', 'retry'],
  },
  {
    id: 'doc-user-roles',
    title: 'User Roles and Permissions',
    snippet:
      `Permission matrix for Catalog Manager, Content Editor, Approver, Channel Manager, ` +
      `Admin, and Viewer roles across all RetailOps PXM feature areas.`,
    score: 0.86,
    sourceType: 'documentation',
    sourceUrl: `${base}/user-roles-permissions`,
    tags: ['roles', 'permissions', 'access'],
  },
];

export function buildDocsSeedTimeline(): ToolTimelineItem[] {
  const t = ts();
  return [
    {
      id: 'tl-doc-1',
      toolName: 'Search documentation index',
      summary:
        `Matched RetailOps PXM topics for product onboarding, syndication, analytics, and SKU status lifecycle.`,
      status: 'succeeded',
      startedAt: t,
      finishedAt: t,
    },
    {
      id: 'tl-doc-2',
      toolName: 'Retrieve source articles',
      summary:
        `Lifted structured snippets from canonical documentation articles to ground the answer with citations.`,
      status: 'succeeded',
      startedAt: t,
      finishedAt: t,
    },
    {
      id: 'tl-doc-3',
      toolName: 'Summarize answer with citations',
      summary:
        `Composed a PM / QA / Support-friendly response with inline references to doc URLs.`,
      status: 'succeeded',
      startedAt: t,
      finishedAt: t,
    },
  ];
}

const D = DOCS_MOCK_SOURCES;

const docSeedUser = DOCS_PROMPT_EXAMPLES[0];

export const DOCS_SEED_MESSAGES: CopilotMessage[] = [
  {
    id: 'msg-doc-u-1',
    role: 'user',
    content: docSeedUser,
    createdAt: ts(),
  },
  {
    id: 'msg-doc-a-1',
    role: 'assistant',
    content:
      `Product onboarding in RetailOps PXM follows a seven-step flow: create the product record, ` +
      `select a category, fill required attributes, upload media, add variants/SKUs, save as draft, ` +
      `and submit for validation. See ${D[1].title} for the full field-level guide. ` +
      `Once submitted, the SKU moves to VALIDATION_PENDING and the system runs automated checks.`,
    createdAt: ts(),
    sources: [D[0], D[1]],
  },
];

export function normalizeDocsPrompt(prompt: string): string {
  return prompt.trim().replace(/\s+/g, ' ').toLowerCase();
}

const DOCS_CANNED: Record<string, { reply: string; sources: RagResult[] }> = {
  [normalizeDocsPrompt('How does product onboarding work?')]: {
    reply:
      `Product onboarding follows a seven-step flow documented in ${D[1].title}: ` +
      `create, categorize, add attributes, upload media, add variants, save as draft, then submit for validation. ` +
      `Start from ${D[0].title} for role-based navigation context.`,
    sources: [D[0], D[1]],
  },
  [normalizeDocsPrompt('What should a user do when syndication fails?')]: {
    reply:
      `When syndication fails, check the error code in the Channel Syndication view and follow ` +
      `the retry guidance in ${D[6].title}. Common causes include missing required channel attributes ` +
      `and readiness threshold failures—see ${D[3].title} for channel-specific rules and retry backoff tables.`,
    sources: [D[3], D[6]],
  },
  [normalizeDocsPrompt('Explain SKU status lifecycle.')]: {
    reply:
      `${D[4].title} defines twelve states: DRAFT through ARCHIVED. The happy path is ` +
      `DRAFT → VALIDATION_PENDING → READY_FOR_REVIEW → APPROVED → READY_FOR_SYNDICATION → SYNDICATED. ` +
      `Anchor navigation context in ${D[0].title}.`,
    sources: [D[0], D[4]],
  },
  [normalizeDocsPrompt('Which roles can approve products?')]: {
    reply:
      `According to ${D[7].title}, the Approver role has full approve/reject/request-changes permissions. ` +
      `Admin users inherit all Approver capabilities. Catalog Managers and Content Editors can submit ` +
      `products for review but cannot approve. See ${D[5].title} for the full workflow with escalation rules.`,
    sources: [D[5], D[7]],
  },
};

export interface DocsTurn {
  reply: string;
  sources: RagResult[];
  timeline: ToolTimelineItem[];
}

export function lookupDocsTurn(prompt: string): DocsTurn | undefined {
  const hit = DOCS_CANNED[normalizeDocsPrompt(prompt)];
  if (!hit) {
    return undefined;
  }
  return {
    reply: hit.reply,
    sources: hit.sources.map(s => ({ ...s })),
    timeline: cloneTimeline(buildDocsSeedTimeline()),
  };
}

export const DOCS_FALLBACK_REPLY =
  `Responses here are static mock transcripts paired with citation cards. ` +
  `Plug in your backend adapters to hydrate answers from authenticated documentation search.`;

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
