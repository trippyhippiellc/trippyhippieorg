import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * PATCH /api/admin/coa/requests/[id]
 * Update a COA request (mark as fulfilled)
 */

// Force dynamic rendering since we use cookies for auth
export const dynamic = 'force-dynamic';

interface UpdateRequestBody {
  status: "pending" | "fulfilled";
}

// Temporary type definition until types are regenerated
interface COARequest {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  requested_product_ids: string[];
  status: "pending" | "fulfilled";
  created_at: string;
  fulfilled_at: string | null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const requestId = params.id;

    // Get current user and check if admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!(profile as any)?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await req.json()) as UpdateRequestBody;
    const { status } = body;

    if (!status || !["pending", "fulfilled"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Update the request
    const updateData: Partial<COARequest> = { status };
    if (status === "fulfilled") {
      updateData.fulfilled_at = new Date().toISOString();
    }

    const { data: updatedRequest, error } = await ((supabase as any)
      .from("coa_requests")
      .update(updateData)
      .eq("id", requestId)
      .select()
      .single() as any);

    if (error) {
      console.error("[Admin COA Update] Database error:", error);
      return NextResponse.json(
        { error: "Failed to update request" },
        { status: 500 }
      );
    }

    console.log("[Admin COA Update] Success:", { id: requestId, status });
    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Admin COA update API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}