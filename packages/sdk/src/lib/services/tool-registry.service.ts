import { Injectable } from '@angular/core';
import { ToolDefinition } from '../models/tool-definition.model';

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
