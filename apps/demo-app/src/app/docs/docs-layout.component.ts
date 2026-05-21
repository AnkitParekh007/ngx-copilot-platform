import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { DocsSidebarComponent } from './docs-sidebar.component';
import { DocsTocComponent } from './docs-toc.component';
import { DocsSearchComponent } from './docs-search.component';
import { DocsNavigationComponent } from './docs-navigation.component';
import { ThemeToggleComponent } from '../theme/theme-toggle.component';
import { DOCS_PAGES, DocPage } from './docs-data';

@Component({
  selector: 'app-docs-layout',
  standalone: true,
  imports: [RouterOutlet, DocsSidebarComponent, DocsTocComponent, DocsSearchComponent, DocsNavigationComponent, ThemeToggleComponent],
  template: `
    <!-- Mobile overlay -->
    @if (sidebarOpen()) {
      <div class="sidebar-overlay" (click)="sidebarOpen.set(false)" aria-hidden="true"></div>
    }

    <div class="docs-shell">
      <!-- ── Left sidebar ──────────────────────────── -->
      <aside class="docs-sidebar-col" [class.mobile-open]="sidebarOpen()">
        <div class="sidebar-inner">
          <div class="sidebar-close-row">
            <button class="btn-icon" (click)="sidebarOpen.set(false)" aria-label="Close navigation">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/>
              </svg>
            </button>
          </div>
          <div class="sidebar-search">
            <app-docs-search />
          </div>
          <app-docs-sidebar (navigate)="onSidebarNavigate()" />
        </div>
      </aside>

      <!-- ── Center content ────────────────────────── -->
      <main class="docs-content-col">
        <!-- Mobile topbar -->
        <div class="docs-mobile-bar">
          <button class="btn-icon btn-menu" (click)="sidebarOpen.set(true)" aria-label="Open navigation">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path fill-rule="evenodd" d="M1 2.75A.75.75 0 011.75 2h12.5a.75.75 0 110 1.5H1.75A.75.75 0 011 2.75zm0 5A.75.75 0 011.75 7h12.5a.75.75 0 110 1.5H1.75A.75.75 0 011 7.75zM1.75 12a.75.75 0 100 1.5h12.5a.75.75 0 100-1.5H1.75z"/>
            </svg>
          </button>
          <span class="mobile-bar-title">
            {{ currentPage()?.title ?? 'Documentation' }}
          </span>
          <div class="mobile-bar-end">
            <app-theme-toggle />
          </div>
        </div>

        <article class="docs-article">
          <router-outlet />
          @if (currentPage()) {
            <app-docs-navigation
              [prev]="currentPage()!.prev"
              [next]="currentPage()!.next"
              [editPath]="currentPage()!.editPath" />
          }
        </article>
      </main>

      <!-- ── Right TOC ─────────────────────────────── -->
      <aside class="docs-toc-col">
        @if (currentPage()?.headings?.length) {
          <div class="toc-sticky">
            <app-docs-toc [headings]="currentPage()!.headings" />
          </div>
        }
      </aside>
    </div>
  `,
  styles: [`
    /* ── Overlay ──────────────────────────────────── */
    .sidebar-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      backdrop-filter: blur(2px);
      z-index: 150;
    }

    /* ── Three-column shell ───────────────────────── */
    .docs-shell {
      display: grid;
      grid-template-columns: var(--sidebar-width) 1fr var(--toc-width);
      min-height: calc(100vh - var(--topnav-height));
      background: transparent;
    }

    /* ── Left sidebar ─────────────────────────────── */
    .docs-sidebar-col {
      position: sticky;
      top: var(--topnav-height);
      height: calc(100vh - var(--topnav-height));
      overflow-y: auto;
      overflow-x: hidden;
      background: var(--sidebar-bg);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-right: 1px solid var(--border);
      scrollbar-width: thin;
      scrollbar-color: var(--border-strong) transparent;
    }

    .docs-sidebar-col::-webkit-scrollbar { width: 4px; }
    .docs-sidebar-col::-webkit-scrollbar-track { background: transparent; }
    .docs-sidebar-col::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 2px; }

    .sidebar-inner { padding-bottom: 2rem; }

    .sidebar-close-row {
      display: none;
      justify-content: flex-end;
      padding: 0.5rem 0.75rem 0;
    }

    .sidebar-search { padding: 0.75rem 0.85rem 0.35rem; }

    /* ── Center content ───────────────────────────── */
    .docs-content-col {
      min-width: 0;
      display: flex;
      flex-direction: column;
      background: transparent;
    }

    .docs-mobile-bar {
      display: none;
      align-items: center;
      gap: 0.75rem;
      padding: 0.55rem 1rem;
      border-bottom: 1px solid var(--border);
      background: var(--nav-scrolled);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      position: sticky;
      top: var(--topnav-height);
      z-index: 10;
    }

    .mobile-bar-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }

    .mobile-bar-end {
      flex-shrink: 0;
      margin-left: auto;
    }

    .docs-article {
      padding: 2.25rem 3rem 3rem;
      max-width: var(--article-max);
    }

    /* ── Right TOC ────────────────────────────────── */
    .docs-toc-col {
      border-left: 1px solid var(--border);
      background: transparent;
    }

    .toc-sticky {
      position: sticky;
      top: calc(var(--topnav-height) + 1.5rem);
      max-height: calc(100vh - var(--topnav-height) - 3rem);
      overflow-y: auto;
      padding: 0 0.85rem;
      scrollbar-width: thin;
      scrollbar-color: var(--border-strong) transparent;
    }

    /* ── Utility buttons ─────────────────────────── */
    .btn-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      background: var(--bg);
      cursor: pointer;
      color: var(--text-muted);
      flex-shrink: 0;
    }

    .btn-icon:hover { background: var(--bg-subtle); color: var(--text); }

    /* ── Responsive ──────────────────────────────── */
    @media (max-width: 1100px) {
      .docs-shell { grid-template-columns: var(--sidebar-width) 1fr; }
      .docs-toc-col { display: none; }
      .docs-article { max-width: 100%; padding: 2rem; }
    }

    @media (max-width: 768px) {
      .docs-shell { grid-template-columns: 1fr; }

      .docs-sidebar-col {
        position: fixed;
        top: 0;
        left: -300px;
        width: 290px;
        height: 100dvh;
        z-index: 160;
        transition: left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: none;
      }

      .docs-sidebar-col.mobile-open {
        left: 0;
        box-shadow: var(--shadow-lg);
      }

      .sidebar-overlay { display: block; }
      .sidebar-close-row { display: flex; }
      .docs-mobile-bar { display: flex; }
      .docs-article { padding: 1.5rem 1.25rem 2rem; }
    }
  `],
})
export class DocsLayoutComponent implements OnInit, OnDestroy {
  private router = inject(Router);

  sidebarOpen = signal(false);
  currentPage = signal<DocPage | undefined>(undefined);

  private sub?: Subscription;

  ngOnInit(): void {
    this.updatePage();
    this.sub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.updatePage());
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  onSidebarNavigate(): void { this.sidebarOpen.set(false); }

  private updatePage(): void {
    const url = this.router.url.split('#')[0].split('?')[0];
    this.currentPage.set(DOCS_PAGES.find(p => p.path === url));
  }
}
