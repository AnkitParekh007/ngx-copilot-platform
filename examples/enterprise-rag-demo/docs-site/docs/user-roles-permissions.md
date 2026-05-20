# User Roles & Permissions

RetailOps PXM uses role-based access control (RBAC) to manage user permissions. This document describes available roles and their capabilities.

## Role Hierarchy

```
                    ┌─────────────┐
                    │    Admin    │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │  Category   │  │   Senior    │  │   Channel   │
   │   Manager   │  │  Approver   │  │   Manager   │
   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
          │                │                │
          ▼                ▼                ▼
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │    Data     │  │  Approver   │  │  Syndication│
   │   Steward   │  │             │  │  Operator   │
   └──────┬──────┘  └─────────────┘  └─────────────┘
          │
          ▼
   ┌─────────────┐
   │   Product   │
   │   Manager   │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │   Content   │
   │  Specialist │
   └─────────────┘
```

## Role Definitions

### Admin

**Description:** Full system access with configuration capabilities.

**Permissions:**
| Area | Create | Read | Update | Delete | Configure |
|------|--------|------|--------|--------|-----------|
| Products | Yes | Yes | Yes | Yes | Yes |
| SKUs | Yes | Yes | Yes | Yes | Yes |
| Users | Yes | Yes | Yes | Yes | Yes |
| Roles | Yes | Yes | Yes | Yes | Yes |
| Channels | Yes | Yes | Yes | Yes | Yes |
| Settings | Yes | Yes | Yes | Yes | Yes |
| Audit Logs | No | Yes | No | No | No |

**Typical Users:** IT administrators, system owners

---

### Category Manager

**Description:** Manages product taxonomy and category-level rules.

**Permissions:**
| Area | Create | Read | Update | Delete | Configure |
|------|--------|------|--------|--------|-----------|
| Categories | Yes | Yes | Yes | Yes | Yes |
| Validation Rules | Yes | Yes | Yes | Yes | No |
| Products (own category) | Yes | Yes | Yes | No | No |
| Approval Override | No | No | Yes | No | No |

**Typical Users:** Merchandising leads, category owners

---

### Senior Approver

**Description:** Can approve high-value or escalated items.

**Permissions:**
| Area | Create | Read | Update | Delete | Configure |
|------|--------|------|--------|--------|-----------|
| Products | No | Yes | No | No | No |
| Approvals (all) | No | Yes | Yes | No | No |
| Escalations | No | Yes | Yes | No | No |
| Override Validation | No | No | Yes | No | No |

**Typical Users:** Senior merchandisers, department managers

---

### Channel Manager

**Description:** Manages channel configurations and syndication.

**Permissions:**
| Area | Create | Read | Update | Delete | Configure |
|------|--------|------|--------|--------|-----------|
| Channels | Yes | Yes | Yes | No | Yes |
| Field Mappings | Yes | Yes | Yes | Yes | No |
| Syndication Jobs | Yes | Yes | Yes | Yes | No |
| Published Products | No | Yes | Yes | No | No |

**Typical Users:** E-commerce managers, marketplace specialists

---

### Data Steward

**Description:** Ensures data quality and resolves conflicts.

**Permissions:**
| Area | Create | Read | Update | Delete | Configure |
|------|--------|------|--------|--------|-----------|
| Products | Yes | Yes | Yes | No | No |
| SKUs | Yes | Yes | Yes | No | No |
| Validation | No | Yes | Yes | No | No |
| Data Cleanup | No | No | Yes | No | No |
| Bulk Operations | Yes | Yes | Yes | No | No |

**Typical Users:** Data analysts, quality assurance

---

### Approver

**Description:** Reviews and approves/rejects products.

**Permissions:**
| Area | Create | Read | Update | Delete | Configure |
|------|--------|------|--------|--------|-----------|
| Products | No | Yes | No | No | No |
| Approvals (assigned) | No | Yes | Yes | No | No |
| Comments | Yes | Yes | Yes | No | No |

**Typical Users:** Merchandisers, content reviewers

---

