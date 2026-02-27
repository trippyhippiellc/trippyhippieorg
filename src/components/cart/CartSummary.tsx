"use client";

import { useCart } from "@/features/cart/useCart";
import { formatCurrency } from "@/lib/utils/cn";
import { CouponField } from "@/components/cart/CouponField";
import { Tag } from "lucide-react";

/*
  CartSummary — subtotal, discount line, and total shown at the
  bottom of CartWidget above the checkout button.
*/

export function CartSummary() {
  const { subtotal, total, couponCode, couponDiscount, isWholesaleMode } = useCart();
  const savings = subtotal - total;

  return (
    <div className="space-y-3 px-5 py-4">
      {/* Coupon input */}
      <CouponField />

      {/* Totals */}
      <div className="space-y-2 pt-1">
        <div className="flex justify-between text-sm text-brand-cream-muted">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>

        {isWholesaleMode && (
          <div className="flex justify-between text-sm text-violet-400">
            <span>Wholesale pricing</span>
            <span>✓ Active</span>
          </div>
        )}

        {couponCode && savings > 0 && (
          <div className="flex justify-between text-sm text-brand-green">
            <span className="flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" />
              {couponCode} (−{couponDiscount}%)
            </span>
            <span>−{formatCurrency(savings)}</span>
          </div>
        )}

        <div className="flex justify-between pt-2 border-t border-white/10">
          <span className="font-semibold text-brand-cream">Total</span>
          <span className="font-bold text-lg text-brand-green">
            {formatCurrency(total)}
          </span>
        </div>

        <p className="text-[11px] text-brand-cream-dark text-center">
          Shipping calculated at checkout
        </p>
      </div>
    </div>
  );
}

export default CartSummary;
