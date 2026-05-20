/** Mock data for the RetailOps PXM documentation demo. All data is static/fictional. */

export interface DocSection {
  heading: string;
  body: string;
}

export interface DocTable {
  caption?: string;
  headers: string[];
  rows: string[][];
}

export interface DocsArticle {
  id: string;
  title: string;
  category: string;
  badge: string;
  intro: string;
  sections: DocSection[];
  table?: DocTable;
}

export interface DocsRagSource {
  title: string;
  url: string;
  snippet: string;
  score: number;
}

export interface DocsPrompt {
  text: string;
  answer: string;
  sourceIds: string[];
  timeline: Array<{ toolName: string; summary: string; status: 'succeeded' | 'running' | 'failed'; }>;
}

export const DOCS_ARTICLES: DocsArticle[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    category: 'Onboarding',
    badge: 'Start here',
    intro: 'Welcome to RetailOps PXM. This guide walks you through your first product creation, workspace navigation, and key concepts you need to get productive fast.',
    sections: [
      {
        heading: 'Workspace Overview',
        body: 'The RetailOps PXM workspace is organized into five primary areas: Dashboard, Product Catalog, Bulk Import, Approval Queue, and Channel Syndication. Use the left-hand navigation to move between areas. Your role determines which features are visible and actionable.',
      },
      {
        heading: 'Creating Your First Product',
        body: 'Navigate to Product Catalog → New Product. Fill in the required fields: Name, Category, Brand, and Description (minimum 100 characters). Upload at least one primary image. Click "Save as Draft" to preserve your work before submitting for validation.',
      },
      {
        heading: 'Understanding Statuses',
        body: 'Every product moves through a defined set of statuses: DRAFT, VALIDATION_PENDING, READY_FOR_REVIEW, APPROVED, and SYNDICATED. You cannot skip statuses — each transition is enforced by the system. See the SKU Status Lifecycle article for the full state machine.',
      },
    ],
  },
  {
    id: 'product-onboarding',
    title: 'Product Onboarding',
    category: 'Core Workflows',
    badge: 'Core',
    intro: 'Product onboarding is the process of creating, enriching, and validating a new SKU before it enters the approval workflow. A complete onboarding record reduces validation failures and speeds up time-to-syndication.',
    sections: [
      {
        heading: 'Required Fields',
        body: 'Every product must have: a unique name (3–255 characters), a category selection from the taxonomy tree, a registered brand name, a description of at least 100 characters, at least one primary image (JPEG or PNG, minimum 800×800px), and at least one variant with a valid SKU code, price, and stock quantity.',
      },
      {
        heading: 'Submitting for Validation',
        body: 'Once all required fields are complete, click "Submit for Validation". The system will run automated checks within a few minutes and either advance the product to READY_FOR_REVIEW (if all checks pass) or return it to DRAFT with a list of validation errors. You can also manually trigger re-validation from the Validation Center.',
      },
      {
        heading: 'Media Requirements',
        body: 'Images must be at least 800×800px, in JPEG or PNG format, and under 10MB each. The primary image is shown in channel listings. Additional images are used in gallery views. Alt text is required for all images for accessibility compliance.',
      },
    ],
  },
  {
    id: 'bulk-upload',
    title: 'Bulk Upload',
    category: 'Core Workflows',
    badge: 'Power users',
    intro: 'Bulk Upload lets you create or update many products at once using a CSV or XLSX file. It is the fastest way to onboard large product catalogs. The system processes files asynchronously and provides a detailed error report for any failed rows.',
    sections: [
      {
        heading: 'Preparing Your File',
        body: 'Download the import template from Bulk Upload → Download Template. The template includes all required and optional columns with example values and inline documentation. Remove example rows before uploading. All required fields must have values — blank required cells cause row-level failures.',
      },
      {
        heading: 'Upload and Processing',
        body: 'Go to Bulk Upload → New Import, select your file, and click Upload. The system accepts files up to 50MB or 10,000 rows per job. Processing typically takes 2–5 minutes. You will receive an in-app notification when processing is complete. Refresh the job status page to see results.',
      },
      {
        heading: 'Error Reports',
        body: 'If any rows fail, click "Download Error Report" to get a CSV with the original row data plus an additional "error" column describing the problem. Fix the issues in the error report file and re-upload only the failed rows to avoid duplicating successful products.',
      },
    ],
  },
  {
    id: 'validation-rules',
    title: 'Validation Rules',
    category: 'Core Workflows',
    badge: 'Reference',
    intro: 'Validation rules are the automated checks that a product must pass before it can be submitted for human review. Understanding these rules helps you create compliant products on the first attempt.',
    sections: [
      {
        heading: 'Field-Level Rules',
        body: 'Each field has type, length, and format rules. Name must be between 3 and 255 characters. Description must be at least 100 characters. SKU codes must be alphanumeric and unique within your tenant. Price must be a positive decimal with up to 2 decimal places. Weight must not exceed 20kg for standard categories.',
      },
      {
        heading: 'Category-Specific Rules',
        body: 'Some categories enforce additional rules. Apparel products require size and color attributes. Electronics require a warranty period and voltage specification. Food products require ingredient lists and allergen declarations. Rules are defined per category in the taxonomy settings and updated periodically.',
      },
      {
        heading: 'Validation Severity Levels',
        body: 'Errors block submission — the product cannot progress until all errors are resolved. Warnings are informational — they do not block submission but may reduce channel readiness scores. You can view all warnings in the Validation Center after submission.',
      },
    ],
  },
  {
    id: 'approval-workflow',
    title: 'Approval Workflow',
    category: 'Core Workflows',
    badge: 'Role-based',
    intro: 'The approval workflow ensures that products are reviewed by authorized team members before they are published to sales channels. It provides a governance layer that protects your brand and prevents incorrect data from reaching customers.',
    sections: [
      {
        heading: 'Submitting for Review',
        body: 'Products that pass all validation checks automatically move to READY_FOR_REVIEW. They appear in the Approval Queue for users with the Approver or Admin role. The submitting user receives a notification when the product enters the queue.',
      },
      {
        heading: 'Approver Actions',
        body: 'Approvers can take three actions: Approve (moves product to APPROVED and then READY_FOR_SYNDICATION), Reject (moves product to REJECTED — cannot be resubmitted, must be archived), or Request Changes (moves product to NEEDS_CHANGES — the submitter must revise and resubmit).',
      },
      {
        heading: 'Escalation Rules',
        body: 'If a product sits in the approval queue for more than 5 business days, an automatic escalation email is sent to the team lead. Products pending for more than 10 business days are flagged with a yellow warning badge in the queue. Admins can manually reassign products to a different approver.',
      },
    ],
  },
  {
    id: 'channel-syndication',
    title: 'Channel Syndication',
    category: 'Publishing',
    badge: 'Publishing',
    intro: 'Channel Syndication is the process of publishing approved products to your connected sales channels. Each channel has its own mapping rules, readiness thresholds, and validation requirements that must be satisfied before products can be sent.',
    sections: [
      {
        heading: 'Channel Readiness',
        body: 'Before a product can be syndicated to a channel, it must meet that channel\'s readiness score (typically 80% or above). The readiness score is calculated from channel-specific attribute completeness, image requirements, and taxonomy mapping. View readiness scores per channel in the product detail view under the "Channels" tab.',
      },
      {
        heading: 'Starting a Syndication Job',
        body: 'Go to Channel Syndication → New Job. Select the target channel, choose the products to syndicate (or select all approved products), and click "Start Syndication". The job runs asynchronously. Large jobs with 500+ products may take 15–30 minutes to complete.',
      },
      {
        heading: 'Handling Failures',
        body: 'If a syndication job fails, open the job detail page to see per-product error messages. Common failure reasons include missing channel-required attributes, invalid category mappings, and image format mismatches. Fix the underlying issues and use "Retry Failed Products" to reprocess only the failed products without restarting the entire job.',
      },
    ],
  },
  {
    id: 'sku-status-lifecycle',
    title: 'SKU Status Lifecycle',
    category: 'Reference',
    badge: 'Reference',
    intro: 'Every product in RetailOps PXM moves through a defined lifecycle of statuses. Understanding these statuses and their transitions helps you track products, diagnose issues, and understand what actions are available at each stage.',
    sections: [
      {
        heading: 'Happy Path',
        body: 'The standard progression for a product is: DRAFT → VALIDATION_PENDING → READY_FOR_REVIEW → APPROVED → READY_FOR_SYNDICATION → SYNDICATION_PENDING → SYNDICATED. Each transition is triggered by a specific action or system event. No status can be skipped.',
      },
      {
        heading: 'Error and Recovery States',
        body: 'Products can enter recovery states at two points. VALIDATION_FAILED occurs when automated checks fail — the product is returned to DRAFT for editing. SYNDICATION_FAILED occurs when a channel rejects the product — it returns to READY_FOR_SYNDICATION for retry after fixing the channel-specific issues.',
      },
    ],
    table: {
      caption: 'Complete SKU Status Reference',
      headers: ['Status', 'Description', 'Next Actions', 'Who Triggers'],
      rows: [
        ['DRAFT', 'Product is being edited', 'Submit for Validation, Archive', 'Catalog Manager, Content Editor'],
        ['VALIDATION_PENDING', 'Automated validation running', 'Wait for system', 'System (automatic)'],
        ['VALIDATION_FAILED', 'One or more validation errors', 'Fix errors → re-validate', 'System (automatic)'],
        ['READY_FOR_REVIEW', 'Awaiting human approval', 'Approve, Reject, Request Changes', 'Approver, Admin'],
        ['NEEDS_CHANGES', 'Returned for revision', 'Edit → resubmit', 'Catalog Manager'],
        ['APPROVED', 'Ready for channel assignment', 'Assign to channels', 'Channel Manager, Admin'],
        ['READY_FOR_SYNDICATION', 'All channels assigned', 'Start syndication job', 'Channel Manager'],
        ['SYNDICATION_PENDING', 'Syndication job in progress', 'Wait for system', 'System (automatic)'],
        ['SYNDICATED', 'Live on all assigned channels', 'Archive (optional)', 'Channel Manager, Admin'],
        ['SYNDICATION_FAILED', 'Channel rejected the product', 'Fix issues → retry', 'Channel Manager'],
        ['ARCHIVED', 'Removed from active catalog', 'No further transitions', 'Admin'],
      ],
    },
  },
  {
    id: 'user-roles',
    title: 'User Roles',
    category: 'Reference',
    badge: 'Reference',
    intro: 'RetailOps PXM uses a role-based access control model. Each role grants a specific set of permissions across the platform. Roles are assigned by admins and cannot be self-assigned.',
    sections: [
      {
        heading: 'Role Definitions',
        body: 'There are six roles: Catalog Manager, Content Editor, Approver, Channel Manager, Admin, and Viewer. Each role is designed for a specific job function. Users can only have one role at a time. Contact your admin to change your role.',
      },
      {
        heading: 'Admin Capabilities',
        body: 'Admins inherit all permissions from all other roles. They can additionally manage users and roles, configure channel integrations, modify taxonomy and validation rules, and view all audit logs. Admin access should be restricted to a small number of trusted users.',
      },
    ],
    table: {
      caption: 'Role Permission Matrix',
      headers: ['Permission', 'Catalog Mgr', 'Content Editor', 'Approver', 'Channel Mgr', 'Admin', 'Viewer'],
      rows: [
        ['Create products', '✓', '✓', '—', '—', '✓', '—'],
        ['Edit products', '✓', '✓', '—', '—', '✓', '—'],
        ['Submit for validation', '✓', '✓', '—', '—', '✓', '—'],
        ['Approve/reject products', '—', '—', '✓', '—', '✓', '—'],
        ['Assign to channels', '—', '—', '—', '✓', '✓', '—'],
        ['Start syndication jobs', '—', '—', '—', '✓', '✓', '—'],
        ['Bulk upload', '✓', '—', '—', '—', '✓', '—'],
        ['View all products', '✓', '✓', '✓', '✓', '✓', '✓'],
        ['Manage users/roles', '—', '—', '—', '—', '✓', '—'],
        ['Configure channels', '—', '—', '—', '—', '✓', '—'],
      ],
    },
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    category: 'Support',
    badge: 'Support',
    intro: 'This guide covers the most common issues encountered in RetailOps PXM and step-by-step resolution instructions. If your issue is not covered here, contact support with your job or product ID.',
    sections: [
      {
        heading: 'Product Stuck in Validation',
        body: 'If a product stays in VALIDATION_PENDING for more than 10 minutes, first check the Validation Center for any queued jobs. If the queue is empty, try manually triggering re-validation from the product detail page → Validation tab → "Re-run Validation". If the issue persists, export the product data and contact support with the product ID and the time the issue started.',
      },
      {
        heading: 'Syndication Job Failures',
        body: 'Channel failures are usually caused by one of three issues: missing channel-required attributes (check the channel\'s attribute mapping guide), invalid category mappings (verify the category is mapped in channel settings), or image format mismatches (Amazon requires JPEG only, no transparency). Fix the underlying product data, then use "Retry Failed Products" to reprocess without starting a new job.',
      },
      {
        heading: 'Bulk Upload Errors',
        body: 'The most common bulk upload errors are: duplicate SKU codes (each must be globally unique), missing required columns (the template must not have headers removed), and invalid date formats (use ISO 8601: YYYY-MM-DD). Download the error report CSV, fix the flagged rows, and re-upload only the corrected rows.',
      },
    ],
  },
];

