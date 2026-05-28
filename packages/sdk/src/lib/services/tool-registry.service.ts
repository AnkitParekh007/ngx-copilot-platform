import { Injectable } from '@angular/core';
import { ToolDefinition } from '../models/tool-definition.model';

/**
 * Registry for client-side tool definitions.
 *
 * Register tools at startup and then execute them via
 * `CopilotService.executeLocalTool()` which automatically updates the tool timeline:
 *
 * ```ts
 * // In app.config.ts or a feature initializer:
 * export function registerCopilotTools(registry: ToolRegistryService) {
 *   return () => {
 *     registry.register({
 *       name: 'lookupOrder',
 *       description: 'Look up an order by ID',
 *       requiresApproval: false,
 *       execute: async (ctx, input) => {
 *         const { orderId } = input as { orderId: string };
 *         return await myOrderService.find(orderId);
 *       },
 *     });
 *   };
 * }
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideCopilot({ defaultMode: 'ask' }),
 *     {
 *       provide: APP_INITIALIZER,
 *       useFactory: registerCopilotTools,
 *       deps: [ToolRegistryService],
 *       multi: true,
 *     },
 *   ],
 * };
 * ```
 *
 * Tools that `requiresApproval: true` should be routed through the backend
 * `executeTool()` adapter path so the backend can gate execution.
 * Client-side tools with approval can use `CopilotService.executeLocalTool()`
 * — approval gating on the client is advisory only (no security boundary).
 */
@Injectable({ providedIn: 'root' })
export class ToolRegistryService {
  private readonly tools = new Map<string, ToolDefinition>();

  register(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool);
  }

  list(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  requiresApproval(name: string): boolean {
    return this.tools.get(name)?.requiresApproval ?? false;
  }
}
