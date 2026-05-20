# Tool Registry

`ToolRegistryService` is the frontend-visible catalog of tools, not the final source of execution authority.

Use it to:
- register tools the UI can describe
- determine whether a tool requires approval
- list tool definitions for demo or inspection surfaces

Do not use it to imply that the frontend may directly bypass backend policy enforcement. Real execution should still be backend-governed.
