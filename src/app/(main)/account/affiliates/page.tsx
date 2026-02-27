"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Copy, CheckCircle, DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/utils/cn";

/* src/app/(main)/account/affiliate/page.tsx */

interface AffiliateStats {
  total_referrals: number;
  total_orders:    number;
  total_earned:    number;
  pending_payout:  number;
}

export default function AffiliatePage() {
  const { user, profile } = useAuth();
  const supabase = createClient();

  const [stats,   setStats]   = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied,  setCopied]  = useState(false);

  useEffect(() => {
    if (!user || !profile?.is_affiliate) { setLoading(false); return; }
    /* TODO: fetch real affiliate stats from affiliate_earnings or orders table */
    setTimeout(() => {
      setStats({
        total_referrals: 0,
        total_orders:    0,
        total_earned:    profile.affiliate_earnings ?? 0,
        pending_payout:  profile.affiliate_earnings ?? 0,
      });
      setLoading(false);
    }, 500);
  }, [user, profile]);

  function copyCode() {
    if (!profile?.affiliate_code) return;
    navigator.clipboard.writeText(profile.affiliate_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  /* Not an affiliate yet */
  if (!profile?.is_affiliate) {
    return (
      <div className="max-w-lg space-y-6">
        <h1 className="text-2xl font-display font-bold text-brand-cream">Affiliate Program</h1>
        <div className="glass-card border border-amber-500/15 p-8 rounded-card text-center">
          <Star className="h-12 w-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-brand-cream mb-2">Earn 10% Commission</h2>
          <p className="text-brand-cream-muted mb-6">
            Apply to our affiliate program and get a unique code your followers can use.
            You earn 10% on every order placed with your code. No cap.
          </p>
          <Link href="/apply-affiliate">
            <Button variant="primary" size="lg" className="w-full">Apply for Affiliate Access</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-brand-cream mb-1">Affiliate Dashboard</h1>
        <p className="text-brand-cream-muted text-sm">Share your code and earn 10% on every referred order.</p>
      </div>

      {/* Referral code */}
      <div className="glass-card border border-amber-500/15 p-6 rounded-card">
        <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wide mb-3">Your Referral Code</h2>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-[#162816] border border-white/10 rounded-brand px-4 py-3">
            <p className="font-mono font-bold text-brand-green text-2xl tracking-widest">
              {profile.affiliate_code ?? "—"}
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={copyCode}
            leftIcon={copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          >
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
        <p className="text-xs text-brand-cream-dark mt-2">
          Customers use this code at checkout. You earn 10% of each qualifying order.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-card" />)
        ) : stats ? (
          [
            { label: "Total Earned",     value: formatCurrency(stats.total_earned),   icon: DollarSign, color: "text-brand-green" },
            { label: "Pending Payout",   value: formatCurrency(stats.pending_payout), icon: TrendingUp, color: "text-amber-400" },
            { label: "Orders Referred",  value: stats.total_orders.toString(),         icon: ShoppingBag, color: "text-blue-400" },
            { label: "Code Uses",        value: stats.total_referrals.toString(),       icon: Star, color: "text-violet-400" },
          ].map(s => (
            <div key={s.label} className="glass-card border border-white/5 p-4 rounded-card">
              <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
              <p className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</p>
              <p className="text-xs text-brand-cream-dark mt-0.5">{s.label}</p>
            </div>
          ))
        ) : null}
      </div>

      {/* Payout info */}
      <div className="glass-card border border-white/5 p-5 rounded-card">
        <h2 className="text-sm font-semibold text-brand-cream mb-2">Payout Policy</h2>
        <ul className="text-sm text-brand-cream-muted space-y-1">
          <li>• Payouts are processed on the 1st of each month</li>
          <li>• Minimum balance of $50.00 required to receive payout</li>
          <li>• Payment via CashApp or bank transfer</li>
          <li>• Email support@trippyhippie.org to request your payout</li>
        </ul>
      </div>
    </div>
  );
}
