import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/admin/fonts/set
 * Set the active font for the entire site
 * 
 * Request body:
 * {
 *   fontId: string (UUID) or null to disable custom font
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { fontId: string | null };
    const { fontId } = body;

    // Check authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Check if admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!(profile as any)?.is_admin) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    // Update font settings
    const { data: settings, error: settingsError } = await supabase
      .from("font_settings")
      .select("id")
      .maybeSingle();

    if (settingsError) {
      console.error("Font settings fetch error:", settingsError);
      return NextResponse.json(
        { error: "Failed to fetch font settings" },
        { status: 500 }
      );
    }

    if (!settings) {
      // Create default font_settings row if none exists
      const { data: newSettings, error: insertError } = await supabase
        .from("font_settings")
        .insert({ active_font_id: fontId })
        .select()
        .single();

      if (insertError) {
        console.error("Font settings creation error:", insertError);
        return NextResponse.json(
          { error: "Failed to create font settings" },
          { status: 500 }
        );
      }

      return NextResponse.json(newSettings);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("font_settings") as any)
      .update({ 
        active_font_id: fontId,
        updated_at: new Date().toISOString()
      })
      .eq("id", (settings as any)?.id)
      .select()
      .single();

    if (error) {
      console.error("Font update error:", error);
      return NextResponse.json(
        { error: "Failed to update font" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Font set error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
