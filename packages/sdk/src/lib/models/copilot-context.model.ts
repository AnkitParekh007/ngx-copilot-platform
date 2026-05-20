export interface CopilotContext {
  route: string;
  title?: string;
  userRole?: string;
  tenantId?: string;
  selectedRecordId?: string;
  visibleFields?: string[];
  metadata?: Record<string, unknown>;
}
