"use client";

/*
  CartProvider — thin wrapper. The cart state lives in Zustand (cartStore.ts)
  which persists to localStorage automatically. This provider exists purely
  to make it explicit in the component tree and to allow future additions
  like server-side cart sync when a user logs in.
*/

import { useEffect } from "react";
import { useCartStore } from "@/features/cart/cartStore";
import { useAuth } from "@/context/AuthContext";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const setWholesaleMode = useCartStore((s) => s.setWholesaleMode);

  /*
    Sync wholesale mode with the user's account status.
    If a wholesale-approved user logs in, enable wholesale pricing automatically.
    If they log out or lose approval, revert to retail.
  */
  useEffect(() => {
    if (profile?.is_wholesale_approved && profile?.is_wholesale) {
      setWholesaleMode(true);
    } else {
      setWholesaleMode(false);
    }
  }, [profile?.is_wholesale_approved, profile?.is_wholesale, setWholesaleMode]);

  return <>{children}</>;
}

export default CartProvider;
