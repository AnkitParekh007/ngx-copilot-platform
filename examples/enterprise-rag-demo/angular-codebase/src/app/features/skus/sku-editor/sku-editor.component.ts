/**
 * SKU Editor Component
 * RetailOps PXM - SKU Management
 */
import { Component, inject, signal, computed, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SkuService } from '../../../core/services/sku.service';
import { SKU, SKUStatus, ValidationResult } from '../../../core/models/sku.model';

@Component({
  selector: 'app-sku-editor',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="sku-editor" data-testid="sku-editor">
      <!-- Header -->
      <header class="editor-header">
        <div class="header-left">
          <button class="btn btn-ghost" (click)="goBack()" data-testid="back-btn">
            <i class="icon-arrow-left"></i>
            Back
          </button>
          <div class="header-title">
            <h1>{{ isEditMode() ? 'Edit SKU' : 'Create SKU' }}</h1>
            @if (sku()) {
              <span class="sku-code">{{ sku()?.skuCode }}</span>
            }
          </div>
        </div>
        <div class="header-actions">
          @if (sku()) {
            <span 
              class="status-badge"
              [class]="'status-' + sku()?.status"
              data-testid="sku-status">
              {{ sku()?.status | titlecase }}
            </span>
          }
          <button 
            class="btn btn-secondary" 
            (click)="validateSku()"
            [disabled]="!isEditMode()"
            data-testid="validate-btn">
            Validate
          </button>
          <button 
            class="btn btn-primary" 
            (click)="saveSku()"
            [disabled]="!skuForm.valid || saving()"
            data-testid="save-btn">
            @if (saving()) {
              Saving...
            } @else {
              Save SKU
            }
          </button>
        </div>
      </header>

      <!-- Validation Errors -->
      @if (validationErrors().length > 0) {
        <div class="validation-banner error" data-testid="validation-errors">
          <i class="icon-alert-circle"></i>
          <div class="validation-content">
            <strong>Validation Errors ({{ validationErrors().length }})</strong>
            <ul>
              @for (error of validationErrors(); track error.field) {
                <li>{{ error.field }}: {{ error.message }}</li>
              }
            </ul>
          </div>
        </div>
      }

      <!-- Form -->
      <form [formGroup]="skuForm" class="editor-form" data-testid="sku-form">
        <!-- Basic Information -->
        <section class="form-section">
          <h2>Basic Information</h2>
          
          <div class="form-row">
            <div class="form-group">
              <label for="skuCode">SKU Code *</label>
              <input
                id="skuCode"
                type="text"
                formControlName="skuCode"
                placeholder="e.g., PROD-001-BLK-L"
                data-testid="sku-code-input"
              />
              @if (skuForm.get('skuCode')?.errors?.['required'] && skuForm.get('skuCode')?.touched) {
                <span class="error-text">SKU Code is required</span>
              }
            </div>

            <div class="form-group">
              <label for="upc">UPC / Barcode</label>
              <input
                id="upc"
                type="text"
                formControlName="upc"
                placeholder="e.g., 012345678901"
                data-testid="upc-input"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="name">Display Name *</label>
              <input
                id="name"
                type="text"
                formControlName="name"
                placeholder="SKU display name"
                data-testid="name-input"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              formControlName="description"
              rows="4"
              placeholder="SKU description..."
              data-testid="description-input"
            ></textarea>
          </div>
        </section>

        <!-- Pricing -->
        <section class="form-section">
          <h2>Pricing</h2>
          
          <div class="form-row">
            <div class="form-group">
              <label for="listPrice">List Price *</label>
              <div class="input-with-prefix">
                <span class="prefix">$</span>
                <input
                  id="listPrice"
                  type="number"
                  step="0.01"
                  formControlName="listPrice"
                  placeholder="0.00"
                  data-testid="list-price-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="salePrice">Sale Price</label>
              <div class="input-with-prefix">
                <span class="prefix">$</span>
                <input
                  id="salePrice"
                  type="number"
                  step="0.01"
                  formControlName="salePrice"
                  placeholder="0.00"
                  data-testid="sale-price-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="costPrice">Cost Price</label>
              <div class="input-with-prefix">
                <span class="prefix">$</span>
                <input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  formControlName="costPrice"
                  placeholder="0.00"
                  data-testid="cost-price-input"
                />
              </div>
            </div>
          </div>

          @if (marginPercent() !== null) {
            <div class="calculated-field">
              <span>Calculated Margin:</span>
              <strong [class.positive]="marginPercent()! > 0" [class.negative]="marginPercent()! < 0">
                {{ marginPercent() | number:'1.1-1' }}%
              </strong>
            </div>
          }
        </section>

        <!-- Inventory -->
        <section class="form-section">
          <h2>Inventory</h2>
          
          <div class="form-row">
            <div class="form-group">
              <label for="quantity">Available Quantity *</label>
              <input
                id="quantity"
                type="number"
                formControlName="quantity"
                placeholder="0"
                data-testid="quantity-input"
              />
            </div>

            <div class="form-group">
              <label for="reservedQuantity">Reserved Quantity</label>
              <input
                id="reservedQuantity"
                type="number"
                formControlName="reservedQuantity"
                placeholder="0"
                data-testid="reserved-quantity-input"
              />
            </div>

            <div class="form-group">
              <label for="reorderPoint">Reorder Point</label>
              <input
                id="reorderPoint"
                type="number"
                formControlName="reorderPoint"
                placeholder="10"
                data-testid="reorder-point-input"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="warehouseLocation">Warehouse Location</label>
              <input
                id="warehouseLocation"
                type="text"
                formControlName="warehouseLocation"
                placeholder="e.g., A-12-3"
                data-testid="warehouse-location-input"
              />
            </div>
          </div>
        </section>

        <!-- Attributes -->
        <section class="form-section">
          <h2>Variant Attributes</h2>
          
          <div class="form-row">
            <div class="form-group">
              <label for="size">Size</label>
              <select id="size" formControlName="size" data-testid="size-select">
                <option value="">Select Size</option>
                @for (size of sizeOptions; track size) {
                  <option [value]="size">{{ size }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label for="color">Color</label>
              <select id="color" formControlName="color" data-testid="color-select">
                <option value="">Select Color</option>
                @for (color of colorOptions; track color) {
                  <option [value]="color">{{ color }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label for="material">Material</label>
              <input
                id="material"
                type="text"
                formControlName="material"
                placeholder="e.g., Cotton"
                data-testid="material-input"
              />
            </div>
          </div>
        </section>

        <!-- Dimensions -->
        <section class="form-section">
          <h2>Dimensions & Weight</h2>
          
          <div class="form-row">
            <div class="form-group">
              <label for="weight">Weight (kg)</label>
              <input
                id="weight"
                type="number"
                step="0.01"
                formControlName="weight"
                placeholder="0.00"
                data-testid="weight-input"
              />
            </div>

            <div class="form-group">
              <label for="length">Length (cm)</label>
              <input
                id="length"
                type="number"
                step="0.1"
                formControlName="length"
                placeholder="0"
                data-testid="length-input"
              />
            </div>

            <div class="form-group">
              <label for="width">Width (cm)</label>
              <input
                id="width"
                type="number"
                step="0.1"
                formControlName="width"
                placeholder="0"
                data-testid="width-input"
              />
            </div>

            <div class="form-group">
              <label for="height">Height (cm)</label>
              <input
                id="height"
                type="number"
                step="0.1"
                formControlName="height"
                placeholder="0"
                data-testid="height-input"
              />
            </div>
          </div>
        </section>
      </form>

      <!-- Actions Footer -->
      <footer class="editor-footer">
        <div class="footer-left">
          @if (isEditMode() && sku()?.status === 'draft') {
            <button 
              class="btn btn-danger" 
              (click)="deleteSku()"
              data-testid="delete-btn">
              Delete SKU
            </button>
          }
        </div>
        <div class="footer-right">
          <button class="btn btn-secondary" (click)="goBack()">Cancel</button>
          @if (sku()?.status === 'draft') {
            <button 
              class="btn btn-primary"
              (click)="submitForApproval()"
              [disabled]="!skuForm.valid"
              data-testid="submit-approval-btn">
              Submit for Approval
            </button>
          }
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .sku-editor {
      max-width: 900px;
      margin: 0 auto;
      padding: 24px;
    }

    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--color-border);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-title h1 {
      font-size: 24px;
      font-weight: 600;
      margin: 0;
    }

    .sku-code {
      font-size: 14px;
      color: var(--color-text-secondary);
      font-family: monospace;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .validation-banner {
      display: flex;
      gap: 12px;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .validation-banner.error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
    }

    .validation-banner ul {
      margin: 8px 0 0;
      padding-left: 20px;
    }

    .form-section {
      background: white;
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }

    .form-section h2 {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--color-border);
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    .form-row:last-child {
      margin-bottom: 0;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-group label {
      font-size: 14px;
      font-weight: 500;
      color: var(--color-text-secondary);
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      padding: 10px 12px;
      border: 1px solid var(--color-border);
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-light);
    }

    .input-with-prefix {
      display: flex;
      align-items: stretch;
    }

    .input-with-prefix .prefix {
      display: flex;
      align-items: center;
      padding: 0 12px;
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border);
      border-right: none;
      border-radius: 6px 0 0 6px;
      color: var(--color-text-secondary);
    }

    .input-with-prefix input {
      border-radius: 0 6px 6px 0;
      flex: 1;
    }

    .error-text {
      font-size: 12px;
      color: #dc2626;
    }

    .calculated-field {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: var(--color-bg-secondary);
      border-radius: 6px;
      font-size: 14px;
    }

    .calculated-field .positive { color: #16a34a; }
    .calculated-field .negative { color: #dc2626; }

    .status-badge {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
    }

    .status-draft { background: #f0f0f0; color: #666; }
    .status-pending { background: #fff3cd; color: #856404; }
    .status-approved { background: #d4edda; color: #155724; }
    .status-published { background: #cce5ff; color: #004085; }

    .editor-footer {
      display: flex;
      justify-content: space-between;
      padding-top: 24px;
      border-top: 1px solid var(--color-border);
    }

    .footer-right {
      display: flex;
      gap: 12px;
    }

    .btn {
      padding: 10px 20px;
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

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: var(--color-bg-secondary);
      color: var(--color-text);
      border: 1px solid var(--color-border);
    }

    .btn-danger {
      background: #dc2626;
      color: white;
    }

    .btn-ghost {
      background: transparent;
      color: var(--color-text-secondary);
    }

    .btn-ghost:hover {
      background: var(--color-bg-secondary);
    }
  `]
})
export class SkuEditorComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly skuService = inject(SkuService);

  // Signals
  readonly sku = signal<SKU | null>(null);
  readonly saving = signal(false);
  readonly validationErrors = signal<ValidationResult[]>([]);

  readonly isEditMode = computed(() => !!this.sku());
  
  readonly marginPercent = computed(() => {
    const listPrice = this.skuForm.get('listPrice')?.value;
    const costPrice = this.skuForm.get('costPrice')?.value;
    if (listPrice && costPrice && listPrice > 0) {
      return ((listPrice - costPrice) / listPrice) * 100;
    }
    return null;
  });

  // Form
  skuForm: FormGroup = this.fb.group({
    skuCode: ['', Validators.required],
    upc: [''],
    name: ['', Validators.required],
    description: [''],
    listPrice: [null, [Validators.required, Validators.min(0)]],
    salePrice: [null, Validators.min(0)],
    costPrice: [null, Validators.min(0)],
    quantity: [0, [Validators.required, Validators.min(0)]],
    reservedQuantity: [0, Validators.min(0)],
    reorderPoint: [10, Validators.min(0)],
    warehouseLocation: [''],
    size: [''],
    color: [''],
    material: [''],
    weight: [null],
    length: [null],
    width: [null],
    height: [null],
  });

  // Options
  sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];
  colorOptions = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink', 'Gray', 'Brown', 'Navy'];

  ngOnInit(): void {
    const skuId = this.route.snapshot.paramMap.get('id');
    if (skuId && skuId !== 'new') {
      this.loadSku(skuId);
    }
  }

  loadSku(id: string): void {
    this.skuService.getSku(id).subscribe(sku => {
      this.sku.set(sku);
      this.skuForm.patchValue({
        skuCode: sku.skuCode,
        upc: sku.upc,
        name: sku.name,
        description: sku.description,
        listPrice: sku.pricing.listPrice,
        salePrice: sku.pricing.salePrice,
        costPrice: sku.pricing.costPrice,
        quantity: sku.inventory.quantity,
        reservedQuantity: sku.inventory.reservedQuantity,
        reorderPoint: sku.inventory.reorderPoint,
        warehouseLocation: sku.inventory.warehouseLocation,
        size: sku.attributes['size'] || '',
        color: sku.attributes['color'] || '',
        material: sku.attributes['material'] || '',
        weight: sku.dimensions?.weight,
        length: sku.dimensions?.length,
        width: sku.dimensions?.width,
        height: sku.dimensions?.height,
      });
    });
  }

  saveSku(): void {
    if (!this.skuForm.valid) return;

    this.saving.set(true);
    const formValue = this.skuForm.value;

    const skuData: Partial<SKU> = {
      skuCode: formValue.skuCode,
      upc: formValue.upc,
      name: formValue.name,
      description: formValue.description,
      pricing: {
        listPrice: formValue.listPrice,
        salePrice: formValue.salePrice,
        costPrice: formValue.costPrice,
        currency: 'USD',
      },
      inventory: {
        quantity: formValue.quantity,
        reservedQuantity: formValue.reservedQuantity,
        reorderPoint: formValue.reorderPoint,
        warehouseLocation: formValue.warehouseLocation,
      },
      attributes: {
        size: formValue.size,
        color: formValue.color,
        material: formValue.material,
      },
      dimensions: {
        weight: formValue.weight,
        length: formValue.length,
        width: formValue.width,
        height: formValue.height,
        unit: 'cm',
      },
    };

    const operation = this.isEditMode()
      ? this.skuService.updateSku(this.sku()!.id, skuData)
      : this.skuService.createSku(skuData);

    operation.subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.sku.set(saved);
        // Show success toast
      },
      error: (err) => {
        this.saving.set(false);
        console.error('Error saving SKU:', err);
      }
    });
  }

  validateSku(): void {
    if (!this.sku()) return;
    
    this.skuService.validateSku(this.sku()!.id).subscribe(results => {
      const errors = results.filter(r => r.severity === 'error');
      this.validationErrors.set(errors);
    });
  }

  submitForApproval(): void {
    if (!this.sku()) return;
    
    this.skuService.updateStatus(this.sku()!.id, 'pending_approval').subscribe(updated => {
      this.sku.set(updated);
    });
  }

  deleteSku(): void {
    if (!this.sku() || !confirm('Are you sure you want to delete this SKU?')) return;
    
    this.skuService.deleteSku(this.sku()!.id).subscribe(() => {
      this.goBack();
    });
  }

  goBack(): void {
    this.router.navigate(['/skus']);
  }
}
