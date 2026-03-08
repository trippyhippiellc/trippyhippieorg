import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/coa/request
 * Submit a COA request for selected products
 */

// Force dynamic rendering since we use cookies for auth
export const dynamic = 'force-dynamic';

interface RequestedProduct {
  productId: string;
  variantId?: string;
}

interface COARequestBody {
  name: string;
  email: string;
  phone?: string;
  requestedProducts: RequestedProduct[];
}

// Temporary type definition until types are regenerated
interface COARequest {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  requested_product_ids: string[];
  requested_products: RequestedProduct[];
  status: "pending" | "fulfilled";
  created_at: string;
  fulfilled_at: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user (optional)
    const { data: { user } } = await supabase.auth.getUser();

    const body = (await req.json()) as COARequestBody;
    const { name, email, phone, requestedProducts } = body;

    if (!name || !email || !requestedProducts || requestedProducts.length === 0) {
      return NextResponse.json(
        { error: "Name, email, and at least one product are required" },
        { status: 400 }
      );
    }

    // Create array of just product IDs for backwards compatibility
    const requestedProductIds = requestedProducts.map(p => p.productId);

    // Insert the COA request
    const insertData: Omit<COARequest, 'id' | 'created_at' | 'fulfilled_at'> = {
      user_id: user?.id || null,
      name,
      email,
      phone: phone || null,
      requested_product_ids: requestedProductIds,
      requested_products: requestedProducts,
      status: "pending",
    };

    const { data: request, error } = await (supabase
      .from("coa_requests" as any)
      .insert(insertData as any)
      .select()
      .single() as any);

    if (error) {
      console.error("[COA Request] Database error:", error);
      return NextResponse.json(
        { error: "Failed to submit request" },
        { status: 500 }
      );
    }

    console.log("[COA Request] Success:", { id: (request as any).id, email, productCount: requestedProducts.length });
    return NextResponse.json({ success: true, requestId: (request as any).id }, { status: 201 });
  } catch (error) {
    console.error("COA request API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}