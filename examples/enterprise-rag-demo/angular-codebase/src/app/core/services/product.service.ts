/**
 * Product Service
 * RetailOps PXM - Product Management
 */
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map, catchError, of } from 'rxjs';
import { Product, ProductStatus, ProductFilters } from '../models/product.model';

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/products';

  // Signals for reactive state
  private readonly _products = signal<Product[]>([]);
  private readonly _loading = signal(false);
  private readonly _selectedProduct = signal<Product | null>(null);
  private readonly _filters = signal<ProductFilters>({});
  
  // Public computed signals
  readonly products = this._products.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly selectedProduct = this._selectedProduct.asReadonly();
  readonly filters = this._filters.asReadonly();

  readonly productCount = computed(() => this._products().length);
  readonly activeProducts = computed(() => 
    this._products().filter(p => p.status === 'active')
  );

  /**
   * Fetch products with optional filters
   */
  getProducts(
    page = 1, 
    pageSize = 20, 
    filters?: ProductFilters
  ): Observable<ProductListResponse> {
    this._loading.set(true);
    
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
      if (filters.supplierId) params = params.set('supplierId', filters.supplierId);
      if (filters.search) params = params.set('search', filters.search);
      if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom.toISOString());
      if (filters.dateTo) params = params.set('dateTo', filters.dateTo.toISOString());
    }

    return this.http.get<ProductListResponse>(this.baseUrl, { params }).pipe(
      tap(response => {
        this._products.set(response.items);
        this._loading.set(false);
      }),
      catchError(error => {
        this._loading.set(false);
        console.error('[ProductService] Error fetching products:', error);
        throw error;
      })
    );
  }

  /**
   * Get single product by ID
   */
  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`).pipe(
      tap(product => this._selectedProduct.set(product))
    );
  }

  /**
   * Create new product
   */
  createProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, product).pipe(
      tap(created => {
        this._products.update(products => [...products, created]);
      })
    );
  }

  /**
   * Update existing product
   */
  updateProduct(id: string, updates: Partial<Product>): Observable<Product> {
    return this.http.patch<Product>(`${this.baseUrl}/${id}`, updates).pipe(
      tap(updated => {
        this._products.update(products =>
          products.map(p => p.id === id ? updated : p)
        );
        if (this._selectedProduct()?.id === id) {
          this._selectedProduct.set(updated);
        }
      })
    );
  }

  /**
   * Delete product
   */
  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        this._products.update(products => 
          products.filter(p => p.id !== id)
        );
        if (this._selectedProduct()?.id === id) {
          this._selectedProduct.set(null);
        }
      })
    );
  }

  /**
   * Submit product for approval
   */
  submitForApproval(id: string): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/${id}/submit-approval`, {}).pipe(
      tap(updated => {
        this._products.update(products =>
          products.map(p => p.id === id ? updated : p)
        );
      })
    );
  }

  /**
   * Approve product
   */
  approveProduct(id: string, comments?: string): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/${id}/approve`, { comments }).pipe(
      tap(updated => {
        this._products.update(products =>
          products.map(p => p.id === id ? updated : p)
        );
      })
    );
  }

  /**
   * Reject product
   */
  rejectProduct(id: string, reason: string): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/${id}/reject`, { reason }).pipe(
      tap(updated => {
        this._products.update(products =>
          products.map(p => p.id === id ? updated : p)
        );
      })
    );
  }

  /**
   * Update filters
   */
  setFilters(filters: ProductFilters): void {
    this._filters.set(filters);
  }

  /**
   * Clear selected product
   */
  clearSelection(): void {
    this._selectedProduct.set(null);
  }
}
