import { Component, inject, signal, HostListener } from '@angular/core';
import { ThemeService } from './theme.service';
import { Theme } from './theme.tokens';

interface ThemeOption {
  value: Theme;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <div class="theme-toggle-wrap" [class.open]="open()">
      <button
        class="theme-btn"
        (click)="toggle()"
        [title]="'Theme: ' + themeService.resolvedTheme()"
        aria-haspopup="listbox"
        [attr.aria-expanded]="open()"
        aria-label="Toggle colour theme">
        <span class="theme-icon" aria-hidden="true">
          @if (themeService.resolvedTheme() === 'dark') {
            <!-- Moon -->
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
            </svg>
          } @else {
            <!-- Sun -->
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          }
        </span>
        <svg class="chevron" width="10" height="10" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M4.427 7.427l3.396 3.396a.25.25 0 00.354 0l3.396-3.396A.25.25 0 0011.396 7H4.604a.25.25 0 00-.177.427z"/>
        </svg>
      </button>

      @if (open()) {
        <div class="theme-dropdown" role="listbox" aria-label="Select theme">
          @for (opt of options; track opt.value) {
            <button
              class="theme-option"
              [class.active]="themeService.theme() === opt.value"
              role="option"
              [attr.aria-selected]="themeService.theme() === opt.value"
              (click)="select(opt.value)">
              <span class="opt-icon" aria-hidden="true">{{ opt.icon }}</span>
              <span class="opt-label">{{ opt.label }}</span>
              @if (themeService.theme() === opt.value) {
                <svg class="opt-check" width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
                </svg>
              }
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .theme-toggle-wrap {
      position: relative;
    }

    .theme-btn {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.3rem 0.5rem;
      border: 1px solid rgba(148, 163, 184, 0.25);
      border-radius: var(--radius-md, 0.5rem);
      background: var(--bg-card);
      color: var(--text-muted);
      cursor: pointer;
      font-size: 0.86rem;
      transition: background 0.12s, color 0.12s, border-color 0.12s;
      height: 32px;
    }

    .theme-btn:hover {
      background: var(--accent-light);
      color: var(--text);
      border-color: rgba(148, 163, 184, 0.4);
    }

    .theme-toggle-wrap.open .theme-btn {
      background: var(--accent-light);
      color: var(--text);
    }

    .theme-icon { display: flex; align-items: center; }

    .chevron {
      color: currentColor;
      opacity: 0.6;
      transition: transform 0.15s;
    }

    .theme-toggle-wrap.open .chevron { transform: rotate(180deg); }

    /* Dropdown */
    .theme-dropdown {
      position: absolute;
      top: calc(100% + 6px);
      right: 0;
      min-width: 140px;
      background: var(--bg-elevated, #1e293b);
      border: 1px solid var(--border, #334155);
      border-radius: var(--radius-lg, 0.75rem);
      box-shadow: var(--shadow-lg, 0 10px 28px rgba(0,0,0,0.25));
      overflow: hidden;
      z-index: 500;
      padding: 0.25rem;
    }

    .theme-option {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      width: 100%;
      padding: 0.5rem 0.65rem;
      background: none;
      border: none;
      border-radius: var(--radius-sm, 0.375rem);
      cursor: pointer;
      color: var(--text, #f1f5f9);
      font-size: 0.9rem;
      text-align: left;
      transition: background 0.1s;
    }

    .theme-option:hover { background: var(--accent-light, rgba(99,102,241,0.15)); }

    .theme-option.active {
      color: var(--accent, #818cf8);
      font-weight: 600;
    }

    .opt-icon { font-size: 0.95rem; flex-shrink: 0; }
    .opt-label { flex: 1; }

    .opt-check {
      color: var(--accent, #818cf8);
      flex-shrink: 0;
    }
  `],
})
export class ThemeToggleComponent {
  readonly themeService = inject(ThemeService);

  open = signal(false);

  readonly options: ThemeOption[] = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark',  label: 'Dark',  icon: '🌙' },
    { value: 'system', label: 'System', icon: '💻' },
  ];

  toggle(): void { this.open.update(v => !v); }

  select(theme: Theme): void {
    this.themeService.setTheme(theme);
    this.open.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (this.open() && !(e.target as Element).closest('app-theme-toggle')) {
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.open.set(false); }
}
