# Channel Syndication

Channel syndication is the process of publishing approved products to sales channels like Amazon, Shopify, Google Shopping, and B2B portals.

## Supported Channels

| Channel | Type | Integration |
|---------|------|-------------|
| **Amazon** | Marketplace | API (SP-API) |
| **Shopify** | E-commerce | API (GraphQL) |
| **Google Shopping** | Product Ads | Merchant Center Feed |
| **B2B Portal** | Wholesale | Custom API |

## Syndication Workflow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Approved   │────▶│   Channel   │────▶│    Feed     │────▶│  Published  │
│    SKU      │     │   Mapping   │     │  Generation │     │  to Channel │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                           │                   │                   │
                           ▼                   ▼                   ▼
                    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
                    │  Transform  │     │  Validate   │     │   Monitor   │
                    │   Fields    │     │   Against   │     │   Status    │
                    │             │     │   Channel   │     │             │
                    └─────────────┘     └─────────────┘     └─────────────┘
```

## Channel Configuration

### Amazon Seller Central

**Required Configuration:**
- Seller ID
- Marketplace ID
- SP-API credentials (client ID, client secret, refresh token)
- Default fulfillment channel (FBA/FBM)

**Field Mappings:**

| PXM Field | Amazon Field |
|-----------|--------------|
| Title | item_name |
| Description | product_description |
| Bullet Points | bullet_point1-5 |
| Price | standard_price |
| SKU | seller_sku |
| UPC | external_product_id |
| Images | main_image_url, other_image_url1-8 |

### Shopify

**Required Configuration:**
- Store URL
- Admin API access token
- Default location ID
- Inventory tracking settings

**Field Mappings:**

| PXM Field | Shopify Field |
|-----------|---------------|
| Title | title |
| Description | body_html |
| Price | variants.price |
| Compare At Price | variants.compare_at_price |
| SKU | variants.sku |
| Barcode | variants.barcode |
| Images | images |
| SEO Title | metafields_global_title_tag |
| SEO Description | metafields_global_description_tag |

### Google Shopping

**Required Configuration:**
- Merchant Center ID
- Target country
- Content API credentials
- Default shipping settings

**Field Mappings:**

| PXM Field | Google Field |
|-----------|--------------|
| Title | title |
| Description | description |
| Price | price |
| GTIN | gtin |
| Brand | brand |
| Condition | condition |
| Category | google_product_category |
| Image | image_link |
| Availability | availability |

## Syndication Jobs

### Starting a Job

```http
POST /api/syndication/jobs
{
  "skuIds": ["WH-BLK-001", "WH-WHT-001"],
  "channels": ["amazon", "shopify"],
  "options": {
    "updateExisting": true,
    "createNew": true,
    "validateOnly": false
  }
}
```

### Job Status

| Status | Description |
|--------|-------------|
| `QUEUED` | Job is in queue |
| `PROCESSING` | Job is running |
| `COMPLETED` | Job finished successfully |
| `PARTIAL_FAILURE` | Some items failed |
| `FAILED` | Job failed completely |

### Monitoring Jobs

```http
GET /api/syndication/jobs/{jobId}
```

Response:
```json
{
  "jobId": "job-12345",
  "status": "PARTIAL_FAILURE",
  "progress": {
    "total": 100,
    "completed": 95,
    "failed": 5
  },
  "results": [
    {
      "skuId": "WH-BLK-001",
      "channel": "amazon",
      "status": "SUCCESS",
      "channelId": "ASIN123456"
    },
    {
      "skuId": "WH-WHT-001",
      "channel": "amazon",
      "status": "FAILED",
      "error": "Image does not meet minimum resolution"
    }
  ]
}
```

## Error Handling

### Common Errors

| Error Code | Channel | Cause | Resolution |
|------------|---------|-------|------------|
| `IMG_TOO_SMALL` | Amazon | Image < 1000px | Upload larger image |
| `INVALID_GTIN` | Google | GTIN checksum failed | Verify barcode |
| `PRICE_MISMATCH` | Shopify | Price exceeds compare_at | Adjust pricing |
| `CATEGORY_INVALID` | All | Category not mapped | Map category |
| `RATE_LIMITED` | All | Too many requests | Retry later |

### Retry Logic

Failed items are automatically retried:

| Attempt | Delay | Max Attempts |
|---------|-------|--------------|
| 1 | Immediate | - |
| 2 | 5 minutes | - |
| 3 | 30 minutes | - |
| 4 | 2 hours | - |
| 5 | 24 hours | Final |

### Manual Retry

```http
POST /api/syndication/jobs/{jobId}/retry
{
  "skuIds": ["WH-WHT-001"],
  "channels": ["amazon"]
}
```

## Scheduling

### Scheduled Syndication

Set up recurring syndication:

```json
{
  "schedule": {
    "type": "cron",
    "expression": "0 6 * * *",
    "timezone": "America/New_York"
  },
  "filters": {
    "status": "APPROVED",
    "modifiedSince": "lastRun",
    "channels": ["amazon", "shopify"]
  }
}
```

### Syndication Windows

Some channels have optimal publishing times:

| Channel | Best Window | Avoid |
|---------|-------------|-------|
| Amazon | 2am-6am EST | Peak hours |
| Shopify | Anytime | - |
| Google | 4am-8am EST | - |

## Inventory Sync

### Real-Time Sync

Enable real-time inventory updates:

```json
{
  "inventorySync": {
    "enabled": true,
    "channels": ["amazon", "shopify"],
    "threshold": 5,
    "bufferStock": 2
  }
}
```

### Sync Frequency

| Channel | Frequency | Method |
|---------|-----------|--------|
| Amazon | Every 15 min | API push |
| Shopify | Real-time | Webhook |
| Google | Every 4 hours | Feed update |

## Price Sync

### Competitive Pricing

Enable automatic price adjustments:

```json
{
  "pricingRules": {
    "amazon": {
      "matchBuyBox": true,
      "minMargin": 15,
      "maxDiscount": 20
    }
  }
}
```

## Dashboard

### Syndication Metrics

| Metric | Description |
|--------|-------------|
| **Success Rate** | % of successful syndications |
| **Average Time** | Time from approved to published |
| **Error Rate** | % of failed syndications |
| **Channel Coverage** | % of SKUs on each channel |

### Alerts

Configure alerts for:
- Job failures
- High error rates
- Inventory discrepancies
- Price mismatches

## Copilot Integration

### Ask Mode
> "Why did SKU WH-BLK-001 fail to syndicate to Amazon?"

### Plan Mode
> "Create a plan to syndicate all approved Electronics to Shopify"

### Agent Mode
> "Open channel syndication and retry all failed Amazon jobs"
