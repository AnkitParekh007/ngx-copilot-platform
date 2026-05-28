import { Injectable } from '@angular/core';
import { CopilotContext } from '../models/copilot-context.model';

/**
 * Utility service for serializing `CopilotContext` into a plain object safe
 * for JSON serialization and backend transmission.
 *
 * Use this when building a custom `CopilotBackendAdapter` to normalize the
 * context before attaching it to your request payload:
 *
 * ```ts
 * @Injectable()
 * export class MyAdapter implements CopilotBackendAdapter {
 *   private readonly ctx = inject(ContextProviderService);
 *
 *   send(request: CopilotRequest): Observable<CopilotEvent> {
 *     const payload = {
 *       ...request,
 *       context: this.ctx.serialize(request.context ?? { route: '' }),
 *     };
 *     // ... fetch / http call
 *   }
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ContextProviderService {
  serialize(context: CopilotContext): Record<string, unknown> {
    const sanitizedMetadata = Object.fromEntries(
      Object.entries(context.metadata ?? {}).filter(([, value]) => value !== undefined),
    );

    return {
      route: context.route,
      title: context.title,
      userRole: context.userRole,
      tenantId: context.tenantId,
      selectedRecordId: context.selectedRecordId,
      visibleFields: context.visibleFields ?? [],
      metadata: sanitizedMetadata,
    };
  }
}
