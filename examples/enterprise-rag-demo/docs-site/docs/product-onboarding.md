# Product Onboarding

This guide walks through the complete process of onboarding a new product into RetailOps PXM.

## Prerequisites

Before creating a product, ensure you have:

- [ ] Product images (minimum 1, recommended 5+)
- [ ] Complete product specifications
- [ ] Pricing information for all variants
- [ ] Category assignment from the taxonomy
- [ ] Brand verification (if new brand)

## Step 1: Create Product Record

### Required Fields

| Field | Description | Example |
|-------|-------------|---------|
| **Title** | Product name (max 200 chars) | "Premium Wireless Headphones" |
| **Brand** | Manufacturer or brand name | "AudioTech" |
| **Category** | Primary category from taxonomy | "Electronics > Audio > Headphones" |
| **Description** | Long-form product description | Full HTML description |
| **Short Description** | Brief summary (max 500 chars) | Plain text summary |

### Optional Fields

| Field | Description |
|-------|-------------|
| **UPC/EAN** | Universal product code |
| **Manufacturer Part Number** | MPN from the brand |
| **Country of Origin** | Manufacturing country |
| **Warranty** | Warranty terms |
| **Keywords** | Search keywords (comma-separated) |

## Step 2: Add SKU Variants

Each product must have at least one SKU. For products with variants:

### SKU Required Fields

| Field | Description | Example |
|-------|-------------|---------|
| **SKU Code** | Unique identifier | "WH-BLK-001" |
| **Variant Title** | Variant-specific name | "Black / Over-ear" |
| **Price** | Base retail price | 149.99 |
| **Cost** | Wholesale cost | 75.00 |
| **Inventory** | Current stock level | 500 |

### Variant Attributes

Define the attributes that differentiate SKUs:

```
Color: Black, White, Silver
Size: Small, Medium, Large
Material: Leather, Fabric, Synthetic
```

## Step 3: Upload Media Assets

### Image Requirements

| Requirement | Specification |
|-------------|---------------|
| **Minimum Resolution** | 1000 x 1000 pixels |
| **Maximum File Size** | 10 MB |
| **Accepted Formats** | JPEG, PNG, WebP |
| **Background** | Pure white (#FFFFFF) preferred |
| **Minimum Images** | 1 per SKU |
| **Recommended Images** | 5-7 per SKU |

### Image Types

1. **Main Image** — Primary product shot (required)
2. **Alternate Views** — Side, back, detail shots
3. **Lifestyle** — Product in use
4. **Size Chart** — Dimensions or fit guide
5. **Packaging** — Box or packaging view

## Step 4: Set Channel-Specific Data

Each channel may require additional fields:

### Amazon-Specific

- Bullet points (5 required)
- Search terms (250 chars max)
- Browse node ID
- Item type keyword

### Shopify-Specific

- SEO title
- SEO description
- URL handle
- Collections

### Google Shopping-Specific

- GTIN (required for most categories)
- Condition (new/refurbished/used)
- Google product category

## Step 5: Submit for Validation

Once all data is complete:

1. Click **Submit for Validation**
2. The system runs all validation rules
3. Review any validation errors
4. Fix issues and resubmit if needed

### Common Validation Failures

| Error | Cause | Fix |
|-------|-------|-----|
| "Missing required field" | Required field is empty | Fill in the field |
| "Image too small" | Resolution below 1000x1000 | Upload larger image |
| "Invalid UPC" | UPC checksum failed | Verify UPC code |
| "Price below cost" | Retail < wholesale | Adjust pricing |

## Step 6: Track Onboarding Status

Monitor progress in the **Product Dashboard**:

- **Pending Validation** — Awaiting automated checks
- **Validation Failed** — Has errors to fix
- **Pending Approval** — Awaiting human review
- **Approved** — Ready for syndication

## Best Practices

1. **Complete all data upfront** — Partial submissions slow down approval
2. **Use high-quality images** — Better images = better conversions
3. **Be specific in descriptions** — Include dimensions, materials, care instructions
4. **Check competitor listings** — Ensure competitive pricing and features
5. **Use consistent naming** — Follow brand naming conventions

## Troubleshooting

### Product Stuck in Draft

- Check for unsaved changes
- Verify all required fields are filled
- Ensure at least one SKU exists

### Validation Keeps Failing

- Review the full validation report
- Check category-specific rules
- Contact Data Steward for help

### Cannot Assign Category

- Verify category is active in taxonomy
- Check if category requires approval
- Request category access from Admin
