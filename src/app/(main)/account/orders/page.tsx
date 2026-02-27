"use client";

import Link from "next/link";
import { useOrders } from "@/hooks/useOrders";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency, formatDate } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/Badge";
import { ArrowRight, Package } from "lucide-react";

/**
 * src/app/(main)/account/orders/page.tsx
 * Orders index for the logged-in user. Shows skeleton while loading,
 * a friendly empty state, and a list of recent orders linking to details.
 */

export default function OrdersPage() {
  const { orders, loading, error, refetch } = useOrders({ limit: 50 });

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Skeleton className="h-6 w-40 rounded-brand" />
        <div className="space-y-3">
          <Skeleton className="h-16 rounded-card" />
          <Skeleton className="h-16 rounded-card" />
          <Skeleton className="h-16 rounded-card" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-brand-cream-muted mb-4">Failed to load orders. Try again.</p>
        <button onClick={() => refetch()} className="text-brand-green underline">Retry</button>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto mb-4 h-8 w-8 text-brand-cream-muted" />
        <h3 className="text-xl font-semibold text-brand-cream mb-2">You currently have no orders.</h3>
        <p className="text-brand-cream-muted mb-6">Browse our catalog and place your first order.</p>
        <Link href="/shop" className="inline-flex items-center gap-2 h-12 px-6 rounded-brand bg-brand-green text-white font-semibold">
          Shop Products <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-semibold text-brand-cream">Recent Orders</h2>
      <div className="space-y-3">
        {orders.map((o) => (
          <Link key={o.id} href={`/account/orders/${o.id}`} className="glass-card p-4 flex items-center justify-between border border-white/5 rounded-card hover:border-brand-green/20">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-brand-cream">{o.order_number}</span>
                <Badge variant={o.status as any}>{o.status}</Badge>
              </div>
              <p className="text-sm text-brand-cream-muted">{formatDate(o.created_at)}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-brand-cream">{formatCurrency(o.total)}</p>
              <p className="text-xs text-brand-cream-muted">
                {Array.isArray(o.items) ? o.items.length : 0} items
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