export const DOCS_PROMPTS: DocsPrompt[] = [
  {
    text: 'How does product onboarding work?',
    answer: `Product onboarding in RetailOps PXM follows a structured seven-step flow documented in the **Product Onboarding** article.

1. **Create the product record** — provide name, category, brand, and description (min 100 characters)
2. **Upload media** — at least one primary image (800×800px minimum, JPEG or PNG)
3. **Add variants** — each variant needs a SKU code, price, and stock quantity
4. **Save as draft** — preserves your work before validation
5. **Submit for validation** — triggers automated field-level and category-specific checks
6. **Review validation results** — fix any errors flagged by the Validation Center
7. **Await approval** — once validation passes, the product enters the Approval Queue

See the **Getting Started** article for workspace navigation context, and **Validation Rules** for the full list of field-level checks.`,
    sourceIds: ['getting-started', 'product-onboarding', 'validation-rules'],
    timeline: [
      { toolName: 'Search documentation index', summary: 'Matched onboarding, validation, and getting-started articles.', status: 'succeeded' },
      { toolName: 'Retrieve article sections', summary: 'Extracted required fields, media requirements, and submission steps.', status: 'succeeded' },
      { toolName: 'Summarize with citations', summary: 'Composed PM-friendly step-by-step answer with cross-references.', status: 'succeeded' },
    ],
  },
  {
    text: 'What should a user do when syndication fails?',
    answer: `When a syndication job fails, follow these steps from the **Channel Syndication** and **Troubleshooting** articles:

1. **Open the job detail page** — click the failed job in Channel Syndication → Jobs to see per-product error messages
2. **Identify the root cause** — the three most common reasons are missing channel-required attributes, invalid category mappings, and image format mismatches
3. **Fix the underlying product data** — update the affected products to satisfy channel requirements
4. **Use "Retry Failed Products"** — this reprocesses only the failed products without restarting the entire job, preserving already-syndicated products in the same job

For Amazon specifically: only JPEG images are accepted (no transparency). For B2B portals: all attribute fields defined in the channel mapping must be populated.`,
    sourceIds: ['channel-syndication', 'troubleshooting'],
    timeline: [
      { toolName: 'Search documentation index', summary: 'Matched channel syndication and troubleshooting articles.', status: 'succeeded' },
      { toolName: 'Retrieve failure resolution steps', summary: 'Extracted handling failures section and troubleshooting syndication guidance.', status: 'succeeded' },
      { toolName: 'Summarize with citations', summary: 'Composed actionable resolution steps with channel-specific notes.', status: 'succeeded' },
    ],
  },
  {
    text: 'Explain SKU status lifecycle.',
    answer: `The **SKU Status Lifecycle** article defines eleven states that every product can move through in RetailOps PXM.

**Happy path:**
DRAFT → VALIDATION_PENDING → READY_FOR_REVIEW → APPROVED → READY_FOR_SYNDICATION → SYNDICATION_PENDING → **SYNDICATED**

**Error recovery paths:**
- Validation failures return the product to **DRAFT** (from VALIDATION_FAILED)
- Syndication failures return the product to **READY_FOR_SYNDICATION** (from SYNDICATION_FAILED) for retry

**Terminal states:**
- **ARCHIVED** — product removed from active catalog, no further transitions
- **SYNDICATED** — product is live; can optionally be archived

No status transition can be skipped. Each step is enforced by the system to ensure data quality and governance compliance.`,
    sourceIds: ['sku-status-lifecycle', 'getting-started'],
    timeline: [
      { toolName: 'Search documentation index', summary: 'Matched SKU status lifecycle and getting-started overview articles.', status: 'succeeded' },
      { toolName: 'Retrieve status table', summary: 'Extracted complete status reference table with descriptions and triggers.', status: 'succeeded' },
      { toolName: 'Summarize with citations', summary: 'Composed structured lifecycle explanation with happy path and recovery paths.', status: 'succeeded' },
    ],
  },
  {
    text: 'Which roles can approve products?',
    answer: `According to the **User Roles** article, two roles can approve or reject products:

- **Approver** — has full approve, reject, and request-changes permissions specifically for the approval workflow
- **Admin** — inherits all Approver capabilities plus full system administration rights

**Roles that cannot approve:**
- Catalog Manager — can create and submit products but cannot approve
- Content Editor — can edit product content but cannot approve
- Channel Manager — handles syndication but cannot approve
- Viewer — read-only access, no actions

See the **Approval Workflow** article for the full approval process including escalation rules: products sitting in queue for 5+ business days trigger an automatic team lead notification.`,
    sourceIds: ['user-roles', 'approval-workflow'],
    timeline: [
      { toolName: 'Search documentation index', summary: 'Matched user roles permissions matrix and approval workflow articles.', status: 'succeeded' },
      { toolName: 'Retrieve permission table', summary: 'Extracted role permission matrix and approval workflow escalation rules.', status: 'succeeded' },
      { toolName: 'Summarize with citations', summary: 'Composed role-focused answer with permissions table reference.', status: 'succeeded' },
    ],
  },
];
