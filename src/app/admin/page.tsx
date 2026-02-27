"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag, Users, Package, DollarSign, Clock,
  Building2, Star, TrendingUp, AlertCircle, CheckCircle2,
  ArrowRight, RefreshCw, ExternalLink,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

function fmt(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}
function fmtDate(iso: string): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
}

interface Stats {
  totalOrders:       number;
  pendingOrders:     number;
  awaitingPayment:   number;
  processingOrders:  number;
  shippedOrders:     number;
  completedOrders:   number;
  cancelledOrders:   number;
  totalRevenue:      number;
  revenueThisMonth:  number;
  totalUsers:        number;
  pendingUsers:      number;
  approvedUsers:     number;
  totalProducts:     number;
  activeProducts:    number;
  outOfStock:        number;
  pendingWholesale:  number;
  approvedWholesale: number;
  pendingAffiliate:  number;
  approvedAffiliate: number;
}

interface RecentOrder {
  id:             string;
  order_number:   string;
  status:         string;
  total:          number;
  payment_method: string;
  created_at:     string;
  profiles:       { full_name: string; email: string } | null;
}

type StatusVariant = "completed" | "shipped" | "processing" | "cancelled" | "rejected" | "pending";
function statusBadge(s: string): StatusVariant {
  if (s === "completed")                     return "completed";
  if (s === "shipped")                       return "shipped";
  if (s === "processing")                    return "processing";
  if (s === "cancelled" || s === "refunded") return "cancelled";
  if (s === "rejected")                      return "rejected";
  return "pending";
}

