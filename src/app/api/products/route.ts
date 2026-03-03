import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/products
 * Fetch products with optional filters
 */

// Force dynamic rendering since we use cookies for auth
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);

    const active = searchParams.get("active") === "true";
    const category = searchParams.get("category");
    const state = searchParams.get("state");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Debug logging
    if (state) {
      console.log(`[Products API] Filtering products for state: ${state}`);
    }

    let query = supabase
      .from("products")
      .select("*")
      .eq("is_hidden", false)
      .order("name");

    if (active) {
      query = query.eq("is_active", true);
    }

    if (category) {
      query = query.eq("category", category);
    }

    query = query.limit(limit);

    const { data: products, error } = await query;

    if (error) {
      console.error("[Products API] Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      );
    }

    // Filter products based on state restrictions
    let filtered = products || [];
    if (state) {
      filtered = filtered.filter((product: any) => {
        const restrictions = product.state_restrictions;
        
        // Handle null or empty restrictions
        if (!restrictions || (Array.isArray(restrictions) && restrictions.length === 0)) {
          return true; // Product available everywhere
        }
        
        // Handle if restrictions is a string (Postgres array) or array
        let restrictedStates: string[] = [];
        if (Array.isArray(restrictions)) {
          restrictedStates = restrictions;
        } else if (typeof restrictions === "string") {
          // Handle Postgres array format: e.g., "{WV,CA}" or "[\"WV\",\"CA\"]"
          restrictedStates = restrictions
            .replace(/[{}\"[\]]/g, "")
            .split(",")
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0);
        }
        
        const isRestricted = restrictedStates.includes(state);
        
        // Debug: log restricted products
        if (isRestricted && product.id) {
          console.log(`[Products API] Filtering out product ${product.id} (${product.name}) - restricted in ${state}`);
        }
        
        // Exclude product if user's state is in restrictions
        return !isRestricted;
      });
      
      console.log(`[Products API] Returned ${filtered.length} of ${products.length} products for state ${state}`);
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
