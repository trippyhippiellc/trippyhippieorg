"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { X } from "lucide-react";

/*
  Modal — base wrapper for all modals on the site.
  Features: focus trap, ESC close, backdrop click close,
  scroll lock, animation. Set preventClose=true for age gate.
*/

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  preventClose?: boolean;
  className?: string;
  showCloseButton?: boolean;
}

const sizeMap = {
  sm:   "max-w-sm",
  md:   "max-w-md",
  lg:   "max-w-lg",
  xl:   "max-w-2xl",
  full: "max-w-[95vw]",
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  preventClose = false,
  className,
  showCloseButton = true,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || preventClose) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [isOpen, onClose, preventClose]);

  useEffect(() => {
    if (!isOpen || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    first?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", trap);
    return () => document.removeEventListener("keydown", trap);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (!preventClose && e.target === overlayRef.current) onClose();
      }}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby={description ? "modal-description" : undefined}
        className={cn(
          "relative w-full",
          sizeMap[size],
          "glass-card border border-brand-green/15",
          "shadow-[0_24px_64px_rgba(0,0,0,0.6)]",
          "animate-modal-in max-h-[90vh] overflow-y-auto",
          className
        )}
      >
        {(title || (showCloseButton && !preventClose)) && (
          <div className="flex items-start justify-between p-6 pb-0">
            <div className="flex-1 pr-4">
              {title && (
                <h2
                  id="modal-title"
                  className="text-xl font-display font-bold text-brand-cream"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-description"
                  className="text-sm text-brand-cream-muted mt-1"
                >
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && !preventClose && (
              <button
                onClick={onClose}
                className="flex-shrink-0 p-1.5 rounded-brand text-brand-cream-dark hover:text-brand-cream hover:bg-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-brand-green"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function ModalFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 pt-4 mt-4 border-t border-white/5",
        className
      )}
    >
      {children}
    </div>
  );
}

export default Modal;
