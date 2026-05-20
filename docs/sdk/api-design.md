# API Design

The SDK is intentionally small. It favors a few stable exported contracts over a large component or service surface that would be hard to support across Angular apps.

## Design Principles

- configuration should be injectable and normalized
- context should be explicit and serializable
- adapters should expose UI-ready shapes
- UI components should stay standalone and composable
- risky actions should be visible in the type system and the UI

## Export Strategy

- models define stable data contracts
- services define extension boundaries
- standalone components demonstrate reference UX without forcing app architecture

## Current API Risk

The UI component inputs are still experimental. They are useful for reference composition now, but should be reviewed before any npm publication promise is made.
