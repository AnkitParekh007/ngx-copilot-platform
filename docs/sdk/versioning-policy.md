# Versioning Policy

`@ankit-parekh-007/ngx-copilot-sdk` follows [Semantic Versioning 2.0.0](https://semver.org/).

## Pre-1.0 policy (current)

During the `0.x` series, **minor version bumps may include breaking changes**. This is standard semver pre-release behavior.

- `0.1.x` — patch: bug fixes, documentation, internal refactors with no API change
- `0.2.0` — minor: may add or remove exported symbols, change interface shapes
- `1.0.0` — first stable release; breaking changes only on major bumps after that

## What counts as a breaking change (post-1.0)

- Removing an exported symbol from `public-api.ts`
- Renaming an exported interface, class, or function
- Changing a required input to a component
- Changing the shape of a model interface in a way that breaks existing consumer code
- Dropping Angular peer dependency support for a previously supported major version

## What does NOT count as a breaking change

- Adding new optional fields to an interface
- Adding new exported symbols
- Internal refactors with no public API change
- Documentation updates
- CI/tooling updates

## Angular compatibility cadence

When a new Angular major is released:
- We target support within 60 days.
- The old major stays in the peer dependency range until the next minor bump.
- See [docs/compatibility.md](./compatibility.md) for the full compatibility table.

## Deprecation notices

- Deprecated symbols are marked with `@deprecated` JSDoc and a note in `CHANGELOG.md`.
- They are removed no earlier than the next major version (post-1.0) or next minor (0.x).
