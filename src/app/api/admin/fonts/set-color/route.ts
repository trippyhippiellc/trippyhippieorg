import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/admin/fonts/set-color
 * Update the color of a font
 * 
 * Request body:
 * {
 *   fontId: string (UUID),
 *   color: string (hex color like #FFFF00 or 'inherit')
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { fontId: string; color: string };
    const { fontId, color } = body;

    if (!fontId) {
      return NextResponse.json(
        { error: "Font ID required" },
        { status: 400 }
      );
    }

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

    // Update font color
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("fonts") as any)
      .update({ color })
      .eq("id", fontId)
      .select()
      .single();

    if (error) {
      console.error("Font color update error:", error);
      return NextResponse.json(
        { error: "Failed to update font color" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Font set-color error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
