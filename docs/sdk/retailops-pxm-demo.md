# RetailOps PXM — Demo Context

> **Fictional demo data.** RetailOps PXM is not a real product, company, or customer.
> It does not represent any real employer, private repository, or private documentation system.
> No live repository, LLM, vector database, or backend service is called at any point.
> All data is static, client-side, and open-source safe.

## What is RetailOps PXM?

RetailOps PXM is a fictional enterprise **Product Experience Management** platform designed to demonstrate how `ngx-copilot-sdk` can be integrated into a realistic, complex Angular application.

The platform manages the full lifecycle of product data across commerce channels:

1. **Product Onboarding** — Create products, select categories, add attributes and media, define variants/SKUs, and submit for validation.
2. **Bulk Upload** — Import products via CSV/XLSX with column mapping, preview validation, error reporting, and retry support.
3. **Validation Center** — Automated and manual validation rules covering required fields, category-specific constraints, image requirements, price checks, and duplicate SKU detection.
4. **Approval Workflow** — Role-based approval flow (Draft → Validation → Review → Approved/Rejected) with full audit trail.
5. **Channel Syndication** — Publish validated products to channels such as Amazon, Shopify, Google Shopping, and B2B portals, with retry logic for failures.
6. **SKU Status Lifecycle** — Twelve-state lifecycle (DRAFT through ARCHIVED) with explicit transition rules.
7. **Dashboard Analytics** — KPI cards for product counts, approval queue depth, failed validations, and channel readiness.
8. **Audit Log** — Immutable record of all actor actions across products, approvals, and syndication jobs.

## Why does it exist?

The SDK (`ngx-copilot-sdk`) is a general-purpose Angular library. To demonstrate it realistically, a demo needs:

- A **plausible Angular codebase** with features, services, guards, models, and routes that a real engineer would navigate.
- A **realistic documentation site** with articles that a PM, QA engineer, or support agent would query.
- **Questions that span both sources** — so the copilot can demonstrate hybrid retrieval (codebase + docs).

RetailOps PXM provides all three without referencing any real company, private repository, or proprietary system.

## Demo scope

| Area | What is included |
|---|---|
| Angular codebase | Mock `Observable`-based services, typed models, functional guards, standalone components |
| Documentation site | Ten markdown articles covering all major platform features |
| Ingestion manifests | `docs-manifest.json`, `codebase-manifest.json`, `sample-questions.json` |
| Domains | `docs.retailops-pxm.example` (RFC 2606 reserved `.example` TLD) |
| API calls | None — all data is returned via `of()` with mock delays |
| LLM / vector DB | None — all copilot answers are static canned responses |

## Fictional data disclaimer

- RetailOps PXM is entirely fictional.
- No real company, employer, client, customer, or product is referenced.
- No private repository names, private documentation URLs, or internal tool names are used.
- All domain names use `.example` (reserved by RFC 2606 for documentation and examples).
- No API keys, secrets, tokens, or credentials are present anywhere in this repo.

## Suggested questions to test

### Documentation copilot (`/samples/enterprise-docs`)

- How does product onboarding work?
- What should a user do when syndication fails?
- Explain SKU status lifecycle.
- Which roles can approve products?
- What are the image requirements for product media?
- What happens when a product is rejected?
- How does the bulk upload error report work?

### Codebase copilot (`/samples/enterprise-codebase`)

- Where is the bulk upload flow implemented?
- Which service submits products for validation?
- Which components handle approval decisions?
- Which guard checks role-based access?
- Which files define the SKU status lifecycle?
- Which service retries failed syndication jobs?
- Where is the approval decision dialog implemented?

### Hybrid (docs + codebase)

- What are the required fields for product onboarding, and where are they validated in code?
- How does the SKU status lifecycle in the docs map to the model files?
- Which Angular service handles the validation rules described in the documentation?

## How this maps to ngx-copilot-sdk

| SDK feature | RetailOps PXM demo usage |
|---|---|
| `CopilotShellComponent` | Rendered in both `/samples/enterprise-codebase` and `/samples/enterprise-docs` |
| `CopilotContext` | Set per route: repo + branch for codebase, docs host for documentation |
| `RagResult` / `RagSourceCard` | File-path citations (codebase) and article-URL citations (docs) |
| `ToolTimelineItem` | Simulated tool steps: analyze routes, search services, retrieve snippets, generate answer |
| `CopilotMessage` | Seed messages + canned Q&A exchanges triggered by prompt chips |
| `CopilotMode` | All four modes available: `ask`, `plan`, `execute`, `debug` |
| `MockCopilotBackendAdapter` | Powers the main live-demo shell at `/` |

See [enterprise-samples.md](enterprise-samples.md) for route-level documentation.
See [architecture.md](architecture.md) for SDK component and adapter architecture.
