"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";
import { useCart } from "@/features/cart/useCart";
import { formatCurrency } from "@/lib/utils/cn";
import { cn } from "@/lib/utils/cn";
import type { Product } from "@/types/supabase";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem, isWholesaleMode } = useCart();

  // Determine which price to use
  // Priority: smoke shop wholesale > regular wholesale > retail
  let basePrice = product.price_retail;
  let priceLabel = "";
  
  if (product.is_smokeshop_wholesale && product.price_smokeshop_wholesale) {
    basePrice = product.price_smokeshop_wholesale;
    priceLabel = "Smoke Shop Wholesale";
  } else if (isWholesaleMode && product.price_wholesale) {
    basePrice = product.price_wholesale;
    priceLabel = "Wholesale Price";
  }

  // Parse variants if they exist
  let variants: any[] = [];
  if (product.has_variants && product.variants) {
    if (typeof product.variants === 'string') {
      try {
        variants = JSON.parse(product.variants) as any[];
      } catch {
        variants = [];
      }
    } else if (Array.isArray(product.variants)) {
      variants = product.variants;
    }
  }

  // Calculate total stock from variants if they exist, otherwise use main stock
  const totalStock = product.has_variants && variants.length > 0
    ? variants.reduce((sum, v) => sum + (Number(v.stock_quantity) || 0), 0)
    : product.stock_quantity;

  const isOutOfStock = totalStock <= 0;
  
  // Parse images - handle both array and JSON string
  let images: string[] = [];
  if (product.images) {
    if (typeof product.images === 'string') {
      try {
        images = JSON.parse(product.images) as string[];
      } catch {
        images = [];
      }
    } else if (Array.isArray(product.images)) {
      images = product.images;
    }
  }
  
  const hasImage     = images && images.length > 0;
  const isOnSale     = product.price_compare != null && product.price_compare > product.price_retail;
  const showStrainBadge = product.strain_type != null;

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addItem(product, 1);
  }

  return (
    <Link
      href={`/product/${product.id}`}
      className={cn(
        "group block glass-card border border-brand-green/10 overflow-hidden rounded-card",
        "hover:border-brand-green/25 hover:shadow-[0_8px_32px_rgba(124,179,66,0.1)]",
        "transition-all duration-200",
        className
      )}
    >
      <div className="relative aspect-square bg-[#1A2E1A] overflow-hidden">
        {hasImage ? (
          <Image
            src={images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🌿</div>
        )}

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_featured && <Badge variant="featured">Featured</Badge>}
          {isOutOfStock        && <Badge variant="cancelled">Sold Out</Badge>}
        </div>

        {!isOutOfStock && (
          <button
            onClick={handleQuickAdd}
            className={cn(
              "absolute bottom-2 right-2 w-9 h-9 rounded-brand",
              "bg-brand-green text-white flex items-center justify-center",
              "opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0",
              "transition-all duration-200 hover:bg-brand-green-light shadow-md"
            )}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-brand-cream-dark uppercase tracking-widest">
            {product.category}
          </span>
          {showStrainBadge && (
            <Badge
              variant={product.strain_type as "sativa" | "indica" | "hybrid"}
              size="sm"
            />
          )}
        </div>

        <h3 className="font-display font-semibold text-brand-cream text-sm leading-snug line-clamp-2 group-hover:text-brand-green transition-colors">
          {product.name}
        </h3>

        <StarRating
          value={product.average_rating}
          readOnly
          size="sm"
          showCount
          reviewCount={product.review_count}
        />

        <div className="flex flex-col gap-1 pt-1">
          {priceLabel ? (
            <>
              <span className="text-xs text-brand-cream-dark">{priceLabel}</span>
              <span className="font-bold text-base text-brand-green">
                {formatCurrency(basePrice)}
              </span>
            </>
          ) : (
            <span className="font-bold text-base text-brand-green">
              {formatCurrency(basePrice)}
            </span>
          )}
          {product.price_compare && product.price_compare > product.price_retail && (
            <span className="text-xs text-brand-cream-dark line-through">
              {formatCurrency(product.price_compare)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
