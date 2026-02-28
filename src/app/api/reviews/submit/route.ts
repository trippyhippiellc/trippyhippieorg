import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/reviews/submit
 * Submit a product review with purchase verification and optional photo
 * 
 * Request body (multipart/form-data):
 * {
 *   productId: string (UUID)
 *   rating: number (1-5)
 *   title?: string
 *   body?: string
 *   image?: File
 * }
 * 
 * Returns:
 * - 201: Review created successfully
 * - 400: Validation error (missing fields, invalid rating)
 * - 401: Not authenticated
 * - 403: User hasn't purchased this product
 * - 409: User already reviewed this product
 * - 500: Server error
 */

interface OrderItem {
  product_id?: string;
  productId?: string;
  id?: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const productId = formData.get("productId") as string;
    const rating = parseInt(formData.get("rating") as string);
    const title = formData.get("title") as string | null;
    const body = formData.get("body") as string | null;
    const imageFile = formData.get("image") as File | null;

    // Validation
    if (!productId) {
      return NextResponse.json(
        { error: "Missing productId" },
        { status: 400 }
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user has already reviewed this product
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("product_id", productId)
      .eq("user_id", user.id)
      .single();

    if (existingReview) {
      return NextResponse.json(
        { error: "You've already reviewed this product" },
        { status: 409 }
      );
    }

    // Verify purchase: Check if user has this product in any completed order
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: orders } = await (supabase.from("orders") as any)
      .select("items, status, payment_status")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .eq("payment_status", "paid");

    const hasPurchased = orders?.some((order: Record<string, unknown>) => {
      const items = order.items as unknown;
      if (!Array.isArray(items)) return false;
      
      return items.some((item: OrderItem) => {
        // Items might have product_id or productId field depending on how they were stored
        return item.product_id === productId || item.productId === productId;
      });
    });

    if (!hasPurchased) {
      return NextResponse.json(
        { error: "You must purchase this product to leave a review" },
        { status: 403 }
      );
    }

    // Handle image upload if provided
    let imageUrl: string | null = null;
    if (imageFile) {
      try {
        const buffer = await imageFile.arrayBuffer();
        const filename = `${user.id}/${productId}/${Date.now()}-${imageFile.name}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("reviews")
          .upload(filename, buffer, {
            contentType: imageFile.type,
            upsert: false,
          });

        if (uploadError) {
          console.error("Image upload error:", uploadError);
          return NextResponse.json(
            { error: "Failed to upload image" },
            { status: 500 }
          );
        }

        // Get permanent public URL (no expiry)
        const { data } = supabase.storage.from("reviews").getPublicUrl(uploadData.path);
        imageUrl = data.publicUrl;
      } catch (err) {
        console.error("Image processing error:", err);
        return NextResponse.json(
          { error: "Failed to process image" },
          { status: 500 }
        );
      }
    }

    // Create the review
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newReview, error: createError } = await (supabase.from("reviews") as any)
      .insert({
        product_id: productId,
        user_id: user.id,
        rating,
        title: title || null,
        body: body || null,
        image_url: imageUrl || null,
        is_approved: false, // Reviews require admin approval before display
      })
      .select()
      .single();

    if (createError) {
      console.error("Review creation error:", createError);
      return NextResponse.json(
        { error: "Failed to create review" },
        { status: 500 }
      );
    }

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error("Review submit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
