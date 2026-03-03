"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CreditCard,
  Bitcoin,
  Building2,
  Smartphone,
  AlertCircle,
  ShoppingBag,
  Lock,
  CheckCircle,
  ChevronRight,
  X,
} from "lucide-react";
import { useCart } from "@/features/cart/useCart";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils/cn";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { CashAppPayment } from "@/components/checkout/payments/CashAppPayment";
import { StripePayment } from "@/components/checkout/payments/StripePayment";
import { CryptoPayment } from "@/components/checkout/payments/CryptoPayment";
import { WirePayment } from "@/components/checkout/payments/WirePayment";
import { AddressForm, type AddressData } from "@/components/checkout/AddressForm";
import toast from "react-hot-toast";

type PaymentMethod = "cashapp" | "stripe" | "crypto" | "wire" | null;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, hasItems } = useCart();
  const { user, profile, isLoading: authLoading } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Address form state
  const [address, setAddress] = useState<AddressData>({
    full_name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  });

  // Pre-populate full name from email if available
  useEffect(() => {
    if (user?.email && !address.full_name) {
      const name = user.email.split("@")[0];
      setAddress(prev => ({ ...prev, full_name: name }));
    }
  }, [user?.email]);

  // Calculate order totals
  const subtotal = items.reduce(
    (sum, item) => sum + item.priceRetail * item.quantity,
    0
  );
  const tax = Math.round(subtotal * 0.07); // 7% tax
  const shipping = 0; // Update if you implement shipping
  const discount = 0; // Update if you implement discount codes
  const total = subtotal + tax + shipping - discount;

  // Validate address is complete
  const isAddressComplete = () => {
    return (
      address.full_name.trim() !== "" &&
      address.line1.trim() !== "" &&
      address.city.trim() !== "" &&
      address.state.trim() !== "" &&
      address.zip.trim() !== "" &&
      address.phone.trim() !== ""
    );
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    if (!isAddressComplete()) {
      toast.error("Please complete your shipping address before selecting a payment method");
      return;
    }
    setSelectedMethod(method);
    setShowPaymentModal(true);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/checkout");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="container-brand section-padding min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-12 w-12 text-brand-green mx-auto mb-4 animate-bounce" />
          <p className="text-brand-cream-muted">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!hasItems) {
    return (
      <div className="container-brand section-padding min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <ShoppingBag className="h-12 w-12 text-brand-green/50 mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold text-brand-cream mb-2">
            Your cart is empty
          </h2>
          <p className="text-brand-cream-muted mb-8">
            Add some premium hemp products before checking out.
          </p>
          <Link href="/shop">
            <Button variant="primary" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-brand section-padding min-h-screen pb-20">
      {/* Premium Header */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6 text-sm">
          <ShoppingBag className="h-4 w-4 text-brand-green" />
          <span className="text-brand-cream-muted">Back to</span>
          <Link href="/shop" className="text-brand-green hover:text-brand-green-light transition-colors">
            Shopping
          </Link>
        </div>
        <div>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-brand-cream mb-3">
            Complete Your Order
          </h1>
          <p className="text-lg text-brand-cream/60">
            Fast, secure payment. Your order will be confirmed immediately.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Checkout */}
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Address Section */}
          <div>
            <h2 className="text-2xl font-display font-bold text-brand-cream mb-6">
              Shipping Address
            </h2>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <AddressForm value={address} onChange={setAddress} />
            </div>
          </div>

          {/* Payment Method Cards */}
          <div>
            <h2 className="text-2xl font-display font-bold text-brand-cream mb-6">
              Choose Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cash App */}
              <PaymentMethodCard
                icon={Smartphone}
                title="Cash App"
                description="Send directly from your phone"
                isSelected={selectedMethod === "cashapp"}
                onClick={() => handlePaymentMethodSelect("cashapp")}
                badge={profile?.cashapp_approved ? "Instant" : undefined}
                disabled={!profile?.cashapp_approved}
                disabledMessage={profile?.cashapp_approved ? undefined : "Cash App Payments are currently Disabled"}
              />

              {/* Card Payment */}
              <PaymentMethodCard
                icon={CreditCard}
                title="Card Payment"
                description="Visa, Mastercard, Amex"
                isSelected={selectedMethod === "stripe"}
                onClick={() => handlePaymentMethodSelect("stripe")}
                badge="Secure"
              />

              {/* Crypto */}
              <PaymentMethodCard
                icon={Bitcoin}
                title="Cryptocurrency"
                description="Bitcoin & Ethereum"
                isSelected={selectedMethod === "crypto"}
                onClick={() => handlePaymentMethodSelect("crypto")}
                comingSoon
              />

              {/* Wire */}
              <PaymentMethodCard
                icon={Building2}
                title="Wire Transfer"
                description="Direct bank transfer"
                isSelected={selectedMethod === "wire"}
                onClick={() => handlePaymentMethodSelect("wire")}
              />
            </div>
          </div>

          {/* Trust & Security Section */}
          <div className="bg-gradient-to-r from-brand-green/10 to-brand-green/5 border border-brand-green/20 rounded-lg p-6">
            <div className="flex gap-4">
              <Lock className="h-5 w-5 text-brand-green flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-brand-cream mb-2">
                  Your payment is protected
                </h3>
                <p className="text-sm text-brand-cream/70 mb-3">
                  All transactions use industry-standard encryption (SSL/TLS). Payment details are processed securely and never stored on public servers.
                </p>
                <button className="text-sm text-brand-green hover:text-brand-green-light transition-colors font-medium flex items-center gap-1">
                  Learn about our security
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-8">
          <OrderSummary items={items} total={total} tax={tax} shipping={shipping} />
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedMethod && (
        <PaymentModal
          method={selectedMethod}
          total={total}
          subtotal={subtotal}
          tax={tax}
          shipping={shipping}
          discount={discount}
          addressData={address}
          email={user.email || ""}
          onClose={() => setShowPaymentModal(false)}
          onProcessing={setIsProcessing}
          isProcessing={isProcessing}
          onSuccess={() => {
            router.push("/account/orders");
          }}
        />
      )}
    </div>
  );
}

