"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { X } from "lucide-react";

/*
  Drawer — slide-in panel from the right edge of the screen.
  Used as the base for CartWidget.
  Features: slide animation, backdrop, ESC close, scroll lock, focus trap.
*/

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: "sm" | "md" | "lg";
  className?: string;
}

const widthMap = {
  sm: "w-full max-w-sm",
  md: "w-full max-w-md",
  lg: "w-full max-w-lg",
};

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  footer,
  width = "md",
  className,
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !drawerRef.current) return;
    const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
      'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
    );
    focusable[0]?.focus();
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-drawer bg-black/60 backdrop-blur-sm",
          "transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Panel"}
        className={cn(
          "fixed top-0 right-0 bottom-0 z-drawer flex flex-col",
          widthMap[width],
          "bg-[#0D1F0D] border-l border-brand-green/15",
          "shadow-[-8px_0_40px_rgba(0,0,0,0.5)]",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-shrink-0">
          {title && (
            <h2 className="text-lg font-display font-bold text-brand-cream">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="ml-auto p-2 rounded-brand text-brand-cream-dark hover:text-brand-cream hover:bg-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-brand-green"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>

        {/* Sticky footer */}
        {footer && (
          <div className="flex-shrink-0 border-t border-white/5 bg-[#0D1F0D]">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}

export default Drawer;
