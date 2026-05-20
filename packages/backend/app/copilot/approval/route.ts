import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { actionId, approved, conversationId } = await req.json();
    
    if (!actionId) {
      return NextResponse.json(
        { error: "Action ID is required" },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Update the action queue
    const { data, error } = await supabase
      .from("action_queue")
      .update({
        status: approved ? "approved" : "rejected",
        approved_at: approved ? new Date().toISOString() : null,
      })
      .eq("id", actionId)
      .select()
      .single();
    
    if (error) {
      console.error("[Approval] Database error:", error);
      return NextResponse.json(
        { error: "Failed to update action status" },
        { status: 500 }
      );
    }
    
    // Log the approval/rejection in audit
    await supabase.from("audit_logs").insert({
      conversation_id: conversationId,
      action_type: approved ? "action_approved" : "action_rejected",
      action_name: data?.action_type,
      request: `Action ${actionId} was ${approved ? "approved" : "rejected"}`,
      target: data?.action_details,
      approved_at: approved ? new Date().toISOString() : null,
    });
    
    return NextResponse.json({
      success: true,
      action: data,
      message: approved 
        ? "Action approved and queued for execution"
        : "Action rejected",
    });
  } catch (error) {
    console.error("[Approval] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");
    
    const supabase = await createClient();
    
    // Get pending approvals for a conversation
    let query = supabase
      .from("action_queue")
      .select("*")
      .eq("status", "pending_approval")
      .order("created_at", { ascending: true });
    
    if (conversationId) {
      query = query.eq("conversation_id", conversationId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("[Approval] Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch pending approvals" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      pendingApprovals: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    console.error("[Approval] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
