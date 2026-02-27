"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

/* src/components/product/ReviewForm.tsx */

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const { user } = useAuth();
  const [rating,  setRating]  = useState(0);
  const [hovered, setHovered] = useState(0);
  const [title,   setTitle]   = useState("");
  const [body,    setBody]    = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user)   { setError("You must be logged in to leave a review."); return; }
    if (!rating) { setError("Please select a star rating."); return; }
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating,
          title: title || undefined,
          body: body || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to submit review");
        return;
      }

      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="p-4 rounded-brand bg-brand-green/10 border border-brand-green/20 text-sm text-brand-green text-center">
        ✓ Review submitted! Thank you for your feedback.
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 rounded-brand bg-white/5 border border-white/10 text-sm text-brand-cream-muted text-center">
        <a href="/login" className="text-brand-green hover:underline">Sign in</a> to leave a review.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-brand-cream-muted mb-2">Rating <span className="text-red-400">*</span></label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button key={star} type="button" onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)} onClick={() => setRating(star)} className="transition-transform hover:scale-110">
              <Star className={cn("h-7 w-7 transition-colors", star <= (hovered || rating) ? "fill-amber-400 text-amber-400" : "text-white/20")} />
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-brand-cream-muted">Title (optional)</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Great product!" maxLength={100} className="w-full px-3 py-2 text-sm bg-[#162816] border border-white/10 rounded-brand text-brand-cream placeholder:text-brand-cream-dark focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20" />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-brand-cream-muted">Review (optional)</label>
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Share your experience…" rows={4} maxLength={2000} className="w-full px-3 py-2.5 text-sm bg-[#162816] border border-white/10 rounded-brand text-brand-cream placeholder:text-brand-cream-dark focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 resize-none" />
      </div>
      {error && <p className="text-sm text-red-400">⚠ {error}</p>}
      <Button type="submit" variant="primary" isLoading={loading}>Submit Review</Button>
    </form>
  );
}

export default ReviewForm;
