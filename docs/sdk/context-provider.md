# Context Provider

`ContextProviderService` serializes safe frontend context for backend orchestration.

Recommended context inputs:
- current route
- page title
- actor role
- tenant id
- selected record id
- visible field names
- non-sensitive metadata

Context should be whitelisted, predictable, and small enough to debug easily. The frontend should never serialize hidden fields or secrets just because they are present in component state.
