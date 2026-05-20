/**
 * SKU Service
 * RetailOps PXM - SKU Management
 */
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';
import { SKU, SKUStatus, SKUFilters, ValidationResult } from '../models/sku.model';

export interface SKUListResponse {
  items: SKU[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class SkuService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/skus';

  // Signals for reactive state
  private readonly _skus = signal<SKU[]>([]);
  private readonly _loading = signal(false);
  private readonly _selectedSku = signal<SKU | null>(null);
  private readonly _validationResults = signal<Map<string, ValidationResult[]>>(new Map());

  // Public computed signals
  readonly skus = this._skus.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly selectedSku = this._selectedSku.asReadonly();
  readonly validationResults = this._validationResults.asReadonly();

  readonly skuCount = computed(() => this._skus().length);
  readonly publishedSkus = computed(() =>
    this._skus().filter(s => s.status === 'published')
  );
  readonly draftSkus = computed(() =>
    this._skus().filter(s => s.status === 'draft')
  );

  /**
   * Fetch SKUs with optional filters
   */
  getSkus(
    page = 1,
    pageSize = 20,
    filters?: SKUFilters
  ): Observable<SKUListResponse> {
    this._loading.set(true);

    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (filters) {
      if (filters.productId) params = params.set('productId', filters.productId);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.search) params = params.set('search', filters.search);
      if (filters.hasErrors !== undefined) params = params.set('hasErrors', filters.hasErrors.toString());
    }

    return this.http.get<SKUListResponse>(this.baseUrl, { params }).pipe(
      tap(response => {
        this._skus.set(response.items);
        this._loading.set(false);
      }),
      catchError(error => {
        this._loading.set(false);
        console.error('[SkuService] Error fetching SKUs:', error);
        throw error;
      })
    );
  }

  /**
   * Get SKUs by product ID
   */
  getSkusByProduct(productId: string): Observable<SKU[]> {
    return this.http.get<SKU[]>(`${this.baseUrl}/by-product/${productId}`).pipe(
      tap(skus => this._skus.set(skus))
    );
  }

  /**
   * Get single SKU by ID
   */
  getSku(id: string): Observable<SKU> {
    return this.http.get<SKU>(`${this.baseUrl}/${id}`).pipe(
      tap(sku => this._selectedSku.set(sku))
    );
  }

  /**
   * Create new SKU
   */
  createSku(sku: Partial<SKU>): Observable<SKU> {
    return this.http.post<SKU>(this.baseUrl, sku).pipe(
      tap(created => {
        this._skus.update(skus => [...skus, created]);
      })
    );
  }

  /**
   * Update existing SKU
   */
  updateSku(id: string, updates: Partial<SKU>): Observable<SKU> {
    return this.http.patch<SKU>(`${this.baseUrl}/${id}`, updates).pipe(
      tap(updated => {
        this._skus.update(skus =>
          skus.map(s => s.id === id ? updated : s)
        );
        if (this._selectedSku()?.id === id) {
          this._selectedSku.set(updated);
        }
      })
    );
  }

  /**
   * Delete SKU
   */
  deleteSku(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        this._skus.update(skus => skus.filter(s => s.id !== id));
        if (this._selectedSku()?.id === id) {
          this._selectedSku.set(null);
        }
      })
    );
  }

  /**
   * Validate SKU against channel rules
   */
  validateSku(id: string, channelId?: string): Observable<ValidationResult[]> {
    const url = channelId
      ? `${this.baseUrl}/${id}/validate?channelId=${channelId}`
      : `${this.baseUrl}/${id}/validate`;
    
    return this.http.post<ValidationResult[]>(url, {}).pipe(
      tap(results => {
        this._validationResults.update(map => {
          const newMap = new Map(map);
          newMap.set(id, results);
          return newMap;
        });
      })
    );
  }

  /**
   * Bulk validate SKUs
   */
  bulkValidate(ids: string[], channelId?: string): Observable<Map<string, ValidationResult[]>> {
    return this.http.post<Record<string, ValidationResult[]>>(
      `${this.baseUrl}/bulk-validate`,
      { ids, channelId }
    ).pipe(
      map(response => new Map(Object.entries(response))),
      tap(results => this._validationResults.set(results))
    );
  }

  /**
   * Update SKU status
   */
  updateStatus(id: string, status: SKUStatus, reason?: string): Observable<SKU> {
    return this.http.post<SKU>(`${this.baseUrl}/${id}/status`, { status, reason }).pipe(
      tap(updated => {
        this._skus.update(skus =>
          skus.map(s => s.id === id ? updated : s)
        );
      })
    );
  }

  /**
   * Clear selection
   */
  clearSelection(): void {
    this._selectedSku.set(null);
  }
}
