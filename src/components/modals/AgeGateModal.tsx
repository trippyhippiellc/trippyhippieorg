"use client";

import { useAgeGateContext } from "@/features/age-gate/AgeGateProvider";
import { useStateSelector } from "@/hooks/useStateSelector";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

/*
  AgeGateModal — shown on first visit before cookies are set.
  Cannot be dismissed by ESC, clicking outside, or X button.
  User must confirm age (verify) or decline (redirect away).
  Cookie persists 365 days so returning visitors skip this.
*/
export function AgeGateModal() {
  const { shouldShowGate, verify, decline, minimumAge } = useAgeGateContext();
  const { selectedState } = useStateSelector();

  // Only show age gate if state is selected
  if (!shouldShowGate || !selectedState) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-age-gate flex items-center justify-center p-4"
      style={{
        background:
          "radial-gradient(ellipse at center, #1A2E1A 0%, #0D1F0D 60%, #080F08 100%)",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
    >
      {/* Decorative background rings — pure CSS, no images */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-brand-green/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-brand-green/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full bg-brand-green/5 blur-3xl" />
      </div>

      {/* Modal card */}
      <div
        className={cn(
          "relative z-10 w-full max-w-md text-center",
          "glass-card border border-brand-green/20",
          "p-8 sm:p-10"
        )}
      >
        {/* Brand mark */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="text-5xl mb-2" suppressHydrationWarning>🌿</div>
          <h1 className="text-3xl font-display font-bold gradient-text tracking-wide">
            Trippy Hippie
          </h1>
          <p className="text-brand-cream-dark text-sm tracking-widest uppercase">
            Premium Hemp Products
          </p>
        </div>

        {/* Age prompt */}
        <div className="mb-8 space-y-3">
          <h2
            id="age-gate-title"
            className="text-xl font-display font-semibold text-brand-cream"
          >
            Are you {minimumAge} or older?
          </h2>
          <p className="text-sm text-brand-cream-muted leading-relaxed">
            You must be at least {minimumAge} years of age to enter this site.
            By clicking &ldquo;Yes, I&apos;m {minimumAge}+&rdquo; you confirm
            you are of legal age in your jurisdiction. We only offer compliant hemp products.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={verify}
            className="flex-1"
          >
            Yes, I&apos;m {minimumAge}+
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={decline}
            className="flex-1 border border-white/10 hover:border-white/20"
          >
            No, Exit
          </Button>
        </div>

        {/* Legal fine print */}
        <p className="text-[10px] text-brand-cream-dark/50 mt-6 leading-relaxed">
          By entering you agree to our{" "}
          <a
            href="/terms"
            className="underline hover:text-brand-cream-dark"
            tabIndex={-1}
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            className="underline hover:text-brand-cream-dark"
            tabIndex={-1}
          >
            Privacy Policy
          </a>
          . {siteConfig.legalName} complies with the 2018 Farm Bill.
        </p>
      </div>
    </div>
  );
}

export default AgeGateModal;
