import { Component, input, signal, OnInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DocHeading } from './docs-data';

@Component({
  selector: 'app-docs-toc',
  standalone: true,
  template: `
    <div class="toc">
      <p class="toc-heading">On this page</p>
      <nav aria-label="Table of contents">
        @for (h of headings(); track h.id) {
          <a
            class="toc-link"
            [class.toc-link-h3]="h.level === 3"
            [class.active]="activeId() === h.id"
            [href]="'#' + h.id"
            (click)="scrollTo($event, h.id)">
            {{ h.label }}
          </a>
        }
      </nav>
    </div>
  `,
  styles: [`
    .toc { padding: 0.5rem 0.25rem; }

    .toc-heading {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.09em;
      color: var(--text-subtle);
      margin: 0 0 0.65rem;
    }

    .toc-link {
      display: block;
      font-size: 0.82rem;
      color: var(--text-subtle);
      text-decoration: none;
      padding: 0.3rem 0.6rem;
      border-left: 2px solid var(--border);
      margin-bottom: 0.05rem;
      transition: color 0.12s, border-color 0.12s, background 0.12s;
      line-height: 1.4;
      border-radius: 0 var(--radius-xs) var(--radius-xs) 0;
    }

    .toc-link-h3 { padding-left: 1.2rem; font-size: 0.78rem; }

    .toc-link:hover {
      color: var(--accent);
      border-left-color: var(--accent);
      background: var(--accent-light);
      text-decoration: none;
    }

    .toc-link.active {
      color: var(--accent);
      border-left-color: var(--accent);
      font-weight: 600;
      background: var(--accent-light);
    }
  `],
})
export class DocsTocComponent implements OnInit, OnDestroy {
  readonly headings = input<DocHeading[]>([]);
  activeId = signal<string>('');

  private observer?: IntersectionObserver;
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    // Small timeout to allow route content to render
    setTimeout(() => this.initObserver(), 150);
  }

  ngOnDestroy(): void { this.observer?.disconnect(); }

  scrollTo(event: Event, id: string): void {
    event.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', '#' + id);
      this.activeId.set(id);
    }
  }

  private initObserver(): void {
    this.observer?.disconnect();

    const ids = this.headings().map(h => h.id);
    if (!ids.length) return;

    const elements = ids.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!elements.length) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length) {
          // Prefer the topmost intersecting heading
          const topmost = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b
          );
          this.activeId.set(topmost.target.id);
        }
      },
      { rootMargin: '-52px 0px -60% 0px', threshold: 0 }
    );

    elements.forEach(el => this.observer!.observe(el));
  }
}
