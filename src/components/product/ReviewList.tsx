"use client";

import { useEffect, useState } from "react";
import { Star, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ReviewForm } from "./ReviewForm";
import { StarRating } from "@/components/ui/StarRating";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/utils/cn";

/* src/components/product/ReviewList.tsx */

interface Review {
  id:         string;
  rating:     number;
  title:      string | null;
  body:       string | null;
  created_at: string;
  profiles: { full_name: string | null } | null;
}

interface ReviewListProps {
  productId:      string;
  averageRating:  number;
  reviewCount:    number;
}

const PAGE_SIZE = 5;

export function ReviewList({ productId, averageRating, reviewCount }: ReviewListProps) {
  const supabase = createClient();
  const [reviews,  setReviews]  = useState<Review[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(0);
  const [hasMore,  setHasMore]  = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function loadReviews(reset = false) {
    setLoading(true);
    const start = reset ? 0 : page * PAGE_SIZE;
    const { data } = await supabase
      .from("reviews")
      .select("id, rating, title, body, created_at, profiles(full_name)")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .range(start, start + PAGE_SIZE - 1);

    const results = (data ?? []) as unknown as Review[];
    setReviews(prev => reset ? results : [...prev, ...results]);
    setHasMore(results.length === PAGE_SIZE);
    if (!reset) setPage(p => p + 1);
    setLoading(false);
  }

  useEffect(() => { loadReviews(true); }, [productId]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-display font-bold text-brand-cream mb-2">
            Customer Reviews
          </h2>
          {reviewCount > 0 && (
            <div className="flex items-center gap-3">
              <StarRating value={averageRating} readOnly size="lg" />
              <span className="text-brand-cream-muted text-sm">{averageRating.toFixed(1)} out of 5 · {reviewCount} review{reviewCount !== 1 && "s"}</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowForm(f => !f)}
          className="h-10 px-5 rounded-brand border border-brand-green/40 text-brand-green text-sm font-medium hover:bg-brand-green/10 transition-colors"
        >
          {showForm ? "Cancel" : "Write a Review"}
        </button>
      </div>

      {/* Review form */}
      {showForm && (
        <div className="glass-card border border-brand-green/10 p-6 rounded-card">
          <ReviewForm productId={productId} onSuccess={() => { setShowForm(false); loadReviews(true); }} />
        </div>
      )}

      {/* Reviews */}
      {loading && reviews.length === 0 ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-28 w-full rounded-card" />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-brand-cream-muted">
          <Star className="h-8 w-8 mx-auto mb-3 text-white/20" />
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="glass-card border border-white/5 p-5 rounded-card">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <StarRating value={r.rating} readOnly size="sm" />
                    {r.title && <span className="font-medium text-brand-cream text-sm">{r.title}</span>}
                  </div>
                  <p className="text-xs text-brand-cream-dark">
                    {r.profiles?.full_name ?? "Anonymous"} · {formatDate(r.created_at)}
                  </p>
                </div>
              </div>
              {r.body && <p className="text-sm text-brand-cream-muted leading-relaxed">{r.body}</p>}
            </div>
          ))}

          {hasMore && (
            <button
              onClick={() => loadReviews()}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-card border border-white/10 text-brand-cream-muted hover:text-brand-cream hover:border-white/20 transition-colors text-sm"
            >
              <ChevronDown className="h-4 w-4" />
              Load more reviews
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ReviewList;
