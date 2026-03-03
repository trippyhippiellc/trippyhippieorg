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
  const [showSecurityModal, setShowSecurityModal] = useState(false);

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
                <button onClick={() => setShowSecurityModal(true)} className="text-sm text-brand-green hover:text-brand-green-light transition-colors font-medium flex items-center gap-1">
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

      {/* Security Modal */}
      <SecurityModal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
      />
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
// Security Information Modal Component
interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function SecurityModal({ isOpen, onClose }: SecurityModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-brand-dark via-brand-dark to-brand-dark/95 border border-brand-green/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-brand-green/20">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-brand-dark via-brand-dark to-brand-green/10 border-b border-brand-green/30 px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-brand-green/20 flex items-center justify-center">
              <svg className="h-6 w-6 text-brand-green" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414L10 3.586l4.707 4.707a1 1 0 01-1.414 1.414L11 6.414V15a1 1 0 11-2 0V6.414L6.707 9.707a1 1 0 01-1.414 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-brand-cream">Payment Security</h2>
          </div>
          <button
            onClick={onClose}
            className="text-brand-cream/60 hover:text-brand-cream transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Intro */}
          <div className="bg-brand-green/5 border border-brand-green/20 rounded-lg p-4">
            <p className="text-brand-cream/90 leading-relaxed">
              Every transaction at Trippy Hippie is fortified with military-grade encryption and multi-layered security protocols. Your payment information is treated with the utmost care and technical sophistication.
            </p>
          </div>

          {/* Security Pillars */}
          <div className="space-y-4">
            {/* End-to-End Encryption */}
            <div className="border border-brand-green/20 rounded-lg p-4 hover:border-brand-green/40 transition-all">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-brand-green/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-brand-green" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-brand-cream mb-1">End-to-End Encryption</h3>
                  <p className="text-sm text-brand-cream/70">All data transmitted between your device and our servers uses TLS 1.3 encryption—the same standard protecting financial institutions and government communications. Your payment credentials never exist in plaintext on our systems.</p>
                </div>
              </div>
            </div>

            {/* Tokenization & Isolation */}
            <div className="border border-brand-green/20 rounded-lg p-4 hover:border-brand-green/40 transition-all">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-brand-green/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-brand-green" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.5 1.5H5.75A2.75 2.75 0 003 4.25v11.5A2.75 2.75 0 005.75 18.5h8.5A2.75 2.75 0 0017 15.75V8" />
                    <path d="M17 4v4M17 4l-3-3m3 3l3-3" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-brand-cream mb-1">Payment Tokenization</h3>
                  <p className="text-sm text-brand-cream/70">Your payment method is tokenized—converted into a unique, single-use identifier—so sensitive details are never stored or transmitted unnecessarily. Even if one transaction is compromised, all others remain secure through unique cryptographic tokens.</p>
                </div>
              </div>
            </div>

            {/* Fraud Detection */}
            <div className="border border-brand-green/20 rounded-lg p-4 hover:border-brand-green/40 transition-all">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-brand-green/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-brand-green" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-brand-cream mb-1">Advanced Fraud Detection</h3>
                  <p className="text-sm text-brand-cream/70">Sophisticated AI-powered systems monitor every transaction for anomalies in real-time. Geolocation verification, device fingerprinting, and behavioral analysis work together to identify suspicious activity before it becomes a problem.</p>
                </div>
              </div>
            </div>

            {/* Compliance Standards */}
            <div className="border border-brand-green/20 rounded-lg p-4 hover:border-brand-green/40 transition-all">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-brand-green/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-brand-green" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 3.062v6.372a3.066 3.066 0 01-2.812 3.062p-3.976 0A3.066 3.066 0 0110 17.748zm7-1.171a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9 13a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-brand-cream mb-1">Industry Compliance</h3>
                  <p className="text-sm text-brand-cream/70">We maintain PCI DSS Level 1 compliance—the highest standard in payment card industry security. Our infrastructure is regularly audited by third-party security firms to ensure we exceed all regulatory requirements and best practices.</p>
                </div>
              </div>
            </div>

            {/* Secure API Architecture */}
            <div className="border border-brand-green/20 rounded-lg p-4 hover:border-brand-green/40 transition-all">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-brand-green/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-brand-green" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.5 1.5H2.75A1.75 1.75 0 001 3.25v13.5c0 .966.784 1.75 1.75 1.75h14.5A1.75 1.75 0 0019 16.75v-9" />
                    <path d="M14 11l-4-4-4 4m8 0v4" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-brand-cream mb-1">Zero-Knowledge Architecture</h3>
                  <p className="text-sm text-brand-cream/70">Our payment infrastructure uses zero-knowledge proofs where applicable, ensuring that sensitive transaction details are verified without being exposed or logged unnecessarily. We process only what's essential.</p>
                </div>
              </div>
            </div>

            {/* Continuous Monitoring */}
            <div className="border border-brand-green/20 rounded-lg p-4 hover:border-brand-green/40 transition-all">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-brand-green/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-brand-green" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-brand-cream mb-1">24/7 Security Monitoring</h3>
                  <p className="text-sm text-brand-cream/70">Our systems are monitored continuously for intrusion attempts, unusual patterns, and security vulnerabilities. Automated alerts and human security experts work around the clock to protect every transaction.</p>
                </div>
              </div>
            </div>

            {/* Dispute Resolution */}
            <div className="border border-brand-green/20 rounded-lg p-4 hover:border-brand-green/40 transition-all">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-brand-green/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-brand-green" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0zM8 9a1 1 0 100-2 1 1 0 000 2zm1 4a1 1 0 11-2 0 1 1 0 012 0zm5-4a1 1 0 100-2 1 1 0 000 2zm0 4a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-brand-cream mb-1">Buyer Protection & Disputes</h3>
                  <p className="text-sm text-brand-cream/70">If anything goes wrong, our support team works immediately to resolve disputes. We maintain detailed, cryptographically-signed transaction logs and offer rapid refund processing for legitimate concerns.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Statement */}
          <div className="bg-brand-green/10 border border-brand-green/30 rounded-lg p-4">
            <p className="text-brand-cream/90 text-sm leading-relaxed">
              <span className="font-semibold">Your confidence matters.</span> We've invested in the most rigorous security infrastructure available because we respect your trust. Every transaction is treated as if it were our own, with the same technical excellence and protective measures.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-brand-green/30 px-6 py-4 bg-brand-dark/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-brand-green/40 text-brand-cream hover:border-brand-green/60 hover:bg-brand-green/5 transition-all font-medium"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}