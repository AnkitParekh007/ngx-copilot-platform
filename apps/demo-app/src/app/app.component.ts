import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { ThemeToggleComponent } from './theme/theme-toggle.component';
import { ThemeService } from './theme/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ThemeToggleComponent],
  template: `
    <header class="top" [class.docs-mode]="isDocsRoute()">
      <div class="top-inner">
        <a routerLink="/" class="logo" aria-label="ngx-copilot-sdk home">
          <span class="logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="4" fill="#4f46e5"/>
              <path d="M8 12h8M8 8h5M8 16h6" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </span>
          <span class="logo-text">ngx-copilot-sdk</span>
          <span class="logo-badge">Preview</span>
        </a>

        <nav class="nav-links" aria-label="Main navigation">
          <a routerLink="/docs" routerLinkActive="active">Docs</a>
          <a routerLink="/showcase" routerLinkActive="active">Showcase</a>
          <a routerLink="/samples/enterprise-codebase" routerLinkActive="active">Codebase Demo</a>
          <a routerLink="/samples/enterprise-docs" routerLinkActive="active">Docs Demo</a>
        </nav>

        <div class="nav-end">
          <!-- Theme toggle -->
          <app-theme-toggle />

          <!-- npm -->
          <a href="https://www.npmjs.com/package/@ankitparekh007/ngx-copilot-sdk"
             target="_blank" rel="noopener noreferrer" class="icon-link" aria-label="View on npm">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331z"/>
            </svg>
          </a>

          <!-- GitHub -->
          <a href="https://github.com/AnkitParekh007/ngx-copilot-sdk"
             target="_blank" rel="noopener noreferrer" class="icon-link" aria-label="View on GitHub">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
          </a>

          <!-- Mobile hamburger -->
          <button class="mobile-menu-btn" (click)="mobileNavOpen.set(!mobileNavOpen())" aria-label="Toggle menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile nav dropdown -->
      @if (mobileNavOpen()) {
        <nav class="mobile-nav" aria-label="Mobile navigation">
          <a routerLink="/" (click)="mobileNavOpen.set(false)">Home</a>
          <a routerLink="/docs" (click)="mobileNavOpen.set(false)">Docs</a>
          <a routerLink="/showcase" (click)="mobileNavOpen.set(false)">Showcase</a>
          <a routerLink="/samples/enterprise-codebase" (click)="mobileNavOpen.set(false)">Codebase Demo</a>
          <a routerLink="/samples/enterprise-docs" (click)="mobileNavOpen.set(false)">Docs Demo</a>
          <a href="https://github.com/AnkitParekh007/ngx-copilot-sdk"
             target="_blank" rel="noopener noreferrer" (click)="mobileNavOpen.set(false)">GitHub &#8599;</a>
        </nav>
      }
    </header>

    <main class="page" [class.docs-main]="isDocsRoute()">
      <router-outlet />
    </main>

    @if (!isDocsRoute()) {
      <footer class="footer">
        <span>&#64;ankitparekh007/ngx-copilot-sdk &middot; 0.1.0 preview &middot; MIT</span>
        <span class="footer-sep">&middot;</span>
        <span>RetailOps PXM is fictional demo data &mdash; not a real product or company.</span>
      </footer>
    }
  `,
  styles: [`
    .top {
      display: flex;
      flex-direction: column;
      background: #0f172a;
      color: #fff;
      position: sticky;
      top: 0;
      z-index: 200;
      border-bottom: 1px solid rgba(148,163,184,0.15);
      height: var(--topnav-height, 52px);
      justify-content: center;
      overflow: visible;
    }

    .top-inner {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0 1.25rem;
      height: 52px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      text-decoration: none;
      flex-shrink: 0;
      margin-right: 0.5rem;
    }

    .logo:hover { text-decoration: none; }
    .logo-icon { display: flex; align-items: center; flex-shrink: 0; }

    .logo-text {
      font-size: 0.95rem;
      font-weight: 700;
      color: #f8fafc;
      letter-spacing: -0.01em;
    }

    .logo-badge {
      font-size: 0.65rem;
      background: rgba(99,102,241,0.35);
      color: #a5b4fc;
      border: 1px solid rgba(99,102,241,0.4);
      padding: 0.15rem 0.5rem;
      border-radius: 999px;
      font-weight: 600;
      letter-spacing: 0.03em;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.1rem;
      flex: 1;
    }

    .nav-links a {
      color: #94a3b8;
      text-decoration: none;
      padding: 0.3rem 0.65rem;
      border-radius: 6px;
      font-size: 0.875rem;
      white-space: nowrap;
      transition: background 0.12s, color 0.12s;
    }

    .nav-links a:hover { background: rgba(255,255,255,0.07); color: #e2e8f0; text-decoration: none; }
    .nav-links a.active { color: #fff; background: rgba(99,102,241,0.25); }

    .nav-end {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      margin-left: auto;
      flex-shrink: 0;
    }

    .icon-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      color: #94a3b8;
      transition: background 0.12s, color 0.12s;
    }

    .icon-link:hover { background: rgba(255,255,255,0.08); color: #f8fafc; text-decoration: none; }

    .mobile-menu-btn {
      display: none;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      color: #94a3b8;
      cursor: pointer;
      border-radius: 6px;
      transition: background 0.12s, color 0.12s;
    }

    .mobile-menu-btn:hover { background: rgba(255,255,255,0.08); color: #f8fafc; }

    .mobile-nav {
      display: flex;
      flex-direction: column;
      background: #0f172a;
      border-top: 1px solid rgba(148,163,184,0.12);
      padding: 0.5rem 0;
    }

    .mobile-nav a {
      display: block;
      padding: 0.65rem 1.25rem;
      color: #cbd5e1;
      text-decoration: none;
      font-size: 0.9rem;
      transition: background 0.1s;
    }

    .mobile-nav a:hover { background: rgba(255,255,255,0.06); color: #f8fafc; text-decoration: none; }

    .page { min-height: calc(100vh - 52px); }

    .page:not(.docs-main) {
      padding: 1.5rem 1.25rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .footer {
      padding: 1rem 1.25rem;
      background: #0f172a;
      color: #64748b;
      font-size: 0.82rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      align-items: center;
      border-top: 1px solid rgba(148,163,184,0.1);
    }

    .footer-sep { color: #334155; }

    @media (max-width: 768px) {
      .nav-links { display: none; }
      .mobile-menu-btn { display: flex; }
      .top { height: auto; }
    }

    /* Docs mode: let docs layout handle full height */
    .docs-main { padding: 0; max-width: none; margin: 0; }
  `],
})
export class AppComponent {
  private router = inject(Router);
  // Eagerly inject so theme is applied on startup before first render
  private _theme = inject(ThemeService);

  isDocsRoute = signal(false);
  mobileNavOpen = signal(false);

  constructor() {
    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        this.isDocsRoute.set(e.urlAfterRedirects.startsWith('/docs'));
        this.mobileNavOpen.set(false);
      }
    });
  }
}
