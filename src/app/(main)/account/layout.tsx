"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User, ShoppingBag, Shield, Star, Settings, LogOut, Wallet } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

/*
  src/app/(main)/account/layout.tsx
*/

const baseNavLinks = [
  { href: "/account",           label: "Dashboard",  icon: User },
  { href: "/account/orders",    label: "My Orders",  icon: ShoppingBag },
  { href: "/account/profile",   label: "Profile",    icon: Settings },
  { href: "/account/verify-id", label: "Verify ID",  icon: Shield },
  { href: "/account/affiliate", label: "Affiliate",  icon: Star },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();   // ← isLoading (not loading)
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();
  const [isSmokeShopWholesale, setIsSmokeShopWholesale] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  // Check if user has smoke shop wholesale access
  useEffect(() => {
    if (!user) return;

    const checkSmokeShopWholesale = async () => {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("is_smokeshop_wholesale")
          .eq("id", user.id)
          .single();

        setIsSmokeShopWholesale(data?.is_smokeshop_wholesale === true);
      } catch (err) {
        console.error("Error checking smoke shop wholesale status:", err);
      }
    };

    checkSmokeShopWholesale();
  }, [user, supabase]);

  if (isLoading || !user) return null;

  // Build nav links with conditional smoke shop wholesale link
  const navLinks = [
    ...baseNavLinks,
    ...(isSmokeShopWholesale ? [
      { href: "/smoke-shop-wholesale", label: "Smoke Shop Wholesale", icon: Wallet }
    ] : [])
  ];

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="container-brand section-padding">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-56 flex-shrink-0">
          <nav className="glass-card border border-brand-green/10 p-2 space-y-0.5">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-brand text-sm font-medium transition-all",
                  pathname === href
                    ? "bg-brand-green/15 text-brand-green"
                    : "text-brand-cream-muted hover:text-brand-cream hover:bg-white/5"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </Link>
            ))}
            <div className="pt-2 mt-2 border-t border-white/5">
              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-brand text-sm font-medium text-brand-cream-dark hover:text-red-400 hover:bg-red-500/5 transition-all"
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                Sign Out
              </button>
            </div>
          </nav>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