export default function AdminDashboard() {
  const { profile, isLoading } = useAuth();
  const router   = useRouter();
  const supabase = createClient();

  const [stats,         setStats]         = useState<Stats | null>(null);
  const [recentOrders,  setRecentOrders]  = useState<RecentOrder[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!profile?.is_admin) router.replace("/not-found");
  }, [isLoading, profile, router]);

  const loadData = useCallback(async () => {
    if (!profile?.is_admin) return;
    setRefreshing(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    const [ordersRes, usersRes, productsRes, wholesaleRes, affiliateRes, recentRes] = await Promise.all([
      db.from("orders").select("id, total, status, created_at"),
      db.from("profiles").select("account_status"),
      db.from("products").select("id, is_active, stock_quantity"),
      db.from("wholesale_applications").select("status"),
      db.from("affiliate_applications").select("status"),
      db.from("orders")
        .select("id, order_number, status, total, payment_method, created_at, profiles(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);
    const orders    = (ordersRes.data    ?? []) as { id:string; total:number; status:string; created_at:string }[];
    const users     = (usersRes.data     ?? []) as { account_status:string }[];
    const products  = (productsRes.data  ?? []) as { id:string; is_active:boolean; stock_quantity:number }[];
    const wholesale = (wholesaleRes.data ?? []) as { status:string }[];
    const affiliate = (affiliateRes.data ?? []) as { status:string }[];
    const now       = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    setStats({
      totalOrders:       orders.length,
      pendingOrders:     orders.filter(o => o.status === "pending").length,
      awaitingPayment:   orders.filter(o => o.status === "awaiting_payment").length,
      processingOrders:  orders.filter(o => o.status === "processing").length,
      shippedOrders:     orders.filter(o => o.status === "shipped").length,
      completedOrders:   orders.filter(o => o.status === "completed").length,
      cancelledOrders:   orders.filter(o => o.status === "cancelled" || o.status === "refunded").length,
      totalRevenue:      orders.filter(o => ["completed","shipped","processing"].includes(o.status)).reduce((s,o) => s + o.total, 0),
      revenueThisMonth:  orders.filter(o => ["completed","shipped","processing"].includes(o.status) && new Date(o.created_at) >= thisMonth).reduce((s,o) => s + o.total, 0),
      totalUsers:        users.length,
      pendingUsers:      users.filter(u => u.account_status === "pending").length,
      approvedUsers:     users.filter(u => u.account_status === "approved").length,
      totalProducts:     products.length,
      activeProducts:    products.filter(p => p.is_active).length,
      outOfStock:        products.filter(p => p.stock_quantity <= 0).length,
      pendingWholesale:  wholesale.filter(w => w.status === "pending").length,
      approvedWholesale: wholesale.filter(w => w.status === "approved").length,
      pendingAffiliate:  affiliate.filter(a => a.status === "pending").length,
      approvedAffiliate: affiliate.filter(a => a.status === "approved").length,
    });
    setRecentOrders((recentRes.data ?? []) as RecentOrder[]);
    setLastRefreshed(new Date());
    setLoading(false);
    setRefreshing(false);
  }, [profile, supabase]);

  useEffect(() => {
    if (profile?.is_admin) loadData();
  }, [profile, loadData]);

  if (isLoading || !profile?.is_admin) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-56 rounded-brand" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_,i) => <Skeleton key={i} className="h-24 rounded-card" />)}
        </div>
      </div>
    );
  }

  const primaryCards = stats ? [
    { label: "Total Revenue",   value: fmt(stats.totalRevenue),          sub: `${fmt(stats.revenueThisMonth)} this month`,   icon: DollarSign, color: "text-brand-green", bg: "bg-brand-green/10", border: "border-brand-green/20", href: "/admin/orders" },
    { label: "Total Orders",    value: stats.totalOrders.toString(),      sub: `${stats.completedOrders} completed`,          icon: ShoppingBag,color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20",   href: "/admin/orders" },
    { label: "Needs Attention", value: (stats.pendingOrders + stats.awaitingPayment).toString(), sub: `${stats.awaitingPayment} awaiting payment`, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", href: "/admin/orders" },
    { label: "Total Users",     value: stats.totalUsers.toString(),       sub: `${stats.pendingUsers} awaiting approval`,     icon: Users,      color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", href: "/admin/users" },
    { label: "Active Products", value: stats.activeProducts.toString(),   sub: `${stats.outOfStock} out of stock`,            icon: Package,    color: stats.outOfStock > 0 ? "text-amber-400" : "text-brand-green", bg: stats.outOfStock > 0 ? "bg-amber-500/10" : "bg-brand-green/10", border: stats.outOfStock > 0 ? "border-amber-500/20" : "border-brand-green/20", href: "/admin/products" },
    { label: "In Transit",      value: stats.shippedOrders.toString(),    sub: `${stats.processingOrders} processing`,        icon: TrendingUp, color: "text-sky-400",    bg: "bg-sky-500/10",    border: "border-sky-500/20",    href: "/admin/orders" },
    { label: "Wholesale Apps",  value: stats.pendingWholesale.toString(), sub: `${stats.approvedWholesale} approved total`,   icon: Building2,  color: stats.pendingWholesale > 0 ? "text-amber-400" : "text-violet-400", bg: stats.pendingWholesale > 0 ? "bg-amber-500/10" : "bg-violet-500/10", border: stats.pendingWholesale > 0 ? "border-amber-500/20" : "border-violet-500/20", href: "/admin/wholesale" },
    { label: "Affiliate Apps",  value: stats.pendingAffiliate.toString(), sub: `${stats.approvedAffiliate} approved total`,   icon: Star,       color: stats.pendingAffiliate > 0 ? "text-amber-400" : "text-brand-green", bg: stats.pendingAffiliate > 0 ? "bg-amber-500/10" : "bg-brand-green/10", border: stats.pendingAffiliate > 0 ? "border-amber-500/20" : "border-brand-green/20", href: "/admin/affiliates" },
  ] : [];

  const alerts = stats ? [
    stats.pendingUsers     > 0 && { msg: `${stats.pendingUsers} user${stats.pendingUsers > 1 ? "s" : ""} waiting for account approval`,            href: "/admin/users",      icon: AlertCircle },
    stats.awaitingPayment  > 0 && { msg: `${stats.awaitingPayment} order${stats.awaitingPayment > 1 ? "s" : ""} awaiting payment confirmation`,    href: "/admin/orders",     icon: Clock },
    stats.pendingWholesale > 0 && { msg: `${stats.pendingWholesale} wholesale application${stats.pendingWholesale > 1 ? "s" : ""} to review`,      href: "/admin/wholesale",  icon: Building2 },
    stats.pendingAffiliate > 0 && { msg: `${stats.pendingAffiliate} affiliate application${stats.pendingAffiliate > 1 ? "s" : ""} to review`,      href: "/admin/affiliates", icon: Star },
    stats.outOfStock       > 0 && { msg: `${stats.outOfStock} product${stats.outOfStock > 1 ? "s" : ""} out of stock`,                             href: "/admin/products",   icon: Package },
  ].filter(Boolean) as { msg:string; href:string; icon: React.ElementType }[] : [];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-cream mb-1">Dashboard</h1>
          <p className="text-brand-cream-muted text-sm">
            Welcome back, <span className="text-brand-green font-medium">{profile.full_name}</span>
            {lastRefreshed && <span className="ml-2 text-brand-cream-dark">· Updated {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>}
          </p>
        </div>
        <Button variant="ghost" size="sm" leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />} onClick={loadData} disabled={refreshing}>
          {refreshing ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <Link key={i} href={a.href} className="flex items-center gap-3 p-3 rounded-brand bg-amber-500/5 border border-amber-500/20 text-amber-300 text-sm hover:bg-amber-500/10 transition-colors group">
              <a.icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1">{a.msg}</span>
              <ArrowRight className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 8 }).map((_,i) => <Skeleton key={i} className="h-28 rounded-card" />)
          : primaryCards.map(c => (
            <Link key={c.label} href={c.href} className={`glass-card border ${c.border} p-5 rounded-card hover:scale-[1.01] transition-all group block`}>
              <div className={`w-9 h-9 rounded-brand ${c.bg} flex items-center justify-center mb-3`}>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </div>
              <p className={`text-2xl font-bold font-display ${c.color}`}>{c.value}</p>
              <p className="text-xs font-medium text-brand-cream mt-0.5">{c.label}</p>
              <p className="text-xs text-brand-cream-dark mt-0.5 truncate">{c.sub}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-brand-cream-dark opacity-0 group-hover:opacity-100 transition-opacity">
                View <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ))
        }
      </div>

      {stats && (
        <div className="glass-card border border-white/5 p-5 rounded-card">
          <h2 className="font-semibold text-brand-cream text-sm mb-4">Order Status Breakdown</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Awaiting Payment", value: stats.awaitingPayment,  color: "text-amber-400"  },
              { label: "Pending",          value: stats.pendingOrders,    color: "text-yellow-400" },
              { label: "Processing",       value: stats.processingOrders, color: "text-blue-400"   },
              { label: "Shipped",          value: stats.shippedOrders,    color: "text-sky-400"    },
              { label: "Completed",        value: stats.completedOrders,  color: "text-brand-green"},
              { label: "Cancelled",        value: stats.cancelledOrders,  color: "text-red-400"    },
            ].map(s => (
              <div key={s.label} className="text-center p-3 rounded-brand bg-white/2 border border-white/5">
                <p className={`text-xl font-bold font-display ${s.color}`}>{s.value}</p>
                <p className="text-xs text-brand-cream-dark mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-card border border-white/5 rounded-card overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-semibold text-brand-cream text-sm">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs text-brand-green hover:underline flex items-center gap-1">View all <ExternalLink className="h-3 w-3" /></Link>
        </div>
        {loading ? (
          <div className="p-4 space-y-3">{Array.from({ length: 5 }).map((_,i) => <Skeleton key={i} className="h-12 rounded-brand" />)}</div>
        ) : recentOrders.length === 0 ? (
          <div className="p-8 text-center"><ShoppingBag className="h-8 w-8 text-brand-cream-dark mx-auto mb-2" /><p className="text-sm text-brand-cream-muted">No orders yet.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs text-brand-cream-dark">
                  <th className="text-left py-2.5 px-4 font-medium">Order #</th>
                  <th className="text-left py-2.5 px-4 font-medium hidden sm:table-cell">Customer</th>
                  <th className="text-left py-2.5 px-4 font-medium">Status</th>
                  <th className="text-left py-2.5 px-4 font-medium hidden md:table-cell">Payment</th>
                  <th className="text-right py-2.5 px-4 font-medium">Total</th>
                  <th className="text-right py-2.5 px-4 font-medium hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                    <td className="py-3 px-4"><Link href={`/admin/orders/${order.id}`} className="font-mono text-brand-green hover:underline text-xs">#{order.order_number}</Link></td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <p className="text-brand-cream text-xs truncate max-w-[140px]">{order.profiles?.full_name ?? "—"}</p>
                      <p className="text-brand-cream-dark text-xs truncate max-w-[140px]">{order.profiles?.email ?? ""}</p>
                    </td>
                    <td className="py-3 px-4"><Badge variant={statusBadge(order.status)} className="text-xs">{order.status.replace("_", " ")}</Badge></td>
                    <td className="py-3 px-4 hidden md:table-cell"><span className="text-xs text-brand-cream-muted capitalize">{order.payment_method === "cashapp" ? "Cash App" : order.payment_method === "wire" ? "Wire Transfer" : order.payment_method}</span></td>
                    <td className="py-3 px-4 text-right"><span className="text-brand-cream font-medium text-xs">{fmt(order.total)}</span></td>
                    <td className="py-3 px-4 text-right hidden lg:table-cell"><span className="text-xs text-brand-cream-dark">{fmtDate(order.created_at)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="font-semibold text-brand-cream text-sm mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Add Product",   href: "/admin/products",  icon: Package,      color: "text-brand-green" },
            { label: "Manage Orders", href: "/admin/orders",    icon: ShoppingBag,  color: "text-blue-400"    },
            { label: "Review Users",  href: "/admin/users",     icon: Users,        color: "text-violet-400"  },
            { label: "Applications",  href: "/admin/wholesale", icon: CheckCircle2, color: "text-amber-400"   },
          ].map(a => (
            <Link key={a.label} href={a.href} className="glass-card border border-white/5 p-4 rounded-card hover:border-white/10 hover:bg-white/3 transition-all flex items-center gap-3 group">
              <a.icon className={`h-4 w-4 ${a.color} flex-shrink-0`} />
              <span className="text-sm text-brand-cream group-hover:text-white transition-colors">{a.label}</span>
              <ArrowRight className="h-3 w-3 text-brand-cream-dark ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}