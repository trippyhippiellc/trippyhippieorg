"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

/*
  src/hooks/useOrders.ts
  Fetches orders for the current user. Supports:
  - All orders (paginated)
  - Single order by ID
  - Refetch trigger
*/

export interface Order {
  id:               string;
  order_number:     string;
  status:           string;
  payment_method:   string;
  subtotal:         number;
  discount:         number;
  total:            number;
  coupon_code:      string | null;
  shipping_address: Record<string, string> | any;
  items:            OrderLineItem[] | any[];
  tracking_number:  string | null;
  is_wholesale:     boolean;
  created_at:       string;
  updated_at:       string;
}

export interface OrderLineItem {
  product_id: string;
  name:       string;
  quantity:   number;
  unit_price: number;
}

interface UseOrdersOptions {
  limit?: number;
}

export function useOrders({ limit = 20 }: UseOrdersOptions = {}) {
  const { user } = useAuth();
  const supabase  = createClient();

  const [orders,   setOrders]   = useState<Order[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: dbErr } = await (supabase.from("orders") as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (dbErr) setError(dbErr.message);
    else setOrders((data ?? []) as Order[]);
    setLoading(false);
  }, [user, limit]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders };
}

export function useOrder(orderId: string) {
  const { user } = useAuth();
  const supabase  = createClient();

  const [order,   setOrder]   = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!user || !orderId) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("orders") as any)
      .select("*")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single()
      .then(({ data, error: dbErr }: { data: Order | null; error: { message: string } | null }) => {
        if (dbErr) setError(dbErr.message);
        else setOrder(data);
        setLoading(false);
      });
  }, [user, orderId]);

  return { order, loading, error };
}
