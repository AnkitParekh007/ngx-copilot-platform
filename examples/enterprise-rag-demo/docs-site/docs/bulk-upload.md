# Bulk Upload

Bulk upload allows you to create or update multiple products at once using CSV or Excel files.

## File Formats

### Supported Formats
- CSV (UTF-8 encoded)
- Excel (.xlsx)
- JSON (for API uploads)

### Template Download

Download templates from **Settings > Import/Export > Download Template**

## CSV Structure

### Product Sheet

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| product_id | No | Existing ID (for updates) | PRD-12345 |
| title | Yes | Product title | Premium Wireless Headphones |
| brand | Yes | Brand name | AudioTech |
| category | Yes | Full category path | Electronics > Audio > Headphones |
| description | Yes | Full description | HTML allowed |
| short_description | No | Brief summary | Plain text |
| keywords | No | Comma-separated | wireless, bluetooth, audio |

### SKU Sheet

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| product_id | Yes | Parent product ID | PRD-12345 |
| sku | Yes | Unique SKU code | WH-BLK-001 |
| variant_title | Yes | Variant name | Black / Over-ear |
| price | Yes | Retail price | 149.99 |
| cost | No | Wholesale cost | 75.00 |
| inventory | Yes | Stock quantity | 500 |
| upc | No | Universal product code | 012345678901 |
| weight | No | Weight in lbs | 0.5 |
| color | No | Color variant | Black |
| size | No | Size variant | One Size |

### Image Sheet

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| sku | Yes | SKU code | WH-BLK-001 |
| image_url | Yes | Image URL | https://cdn.example.com/img1.jpg |
| position | Yes | Display order | 1 |
| alt_text | No | Image alt text | Black headphones front view |

## Upload Process

### Step 1: Prepare File

1. Download the template
2. Fill in product data
3. Validate locally (optional)
4. Save as CSV or XLSX

### Step 2: Upload

1. Go to **Products > Bulk Upload**
2. Click **Choose File**
3. Select your file
4. Click **Upload**

### Step 3: Validation

The system validates your file:

| Check | Description |
|-------|-------------|
| Format | File structure and encoding |
| Required Fields | All required columns present |
| Data Types | Numbers, dates, URLs valid |
| References | Categories, brands exist |
| Duplicates | No duplicate SKUs |
| Images | URLs accessible |

### Step 4: Preview

Review the validation results:

```
┌─────────────────────────────────────────┐
│ Upload Summary                          │
├─────────────────────────────────────────┤
│ Total Rows: 150                         │
│ Valid: 142                              │
│ Errors: 8                               │
│ Warnings: 15                            │
├─────────────────────────────────────────┤
│ New Products: 45                        │
│ Updated Products: 97                    │
│ New SKUs: 120                           │
│ Updated SKUs: 22                        │
└─────────────────────────────────────────┘
```

### Step 5: Confirm

- Review errors and warnings
- Fix critical errors if needed
- Click **Confirm Import**

### Step 6: Processing

Large uploads are processed in background:

| File Size | Processing Time |
|-----------|-----------------|
| < 100 rows | Immediate |
| 100-1000 rows | 1-5 minutes |
| 1000-10000 rows | 10-30 minutes |
| > 10000 rows | 1+ hours |

## Error Handling

### Error Types

| Type | Severity | Action |
|------|----------|--------|
| **Critical** | Error | Row skipped |
| **Warning** | Warning | Row imported with flag |
| **Info** | Info | Informational only |

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `REQUIRED_FIELD_MISSING` | Empty required column | Fill in value |
| `INVALID_CATEGORY` | Category not found | Check category path |
| `DUPLICATE_SKU` | SKU already exists | Use update mode or change SKU |
| `INVALID_PRICE` | Non-numeric price | Fix number format |
| `IMAGE_NOT_FOUND` | URL returns 404 | Fix image URL |
| `UPC_INVALID` | UPC checksum failed | Verify UPC code |

### Error Report

Download detailed error report:

```csv
row,column,error_code,message,value
5,price,INVALID_PRICE,"Price must be a number","$149.99"
12,category,INVALID_CATEGORY,"Category not found","Electronics > Sound"
23,upc,UPC_INVALID,"Invalid UPC checksum","012345678900"
```

## Update Mode

### Create vs Update

| Mode | Behavior |
|------|----------|
| **Create Only** | Skip existing products |
| **Update Only** | Skip new products |
| **Create or Update** | Handle both (default) |

### Partial Updates

Update specific fields only:

```csv
sku,price,inventory
WH-BLK-001,159.99,450
WH-WHT-001,159.99,380
```

Only price and inventory are updated; other fields unchanged.

## Scheduling

### Scheduled Imports

Set up recurring imports:

1. Go to **Settings > Scheduled Imports**
2. Click **New Schedule**
3. Configure:
   - Source (SFTP, URL, email)
   - Frequency (hourly, daily, weekly)
   - Mapping profile
   - Notification settings

### SFTP Import

Configure SFTP source:

```json
{
  "source": "sftp",
  "host": "sftp.supplier.com",
  "port": 22,
  "username": "retailops",
  "keyPath": "/path/to/key",
  "remotePath": "/exports/products.csv",
  "schedule": "0 6 * * *"
}
```

## API Upload

### Upload Endpoint

```http
POST /api/products/bulk-upload
Content-Type: multipart/form-data

file: products.csv
options: {"mode": "create_or_update", "validateOnly": false}
```

### Response

```json
{
  "jobId": "upload-12345",
  "status": "processing",
  "totalRows": 150,
  "estimatedTime": "5 minutes"
}
```

### Check Status

```http
GET /api/products/bulk-upload/{jobId}
```

## Best Practices

1. **Start Small** — Test with 10-20 rows first
2. **Use Templates** — Don't modify column headers
3. **UTF-8 Encoding** — Avoid character issues
4. **Validate Locally** — Check data before upload
5. **Schedule Off-Peak** — Large uploads during low-traffic hours
6. **Keep Originals** — Archive source files
7. **Monitor Errors** — Review error reports promptly

## Copilot Integration

### Ask Mode
> "What errors occurred in today's bulk upload?"

### Plan Mode
> "Create a plan to fix the 8 failed rows from the last upload"

### Agent Mode
> "Open bulk upload and start a new import from the supplier feed"
