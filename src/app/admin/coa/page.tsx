"use client";

import { useState, useEffect } from "react";
import { FlaskConical, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";

/* src/app/admin/coa/page.tsx */

interface COARequest {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  requested_product_ids: string[];
  status: "pending" | "fulfilled";
  created_at: string;
  fulfilled_at: string | null;
  products?: { id: string; name: string }[];
}

export default function AdminCOAPage() {
  const toast = useToast();
  const [requests, setRequests] = useState<COARequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      const res = await fetch("/api/admin/coa/requests");
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Failed to fetch COA requests:", error);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  }

  async function markFulfilled(requestId: string) {
    try {
      const res = await fetch(`/api/admin/coa/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "fulfilled" }),
      });

      if (res.ok) {
        toast.success("Request marked as fulfilled");
        fetchRequests(); // Refresh the list
      } else {
        toast.error("Failed to update request");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-brand-cream mb-1 flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-brand-green" />
          COA Requests
        </h1>
        <p className="text-brand-cream-muted text-sm">
          Manage customer requests for Certificates of Analysis
        </p>
      </div>

      {loading ? (
        <div className="glass-card border border-brand-green/10 p-8 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-brand-green border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-brand-cream-muted">Loading requests...</p>
        </div>
      ) : requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map(request => (
            <div key={request.id} className="glass-card border border-brand-green/10 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-brand-cream mb-1">{request.name}</h3>
                  <p className="text-sm text-brand-cream-muted mb-2">{request.email}</p>
                  {request.phone && (
                    <p className="text-sm text-brand-cream-muted">{request.phone}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {request.status === "pending" ? (
                    <div className="flex items-center gap-1 text-amber-400">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs">Pending</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-brand-green">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-xs">Fulfilled</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-brand-cream-muted mb-2">Requested Products:</p>
                <div className="flex flex-wrap gap-2">
                  {request.products?.map(product => (
                    <span
                      key={product.id}
                      className="text-xs px-2 py-1 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green"
                    >
                      {product.name}
                    </span>
                  )) || (
                    <span className="text-xs text-brand-cream-dark">
                      {request.requested_product_ids.length} product{request.requested_product_ids.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-brand-cream-dark">
                  Requested on {formatDate(request.created_at)}
                  {request.fulfilled_at && ` • Fulfilled on ${formatDate(request.fulfilled_at)}`}
                </p>

                {request.status === "pending" && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => markFulfilled(request.id)}
                    leftIcon={<CheckCircle className="h-3 w-3" />}
                  >
                    Mark Fulfilled
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card border border-brand-green/10 p-12 text-center">
          <FlaskConical className="h-10 w-10 text-brand-cream-dark mx-auto mb-4" />
          <p className="text-brand-cream-muted mb-2">No COA requests yet.</p>
          <p className="text-xs text-brand-cream-dark">Requests will appear here when customers submit them.</p>
        </div>
      )}
    </div>
  );
}
