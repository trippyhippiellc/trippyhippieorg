import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/admin/coa/requests
 * Fetch all COA requests for admin
 */

// Force dynamic rendering since we use cookies for auth
export const dynamic = 'force-dynamic';

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

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

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

    // Fetch COA requests
    const { data: requests, error } = await supabase
      .from("coa_requests" as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Admin COA] Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch requests" },
        { status: 500 }
      );
    }

    // If we have requests, fetch product details for each
    if (requests && requests.length > 0) {
      // Get all unique product IDs from all requests
      const allProductIds = [...new Set(requests.flatMap((r: any) => r.requested_product_ids))];

      if (allProductIds.length > 0) {
        const { data: products, error: productsError } = await supabase
          .from("products")
          .select("id, name")
          .in("id", allProductIds);

        if (productsError) {
          console.error("[Admin COA] Products fetch error:", productsError);
        }

        // Map products to requests
        const productMap = new Map((products as any)?.map((p: any) => [p.id, p]) || []);

        const requestsWithProducts = (requests as any).map((request: any) => ({
          ...request,
          products: request.requested_product_ids.map((id: string) => productMap.get(id)).filter(Boolean)
        }));

        return NextResponse.json(requestsWithProducts);
      }
    }

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Admin COA API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}