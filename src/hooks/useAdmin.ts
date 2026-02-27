"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

/*
  src/hooks/useAdmin.ts
  Admin-only hooks. Guards against non-admin access automatically.
*/

export function useAdminOrders(status?: string) {
  const { profile } = useAuth();
  const supabase     = createClient();
  const [orders,   setOrders]   = useState<Record<string, unknown>[]>([]);
  const [loading,  setLoading]  = useState(true);

  const fetch = useCallback(async () => {
    if (!profile?.is_admin) { setLoading(false); return; }
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase.from("orders") as any).select("*").order("created_at", { ascending: false });
    if (status) query = query.eq("status", status);
    const { data } = await query;
    setOrders(data ?? []);
    setLoading(false);
  }, [profile, status]);

  useEffect(() => { fetch(); }, [fetch]);
  return { orders, loading, refetch: fetch };
}

export function useAdminUsers() {
  const { profile } = useAuth();
  const supabase     = createClient();
  const [users,   setUsers]   = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.is_admin) { setLoading(false); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("profiles") as any)
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }: { data: Record<string, unknown>[] | null }) => {
        setUsers(data ?? []);
        setLoading(false);
      });
  }, [profile]);

  return { users, loading };
}

export function useAdminApplications(type: "wholesale" | "affiliate") {
  const { profile } = useAuth();
  const supabase     = createClient();
  const [apps,    setApps]    = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  const table = type === "wholesale" ? "wholesale_applications" : "affiliate_applications";

  const fetch = useCallback(async () => {
    if (!profile?.is_admin) { setLoading(false); return; }
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from(table) as any)
      .select("*, profiles(full_name, email)")
      .order("created_at", { ascending: false });
    setApps(data ?? []);
    setLoading(false);
  }, [profile, table]);

  useEffect(() => { fetch(); }, [fetch]);

  async function updateStatus(id: string, status: "approved" | "rejected", notes?: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from(table) as any)
      .update({ status, admin_notes: notes ?? null })
      .eq("id", id);
    fetch();
  }

  return { apps, loading, updateStatus, refetch: fetch };
}

export function useAdminProducts() {
  const { profile } = useAuth();
  const supabase     = createClient();
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [loading,  setLoading]  = useState(true);

  const fetch = useCallback(async () => {
    if (!profile?.is_admin) { setLoading(false); return; }
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from("products") as any)
      .select("*")
      .order("created_at", { ascending: false });
    setProducts(data ?? []);
    setLoading(false);
  }, [profile]);

  useEffect(() => { fetch(); }, [fetch]);
  return { products, loading, refetch: fetch };
}
