"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, FlaskConical, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";
import { QuantitySelector } from "@/components/product/QuantitySelector";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { BulkPricingTiers } from "@/components/product/BulkPricingTiers";
import { useCart } from "@/features/cart/useCart";
import { formatCurrency, cn } from "@/lib/utils/cn";
import type { Product } from "@/types/supabase";
import type { BulkTier } from "@/types/supabase";

interface ProductVariant {
  id: string;
  name: string;
  image: string;
  price_retail?: string | number;
  price_wholesale?: string | number;
  stock_quantity?: string | number;
}

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { isWholesaleMode } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [inventoryWarning, setInventoryWarning] = useState<{ show: boolean; maxAvailable: number }>({ show: false, maxAvailable: 0 });

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

  // Parse variants
  let variants: ProductVariant[] = [];
  if (product.has_variants && product.variants) {
    if (typeof product.variants === 'string') {
      try {
        variants = JSON.parse(product.variants) as ProductVariant[];
      } catch {
        variants = [];
      }
    } else if (Array.isArray(product.variants)) {
      variants = product.variants as ProductVariant[];
    }
  }

  // Auto-select first variant if not already selected
  if (variants.length > 0 && !selectedVariantId) {
    // This will set the initial selected variant to the first one
    // but only after the component renders to avoid infinite loops
  }

  /* Cast Json → unknown → BulkTier[] to satisfy TypeScript */
  const bulkTiers = (product.bulk_tiers as unknown as BulkTier[]) ?? [];

  // Calculate total stock from variants
  const totalStock = useMemo(() => {
    if (product.has_variants && variants.length > 0) {
      return variants.reduce((sum, v) => sum + (Number(v.stock_quantity) || 0), 0);
    }
    return product.stock_quantity;
  }, [product.has_variants, product.stock_quantity, variants]);

  // Get selected variant or use main product
  const selectedVariant = selectedVariantId 
    ? variants.find(v => v.id === selectedVariantId)
    : null;
  
  const variantPrice = selectedVariant 
    ? (isWholesaleMode && selectedVariant.price_wholesale 
        ? selectedVariant.price_wholesale 
        : selectedVariant.price_retail)
    : null;

  const basePrice = variantPrice 
    ? (typeof variantPrice === 'string' ? parseFloat(variantPrice) * 100 : variantPrice)
    : (isWholesaleMode && product.price_wholesale
        ? product.price_wholesale
        : product.price_retail);

  const variantStock = selectedVariant ? (Number(selectedVariant.stock_quantity) || 0) : 0;
  const canSelectVariant = !selectedVariant || variantStock > 0;
  const isOutOfStock = totalStock <= 0;
  const isLowStock = totalStock > 0 && totalStock < 5;
  const maxQuantity = selectedVariant ? variantStock : totalStock;

  function prevImage() { setSelectedImage(i => (i - 1 + displayedImages.length) % displayedImages.length); }
  function nextImage() { setSelectedImage(i => (i + 1) % displayedImages.length); }

  // Update image when variant is selected - IMMEDIATE
  const displayImage = selectedVariant && selectedVariant.image 
    ? selectedVariant.image 
    : (images.length > 0 ? images[selectedImage] : null);

  const displayedImages = selectedVariant && selectedVariant.image 
    ? [selectedVariant.image, ...images.filter(img => img !== selectedVariant.image)]
    : images;

  return (
    <div className="container-brand section-padding">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* ── IMAGE GALLERY ── */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-card overflow-hidden bg-[#1A2E1A] border border-brand-green/10">
            {displayImage ? (
              <Image
                src={displayImage}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">🌿</div>
            )}

            {displayedImages.length > 1 && (
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

          {displayedImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {displayedImages.map((img, i) => (
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

          {/* ── VARIANT SELECTOR ── */}
          {product.has_variants && variants.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-white/5">
              <label className="text-sm font-medium text-brand-cream-muted">Select Strain</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {variants.map((variant) => {
                  const vStock = Number(variant.stock_quantity) || 0;
                  const isSelected = selectedVariantId === variant.id;
                  const isSoldOut = vStock === 0;
                  
                  return (
                    <button
                      key={variant.id}
                      onClick={() => {
                        if (!isSoldOut) {
                          setSelectedVariantId(variant.id);
                          setSelectedImage(0); // Immediately show variant's first image
                          setQuantity(1); // Reset quantity when switching variants
                        }
                      }}
                      disabled={isSoldOut}
                      className={cn(
                        "p-3 rounded-brand border-2 transition-all text-left min-h-20 flex flex-col justify-between",
                        isSelected 
                          ? "border-brand-green bg-brand-green/20"
                          : isSoldOut
                          ? "border-red-500/30 bg-red-500/5 opacity-50 cursor-not-allowed"
                          : "border-white/10 bg-white/5 hover:border-brand-green/40"
                      )}
                    >
                      <p className="text-sm font-medium text-brand-cream line-clamp-2">{variant.name}</p>
                      {isSoldOut && (
                        <p className="text-xs text-red-400 font-semibold mt-1">Sold Out</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── QUANTITY & ADD TO CART ── */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-brand-cream-muted w-20">Quantity</span>
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={maxQuantity}
                size="lg"
              />
              {isLowStock && !selectedVariant && (
                <span className="text-xs text-brand-green font-semibold">Low Stock!</span>
              )}
            </div>

            {/* Inventory Warning Modal */}
            {inventoryWarning.show && (
              <div className="p-4 rounded-brand border-2 border-brand-green/40 bg-brand-green/10 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-brand-green flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-brand-cream mb-2">
                    Limited Stock Available
                  </p>
                  <p className="text-sm text-brand-cream-muted mb-3">
                    There are currently only {inventoryWarning.maxAvailable} left in stock. Would you like to add {inventoryWarning.maxAvailable} {inventoryWarning.maxAvailable === 1 ? 'item' : 'items'} to your cart?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setQuantity(inventoryWarning.maxAvailable);
                        setInventoryWarning({ show: false, maxAvailable: 0 });
                      }}
                      className="px-3 py-1.5 rounded-brand bg-brand-green text-white text-sm font-semibold hover:bg-brand-green-light transition-colors"
                    >
                      Yes, Add Remaining
                    </button>
                    <button
                      onClick={() => setInventoryWarning({ show: false, maxAvailable: 0 })}
                      className="px-3 py-1.5 rounded-brand border border-brand-green text-brand-green text-sm font-semibold hover:bg-brand-green/10 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <AddToCartButton 
              product={product} 
              quantity={quantity} 
              maxAvailable={maxQuantity}
              variantId={selectedVariantId}
              onInventoryWarning={(maxAvailable) => {
                setInventoryWarning({ show: true, maxAvailable });
              }}
              className="w-full" 
            />
          </div>

          {bulkTiers.length > 0 && (
            <BulkPricingTiers tiers={bulkTiers} basePrice={basePrice} currentQuantity={quantity} />
          )}

          <div className="pt-4 border-t border-white/5 space-y-3">
            {product.weight_grams != null && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-cream-dark">Weight</span>
                <span className="text-brand-cream font-medium">{product.weight_grams}g</span>
              </div>
            )}
            {product.thca_percentage != null && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-cream-dark">THCa Content</span>
                <span className="font-medium text-brand-green">{product.thca_percentage}%</span>
              </div>
            )}
            {product.strain_type && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-cream-dark">Strain Type</span>
                <span className="text-brand-cream font-medium capitalize">{product.strain_type}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-brand-cream-muted">
              <FlaskConical className="h-4 w-4 text-brand-green flex-shrink-0" />
              Third-party lab tested — COA available upon request
            </div>

            {/* Category & Subcategory */}
            {product.subcategory && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-cream-dark">Product Type</span>
                <span className="text-brand-cream capitalize">{product.category} · {product.subcategory}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── DESCRIPTION (MOVED BELOW) ── */}
      {product.description && (
        <div className="mt-16 pt-12 border-t border-white/5">
          <h2 className="text-2xl font-display font-bold text-brand-cream mb-4">Product Details</h2>
          <div className="prose prose-invert max-w-none text-brand-cream-muted space-y-3 leading-relaxed">
            {/* Split description by double newlines for paragraphs */}
            {product.description.split(/\n\n+/).map((paragraph, idx) => (
              <p key={idx} className="whitespace-pre-wrap">
                {/* Support **bold** syntax, but also display newlines */}
                {paragraph.split(/(\*\*[^*]*\*\*)/g).map((part, i) => 
                  part.startsWith('**') ? (
                    <strong key={i} className="text-brand-cream font-semibold">
                      {part.slice(2, -2)}
                    </strong>
                  ) : (
                    part
                  )
                )}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* ── TAGS ── */}
      {product.tags && product.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-1.5">
          {product.tags.map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-brand-cream-dark">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductDetailClient;


