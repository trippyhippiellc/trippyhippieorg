import { adminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log("[view-id] Starting ID document view request");

    // Get auth token from Authorization header
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    console.log("[view-id] Auth token present:", !!token);

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - no token" },
        { status: 401 }
      );
    }

    let userId: string;
    try {
      // Verify the JWT token and extract user ID
      const { data, error } = await adminClient.auth.getUser(token);
      
      if (error || !data.user) {
        console.log("[view-id] Token verification failed:", error?.message);
        return NextResponse.json(
          { error: "Unauthorized - invalid token" },
          { status: 401 }
        );
      }

      userId = data.user.id;
      console.log("[view-id] Authenticated user:", userId);
    } catch (err) {
      console.error("[view-id] Token verification error:", err);
      return NextResponse.json(
        { error: "Unauthorized - token error" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await (adminClient.from("profiles") as any)
      .select("is_admin")
      .eq("id", userId)
      .single();

    console.log("[view-id] Profile check - is_admin:", profile?.is_admin, "error:", profileError?.message);

    if (profileError || !profile?.is_admin) {
      return NextResponse.json(
        { error: "Only admins can view ID documents" },
        { status: 403 }
      );
    }

    // Get the userId from query params
    const targetUserId = request.nextUrl.searchParams.get("userId");
    const side = (request.nextUrl.searchParams.get("side") as string) || "front"; // "front" or "back"
    console.log("[view-id] Looking for document for userId:", targetUserId, "side:", side);

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    if (side !== "front" && side !== "back") {
      return NextResponse.json(
        { error: "Invalid side. Must be 'front' or 'back'" },
        { status: 400 }
      );
    }

    // Get the user's ID document URL from their profile
    const { data: userProfile, error: userError } = await (adminClient.from("profiles") as any)
      .select("id_document_url_front, id_document_url_back")
      .eq("id", targetUserId)
      .single();

    console.log("[view-id] User profile lookup - front:", userProfile?.id_document_url_front, "back:", userProfile?.id_document_url_back, "error:", userError?.message);

    if (userError) {
      console.error("[view-id] Error fetching user profile:", userError);
      return NextResponse.json(
        { error: `Failed to fetch user profile: ${userError.message}` },
        { status: 500 }
      );
    }

    // Get the appropriate document URL based on side
    const documentUrl = side === "front" ? userProfile?.id_document_url_front : userProfile?.id_document_url_back;

    if (!documentUrl) {
      return NextResponse.json(
        { error: `No ID document (${side}) found for this user` },
        { status: 404 }
      );
    }

    const filePath = documentUrl;
    console.log("[view-id] Creating signed URL for:", filePath);

    // Generate a signed URL that expires in 24 hours
    const { data, error: signError } = await adminClient.storage
      .from("documents")
      .createSignedUrl(filePath, 86400); // 86400 seconds = 24 hours

    console.log("[view-id] Signed URL result - success:", !!data, "error:", signError?.message);

    if (signError) {
      console.error("[view-id] Error creating signed URL:", signError);
      return NextResponse.json(
        { error: `Failed to create signed URL: ${signError.message}` },
        { status: 500 }
      );
    }

    console.log("[view-id] Successfully generated signed URL");

    return NextResponse.json({
      url: data.signedUrl,
    });
  } catch (err) {
    console.error("[view-id] Unexpected error:", err);
    return NextResponse.json(
      { error: `Failed to generate ID view URL: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}

