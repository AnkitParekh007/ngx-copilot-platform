import { Injectable } from '@angular/core';
import { CopilotContext } from '../models/copilot-context.model';

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
