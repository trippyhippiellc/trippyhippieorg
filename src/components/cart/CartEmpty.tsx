"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/features/cart/useCart";

/*
  CartEmpty — shown inside CartWidget when there are no items.
  Provides a clear call-to-action to go shop.
*/

export function CartEmpty() {
  const { closeCart } = useCart();

  return (
    <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-brand-green/10 flex items-center justify-center">
          <ShoppingCart className="h-9 w-9 text-brand-green/50" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#1A2E1A] border border-brand-green/20 flex items-center justify-center">
          <span className="text-xs text-brand-cream-dark">0</span>
        </div>
      </div>

      <h3 className="text-lg font-display font-semibold text-brand-cream mb-2">
        Your cart is empty
      </h3>
      <p className="text-sm text-brand-cream-muted mb-8 max-w-[200px] leading-relaxed">
        Add some premium hemp products to get started.
      </p>

      <Button
        variant="primary"
        size="md"
        onClick={closeCart}
        rightIcon={<span>→</span>}
      >
        Browse the Shop
      </Button>
    </div>
  );
}

export default CartEmpty;
