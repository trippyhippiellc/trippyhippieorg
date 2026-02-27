"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/*
  QuantitySelector — +/- quantity control for product detail page.
  Shows bulk discount tier hint below when applicable.
*/

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { btn: "h-7 w-7", text: "text-sm min-w-[2rem]" },
  md: { btn: "h-9 w-9", text: "text-base min-w-[2.5rem]" },
  lg: { btn: "h-11 w-11", text: "text-lg min-w-[3rem]" },
};

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 999,
  size = "md",
  className,
}: QuantitySelectorProps) {
  const { btn, text } = sizeMap[size];

  function decrement() { if (value > min) onChange(value - 1); }
  function increment() { if (value < max) onChange(value + 1); }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-brand border border-white/10 bg-[#1A2E1A] overflow-hidden",
        className
      )}
    >
      <button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        className={cn(
          btn,
          "flex items-center justify-center",
          "text-brand-cream-muted hover:text-brand-cream hover:bg-white/5",
          "transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        )}
        aria-label="Decrease quantity"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>

      <span
        className={cn(
          text,
          "text-center font-semibold text-brand-cream px-2 select-none"
        )}
      >
        {value}
      </span>

      <button
        type="button"
        onClick={increment}
        disabled={value >= max}
        className={cn(
          btn,
          "flex items-center justify-center",
          "text-brand-cream-muted hover:text-brand-cream hover:bg-white/5",
          "transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        )}
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default QuantitySelector;
