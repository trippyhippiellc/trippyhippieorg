"use client";

import { useState } from "react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "@/components/product/ProductFilters";
import { useProducts } from "@/hooks/useProducts";
import { useDebounce } from "@/hooks/useDebounce";

/*
  Shop page — src/app/(main)/shop/page.tsx
  Main product catalog. Filtered by state, category, search, and sort.
  All filtering is dynamic — no products show if they're not in the DB.
*/

export default function ShopPage() {
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("all");
  const [sort,     setSort]     = useState("newest");

  const debouncedSearch = useDebounce(search, 300);

  const { products, loading, error } = useProducts({
    category: category === "all" ? undefined : category,
    search:   debouncedSearch,
    sort:     sort as "newest" | "price_asc" | "price_desc" | "popular",
  });

  return (
    <div className="container-brand section-padding">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-brand-cream mb-2">
          The Trippy Hippie Shop
        </h1>
        <p className="text-brand-cream-muted">
          Premium, hand-crafted hemp-derived products, filtered for your preference.
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

      {/* Product grid */}
      <ProductGrid
        products={products}
        loading={loading}
        error={error}
      />
    </div>
  );
}
