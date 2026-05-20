# RetailOps PXM - Enterprise Demo Product

> **Disclaimer: This is fictional demo data. RetailOps PXM is not a real product. All data, company names, SKUs, and content in this directory are fabricated for demonstration purposes only.**

---

## What is RetailOps PXM?

RetailOps PXM is a fictional enterprise **Product Experience Management (PXM)** platform. It is designed to illustrate how a large, realistic Angular codebase combined with rich product documentation behaves when indexed and queried by a **Codebase + Documentation Copilot** built with [ngx-copilot-sdk](https://github.com/AnkitParekh007/ngx-copilot-sdk).

The platform simulates a real-world scenario: a mid-to-large retail organization managing thousands of product SKUs across multiple channels (Amazon, Shopify, Google Shopping, and a B2B portal). The fictional platform covers the full product data lifecycle — from initial draft creation, through validation and multi-step approval, all the way to channel syndication.

---

## Why Does This Exist?

This demo exists to showcase **ngx-copilot-sdk** in a realistic enterprise context. Most copilot demos use trivial examples. RetailOps PXM provides:

- A **multi-feature Angular application** with services, guards, components, pipes, and reactive forms
- **Ten documentation files** covering business workflows, role permissions, validation rules, and troubleshooting
- **Typed data models** with realistic field names and enumerations
- **Ingestion manifests** that can be fed directly into an ngx-copilot-sdk pipeline
- **25+ sample questions** that exercise both codebase and documentation retrieval

This makes it possible to demo copilot behavior that would normally require months of building real product code.

---

## How It Demonstrates Copilot Behavior

When RetailOps PXM content is indexed via ngx-copilot-sdk, the copilot can answer questions across three retrieval modes:

| Mode | Example Question | Source |
|------|-----------------|--------|
| **Docs-only** | "What is the SKU lifecycle?" | `sku-status-lifecycle.md` |
| **Repo-only** | "Which service retries failed syndication?" | `channel-syndication.service.ts` |
| **Hybrid** | "What happens when a product is rejected?" | `approval-workflow.md` + `approval.service.ts` |

The copilot returns relevant code snippets, doc excerpts, and source attribution — all rendered using ngx-copilot-sdk's RAG source card components.

---

## Directory Structure

```
examples/retailops-pxm/
├── README.md                        ← You are here
├── docs-site/
│   └── docs/                        ← 10 documentation files
│       ├── getting-started.md
│       ├── product-onboarding.md
│       ├── bulk-upload.md
│       ├── validation-rules.md
│       ├── approval-workflow.md
│       ├── channel-syndication.md
│       ├── sku-status-lifecycle.md
│       ├── dashboard-analytics.md
│       ├── user-roles-permissions.md
│       └── troubleshooting.md
├── angular-codebase/                ← Full Angular 17 application
│   ├── package.json
│   ├── angular.json
│   ├── tsconfig.json
│   └── src/
│       └── app/
│           ├── core/
│           │   ├── models/
│           │   ├── api/
│           │   └── auth/
│           ├── features/
│           │   ├── dashboard/
│           │   ├── product-onboarding/
│           │   ├── bulk-upload/
│           │   ├── validation-center/
│           │   ├── approval-queue/
│           │   ├── channel-syndication/
│           │   ├── sku-status-tracker/
│           │   └── audit-log/
│           └── shared/
└── ingestion/
    ├── docs-manifest.json
    ├── codebase-manifest.json
    └── sample-questions.json
```

---

## Suggested Test Questions

Use these questions when testing the copilot against this demo content:

### Documentation Questions
1. What is RetailOps PXM and who uses it?
2. What are the steps to onboard a new product?
3. What validation rules apply to Electronics products?
4. What image requirements must a product meet before approval?
5. What happens when a product is rejected?
6. What permissions does a Channel Manager have?
7. How does bulk upload error reporting work?

### Code Questions
1. Where is bulk upload implemented in the Angular codebase?
2. Which service submits products for validation?
3. Which components handle channel syndication?
4. Which service retries failed syndication jobs?
5. Which guard checks role-based access?
6. How are channel field mappings defined in code?

### Hybrid Questions (Docs + Code)
1. What are all 12 SKU statuses and how do they transition?
2. What are the required fields for product onboarding?
3. How does the approval workflow map to the Angular components?
4. How is channel syndication monitored and retried?

---

## Quick Start

### 1. Ingest the Documentation

```bash
curl -X POST http://localhost:3000/api/ingestion/documentation \
  -H "Content-Type: application/json" \
  -d '{
    "url": "file://examples/retailops-pxm/docs-site/docs",
    "source": "retailops-pxm-docs"
  }'
```

### 2. Ingest the Angular Codebase

```bash
curl -X POST http://localhost:3000/api/ingestion/github \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "AnkitParekh007",
    "repo": "AnkitParekh007-ngx-copilot-sdk",
    "branch": "main",
    "paths": ["examples/retailops-pxm/angular-codebase"]
  }'
```

### 3. Test the Copilot

Open your Angular application with the copilot shell and ask:

> "What happens when a product fails validation?"

The copilot should return:
- Documentation excerpts from `validation-rules.md` and `sku-status-lifecycle.md`
- Code references from `validation.service.ts` and `validation-center.page.ts`
- A synthesized answer combining both sources

---

## License

This demo content is part of the ngx-copilot-sdk project and is licensed under MIT.
