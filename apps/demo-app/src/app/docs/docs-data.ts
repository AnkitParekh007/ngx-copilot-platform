/** Navigation and search data for the ngx-copilot-sdk documentation site. */

export interface NavItem {
  label: string;
  path: string;
  badge?: string;
}

export interface NavSection {
  section: string;
  icon: string;
  items: NavItem[];
}

export interface DocHeading {
  id: string;
  label: string;
  level: 2 | 3;
}

export interface DocPage {
  path: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  headings: DocHeading[];
  editPath: string;
  badge?: 'stable' | 'preview' | 'mock-only' | 'frontend-safe' | 'backend-required' | string;
  prev?: { label: string; path: string };
  next?: { label: string; path: string };
}

export const SIDEBAR_NAV: NavSection[] = [
  {
    section: 'Getting Started',
    icon: '🚀',
    items: [
      { label: 'Introduction', path: '/docs' },
      { label: 'Installation', path: '/docs/getting-started' },
      { label: 'Configuration', path: '/docs/configuration' },
    ],
  },
  {
    section: 'Core Concepts',
    icon: '🧩',
    items: [
      { label: 'Backend Adapters', path: '/docs/adapters' },
      { label: 'RAG Sources', path: '/docs/rag-sources' },
      { label: 'Tool Timeline', path: '/docs/tool-timeline' },
      { label: 'Approval Workflows', path: '/docs/approvals' },
    ],
  },
  {
    section: 'API Reference',
    icon: '📖',
    items: [
      { label: 'Full API Reference', path: '/docs/api' },
    ],
  },
  {
    section: 'Examples',
    icon: '🎮',
    items: [
      { label: 'Component Showcase', path: '/showcase' },
      { label: 'Codebase Copilot', path: '/samples/enterprise-codebase' },
      { label: 'Documentation Copilot', path: '/samples/enterprise-docs' },
      { label: 'RetailOps PXM Demo', path: '/docs/retailops-pxm-demo' },
    ],
  },
  {
    section: 'Production Guidance',
    icon: '🔐',
    items: [
      { label: 'Production Checklist', path: '/docs/production-checklist' },
      { label: 'Backend Contract', path: '/docs/backend-contract' },
    ],
  },
];

