"use client";

import { useCartStore } from "@/features/cart/cartStore";
import toast from "react-hot-toast";
import type { Product } from "@/types/supabase";

/*
  useCart — convenience hook that wraps the Zustand cart store
  and adds toast notifications. Import this in UI components
  instead of useCartStore directly.
*/

export function useCart() {
  const store = useCartStore();

  function addItem(product: Product, quantity = 1) {
    store.addItem(product, quantity);
    toast.success(`${product.name} added to cart`, {
      icon: "🛒",
      duration: 2000,
    });
  }

  function removeItem(productId: string) {
    store.removeItem(productId);
    toast("Item removed", { icon: "🗑️", duration: 1500 });
  }

  function clearCart() {
    store.clearCart();
    toast("Cart cleared", { duration: 1500 });
  }

  function applyCoupon(code: string, discountPercent: number) {
    store.applyCoupon(code, discountPercent);
    toast.success(`Coupon "${code}" applied — ${discountPercent}% off!`);
  }

  function removeCoupon() {
    store.removeCoupon();
    toast("Coupon removed", { duration: 1500 });
  }

  const rawCount    = store.getItemCount();
  const displayCount = rawCount > 9 ? "9+" : rawCount.toString();
  const hasItems    = rawCount > 0;

  return {
    items:           store.items,
    couponCode:      store.couponCode,
    couponDiscount:  store.couponDiscount,
    isOpen:          store.isOpen,
    isWholesaleMode: store.isWholesaleMode,
    isSmokeShopWholesaleMode: store.isSmokeShopWholesaleMode,

    itemCount:    rawCount,
    displayCount,
    hasItems,
    subtotal:     store.getSubtotal(),
    total:        store.getTotal(),
    getItemPrice: store.getItemPrice,

    addItem,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,

    updateQuantity:   store.updateQuantity,
    openCart:         store.openCart,
    closeCart:        store.closeCart,
    toggleCart:       store.toggleCart,
    setWholesaleMode: store.setWholesaleMode,
    setSmokeShopWholesaleMode: store.setSmokeShopWholesaleMode,
  };
}

export default useCart;
