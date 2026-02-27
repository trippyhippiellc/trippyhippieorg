"use client";

import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { PackageX } from "lucide-react";
import type { Product } from "@/types/supabase";

/*
  ProductGrid — responsive grid of ProductCards.
  Shows skeletons while loading, empty state when no results.
*/

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  error?: string | null;
  skeletonCount?: number;
}

export function ProductGrid({
  products,
  loading,
  error,
  skeletonCount = 8,
}: ProductGridProps) {
  const gridClass = "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6";

  if (loading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <PackageX className="h-10 w-10 text-red-400/50 mb-4" />
        <p className="text-brand-cream-muted">Failed to load products. Please try again.</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-4xl mb-4">🌿</div>
        <h3 className="text-lg font-display font-semibold text-brand-cream mb-2">
          No products found
        </h3>
        <p className="text-sm text-brand-cream-muted max-w-xs">
          Try adjusting your filters or check back soon — we restock regularly.
        </p>
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default ProductGrid;
