import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product, BulkTier } from "@/types/supabase";

////////////////////////////////////////////////////////////////////
// CART STORE — src/features/cart/cartStore.ts
//
// Zustand store managing the shopping cart state.
// Persisted to localStorage so the cart survives page refreshes.
//
// Features:
//   - Add, remove, update quantity
//   - Live subtotal calculation
//   - Bulk pricing tier detection
//   - Coupon code tracking
//   - Wholesale mode awareness (uses wholesale prices when true)
//   - Cart open/close state (drives the CartWidget drawer)
//
// Usage:
//   import { useCartStore } from "@/features/cart/cartStore"
//   const { items, addItem, removeItem, total, isOpen, openCart } = useCartStore()
////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////
// CART ITEM TYPE
// A product added to the cart with quantity and applied tier
////////////////////////////////////////////////////////////////////
export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;               // First image URL
  category: string;
  priceRetail: number;         // Cents — always stored
  priceWholesale: number;      // Cents — always stored
  priceSmokeShopWholesale: number | null;  // Smoke shop wholesale price (cents)
  quantity: number;
  bulkTiers: BulkTier[] | null;
  // Applied bulk discount for current quantity (cents off per unit)
  appliedDiscountPercent: number;
}

////////////////////////////////////////////////////////////////////
// STORE STATE + ACTIONS
////////////////////////////////////////////////////////////////////
interface CartStore {
  // ---- State ----
  items: CartItem[];
  couponCode: string | null;      // Applied affiliate coupon
  couponDiscount: number;         // Flat discount in cents from coupon
  isOpen: boolean;                // Cart widget open/closed
  isWholesaleMode: boolean;       // Use wholesale prices?
  isSmokeShopWholesaleMode: boolean;  // Use smoke shop wholesale prices?

  // ---- Cart Actions ----
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // ---- Coupon Actions ----
  applyCoupon: (code: string, discountCents: number) => void;
  removeCoupon: () => void;

  // ---- UI Actions ----
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // ---- Wholesale Mode ----
  setWholesaleMode: (enabled: boolean) => void;
  setSmokeShopWholesaleMode: (enabled: boolean) => void;

  // ---- Computed Getters ----
  getItemCount: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
  getItemPrice: (item: CartItem) => number;   // Price per unit with bulk discount
}


////////////////////////////////////////////////////////////////////
// BULK PRICING HELPER
// Given a quantity and tier array, returns the discount percent to apply
////////////////////////////////////////////////////////////////////
function getApplicableBulkDiscount(
  quantity: number,
  tiers: BulkTier[] | null
): number {
  if (!tiers || tiers.length === 0) return 0;

  // Sort tiers descending by quantity, find highest tier user qualifies for
  const sorted = [...tiers].sort((a, b) => b.quantity - a.quantity);
  const applicable = sorted.find((tier) => quantity >= tier.quantity);

  return applicable?.discount_percent ?? 0;
}


