import { Component, input } from '@angular/core';

@Component({
  selector: 'app-docs-page-header',
  standalone: true,
  template: `
    <div class="article-header">
      <div class="header-meta">
        <span class="header-category">{{ category() }}</span>
        @if (badge()) {
          <span class="badge" [class]="'badge-' + badge()">{{ badgeLabel() }}</span>
        }
      </div>
      <h1>{{ title() }}</h1>
      @if (description()) {
        <p class="header-desc">{{ description() }}</p>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `],
})
export class DocsPageHeaderComponent {
  readonly title = input<string>('');
  readonly description = input<string>('');
  readonly category = input<string>('');
  readonly badge = input<string>('');

  get badgeLabel(): () => string {
    return () => {
      const map: Record<string, string> = {
        'stable': 'Stable',
        'preview': 'Preview',
        'mock-only': 'Mock only',
        'frontend-safe': 'Frontend safe',
        'backend-required': 'Backend required',
      };
      return map[this.badge()] ?? this.badge();
    };
  }
}
