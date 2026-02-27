"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdminOrders } from "@/hooks/useAdmin";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency, formatDate } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/useToast";
import { ChevronRight } from "lucide-react";

/* src/app/admin/orders/page.tsx */

const STATUSES = ["all","pending","awaiting_payment","processing","shipped","completed","cancelled","refunded"];

const statusVariant = (s: string) =>
  s === "completed"         ? "completed" :
  s === "shipped"           ? "shipped" :
  s === "processing"        ? "processing" :
  s === "cancelled"         ? "cancelled" :
  s === "refunded"          ? "rejected" : "pending";

export default function AdminOrdersPage() {
  const [filter, setFilter] = useState("all");
  const { orders, loading, refetch } = useAdminOrders(filter === "all" ? undefined : filter);
  const supabase = createClient();
  const toast    = useToast();

  async function updateStatus(orderId: string, status: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("orders") as any).update({ status }).eq("id", orderId);
    if (error) toast.error(error.message);
    else { toast.success("Order updated"); refetch(); }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-brand-cream">Orders</h1>

      <div className="flex gap-2 flex-wrap">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${filter === s ? "bg-brand-green text-white" : "bg-white/5 text-brand-cream-muted hover:bg-white/10"}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({length:5}).map((_,i) => <Skeleton key={i} className="h-20 rounded-card" />)}</div>
      ) : (
        <div className="space-y-3">
          {(orders as Record<string,unknown>[]).map(order => (
            <Link key={order.id as string} href={`/admin/orders/${order.id}`}>
              <div className="glass-card border border-white/5 p-4 rounded-card hover:border-brand-green/30 hover:bg-white/8 transition-all cursor-pointer group">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold text-brand-cream">{order.order_number as string}</span>
                      <Badge variant={statusVariant(order.status as string) as "completed"|"shipped"|"processing"|"cancelled"|"rejected"|"pending"}>{order.status as string}</Badge>
                    </div>
                    <p className="text-xs text-brand-cream-dark">{formatDate(order.created_at as string)} · {(order.payment_method as string)}</p>
                    <p className="text-xs text-brand-cream-dark mt-0.5">
                      {(order.full_name as string) || "Guest"}
                    </p>
                    <p className="text-xs text-brand-cream-dark">
                      {(order.email as string)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="font-bold text-brand-green">{formatCurrency(order.total as number)}</p>
                    <ChevronRight className="h-5 w-5 text-brand-cream-muted group-hover:text-brand-green transition-colors" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
