import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = adminClient;
    const body = await request.json();
    const { orderId, cashapp_tag, cashapp_timestamp, cashapp_transaction_id } = body;

    console.log("[update-cashapp] Request received with body:", { orderId, cashapp_tag, cashapp_timestamp, cashapp_transaction_id });

    if (!orderId) {
      console.log("[update-cashapp] Missing orderId");
      return NextResponse.json(
        { error: "Missing orderId" },
        { status: 400 }
      );
    }

    if (!cashapp_tag || !cashapp_timestamp || !cashapp_transaction_id) {
      console.log("[update-cashapp] Missing Cash App verification fields");
      return NextResponse.json(
        { error: "Missing Cash App verification fields" },
        { status: 400 }
      );
    }

    console.log("[update-cashapp] Attempting to update order:", orderId);

    // Update order with Cash App verification details
    const { error } = await (supabase.from("orders") as any)
      .update({
        cashapp_tag,
        cashapp_timestamp,
        cashapp_transaction_id,
        status: "pending",
      })
      .eq("id", orderId);

    if (error) {
      console.error("[update-cashapp] Database error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return NextResponse.json(
        { 
          error: `Database error: ${error.message}`,
          details: error.details,
        },
        { status: 500 }
      );
    }

    console.log(`[update-cashapp] Successfully updated order ${orderId}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : "";
    console.error("[update-cashapp] Exception:", {
      message: errorMessage,
      stack: errorStack,
    });
    return NextResponse.json(
      { error: `Server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
