"use client";

import { useState, useEffect } from "react";
import { CreditCard, AlertCircle, Loader, CheckCircle, Lock } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils/cn";
import { useCart } from "@/features/cart/useCart";
import toast from "react-hot-toast";

// Initialize Stripe with proper error handling
const initializeStripe = () => {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key || key.trim() === "") {
    console.error("Stripe publishable key is not configured");
    return Promise.reject(new Error("Stripe publishable key is missing"));
  }
  if (!key.startsWith("pk_")) {
    console.error("Invalid Stripe publishable key format");
    return Promise.reject(new Error("Invalid Stripe publishable key"));
  }
  return loadStripe(key);
};

const stripePromise = initializeStripe();

interface StripePaymentProps {
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  email: string;
  addressData: {
    full_name: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
  };
  onProcessing: (isProcessing: boolean) => void;
  onSuccess: () => void;
}

function CardFormContent({
  total,
  subtotal,
  tax,
  shipping,
  discount,
  email,
  addressData,
  onProcessing,
  onSuccess,
}: StripePaymentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { items, getItemPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError("Payment system not initialized");
      return;
    }

    setLoading(true);
    onProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      // Create payment method
      const { error: methodError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
        });

      if (methodError) {
        throw new Error(methodError.message || "Payment method creation failed");
      }

      // Map cart items to order items format
      const orderItems = items.map((item) => ({
        product_id: item.productId,
        name: item.name,
        unit_price: Math.round(getItemPrice(item)),
        quantity: item.quantity,
      }));

      // Create payment via API with all order data
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: "stripe",
          subtotal,
          tax,
          shipping,
          discount,
          total,
          email,
          full_name: addressData.full_name,
          line1: addressData.line1,
          line2: addressData.line2,
          city: addressData.city,
          state: addressData.state,
          zip: addressData.zip,
          phone: addressData.phone,
          items: orderItems,
          stripePaymentMethodId: paymentMethod.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create order");
      }

      setSucceeded(true);
      toast.success("Payment successful! Redirecting...");
      
      // Clear cart after successful order
      clearCart();
      
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Payment failed. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      onProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#F5F0E8",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        "::placeholder": {
          color: "rgba(245, 240, 232, 0.35)",
        },
      },
      invalid: {
        color: "#ef4444",
        iconColor: "#ef4444",
      },
    },
    hidePostalCode: false,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card Input */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-brand-cream">
          Card Information
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-green/60">
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 pl-14 focus-within:border-brand-green/60 focus-within:bg-white/8 focus-within:shadow-lg focus-within:shadow-brand-green/10 transition-all">
            <CardElement
              options={cardElementOptions}
              onChange={(e) => {
                setCardComplete(e.complete);
                if (e.error) {
                  setError(e.error.message);
                } else {
                  setError(null);
                }
              }}
            />
          </div>
        </div>
        <p className="text-xs text-brand-cream/50 flex items-center gap-1.5">
          <Lock className="h-3 w-3" />
          Encrypted and secure
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-300 text-sm">{error}</p>
            <p className="text-red-300/70 text-xs mt-1">Please check your card details and try again</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {succeeded && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex gap-3">
          <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-green-300 text-sm font-medium">
            Payment processed successfully. Redirecting to your orders...
          </p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!cardComplete || loading || succeeded}
        className="w-full bg-brand-green hover:bg-brand-green/90 disabled:bg-white/10 disabled:text-brand-cream/30 text-brand-cream font-semibold py-4 rounded-lg transition-all flex items-center justify-center gap-2 text-lg"
      >
        {loading && <Loader className="h-5 w-5 animate-spin" />}
        {succeeded ? (
          <>
            <CheckCircle className="h-5 w-5" />
            Complete
          </>
        ) : (
          <>
            <Lock className="h-5 w-5" />
            {loading ? "Processing Payment..." : `Secure Payment ${formatCurrency(total)}`}
          </>
        )}
      </Button>

      {/* Trust Indicators */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
        <div className="text-center p-3 rounded-lg bg-white/5 border border-white/5">
          <div className="h-8 w-8 rounded-full bg-brand-green/15 flex items-center justify-center mx-auto mb-2">
            <Lock className="h-4 w-4 text-brand-green" />
          </div>
          <p className="text-xs text-brand-cream/60 font-medium">SSL Encrypted</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-white/5 border border-white/5">
          <div className="h-8 w-8 rounded-full bg-brand-green/15 flex items-center justify-center mx-auto mb-2">
            <CheckCircle className="h-4 w-4 text-brand-green" />
          </div>
          <p className="text-xs text-brand-cream/60 font-medium">PCI Compliant</p>
        </div>
      </div>
    </form>
  );
}

export function StripePayment(props: StripePaymentProps) {
  const [mounted, setMounted] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Check if Stripe initialized successfully
    stripePromise.catch((err) => {
      console.error("Stripe initialization error:", err);
      setStripeError(
        err instanceof Error
          ? err.message
          : "Failed to load payment system. Please refresh the page."
      );
    });
  }, []);

  if (!mounted) {
    return (
      <div className="text-center py-12">
        <Loader className="h-8 w-8 text-brand-green animate-spin mx-auto mb-3" />
        <p className="text-brand-cream-muted">Loading secure payment form...</p>
      </div>
    );
  }

  if (stripeError) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 flex gap-3">
        <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0" />
        <div>
          <p className="font-semibold text-red-300 mb-2">Payment System Error</p>
          <p className="text-red-300/80 text-sm mb-4">{stripeError}</p>
          <p className="text-red-300/70 text-xs">
            Please refresh the page or try a different payment method
          </p>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CardFormContent {...props} />
    </Elements>
  );
}
