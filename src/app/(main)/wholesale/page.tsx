"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "@/components/product/ProductFilters";
import { useDebounce } from "@/hooks/useDebounce";
import type { Product } from "@/types/supabase";
import { useRouter } from "next/navigation";
import { useStateSelectorContext } from "@/features/state-selector/StateSelectorProvider";

/*
  Wholesale page — src/app/(main)/wholesale/page.tsx
  Premium product catalog for wholesale accounts only.
  - Admins have full access
  - Users must have is_wholesale_approved = true
  - Shows products where is_wholesale = true
  - All others see 404
*/

export default function WholesalePage() {
  const { isAdmin, isWholesaleApproved, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { selectedState } = useStateSelectorContext();
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");

  const debouncedSearch = useDebounce(search, 300);

  // Check authorization on mount
  useEffect(() => {
    if (authLoading) {
      return;
    }

    const isAuthorized = isAdmin || isWholesaleApproved;
    if (!isAuthorized) {
      setLoading(false);
      return;
    }

    setAuthorized(true);
  }, [authLoading, isAdmin, isWholesaleApproved]);

  // Fetch wholesale products
  useEffect(() => {
    if (!authorized) {
      setLoading(false);
      return;
    }

    const fetchWholesaleProducts = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .eq("is_wholesale", true);

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
            query = query.order("price_wholesale", { ascending: true });
            break;
          case "price_desc":
            query = query.order("price_wholesale", { ascending: false });
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
        console.error("Error fetching wholesale products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWholesaleProducts();
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
            You do not have access to the wholesale section.
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
          Wholesale Catalog
        </h1>
        <p className="text-brand-cream-muted">
          Exclusive wholesale pricing for approved partners. Bulk quantities available.
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
