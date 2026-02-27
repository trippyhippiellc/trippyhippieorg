/*
  src/hooks/useToast.ts
  Imperative toast hook built on top of react-hot-toast.
  Usage:
    const toast = useToast()
    toast.success("Order placed!")
    toast.error("Something went wrong")
*/

import { toast as hotToast } from "react-hot-toast";

const DEFAULT_DURATION = 4000;

export function useToast() {
  return {
    success(message: string, duration = DEFAULT_DURATION) {
      hotToast.success(message, {
        duration,
        style: {
          background: "#162816",
          color:       "#E8F0D0",
          border:      "1px solid rgba(124,179,66,0.3)",
        },
        iconTheme: { primary: "#7CB342", secondary: "#0D1F0D" },
      });
    },

    error(message: string, duration = DEFAULT_DURATION) {
      hotToast.error(message, {
        duration,
        style: {
          background: "#2A1010",
          color:       "#E8F0D0",
          border:      "1px solid rgba(239,68,68,0.3)",
        },
        iconTheme: { primary: "#EF4444", secondary: "#2A1010" },
      });
    },

    warning(message: string, duration = DEFAULT_DURATION) {
      hotToast(message, {
        duration,
        icon: "⚠️",
        style: {
          background: "#2A1F0A",
          color:       "#E8F0D0",
          border:      "1px solid rgba(245,158,11,0.3)",
        },
      });
    },

    info(message: string, duration = DEFAULT_DURATION) {
      hotToast(message, {
        duration,
        icon: "ℹ️",
        style: {
          background: "#0A1A2A",
          color:       "#E8F0D0",
          border:      "1px solid rgba(59,130,246,0.3)",
        },
      });
    },

    loading(message: string) {
      return hotToast.loading(message, {
        style: {
          background: "#162816",
          color:       "#E8F0D0",
          border:      "1px solid rgba(124,179,66,0.15)",
        },
      });
    },

    dismiss: hotToast.dismiss,
    promise: hotToast.promise,
  };
}
