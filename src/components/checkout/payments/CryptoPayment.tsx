"use client";

import { Bitcoin, Clock, Bell } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils/cn";
import type { AddressData } from "@/components/checkout/AddressForm";

interface CryptoPaymentProps {
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

export function CryptoPayment({
  total,
  subtotal,
  tax,
  shipping,
  discount,
  email,
  addressData,
  onProcessing,
  onSuccess,
}: CryptoPaymentProps) {
  return (
    <div className="space-y-6">
      {/* Coming Soon Banner */}
      <div className="bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-amber-600/10 border border-amber-500/20 rounded-lg p-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center mx-auto mb-6">
            <Bitcoin className="h-10 w-10 text-amber-300" />
          </div>
          
          <h3 className="text-3xl font-display font-bold text-brand-cream mb-3">
            Cryptocurrency Payments
          </h3>
          
          <p className="text-brand-cream/70 mb-2 max-w-md mx-auto">
            Bitcoin, Ethereum, and other cryptocurrencies coming soon
          </p>

          <div className="flex items-center justify-center gap-2 text-amber-300 text-sm font-semibold mb-8 bg-amber-500/10 w-fit px-4 py-2 rounded-lg mx-auto border border-amber-500/20">
            <Clock className="h-4 w-4" />
            Launching Q1 2026
          </div>

          <p className="text-sm text-brand-cream/60 mb-8">
            Choose another payment method or get notified when crypto payments launch
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              className="w-full sm:w-auto bg-brand-green hover:bg-brand-green/90 text-brand-cream font-semibold py-3 px-6 rounded-lg transition-all"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Choose Different Payment Method
            </Button>
            
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-brand-cream font-medium transition-all">
              <Bell className="h-4 w-4" />
              Notify Me When Ready
            </button>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h4 className="font-semibold text-brand-cream mb-4">Why Cryptocurrency?</h4>
        <ul className="space-y-2 text-sm text-brand-cream/70">
          <li className="flex items-start gap-3">
            <span className="text-amber-400 font-bold mt-0.5">✓</span>
            <span>Fast global transactions without intermediaries</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-400 font-bold mt-0.5">✓</span>
            <span>Lower transaction fees</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-400 font-bold mt-0.5">✓</span>
            <span>Secure and immutable blockchain verification</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-400 font-bold mt-0.5">✓</span>
            <span>Support for major cryptocurrencies</span>
          </li>
        </ul>
      </div>

      {/* Supported Cryptocurrencies */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h4 className="font-semibold text-brand-cream mb-4">Supported Cryptocurrencies</h4>
        <ul className="space-y-2 text-sm text-brand-cream/70">
          <li className="flex items-start gap-3">
            <span className="text-amber-400 font-bold mt-0.5">•</span>
            <span>Bitcoin (BTC)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-400 font-bold mt-0.5">•</span>
            <span>Ethereum (ETH)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-400 font-bold mt-0.5">•</span>
            <span>Other popular cryptocurrencies</span>
          </li>
        </ul>
      </div>

      {/* Stay Updated */}
      <div className="bg-brand-green/5 border border-brand-green/20 rounded-lg p-6 text-center">
        <p className="text-sm text-brand-cream/70 mb-4">
          Subscribe to be notified when cryptocurrency payments launch
        </p>
        <Button className="bg-brand-green hover:bg-brand-green/90 text-brand-cream font-semibold py-2 px-6 rounded-lg transition-all inline-block">
          Get Notified
        </Button>
      </div>
    </div>
  );
}
