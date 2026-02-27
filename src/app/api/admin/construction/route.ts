import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (userError || !userData?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch construction settings
    const { data: settings, error: fetchError } = await supabase
      .from("site_settings")
      .select("id, is_construction_mode, construction_password, created_at, updated_at")
      .single();

    console.log("[GET] Supabase response - settings:", settings, "error:", fetchError);

    // If table doesn't exist, return defaults
    if (fetchError?.code === "PGRST116" || fetchError?.code === "PGRST100") {
      console.log("[GET] Table not found, returning defaults");
      return NextResponse.json({
        id: null,
        is_construction_mode: false,
        construction_password: "construction123",
        created_at: null,
        updated_at: null,
      });
    }

    if (fetchError) {
      console.error("[GET] Fetch error:", fetchError);
      throw fetchError;
    }

    console.log("[GET] Returning settings:", settings);
    return NextResponse.json(settings);
  } catch (error) {
    console.error("[GET] Error fetching construction settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (userError || !userData?.is_admin) {
      console.error("[PUT] User not admin:", userError);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    let { isConstructionMode, constructionPassword } = body;

    console.log("[PUT] Updating construction settings:", {
      isConstructionMode,
      hasPassword: !!constructionPassword,
    });

    // Fetch current settings to preserve values not being changed
    const { data: currentSettings, error: fetchError } = await supabase
      .from("site_settings")
      .select("is_construction_mode, construction_password")
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("[PUT] Failed to fetch current settings:", fetchError);
      throw fetchError;
    }

    // Use current values if not provided in request
    const finalMode = isConstructionMode !== undefined ? isConstructionMode : currentSettings?.is_construction_mode ?? false;
    const finalPassword = constructionPassword !== undefined ? constructionPassword : currentSettings?.construction_password ?? "construction123";

    // Use RPC function with explicit parameters
    const { data: updated, error: updateError } = await supabase
      .rpc('update_site_settings', {
        p_is_construction_mode: finalMode,
        p_construction_password: finalPassword,
      });

    if (updateError) {
      console.error("[PUT] Supabase RPC error:", JSON.stringify(updateError));
      throw updateError;
    }

    if (!updated || updated.length === 0) {
      console.error("[PUT] No rows updated");
      throw new Error("Failed to update site_settings table");
    }

    console.log("[PUT] Update successful, returning:", updated[0]);
    return NextResponse.json(updated[0]);
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    console.error("[PUT] Error updating construction settings:", errorMsg, error);
    return NextResponse.json(
      { error: `Update failed: ${errorMsg}` },
      { status: 500 }
    );
  }
}
