"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";
import { QuantitySelector } from "@/components/product/QuantitySelector";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { BulkPricingTiers } from "@/components/product/BulkPricingTiers";
import { useCart } from "@/features/cart/useCart";
import { formatCurrency, cn } from "@/lib/utils/cn";
import type { Product } from "@/types/supabase";
import type { BulkTier } from "@/types/supabase";

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { isWholesaleMode } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity,      setQuantity]      = useState(1);

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

  /* Cast Json → unknown → BulkTier[] to satisfy TypeScript */
  const bulkTiers = (product.bulk_tiers as unknown as BulkTier[]) ?? [];

  const basePrice = isWholesaleMode && product.price_wholesale
    ? product.price_wholesale
    : product.price_retail;

  const isOutOfStock = product.stock_quantity <= 0;

  function prevImage() { setSelectedImage(i => (i - 1 + images.length) % images.length); }
  function nextImage() { setSelectedImage(i => (i + 1) % images.length); }

  return (
    <div className="container-brand section-padding">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* ── IMAGE GALLERY ── */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-card overflow-hidden bg-[#1A2E1A] border border-brand-green/10">
            {images.length > 0 ? (
              <Image
                src={images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">🌿</div>
            )}

            {images.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.is_featured && <Badge variant="featured">Featured</Badge>}
              {isOutOfStock        && <Badge variant="cancelled">Sold Out</Badge>}
              {isWholesaleMode     && <Badge variant="wholesale">Wholesale</Badge>}
            </div>

            {product.thca_percentage != null && (
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-brand bg-brand-green/20 border border-brand-green/30 text-brand-green text-sm font-bold">
                {product.thca_percentage}% THCa
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "relative flex-shrink-0 w-16 h-16 rounded-brand overflow-hidden border-2 transition-all",
                    i === selectedImage ? "border-brand-green" : "border-white/10 hover:border-white/30"
                  )}
                >
                  <Image src={img} alt={`View ${i + 1}`} fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── PRODUCT INFO ── */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-brand-cream-dark uppercase tracking-widest">{product.category}</span>
            {product.strain_type != null && (
              <Badge variant={product.strain_type as "sativa" | "indica" | "hybrid"} />
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-display font-bold text-brand-cream leading-tight">
            {product.name}
          </h1>

          {product.review_count > 0 && (
            <StarRating value={product.average_rating} readOnly size="md" showCount reviewCount={product.review_count} />
          )}

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-brand-green">{formatCurrency(basePrice)}</span>
            {product.price_compare != null && product.price_compare > basePrice && (
              <span className="text-xl text-brand-cream-dark line-through">{formatCurrency(product.price_compare)}</span>
            )}
            {isWholesaleMode && <Badge variant="wholesale">Wholesale Price</Badge>}
          </div>

          {product.description && (
            <p className="text-brand-cream-muted leading-relaxed">{product.description}</p>
          )}

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-brand-cream-dark">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-brand-cream-muted w-20">Quantity</span>
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={product.stock_quantity}
                size="lg"
              />
              <span className="text-xs text-brand-cream-dark">{product.stock_quantity} in stock</span>
            </div>
            <AddToCartButton product={product} quantity={quantity} className="w-full" />
          </div>

          {bulkTiers.length > 0 && (
            <BulkPricingTiers tiers={bulkTiers} basePrice={basePrice} currentQuantity={quantity} />
          )}

          <div className="pt-4 border-t border-white/5 space-y-3">
            {product.weight_grams != null && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-cream-dark">Weight</span>
                <span className="text-brand-cream">{product.weight_grams}g</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-brand-cream-muted">
              <FlaskConical className="h-4 w-4 text-brand-green flex-shrink-0" />
              Third-party lab tested — COA available upon request
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailClient;
