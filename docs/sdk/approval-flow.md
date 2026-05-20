# Approval Flow

The approval layer exists to make risky actions explicit.

Current reference behavior:
- `ApprovalRequest` carries title, reason, summary, risk level, and optional decision
- `ApprovalCardComponent` renders that request and emits approve or reject events
- `getApprovalTone` maps risk and decision state to a presentational tone

This is intentionally UI-first. It demonstrates how an Angular SDK might expose approval composition without claiming a backend workflow engine.
