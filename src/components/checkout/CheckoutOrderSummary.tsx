"use client";

import Image from "next/image";
import { useCart } from "@/features/cart/useCart";
import { formatCurrency } from "@/lib/utils/cn";
import { Tag } from "lucide-react";

/* src/components/checkout/CheckoutOrderSummary.tsx */

export function CheckoutOrderSummary() {
  const { items, subtotal, total, couponCode, couponDiscount, getItemPrice } = useCart();

  return (
    <div className="glass-card border border-brand-green/10 p-6 rounded-card space-y-5">
      <h3 className="font-display font-semibold text-brand-cream text-lg">Order Summary</h3>

      {/* Line items */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {items.map(item => {
          const unitPrice = getItemPrice(item);
          return (
            <div key={item.productId} className="flex items-center gap-3">
              {/* Image */}
              <div className="relative w-14 h-14 rounded-brand overflow-hidden bg-[#1A2E1A] flex-shrink-0">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">🌿</div>
                )}
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-green text-white text-[10px] font-bold flex items-center justify-center">
                  {item.quantity}
                </span>
              </div>
              {/* Name + price */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-brand-cream font-medium truncate">{item.name}</p>
                <p className="text-xs text-brand-cream-dark">{formatCurrency(unitPrice)} × {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-brand-cream flex-shrink-0">
                {formatCurrency(unitPrice * item.quantity)}
              </p>
            </div>
          );
        })}
      </div>

      <div className="border-t border-white/5 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-brand-cream-muted">Subtotal</span>
          <span className="text-brand-cream">{formatCurrency(subtotal)}</span>
        </div>

        {couponCode && couponDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-brand-green flex items-center gap-1">
              <Tag className="h-3 w-3" /> {couponCode}
            </span>
            <span className="text-brand-green">-{formatCurrency(couponDiscount)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-brand-cream-muted">Shipping</span>
          <span className="text-brand-cream-muted">Calculated next</span>
        </div>

        <div className="flex justify-between font-bold text-base border-t border-white/5 pt-2 mt-2">
          <span className="text-brand-cream">Total</span>
          <span className="text-brand-green">{formatCurrency(total)}</span>
        </div>
      </div>

      <p className="text-[11px] text-brand-cream-dark text-center">
        Hemp products ≤0.3% Δ9-THC · Farm Bill Compliant · 21+ only
      </p>
    </div>
  );
}

export default CheckoutOrderSummary;
