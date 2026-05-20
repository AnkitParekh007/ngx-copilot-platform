# Getting Started with RetailOps PXM

Welcome to RetailOps PXM — the enterprise Product Experience Management platform that helps retail organizations manage product data across multiple sales channels.

## What is RetailOps PXM?

RetailOps PXM is a centralized platform for:

- **Product Data Management** — Create, edit, and organize product information
- **Multi-Channel Syndication** — Publish products to Amazon, Shopify, Google Shopping, and B2B portals
- **Workflow Automation** — Streamline approval processes and validation rules
- **Analytics & Reporting** — Track product performance across channels

## Who Uses RetailOps PXM?

| Role | Primary Responsibilities |
|------|-------------------------|
| **Product Manager** | Create and manage product listings, set up categories |
| **Content Specialist** | Write product descriptions, manage media assets |
| **Data Steward** | Validate data quality, resolve conflicts |
| **Channel Manager** | Configure channel mappings, monitor syndication |
| **Admin** | Manage users, configure workflows, audit logs |

## Key Concepts

### Products and SKUs

A **Product** is the master record containing common attributes (brand, category, description). Each product has one or more **SKUs** (Stock Keeping Units) representing specific variants (size, color, material).

```
Product: "Premium Wireless Headphones"
├── SKU: WH-BLK-001 (Black, Over-ear)
├── SKU: WH-WHT-001 (White, Over-ear)
└── SKU: WH-BLK-002 (Black, On-ear)
```

### Channels

A **Channel** is a destination where products are published:

- **Amazon** — Marketplace listing
- **Shopify** — E-commerce storefront
- **Google Shopping** — Product ads
- **B2B Portal** — Wholesale ordering

Each channel has its own field mappings, validation rules, and formatting requirements.

### SKU Status Lifecycle

Every SKU moves through a defined lifecycle:

```
Draft → Pending Validation → Validated → Pending Approval → Approved → Published
                    ↓                           ↓
              Validation Failed           Rejected
                    ↓                           ↓
                 Draft                    Needs Revision
```

See [SKU Status Lifecycle](./sku-status-lifecycle.md) for complete details.

## Quick Start

### 1. Log In

Navigate to `https://pxm.retailops.example.com` and sign in with your corporate credentials.

### 2. Create Your First Product

1. Click **Products** in the sidebar
2. Click **+ New Product**
3. Fill in required fields (Title, Brand, Category)
4. Add at least one SKU with pricing
5. Click **Save Draft**

### 3. Submit for Validation

1. Open your draft product
2. Click **Submit for Validation**
3. The system will check all validation rules
4. If passed, the product moves to **Pending Approval**

### 4. Get Approval

1. A designated approver reviews the product
2. They can **Approve** or **Reject** with comments
3. Approved products become eligible for syndication

### 5. Publish to Channels

1. Go to **Channel Syndication**
2. Select your product
3. Choose target channels
4. Click **Publish**
5. Monitor syndication status in the dashboard

## Next Steps

- [Product Onboarding](./product-onboarding.md) — Detailed guide for creating products
- [Validation Rules](./validation-rules.md) — Understand what makes a valid product
- [User Roles & Permissions](./user-roles-permissions.md) — Learn about access control
