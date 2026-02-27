"use client";

import { useState } from "react";
import { Tag, X, Loader2 } from "lucide-react";
import { useCart } from "@/features/cart/useCart";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

/*
  CouponField — affiliate coupon input inside CartWidget.
  Validates the code against the affiliate_applications table in Supabase.
  Valid codes give 10% off. The affiliate earns commission on the order.
*/

export function CouponField() {
  const { couponCode, couponDiscount, applyCoupon, removeCoupon } = useCart();
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const supabase = createClient();

  async function handleApply() {
    if (!input.trim()) return;
    setLoading(true);
    setError("");

    try {
      const { data, error: dbError } = await supabase
        .from("affiliate_applications")
        .select("id, affiliate_code, status")
        .eq("affiliate_code", input.trim().toUpperCase())
        .eq("status", "approved")
        .single();

      if (dbError || !data) {
        setError("Invalid or expired coupon code.");
      } else {
        applyCoupon(data.affiliate_code, 10);
        setInput("");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  /* Already applied state */
  if (couponCode) {
    return (
      <div className="flex items-center justify-between px-4 py-2.5 bg-brand-green/10 border border-brand-green/20 rounded-brand">
        <div className="flex items-center gap-2">
          <Tag className="h-3.5 w-3.5 text-brand-green" />
          <span className="text-sm font-medium text-brand-green">{couponCode}</span>
          <span className="text-xs text-brand-cream-muted">−{couponDiscount}% off</span>
        </div>
        <button
          onClick={removeCoupon}
          className="text-brand-cream-dark hover:text-red-400 transition-colors"
          aria-label="Remove coupon"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value.toUpperCase()); setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") handleApply(); }}
          placeholder="Affiliate coupon code"
          className={cn(
            "flex-1 h-9 px-3 text-sm bg-[#162816] border border-white/10 rounded-brand",
            "text-brand-cream placeholder:text-brand-cream-dark",
            "focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green/20",
            error && "border-red-500"
          )}
        />
        <button
          onClick={handleApply}
          disabled={loading || !input.trim()}
          className="h-9 px-3 text-sm font-medium bg-brand-green text-white rounded-brand hover:bg-brand-green-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Apply"}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">⚠ {error}</p>}
    </div>
  );
}

export default CouponField;
