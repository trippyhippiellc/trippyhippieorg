"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/features/cart/useCart";
import { cn } from "@/lib/utils/cn";

/*
  CartIcon — the cart button in the Navbar.
  Shows a live counter badge that caps at "9+".
  Pulses with a bounce animation when an item is added.
*/

export function CartIcon() {
  const { toggleCart, itemCount, displayCount, hasItems } = useCart();

  return (
    <button
      onClick={toggleCart}
      className={cn(
        "relative flex items-center justify-center",
        "w-10 h-10 rounded-brand",
        "text-brand-cream-muted hover:text-brand-cream",
        "hover:bg-white/5 transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
      )}
      aria-label={`Shopping cart${itemCount > 0 ? `, ${itemCount} item${itemCount !== 1 ? "s" : ""}` : ""}`}
    >
      <ShoppingCart className="h-5 w-5" />

      {/* Counter badge — only shown when cart has items */}
      {hasItems && (
        <span
          className={cn(
            "absolute -top-1 -right-1",
            "min-w-[18px] h-[18px] px-1",
            "rounded-full",
            "bg-brand-green text-white",
            "text-[10px] font-bold leading-none",
            "flex items-center justify-center",
            "animate-counter-bounce"
          )}
        >
          {displayCount}
        </span>
      )}
    </button>
  );
}

export default CartIcon;
