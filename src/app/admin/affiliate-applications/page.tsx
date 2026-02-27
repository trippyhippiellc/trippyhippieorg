"use client";

import { useAdminApplications } from "@/hooks/useAdmin";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils/cn";
import { CheckCircle, XCircle } from "lucide-react";

/* src/app/admin/affiliates/page.tsx
 * NOTE: TikTok is NOT a lucide-react icon — removed. Platform shown as text only.
 */

export default function AdminAffiliatesPage() {
  const { apps, loading, updateStatus } = useAdminApplications("affiliate");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-brand-cream">Affiliate Applications</h1>

      {loading
        ? Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-card" />
          ))
        : (apps as Record<string, unknown>[]).map(app => {
            const profile = app.profiles as Record<string, string> | null;
            const status  = app.status as "pending" | "approved" | "rejected";

            return (
              <div key={app.id as string} className="glass-card border border-amber-500/10 p-5 rounded-card space-y-3">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-semibold text-brand-cream mb-0.5">{app.full_name as string}</p>
                    <div className="flex items-center gap-2 text-xs text-brand-cream-dark mb-1 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                        {app.platform as string}
                      </span>
                      <span>@{app.handle as string}</span>
                      <span>·</span>
                      <span>{app.follower_count as string} followers</span>
                      <span>·</span>
                      <span>{app.content_type as string}</span>
                    </div>
                    <p className="text-xs text-brand-cream-dark">
                      {profile?.full_name} · {profile?.email} · {formatDate(app.created_at as string)}
                    </p>
                  </div>
                  <Badge variant={status}>{status}</Badge>
                </div>

                {!!app.promotion_plan && (
                  <p className="text-sm text-brand-cream-muted bg-white/5 rounded-brand p-3">
                    {app.promotion_plan as string}
                  </p>
                )}

                <div className="flex items-center gap-2 text-xs text-brand-cream-dark">
                  <span>Agreed to terms:</span>
                  <span className={app.agreed_to_terms ? "text-brand-green" : "text-red-400"}>
                    {app.agreed_to_terms ? "Yes" : "No"}
                  </span>
                </div>

                {status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      leftIcon={<CheckCircle className="h-3.5 w-3.5" />}
                      onClick={() => updateStatus(app.id as string, "approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      leftIcon={<XCircle className="h-3.5 w-3.5" />}
                      onClick={() => updateStatus(app.id as string, "rejected")}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            );
          })}

      {!loading && apps.length === 0 && (
        <p className="text-brand-cream-muted text-sm">No applications yet.</p>
      )}
    </div>
  );
}
