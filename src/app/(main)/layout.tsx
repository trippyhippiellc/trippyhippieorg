"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { CartWidget } from "@/components/cart/CartWidget";
import { AccessGate } from "@/components/modals/AccessGate";
import { CartProvider } from "@/features/cart/CartProvider";

/*
  (main)/layout.tsx — wraps every public-facing page.
  Provides: Navbar, Footer, CartWidget drawer, AgeGate, StateSelector.
  The pt-16 on main accounts for the fixed 64px navbar height.
*/

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <CartProvider>
        {/* Unified access gate: state selection + age verification */}
        <AccessGate />

        {/* Cart drawer — slides in from right */}
        <CartWidget />

        {/* Fixed top nav */}
        <Navbar onMobileMenuOpen={() => setMobileOpen(true)} />

        {/* Mobile slide-in menu */}
        <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        {/* Page content */}
        <main className="pt-16 min-h-screen">
          {children}
        </main>

        <Footer />
      </CartProvider>
  );
}
