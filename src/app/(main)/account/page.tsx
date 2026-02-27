"use client";

import Link from "next/link";
import { ShoppingBag, Shield, Star, ArrowRight, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils/cn";

/*
  src/app/(main)/account/page.tsx — Account dashboard.
*/

export default function AccountDashboard() {
  const { user, profile } = useAuth();
  if (!user || !profile) return null;

  const statusVariant =
    profile.account_status === "approved"  ? "approved"  :
    profile.account_status === "rejected"  ? "rejected"  :
    profile.account_status === "suspended" ? "cancelled" : "pending";

  const cards = [
    {
      icon: ShoppingBag,
      label: "My Orders",
      desc: "View order history and track shipments",
      href: "/account/orders",
      color: "text-blue-400",
      bg:    "bg-blue-500/10",
    },
    {
      icon: Shield,
      label: "Verify ID",
      desc: profile.id_verified ? "Identity verified ✓" : "Upload your ID to unlock full access",
      href: "/account/verify-id",
      color: profile.id_verified ? "text-brand-green" : "text-amber-400",
      bg:    profile.id_verified ? "bg-brand-green/10" : "bg-amber-500/10",
    },
    {
      icon: Star,
      label: "Affiliate Program",
      desc: profile.is_affiliate ? `$${(profile.affiliate_earnings / 100).toFixed(2)} earned` : "Apply to earn 10% commission",
      href: "/account/affiliate",
      color: "text-amber-400",
      bg:    "bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-brand-cream mb-1">
          Welcome back, {profile.full_name?.split(" ")[0] ?? "there"} 👋
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-brand-cream-muted text-sm">{user.email}</span>
          <Badge variant={statusVariant}>
            {profile.account_status.charAt(0).toUpperCase() + profile.account_status.slice(1)}
          </Badge>
          {profile.is_wholesale_approved && <Badge variant="wholesale">Wholesale</Badge>}
          {profile.is_affiliate && <Badge variant="affiliate">Affiliate</Badge>}
          {profile.is_admin && <Badge variant="admin">Admin</Badge>}
        </div>
      </div>

      {/* Status banner */}
      {profile.account_status === "pending" && (
        <div className="flex items-start gap-3 p-4 rounded-brand bg-amber-500/10 border border-amber-500/20">
          <Clock className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-400 mb-0.5">Account Pending Review</p>
            <p className="text-sm text-brand-cream-muted">Your account is being reviewed. You&apos;ll receive an email once approved.</p>
          </div>
        </div>
      )}
      {profile.account_status === "approved" && !profile.id_verified && (
        <div className="flex items-start gap-3 p-4 rounded-brand bg-blue-500/10 border border-blue-500/20">
          <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-400 mb-0.5">ID Verification Required</p>
            <p className="text-sm text-brand-cream-muted">
              Verify your identity to unlock all features.{" "}
              <Link href="/account/verify-id" className="text-brand-green underline">Verify now →</Link>
            </p>
          </div>
        </div>
      )}

      {/* Quick action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map(({ icon: Icon, label, desc, href, color, bg }) => (
          <Link
            key={href}
            href={href}
            className="glass-card border border-white/5 hover:border-brand-green/20 p-5 rounded-card transition-all group"
          >
            <div className={`w-10 h-10 rounded-brand ${bg} flex items-center justify-center mb-4`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <h3 className="font-semibold text-brand-cream mb-1 group-hover:text-brand-green transition-colors">{label}</h3>
            <p className="text-xs text-brand-cream-dark leading-relaxed">{desc}</p>
          </Link>
        ))}
      </div>

      {/* Member since */}
      <p className="text-xs text-brand-cream-dark">
        Member since {formatDate(user.created_at)}
      </p>
    </div>
  );
}
