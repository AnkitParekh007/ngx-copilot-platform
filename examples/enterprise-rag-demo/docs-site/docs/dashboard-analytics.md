# Dashboard & Analytics

The RetailOps PXM dashboard provides real-time insights into product data, workflow status, and channel performance.

## Dashboard Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ RetailOps PXM Dashboard                                    [Today ▼] [⟳]   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   12,450    │  │    2,340    │  │     156     │  │     89%     │       │
│  │  Total SKUs │  │  Published  │  │   Pending   │  │ Success Rate│       │
│  │   +5.2%     │  │   +12.3%    │  │   -8.1%     │  │   +2.1%     │       │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘       │
│                                                                             │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────────┐ │
│  │ SKU Status Distribution         │  │ Channel Performance             │ │
│  │ [Pie Chart]                     │  │ [Bar Chart]                     │ │
│  │  Draft: 15%                     │  │  Amazon: 2,100 SKUs             │ │
│  │  Validated: 8%                  │  │  Shopify: 1,850 SKUs            │ │
│  │  Approved: 12%                  │  │  Google: 1,920 SKUs             │ │
│  │  Published: 65%                 │  │  B2B: 980 SKUs                  │ │
│  └─────────────────────────────────┘  └─────────────────────────────────┘ │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Recent Activity                                                      │   │
│  │ ────────────────────────────────────────────────────────────────── │   │
│  │ 10:32 AM  SKU WH-BLK-001 approved by sarah@company.com             │   │
│  │ 10:28 AM  Bulk upload completed: 150 SKUs processed                │   │
│  │ 10:15 AM  Channel sync failed: Amazon (3 SKUs)                     │   │
│  │ 09:45 AM  New product created: Premium Wireless Headphones         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Key Metrics

### Product Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| **Total SKUs** | All SKUs in system | - |
| **Active SKUs** | SKUs not archived | > 95% |
| **Published SKUs** | Live on channels | > 80% |
| **Draft SKUs** | In progress | < 10% |

### Workflow Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| **Pending Validation** | Awaiting auto-check | < 100 |
| **Pending Approval** | Awaiting human review | < 50 |
| **Avg Approval Time** | Time to approve | < 24 hours |
| **Rejection Rate** | % rejected | < 10% |

### Channel Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| **Syndication Success** | % successful syncs | > 95% |
| **Sync Latency** | Time to publish | < 1 hour |
| **Error Rate** | Failed syndications | < 2% |
| **Coverage** | % SKUs on channels | > 90% |

## Reports

### Standard Reports

| Report | Description | Schedule |
|--------|-------------|----------|
| **Daily Summary** | Key metrics overview | Daily 6am |
| **Weekly Trends** | Week-over-week changes | Monday 8am |
| **Monthly Review** | Full month analysis | 1st of month |
| **Channel Health** | Per-channel status | Daily |
| **Error Report** | All errors/failures | Real-time |

### Custom Reports

Create custom reports:

1. Go to **Analytics > Reports**
2. Click **+ New Report**
3. Select metrics and dimensions
4. Configure filters
5. Set schedule (optional)
6. Save and run

### Report Builder

```
┌─────────────────────────────────────────────────────────────────┐
│ Report Builder                                                   │
├─────────────────────────────────────────────────────────────────┤
│ Metrics: [SKU Count ▼] [Revenue ▼] [+ Add Metric]               │
│                                                                  │
│ Dimensions: [Category ▼] [Channel ▼] [+ Add Dimension]          │
│                                                                  │
│ Filters:                                                         │
│   Status = [Published ▼]                                         │
│   Date Range = [Last 30 Days ▼]                                  │
│   Category = [Electronics ▼]                                     │
│                                                                  │
│ [Preview] [Save] [Schedule]                                      │
└─────────────────────────────────────────────────────────────────┘
```

## Widgets

### Available Widgets

| Widget | Type | Description |
|--------|------|-------------|
| **KPI Card** | Metric | Single number with trend |
| **Pie Chart** | Distribution | Status/category breakdown |
| **Bar Chart** | Comparison | Channel/category comparison |
| **Line Chart** | Trend | Metric over time |
| **Table** | List | Top/bottom performers |
| **Activity Feed** | Timeline | Recent actions |
| **Alert Panel** | Alerts | Active warnings |

### Widget Configuration

```json
{
  "widget": "kpi_card",
  "title": "Published SKUs",
  "metric": "sku_count",
  "filters": {
    "status": "PUBLISHED"
  },
  "comparison": {
    "type": "period",
    "period": "previous_week"
  },
  "refresh": "5m"
}
```

## Dashboards

### Default Dashboards

| Dashboard | Audience | Focus |
|-----------|----------|-------|
| **Executive** | Leadership | High-level KPIs |
| **Operations** | Ops team | Workflow status |
| **Merchandising** | Product team | Product health |
| **Channel** | Channel team | Syndication status |

### Custom Dashboards

Create personalized dashboards:

1. Go to **Analytics > Dashboards**
2. Click **+ New Dashboard**
3. Add widgets
4. Arrange layout
5. Set permissions
6. Save

## Alerts

### Alert Types

| Type | Trigger | Action |
|------|---------|--------|
| **Threshold** | Metric exceeds value | Email/Slack |
| **Trend** | Metric changes significantly | Email |
| **Anomaly** | Unusual pattern detected | Dashboard flag |
| **Scheduled** | Time-based check | Email digest |

### Alert Configuration

```json
{
  "name": "High Rejection Rate",
  "condition": {
    "metric": "rejection_rate",
    "operator": ">",
    "threshold": 15,
    "window": "24h"
  },
  "actions": [
    {
      "type": "email",
      "recipients": ["team@company.com"]
    },
    {
      "type": "slack",
      "channel": "#pxm-alerts"
    }
  ]
}
```

## Data Export

### Export Formats

- CSV
- Excel (.xlsx)
- PDF (reports)
- JSON (API)

### Scheduled Exports

```json
{
  "name": "Weekly SKU Export",
  "report": "sku_status_report",
  "format": "csv",
  "schedule": "0 6 * * MON",
  "destination": {
    "type": "sftp",
    "host": "reports.company.com",
    "path": "/exports/"
  }
}
```

## API Access

### Metrics API

```http
GET /api/analytics/metrics?metric=sku_count&groupBy=status&dateRange=last30days
```

Response:
```json
{
  "metric": "sku_count",
  "total": 12450,
  "breakdown": [
    { "status": "PUBLISHED", "count": 8092 },
    { "status": "APPROVED", "count": 1494 },
    { "status": "DRAFT", "count": 1869 }
  ],
  "trend": {
    "change": 5.2,
    "direction": "up"
  }
}
```

### Reports API

```http
POST /api/analytics/reports/run
{
  "reportId": "daily_summary",
  "parameters": {
    "dateRange": "2024-01-15"
  }
}
```

## Copilot Integration

### Ask Mode
> "What is our current approval success rate?"
> "How many SKUs are pending validation?"

### Plan Mode
> "Create a plan to improve our syndication success rate"

### Agent Mode
> "Open the dashboard and show me the channel performance chart"
