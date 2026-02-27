"use client";

import Image from "next/image";
import { Trash2, Minus, Plus } from "lucide-react";
import { useCart } from "@/features/cart/useCart";
import { formatCurrency } from "@/lib/utils/cn";
import { cn } from "@/lib/utils/cn";
import type { CartItem as CartItemType } from "@/features/cart/cartStore";

/*
  CartItem — single row inside the CartWidget drawer.
  Shows: product image, name, price per unit, bulk discount badge,
  quantity +/- controls, line total, and remove button.
*/

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem, getItemPrice, isWholesaleMode } = useCart();
  const effectivePrice = getItemPrice(item);
  const lineTotal = effectivePrice * item.quantity;
  const hasDiscount = item.appliedDiscountPercent > 0;

  return (
    <div className="flex gap-3 p-4 border-b border-white/5 last:border-b-0">
      {/* Product image */}
      <div className="flex-shrink-0 w-16 h-16 rounded-brand overflow-hidden bg-[#1A2E1A]">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl" suppressHydrationWarning>
            🌿
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm font-medium text-brand-cream leading-tight truncate">
            {item.name}
          </p>
          <button
            onClick={() => removeItem(item.productId)}
            className="flex-shrink-0 p-1 text-brand-cream-dark hover:text-red-400 transition-colors"
            aria-label="Remove item"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Price + discount badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-brand-cream-muted">
            {formatCurrency(effectivePrice)} ea.
          </span>
          {hasDiscount && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-green/15 text-brand-green font-semibold">
              -{item.appliedDiscountPercent}%
            </span>
          )}
          {isWholesaleMode && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-400 font-semibold">
              WHL
            </span>
          )}
        </div>

        {/* Quantity controls + line total */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-[#1A2E1A] rounded-brand border border-white/10">
            <button
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className={cn(
                "p-1.5 text-brand-cream-muted hover:text-brand-cream transition-colors",
                item.quantity <= 1 && "opacity-30 cursor-not-allowed"
              )}
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="text-sm font-medium text-brand-cream min-w-[1.5rem] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              className="p-1.5 text-brand-cream-muted hover:text-brand-cream transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <span className="text-sm font-semibold text-brand-cream">
            {formatCurrency(lineTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default CartItem;
