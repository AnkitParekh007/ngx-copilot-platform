/**
 * Product List Component
 * RetailOps PXM - Product Management
 */
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, ProductListResponse } from '../../../core/services/product.service';
import { Product, ProductStatus, ProductFilters } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="product-list-container" data-testid="product-list">
      <!-- Header -->
      <header class="list-header">
        <div class="header-title">
          <h1>Products</h1>
          <span class="badge">{{ productService.productCount() }} items</span>
        </div>
        <div class="header-actions">
          <button 
            class="btn btn-primary" 
            routerLink="/products/new"
            data-testid="create-product-btn">
            <i class="icon-plus"></i>
            Create Product
          </button>
        </div>
      </header>

      <!-- Filters -->
      <section class="filters-section" data-testid="product-filters">
        <div class="filter-group">
          <label for="search">Search</label>
          <input
            id="search"
            type="text"
            placeholder="Search products..."
            [ngModel]="searchTerm()"
            (ngModelChange)="onSearchChange($event)"
            data-testid="search-input"
          />
        </div>

        <div class="filter-group">
          <label for="status">Status</label>
          <select
            id="status"
            [ngModel]="selectedStatus()"
            (ngModelChange)="onStatusChange($event)"
            data-testid="status-filter">
            <option value="">All Statuses</option>
            @for (status of statusOptions; track status.value) {
              <option [value]="status.value">{{ status.label }}</option>
            }
          </select>
        </div>

        <div class="filter-group">
          <label for="category">Category</label>
          <select
            id="category"
            [ngModel]="selectedCategory()"
            (ngModelChange)="onCategoryChange($event)"
            data-testid="category-filter">
            <option value="">All Categories</option>
            @for (cat of categories(); track cat.id) {
              <option [value]="cat.id">{{ cat.name }}</option>
            }
          </select>
        </div>

        <button 
          class="btn btn-secondary" 
          (click)="clearFilters()"
          data-testid="clear-filters-btn">
          Clear Filters
        </button>
      </section>

      <!-- Loading State -->
      @if (productService.loading()) {
        <div class="loading-state" data-testid="loading-spinner">
          <div class="spinner"></div>
          <p>Loading products...</p>
        </div>
      }

      <!-- Product Grid -->
      @if (!productService.loading()) {
        <div class="product-grid" data-testid="product-grid">
          @for (product of productService.products(); track product.id) {
            <article 
              class="product-card"
              [class.selected]="selectedProducts().has(product.id)"
              data-testid="product-card">
              <div class="card-checkbox">
                <input
                  type="checkbox"
                  [checked]="selectedProducts().has(product.id)"
                  (change)="toggleProductSelection(product.id)"
                  data-testid="product-checkbox"
                />
              </div>
              
              <div class="card-image">
                @if (product.images.length > 0) {
                  <img [src]="product.images[0].url" [alt]="product.name" />
                } @else {
                  <div class="no-image">No Image</div>
                }
              </div>

              <div class="card-content">
                <h3 class="product-name">
                  <a [routerLink]="['/products', product.id]" data-testid="product-link">
                    {{ product.name }}
                  </a>
                </h3>
                <p class="product-code">{{ product.code }}</p>
                <p class="product-category">{{ product.categoryId }}</p>
                
                <div class="product-meta">
                  <span 
                    class="status-badge"
                    [class]="'status-' + product.status"
                    data-testid="product-status">
                    {{ product.status | titlecase }}
                  </span>
                  <span class="sku-count">{{ product.skuCount }} SKUs</span>
                </div>
              </div>

              <div class="card-actions">
                <button 
                  class="btn btn-icon" 
                  [routerLink]="['/products', product.id, 'edit']"
                  title="Edit"
                  data-testid="edit-product-btn">
                  <i class="icon-edit"></i>
                </button>
                <button 
                  class="btn btn-icon"
                  (click)="viewSkus(product)"
                  title="View SKUs"
                  data-testid="view-skus-btn">
                  <i class="icon-list"></i>
                </button>
                @if (product.status === 'draft') {
                  <button 
                    class="btn btn-icon btn-primary"
                    (click)="submitForApproval(product)"
                    title="Submit for Approval"
                    data-testid="submit-approval-btn">
                    <i class="icon-send"></i>
                  </button>
                }
              </div>
            </article>
          } @empty {
            <div class="empty-state" data-testid="empty-state">
              <i class="icon-package"></i>
              <h3>No products found</h3>
              <p>Create your first product or adjust your filters.</p>
              <button class="btn btn-primary" routerLink="/products/new">
                Create Product
              </button>
            </div>
          }
        </div>
      }

      <!-- Pagination -->
      @if (totalPages() > 1) {
        <nav class="pagination" data-testid="pagination">
          <button
            class="btn btn-secondary"
            [disabled]="currentPage() === 1"
            (click)="goToPage(currentPage() - 1)"
            data-testid="prev-page-btn">
            Previous
          </button>
          
          <span class="page-info">
            Page {{ currentPage() }} of {{ totalPages() }}
          </span>
          
          <button
            class="btn btn-secondary"
            [disabled]="currentPage() === totalPages()"
            (click)="goToPage(currentPage() + 1)"
            data-testid="next-page-btn">
            Next
          </button>
        </nav>
      }

      <!-- Bulk Actions Bar -->
      @if (selectedProducts().size > 0) {
        <div class="bulk-actions-bar" data-testid="bulk-actions">
          <span>{{ selectedProducts().size }} selected</span>
          <button class="btn btn-secondary" (click)="bulkSubmitForApproval()">
            Submit for Approval
          </button>
          <button class="btn btn-danger" (click)="bulkDelete()">
            Delete
          </button>
          <button class="btn btn-ghost" (click)="clearSelection()">
            Clear Selection
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .product-list-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-title h1 {
      font-size: 28px;
      font-weight: 600;
      margin: 0;
    }

    .badge {
      background: var(--color-primary-light);
      color: var(--color-primary);
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 14px;
    }

    .filters-section {
      display: flex;
      gap: 16px;
      align-items: flex-end;
      margin-bottom: 24px;
      padding: 16px;
      background: var(--color-bg-secondary);
      border-radius: 8px;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .filter-group label {
      font-size: 12px;
      font-weight: 500;
      color: var(--color-text-secondary);
    }

    .filter-group input,
    .filter-group select {
      padding: 8px 12px;
      border: 1px solid var(--color-border);
      border-radius: 6px;
      font-size: 14px;
      min-width: 180px;
    }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .product-card {
      background: white;
      border: 1px solid var(--color-border);
      border-radius: 12px;
      overflow: hidden;
      transition: box-shadow 0.2s, transform 0.2s;
    }

    .product-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .product-card.selected {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px var(--color-primary-light);
    }

    .card-image {
      height: 180px;
      background: var(--color-bg-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .card-content {
      padding: 16px;
    }

    .product-name {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 4px;
    }

    .product-name a {
      color: inherit;
      text-decoration: none;
    }

    .product-name a:hover {
      color: var(--color-primary);
    }

    .product-code {
      font-size: 13px;
      color: var(--color-text-secondary);
      margin: 0 0 8px;
    }

    .product-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 12px;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-draft { background: #f0f0f0; color: #666; }
    .status-pending { background: #fff3cd; color: #856404; }
    .status-approved { background: #d4edda; color: #155724; }
    .status-active { background: #cce5ff; color: #004085; }
    .status-rejected { background: #f8d7da; color: #721c24; }

    .card-actions {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid var(--color-border);
    }

    .btn {
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: background 0.2s;
    }

    .btn-primary {
      background: var(--color-primary);
      color: white;
    }

    .btn-secondary {
      background: var(--color-bg-secondary);
      color: var(--color-text);
    }

    .btn-icon {
      padding: 8px;
      background: transparent;
    }

    .btn-icon:hover {
      background: var(--color-bg-secondary);
    }

    .loading-state,
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--color-text-secondary);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--color-border);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      margin-top: 32px;
    }

    .bulk-actions-bar {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 24px;
      background: var(--color-bg-dark);
      color: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }
  `]
})
export class ProductListComponent implements OnInit {
  readonly productService = inject(ProductService);

  // Local state signals
  readonly searchTerm = signal('');
  readonly selectedStatus = signal<ProductStatus | ''>('');
  readonly selectedCategory = signal('');
  readonly selectedProducts = signal<Set<string>>(new Set());
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly pageSize = signal(20);

  // Categories would come from a category service
  readonly categories = signal([
    { id: 'electronics', name: 'Electronics' },
    { id: 'clothing', name: 'Clothing' },
    { id: 'home', name: 'Home & Garden' },
    { id: 'sports', name: 'Sports & Outdoors' },
  ]);

  readonly statusOptions: { value: ProductStatus; label: string }[] = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved' },
    { value: 'active', label: 'Active' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'archived', label: 'Archived' },
  ];

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    const filters: ProductFilters = {};
    if (this.searchTerm()) filters.search = this.searchTerm();
    if (this.selectedStatus()) filters.status = this.selectedStatus() as ProductStatus;
    if (this.selectedCategory()) filters.categoryId = this.selectedCategory();

    this.productService.getProducts(
      this.currentPage(),
      this.pageSize(),
      filters
    ).subscribe(response => {
      this.totalPages.set(response.totalPages);
    });
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1);
    this.loadProducts();
  }

  onStatusChange(status: ProductStatus | ''): void {
    this.selectedStatus.set(status);
    this.currentPage.set(1);
    this.loadProducts();
  }

  onCategoryChange(categoryId: string): void {
    this.selectedCategory.set(categoryId);
    this.currentPage.set(1);
    this.loadProducts();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set('');
    this.selectedCategory.set('');
    this.currentPage.set(1);
    this.loadProducts();
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadProducts();
  }

  toggleProductSelection(productId: string): void {
    this.selectedProducts.update(selected => {
      const newSet = new Set(selected);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  }

  clearSelection(): void {
    this.selectedProducts.set(new Set());
  }

  viewSkus(product: Product): void {
    // Navigate to SKU list filtered by product
    // Router navigation would go here
  }

  submitForApproval(product: Product): void {
    this.productService.submitForApproval(product.id).subscribe();
  }

  bulkSubmitForApproval(): void {
    // Implement bulk submit
  }

  bulkDelete(): void {
    // Implement bulk delete with confirmation
  }
}
