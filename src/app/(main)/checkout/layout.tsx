"use client";

import { ReactNode } from "react";

/**
 * Checkout Layout — Wraps the checkout flow
 * Currently minimal, but can be extended for:
 * - Persistent header/footer during payment
 * - Global error boundaries
 * - Progress indicators
 */

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0D1F0D]">
      {/* Minimal checkout header */}
      <div className="sticky top-0 z-30 border-b border-white/5 bg-[#0D1F0D]/95 backdrop-blur-sm py-4">
        <div className="container-brand flex items-center justify-between">
          <h1 className="font-display font-bold text-lg text-brand-cream">
            Trippy Hippie
          </h1>
          <p className="text-sm text-brand-cream-muted">Secure Payment</p>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0A160A] py-6 mt-12">
        <div className="container-brand text-center text-xs text-brand-cream-muted">
          <p>© 2026 Trippy Hippie Wholesale. All rights reserved.</p>
          <p className="mt-1">
            All transactions are encrypted and secure. Your payment information
            is handled by our trusted payment processors.
          </p>
        </div>
      </footer>
    </div>
  );
}
