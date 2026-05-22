# Migration Guide

## Migrating to 0.1.0 (first public release)

This is the first published version. There is no prior npm release to migrate from.

If you were using the repo directly (e.g., a git dependency or local copy), align to the scoped package name:

**Before (git dependency or local path):**
```ts
import { provideCopilot } from 'ngx-copilot-sdk';
```

**After (0.1.0 npm release):**
```ts
import { provideCopilot } from '@ankit-parekh-007/ngx-copilot-sdk';
```

Update any `import` statements and `package.json` references to the scoped name `@ankit-parekh-007/ngx-copilot-sdk`.

## Future migration guides

When breaking changes occur in future minor (0.x) or major (1.x) versions, migration steps will be added here as new `## Migrating to X.Y.Z` sections.

Each section will document:
- What changed
- Why it changed
- Exact before/after code examples
- Automated codemod availability (if any)

## Checking for breaking changes

- Read `CHANGELOG.md` for every release before upgrading.
- Run `npm run verify` after upgrading to confirm your build and tests still pass.
- Check `docs/public-api-contract.md` for the current stability classification of each exported symbol.
