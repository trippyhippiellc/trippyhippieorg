"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";

/*
  error.tsx — global error boundary for the App Router.
  "use client" required by Next.js for error boundaries.
  Shown when an unhandled error occurs in any route segment.
*/

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0D1F0D]">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-display font-bold text-brand-cream mb-3">
          Something went wrong
        </h1>
        <p className="text-brand-cream-muted mb-8 leading-relaxed">
          An unexpected error occurred. This has been logged. Try refreshing,
          or go back to the home page.
        </p>
        {process.env.NODE_ENV === "development" && (
          <pre className="text-left text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-brand p-4 mb-6 overflow-auto max-h-32">
            {error.message}
          </pre>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-brand bg-brand-green text-white font-medium hover:bg-brand-green-light transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-brand border border-white/10 text-brand-cream-muted hover:text-brand-cream hover:border-white/20 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </a>
        </div>
      </div>
    </div>
  );
}
