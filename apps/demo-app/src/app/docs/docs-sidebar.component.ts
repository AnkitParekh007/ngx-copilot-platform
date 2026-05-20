import { Component, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SIDEBAR_NAV } from './docs-data';

@Component({
  selector: 'app-docs-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="sidebar-nav" aria-label="Documentation navigation">
      @for (section of nav; track section.section) {
        <div class="nav-section">
          <div class="nav-section-heading">
            <span class="nav-section-icon" aria-hidden="true">{{ section.icon }}</span>
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
  `,
  styles: [`
    .sidebar-nav { padding: 0.25rem 0 1rem; }

    .nav-section { margin-bottom: 0.15rem; }

    .nav-section-heading {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.09em;
      color: var(--text-subtle);
      padding: 1rem 1rem 0.3rem;
    }

    .nav-section-icon { font-size: 0.8rem; }

    .nav-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.4rem 1rem 0.4rem 1.5rem;
      font-size: 0.865rem;
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
      background: var(--accent-light);
      color: var(--accent);
      border-left-color: var(--accent);
      font-weight: 600;
    }

    .nav-item-badge {
      font-size: 0.62rem;
      background: var(--accent-light);
      color: var(--accent-text);
      padding: 0.08rem 0.4rem;
      border-radius: 999px;
      font-weight: 600;
      letter-spacing: 0.02em;
    }
  `],
})
export class DocsSidebarComponent {
  readonly navigate = output<void>();
  readonly nav = SIDEBAR_NAV;
}
