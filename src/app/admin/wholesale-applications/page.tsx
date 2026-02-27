"use client";

import { useAdminApplications } from "@/hooks/useAdmin";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/utils/cn";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

/* src/app/admin/wholesale/page.tsx */

export default function AdminWholesalePage() {
  const { apps, loading, updateStatus } = useAdminApplications("wholesale");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-brand-cream">Wholesale Applications</h1>
      {loading
        ? Array.from({length:3}).map((_,i) => <Skeleton key={i} className="h-36 rounded-card" />)
        : (apps as Record<string,unknown>[]).map(app => (
          <div key={app.id as string} className="glass-card border border-brand-green/10 p-5 rounded-card space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-brand-cream">{app.business_name as string}</p>
                <p className="text-xs text-brand-cream-dark">{app.business_type as string} · {app.estimated_monthly_volume as string} · {app.years_in_business as string}</p>
                <p className="text-xs text-brand-cream-dark mt-0.5">
                  {(app.profiles as Record<string,string> | null)?.full_name} · {(app.profiles as Record<string,string> | null)?.email}
                </p>
                <p className="text-xs text-brand-cream-dark">{formatDate(app.created_at as string)}</p>
              </div>
              <Badge variant={app.status as "pending"|"approved"|"rejected"}>{app.status as string}</Badge>
            </div>
            {typeof app.reason === "string" && app.reason && (
              <p className="text-sm text-brand-cream-muted bg-white/5 rounded-brand p-3">{app.reason}</p>
            )}
            {app.status === "pending" && (
              <div className="flex gap-2">
                <Button size="sm" variant="primary" leftIcon={<CheckCircle className="h-3.5 w-3.5" />} onClick={() => updateStatus(app.id as string, "approved")}>Approve</Button>
                <Button size="sm" variant="danger" leftIcon={<XCircle className="h-3.5 w-3.5" />} onClick={() => updateStatus(app.id as string, "rejected")}>Reject</Button>
              </div>
            )}
          </div>
        ))
      }
      {!loading && apps.length === 0 && <p className="text-brand-cream-muted text-sm">No applications yet.</p>}
    </div>
  );
}
