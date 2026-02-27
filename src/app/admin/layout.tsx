"use client";

export const dynamic = 'force-dynamic';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Shield, Package, ShoppingBag, Users, Building2, Star, BarChart2, Settings, FileText, Scale, FlaskConical } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils/cn";

const navLinks = [
  { href: "/admin",                        label: "Overview",       icon: BarChart2  },
  { href: "/admin/products",               label: "Products",       icon: Package    },
  { href: "/admin/orders",                 label: "Orders",         icon: ShoppingBag},
  { href: "/admin/users",                  label: "Users",          icon: Users      },
  { href: "/admin/wholesale-applications", label: "Wholesale Apps", icon: Building2  },
  { href: "/admin/affiliate-applications", label: "Affiliate Apps", icon: Star       },
  { href: "/admin/coa",                    label: "COA Requests",   icon: FlaskConical},
  
  { href: "/admin/laws",                   label: "State Laws",     icon: Scale      },
  { href: "/admin/settings",               label: "Settings",       icon: Settings   },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, isLoading } = useAuth();
  const pathname = usePathname();
  const router   = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!profile)                              { router.replace("/not-found"); return; }
    if (!profile.is_admin)                     { router.replace("/not-found"); return; }
    if (profile.account_status !== "approved") { router.replace("/not-found"); return; }
  }, [profile, isLoading, router]);

  if (isLoading || !profile?.is_admin) return null;

  return (
    <div className="flex min-h-screen bg-[#0A0F0A]">
      <aside className="w-56 flex-shrink-0 border-r border-white/5 bg-[#0D1F0D] flex flex-col">
        <div className="h-14 flex items-center px-4 border-b border-white/5">
          <Shield className="h-4 w-4 text-brand-green mr-2" />
          <span className="font-display font-bold text-brand-cream text-sm">Admin Panel</span>
        </div>
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-brand text-sm font-medium transition-all",
                pathname === href || (href !== "/admin" && pathname.startsWith(href))
                  ? "bg-brand-green/15 text-brand-green"
                  : "text-brand-cream-muted hover:text-brand-cream hover:bg-white/5"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/5">
          <Link href="/" className="text-xs text-brand-cream-dark hover:text-brand-cream transition-colors">
            ← Back to Site
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}