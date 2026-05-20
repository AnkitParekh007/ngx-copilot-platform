/**
 * App Routes
 * RetailOps PXM - Main Routing Configuration
 */
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    data: { title: 'Dashboard' }
  },
  {
    path: 'products',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/products/product-list/product-list.component')
          .then(m => m.ProductListComponent),
        data: { title: 'Products' }
      },
      {
        path: 'new',
        loadComponent: () => import('./features/products/product-editor/product-editor.component')
          .then(m => m.ProductEditorComponent),
        data: { title: 'Create Product' }
      },
      {
        path: ':id',
        loadComponent: () => import('./features/products/product-detail/product-detail.component')
          .then(m => m.ProductDetailComponent),
        data: { title: 'Product Details' }
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/products/product-editor/product-editor.component')
          .then(m => m.ProductEditorComponent),
        data: { title: 'Edit Product' }
      }
    ]
  },
  {
    path: 'skus',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/skus/sku-list/sku-list.component')
          .then(m => m.SkuListComponent),
        data: { title: 'SKUs' }
      },
      {
        path: 'new',
        loadComponent: () => import('./features/skus/sku-editor/sku-editor.component')
          .then(m => m.SkuEditorComponent),
        data: { title: 'Create SKU' }
      },
      {
        path: ':id',
        loadComponent: () => import('./features/skus/sku-editor/sku-editor.component')
          .then(m => m.SkuEditorComponent),
        data: { title: 'Edit SKU' }
      }
    ]
  },
  {
    path: 'channels',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/channels/channel-list/channel-list.component')
          .then(m => m.ChannelListComponent),
        data: { title: 'Channels' }
      },
      {
        path: ':id',
        loadComponent: () => import('./features/channels/channel-detail/channel-detail.component')
          .then(m => m.ChannelDetailComponent),
        data: { title: 'Channel Details' }
      },
      {
        path: ':id/syndicate',
        loadComponent: () => import('./features/channels/syndication/syndication.component')
          .then(m => m.SyndicationComponent),
        data: { title: 'Syndication' }
      }
    ]
  },
  {
    path: 'approvals',
    loadComponent: () => import('./features/approvals/approval-queue/approval-queue.component')
      .then(m => m.ApprovalQueueComponent),
    data: { title: 'Approval Queue' }
  },
  {
    path: 'bulk-upload',
    loadComponent: () => import('./features/bulk-upload/bulk-upload.component')
      .then(m => m.BulkUploadComponent),
    data: { title: 'Bulk Upload' }
  },
  {
    path: 'analytics',
    loadComponent: () => import('./features/analytics/analytics-dashboard.component')
      .then(m => m.AnalyticsDashboardComponent),
    data: { title: 'Analytics' }
  },
  {
    path: 'settings',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/settings/settings.component')
          .then(m => m.SettingsComponent),
        data: { title: 'Settings' }
      },
      {
        path: 'users',
        loadComponent: () => import('./features/settings/user-management/user-management.component')
          .then(m => m.UserManagementComponent),
        data: { title: 'User Management' }
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