### Product Manager

**Description:** Creates and manages product listings.

**Permissions:**
| Area | Create | Read | Update | Delete | Configure |
|------|--------|------|--------|--------|-----------|
| Products | Yes | Yes | Yes | Yes* | No |
| SKUs | Yes | Yes | Yes | Yes* | No |
| Images | Yes | Yes | Yes | Yes | No |
| Submit for Validation | Yes | - | - | - | - |

*Can only delete own drafts

**Typical Users:** Product specialists, listing managers

---

### Content Specialist

**Description:** Writes and edits product content.

**Permissions:**
| Area | Create | Read | Update | Delete | Configure |
|------|--------|------|--------|--------|-----------|
| Product Content | No | Yes | Yes | No | No |
| Images | Yes | Yes | Yes | Yes | No |
| SEO Fields | No | Yes | Yes | No | No |

**Typical Users:** Copywriters, content editors

---

### Syndication Operator

**Description:** Monitors and manages syndication jobs.

**Permissions:**
| Area | Create | Read | Update | Delete | Configure |
|------|--------|------|--------|--------|-----------|
| Syndication Jobs | Yes | Yes | Yes | No | No |
| Job Monitoring | No | Yes | No | No | No |
| Retry Failed | Yes | - | - | - | - |

**Typical Users:** Operations staff, support team

---

### Viewer

**Description:** Read-only access to product data.

**Permissions:**
| Area | Create | Read | Update | Delete | Configure |
|------|--------|------|--------|--------|-----------|
| Products | No | Yes | No | No | No |
| SKUs | No | Yes | No | No | No |
| Reports | No | Yes | No | No | No |

**Typical Users:** Executives, external stakeholders

## Permission Matrix

### Products

| Action | Admin | CatMgr | Approver | DataStwd | ProdMgr | Content | Viewer |
|--------|-------|--------|----------|----------|---------|---------|--------|
| Create | Yes | Yes | No | Yes | Yes | No | No |
| View All | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Edit Own | Yes | Yes | No | Yes | Yes | Yes | No |
| Edit Any | Yes | Yes | No | Yes | No | No | No |
| Delete | Yes | No | No | No | Own | No | No |
| Submit | Yes | Yes | No | Yes | Yes | No | No |
| Approve | Yes | Yes | Yes | No | No | No | No |
| Publish | Yes | Yes | No | No | No | No | No |

### Channels

| Action | Admin | ChanMgr | SyndOp | Others |
|--------|-------|---------|--------|--------|
| Configure | Yes | Yes | No | No |
| View | Yes | Yes | Yes | No |
| Syndicate | Yes | Yes | Yes | No |
| Retry | Yes | Yes | Yes | No |

## Custom Roles

Admins can create custom roles:

1. Go to **Settings > Roles**
2. Click **+ New Role**
3. Set role name and description
4. Configure permissions
5. Assign to users

### Example: Brand Manager

```json
{
  "name": "Brand Manager",
  "permissions": {
    "products": {
      "create": true,
      "read": true,
      "update": true,
      "delete": false,
      "filters": {
        "brand": ["AudioTech", "FitWear"]
      }
    },
    "approvals": {
      "approve": true,
      "filters": {
        "brand": ["AudioTech", "FitWear"]
      }
    }
  }
}
```

## Multi-Tenant Access

For organizations with multiple tenants:

| Scope | Description |
|-------|-------------|
| **Global** | Access across all tenants |
| **Tenant** | Access within assigned tenant |
| **Category** | Access within assigned categories |
| **Brand** | Access within assigned brands |

## API Authentication

### User Tokens

```http
Authorization: Bearer <user-token>
```

### Service Accounts

For automated processes:

```http
Authorization: Bearer <service-account-token>
X-Service-Account: bulk-importer
```

## Audit Trail

All permission changes are logged:

```json
{
  "event": "permission.changed",
  "user": "admin@company.com",
  "target": "user@company.com",
  "changes": {
    "role": {
      "from": "Product Manager",
      "to": "Data Steward"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```
