"use client";

import toast from "react-hot-toast";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

/*
  Toast — wrapper around react-hot-toast with branded styles.
  Import and call these functions anywhere in the app instead
  of calling toast() directly.

  Usage:
    import { showToast } from "@/components/ui/Toast"
    showToast.success("Item added to cart!")
    showToast.error("Something went wrong.")
    showToast.info("Your state has been updated.")
    showToast.warning("Low stock — only 3 left!")
*/

const baseStyle = {
  background:  "#1A2E1A",
  color:       "#F5F0E8",
  border:      "1px solid rgba(124,179,66,0.2)",
  borderRadius: "0.625rem",
  fontFamily:  "var(--font-body)",
  fontSize:    "0.875rem",
  boxShadow:   "0 4px 24px rgba(0,0,0,0.4)",
  padding:     "12px 16px",
};

export const showToast = {
  success: (message: string) =>
    toast.custom((t) => (
      <div
        className={`flex items-center gap-3 transition-all ${t.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
        style={{ ...baseStyle, borderColor: "rgba(124,179,66,0.3)" }}
      >
        <CheckCircle className="h-4 w-4 text-brand-green flex-shrink-0" />
        <span className="flex-1">{message}</span>
        <button onClick={() => toast.dismiss(t.id)} className="text-brand-cream-dark hover:text-brand-cream">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )),

  error: (message: string) =>
    toast.custom((t) => (
      <div
        className={`flex items-center gap-3 transition-all ${t.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
        style={{ ...baseStyle, borderColor: "rgba(239,68,68,0.3)" }}
      >
        <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
        <span className="flex-1">{message}</span>
        <button onClick={() => toast.dismiss(t.id)} className="text-brand-cream-dark hover:text-brand-cream">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )),

  warning: (message: string) =>
    toast.custom((t) => (
      <div
        className={`flex items-center gap-3 transition-all ${t.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
        style={{ ...baseStyle, borderColor: "rgba(245,158,11,0.3)" }}
      >
        <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
        <span className="flex-1">{message}</span>
        <button onClick={() => toast.dismiss(t.id)} className="text-brand-cream-dark hover:text-brand-cream">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )),

  info: (message: string) =>
    toast.custom((t) => (
      <div
        className={`flex items-center gap-3 transition-all ${t.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
        style={{ ...baseStyle, borderColor: "rgba(99,102,241,0.3)" }}
      >
        <Info className="h-4 w-4 text-indigo-400 flex-shrink-0" />
        <span className="flex-1">{message}</span>
        <button onClick={() => toast.dismiss(t.id)} className="text-brand-cream-dark hover:text-brand-cream">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )),
};

export default showToast;
