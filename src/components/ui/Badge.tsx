"use client";

import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

/*
  Badge — small label pill used on product cards, order statuses, etc.
  Variants cover all use cases across the app.
*/

type BadgeVariant =
  | "default"
  | "featured"
  | "sativa"
  | "indica"
  | "hybrid"
  | "pending"
  | "approved"
  | "rejected"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled"
  | "wholesale"
  | "affiliate"
  | "admin";

type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  children?: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:    "bg-white/10 text-brand-cream-muted border-white/10",
  featured:   "bg-amber-500/15 text-amber-400 border-amber-500/25",
  sativa:     "bg-orange-500/15 text-orange-400 border-orange-500/25",
  indica:     "bg-violet-500/15 text-violet-400 border-violet-500/25",
  hybrid:     "bg-brand-green/15 text-brand-green border-brand-green/25",
  pending:    "bg-amber-500/15 text-amber-400 border-amber-500/25",
  approved:   "bg-brand-green/15 text-brand-green border-brand-green/25",
  rejected:   "bg-red-500/15 text-red-400 border-red-500/25",
  processing: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  shipped:    "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
  completed:  "bg-brand-green/15 text-brand-green border-brand-green/25",
  cancelled:  "bg-red-500/15 text-red-400 border-red-500/25",
  wholesale:  "bg-violet-500/15 text-violet-300 border-violet-500/25",
  affiliate:  "bg-amber-500/15 text-amber-300 border-amber-500/25",
  admin:      "bg-red-500/15 text-red-400 border-red-500/25",
};

const variantLabels: Partial<Record<BadgeVariant, string>> = {
  sativa:    "Sativa",
  indica:    "Indica",
  hybrid:    "Hybrid",
  featured:  "Featured",
  wholesale: "Wholesale",
  affiliate: "Affiliate",
  admin:     "Admin",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "text-[10px] px-1.5 py-0.5",
  md: "text-xs px-2 py-0.5",
};

export function Badge({ variant = "default", size = "md", className, children }: BadgeProps) {
  const label = children ?? variantLabels[variant] ?? variant;

  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold rounded-pill border uppercase tracking-wide",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {label}
    </span>
  );
}

export default Badge;
