"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "@/components/product/ProductFilters";
import { useDebounce } from "@/hooks/useDebounce";
import { useCart } from "@/features/cart/useCart";
import type { Product } from "@/types/supabase";
import { useRouter } from "next/navigation";
import { useStateSelectorContext } from "@/features/state-selector/StateSelectorProvider";

/*
  Smoke Shop Wholesale page — src/app/(main)/smoke-shop-wholesale/page.tsx
  Premium product catalog for smoke shop wholesale accounts only.
  - Admins have full access
  - Users must have is_smokeshop_wholesale = true
  - Shows products where is_smokeshop_wholesale = true
  - Uses price_smokeshop_wholesale for pricing
  - All others see 404
*/

export default function SmokeShopWholesalePage() {
  const { isAdmin, user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { selectedState } = useStateSelectorContext();
  const { setSmokeShopWholesaleMode } = useCart();
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [isSmokeShopWholesale, setIsSmokeShopWholesale] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");

  const debouncedSearch = useDebounce(search, 300);

  // Enable smoke shop wholesale mode and check authorization on mount
  useEffect(() => {
    // Always enable smoke shop wholesale mode on this page
    setSmokeShopWholesaleMode(true);

    if (authLoading || !user) {
      return;
    }

    const checkAuth = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("is_smokeshop_wholesale")
          .eq("id", user.id)
          .single() as any;

        if (error) {
          console.error("Error checking smoke shop wholesale status:", error);
          setAuthorized(false);
          return;
        }

        const hasAccess = isAdmin || (data as any)?.is_smokeshop_wholesale === true;
        setIsSmokeShopWholesale((data as any)?.is_smokeshop_wholesale === true);
        setAuthorized(hasAccess);
      } catch (err) {
        console.error("Error checking authorization:", err);
        setAuthorized(false);
      }
    };

    checkAuth();

    // Cleanup: disable smoke shop wholesale mode when leaving the page
    return () => {
      setSmokeShopWholesaleMode(false);
    };
  }, [authLoading, user, isAdmin, supabase, setSmokeShopWholesaleMode]);

  // Fetch smoke shop wholesale products
  useEffect(() => {
    if (!authorized) {
      setLoading(false);
      return;
    }

    const fetchSmokeShopWholesaleProducts = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .eq("is_hidden", false)
          .eq("is_smokeshop_wholesale", true);

        // Apply state restrictions if any
        if (selectedState) {
          query = query.or(
            `state_restrictions.is.null,state_restrictions.cs.{"${selectedState}"}`
          );
        }

        // Apply category filter
        if (category !== "all") {
          query = query.eq("category", category);
        }

        // Apply search filter
        if (debouncedSearch) {
          query = query.or(
            `name.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%,tags.cs.{"${debouncedSearch}"}`
          );
        }

        // Apply sorting
        switch (sort) {
          case "price_asc":
            query = query.order("price_smokeshop_wholesale", { ascending: true });
            break;
          case "price_desc":
            query = query.order("price_smokeshop_wholesale", { ascending: false });
            break;
          case "popular":
            query = query.order("review_count", { ascending: false });
            break;
          default:
            query = query.order("created_at", { ascending: false });
        }

        query = query.limit(100);

        const { data, error } = await query;

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error("Error fetching smoke shop wholesale products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSmokeShopWholesaleProducts();
  }, [authorized, selectedState, category, debouncedSearch, sort, supabase]);

  // Not authorized - show 404
  if (!loading && !authorized) {
    return (
      <div className="container-brand section-padding">
        <div className="text-center py-20">
          <h1 className="text-4xl font-display font-bold text-brand-cream mb-4">
            404 — Not Found
          </h1>
          <p className="text-brand-cream-muted mb-8">
            You do not have access to the smoke shop wholesale section.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-brand-green text-brand-dark font-semibold rounded-lg hover:bg-brand-green-light transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container-brand section-padding">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-brand-cream mb-2">
          Smoke Shop Wholesale
        </h1>
        <p className="text-brand-cream-muted">
          Exclusive smoke shop wholesale pricing for qualified partners. Premium products with special bulk pricing.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <ProductFilters
          search={search}
          category={category}
          sort={sort}
          onSearch={setSearch}
          onCategory={setCategory}
          onSort={setSort}
          resultCount={loading ? undefined : products.length}
        />
      </div>

      {/* Products grid */}
      <ProductGrid 
        products={products} 
        loading={loading}
        error={null}
      />
    </div>
  );
}
