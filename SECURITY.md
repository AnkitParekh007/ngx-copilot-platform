# Security

## Security Boundary

ngx-copilot-sdk is a **frontend-only rendering SDK**. It renders AI responses, RAG citation cards, tool timelines, and approval gates — it does not call LLM providers, vector databases, or any external service directly.

The security boundary is the adapter pattern:

```
Browser (ngx-copilot-sdk) → Your authenticated backend → LLM provider
```

All provider secrets (API keys, service account tokens) stay on your backend. The browser only communicates with your own API endpoint, which you authenticate with your session token.

---

## Fake Keys in Demo Code

Demo and documentation files in this repository contain intentionally fictional values — things like `your-api-key-here`, `sk-EXAMPLE_KEY`, and illustrative `.example` URLs. **Do not report these as security vulnerabilities** — they are documentation placeholders with no real credentials.

---

## What to Check Before Deploying

- Never put LLM API keys in Angular code, environment files committed to git, or browser-accessible configs
- Set `apiBaseUrl` in `provideCopilot()` to your own backend endpoint, not a provider URL
- Validate session tokens on every request in your backend adapter
- Apply rate limits to your `/api/copilot/chat` endpoint
- Gate all destructive agentic actions behind `ApprovalRequest` and re-verify authorization server-side
- See the [Production Checklist](https://ankitparekh007.github.io/ngx-copilot-sdk/docs/production-checklist) for the full pre-launch checklist

---

## Supported Versions

This package is in preview (`0.1.x`). Only the latest published version receives security fixes. Pin your version and monitor releases.

| Version | Status |
|---|---|
| 0.1.x | Active (preview) |
| < 0.1.0 | Not supported |

---

## Responsible Disclosure

If you find a genuine security issue (e.g., a real credential accidentally committed, a supply-chain issue in a dependency, or an XSS vector in the SDK's rendering):

1. **Do not open a public GitHub issue** — that could expose others before a fix is available
2. Contact the maintainer privately through the GitHub profile or portfolio contact link
3. Include a clear description of the issue, affected versions, and reproduction steps
4. Allow reasonable time for a fix before public disclosure (30 days is customary)

Thank you for helping keep this project safe.
