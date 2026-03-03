"use client";

import { useState } from "react";
import { Smartphone, Copy, Check, ExternalLink, AlertCircle, CheckCircle, Info as InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils/cn";
import { useCart } from "@/features/cart/useCart";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import type { AddressData } from "@/components/checkout/AddressForm";

interface CashAppPaymentProps {
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  email: string;
  addressData: AddressData;
  onProcessing: (isProcessing: boolean) => void;
  onSuccess: () => void;
}

export function CashAppPayment({
  total,
  subtotal,
  tax,
  shipping,
  discount,
  email,
  addressData,
  onProcessing,
  onSuccess,
}: CashAppPaymentProps) {
  const { profile } = useAuth();
  const { clearCart, items, getItemPrice } = useCart();
  const [copied, setCopied] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationData, setVerificationData] = useState({
    cashapp_tag: "",
    cashapp_timestamp: "",
    cashapp_transaction_id: "",
  });
  const [isVerifying, setIsVerifying] = useState(false);

  const cashappHandle = process.env.NEXT_PUBLIC_CASHAPP_HANDLE || "$TrippyHippieSmoke";
  const cashappURL = `https://cash.app/${cashappHandle}/${Number(total).toFixed(2)}`;

  // Check if user is approved for Cash App payments
  if (!profile?.cashapp_approved) {
    return (
      <div className="space-y-6">
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-red-500/15 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <h3 className="text-2xl font-display font-bold text-brand-cream mb-2">
            Cash App Payments Disabled
          </h3>
          <p className="text-brand-cream/60">
            Cash App payments are currently disabled for your account. Please contact support for more information.
          </p>
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(cashappHandle);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Cash App handle copied!");
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    onProcessing(true);

    try {
      // Map cart items to order items format
      const orderItems = items.map((item) => ({
        product_id: item.productId,
        name: item.name,
        unit_price: Math.round(getItemPrice(item)),
        quantity: item.quantity,
      }));

      // Create order in database
      const orderRes = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: "cashapp",
          total,
          subtotal,
          tax,
          shipping,
          discount,
          email,
          full_name: addressData.full_name,
          line1: addressData.line1,
          line2: addressData.line2,
          city: addressData.city,
          state: addressData.state,
          zip: addressData.zip,
          phone: addressData.phone,
          items: orderItems,
          status: "pending",
        }),
      });

      if (!orderRes.ok) {
        throw new Error("Failed to create order");
      }

      const order = await orderRes.json();
      setOrderId(order.id);
      setShowVerification(true);
      toast.success("Order created! Please provide your Cash App details.");
    } catch (error) {
      toast.error("Failed to confirm payment. Please try again.");
      console.error(error);
      setIsConfirming(false);
      onProcessing(false);
    }
  };

  const handleVerificationSubmit = async () => {
    if (!verificationData.cashapp_tag.trim()) {
      toast.error("Please enter your Cash App tag");
      return;
    }
    if (!verificationData.cashapp_timestamp.trim()) {
      toast.error("Please enter the transaction timestamp");
      return;
    }
    if (!verificationData.cashapp_transaction_id.trim()) {
      toast.error("Please enter the transaction ID");
      return;
    }

    setIsVerifying(true);

    try {
      const res = await fetch("/api/orders/update-cashapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          cashapp_tag: verificationData.cashapp_tag,
          cashapp_timestamp: verificationData.cashapp_timestamp,
          cashapp_transaction_id: verificationData.cashapp_transaction_id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save verification details");
      }

      // Clear cart
      clearCart();

      toast.success("Payment verified! Redirecting to your orders...", {
        duration: 3000,
      });

      setTimeout(() => onSuccess(), 1500);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      toast.error(errorMsg);
      console.error("[CashApp Verification Error]", error);
    } finally {
      setIsVerifying(false);
    }
  };

  if (showVerification) {
    return (
      <div className="space-y-6">
        {/* Verification Header */}
        <div className="bg-gradient-to-b from-white/5 to-white/3 border border-white/10 rounded-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-brand-green/15 flex items-center justify-center">
              <Smartphone className="h-8 w-8 text-brand-green" />
            </div>
          </div>

          <h3 className="text-2xl font-display font-bold text-brand-cream text-center mb-2">
            Verify Your Payment
          </h3>
          <p className="text-brand-cream/60 text-center">
            Please provide your Cash App transaction details so we can verify your payment
          </p>
        </div>

        {/* Verification Form */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-cream mb-2">
              Your Cash App Tag
            </label>
            <input
              type="text"
              placeholder="e.g., $YourUsername"
              value={verificationData.cashapp_tag}
              onChange={(e) =>
                setVerificationData({
                  ...verificationData,
                  cashapp_tag: e.target.value,
                })
              }
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-brand-cream placeholder-brand-cream/40 focus:outline-none focus:border-brand-green/50 transition-colors"
            />
            <p className="text-xs text-brand-cream/50 mt-1">
              The tag you sent the payment from (the one that appears on the transaction as "from")
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-cream mb-2">
              Transaction Timestamp
            </label>
            <input
              type="text"
              placeholder="e.g., 2:45 PM or 14:45"
              value={verificationData.cashapp_timestamp}
              onChange={(e) =>
                setVerificationData({
                  ...verificationData,
                  cashapp_timestamp: e.target.value,
                })
              }
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-brand-cream placeholder-brand-cream/40 focus:outline-none focus:border-brand-green/50 transition-colors"
            />
            <p className="text-xs text-brand-cream/50 mt-1">
              The time shown on the transaction receipt in Cash App
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-cream mb-2">
              Transaction ID / Number
            </label>
            <input
              type="text"
              placeholder="e.g., TX1234567890"
              value={verificationData.cashapp_transaction_id}
              onChange={(e) =>
                setVerificationData({
                  ...verificationData,
                  cashapp_transaction_id: e.target.value,
                })
              }
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-brand-cream placeholder-brand-cream/40 focus:outline-none focus:border-brand-green/50 transition-colors"
            />
            <p className="text-xs text-brand-cream/50 mt-1">
              Found in the transaction details in your Cash App
            </p>
          </div>
        </div>

        {/* Help Text */}
        <div className="bg-brand-green/5 border border-brand-green/20 rounded-lg p-4">
          <p className="text-xs text-brand-cream/70 flex gap-2">
            <InfoIcon className="h-4 w-4 flex-shrink-0 text-brand-green mt-0.5" />
            <span>
              We use this information to verify your payment. You can find these details by opening Cash App and clicking on the transaction you just sent.
            </span>
          </p>
        </div>

        {/* Submit Button */}
        <Button
          className="w-full bg-brand-green hover:bg-brand-green/90 disabled:bg-white/10 disabled:text-brand-cream/30 text-brand-cream font-semibold py-4 rounded-lg transition-all flex items-center justify-center gap-2"
          onClick={handleVerificationSubmit}
          disabled={isVerifying}
        >
          {isVerifying ? (
            <>
              <Check className="h-5 w-5 animate-spin" />
              Verifying Details...
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5" />
              Complete Order
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Instructions Card */}
      <div className="bg-gradient-to-b from-white/5 to-white/3 border border-white/10 rounded-lg p-8">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-brand-green/15 flex items-center justify-center">
            <Smartphone className="h-8 w-8 text-brand-green" />
          </div>
        </div>
        
        <h3 className="text-2xl font-display font-bold text-brand-cream text-center mb-2">
          Send Payment via Cash App
        </h3>
        <p className="text-brand-cream/60 text-center mb-8">
          Quick and instant payment directly to your account
        </p>

        {/* Amount Display */}
        <div className="bg-brand-green/10 border border-brand-green/20 rounded-lg p-6 mb-8 text-center">
          <p className="text-sm text-brand-cream/60 mb-2">Amount to send</p>
          <p className="text-4xl font-display font-bold text-brand-green">
            {formatCurrency(total)}
          </p>
        </div>

        {/* Payment Recipient */}
        <div className="bg-white/5 rounded-lg p-4 mb-6 text-center border border-white/10">
          <p className="text-xs text-brand-cream/60 mb-1">Pay to</p>
          <p className="text-xl font-mono font-bold text-brand-cream">
            {cashappHandle}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <a href={cashappURL} target="_blank" rel="noopener noreferrer" className="block">
            <Button className="w-full bg-brand-green hover:bg-brand-green/90 text-brand-cream font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Open Cash App & Send Payment
            </Button>
          </a>

          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-brand-cream font-medium transition-all"
          >
            {copied ? (
              <>
                <Check className="h-5 w-5 text-brand-green" />
                Copied to Clipboard
              </>
            ) : (
              <>
                <Copy className="h-5 w-5" />
                Copy Cash App Handle
              </>
            )}
          </button>
        </div>
      </div>

      {/* Step by Step Instructions */}
      <div className="space-y-3">
        <h4 className="font-semibold text-brand-cream text-sm">How to complete your payment:</h4>
        <div className="space-y-3">
          <StepCard number={1} title="Open Cash App" description="Click the button above or open the app manually" />
          <StepCard number={2} title="Send to recipient" description={`Send ${formatCurrency(total)} to ${cashappHandle}`} />
          <StepCard number={3} title="Confirm payment" description="Click the confirm button once you've sent the payment" />
          <StepCard number={4} title="Verify details" description="Enter your transaction details for verification" />
        </div>
      </div>

      {/* Confirm Button */}
      <Button
        className="w-full bg-brand-green hover:bg-brand-green/90 disabled:bg-white/10 disabled:text-brand-cream/30 text-brand-cream font-semibold py-4 rounded-lg transition-all flex items-center justify-center gap-2"
        onClick={handleConfirm}
        disabled={isConfirming}
      >
        {isConfirming ? (
          <>
            <Check className="h-5 w-5 animate-spin" />
            Confirming Payment...
          </>
        ) : (
          <>
            <CheckCircle className="h-5 w-5" />
            Confirm Payment Complete
          </>
        )}
      </Button>

      {/* Trust Indicator */}
      <div className="flex items-center justify-center gap-2 pt-4 border-t border-white/10">
        <AlertCircle className="h-4 w-4 text-brand-green/60" />
        <p className="text-xs text-brand-cream/50">
          Your payment is secure and instantly verifiable
        </p>
      </div>
    </div>
  );
}

function StepCard({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex gap-4 p-3 rounded-lg bg-white/5 border border-white/10">
      <div className="h-8 w-8 rounded-full bg-brand-green/20 flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-bold text-brand-green">{number}</span>
      </div>
      <div className="min-w-0">
        <p className="font-medium text-brand-cream text-sm">{title}</p>
        <p className="text-xs text-brand-cream/60">{description}</p>
      </div>
    </div>
  );
}
