import Link from "next/link";
import { ArrowLeft, Leaf } from "lucide-react";

/*
  not-found.tsx — 404 page shown for any unmatched route.
  Server component.
*/

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "radial-gradient(ellipse at center, #1A2E1A 0%, #0D1F0D 70%)" }}
    >
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center mb-6">
          <Leaf className="h-10 w-10 text-brand-green/40" />
        </div>
        <h1 className="text-8xl font-display font-bold gradient-text mb-4">404</h1>
        <h2 className="text-2xl font-display font-semibold text-brand-cream mb-3">
          Page Not Found
        </h2>
        <p className="text-brand-cream-muted mb-8 leading-relaxed">
          Looks like this page took a trip and didn&apos;t come back.
          Let&apos;s get you somewhere good.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 h-12 px-6 rounded-brand bg-brand-green text-white font-semibold hover:bg-brand-green-light transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
