# Enterprise mock samples

> **Fictional demo data.** RetailOps PXM is not a real product, company, or customer.
> It is designed for open-source SDK demos and does not represent any real employer,
> private repository, or private documentation system. No live repository, LLM,
> vector database, or documentation service is called. All examples use static
> client-side mock data only.

Two routes in the runnable demo app illustrate how the SDK surfaces **enterprise-style** copilot UX—without any real language models, embeddings, vector indexes, or live repository access.

## RetailOps Codebase Copilot

- **Route:** `/samples/enterprise-codebase`
- **Story:** A frontend engineer navigates the `retailops-pxm-web` workspace on `main`, focused on Product Onboarding.
- **What you see:** Suggested prompt chips, mocked chat turns, `RagSourceCard` entries with file-path citations, and a tool timeline (analyze routes, search services, retrieve snippets, draft an answer).
- **Data:** Defined in `enterprise-codebase-showcase.data.ts`; all strings and paths are illustrative.

### Sample questions

- Where is the bulk upload flow implemented?
- Which service submits products for validation?
- Which components handle approval decisions?
- Which guard checks role-based access?

## RetailOps Documentation Copilot

- **Route:** `/samples/enterprise-docs`
- **Story:** Product, QA, and Support readers ask natural-language questions against a documentation-style knowledge base for the RetailOps PXM platform.
- **What you see:** Citation cards linking to mock article URLs on `docs.retailops-pxm.example` (a reserved `.example` domain), plus a documentation-oriented tool timeline (index search, source retrieval, summarized answer).
- **Data:** Defined in `enterprise-docs-website.data.ts`; URLs use the `.example` TLD reserved for documentation purposes and are safe for open-source use.

### Sample questions

- How does product onboarding work?
- What should a user do when syndication fails?
- Explain SKU status lifecycle.
- Which roles can approve products?

## Honest boundaries

- **Mock only:** Chips append canned user/assistant exchanges in the browser. Nothing is retrieved from a private repository, documentation CMS, or SaaS provider.
- **No private references:** All repo names, domains, and product concepts are fictional. The `.example` TLD is reserved per RFC 2606 and safe for demos.
- **Backend-first for real AI:** In production shapes, ingestion, chunking, embeddings, vector search, and API keys stay on **your** services. The Angular SDK renders UI and conforms to adapter contracts such as `CopilotBackendAdapter`.
- **No workflow automation tooling:** This repository does not bundle third-party orchestration or automation products; any scheduling or policy engines remain your organization's choice behind the API gateway.
- **Preview SDK:** These pages are polished for demos and open-source portfolio review, not a claim of production certification.

For run instructions, see the root [README.md](../README.md).
For full RetailOps PXM demo context, see [retailops-pxm-demo.md](retailops-pxm-demo.md).
