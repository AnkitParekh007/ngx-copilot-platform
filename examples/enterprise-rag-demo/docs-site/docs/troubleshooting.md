# Troubleshooting

This guide helps resolve common issues in RetailOps PXM.

## Quick Diagnostics

### System Status Check

1. Go to **Settings > System Status**
2. Review service health indicators
3. Check recent error logs
4. Verify external service connections

```
┌─────────────────────────────────────────────────────────────┐
│ System Status                                    [Refresh]  │
├─────────────────────────────────────────────────────────────┤
│ Core Services                                               │
│   ✓ Database           Healthy    Latency: 12ms            │
│   ✓ Search Index       Healthy    Latency: 45ms            │
│   ✓ File Storage       Healthy    Latency: 89ms            │
│   ✓ Queue Service      Healthy    Jobs: 12 pending         │
│                                                             │
│ External Services                                           │
│   ✓ Amazon SP-API      Connected  Rate: 85% available      │
│   ✓ Shopify API        Connected  Rate: 100% available     │
│   ⚠ Google Merchant    Degraded   Rate: 60% available      │
│   ✓ B2B Portal API     Connected  Rate: 100% available     │
└─────────────────────────────────────────────────────────────┘
```

## Common Issues

### Products

#### Product Won't Save

**Symptoms:**
- Save button unresponsive
- Error: "Unable to save product"
- Changes not persisting

**Solutions:**
1. Check for validation errors (red highlights)
2. Ensure all required fields are filled
3. Verify you have edit permissions
4. Clear browser cache and retry
5. Check if another user is editing (lock indicator)

#### Images Not Uploading

**Symptoms:**
- Upload progress stuck
- Error: "Upload failed"
- Image appears broken

**Solutions:**
1. Verify image format (JPEG, PNG, WebP)
2. Check file size (max 10MB)
3. Ensure minimum resolution (1000x1000)
4. Try a different browser
5. Check storage quota

#### Category Not Available

**Symptoms:**
- Category dropdown empty
- Cannot assign category
- Error: "Category not found"

**Solutions:**
1. Verify category is active (not archived)
2. Check if category requires approval
3. Confirm you have category access
4. Contact Category Manager for access

### Validation

#### Validation Stuck

**Symptoms:**
- Status remains "Pending Validation"
- No progress after 30 minutes
- Cannot submit for approval

**Solutions:**
1. Cancel and resubmit validation
2. Check queue status in System Status
3. Contact support if queue backlog

#### Unexpected Validation Failure

**Symptoms:**
- Validation fails on valid data
- Error message unclear
- Previously working product fails

**Solutions:**
1. Check recent rule changes
2. Review full validation report
3. Compare with similar passing products
4. Request rule clarification from Data Steward

### Approval

#### Approval Taking Too Long

**Symptoms:**
- Product stuck in approval > 48 hours
- No approver assigned
- Escalation not triggered

**Solutions:**
1. Check if approvers are available
2. Manually escalate if urgent
3. Contact approval manager
4. Check escalation rules configuration

#### Cannot Approve/Reject

**Symptoms:**
- Approve button disabled
- Error: "Permission denied"
- Action has no effect

**Solutions:**
1. Verify you're assigned to the item
2. Confirm approver role permissions
3. Check if item is already processed
4. Clear browser cache

### Syndication

#### Syndication Failing

**Symptoms:**
- Jobs consistently fail
- Partial failures
- Channel errors

**Common Errors:**

| Error | Cause | Solution |
|-------|-------|----------|
| `AUTH_FAILED` | Invalid credentials | Re-authenticate channel |
| `RATE_LIMITED` | Too many requests | Wait and retry |
| `VALIDATION_ERROR` | Channel-specific validation | Fix data per error |
| `NOT_FOUND` | Product not on channel | Create instead of update |
| `TIMEOUT` | Slow response | Retry during off-peak |

#### Inventory Not Syncing

**Symptoms:**
- Inventory levels incorrect
- Sync jobs succeeding but data wrong
- Lag between systems

**Solutions:**
1. Check sync schedule configuration
2. Verify inventory source is correct
3. Check for sync conflicts
4. Force full inventory refresh

#### Price Discrepancies

**Symptoms:**
- Prices different across channels
- Price not updating
- Promotional prices not applying

**Solutions:**
1. Check price rules per channel
2. Verify currency conversion
3. Check promotional schedule
4. Review price override settings

### Bulk Operations

#### Bulk Upload Failing

**Symptoms:**
- Upload rejected
- High error rate
- Processing stuck

**Solutions:**
1. Download error report
2. Check file encoding (UTF-8)
3. Validate column headers
4. Split large files into batches
5. Use validation-only mode first

#### Bulk Delete Not Working

**Symptoms:**
- Items not deleted
- Partial deletion
- Permission errors

**Solutions:**
1. Verify delete permissions
2. Check for published items (must unpublish first)
3. Confirm no active syndication
4. Process in smaller batches

### Performance

#### Slow Page Load

**Symptoms:**
- Dashboard loading slowly
- Search taking > 5 seconds
- Timeouts on large lists

**Solutions:**
1. Reduce date range filters
2. Use pagination for large lists
3. Clear browser cache
4. Check network connectivity
5. Report if persistent

#### Search Not Returning Results

**Symptoms:**
- Expected results missing
- Search returns empty
- Inconsistent results

**Solutions:**
1. Check search syntax
2. Verify index is current
3. Clear search filters
4. Try different search terms
5. Request index rebuild

## Error Codes

### Product Errors

| Code | Message | Resolution |
|------|---------|------------|
| `PRD-001` | Required field missing | Fill in required field |
| `PRD-002` | Invalid field value | Check field format |
| `PRD-003` | Duplicate SKU | Use unique SKU |
| `PRD-004` | Category not found | Select valid category |
| `PRD-005` | Brand not authorized | Request brand access |

### Validation Errors

| Code | Message | Resolution |
|------|---------|------------|
| `VAL-001` | Image below minimum resolution | Upload larger image |
| `VAL-002` | Invalid UPC checksum | Verify UPC code |
| `VAL-003` | Price below cost | Adjust pricing |
| `VAL-004` | Missing required attribute | Add attribute value |
| `VAL-005` | Content policy violation | Edit content |

### Channel Errors

| Code | Message | Resolution |
|------|---------|------------|
| `CHN-001` | Authentication failed | Re-connect channel |
| `CHN-002` | Rate limit exceeded | Wait and retry |
| `CHN-003` | Invalid field mapping | Fix mapping config |
| `CHN-004` | Item rejected by channel | Fix per channel error |
| `CHN-005` | Network timeout | Retry later |

## Getting Help

### Self-Service

1. **Knowledge Base** — Search help articles
2. **Community Forum** — Ask other users
3. **Release Notes** — Check recent changes
4. **API Docs** — Technical reference

### Support Channels

| Channel | Response Time | Best For |
|---------|---------------|----------|
| **Help Chat** | Minutes | Quick questions |
| **Email** | 4 hours | Detailed issues |
| **Phone** | Immediate | Urgent problems |
| **Ticket** | 24 hours | Complex issues |

### Before Contacting Support

Gather this information:
- User email and tenant
- Steps to reproduce
- Error messages (screenshots)
- Browser and OS version
- Time of occurrence

## Copilot Assistance

### Ask Mode
> "Why did my bulk upload fail?"
> "What does error code VAL-003 mean?"

### Plan Mode
> "Create a plan to diagnose syndication failures"

### Agent Mode
> "Open the error log and show me recent failures"