// Payment Method Card Component
interface PaymentMethodCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
  badge?: string;
  comingSoon?: boolean;
  disabled?: boolean;
  disabledMessage?: string;
}

function PaymentMethodCard({
  icon: Icon,
  title,
  description,
  isSelected,
  onClick,
  badge,
  comingSoon,
  disabled,
  disabledMessage,
}: PaymentMethodCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={comingSoon || disabled}
      className={`relative p-6 rounded-lg border-2 transition-all text-left ${
        isSelected
          ? "border-brand-green bg-brand-green/15 shadow-lg shadow-brand-green/20"
          : "border-white/10 bg-white/5 hover:border-brand-green/40 hover:bg-brand-green/8 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-white/10 disabled:hover:bg-white/5"
      }`}
    >
      {isSelected && (
        <div className="absolute top-3 right-3">
          <CheckCircle className="h-5 w-5 text-brand-green" />
        </div>
      )}
      
      <Icon className={`h-8 w-8 mb-3 transition-colors ${
        isSelected ? "text-brand-green" : "text-white/60"
      }`} />
      
      <h3 className="font-semibold text-brand-cream mb-1">{title}</h3>
      <p className="text-xs text-brand-cream/50">{description}</p>
      
      {badge && (
        <div className="mt-3 inline-block text-xs font-semibold px-2 py-1 rounded bg-brand-green/20 text-brand-green">
          {badge}
        </div>
      )}
      
      {disabledMessage && (
        <div className="mt-3 text-xs font-semibold text-brand-cream/40">
          {disabledMessage}
        </div>
      )}
      
      {comingSoon && !disabledMessage && (
        <div className="mt-3 text-xs font-semibold text-brand-cream/40">
          Coming Soon
        </div>
      )}
    </button>
  );
}

// Payment Modal Component
interface PaymentModalProps {
  method: PaymentMethod;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  addressData: AddressData;
  email: string;
  onClose: () => void;
  onProcessing: (processing: boolean) => void;
  isProcessing: boolean;
  onSuccess: () => void;
}

function PaymentModal({
  method,
  total,
  subtotal,
  tax,
  shipping,
  discount,
  addressData,
  email,
  onClose,
  onProcessing,
  isProcessing,
  onSuccess,
}: PaymentModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-b from-slate-900 to-slate-900/95 border-b border-white/10 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold text-brand-cream">
            {method === "cashapp" && "Send via Cash App"}
            {method === "stripe" && "Enter Card Details"}
            {method === "crypto" && "Cryptocurrency Payment"}
            {method === "wire" && "Wire Transfer Details"}
          </h2>
          <button
            onClick={onClose}
            className="text-brand-cream/50 hover:text-brand-cream transition-colors p-2"
            disabled={isProcessing}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Amount Display */}
          <div className="bg-brand-green/10 border border-brand-green/20 rounded-lg p-4">
            <p className="text-sm text-brand-cream/60 mb-1">Amount to pay</p>
            <p className="text-3xl font-display font-bold text-brand-cream">
              {formatCurrency(total)}
            </p>
          </div>

          {/* Payment Method Handler */}
          {method === "cashapp" && (
            <CashAppPayment
              total={total}
              subtotal={subtotal}
              tax={tax}
              shipping={shipping}
              discount={discount}
              email={email}
              addressData={addressData}
              onProcessing={onProcessing}
              onSuccess={onSuccess}
            />
          )}
          {method === "stripe" && (
            <StripePayment
              total={total}
              subtotal={subtotal}
              tax={tax}
              shipping={shipping}
              discount={discount}
              email={email}
              addressData={addressData}
              onProcessing={onProcessing}
              onSuccess={onSuccess}
            />
          )}
          {method === "crypto" && (
            <CryptoPayment
              total={total}
              subtotal={subtotal}
              tax={tax}
              shipping={shipping}
              discount={discount}
              email={email}
              addressData={addressData}
              onProcessing={onProcessing}
              onSuccess={onSuccess}
            />
          )}
          {method === "wire" && (
            <WirePayment
              total={total}
              subtotal={subtotal}
              tax={tax}
              shipping={shipping}
              discount={discount}
              email={email}
              addressData={addressData}
              onProcessing={onProcessing}
              onSuccess={onSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
}
