import { createClient } from "@/lib/supabase/server";
import type { BrowserAction } from "@/lib/types/copilot";

// Browser action definitions with safety levels
const ACTION_RISK_LEVELS: Record<string, "low" | "medium" | "high"> = {
  navigate: "low",
  click: "medium",
  fill: "medium", 
  select: "medium",
  read: "low",
  upload: "high",
  validate: "low",
  wait: "low",
  screenshot: "low",
};

// Actions that require approval before execution
const HIGH_RISK_PATTERNS = [
  /delete/i,
  /remove/i,
  /submit/i,
  /publish/i,
  /approve/i,
  /confirm/i,
  /save/i,
  /create/i,
  /update/i,
];

export interface BrowserActionRequest {
  type: BrowserAction["type"];
  selector?: string;
  value?: string;
  url?: string;
  timeout?: number;
  description: string;
}

export interface BrowserActionResult {
  success: boolean;
  result?: string;
  error?: string;
  screenshot?: string;
  pageState?: {
    url: string;
    title: string;
    readyState: string;
  };
}

export interface PageElement {
  selector: string;
  type: string;
  text?: string;
  value?: string;
  attributes: Record<string, string>;
  isVisible: boolean;
  isEnabled: boolean;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

export class BrowserAgentService {
  private sessionId: string;
  private conversationId?: string;
  
  constructor(sessionId: string, conversationId?: string) {
    this.sessionId = sessionId;
    this.conversationId = conversationId;
  }
  
  /**
   * Classify the risk level of an action
   */
  classifyRisk(action: BrowserActionRequest): "low" | "medium" | "high" {
    // Check base risk level
    let riskLevel = ACTION_RISK_LEVELS[action.type] || "medium";
    
    // Elevate risk if selector or description matches high-risk patterns
    const textToCheck = `${action.selector || ""} ${action.description} ${action.value || ""}`;
    
    for (const pattern of HIGH_RISK_PATTERNS) {
      if (pattern.test(textToCheck)) {
        riskLevel = "high";
        break;
      }
    }
    
    return riskLevel;
  }
  
  /**
   * Check if an action requires user approval
   */
  requiresApproval(action: BrowserActionRequest): boolean {
    const riskLevel = this.classifyRisk(action);
    return riskLevel === "high";
  }
  
  /**
   * Generate safe selectors for an element
   * Prioritizes test-ids, accessibility attributes, then falls back to CSS
   */
  generateSafeSelector(element: PageElement): string[] {
    const selectors: string[] = [];
    
    // Priority 1: data-testid (most reliable for testing)
    if (element.attributes["data-testid"]) {
      selectors.push(`[data-testid="${element.attributes["data-testid"]}"]`);
    }
    
    // Priority 2: Accessibility attributes
    if (element.attributes["aria-label"]) {
      selectors.push(`[aria-label="${element.attributes["aria-label"]}"]`);
    }
    if (element.attributes["aria-labelledby"]) {
      selectors.push(`[aria-labelledby="${element.attributes["aria-labelledby"]}"]`);
    }
    
    // Priority 3: ID (if not dynamic)
    if (element.attributes["id"] && !element.attributes["id"].match(/^ng-|^\d|^cdk-/)) {
      selectors.push(`#${element.attributes["id"]}`);
    }
    
    // Priority 4: Name attribute for form elements
    if (element.attributes["name"]) {
      selectors.push(`[name="${element.attributes["name"]}"]`);
    }
    
    // Priority 5: Role + text content
    if (element.attributes["role"] && element.text) {
      selectors.push(`[role="${element.attributes["role"]}"]:has-text("${element.text.slice(0, 50)}")`);
    }
    
    // Fallback: Original selector
    if (element.selector && selectors.length === 0) {
      selectors.push(element.selector);
    }
    
    return selectors;
  }
  
  /**
   * Create an action record in the database
   */
  async createActionRecord(action: BrowserActionRequest): Promise<BrowserAction> {
    const supabase = await createClient();
    
    const actionRecord: BrowserAction = {
      id: crypto.randomUUID(),
      type: action.type,
      selector: action.selector,
      value: action.value,
      description: action.description,
      status: this.requiresApproval(action) ? "requires_approval" : "pending",
      timestamp: new Date().toISOString(),
    };
    
    // Store in audit log
    await supabase.from("audit_logs").insert({
      conversation_id: this.conversationId,
      action_type: "browser_action",
      action_name: action.type,
      request: action.description,
      target: { selector: action.selector, value: action.value },
      requires_approval: this.requiresApproval(action),
    });
    
    return actionRecord;
  }
  