////////////////////////////////////////////////////////////////////
// ZUSTAND STORE
// `persist` middleware saves the cart to localStorage automatically
////////////////////////////////////////////////////////////////////
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      ////////////////////////////////////////////////////////////////////
      // INITIAL STATE
      ////////////////////////////////////////////////////////////////////
      items: [],
      couponCode: null,
      couponDiscount: 0,
      isOpen: false,
      isWholesaleMode: false,
      isSmokeShopWholesaleMode: false,


      ////////////////////////////////////////////////////////////////////
      // ADD ITEM
      // If the product is already in the cart, increments quantity.
      // Also recalculates bulk discount tiers.
      ////////////////////////////////////////////////////////////////////
      addItem: (product: Product, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.productId === product.id
          );

          if (existingIndex >= 0) {
            // Product already in cart — increment quantity
            const updated = [...state.items];
            const existing = updated[existingIndex];
            const newQty = existing.quantity + quantity;

            updated[existingIndex] = {
              ...existing,
              quantity: newQty,
              appliedDiscountPercent: getApplicableBulkDiscount(
                newQty,
                existing.bulkTiers
              ),
            };

            return { items: updated };
          } else {
            // New item — build CartItem from product
            const cartItem: CartItem = {
              productId: product.id,
              name: product.name,
              slug: product.slug,
              image: product.images[0] ?? "",
              category: product.category,
              priceRetail: product.price_retail,
              priceWholesale: product.price_wholesale,
              priceSmokeShopWholesale: product.price_smokeshop_wholesale ?? null,
              quantity,
              bulkTiers: (product.bulk_tiers as BulkTier[]) ?? null,
              appliedDiscountPercent: getApplicableBulkDiscount(
                quantity,
                (product.bulk_tiers as BulkTier[]) ?? null
              ),
            };

            return { items: [...state.items, cartItem] };
          }
        });
      },


      ////////////////////////////////////////////////////////////////////
      // REMOVE ITEM
      // Removes product completely from cart regardless of quantity
      ////////////////////////////////////////////////////////////////////
      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },


      ////////////////////////////////////////////////////////////////////
      // UPDATE QUANTITY
      // Sets exact quantity. If quantity <= 0, removes the item.
      // Recalculates bulk pricing tier.
      ////////////////////////////////////////////////////////////////////
      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
              ? {
                  ...item,
                  quantity,
                  appliedDiscountPercent: getApplicableBulkDiscount(
                    quantity,
                    item.bulkTiers
                  ),
                }
              : item
          ),
        }));
      },


      ////////////////////////////////////////////////////////////////////
      // CLEAR CART
      // Called after successful checkout
      ////////////////////////////////////////////////////////////////////
      clearCart: () => {
        set({
          items: [],
          couponCode: null,
          couponDiscount: 0,
        });
      },


      ////////////////////////////////////////////////////////////////////
      // COUPON ACTIONS
      ////////////////////////////////////////////////////////////////////
      applyCoupon: (code: string, discountCents: number) => {
        set({ couponCode: code, couponDiscount: discountCents });
      },

      removeCoupon: () => {
        set({ couponCode: null, couponDiscount: 0 });
      },


      ////////////////////////////////////////////////////////////////////
      // UI ACTIONS — Cart Drawer
      ////////////////////////////////////////////////////////////////////
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),


      ////////////////////////////////////////////////////////////////////
      // WHOLESALE MODE TOGGLE
      ////////////////////////////////////////////////////////////////////
      setWholesaleMode: (enabled: boolean) => {
        set({ isWholesaleMode: enabled });
      },

      setSmokeShopWholesaleMode: (enabled: boolean) => {
        set({ isSmokeShopWholesaleMode: enabled });
      },


      ////////////////////////////////////////////////////////////////////
      // COMPUTED: GET ITEM PRICE
      // Returns per-unit price for a cart item, accounting for:
      //   1. Smoke shop wholesale vs wholesale vs retail price
      //   2. Bulk tier discount percentage
      ////////////////////////////////////////////////////////////////////
      getItemPrice: (item: CartItem): number => {
        let basePrice = item.priceRetail;
        
        if (get().isSmokeShopWholesaleMode && item.priceSmokeShopWholesale) {
          basePrice = item.priceSmokeShopWholesale;
        } else if (get().isWholesaleMode && item.priceWholesale) {
          basePrice = item.priceWholesale;
        }

        if (item.appliedDiscountPercent > 0) {
          const discount = Math.floor(
            (basePrice * item.appliedDiscountPercent) / 100
          );
          return basePrice - discount;
        }

        return basePrice;
      },


      ////////////////////////////////////////////////////////////////////
      // COMPUTED: ITEM COUNT
      // Total number of individual units in the cart (e.g., 3 items × 2 qty = 6)
      // Capped display at 9 — CartIcon shows "9+" above that
      ////////////////////////////////////////////////////////////////////
      getItemCount: (): number => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },


      ////////////////////////////////////////////////////////////////////
      // COMPUTED: SUBTOTAL
      // Sum of (unit price × quantity) for all items, before coupon
      ////////////////////////////////////////////////////////////////////
      getSubtotal: (): number => {
        const { items, getItemPrice } = get();
        return items.reduce((sum, item) => {
          return sum + getItemPrice(item) * item.quantity;
        }, 0);
      },


      ////////////////////////////////////////////////////////////////////
      // COMPUTED: TOTAL
      // Subtotal minus coupon discount
      // (Shipping and tax are calculated at checkout)
      ////////////////////////////////////////////////////////////////////
      getTotal: (): number => {
        const subtotal = get().getSubtotal();
        const discount = get().couponDiscount;
        return Math.max(0, subtotal - discount);
      },
    }),

    ////////////////////////////////////////////////////////////////////
    // PERSIST CONFIG
    // Saves to localStorage under the key "trippy-hippie-cart"
    // Only persist items + coupon — not UI state (isOpen)
    ////////////////////////////////////////////////////////////////////
    {
      name: "trippy-hippie-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        couponCode: state.couponCode,
        couponDiscount: state.couponDiscount,
        isWholesaleMode: state.isWholesaleMode,
      }),
    }
  )
);