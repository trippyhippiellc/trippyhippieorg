"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, Menu, ShoppingCart, User, ChevronDown, LayoutDashboard, ShoppingBag, Settings, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/features/cart/useCart";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

/*
  src/components/layout/Navbar.tsx
  Fixed top navbar. Includes:
  - Brand logo
  - Desktop nav links
  - Cart icon with live counter
  - User account dropdown
  - Mobile hamburger
*/

interface NavbarProps {
  onMobileMenuOpen: () => void;
}

const navLinks = [
  { href: "/shop",      label: "Shop" },
  { href: "/about",     label: "About" },

  { href: "/faq",       label: "FAQ" },
  { href: "/contact",   label: "Contact" },
  { href: "/coa",       label: "Lab Results" },
];

export function Navbar({ onMobileMenuOpen }: NavbarProps) {
  const pathname   = usePathname();
  const { user, profile } = useAuth();
  const { displayCount, toggleCart, itemCount } = useCart();
  const supabase   = createClient();

  const [scrolled,     setScrolled]     = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted,      setMounted]      = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => { setDropdownOpen(false); }, [pathname]);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
        scrolled
          ? "bg-[#0D1F0D]/95 backdrop-blur-md border-b border-brand-green/15 shadow-lg"
          : "bg-[#0D1F0D]/80 backdrop-blur-sm"
      )}
    >
      <div className="container-brand h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
          <Leaf className="h-6 w-6 text-brand-green group-hover:scale-110 transition-transform" />
          <span className="font-display font-bold text-lg text-brand-cream tracking-wide">
            Trippy Hippie
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-brand transition-all",
                pathname === href || pathname.startsWith(href + "/")
                  ? "text-brand-green bg-brand-green/10"
                  : "text-brand-cream-muted hover:text-brand-cream hover:bg-white/5"
              )}
            >
              {label}
            </Link>
          ))}
          {mounted && profile?.is_wholesale_approved && (
            <Link
              href="/account"
              className="ml-1 px-3 py-2 text-sm font-medium rounded-brand border border-violet-500/30 text-violet-300 hover:bg-violet-500/10 transition-all"
            >
              Wholesale
            </Link>
          )}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">

          {/* Cart button */}
          <button
            onClick={toggleCart}
            className="relative h-10 w-10 flex items-center justify-center rounded-brand hover:bg-white/5 transition-colors text-brand-cream-muted hover:text-brand-cream"
            aria-label="Open cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {mounted && itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-brand-green text-white text-[10px] font-bold animate-counter-bounce">
                {displayCount}
              </span>
            )}
          </button>

          {/* Account */}
          {mounted && (user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(o => !o)}
                className="hidden sm:flex items-center gap-1.5 h-10 px-3 rounded-brand hover:bg-white/5 transition-colors text-brand-cream-muted hover:text-brand-cream text-sm font-medium"
              >
                <User className="h-4 w-4" />
                <span className="max-w-[80px] truncate">{profile?.full_name?.split(" ")[0] ?? "Account"}</span>
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", dropdownOpen && "rotate-180")} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-[#1A2E1A] border border-brand-green/15 rounded-card shadow-xl z-50 py-1">
                  <div className="px-3 py-2 border-b border-white/5">
                    <p className="text-xs font-semibold text-brand-cream truncate">{profile?.full_name}</p>
                    <p className="text-[11px] text-brand-cream-dark truncate">{user.email}</p>
                  </div>
                  {[
                    { href: "/account",          label: "Dashboard",  icon: LayoutDashboard },
                    { href: "/account/orders",   label: "My Orders",  icon: ShoppingBag },
                    { href: "/account/profile",  label: "Settings",   icon: Settings },
                    ...(profile?.is_admin ? [{ href: "/admin", label: "Admin Panel", icon: Shield }] : []),
                  ].map(({ href, label, icon: Icon }) => (
                    <Link key={href} href={href} className="flex items-center gap-2.5 px-3 py-2 text-sm text-brand-cream-muted hover:text-brand-cream hover:bg-white/5 transition-colors">
                      <Icon className="h-3.5 w-3.5" /> {label}
                    </Link>
                  ))}
                  <div className="border-t border-white/5 mt-1">
                    <button onClick={signOut} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-brand-cream-dark hover:text-red-400 hover:bg-red-500/5 transition-colors">
                      <LogOut className="h-3.5 w-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login" className="h-9 px-4 flex items-center text-sm font-medium text-brand-cream-muted hover:text-brand-cream transition-colors">
                Log In
              </Link>
              <Link href="/register" className="h-9 px-4 flex items-center text-sm font-medium bg-brand-green text-white rounded-brand hover:bg-brand-green-light transition-colors">
                Sign Up
              </Link>
            </div>
          ))}

          {/* Mobile hamburger */}
          <button
            onClick={onMobileMenuOpen}
            className="lg:hidden h-10 w-10 flex items-center justify-center rounded-brand hover:bg-white/5 transition-colors text-brand-cream-muted hover:text-brand-cream"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
