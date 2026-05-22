import { Component, signal, ElementRef, ViewChild, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DOCS_PAGES, DocPage } from './docs-data';

@Component({
  selector: 'app-docs-search',
  standalone: true,
  template: `
    <div class="search-wrap" [class.open]="isOpen()">
      <div class="search-field" (click)="open()">
        <svg class="search-icon" width="13" height="13" viewBox="0 0 16 16" fill="none">
          <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" stroke-width="1.5"/>
          <path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <input
          #searchInput
          type="search"
          class="search-input"
          placeholder="Search docs…"
          autocomplete="off"
          [value]="query()"
          (input)="onInput($event)"
          (keydown)="onKeydown($event)"
          (focus)="isOpen.set(true)"
          aria-label="Search documentation"
          aria-autocomplete="list"
          [attr.aria-expanded]="isOpen()" />
        <kbd class="search-kbd" aria-hidden="true">⌘K</kbd>
      </div>

      @if (isOpen()) {
        <div class="search-dropdown" role="listbox" aria-label="Search results">
          @if (query().length < 2) {
            <div class="search-hint">Type to search docs…</div>
          } @else if (results().length) {
            @for (r of results(); track r.path; let i = $index) {
              <button
                class="search-result"
                [class.focused]="focusedIndex() === i"
                role="option"
                [attr.aria-selected]="focusedIndex() === i"
                (click)="navigate(r.path)"
                (mouseenter)="focusedIndex.set(i)">
                <span class="result-category">{{ r.category }}</span>
                <span class="result-title">{{ r.title }}</span>
                @if (r.description) {
                  <span class="result-desc">{{ r.description }}</span>
                }
              </button>
            }
          } @else {
            <div class="search-empty">
              No results for <strong>"{{ query() }}"</strong>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .search-wrap { position: relative; }

    .search-field {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.4rem 0.65rem;
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-md);
      background: var(--bg);
      cursor: text;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .search-wrap.open .search-field,
    .search-field:focus-within {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-light);
    }

    .search-icon { color: var(--text-subtle); flex-shrink: 0; }

    .search-input {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      font-size: 0.92rem;
      color: var(--text);
      min-width: 0;
    }

    .search-input::placeholder { color: var(--text-subtle); }
    .search-input::-webkit-search-cancel-button { display: none; }

    .search-kbd {
      font-size: 0.72rem;
      background: var(--bg-subtle);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-xs);
      padding: 0.1rem 0.35rem;
      color: var(--text-subtle);
      font-family: inherit;
      flex-shrink: 0;
    }

    .search-dropdown {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      right: 0;
      background: var(--bg-elevated);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      z-index: 300;
      overflow: hidden;
      max-height: 380px;
      overflow-y: auto;
    }

    .search-hint,
    .search-empty {
      padding: 1rem 1.1rem;
      font-size: 0.9rem;
      color: var(--text-muted);
      text-align: center;
    }

    .search-empty strong { color: var(--text); }

    .search-result {
      display: grid;
      gap: 0.15rem;
      padding: 0.7rem 1rem;
      text-align: left;
      background: none;
      border: none;
      border-top: 1px solid var(--border);
      cursor: pointer;
      width: 100%;
      transition: background 0.1s;
    }

    .search-result:first-of-type { border-top: none; }
    .search-result:hover,
    .search-result.focused { background: var(--accent-light); }

    .result-category {
      font-size: 0.74rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: var(--accent);
    }

    .result-title {
      font-size: 0.94rem;
      font-weight: 600;
      color: var(--text);
    }

    .result-desc {
      font-size: 0.84rem;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `],
})
export class DocsSearchComponent {
  @ViewChild('searchInput') searchInputRef?: ElementRef<HTMLInputElement>;

  private router = inject(Router);

  query = signal('');
  isOpen = signal(false);
  focusedIndex = signal(-1);
  results = signal<DocPage[]>([]);

  open(): void {
    this.isOpen.set(true);
    setTimeout(() => this.searchInputRef?.nativeElement.focus(), 50);
  }

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.query.set(val);
    this.focusedIndex.set(-1);
    this.results.set(this.search(val));
  }

  onKeydown(event: KeyboardEvent): void {
    const res = this.results();
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.focusedIndex.set(Math.min(this.focusedIndex() + 1, res.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.focusedIndex.set(Math.max(this.focusedIndex() - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const idx = this.focusedIndex();
      if (idx >= 0 && res[idx]) this.navigate(res[idx].path);
      else if (res.length) this.navigate(res[0].path);
    } else if (event.key === 'Escape') {
      this.close();
    }
  }

  navigate(path: string): void {
    this.router.navigateByUrl(path);
    this.close();
  }

  close(): void {
    this.isOpen.set(false);
    this.query.set('');
    this.results.set([]);
    this.focusedIndex.set(-1);
  }

  @HostListener('document:keydown', ['$event'])
  onGlobalKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.open();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    if (this.isOpen() && !(event.target as Element).closest('app-docs-search')) {
      this.close();
    }
  }

  private search(q: string): DocPage[] {
    if (q.length < 2) return [];
    const term = q.toLowerCase();
    return DOCS_PAGES.filter(p =>
      p.title.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term) ||
      p.tags.some(t => t.includes(term)) ||
      p.category.toLowerCase().includes(term)
    ).slice(0, 8);
  }
}
