import { adminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    const side = (formData.get("side") as string) || "front"; // "front" or "back"

    if (!file || !userId) {
      return NextResponse.json(
        { error: "Missing file or userId" },
        { status: 400 }
      );
    }

    if (side !== "front" && side !== "back") {
      return NextResponse.json(
        { error: "Invalid side. Must be 'front' or 'back'" },
        { status: 400 }
      );
    }

    const supabase = adminClient;
    const buffer = await file.arrayBuffer();
    const ext = file.name.split(".").pop() || "jpg";
    const filePath = `${userId}-id-${side}.${ext}`;

    // Upload to the "documents" bucket
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, Buffer.from(buffer), { 
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    // Update user profile with the appropriate field based on side
    const fieldName = side === "front" ? "id_document_url_front" : "id_document_url_back";
    const { error: updateError } = await (supabase.from("profiles") as any)
      .update({ [fieldName]: filePath })
      .eq("id", userId);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      filePath: filePath,
      side: side,
    });
  } catch (err) {
    console.error("Error uploading ID:", err);
    return NextResponse.json(
      { error: "Failed to upload ID document" },
      { status: 500 }
    );
  }
}
