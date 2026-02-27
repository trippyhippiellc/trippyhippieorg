import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* src/app/api/coupons/validate/route.ts
 *
 * POST body: { code: string; subtotalCents: number }
 * Returns: { valid: boolean; discount: number; type: string; message?: string }
 */

interface CouponRow {
  id:              string;
  code:            string;
  type:            "percent" | "fixed";
  value:           number;
  min_order_cents: number | null;
  max_uses:        number | null;
  uses:            number;
  expires_at:      string | null;
  is_active:       boolean;
}

export async function POST(req: NextRequest) {
  try {
    const { code, subtotalCents } = await req.json() as {
      code: string;
      subtotalCents: number;
    };

    if (!code) return NextResponse.json({ valid: false, message: "No code provided." });

    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: coupon } = await (supabase.from("coupons") as any)
      .select("*")
      .eq("code", code.toUpperCase().trim())
      .eq("is_active", true)
      .single();

    if (!coupon) {
      return NextResponse.json({ valid: false, message: "Coupon not found or expired." });
    }

    const c = coupon as CouponRow;

    /* Expiry check */
    if (c.expires_at && new Date(c.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, message: "This coupon has expired." });
    }

    /* Max uses check */
    if (c.max_uses !== null && c.uses >= c.max_uses) {
      return NextResponse.json({ valid: false, message: "This coupon has reached its usage limit." });
    }

    /* Minimum order check */
    if (c.min_order_cents && subtotalCents < c.min_order_cents) {
      const min = (c.min_order_cents / 100).toFixed(2);
      return NextResponse.json({ valid: false, message: `Minimum order of $${min} required.` });
    }

    /* Calculate discount */
    const discount = c.type === "percent"
      ? Math.round(subtotalCents * (c.value / 100))
      : Math.min(c.value, subtotalCents); // fixed discount, can't exceed subtotal

    return NextResponse.json({
      valid:    true,
      discount,
      type:     c.type,
      value:    c.value,
      message:  c.type === "percent"
        ? `${c.value}% off applied!`
        : `$${(c.value / 100).toFixed(2)} off applied!`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ valid: false, message }, { status: 500 });
  }
}
