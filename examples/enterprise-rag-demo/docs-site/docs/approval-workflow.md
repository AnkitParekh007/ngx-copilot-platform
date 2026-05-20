# Approval Workflow

The approval workflow ensures that all products meet quality standards before being published to sales channels. This document describes the approval process, roles, and configuration options.

## Approval Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     APPROVAL WORKFLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────┐     ┌──────────┐     ┌──────────┐               │
│   │ Validated│────▶│ Assigned │────▶│ Reviewed │               │
│   │   SKU    │     │    to    │     │    by    │               │
│   │          │     │ Approver │     │ Approver │               │
│   └──────────┘     └──────────┘     └────┬─────┘               │
│                                          │                      │
│                         ┌────────────────┼────────────────┐     │
│                         │                │                │     │
│                         ▼                ▼                ▼     │
│                  ┌──────────┐     ┌──────────┐     ┌──────────┐│
│                  │ APPROVED │     │ REJECTED │     │  REQUEST │││
│                  │          │     │          │     │  CHANGES │││
│                  └──────────┘     └──────────┘     └──────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Approval Queue

### Accessing the Queue

1. Navigate to **Approvals** in the sidebar
2. View pending items in your queue
3. Filter by category, priority, or age

### Queue Columns

| Column | Description |
|--------|-------------|
| **SKU** | SKU code and product title |
| **Category** | Product category |
| **Submitted By** | User who submitted for approval |
| **Submitted At** | Date/time of submission |
| **Priority** | High, Medium, Low |
| **Age** | Time in queue |
| **Assignee** | Currently assigned approver |

### Queue Actions

- **Claim** — Assign item to yourself
- **Reassign** — Transfer to another approver
- **Bulk Approve** — Approve multiple items (with caution)
- **Export** — Download queue as CSV

## Approval Process

### Step 1: Review Product Data

When reviewing a SKU, check:

1. **Basic Information**
   - Title accuracy and formatting
   - Brand correctness
   - Category appropriateness

2. **Content Quality**
   - Description completeness
   - Grammar and spelling
   - No prohibited claims

3. **Media Assets**
   - Image quality
   - White background compliance
   - No watermarks

4. **Pricing**
   - Competitive positioning
   - Margin requirements
   - Promotional pricing rules

5. **Channel Readiness**
   - Channel-specific fields complete
   - Taxonomy mappings correct

### Step 2: Make Decision

#### Approve

Click **Approve** when:
- All required fields are complete
- Content meets quality standards
- Images are compliant
- Pricing is appropriate

**Result:** SKU moves to `APPROVED` status

#### Reject

Click **Reject** when:
- Critical issues cannot be auto-fixed
- Content violates policies
- Legal/compliance concerns

**Required:** Rejection reason (selected from list + optional comment)

**Result:** SKU moves to `REJECTED` → `NEEDS_REVISION`

#### Request Changes

Click **Request Changes** when:
- Minor issues need fixing
- Clarification needed from submitter
- Additional information required

**Required:** Specific change requests

**Result:** SKU remains in queue with change request flag

### Step 3: Document Decision

All decisions are logged with:
- Approver identity
- Timestamp
- Decision (approve/reject/changes)
- Comments
- Time spent reviewing

## Rejection Reasons

Standard rejection reasons:

| Code | Reason | Description |
|------|--------|-------------|
| REJ-001 | Incomplete Data | Required fields missing |
| REJ-002 | Poor Image Quality | Images don't meet standards |
| REJ-003 | Inaccurate Content | Description contains errors |
| REJ-004 | Pricing Issue | Price outside acceptable range |
| REJ-005 | Brand Violation | Unauthorized brand use |
| REJ-006 | Legal Concern | Potential legal/compliance issue |
| REJ-007 | Duplicate Product | Product already exists |
| REJ-008 | Category Mismatch | Wrong category assigned |
| REJ-009 | Policy Violation | Violates content policy |
| REJ-010 | Other | Custom reason required |

## Auto-Approval Rules

Certain SKUs can be auto-approved based on rules:

### Eligible Criteria

| Rule | Description |
|------|-------------|
| **Trusted Brand** | Brand has < 1% rejection rate |
| **Low-Risk Category** | Category has < 2% rejection rate |
| **Repeat Submitter** | Submitter has < 1% rejection rate |
| **Price Update Only** | Only price changed, no content |
| **Inventory Update** | Only inventory changed |

### Auto-Approval Configuration

```json
{
  "autoApproval": {
    "enabled": true,
    "rules": {
      "trustedBrands": ["AudioTech", "HomeStyle", "FitWear"],
      "lowRiskCategories": ["Books", "Music", "Movies"],
      "maxPriceChangePercent": 10,
      "requireMinimumSubmissions": 50
    }
  }
}
```

## Escalation

### Escalation Triggers

| Trigger | Threshold | Action |
|---------|-----------|--------|
| **Age** | > 48 hours | Escalate to manager |
| **Reassignment** | > 3 times | Escalate to manager |
| **High Value** | > $1000 MSRP | Require senior approval |
| **New Brand** | First submission | Require brand review |

### Escalation Path

```
Level 1: Approver
    ↓
Level 2: Senior Approver
    ↓
Level 3: Category Manager
    ↓
Level 4: Director
```

## Approval Metrics

### SLA Targets

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| **Average Approval Time** | < 24 hours | > 36 hours |
| **Same-Day Approval Rate** | > 80% | < 60% |
| **Rejection Rate** | < 10% | > 20% |
| **Escalation Rate** | < 5% | > 10% |

### Approver Performance

| Metric | Description |
|--------|-------------|
| **Volume** | Items approved per day |
| **Accuracy** | Post-approval issue rate |
| **Speed** | Average review time |
| **Consistency** | Variance from team decisions |

## Integration with Copilot

The copilot can assist with approvals:

### Ask Mode
> "What are the rejection reasons for SKU WH-BLK-001?"

### Plan Mode
> "Create a plan to review the 50 pending Electronics approvals"

### Agent Mode
> "Open the approval queue and filter by High priority"

## API Reference

### Get Approval Queue

```http
GET /api/approvals?status=pending&assignee=me
```

### Approve SKU

```http
POST /api/approvals/{skuId}/approve
{
  "comment": "All criteria met. Approved for publication.",
  "channels": ["amazon", "shopify"]
}
```

### Reject SKU

```http
POST /api/approvals/{skuId}/reject
{
  "reasonCode": "REJ-002",
  "comment": "Main image has visible watermark. Please upload clean image."
}
```
