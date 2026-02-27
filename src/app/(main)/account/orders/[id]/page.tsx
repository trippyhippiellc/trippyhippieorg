"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils/cn";
import { Skeleton } from "@/components/ui/Skeleton";
import { ArrowLeft, Package, Truck, CheckCircle, AlertCircle, CreditCard, Clock, MapPin, Mail } from "lucide-react";

interface OrderDetail {
  id: string;
  order_number: string;
  user_id: string;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  email: string;
  full_name: string;
  shipping_address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
  };
  payment_method: string;
  status: string;
  items: any[];
  created_at: string;
  updated_at: string;
}

const statusConfig = {
  pending: { icon: Package, color: "bg-yellow-500/20", textColor: "text-yellow-400", label: "Pending" },
  processing: { icon: Truck, color: "bg-blue-500/20", textColor: "text-blue-400", label: "Processing" },
  shipped: { icon: Truck, color: "bg-blue-500/20", textColor: "text-blue-400", label: "Shipped" },
  completed: { icon: CheckCircle, color: "bg-green-500/20", textColor: "text-green-400", label: "Completed" },
  cancelled: { icon: AlertCircle, color: "bg-red-500/20", textColor: "text-red-400", label: "Cancelled" },
  refunded: { icon: AlertCircle, color: "bg-red-500/20", textColor: "text-red-400", label: "Refunded" },
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading: authLoading } = useAuth();
  const supabase = createClient();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login?redirect=/account/orders");
      return;
    }

    const fetchOrder = async () => {
      try {
        const orderId = params.id as string;

        const { data, error: queryError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();

        if (queryError) {
          throw new Error("Order not found");
        }

        if (!data) {
          throw new Error("Order not found");
        }

        const orderData = data as unknown as OrderDetail;

        // Security: Verify order belongs to current user
        if (orderData.user_id !== user.id) {
          setError("You don't have permission to view this order");
          setLoading(false);
          return;
        }

        setOrder(orderData);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load order";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [user, authLoading, params.id, router, supabase]);

  if (authLoading || loading) {
    return (
      <div className="max-w-3xl space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 rounded-card" />
        <Skeleton className="h-60 rounded-card" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-brand-cream mb-2">
          {error || "Order Not Found"}
        </h2>
        <p className="text-brand-cream-muted mb-8">
          {error === "You don't have permission to view this order"
            ? "You can only view orders associated with your account."
            : "This order doesn't exist or has been removed."}
        </p>
        <Link href="/account/orders">
          <Button className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = config.icon;

  // Get payment method display name
  const getPaymentMethodName = (method: string) => {
    const methodMap: Record<string, string> = {
      stripe: "Credit/Debit Card",
      cashapp: "Cash App",
      wire: "Wire Transfer",
      crypto: "Cryptocurrency",
    };
    return methodMap[method.toLowerCase()] || method;
  };

  return (
    <div className="max-w-5xl space-y-6">
      {/* Back Link */}
      <Link
        href="/account/orders"
        className="text-brand-green hover:text-brand-green-light transition-colors inline-flex items-center gap-2 text-sm font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      {/* Hero Section with Status */}
      <div className="relative">
        <div className="glass-card border border-brand-green/20 rounded-card p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-brand-cream-muted mb-2">Order Number</p>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-brand-cream">
                {order.order_number}
              </h1>
              <p className="text-sm text-brand-cream-muted mt-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {formatDate(order.created_at)}
              </p>
            </div>
            <div className={`${config.color} border border-white/10 rounded-card p-4 text-center min-w-fit`}>
              <StatusIcon className={`h-6 w-6 ${config.textColor} mx-auto mb-2`} />
              <p className={`font-semibold text-xs ${config.textColor}`}>{config.label}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column: Pricing */}
        <div className="md:col-span-2 space-y-6">
          {/* Order Summary */}
          <div className="glass-card border border-white/10 rounded-card p-6">
            <h2 className="text-lg font-display font-bold text-brand-cream mb-5">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-brand-cream-muted">Subtotal</span>
                <span className="font-semibold text-brand-cream">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.tax > 0 && (
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <span className="text-brand-cream-muted">Tax</span>
                  <span className="font-semibold text-brand-cream">{formatCurrency(order.tax)}</span>
                </div>
              )}
              {order.shipping > 0 && (
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <span className="text-brand-cream-muted">Shipping</span>
                  <span className="font-semibold text-brand-cream">{formatCurrency(order.shipping)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <span className="text-brand-cream-muted">Discount</span>
                  <span className="font-semibold text-brand-green">-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 bg-brand-green/5 rounded-card px-4 py-3 border border-brand-green/10">
                <span className="font-semibold text-brand-cream">Total Due</span>
                <span className="text-2xl font-bold text-brand-green">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          {Array.isArray(order.items) && order.items.length > 0 && (
            <div className="glass-card border border-white/10 rounded-card p-6">
              <h2 className="text-lg font-display font-bold text-brand-cream mb-4">Items Ordered</h2>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm pb-3 border-b border-white/5 last:border-b-0">
                    <div className="flex-1">
                      <p className="font-semibold text-brand-cream">{item.name || "Product"}</p>
                      <p className="text-xs text-brand-cream-muted">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-brand-cream ml-4">
                      {formatCurrency((item.unit_price || 0) * (item.quantity || 1))}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Details */}
        <div className="space-y-6">
          {/* Payment Method */}
          <div className="glass-card border border-white/10 rounded-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="h-5 w-5 text-brand-green" />
              <h3 className="font-semibold text-brand-cream">Payment Method</h3>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-brand-cream-muted">Type</p>
              <p className="font-semibold text-brand-cream">{getPaymentMethodName(order.payment_method)}</p>
              <div className="pt-3 border-t border-white/5 mt-3">
                <p className="text-xs text-brand-cream-muted mb-1">Status</p>
                <Badge variant={order.status as any} className="text-xs py-1">
                  {config.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="glass-card border border-white/10 rounded-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="h-5 w-5 text-brand-green" />
              <h3 className="font-semibold text-brand-cream">Delivery Address</h3>
            </div>
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-brand-cream">{order.full_name}</p>
              <p className="text-brand-cream-muted">{order.shipping_address.line1}</p>
              {order.shipping_address.line2 && <p className="text-brand-cream-muted">{order.shipping_address.line2}</p>}
              <p className="text-brand-cream-muted">
                {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="glass-card border border-white/10 rounded-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-5 w-5 text-brand-green" />
              <h3 className="font-semibold text-brand-cream">Contact</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-xs text-brand-cream-muted mb-1">Email</p>
                <p className="font-mono text-brand-cream text-xs break-all">{order.email}</p>
              </div>
              <div>
                <p className="text-xs text-brand-cream-muted mb-1">Phone</p>
                <p className="font-mono text-brand-cream">{order.shipping_address.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <Link href="/account/orders" className="flex-1">
          <Button variant="secondary" className="w-full gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Button>
        </Link>
        <Link href="/shop" className="flex-1">
          <Button variant="primary" className="w-full gap-2">
            <Package className="h-4 w-4" />
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
