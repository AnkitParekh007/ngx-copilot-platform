import { Component, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SIDEBAR_NAV } from './docs-data';

@Component({
  selector: 'app-docs-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <!-- Brand header -->
    <div class="sidebar-brand">
      <div class="sidebar-brand-logo">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="4" fill="url(#sb-grad)"/>
          <path d="M8 12h8M8 8h5M8 16h6" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
          <defs>
            <linearGradient id="sb-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#4f46e5"/>
              <stop offset="100%" stop-color="#7c3aed"/>
            </linearGradient>
          </defs>
        </svg>
        <span class="sidebar-brand-name">ngx-copilot-sdk</span>
      </div>
      <span class="sidebar-brand-version">v0.1.0</span>
    </div>

    <!-- Nav sections -->
    <nav class="sidebar-nav" aria-label="Documentation navigation">
      @for (section of nav; track section.section) {
        <div class="nav-section">
          <div class="nav-section-heading">
            <span class="nav-section-dot" aria-hidden="true"></span>
            {{ section.section }}
          </div>
          @for (item of section.items; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="nav-item"
              (click)="navigate.emit()">
              {{ item.label }}
              @if (item.badge) {
                <span class="nav-item-badge">{{ item.badge }}</span>
              }
            </a>
          }
        </div>
      }
    </nav>

    <!-- Sidebar footer -->
    <div class="sidebar-footer">
      <a href="https://github.com/AnkitParekh007/ngx-copilot-platform" target="_blank" rel="noopener noreferrer" class="sidebar-footer-link">
        Star on GitHub &#8599;
      </a>
      <a href="https://www.npmjs.com/package/@ankitparekh007/ngx-copilot-sdk" target="_blank" rel="noopener noreferrer" class="sidebar-footer-link">
        View on npm &#8599;
      </a>
    </div>
  `,
  styles: [`
    /* ── Brand header ── */
    .sidebar-brand {
      padding: 1rem 1rem 0.75rem;
      border-bottom: 1px solid var(--border);
      background: var(--bg-card);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .sidebar-brand-logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .sidebar-brand-name {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text);
      letter-spacing: -0.01em;
      font-family: monospace;
    }

    .sidebar-brand-version {
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--pill-accent-text, var(--accent-text));
      background: var(--pill-accent-bg, var(--accent-light));
      border: 1px solid var(--pill-accent-border, rgba(91,140,255,0.38));
      padding: 0.1rem 0.45rem;
      border-radius: 999px;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }

    /* ── Nav ── */
    .sidebar-nav { padding: 0.25rem 0 0.5rem; flex: 1; overflow-y: auto; }

    .nav-section { margin-bottom: 0.15rem; }

    .nav-section-heading {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.74rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.09em;
      color: var(--text-subtle);
      padding: 1rem 1rem 0.3rem;
    }

    .nav-section-dot {
      display: inline-block;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--accent-2);
      opacity: 0.7;
      flex-shrink: 0;
    }

    .nav-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.4rem 1rem 0.4rem 1.5rem;
      font-size: 0.93rem;
      color: var(--text-muted);
      text-decoration: none;
      border-left: 2px solid transparent;
      transition: background 0.1s, color 0.1s, border-color 0.1s;
      line-height: 1.4;
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
      margin-right: 0.5rem;
    }

    .nav-item:hover {
      background: var(--accent-light);
      color: var(--accent-text);
      text-decoration: none;
    }

    .nav-item.active {
      background: linear-gradient(90deg, rgba(91, 140, 255, 0.12), transparent);
      color: var(--accent-text);
      border-left-color: var(--accent);
      font-weight: 600;
    }

    .nav-item-badge {
      font-size: 0.68rem;
      background: var(--accent-light);
      color: var(--accent-text);
      padding: 0.08rem 0.4rem;
      border-radius: 999px;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    /* ── Sidebar footer ── */
    .sidebar-footer {
      border-top: 1px solid var(--border);
      background: transparent;
      padding: 0.85rem 1rem;
      margin-top: auto;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      flex-shrink: 0;
    }

    .sidebar-footer-link {
      font-size: 0.84rem;
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.12s;
    }

    .sidebar-footer-link:hover {
      color: var(--accent-2);
      text-decoration: none;
    }
  `],
})
export class DocsSidebarComponent {
  readonly navigate = output<void>();
  readonly nav = SIDEBAR_NAV;
}
