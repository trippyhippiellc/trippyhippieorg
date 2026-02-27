"use client";

import { useState } from "react";
import { Building2, Mail, Check, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils/cn";
import { useCart } from "@/features/cart/useCart";
import toast from "react-hot-toast";
import type { AddressData } from "@/components/checkout/AddressForm";

interface WirePaymentProps {
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

export function WirePayment({
  total,
  subtotal,
  tax,
  shipping,
  discount,
  email,
  addressData,
  onProcessing,
  onSuccess,
}: WirePaymentProps) {
  const { items, getItemPrice, clearCart } = useCart();
  const [isConfirming, setIsConfirming] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const bankName = process.env.WIRE_BANK_NAME || "[Bank Name]";
  const accountName = process.env.WIRE_ACCOUNT_NAME || "[Account Name]";
  const accountNumber = process.env.WIRE_ACCOUNT_NUMBER || "[Account Number]";
  const routingNumber = process.env.WIRE_ROUTING_NUMBER || "[Routing Number]";

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSendEmail = async () => {
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

      console.log("[Wire Payment] Creating order with total:", total);
      
      // Create order with wire payment status
      const orderRes = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: "wire",
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

      console.log("[Wire Payment] Order response status:", orderRes.status);

      if (!orderRes.ok) {
        const errData = await orderRes.json().catch(() => ({}));
        throw new Error(errData.error || `Order creation failed (${orderRes.status})`);
      }

      const order = await orderRes.json();
      console.log("[Wire Payment] Order created:", order.id);

      // Send wire payment instructions email
      console.log("[Wire Payment] Sending email with orderId:", order.id);
      const emailRes = await fetch("/api/emails/send-wire-instructions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          amount: total,
        }),
      });

      console.log("[Wire Payment] Email response status:", emailRes.status);

      if (!emailRes.ok) {
        console.warn("[Wire Payment] Email sending had an issue, but order was created");
      }

      setEmailSent(true);
      toast.success(
        "Order created! Wire instructions sent to your email.",
        { duration: 4000 }
      );

      // Clear cart after successful order
      clearCart();

      setTimeout(() => onSuccess(), 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to process wire payment. Please try again.";
      console.error("[Wire Payment] Error:", message, error);
      toast.error(message);
    } finally {
      setIsConfirming(false);
      onProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-b from-white/5 to-white/3 border border-white/10 rounded-lg p-8">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-brand-green/15 flex items-center justify-center">
            <Building2 className="h-8 w-8 text-brand-green" />
          </div>
        </div>
        
        <h3 className="text-2xl font-display font-bold text-brand-cream text-center mb-2">
          Bank Wire Transfer
        </h3>
        <p className="text-brand-cream/60 text-center mb-6">
          Direct bank transfer with dedicated agent support
        </p>

        {/* Amount Display */}
        <div className="bg-brand-green/10 border border-brand-green/20 rounded-lg p-6 text-center">
          <p className="text-sm text-brand-cream/60 mb-2">Amount due</p>
          <p className="text-4xl font-display font-bold text-brand-green">
            {formatCurrency(total)}
          </p>
        </div>
      </div>

      {/* Process Steps */}
      <div className="space-y-3">
        <h4 className="font-semibold text-brand-cream text-sm">Complete Your Purchase:</h4>
        <div className="space-y-3">
          <ProcessStep 
            number={1} 
            title="Request Instructions" 
            description="Click the button below to generate your order and receive banking details"
          />
          <ProcessStep 
            number={2} 
            title="Receive Banking Details" 
            description="Complete wiring information will be sent to your email immediately"
          />
          <ProcessStep 
            number={3} 
            title="Agent Coordination" 
            description="A dedicated team member will reach out within 24 hours to assist"
          />
          <ProcessStep 
            number={4} 
            title="Wire Confirmation" 
            description="Once received and verified, your order begins processing"
          />
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-brand-green/10 border border-brand-green/20 rounded-lg p-4 flex gap-3">
        <AlertCircle className="h-5 w-5 text-brand-green flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-brand-cream mb-1">Processing Time</p>
          <p className="text-brand-cream/70">Wire transfers typically complete in 1-3 business days. Expedited options may be available.</p>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        className="w-full bg-brand-green hover:bg-brand-green/90 disabled:bg-white/10 disabled:text-brand-cream/30 text-brand-cream font-semibold py-4 rounded-lg transition-all flex items-center justify-center gap-2"
        onClick={handleSendEmail}
        disabled={isConfirming || emailSent}
      >
        {emailSent ? (
          <>
            <CheckCircle className="h-5 w-5" />
            Banking Details Sent
          </>
        ) : isConfirming ? (
          <>
            <Check className="h-5 w-5 animate-spin" />
            Generating Instructions...
          </>
        ) : (
          <>
            <Mail className="h-5 w-5" />
            Send Wire Instructions to Email
          </>
        )}
      </Button>

      {/* Success State */}
      {emailSent && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 text-center">
          <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-3" />
          <p className="font-semibold text-brand-cream mb-1">Order Created Successfully!</p>
          <p className="text-sm text-brand-cream/70 mb-4">
            Banking details and wire instructions have been sent to your email. A dedicated agent will contact you within 24 hours.
          </p>
          <p className="text-xs text-brand-cream/50">
            Watch your email for additional details and coordination
          </p>
        </div>
      )}
    </div>
  );
}

function ProcessStep({ number, title, description }: { number: number; title: string; description: string }) {
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
