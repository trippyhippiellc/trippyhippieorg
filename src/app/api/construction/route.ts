import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("is_construction_mode")
      .single();

    // If table doesn't exist or is empty, return false (not in construction mode)
    if (error?.code === "PGRST116" || error?.code === "PGRST100") {
      console.warn("site_settings table not found - construction mode disabled");
      return NextResponse.json({
        isConstructionMode: false,
      });
    }

    if (error) throw error;

    return NextResponse.json({
      isConstructionMode: data?.is_construction_mode || false,
    });
  } catch (error) {
    console.error("Error fetching construction mode:", error);
    // Default to false if any error occurs
    return NextResponse.json({
      isConstructionMode: false,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    // Get the construction password from database
    const { data: settings, error: fetchError } = await supabase
      .from("site_settings")
      .select("construction_password, is_construction_mode")
      .single();

    // If table doesn't exist, site is not in construction mode - reject with 400
    if (fetchError?.code === "PGRST116" || fetchError?.code === "PGRST100") {
      return NextResponse.json(
        { error: "Site is not in construction mode" },
        { status: 400 }
      );
    }

    if (fetchError) throw fetchError;

    // Check if site is in construction mode
    if (!settings.is_construction_mode) {
      return NextResponse.json(
        { error: "Site is not in construction mode" },
        { status: 400 }
      );
    }

    // Verify password
    if (password !== settings.construction_password) {
      console.log("[POST] Password mismatch. Input:", password, "DB:", settings.construction_password);
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    console.log("[POST] Password correct, setting cookie");
    // Create response with cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: "construction_access",
      value: "true",
      httpOnly: false,  // Allow client-side access
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    console.log("[POST] Cookie set, returning success");
    return response;
  } catch (error) {
    console.error("Error verifying construction password:", error);
    return NextResponse.json(
      { error: "Failed to verify password" },
      { status: 500 }
    );
  }
}
