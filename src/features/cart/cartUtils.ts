/*
  cartUtils.ts — price calculation helpers for the cart.
  All prices are stored and calculated in CENTS (integers).
  Use formatCurrency() from cn.ts to display them.
*/

export interface BulkTier {
  quantity: number;
  discount_percent: number;
}

/* Find the highest qualifying bulk discount for a given quantity */
export function getApplicableBulkDiscount(
  quantity: number,
  tiers: BulkTier[]
): number {
  if (!tiers || tiers.length === 0) return 0;
  const sorted = [...tiers].sort((a, b) => b.quantity - a.quantity);
  const match = sorted.find((t) => quantity >= t.quantity);
  return match?.discount_percent ?? 0;
}

/* Apply a percentage discount to a cents price */
export function applyDiscount(priceCents: number, discountPercent: number): number {
  if (discountPercent <= 0) return priceCents;
  return Math.round(priceCents * (1 - discountPercent / 100));
}

/* Calculate the effective price per item in cents */
export function getEffectivePrice(
  priceCents: number,
  quantity: number,
  tiers: BulkTier[],
  isWholesaleMode: boolean,
  wholesalePriceCents?: number
): number {
  const base = isWholesaleMode && wholesalePriceCents != null
    ? wholesalePriceCents
    : priceCents;
  const discount = getApplicableBulkDiscount(quantity, tiers);
  return applyDiscount(base, discount);
}

/* Calculate subtotal for all cart items in cents */
export function calculateSubtotal(
  items: Array<{
    priceRetail: number;
    priceWholesale?: number;
    quantity: number;
    bulkTiers: BulkTier[];
    appliedDiscountPercent: number;
  }>,
  isWholesaleMode: boolean
): number {
  return items.reduce((sum, item) => {
    const base = isWholesaleMode && item.priceWholesale != null
      ? item.priceWholesale
      : item.priceRetail;
    const price = applyDiscount(base, item.appliedDiscountPercent);
    return sum + price * item.quantity;
  }, 0);
}

/* Apply affiliate coupon discount to subtotal */
export function applyCouponDiscount(
  subtotalCents: number,
  couponDiscountPercent: number
): number {
  if (couponDiscountPercent <= 0) return subtotalCents;
  return Math.round(subtotalCents * (1 - couponDiscountPercent / 100));
}

/* Calculate 10% affiliate commission on order total */
export function calculateAffiliateCommission(totalCents: number): number {
  return Math.round(totalCents * 0.1);
}
