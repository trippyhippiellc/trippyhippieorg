"use client";

import { formatCurrency } from "@/lib/utils/cn";
import type { CartItem } from "@/features/cart/cartStore";

interface OrderSummaryProps {
  items: CartItem[];
  total: number;
  tax?: number;
  shipping?: number;
}

export function OrderSummary({ items, total, tax = 0, shipping = 0 }: OrderSummaryProps) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.priceRetail * item.quantity,
    0
  );

  return (
    <div className="glass-card p-6 md:p-8 border border-brand-green/15 sticky top-24">
      <h3 className="text-lg font-display font-bold text-brand-cream mb-6">
        Order Summary
      </h3>

      {/* Items */}
      <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto">
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between text-sm">
            <div>
              <p className="text-brand-cream">{item.name}</p>
              <p className="text-xs text-brand-cream-muted">
                Qty: {item.quantity}
              </p>
            </div>
            <p className="text-brand-cream font-medium">
              {formatCurrency(item.priceRetail * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-white/10 mb-4" />

      {/* Summary rows */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-sm text-brand-cream-muted">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {shipping > 0 && (
          <div className="flex justify-between text-sm text-brand-cream-muted">
            <span>Shipping</span>
            <span>{formatCurrency(shipping)}</span>
          </div>
        )}
        {tax > 0 && (
          <div className="flex justify-between text-sm text-brand-cream-muted">
            <span>Tax</span>
            <span>{formatCurrency(tax)}</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-white/10 pt-4" />

      {/* Total */}
      <div className="flex justify-between items-baseline">
        <span className="font-display font-bold text-brand-cream">Total</span>
        <span className="text-2xl font-bold text-brand-green">
          {formatCurrency(total)}
        </span>
      </div>

      {/* Badge */}
      <div className="mt-6 p-3 rounded-card bg-brand-green/10 border border-brand-green/20 text-center">
        <p className="text-xs font-semibold text-brand-green">
          ✓ Farm Bill Compliant
        </p>
        <p className="text-xs text-brand-cream-muted mt-1">
          All products lab-tested and verified ≤0.3% Δ9-THC
        </p>
      </div>
    </div>
  );
}
