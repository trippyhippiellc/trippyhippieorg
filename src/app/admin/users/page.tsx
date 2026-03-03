"use client";

import { useState } from "react";
import { useAdminUsers } from "@/hooks/useAdmin";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/useToast";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Input } from "@/components/ui/Input";
import { formatDate } from "@/lib/utils/cn";
import { Shield, Star, Building2, ChevronDown, ChevronUp, Eye } from "lucide-react";

/* src/app/admin/users/page.tsx
 *
 * Badge only accepts known variants. "suspended" is not one of them.
 * We map it → "cancelled" which exists and looks visually appropriate (red).
 */

type AccountStatus = "pending" | "approved" | "rejected" | "suspended";

function accountStatusVariant(status: string): "pending" | "approved" | "rejected" | "cancelled" {
  if (status === "approved")  return "approved";
  if (status === "rejected")  return "rejected";
  if (status === "suspended") return "cancelled"; // closest visual match
  return "pending";
}

export default function AdminUsersPage() {
  const { users, loading } = useAdminUsers();
  const supabase = createClient();
  const toast    = useToast();

  const [search,   setSearch]   = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  async function updateUser(userId: string, fields: Record<string, unknown>) {
    setUpdating(userId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("profiles").update(fields).eq("id", userId);
    if (error) toast.error(error.message);
    else toast.success("User updated");
    setUpdating(null);
  }

  async function viewIDDocument(userId: string, side: "front" | "back") {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error("Not authenticated");
        return;
      }

      const response = await fetch(`/api/admin/view-id?userId=${userId}&side=${side}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to access ID document");
        return;
      }

      // Open the signed URL in a new tab
      window.open(data.url, "_blank");
    } catch (err) {
      console.error("Error viewing ID:", err);
      toast.error("Failed to view ID document");
    }
  }

  const filtered = (users as Record<string, unknown>[]).filter(u =>
    String(u.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    String(u.email     ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-brand-cream">Users</h1>

      <Input placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-card" />)}</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(u => {
            const uid    = u.id as string;
            const open   = expanded === uid;
            const status = String(u.account_status ?? "pending") as AccountStatus;

            return (
              <div key={uid} className="glass-card border border-white/5 rounded-card overflow-hidden">
                <button
                  onClick={() => setExpanded(open ? null : uid)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-medium text-brand-cream text-sm">{String(u.full_name ?? "—")}</span>
                      <Badge variant={accountStatusVariant(status)}>{status}</Badge>
                      {Boolean(u.is_admin) && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20">
                          <Shield className="h-2.5 w-2.5" />Admin
                        </span>
                      )}
                      {Boolean(u.is_wholesale) && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-brand-green/15 text-brand-green border border-brand-green/20">
                          <Building2 className="h-2.5 w-2.5" />Wholesale
                        </span>
                      )}
                      {Boolean(u.is_affiliate) && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/20">
                          <Star className="h-2.5 w-2.5" />Affiliate
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-brand-cream-dark">
                      {String(u.email ?? "")} · Joined {formatDate(String(u.created_at ?? ""))}
                    </p>
                  </div>
                  {open
                    ? <ChevronUp   className="h-4 w-4 text-brand-cream-dark flex-shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-brand-cream-dark flex-shrink-0" />}
                </button>

                {open && (
                  <div className="border-t border-white/5 p-4 space-y-4 bg-white/[0.02]">
                    {/* ID Document Display - Front and Back */}
                    {(u.id_document_url_front || u.id_document_url_back || u.id_document_url) && (
                      <div className="space-y-2">
                        <label className="text-xs text-brand-cream-dark">ID Documents</label>
                        <div className="flex flex-wrap gap-2">
                          {u.id_document_url_front && (
                            <button
                              onClick={() => viewIDDocument(uid, "front")}
                              className="inline-flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-brand hover:border-brand-green/30 hover:bg-white/10 transition-colors"
                            >
                              <Eye className="h-4 w-4 text-brand-green" />
                              <span className="text-xs text-brand-cream">View Front</span>
                            </button>
                          )}
                          {u.id_document_url_back && (
                            <button
                              onClick={() => viewIDDocument(uid, "back")}
                              className="inline-flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-brand hover:border-brand-green/30 hover:bg-white/10 transition-colors"
                            >
                              <Eye className="h-4 w-4 text-brand-green" />
                              <span className="text-xs text-brand-cream">View Back</span>
                            </button>
                          )}
                          {u.id_document_url && !u.id_document_url_front && !u.id_document_url_back && (
                            <span className="text-[10px] text-brand-cream-dark italic">Legacy ID document (no side specified)</span>
                          )}
                        </div>
                        <p className="text-[10px] text-brand-cream-dark">Link expires in 24 hours for security</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs text-brand-cream-dark">Account Status</label>
                        <select
                          defaultValue={status}
                          onChange={e => updateUser(uid, { account_status: e.target.value })}
                          disabled={updating === uid}
                          className="w-full text-xs bg-[#162816] border border-white/10 rounded-brand text-brand-cream px-2 py-2 focus:outline-none focus:border-brand-green capitalize"
                        >
                          {(["pending","approved","rejected","suspended"] as AccountStatus[]).map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-brand-cream-dark">Affiliate Code</label>
                        <input
                          defaultValue={String(u.affiliate_code ?? "")}
                          onBlur={e => updateUser(uid, { affiliate_code: e.target.value || null })}
                          className="w-full text-xs bg-[#162816] border border-white/10 rounded-brand text-brand-cream px-2 py-2 focus:outline-none focus:border-brand-green uppercase tracking-wider"
                          placeholder="CODE"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-brand-cream-dark">Affiliate Earnings (¢)</label>
                        <input
                          type="number"
                          defaultValue={Number(u.affiliate_earnings ?? 0)}
                          onBlur={e => updateUser(uid, { affiliate_earnings: parseInt(e.target.value) || 0 })}
                          className="w-full text-xs bg-[#162816] border border-white/10 rounded-brand text-brand-cream px-2 py-2 focus:outline-none focus:border-brand-green"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      {([
                        { field: "is_admin",          label: "Admin" },
                        { field: "is_wholesale",      label: "Wholesale" },
                        { field: "is_affiliate",      label: "Affiliate" },
                        { field: "id_verified",       label: "ID Verified" },
                        { field: "cashapp_approved",  label: "Cash App Approved" },
                      ] as const).map(({ field, label }) => (
                        <label key={field} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked={Boolean(u[field])}
                            onChange={e => updateUser(uid, { [field]: e.target.checked })}
                            className="accent-brand-green"
                            disabled={updating === uid}
                          />
                          <span className="text-xs text-brand-cream-muted">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-center py-8 text-brand-cream-muted text-sm">No users found.</p>
          )}
        </div>
      )}
    </div>
  );
}
