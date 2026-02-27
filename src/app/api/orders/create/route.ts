import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

interface OrderItem {
  product_id: string;
  name: string;
  unit_price: number;
  quantity: number;
}

interface CreateOrderRequest {
  paymentMethod: "cashapp" | "stripe" | "crypto" | "wire";
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  email: string;
  full_name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  items?: OrderItem[];
  stripePaymentMethodId?: string;
}

interface Order {
  id: string;
  user_id: string;
  order_number: string;
  total: number;
  created_at: string;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10" as any,
});

// Helper function to generate unique order number
function generateUniqueOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `TH-${year}${month}${day}-${String(random).slice(-3)}${String(timestamp).slice(-2)}`;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = (await req.json()) as CreateOrderRequest;
    const {
      paymentMethod,
      subtotal,
      tax,
      shipping,
      discount,
      total,
      email,
      full_name,
      line1,
      line2,
      city,
      state,
      zip,
      phone,
      items = [],
      stripePaymentMethodId,
    } = body;

    // Process Stripe payment if using Stripe
    if (paymentMethod === "stripe" && stripePaymentMethodId) {
      try {
        console.log("[Stripe Payment] Creating PaymentIntent for", total);
        
        // Create PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(total), // Amount in cents (already in cents from total)
          currency: "usd",
          payment_method: stripePaymentMethodId,
          confirm: true,
          payment_method_types: ["card"],
          description: `Order for ${full_name}`,
          receipt_email: email,
        });

        if (paymentIntent.status !== "succeeded") {
          console.error("[Stripe Payment] Payment failed:", paymentIntent.status);
          return NextResponse.json(
            { error: `Payment failed: ${paymentIntent.status}` },
            { status: 402 }
          );
        }

        console.log("[Stripe Payment] Success:", paymentIntent.id);
      } catch (stripeError: any) {
        console.error("[Stripe Payment] Error:", stripeError.message);
        return NextResponse.json(
          { error: stripeError.message || "Payment processing failed" },
          { status: 402 }
        );
      }
    }

    // Generate order number with retry logic for duplicates
    let orderNumber = generateUniqueOrderNumber();
    let order: Order | null = null;
    let error: any = null;
    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries && !order) {
      const { data: insertedOrder, error: insertError } = await (await createClient())
        .from("orders")
        .insert({
          order_number: orderNumber,
          user_id: user.id,
          subtotal,
          tax,
          shipping,
          discount,
          total,
          email,
          full_name,
          shipping_address: {
            line1,
            line2,
            city,
            state,
            zip,
            phone,
          },
          items: items,
          payment_method: paymentMethod,
          status: paymentMethod === "stripe" ? "processing" : "pending",
          created_at: new Date().toISOString(),
        } as any)
        .select()
        .single() as { data: Order | null; error: any };

      if (insertError) {
        // If duplicate key, retry with new order number
        if (insertError.code === "23505") {
          console.warn(`[Order Creation] Duplicate order number ${orderNumber}, retrying...`);
          orderNumber = generateUniqueOrderNumber();
          retries++;
          continue;
        }
        // Other errors should fail immediately
        error = insertError;
        break;
      }

      order = insertedOrder;
      break;
    }

    if (error) {
      console.error("[Order Creation] Database error:", {
        code: error.code,
        message: error.message,
        details: error.details,
      });
      return NextResponse.json(
        { error: error.message || "Failed to create order" },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json(
        { error: "Order creation failed after retries" },
        { status: 500 }
      );
    }

    // Deduct stock for each item in the order
    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        try {
          // Get current stock quantity
          const { data: product, error: fetchError } = await supabase
            .from("products")
            .select("stock_quantity")
            .eq("id", item.product_id)
            .single() as { data: { stock_quantity: number } | null; error: any };

          if (!fetchError && product) {
            const newStock = Math.max(0, (product.stock_quantity || 0) - (item.quantity || 1));
            await (supabase.from("products") as any).update({ stock_quantity: newStock }).eq("id", item.product_id);
            console.log(`[Stock] Updated ${item.product_id}: ${product.stock_quantity} → ${newStock}`);
          }
        } catch (err) {
          console.warn(`[Stock] Failed to update inventory for ${item.product_id}:`, err);
          // Don't fail the order if stock update fails
        }
      }
    }

    console.log("[Order Creation] Success:", { orderId: order.id, userId: user.id, orderNumber });
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
