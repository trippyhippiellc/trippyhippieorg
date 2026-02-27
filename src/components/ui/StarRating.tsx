"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/*
  StarRating — display or interactive 1–5 star rating.
  readOnly=true  → shows average rating, supports decimals (e.g. 4.3)
  readOnly=false → user clicks to pick a rating (ReviewForm)
*/

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  reviewCount?: number;
  className?: string;
}

const sizeMap = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "md",
  showCount = false,
  reviewCount,
  className,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const display  = readOnly ? value : (hovered || value);
  const starSize = sizeMap[size];

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled  = display >= star;
          const partial = !filled && display > star - 1;
          const pct     = partial
            ? Math.round((display - (star - 1)) * 100)
            : 0;

          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={() => { if (!readOnly) onChange?.(star); }}
              onMouseEnter={() => { if (!readOnly) setHovered(star); }}
              onMouseLeave={() => { if (!readOnly) setHovered(0); }}
              className={cn(
                "relative flex-shrink-0 transition-transform",
                !readOnly && "cursor-pointer hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green rounded-sm",
                readOnly && "cursor-default"
              )}
              aria-label={
                readOnly
                  ? undefined
                  : `Rate ${star} star${star !== 1 ? "s" : ""}`
              }
            >
              {/* Empty star background */}
              <Star
                className={cn(
                  starSize,
                  "text-brand-cream-dark/30 fill-brand-cream-dark/10"
                )}
              />

              {/* Filled overlay — full or partial width */}
              {(filled || partial) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: filled ? "100%" : `${pct}%` }}
                >
                  <Star
                    className={cn(
                      starSize,
                      "fill-amber-400 text-amber-400",
                      !readOnly && hovered >= star && "fill-amber-300 text-amber-300"
                    )}
                  />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {showCount && (
        <span className="text-sm text-brand-cream-muted ml-1">
          {value > 0 ? value.toFixed(1) : "No ratings"}
          {reviewCount !== undefined && reviewCount > 0 && (
            <span className="ml-1 text-brand-cream-dark">
              ({reviewCount.toLocaleString()})
            </span>
          )}
        </span>
      )}
    </div>
  );
}

export default StarRating;
