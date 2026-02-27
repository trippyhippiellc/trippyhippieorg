"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";

/* src/app/(main)/checkout/stripe/page.tsx
 * Shown after order is created with payment_method=stripe.
 * Calls /api/payments/stripe/create-session, then redirects to Stripe.
 */

export default function StripeCheckoutPage() {
  const params  = useSearchParams();
  const order   = params.get("order");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!order) return;
    (async () => {
      try {
        /* We need the order UUID — fetch it from order_number */
        const res  = await fetch("/api/payments/stripe/create-session", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ orderNumber: order }),
        });
        const data = await res.json() as { url?: string; error?: string };
        if (data.url) {
          window.location.href = data.url;
        } else {
          setError(data.error ?? "Failed to start Stripe checkout.");
        }
      } catch {
        setError("Network error. Please try again.");
      }
    })();
  }, [order]);

  if (error) {
    return (
      <div className="container-brand section-padding max-w-md mx-auto text-center">
        <p className="text-red-400 mb-4">⚠ {error}</p>
        <Button variant="primary" onClick={() => window.location.href = "/checkout"}>
          Back to Checkout
        </Button>
      </div>
    );
  }

  return (
    <div className="container-brand section-padding flex flex-col items-center justify-center min-h-[40vh] gap-4">
      <Spinner size="lg" />
      <p className="text-brand-cream-muted">Redirecting to secure payment…</p>
    </div>
  );
}
