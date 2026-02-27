"use client";

import { useState, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/*
  Tooltip — hover tooltip for icons and truncated text.
  Positioning: top (default), bottom, left, right.
*/

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

const positionClasses = {
  top:    "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left:   "right-full top-1/2 -translate-y-1/2 mr-2",
  right:  "left-full top-1/2 -translate-y-1/2 ml-2",
};

const arrowClasses = {
  top:    "top-full left-1/2 -translate-x-1/2 border-t-[#1A2E1A] border-l-transparent border-r-transparent border-b-transparent",
  bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-[#1A2E1A] border-l-transparent border-r-transparent border-t-transparent",
  left:   "left-full top-1/2 -translate-y-1/2 border-l-[#1A2E1A] border-t-transparent border-b-transparent border-r-transparent",
  right:  "right-full top-1/2 -translate-y-1/2 border-r-[#1A2E1A] border-t-transparent border-b-transparent border-l-transparent",
};

export function Tooltip({ content, children, position = "top", className }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  function show() {
    timer.current = setTimeout(() => setVisible(true), 300);
  }

  function hide() {
    clearTimeout(timer.current);
    setVisible(false);
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}

      {visible && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-tooltip pointer-events-none whitespace-nowrap",
            "px-2.5 py-1.5 rounded-brand",
            "bg-[#1A2E1A] border border-brand-green/20",
            "text-xs text-brand-cream font-medium",
            "shadow-lg",
            positionClasses[position],
            className
          )}
        >
          {content}
          <span
            className={cn(
              "absolute w-0 h-0 border-4",
              arrowClasses[position]
            )}
          />
        </div>
      )}
    </div>
  );
}

export default Tooltip;
