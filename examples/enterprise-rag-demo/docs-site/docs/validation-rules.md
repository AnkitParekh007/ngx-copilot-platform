# Validation Rules

RetailOps PXM enforces validation rules to ensure data quality before products can be approved and published. This document describes all validation rules by category.

## Global Validation Rules

These rules apply to ALL products regardless of category:

### Product-Level Rules

| Rule ID | Field | Rule | Severity |
|---------|-------|------|----------|
| PRD-001 | Title | Required, 5-200 characters | Error |
| PRD-002 | Title | No ALL CAPS (max 30% uppercase) | Warning |
| PRD-003 | Brand | Required, must exist in brand registry | Error |
| PRD-004 | Category | Required, must be leaf category | Error |
| PRD-005 | Description | Required, minimum 100 characters | Error |
| PRD-006 | Description | No HTML script tags | Error |
| PRD-007 | Short Description | Maximum 500 characters | Error |
| PRD-008 | Keywords | Maximum 10 keywords, 50 chars each | Warning |

### SKU-Level Rules

| Rule ID | Field | Rule | Severity |
|---------|-------|------|----------|
| SKU-001 | SKU Code | Required, unique across system | Error |
| SKU-002 | SKU Code | Alphanumeric + hyphens only | Error |
| SKU-003 | Price | Required, greater than 0 | Error |
| SKU-004 | Price | Must be greater than Cost | Warning |
| SKU-005 | Cost | Required for margin calculation | Warning |
| SKU-006 | Inventory | Required, non-negative integer | Error |
| SKU-007 | UPC | Valid 12-digit UPC with checksum | Error |
| SKU-008 | EAN | Valid 13-digit EAN with checksum | Error |

### Image Rules

| Rule ID | Rule | Severity |
|---------|------|----------|
| IMG-001 | Minimum 1 image per SKU | Error |
| IMG-002 | Minimum resolution 1000x1000 pixels | Error |
| IMG-003 | Maximum file size 10 MB | Error |
| IMG-004 | Accepted formats: JPEG, PNG, WebP | Error |
| IMG-005 | No watermarks or promotional text | Warning |
| IMG-006 | White background recommended | Warning |

## Category-Specific Rules

### Electronics

| Rule ID | Field | Rule | Severity |
|---------|-------|------|----------|
| ELEC-001 | Voltage | Required for powered devices | Error |
| ELEC-002 | Wattage | Required for powered devices | Error |
| ELEC-003 | Battery Type | Required if battery-powered | Error |
| ELEC-004 | Connectivity | Required (Bluetooth, WiFi, etc.) | Warning |
| ELEC-005 | Warranty | Minimum 1 year required | Error |
| ELEC-006 | Certifications | FCC/CE certification required | Error |

### Apparel

| Rule ID | Field | Rule | Severity |
|---------|-------|------|----------|
| APP-001 | Size | Required, from size chart | Error |
| APP-002 | Color | Required, from color palette | Error |
| APP-003 | Material | Required, with percentages | Error |
| APP-004 | Care Instructions | Required | Error |
| APP-005 | Fit Type | Required (Regular, Slim, etc.) | Warning |
| APP-006 | Size Chart Image | Required for size variants | Warning |

### Food & Beverage

| Rule ID | Field | Rule | Severity |
|---------|-------|------|----------|
| FOOD-001 | Ingredients | Required, in descending order | Error |
| FOOD-002 | Allergens | Required allergen declaration | Error |
| FOOD-003 | Nutrition Facts | Required per FDA format | Error |
| FOOD-004 | Expiration Policy | Required shelf life info | Error |
| FOOD-005 | Storage Instructions | Required | Warning |
| FOOD-006 | Serving Size | Required for nutrition | Error |

### Home & Garden

| Rule ID | Field | Rule | Severity |
|---------|-------|------|----------|
| HOME-001 | Dimensions | Required (L x W x H) | Error |
| HOME-002 | Weight | Required | Error |
| HOME-003 | Material | Required | Error |
| HOME-004 | Assembly Required | Required (Yes/No) | Warning |
| HOME-005 | Indoor/Outdoor | Required designation | Warning |

## Channel-Specific Rules

### Amazon Marketplace

| Rule ID | Rule | Severity |
|---------|------|----------|
| AMZ-001 | 5 bullet points required | Error |
| AMZ-002 | Bullet points max 500 chars each | Error |
| AMZ-003 | Search terms max 250 bytes | Error |
| AMZ-004 | ASIN or UPC required | Error |
| AMZ-005 | Main image on white background | Error |
| AMZ-006 | No promotional text in images | Error |

### Shopify

| Rule ID | Rule | Severity |
|---------|------|----------|
| SHOP-001 | SEO title max 70 characters | Warning |
| SHOP-002 | SEO description max 320 characters | Warning |
| SHOP-003 | URL handle must be unique | Error |
| SHOP-004 | Variant options max 3 types | Error |
| SHOP-005 | Compare-at price > price | Warning |

### Google Shopping

| Rule ID | Rule | Severity |
|---------|------|----------|
| GOOG-001 | GTIN required (most categories) | Error |
| GOOG-002 | Condition required | Error |
| GOOG-003 | Google product category required | Error |
| GOOG-004 | Shipping weight required | Warning |
| GOOG-005 | Age group required (apparel) | Error |
| GOOG-006 | Gender required (apparel) | Error |

## Validation Severity Levels

| Level | Meaning | Impact |
|-------|---------|--------|
| **Error** | Must be fixed | Blocks validation |
| **Warning** | Should be fixed | Allows validation with notice |
| **Info** | Recommendation | No impact |

## Validation API

Check validation status programmatically:

```http
GET /api/products/{id}/validation
```

Response:
```json
{
  "status": "failed",
  "errors": [
    {
      "ruleId": "IMG-001",
      "field": "images",
      "message": "Minimum 1 image required per SKU",
      "severity": "error",
      "skuId": "WH-BLK-001"
    }
  ],
  "warnings": [
    {
      "ruleId": "PRD-002",
      "field": "title",
      "message": "Title contains excessive uppercase",
      "severity": "warning"
    }
  ]
}
```

## Bypassing Validation

In rare cases, validation can be bypassed:

1. **Admin Override** — Admins can approve despite warnings
2. **Category Exception** — Some categories have relaxed rules
3. **Channel Exception** — Channel-specific rules can be waived

All bypasses are logged in the audit trail with justification required.
