"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Leaf, ShoppingBag, User, LogIn, UserPlus, Building2, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

/* src/components/layout/MobileMenu.tsx */

interface MobileMenuProps {
  isOpen:  boolean;
  onClose: () => void;
}

const mainLinks = [
  { href: "/shop",           label: "Shop",       icon: ShoppingBag },
  { href: "/about",          label: "About" },
  { href: "/faq",            label: "FAQ" },
  { href: "/contact",        label: "Contact" },
  { href: "/coa",            label: "Lab Results" },
];

const businessLinks = [
  { href: "/apply-wholesale", label: "Wholesale Program", icon: Building2 },
  { href: "/apply-affiliate", label: "Affiliate Program",  icon: Star },
];

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const supabase = createClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  async function signOut() {
    await supabase.auth.signOut();
    onClose();
    window.location.href = "/";
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 w-[300px] z-50 bg-[#0D1F0D] border-r border-brand-green/10 flex flex-col",
          "transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-white/5">
          <Link href="/" onClick={onClose} className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-brand-green" />
            <span className="font-display font-bold text-brand-cream">Trippy Hippie</span>
          </Link>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-brand hover:bg-white/5 text-brand-cream-muted hover:text-brand-cream transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {mainLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-brand text-sm font-medium transition-all",
                pathname === href
                  ? "bg-brand-green/15 text-brand-green"
                  : "text-brand-cream-muted hover:text-brand-cream hover:bg-white/5"
              )}
            >
              {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
              {label}
            </Link>
          ))}

          <div className="pt-3 mt-3 border-t border-white/5">
            <p className="px-3 py-1 text-xs font-semibold text-brand-cream-dark uppercase tracking-wider">Business</p>
            {businessLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-brand text-sm font-medium transition-all",
                  pathname === href
                    ? "bg-brand-green/15 text-brand-green"
                    : "text-brand-cream-muted hover:text-brand-cream hover:bg-white/5"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </Link>
            ))}
          </div>

          {mounted && user && (
            <div className="pt-3 mt-3 border-t border-white/5">
              <p className="px-3 py-1 text-xs font-semibold text-brand-cream-dark uppercase tracking-wider">Account</p>
              {[
                { href: "/account",         label: "Dashboard" },
                { href: "/account/orders",  label: "My Orders" },
                { href: "/account/profile", label: "Profile Settings" },
              ].map(({ href, label }) => (
                <Link key={href} href={href} onClick={onClose} className="flex items-center gap-3 px-3 py-3 rounded-brand text-sm font-medium text-brand-cream-muted hover:text-brand-cream hover:bg-white/5 transition-all">
                  <User className="h-4 w-4 flex-shrink-0" /> {label}
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* Auth footer */}
        <div className="p-3 border-t border-white/5 space-y-2">
          {mounted && (user ? (
            <>
              <div className="px-3 py-2">
                <p className="text-xs font-semibold text-brand-cream truncate">{profile?.full_name}</p>
                <p className="text-[11px] text-brand-cream-dark truncate">{user.email}</p>
              </div>
              <button
                onClick={signOut}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-brand text-sm text-brand-cream-dark hover:text-red-400 hover:bg-red-500/5 transition-all"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link href="/login" onClick={onClose} className="flex items-center justify-center gap-1.5 h-10 px-3 rounded-brand border border-white/15 text-sm font-medium text-brand-cream-muted hover:text-brand-cream hover:border-white/25 transition-all">
                <LogIn className="h-3.5 w-3.5" /> Log In
              </Link>
              <Link href="/register" onClick={onClose} className="flex items-center justify-center gap-1.5 h-10 px-3 rounded-brand bg-brand-green text-white text-sm font-medium hover:bg-brand-green-light transition-all">
                <UserPlus className="h-3.5 w-3.5" /> Sign Up
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default MobileMenu;
