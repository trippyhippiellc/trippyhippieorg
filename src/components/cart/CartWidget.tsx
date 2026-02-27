"use client";

import { useState, useEffect } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { CartItem } from "@/components/cart/CartItem";
import { CartEmpty } from "@/components/cart/CartEmpty";
import { CartSummary } from "@/components/cart/CartSummary";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/features/cart/useCart";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";

/*
  CartWidget — the slide-in cart drawer.
  Opens when the CartIcon in the Navbar is clicked.
  Contains: item list, empty state, summary + coupon, checkout CTA.
*/

export function CartWidget() {
  const { isOpen, closeCart, items, hasItems, itemCount } = useCart();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  function handleCheckout() {
    closeCart();
    router.push("/checkout");
  }

  const footer = hasItems ? (
    <div className="px-5 py-4 space-y-3">
      <CartSummary />
      <Button
        variant="primary"
        size="xl"
        onClick={handleCheckout}
        className="w-full"
      >
        Checkout
      </Button>
      <button
        onClick={closeCart}
        className="w-full text-center text-sm text-brand-cream-dark hover:text-brand-cream transition-colors py-1"
      >
        Continue Shopping
      </button>
    </div>
  ) : null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={closeCart}
      title={
        hydrated && hasItems
          ? `Your Cart (${itemCount > 9 ? "9+" : itemCount})`
          : "Your Cart"
      }
      footer={footer}
      width="md"
    >
      {!hasItems ? (
        <CartEmpty />
      ) : (
        <div className="divide-y divide-white/5">
          {items.map((item) => (
            <CartItem key={item.productId} item={item} />
          ))}

          {/* Upsell nudge if close to a bulk tier */}
          {itemCount > 0 && itemCount < 10 && (
            <div className="px-4 py-3 bg-brand-green/5 flex items-center gap-3">
              <ShoppingBag className="h-4 w-4 text-brand-green flex-shrink-0" />
              <p className="text-xs text-brand-cream-muted">
                Add{" "}
                <span className="text-brand-green font-semibold">
                  {10 - itemCount} more
                </span>{" "}
                items to unlock bulk pricing discounts.
              </p>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}

export default CartWidget;