/** Ordered list of all documentation pages — used for search + prev/next navigation. */
export const DOCS_PAGES: DocPage[] = [
  {
    path: '/docs',
    title: 'Introduction',
    description: 'What ngx-copilot-sdk is, what it does, and who it is for.',
    category: 'Getting Started',
    tags: ['overview', 'intro', 'copilot', 'angular', 'sdk', 'rag', 'approval', 'shell'],
    headings: [
      { id: 'what-is', label: 'What is ngx-copilot-sdk?', level: 2 },
      { id: 'features', label: "What's included", level: 2 },
      { id: 'choose-path', label: 'Choose your path', level: 2 },
      { id: 'preview-status', label: 'Preview status', level: 2 },
      { id: 'screenshots', label: 'Screenshots (placeholders)', level: 2 },
      { id: 'retailops-demo', label: 'Live enterprise demo', level: 2 },
    ],
    editPath: 'projects/demo-app/src/app/docs/docs-home.component.ts',
    badge: 'preview',
    next: { label: 'Installation', path: '/docs/getting-started' },
  },
  {
    path: '/docs/getting-started',
    title: 'Installation',
    description: 'Install the SDK, configure providers, and render your first copilot shell.',
    category: 'Getting Started',
    tags: ['install', 'npm', 'angular', 'provideCopilot', 'setup', 'mock adapter', 'quick start'],
    headings: [
      { id: 'install', label: 'Install', level: 2 },
      { id: 'configure', label: 'Configure providers', level: 2 },
      { id: 'add-shell', label: 'Add the copilot shell', level: 2 },
      { id: 'mock-backend', label: 'Mock backend', level: 2 },
      { id: 'security', label: 'Security', level: 2 },
    ],
    editPath: 'projects/demo-app/src/app/docs/getting-started-doc.component.ts',
    badge: 'preview',
    prev: { label: 'Introduction', path: '/docs' },
    next: { label: 'Configuration', path: '/docs/configuration' },
  },
  {
    path: '/docs/configuration',
    title: 'Configuration',
    description: 'All CopilotConfig options: apiBaseUrl, modes, and feature flags.',
    category: 'Getting Started',
    tags: ['configuration', 'apiBaseUrl', 'mode', 'enableRagSources', 'enableApprovals', 'enableToolTimeline'],
    headings: [
      { id: 'full-example', label: 'Full example', level: 2 },
      { id: 'options', label: 'Options reference', level: 2 },
      { id: 'backend-url', label: 'Backend URL', level: 2 },
      { id: 'theme-support', label: 'Theme support', level: 2 },
    ],
    editPath: 'projects/demo-app/src/app/docs/configuration-doc.component.ts',
    badge: 'stable',
    prev: { label: 'Installation', path: '/docs/getting-started' },
    next: { label: 'Backend Adapters', path: '/docs/adapters' },
  },
  {
    path: '/docs/adapters',
    title: 'Backend Adapters',
    description: 'MockCopilotBackendAdapter, HttpCopilotBackendAdapter, and custom adapter implementations.',
    category: 'Core Concepts',
    tags: ['adapter', 'mock', 'http', 'backend', 'streaming', 'observable', 'custom', 'provider secrets'],
    headings: [
      { id: 'why-adapters', label: 'Why adapters?', level: 2 },
      { id: 'mock-adapter', label: 'MockCopilotBackendAdapter', level: 2 },
      { id: 'http-adapter', label: 'HttpCopilotBackendAdapter', level: 2 },
      { id: 'custom-adapters', label: 'Custom adapters', level: 2 },
      { id: 'custom-adapters', label: 'Security boundary', level: 2 },
    ],
    editPath: 'projects/demo-app/src/app/docs/adapters-doc.component.ts',
    badge: 'preview',
    prev: { label: 'Configuration', path: '/docs/configuration' },
    next: { label: 'RAG Sources', path: '/docs/rag-sources' },
  },
  {
    path: '/docs/rag-sources',
    title: 'RAG Sources',
    description: 'Citation cards for file-path citations (codebase) and URL citations (documentation).',
    category: 'Core Concepts',
    tags: ['rag', 'sources', 'citations', 'file path', 'documentation', 'RagResult', 'RagSourceCard'],
    headings: [
      { id: 'how-it-works', label: 'How it works', level: 2 },
      { id: 'file-path-citations', label: 'File-path citations', level: 2 },
      { id: 'documentation-citations', label: 'Documentation citations', level: 2 },
      { id: 'hybrid-retrieval', label: 'Hybrid retrieval', level: 2 },
      { id: 'live-examples', label: 'Live examples', level: 2 },
      { id: 'best-practices', label: 'Best practices', level: 2 },
    ],
    editPath: 'projects/demo-app/src/app/docs/rag-sources-doc.component.ts',
    badge: 'preview',
    prev: { label: 'Backend Adapters', path: '/docs/adapters' },
    next: { label: 'Tool Timeline', path: '/docs/tool-timeline' },
  },
  {
    path: '/docs/tool-timeline',
    title: 'Tool Timeline',
    description: 'Visualizing multi-step agent tool calls with status indicators and timing.',
    category: 'Core Concepts',
    tags: ['tool timeline', 'agent', 'steps', 'status', 'ToolTimelineItem', 'running', 'succeeded', 'failed'],
    headings: [
      { id: 'timeline-item', label: 'ToolTimelineItem shape', level: 2 },
      { id: 'status-meanings', label: 'Status values', level: 2 },
      { id: 'typical-sequence', label: 'Typical agent sequence', level: 2 },
      { id: 'wiring', label: 'Passing timeline to the shell', level: 2 },
      { id: 'live-examples', label: 'Live examples', level: 2 },
      { id: 'why-timeline', label: 'Why this builds trust', level: 2 },
    ],
    editPath: 'projects/demo-app/src/app/docs/tool-timeline-doc.component.ts',
    badge: 'preview',
    prev: { label: 'RAG Sources', path: '/docs/rag-sources' },
    next: { label: 'Approval Workflows', path: '/docs/approvals' },
  },
  {
    path: '/docs/approvals',
    title: 'Approval Workflows',
    description: 'User-gated action confirmation gates for enterprise-safe agentic workflows.',
    category: 'Core Concepts',
    tags: ['approval', 'gate', 'confirmation', 'destructive', 'enterprise', 'workflow', 'ApprovalRequest', 'tone'],
    headings: [
      { id: 'use-cases', label: 'Why approvals matter', level: 2 },
      { id: 'approval-request', label: 'ApprovalRequest shape', level: 2 },
      { id: 'tone-levels', label: 'Tone levels', level: 2 },
      { id: 'wiring', label: 'Wiring in the shell', level: 2 },
      { id: 'safe-vs-risky', label: 'Safe vs risky actions', level: 2 },
      { id: 'live-example', label: 'Live example', level: 2 },
    ],
    editPath: 'projects/demo-app/src/app/docs/approvals-doc.component.ts',
    badge: 'preview',
    prev: { label: 'Tool Timeline', path: '/docs/tool-timeline' },
    next: { label: 'API Reference', path: '/docs/api' },
  },
  {
    path: '/docs/api',
    title: 'API Reference',
    description: 'All exported interfaces, provider tokens, components, and service APIs.',
    category: 'API Reference',
    tags: ['api', 'interface', 'CopilotShellComponent', 'CopilotService', 'RagResult', 'ToolTimelineItem', 'ApprovalRequest', 'CopilotMode'],
    headings: [
      { id: 'provide-copilot', label: 'provideCopilot', level: 2 },
      { id: 'copilot-shell', label: 'CopilotShellComponent', level: 2 },
      { id: 'copilot-service', label: 'CopilotService', level: 2 },
      { id: 'backend-adapter', label: 'CopilotBackendAdapter', level: 2 },
      { id: 'rag-result', label: 'RagResult', level: 2 },
      { id: 'tool-timeline-item', label: 'ToolTimelineItem', level: 2 },
      { id: 'approval-models', label: 'ApprovalRequest', level: 2 },
      { id: 'copilot-mode', label: 'CopilotMode', level: 2 },
      { id: 'copilot-context', label: 'CopilotContext', level: 2 },
    ],
    editPath: 'projects/demo-app/src/app/docs/api-doc.component.ts',
    badge: 'preview',
    prev: { label: 'Approval Workflows', path: '/docs/approvals' },
    next: { label: 'RetailOps PXM Demo', path: '/docs/retailops-pxm-demo' },
  },
  {
    path: '/docs/retailops-pxm-demo',
    title: 'RetailOps PXM Demo',
    description: 'Fictional enterprise demo data for testing codebase + documentation copilot behavior.',
    category: 'Examples',
    tags: ['retailops', 'pxm', 'demo', 'fictional', 'codebase', 'documentation', 'rag', 'mock', 'sample'],
    headings: [
      { id: 'what-is', label: 'What is RetailOps PXM?', level: 2 },
      { id: 'why-it-exists', label: 'Why it exists', level: 2 },
      { id: 'live-demos', label: 'Live demo routes', level: 2 },
      { id: 'sample-questions', label: 'Sample questions', level: 2 },
      { id: 'technical-scope', label: 'Technical scope', level: 2 },
      { id: 'what-this-proves', label: 'What this proves', level: 2 },
    ],
    editPath: 'projects/demo-app/src/app/docs/retailops-pxm-demo-doc.component.ts',
    badge: 'mock-only',
    prev: { label: 'API Reference', path: '/docs/api' },
    next: { label: 'Production Checklist', path: '/docs/production-checklist' },
  },
  {
    path: '/docs/production-checklist',
    title: 'Production Checklist',
    description: 'Everything you need to verify before shipping an ngx-copilot-sdk integration to production.',
    category: 'Production Guidance',
    tags: ['production', 'checklist', 'security', 'api key', 'auth', 'cancellation', 'retries', 'rag', 'approval', 'audit', 'accessibility', 'testing', 'versioning'],
    headings: [
      { id: 'api-key-safety', label: 'API key safety', level: 2 },
      { id: 'backend-provider-calls', label: 'Backend-only provider orchestration', level: 2 },
      { id: 'auth-session', label: 'Auth / session token per request', level: 2 },
      { id: 'request-cancellation', label: 'Request cancellation', level: 2 },
      { id: 'retries-timeouts', label: 'Retries and timeouts', level: 2 },
      { id: 'rag-quality', label: 'RAG citation quality', level: 2 },
      { id: 'approval-gating', label: 'Approval gating', level: 2 },
      { id: 'audit-logging', label: 'Audit logging', level: 2 },
      { id: 'accessibility', label: 'Accessibility', level: 2 },
      { id: 'test-strategy', label: 'Test strategy', level: 2 },
      { id: 'versioning', label: 'SDK versioning', level: 2 },
    ],
    editPath: 'projects/demo-app/src/app/docs/production-checklist-doc.component.ts',
    badge: 'backend-required',
    prev: { label: 'RetailOps PXM Demo', path: '/docs/retailops-pxm-demo' },
    next: { label: 'Backend Contract', path: '/docs/backend-contract' },
  },
  {
    path: '/docs/backend-contract',
    title: 'Backend Contract',
    description: 'The HTTP API and SSE event format your backend must implement for ngx-copilot-sdk to work in production.',
    category: 'Production Guidance',
    tags: ['backend', 'contract', 'sse', 'streaming', 'http', 'api', 'events', 'rag', 'tool', 'approval', 'error', 'done'],
    headings: [
      { id: 'chat-endpoint', label: 'Chat endpoint', level: 2 },
      { id: 'request-model', label: 'Request model', level: 2 },
      { id: 'response-events', label: 'SSE response event stream', level: 2 },
      { id: 'rag-payload', label: 'RAG sources event', level: 2 },
      { id: 'tool-payload', label: 'Tool step event', level: 2 },
      { id: 'approval-payload', label: 'Approval request event', level: 2 },
      { id: 'error-payload', label: 'Error event', level: 2 },
      { id: 'done-event', label: 'Done event', level: 2 },
    ],
    editPath: 'projects/demo-app/src/app/docs/backend-contract-doc.component.ts',
    badge: 'backend-required',
    prev: { label: 'Production Checklist', path: '/docs/production-checklist' },
  },
];

export const GITHUB_EDIT_BASE =
  'https://github.com/AnkitParekh007/ngx-copilot-platform/edit/main/';
