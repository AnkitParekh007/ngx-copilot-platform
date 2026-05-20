import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GITHUB_EDIT_BASE } from './docs-data';

@Component({
  selector: 'app-docs-navigation',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="docs-nav-footer">
      <!-- Prev / Next -->
      <div class="page-nav">
        @if (prev()) {
          <a [routerLink]="prev()!.path" class="page-nav-link page-nav-prev">
            <span class="nav-arrow">←</span>
            <span class="nav-content">
              <span class="nav-label">Previous</span>
              <span class="nav-title">{{ prev()!.label }}</span>
            </span>
          </a>
        } @else {
          <span></span>
        }

        @if (next()) {
          <a [routerLink]="next()!.path" class="page-nav-link page-nav-next">
            <span class="nav-content">
              <span class="nav-label">Next</span>
              <span class="nav-title">{{ next()!.label }}</span>
            </span>
            <span class="nav-arrow">→</span>
          </a>
        }
      </div>

      <!-- Edit on GitHub -->
      @if (editPath()) {
        <div class="edit-row">
          <a
            [href]="editBase + editPath()"
            target="_blank"
            rel="noopener noreferrer"
            class="edit-link">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61zm1.414 1.06a.25.25 0 00-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 000-.354l-1.086-1.086zM11.189 6.25L9.75 4.81 3.23 11.33c-.03.03-.058.081-.075.14l-.510 1.785 1.785-.51c.059-.017.109-.045.14-.075L11.19 6.25z"/>
            </svg>
            Edit this page on GitHub
          </a>
        </div>
      }
    </div>
  `,
  styles: [`
    .docs-nav-footer {
      margin-top: 3.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border);
    }

    .page-nav {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.85rem;
      margin-bottom: 1.25rem;
    }

    .page-nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem 1rem;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      text-decoration: none;
      color: inherit;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .page-nav-link:hover {
      border-color: var(--accent);
      box-shadow: var(--shadow-sm);
      text-decoration: none;
    }

    .page-nav-next { justify-content: flex-end; text-align: right; }

    .nav-arrow {
      font-size: 1.1rem;
      color: var(--accent);
      flex-shrink: 0;
    }

    .nav-content { display: flex; flex-direction: column; gap: 0.1rem; }

    .nav-label {
      font-size: 0.72rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-muted);
    }

    .nav-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text);
    }

    .edit-row {
      display: flex;
      justify-content: flex-end;
    }

    .edit-link {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.8rem;
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.1s;
    }

    .edit-link:hover { color: var(--accent); text-decoration: none; }

    @media (max-width: 520px) {
      .page-nav { grid-template-columns: 1fr; }
    }
  `],
})
export class DocsNavigationComponent {
  readonly prev = input<{ label: string; path: string } | undefined>(undefined);
  readonly next = input<{ label: string; path: string } | undefined>(undefined);
  readonly editPath = input<string>('');
  readonly editBase = GITHUB_EDIT_BASE;
}
