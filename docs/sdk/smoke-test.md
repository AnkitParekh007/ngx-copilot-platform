# Consumer smoke test

Automated smoke test: `npm run smoke:consumer`

## What it does

1. Builds `@ankitparekh007/ngx-copilot-sdk`
2. Runs `npm pack` in `dist/ngx-copilot-sdk`
3. Creates a temporary Angular 20 app under `tmp/consumer-smoke/`
4. Installs the packed tarball
5. Imports `provideCopilot`, `CopilotShellComponent`, `CopilotService`, `normalizeCopilotConfig`, and `getApprovalTone`
6. Runs `ng build --configuration=production`

## When to run

- Before tagging a release
- After changing `public-api.ts` or peer dependency ranges
- In CI (see `.github/workflows/ci.yml`)

## Manual fallback

If the script fails on your machine, follow the same steps manually:

```bash
npm run build
cd dist/ngx-copilot-sdk && npm pack
# create a scratch Angular 20 app, npm install the .tgz, import the SDK, ng build
```
