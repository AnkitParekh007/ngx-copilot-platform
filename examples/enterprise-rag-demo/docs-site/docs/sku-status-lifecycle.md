# SKU Status Lifecycle

Every SKU in RetailOps PXM moves through a defined status lifecycle. Understanding these statuses is essential for managing product data flow.

## Status Overview

```
                                    ┌─────────────┐
                                    │   DRAFT     │
                                    └──────┬──────┘
                                           │ Submit for Validation
                                           ▼
                              ┌────────────────────────┐
                              │  PENDING_VALIDATION    │
                              └───────────┬────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
                    ▼                     ▼                     │
         ┌──────────────────┐   ┌──────────────────┐           │
         │ VALIDATION_FAILED│   │    VALIDATED     │           │
         └────────┬─────────┘   └────────┬─────────┘           │
                  │                      │ Submit for Approval  │
                  │ Fix & Resubmit       ▼                     │
                  │             ┌──────────────────┐           │
                  └────────────▶│ PENDING_APPROVAL │           │
                                └────────┬─────────┘           │
                                         │                     │
                    ┌────────────────────┼────────────────────┐│
                    │                    │                    ││
                    ▼                    ▼                    ▼│
         ┌──────────────────┐   ┌──────────────────┐  ┌───────────────┐
         │    REJECTED      │   │    APPROVED      │  │ AUTO_APPROVED │
         └────────┬─────────┘   └────────┬─────────┘  └───────┬───────┘
                  │                      │                    │
                  │ Revise               │ Publish            │
                  ▼                      ▼                    │
         ┌──────────────────┐   ┌──────────────────┐         │
         │  NEEDS_REVISION  │   │    PUBLISHED     │◀────────┘
         └────────┬─────────┘   └────────┬─────────┘
                  │                      │
                  │ Resubmit             │ Unpublish / Issue
                  ▼                      ▼
         ┌──────────────────┐   ┌──────────────────┐
         │      DRAFT       │   │    SUSPENDED     │
         └──────────────────┘   └────────┬─────────┘
                                         │ Resolve & Republish
                                         ▼
                                ┌──────────────────┐
                                │    PUBLISHED     │
                                └──────────────────┘
```

## Status Definitions

### 1. DRAFT

**Description:** Initial state for newly created SKUs. Product data is being entered but not yet ready for validation.

**Allowed Actions:**
- Edit all fields
- Upload images
- Add/remove variants
- Delete SKU
- Submit for validation

**Transitions To:**
- `PENDING_VALIDATION` — When submitted for validation

---

### 2. PENDING_VALIDATION

**Description:** SKU has been submitted and is awaiting automated validation checks.

**Allowed Actions:**
- View validation progress
- Cancel validation (returns to Draft)

**Transitions To:**
- `VALIDATED` — All validation rules pass
- `VALIDATION_FAILED` — One or more errors found

**Typical Duration:** 1-5 minutes

---

### 3. VALIDATION_FAILED

**Description:** Automated validation found errors that must be fixed.

**Allowed Actions:**
- View validation errors
- Edit fields to fix errors
- Resubmit for validation

**Transitions To:**
- `PENDING_VALIDATION` — When resubmitted after fixes

---

### 4. VALIDATED

**Description:** SKU passed all validation rules and is ready for human approval.

**Allowed Actions:**
- Submit for approval
- Make minor edits (triggers re-validation)

**Transitions To:**
- `PENDING_APPROVAL` — When submitted for approval
- `PENDING_VALIDATION` — If edited

---

### 5. PENDING_APPROVAL

**Description:** SKU is in the approval queue awaiting review by an authorized approver.

**Allowed Actions:**
- View in approval queue
- Assign to specific approver
- Add comments

**Transitions To:**
- `APPROVED` — Approver approves
- `REJECTED` — Approver rejects
- `AUTO_APPROVED` — Auto-approval rules triggered

**SLA:** 24-48 hours

---

### 6. APPROVED

**Description:** SKU has been approved by a human reviewer and is ready for channel syndication.

**Allowed Actions:**
- Publish to channels
- Schedule publication
- Make minor edits (may require re-approval)

**Transitions To:**
- `PUBLISHED` — When syndicated to channels
- `PENDING_APPROVAL` — If significant edits made

---

### 7. AUTO_APPROVED

**Description:** SKU was automatically approved based on configured rules (e.g., trusted brand, low-risk category).

**Allowed Actions:**
- Same as APPROVED
- Flag for manual review

**Transitions To:**
- `PUBLISHED` — When syndicated

---

### 8. REJECTED

**Description:** Approver rejected the SKU with feedback.

**Allowed Actions:**
- View rejection reason
- View approver comments
- Move to revision

**Transitions To:**
- `NEEDS_REVISION` — When acknowledged

---

### 9. NEEDS_REVISION

**Description:** SKU requires changes based on approver feedback.

**Allowed Actions:**
- Edit fields
- Respond to comments
- Resubmit for validation

**Transitions To:**
- `DRAFT` — When revision starts
- `PENDING_VALIDATION` — When resubmitted

---

### 10. PUBLISHED

**Description:** SKU is live on one or more sales channels.

**Allowed Actions:**
- View channel status
- Unpublish from channels
- Make edits (triggers sync)

**Transitions To:**
- `SUSPENDED` — If compliance issue or channel error

---

### 11. SUSPENDED

**Description:** SKU was published but is now suspended due to an issue.

**Suspension Reasons:**
- Channel compliance violation
- Pricing error
- Inventory discrepancy
- Legal/trademark issue
- Customer complaint

**Allowed Actions:**
- View suspension reason
- Fix underlying issue
- Request reinstatement

**Transitions To:**
- `PUBLISHED` — When issue resolved and republished

---

### 12. ARCHIVED

**Description:** SKU is no longer active but retained for historical records.

**Allowed Actions:**
- View historical data
- Export records
- Restore to Draft

**Transitions To:**
- `DRAFT` — If restored

---

## Status Permissions by Role

| Status | Product Manager | Data Steward | Approver | Channel Manager | Admin |
|--------|----------------|--------------|----------|-----------------|-------|
| DRAFT | Edit | Edit | View | View | Full |
| PENDING_VALIDATION | View | View | View | View | Full |
| VALIDATION_FAILED | Edit | Edit | View | View | Full |
| VALIDATED | Edit | Submit | View | View | Full |
| PENDING_APPROVAL | View | View | Approve/Reject | View | Full |
| APPROVED | View | View | View | Publish | Full |
| PUBLISHED | View | View | View | Manage | Full |
| SUSPENDED | View | View | View | Resolve | Full |

## Bulk Status Operations

For efficiency, status transitions can be performed in bulk:

```http
POST /api/skus/bulk-transition
{
  "skuIds": ["SKU-001", "SKU-002", "SKU-003"],
  "targetStatus": "PENDING_VALIDATION",
  "comment": "Batch submission for Q4 launch"
}
```

## Status Webhooks

Configure webhooks to receive notifications on status changes:

```json
{
  "event": "sku.status.changed",
  "payload": {
    "skuId": "WH-BLK-001",
    "previousStatus": "PENDING_APPROVAL",
    "newStatus": "APPROVED",
    "changedBy": "approver@company.com",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```
