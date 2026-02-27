"use client";

import { Tag } from "lucide-react";
import { formatCurrency } from "@/lib/utils/cn";
import { cn } from "@/lib/utils/cn";

/*
  BulkPricingTiers — "Buy More & Save" table on product detail page.
  Shows each tier with quantity threshold, discount %, and effective price.
  Highlights the tier the user currently qualifies for.
*/

interface BulkTier {
  quantity: number;
  discount_percent: number;
}

interface BulkPricingTiersProps {
  tiers: BulkTier[];
  basePrice: number;
  currentQuantity: number;
  className?: string;
}

export function BulkPricingTiers({
  tiers,
  basePrice,
  currentQuantity,
  className,
}: BulkPricingTiersProps) {
  if (!tiers || tiers.length === 0) return null;

  const sorted = [...tiers].sort((a, b) => a.quantity - b.quantity);

  function getActiveIndex(): number {
    let active = -1;
    for (let i = 0; i < sorted.length; i++) {
      if (currentQuantity >= sorted[i].quantity) active = i;
    }
    return active;
  }

  const activeIndex = getActiveIndex();

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 mb-3">
        <Tag className="h-4 w-4 text-brand-green" />
        <h3 className="text-sm font-semibold text-brand-cream">Buy More &amp; Save</h3>
      </div>

      <div className="space-y-1.5">
        {sorted.map((tier, i) => {
          const effectivePrice = Math.round(basePrice * (1 - tier.discount_percent / 100));
          const isActive = i === activeIndex;
          const isPast   = i < activeIndex;

          return (
            <div
              key={tier.quantity}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-brand text-sm transition-all",
                isActive && "bg-brand-green/15 border border-brand-green/30",
                !isActive && !isPast && "bg-[#162816] border border-white/5",
                isPast && "bg-brand-green/5 border border-brand-green/10"
              )}
            >
              <div className="flex items-center gap-2">
                {isActive && (
                  <span className="text-[10px] font-bold text-brand-green uppercase tracking-wide">
                    Active
                  </span>
                )}
                <span className={cn(
                  "font-medium",
                  isActive ? "text-brand-cream" : "text-brand-cream-muted"
                )}>
                  {tier.quantity}+ units
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className={cn(
                  "font-semibold",
                  isActive ? "text-brand-green" : "text-brand-cream-muted"
                )}>
                  -{tier.discount_percent}%
                </span>
                <span className={cn(
                  "text-xs",
                  isActive ? "text-brand-cream" : "text-brand-cream-dark"
                )}>
                  {formatCurrency(effectivePrice)}/ea
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BulkPricingTiers;