  /**
   * Build an action plan from a user request
   * This analyzes the request and creates a sequence of browser actions
   */
  buildActionPlan(
    goal: string, 
    pageElements: PageElement[],
    codeContext?: { routes: string[]; selectors: string[] }
  ): BrowserActionRequest[] {
    const actions: BrowserActionRequest[] = [];
    
    // This would typically use the LLM to analyze the goal and plan actions
    // For now, we provide a structure for the AI to fill in
    
    // Basic action templates based on common patterns
    const actionTemplates = {
      navigate: (url: string) => ({
        type: "navigate" as const,
        url,
        description: `Navigate to ${url}`,
      }),
      click: (selector: string, desc: string) => ({
        type: "click" as const,
        selector,
        description: `Click on ${desc}`,
      }),
      fill: (selector: string, value: string, desc: string) => ({
        type: "fill" as const,
        selector,
        value,
        description: `Fill ${desc} with value`,
      }),
      select: (selector: string, value: string, desc: string) => ({
        type: "select" as const,
        selector,
        value,
        description: `Select ${value} from ${desc}`,
      }),
      validate: (selector: string, desc: string) => ({
        type: "validate" as const,
        selector,
        description: `Validate ${desc}`,
      }),
    };
    
    return actions;
  }
  
  /**
   * Execute a single browser action
   * In production, this would communicate with a Playwright service
   */
  async executeAction(action: BrowserActionRequest): Promise<BrowserActionResult> {
    // This is a placeholder for the actual Playwright execution
    // In a real implementation, this would:
    // 1. Connect to a Playwright browser instance
    // 2. Execute the action
    // 3. Capture the result and any errors
    // 4. Take a screenshot for verification
    
    console.log(`[BrowserAgent] Executing action: ${action.type}`, action);
    
    // Simulate action execution
    return {
      success: true,
      result: `Executed ${action.type} action`,
      pageState: {
        url: "https://example.com",
        title: "Example Page",
        readyState: "complete",
      },
    };
  }
  
  /**
   * Execute a sequence of actions with progress tracking
   */
  async executeActionSequence(
    actions: BrowserActionRequest[],
    onProgress: (index: number, action: BrowserAction) => void
  ): Promise<{ completed: BrowserAction[]; failed?: BrowserAction }> {
    const completed: BrowserAction[] = [];
    
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      const actionRecord = await this.createActionRecord(action);
      
      // Check if approval is required
      if (actionRecord.status === "requires_approval") {
        onProgress(i, actionRecord);
        // Return early - need to wait for approval
        return { completed, failed: actionRecord };
      }
      
      // Update status to running
      actionRecord.status = "running";
      onProgress(i, actionRecord);
      
      try {
        const result = await this.executeAction(action);
        
        if (result.success) {
          actionRecord.status = "completed";
          actionRecord.result = result.result;
        } else {
          actionRecord.status = "failed";
          actionRecord.error = result.error;
          onProgress(i, actionRecord);
          return { completed, failed: actionRecord };
        }
      } catch (error) {
        actionRecord.status = "failed";
        actionRecord.error = error instanceof Error ? error.message : "Unknown error";
        onProgress(i, actionRecord);
        return { completed, failed: actionRecord };
      }
      
      onProgress(i, actionRecord);
      completed.push(actionRecord);
    }
    
    return { completed };
  }
  
  /**
   * Analyze current page and extract interactive elements
   */
  async inspectPage(): Promise<{
    url: string;
    title: string;
    elements: PageElement[];
    forms: { id: string; action: string; fields: PageElement[] }[];
    navigation: { links: PageElement[]; buttons: PageElement[] };
  }> {
    // In production, this would use Playwright to inspect the actual page
    return {
      url: "https://example.com",
      title: "Example Page",
      elements: [],
      forms: [],
      navigation: {
        links: [],
        buttons: [],
      },
    };
  }
  
  /**
   * Wait for a specific condition on the page
   */
  async waitForCondition(
    condition: "navigation" | "selector" | "text" | "network_idle",
    value?: string,
    timeout: number = 30000
  ): Promise<boolean> {
    // Placeholder for Playwright wait conditions
    console.log(`[BrowserAgent] Waiting for ${condition}: ${value}`);
    return true;
  }
  
  /**
   * Take a screenshot of the current page state
   */
  async takeScreenshot(): Promise<string> {
    // In production, this would capture a real screenshot
    // and upload to blob storage
    return "data:image/png;base64,placeholder";
  }
  
  /**
   * Read page content or specific element text
   */
  async readPageContent(selector?: string): Promise<string> {
    // In production, this would extract actual page content
    if (selector) {
      return `Content from ${selector}`;
    }
    return "Full page content placeholder";
  }
}

// Factory function to create a browser agent
export async function createBrowserAgent(
  conversationId?: string
): Promise<BrowserAgentService> {
  const sessionId = crypto.randomUUID();
  const supabase = await createClient();
  
  // Create browser session record
  await supabase.from("browser_sessions").insert({
    id: sessionId,
    conversation_id: conversationId,
    status: "initializing",
  });
  
  return new BrowserAgentService(sessionId, conversationId);
}
