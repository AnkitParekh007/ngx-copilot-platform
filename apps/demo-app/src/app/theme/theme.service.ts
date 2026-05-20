import { Injectable, signal, computed, effect } from '@angular/core';
import { Theme, ResolvedTheme, THEME_STORAGE_KEY } from './theme.tokens';

/**
 * ThemeService — manages light / dark / system theme switching for the demo site.
 *
 * - Persists choice in localStorage under `ngx-copilot-sdk:theme`
 * - Applies `data-theme` and `data-resolved-theme` on <html>
 * - Watches `prefers-color-scheme` media query for system preference
 * - Browser-safe: all browser API access is guarded
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _theme = signal<Theme>(this.readStorage());
  private readonly _systemPrefersDark = signal<boolean>(this.readSystemDark());

  /** Current user-selected theme (light | dark | system). */
  readonly theme = this._theme.asReadonly();

  /** Actual rendered theme after resolving 'system'. */
  readonly resolvedTheme = computed<ResolvedTheme>(() => {
    const t = this._theme();
    if (t === 'system') return this._systemPrefersDark() ? 'dark' : 'light';
    return t;
  });

  constructor() {
    // Apply theme whenever it changes
    effect(() => { this.applyToDocument(this._theme(), this.resolvedTheme()); });

    // Watch system media query
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', (e) => this._systemPrefersDark.set(e.matches));
    }
  }

  setTheme(theme: Theme): void {
    this._theme.set(theme);
    this.writeStorage(theme);
  }

  // ── Private helpers ─────────────────────────────────────────────────

  private readStorage(): Theme {
    if (typeof localStorage === 'undefined') return 'system';
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
    return 'system';
  }

  private writeStorage(theme: Theme): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }

  private readSystemDark(): boolean {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private applyToDocument(theme: Theme, resolved: ResolvedTheme): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.dataset['theme'] = theme;
    root.dataset['resolvedTheme'] = resolved;
    root.style.colorScheme = resolved;
  }
}
