/** Mock data for the RetailOps PXM codebase demo. All data is static/fictional. */

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  snippetKey?: string;
}

export interface KpiDataItem {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export interface ProductRow {
  id: string;
  name: string;
  category: string;
  status: 'draft' | 'validated' | 'approved' | 'rejected' | 'syndicated' | 'pending';
  channels: number;
  lastUpdated: string;
}

export interface ValidationIssue {
  productId: string;
  productName: string;
  field: string;
  issue: string;
  severity: 'error' | 'warning';
}

export interface ApprovalRow {
  id: string;
  productName: string;
  submittedBy: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface SyndicationJob {
  id: string;
  channelName: string;
  productCount: number;
  status: 'running' | 'failed' | 'syndicated' | 'pending';
  startedAt: string;
}

export interface FeatureTab {
  id: string;
  label: string;
}

export interface RagSourceItem {
  title: string;
  filePath: string;
  fileKind: string;
  snippet: string;
  score: number;
}

export interface TimelineStep {
  toolName: string;
  summary: string;
  status: 'succeeded' | 'running' | 'failed';
}

export interface CodebasePrompt {
  text: string;
  answer: string;
  sources: RagSourceItem[];
  timeline: TimelineStep[];
}

export const FEATURE_TABS: FeatureTab[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'product-onboarding', label: 'Product Onboarding' },
  { id: 'bulk-upload', label: 'Bulk Upload' },
  { id: 'validation', label: 'Validation Center' },
  { id: 'approval', label: 'Approval Queue' },
  { id: 'syndication', label: 'Channel Syndication' },
];

export const KPI_DATA: KpiDataItem[] = [
  { label: 'Total Products', value: '14,832', change: '+128 this week', isPositive: true },
  { label: 'Pending Approval', value: '247', change: '+12 today', isPositive: false },
  { label: 'Validation Errors', value: '89', change: '−34 vs last week', isPositive: true },
  { label: 'Syndication Rate', value: '94.2%', change: '+1.8% vs last month', isPositive: true },
  { label: 'Bulk Jobs Today', value: '12', change: '3 running', isPositive: true },
  { label: 'Channel Failures', value: '6', change: '+2 since yesterday', isPositive: false },
];

export const PRODUCT_TABLE_ROWS: ProductRow[] = [
  { id: 'SKU-00142', name: 'Alpine Trail Boot — Obsidian', category: 'Footwear', status: 'approved', channels: 4, lastUpdated: '2026-05-15' },
  { id: 'SKU-00143', name: 'Merino Wool Quarter-Zip', category: 'Apparel', status: 'validated', channels: 2, lastUpdated: '2026-05-15' },
  { id: 'SKU-00144', name: 'Carbon Fiber Trekking Pole Set', category: 'Equipment', status: 'pending', channels: 0, lastUpdated: '2026-05-14' },
  { id: 'SKU-00145', name: 'Solar-Charge Backpack 30L', category: 'Bags', status: 'draft', channels: 0, lastUpdated: '2026-05-14' },
  { id: 'SKU-00146', name: 'Titanium Cooking Set', category: 'Cookware', status: 'rejected', channels: 0, lastUpdated: '2026-05-13' },
  { id: 'SKU-00147', name: 'Waterproof Shell Jacket — Navy', category: 'Apparel', status: 'syndicated', channels: 5, lastUpdated: '2026-05-12' },
];

export const VALIDATION_ISSUES: ValidationIssue[] = [
  { productId: 'SKU-00144', productName: 'Carbon Fiber Trekking Pole Set', field: 'description', issue: 'Description under 100 characters minimum', severity: 'error' },
  { productId: 'SKU-00145', productName: 'Solar-Charge Backpack 30L', field: 'images', issue: 'Missing primary product image (min 1 required)', severity: 'error' },
  { productId: 'SKU-00146', productName: 'Titanium Cooking Set', field: 'weight_kg', issue: 'Weight value exceeds maximum 20kg for category', severity: 'error' },
  { productId: 'SKU-00143', productName: 'Merino Wool Quarter-Zip', field: 'color_family', issue: 'Color family not mapped to any channel taxonomy', severity: 'warning' },
  { productId: 'SKU-00142', productName: 'Alpine Trail Boot — Obsidian', field: 'brand', issue: 'Brand name differs from registered trademark casing', severity: 'warning' },
];

export const APPROVAL_QUEUE: ApprovalRow[] = [
  { id: 'APR-0089', productName: 'Alpine Trail Boot — Obsidian', submittedBy: 'j.hernandez', submittedAt: '2026-05-15 09:14', status: 'pending' },
  { id: 'APR-0088', productName: 'Merino Wool Quarter-Zip', submittedBy: 'a.novak', submittedAt: '2026-05-15 08:52', status: 'pending' },
  { id: 'APR-0087', productName: 'Fleece Lined Running Tights', submittedBy: 'l.chen', submittedAt: '2026-05-14 17:30', status: 'approved' },
  { id: 'APR-0086', productName: 'Titanium Cooking Set', submittedBy: 'r.kapoor', submittedAt: '2026-05-14 15:11', status: 'rejected' },
  { id: 'APR-0085', productName: 'Inflatable Sleeping Pad', submittedBy: 'j.hernandez', submittedAt: '2026-05-14 12:45', status: 'approved' },
];

export const SYNDICATION_JOBS: SyndicationJob[] = [
  { id: 'JOB-3421', channelName: 'Amazon Seller Central', productCount: 342, status: 'running', startedAt: '2026-05-15 10:00' },
  { id: 'JOB-3420', channelName: 'Shopify Store — EU', productCount: 198, status: 'syndicated', startedAt: '2026-05-15 08:30' },
  { id: 'JOB-3419', channelName: 'B2B Portal — Nordic', productCount: 87, status: 'failed', startedAt: '2026-05-15 07:15' },
  { id: 'JOB-3418', channelName: 'Google Shopping Feed', productCount: 512, status: 'syndicated', startedAt: '2026-05-14 22:00' },
  { id: 'JOB-3417', channelName: 'Shopify Store — US', productCount: 289, status: 'syndicated', startedAt: '2026-05-14 18:45' },
];

export const FILE_TREE: FileNode[] = [
  {
    name: 'retailops-pxm-web',
    type: 'folder',
    children: [
      {
        name: 'src',
        type: 'folder',
        children: [
          {
            name: 'app',
            type: 'folder',
            children: [
              {
                name: 'core',
                type: 'folder',
                children: [
                  {
                    name: 'auth',
                    type: 'folder',
                    children: [
                      { name: 'role.guard.ts', type: 'file', snippetKey: 'role.guard.ts' },
                    ],
                  },
                  {
                    name: 'models',
                    type: 'folder',
                    children: [
                      { name: 'sku-status.model.ts', type: 'file', snippetKey: 'sku-status.model.ts' },
                      { name: 'product.model.ts', type: 'file', snippetKey: 'product.model.ts' },
                    ],
                  },
                ],
              },
              {
                name: 'features',
                type: 'folder',
                children: [
                  {
                    name: 'bulk-upload',
                    type: 'folder',
                    children: [
                      { name: 'bulk-upload.service.ts', type: 'file', snippetKey: 'bulk-upload.service.ts' },
                    ],
                  },
                  {
                    name: 'product-onboarding',
                    type: 'folder',
                    children: [
                      { name: 'product-onboarding.component.ts', type: 'file', snippetKey: 'product-onboarding.component.ts' },
                    ],
                  },
                  {
                    name: 'validation-center',
                    type: 'folder',
                    children: [
                      { name: 'validation-center.component.ts', type: 'file', snippetKey: 'validation-center.component.ts' },
                    ],
                  },
                  {
                    name: 'approval-queue',
                    type: 'folder',
                    children: [
                      { name: 'approval.service.ts', type: 'file', snippetKey: 'approval.service.ts' },
                    ],
                  },
                  {
                    name: 'channel-syndication',
                    type: 'folder',
                    children: [
                      { name: 'channel-syndication.service.ts', type: 'file', snippetKey: 'channel-syndication.service.ts' },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

export const CODE_SNIPPETS: Record<string, string> = {
  'bulk-upload.service.ts': `import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UploadJob {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  totalRows: number;
  processedRows: number;
  failedRows: number;
  errorReportUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class BulkUploadService {
  constructor(private http: HttpClient) {}

  uploadCsv(file: File): Observable<UploadJob> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<UploadJob>('/api/bulk-upload', form);
  }

  pollJobStatus(jobId: string): Observable<UploadJob> {
    return this.http.get<UploadJob>(\`/api/bulk-upload/\${jobId}\`);
  }

  downloadErrorReport(jobId: string): Observable<Blob> {
    return this.http.get(\`/api/bulk-upload/\${jobId}/errors\`, {
      responseType: 'blob',
    });
  }
}`,

  'approval.service.ts': `import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApprovalDecision {
  productId: string;
  decision: 'approved' | 'rejected' | 'needs_changes';
  decidedBy: string;
  decidedAt: string;
  comments?: string;
}

@Injectable({ providedIn: 'root' })
export class ApprovalService {
  constructor(private http: HttpClient) {}

  approveProduct(id: string, comments?: string): Observable<ApprovalDecision> {
    return this.http.post<ApprovalDecision>(
      \`/api/products/\${id}/approve\`,
      { comments },
    );
  }

  rejectProduct(id: string, reason: string): Observable<ApprovalDecision> {
    return this.http.post<ApprovalDecision>(
      \`/api/products/\${id}/reject\`,
      { reason },
    );
  }

  requestChanges(id: string, feedback: string): Observable<ApprovalDecision> {
    return this.http.post<ApprovalDecision>(
      \`/api/products/\${id}/request-changes\`,
      { feedback },
    );
  }
}`,

  'role.guard.ts': `import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const required: string[] = route.data?.['roles'] ?? [];
  const userRole = auth.getCurrentRole();

  if (!userRole) {
    return router.createUrlTree(['/login']);
  }

  if (userRole === 'admin') {
    return true; // Admin always passes
  }

  if (required.length === 0 || required.includes(userRole)) {
    return true;
  }

  return router.createUrlTree(['/unauthorized']);
};`,

  'sku-status.model.ts': `/** All lifecycle states for a SKU in RetailOps PXM. */
export type SkuStatus =
  | 'DRAFT'
  | 'VALIDATION_PENDING'
  | 'VALIDATION_FAILED'
  | 'READY_FOR_REVIEW'
  | 'NEEDS_CHANGES'
  | 'APPROVED'
  | 'READY_FOR_SYNDICATION'
  | 'SYNDICATION_PENDING'
  | 'SYNDICATED'
  | 'SYNDICATION_FAILED'
  | 'ARCHIVED'
  | 'DELETED';

/** Allowed transitions for business rule enforcement. */
export const SKU_STATUS_TRANSITIONS: Record<SkuStatus, SkuStatus[]> = {
  DRAFT: ['VALIDATION_PENDING', 'ARCHIVED'],
  VALIDATION_PENDING: ['VALIDATION_FAILED', 'READY_FOR_REVIEW'],
  VALIDATION_FAILED: ['DRAFT'],
  READY_FOR_REVIEW: ['APPROVED', 'NEEDS_CHANGES'],
  NEEDS_CHANGES: ['DRAFT'],
  APPROVED: ['READY_FOR_SYNDICATION', 'ARCHIVED'],
  READY_FOR_SYNDICATION: ['SYNDICATION_PENDING'],
  SYNDICATION_PENDING: ['SYNDICATED', 'SYNDICATION_FAILED'],
  SYNDICATED: ['ARCHIVED'],
  SYNDICATION_FAILED: ['READY_FOR_SYNDICATION'],
  ARCHIVED: [],
  DELETED: [],
};`,

  'product-onboarding.component.ts': `import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductOnboardingService } from './product-onboarding.service';

@Component({
  selector: 'app-product-onboarding',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './product-onboarding.component.html',
})
export class ProductOnboardingComponent {
  private fb = inject(FormBuilder);
  private service = inject(ProductOnboardingService);
  private router = inject(Router);

  saving = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    category: ['', Validators.required],
    brand: ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(100)]],
    weight_kg: [null as number | null],
  });

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.service.createProduct(this.form.value as never).subscribe({
      next: (product) => this.router.navigate(['/products', product.id]),
      error: (err) => {
        this.error.set(err.message);
        this.saving.set(false);
      },
    });
  }
}`,

  'validation-center.component.ts': `import { Component, inject, signal, OnInit } from '@angular/core';
import { ValidationCenterService } from './validation-center.service';

@Component({
  selector: 'app-validation-center',
  standalone: true,
  templateUrl: './validation-center.component.html',
})
export class ValidationCenterComponent implements OnInit {
  private service = inject(ValidationCenterService);

  issues = signal<ValidationIssue[]>([]);
  loading = signal(false);
  selectedProductId = signal<string | null>(null);

  ngOnInit(): void {
    this.loadIssues();
  }

  loadIssues(): void {
    this.loading.set(true);
    this.service.getValidationIssues().subscribe({
      next: (issues) => {
        this.issues.set(issues);
        this.loading.set(false);
      },
    });
  }

  runValidation(productId: string): void {
    this.service.runValidation(productId).subscribe({
      next: () => this.loadIssues(),
    });
  }
}`,

  'channel-syndication.service.ts': `import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SyndicationJob {
  jobId: string;
  channelId: string;
  channelName: string;
  productIds: string[];
  status: 'queued' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  failureReason?: string;
}

@Injectable({ providedIn: 'root' })
export class ChannelSyndicationService {
  constructor(private http: HttpClient) {}

  syndicateProducts(channelId: string, productIds: string[]): Observable<SyndicationJob> {
    return this.http.post<SyndicationJob>('/api/syndication/jobs', {
      channelId,
      productIds,
    });
  }

  getJobStatus(jobId: string): Observable<SyndicationJob> {
    return this.http.get<SyndicationJob>(\`/api/syndication/jobs/\${jobId}\`);
  }

  retryJob(jobId: string): Observable<SyndicationJob> {
    return this.http.post<SyndicationJob>(\`/api/syndication/jobs/\${jobId}/retry\`, {});
  }
}`,

  'product.model.ts': `/** Core product entity for RetailOps PXM. */
export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  status: SkuStatus;
  variants: ProductVariant[];
  images: ProductImage[];
  attributes: Record<string, string | number | boolean>;
  channels: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  size?: string;
  color?: string;
  price: number;
  stockQty: number;
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string;
  isPrimary: boolean;
  sortOrder: number;
}

// Re-export SkuStatus for convenience
export type { SkuStatus } from './sku-status.model';`,
};

export const CODEBASE_PROMPTS: CodebasePrompt[] = [
  {
    text: 'Where is the bulk upload flow implemented?',
    answer: `The bulk upload flow is split across two key files in the \`features/bulk-upload\` directory.

**BulkUploadService** (\`src/app/features/bulk-upload/bulk-upload.service.ts\`) handles the heavy lifting: CSV/XLSX parsing, row-level validation, batch import, error report export, and retry logic for failed rows. It exposes Observable streams for each operation.

The page component (\`bulk-upload.page.ts\`) orchestrates the dropzone UI, column mapper, preview table, and import flow — delegating all data logic to the service.

The split keeps UI orchestration separate from transport and parsing, making each part independently testable.`,
    sources: [
      {
        title: 'bulk-upload.service.ts',
        filePath: 'src/app/features/bulk-upload/bulk-upload.service.ts',
        fileKind: 'service',
        snippet: 'Handles CSV/XLSX parsing, row-level validation, batch import, error report export, and retry logic for failed rows.',
        score: 0.96,
      },
      {
        title: 'bulk-upload.page.ts',
        filePath: 'src/app/features/bulk-upload/bulk-upload.page.ts',
        fileKind: 'component',
        snippet: 'Main page component orchestrating the dropzone, column mapper, preview table, and import flow.',
        score: 0.93,
      },
    ],
    timeline: [
      { toolName: 'Analyze route tree', summary: 'Resolved lazy routes under features/bulk-upload and correlated entry components.', status: 'succeeded' },
      { toolName: 'Search Angular services', summary: 'Found BulkUploadService with uploadCsv(), pollJobStatus(), and downloadErrorReport() methods.', status: 'succeeded' },
      { toolName: 'Retrieve source snippets', summary: 'Pulled illustrative snippets from bulk upload service and page component.', status: 'succeeded' },
      { toolName: 'Generate answer', summary: 'Synthesized explanation with file path citations.', status: 'succeeded' },
    ],
  },
  {
    text: 'Which service submits products for validation?',
    answer: `**ProductOnboardingService** (\`src/app/features/product-onboarding/product-onboarding.service.ts\`) is responsible for submitting products for validation.

Its key method \`submitForValidation(id)\` calls the products API and transitions the product status to \`VALIDATION_PENDING\`. This triggers the validation pipeline downstream.

Once in \`VALIDATION_PENDING\`, **ValidationCenterService** (\`src/app/features/validation-center/validation-center.service.ts\`) takes over — it wraps the ValidationApiService and exposes \`getValidationIssues(productId)\`, \`runValidation(productId)\`, and \`getValidationRules()\`.`,
    sources: [
      {
        title: 'product-onboarding.service.ts',
        filePath: 'src/app/features/product-onboarding/product-onboarding.service.ts',
        fileKind: 'service',
        snippet: 'Business-logic layer. submitForValidation(id) transitions the product to VALIDATION_PENDING.',
        score: 0.94,
      },
      {
        title: 'validation-center.service.ts',
        filePath: 'src/app/features/validation-center/validation-center.service.ts',
        fileKind: 'service',
        snippet: 'Wraps ValidationApiService. Exposes getValidationIssues, runValidation, and getValidationRules.',
        score: 0.91,
      },
    ],
    timeline: [
      { toolName: 'Search Angular services', summary: 'Located ProductOnboardingService and ValidationCenterService in feature directories.', status: 'succeeded' },
      { toolName: 'Trace method calls', summary: 'Confirmed submitForValidation() call chain leads to VALIDATION_PENDING status.', status: 'succeeded' },
      { toolName: 'Generate answer', summary: 'Composed explanation with service hierarchy and status transition notes.', status: 'succeeded' },
    ],
  },
  {
    text: 'Which components handle approval decisions?',
    answer: `Approval decisions flow through two files in \`features/approval-queue\`.

**ApprovalDecisionDialogComponent** (\`approval-decision-dialog.component.ts\`) is the modal UI presenting Approve / Reject / Request Changes actions for products in \`READY_FOR_REVIEW\` state. It reads the product details and delegates actions.

**ApprovalService** (\`approval.service.ts\`) provides the three decision methods — \`approveProduct(id, comments)\`, \`rejectProduct(id, reason)\`, and \`requestChanges(id, feedback)\`. Each returns an \`Observable<ApprovalDecision>\` and updates the product's status accordingly.

The dialog component never calls the HTTP API directly — it always goes through the service layer.`,
    sources: [
      {
        title: 'approval-decision-dialog.component.ts',
        filePath: 'src/app/features/approval-queue/approval-decision-dialog.component.ts',
        fileKind: 'component',
        snippet: 'Modal dialog presenting Approve / Reject / Request Changes for products in READY_FOR_REVIEW state.',
        score: 0.91,
      },
      {
        title: 'approval.service.ts',
        filePath: 'src/app/features/approval-queue/approval.service.ts',
        fileKind: 'service',
        snippet: 'Provides approveProduct, rejectProduct, and requestChanges. Each returns Observable<ApprovalDecision>.',
        score: 0.89,
      },
    ],
    timeline: [
      { toolName: 'Search approval feature', summary: 'Found ApprovalDecisionDialogComponent and ApprovalService in approval-queue feature.', status: 'succeeded' },
      { toolName: 'Analyze component inputs', summary: 'Confirmed dialog delegates to service, never calls API directly.', status: 'succeeded' },
      { toolName: 'Generate answer', summary: 'Composed explanation with component/service split and method signatures.', status: 'succeeded' },
    ],
  },
  {
    text: 'Which guard checks role-based access?',
    answer: `**roleGuard** (\`src/app/core/auth/role.guard.ts\`) is the functional \`CanActivateFn\` for role-based access control.

It reads \`route.data.roles\` (an array of allowed role strings) and compares them against the current user's role from AuthService. Key behaviors:

- **Admin always passes** — regardless of the required roles list
- **Unauthenticated users** are redirected to \`/login\`
- **Unauthorized users** are redirected to \`/unauthorized\`

Apply it in route definitions like:
\`{ path: 'approve', canActivate: [roleGuard], data: { roles: ['approver', 'admin'] } }\``,
    sources: [
      {
        title: 'role.guard.ts',
        filePath: 'src/app/core/auth/role.guard.ts',
        fileKind: 'guard',
        snippet: 'Functional CanActivateFn. Reads route.data.roles, compares against current user role. Admin always passes.',
        score: 0.96,
      },
      {
        title: 'sku-status.model.ts',
        filePath: 'src/app/core/models/sku-status.model.ts',
        fileKind: 'model',
        snippet: 'Defines SkuStatus union type and SKU_STATUS_TRANSITIONS for business rule enforcement.',
        score: 0.72,
      },
    ],
    timeline: [
      { toolName: 'Search auth directory', summary: 'Located roleGuard in core/auth — functional CanActivateFn pattern (Angular 15+).', status: 'succeeded' },
      { toolName: 'Analyze guard logic', summary: 'Traced admin bypass, unauthenticated redirect, and unauthorized redirect paths.', status: 'succeeded' },
      { toolName: 'Generate answer', summary: 'Composed explanation with usage example and key behavioral notes.', status: 'succeeded' },
    ],
  },
];
