import { InjectionToken } from '@angular/core';

/**
 * Optional injection token for a Markdown-to-HTML renderer function.
 *
 * When provided, `CopilotChatComponent` and `StreamingMessageComponent` will
 * render assistant messages as sanitized HTML instead of plain text.
 *
 * **Setup (app.config.ts):**
 * ```ts
 * import { marked } from 'marked';
 * import { COPILOT_MARKDOWN_RENDERER } from '@ankit-parekh-007/ngx-copilot-sdk';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     // ... other providers
 *     {
 *       provide: COPILOT_MARKDOWN_RENDERER,
 *       useValue: (md: string) => marked.parse(md, { async: false }) as string,
 *     },
 *   ],
 * };
 * ```
 *
 * The function receives the raw Markdown string and must return an HTML string.
 * Internally, the result is passed through Angular's `DomSanitizer.bypassSecurityTrustHtml()`.
 * Ensure your renderer is trusted (e.g. `marked` + `DOMPurify` for XSS safety).
 */
export const COPILOT_MARKDOWN_RENDERER = new InjectionToken<(markdown: string) => string>(
  'COPILOT_MARKDOWN_RENDERER',
);
