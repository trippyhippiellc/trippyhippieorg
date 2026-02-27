"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStateSelectorContext } from "@/features/state-selector/StateSelectorProvider";
import type { Product } from "@/types/supabase";

/*
  useProducts — fetches products from Supabase filtered by:
  - The user's selected state (silently hides non-compliant products)
  - Category, search query, and sort order
  - Active + in-stock only

  Products are NEVER shown with an error for state restrictions.
  Non-compliant products simply don't appear.
*/

interface UseProductsOptions {
  category?: string;
  search?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "popular";
  limit?: number;
  featured?: boolean;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { category, search, sort = "newest", limit = 24, featured } = options;
  const { selectedState } = useStateSelectorContext();
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Use the API endpoint which handles state filtering
      const params = new URLSearchParams();
      if (category && category !== "all") params.append("category", category);
      if (featured) params.append("featured", "true");
      if (search?.trim()) params.append("search", search.trim());
      if (selectedState) params.append("state", selectedState);
      params.append("limit", limit.toString());

      const url = `/api/products?${params.toString()}`;
      console.log("[useProducts] Fetching from:", url, { selectedState, category, search });

      const response = await fetch(url);
      if (!response.ok) {
        const error = await response.text();
        console.error("[useProducts] API error:", error);
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      console.log("[useProducts] Received", data.length, "products for state:", selectedState);
      let products = data;

      // Client-side filtering for search and sort
      if (search?.trim()) {
        products = products.filter((p: Product) =>
          p.name.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Client-side sorting
      switch (sort) {
        case "price_asc":
          products.sort((a: Product, b: Product) => (a.price_retail || 0) - (b.price_retail || 0));
          break;
        case "price_desc":
          products.sort((a: Product, b: Product) => (b.price_retail || 0) - (a.price_retail || 0));
          break;
        case "popular":
          products.sort((a: Product, b: Product) => (b.review_count || 0) - (a.review_count || 0));
          break;
        case "newest":
        default:
          products.sort((a: Product, b: Product) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }

      setProducts(products);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load products.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [category, search, sort, limit, featured, selectedState]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}

export default useProducts;
