"use client";

import { useState } from "react";
import { MapPin, AlertTriangle, Check } from "lucide-react";
import { useAgeGateContext } from "@/features/age-gate/AgeGateProvider";
import { useStateSelector } from "@/hooks/useStateSelector";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

const US_STATES = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" }, { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" }, { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" }, { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" }, { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" }, { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" }, { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" }, { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" }, { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" }, { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" }, { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" }, { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" }, { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" }, { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" },
];

/*
  AccessGate — unified state selection + age verification
  User selects state FIRST, then confirms age verification.
  This determines product availability and access.
*/
export function AccessGate() {
  const { shouldShowGate, verify, decline, minimumAge } = useAgeGateContext();
  const { selectedState, setSelectedState, isRestricted } = useStateSelector();
  const [pickedState, setPickedState] = useState(selectedState ?? "");
  const [step, setStep] = useState<"state" | "age">(selectedState ? "age" : "state");

  if (!shouldShowGate) return null;

  const stateRestricted = pickedState ? isRestricted(pickedState) : false;
  const stateName = US_STATES.find((s) => s.code === pickedState)?.name;

  const handleStateConfirm = () => {
    if (!pickedState) return;
    console.log("[AccessGate] Confirming state:", pickedState);
    console.log("[AccessGate] Before setSelectedState, selectedState was:", selectedState);
    setSelectedState(pickedState);
    console.log("[AccessGate] Called setSelectedState, moving to age step");
    setStep("age");
  };

  const handleAgeVerify = () => {
    verify();
  };

  const handleChangeState = () => {
    setStep("state");
  };

  const handleDecline = () => {
    decline();
  };

  return (
    <div
      className="fixed inset-0 z-age-gate flex items-center justify-center p-4"
      style={{
        background:
          "radial-gradient(ellipse at center, #1A2E1A 0%, #0D1F0D 60%, #080F08 100%)",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="access-gate-title"
    >
      {/* Decorative background rings */}
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
          <div className="text-5xl mb-2" suppressHydrationWarning>
            🌿
          </div>
          <h1 className="text-3xl font-display font-bold gradient-text tracking-wide">
            Trippy Hippie
          </h1>
          <p className="text-brand-cream-dark text-sm tracking-widest uppercase">
            Premium Hemp Products
          </p>
        </div>

        {/* STEP 1: STATE SELECTION */}
        {step === "state" && (
          <div className="space-y-4">
            <div id="access-gate-title" className="mb-6">
              <h2 className="text-xl font-display font-semibold text-brand-cream mb-2">
                Where are you located?
              </h2>
              <p className="text-sm text-brand-cream-muted leading-relaxed">
                We use your state to show only products legal in your area.
              </p>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-brand bg-brand-green/5 border border-brand-green/20">
              <MapPin className="h-4 w-4 text-brand-green flex-shrink-0 mt-0.5" />
              <p className="text-xs text-brand-cream-muted leading-relaxed">
                State selection is required to ensure compliance with local hemp laws.
              </p>
            </div>

            <select
              value={pickedState}
              onChange={(e) => setPickedState(e.target.value)}
              className="w-full px-3 py-3 text-sm bg-[#162816] border border-white/10 rounded-brand text-brand-cream focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
            >
              <option value="">Select your state…</option>
              {US_STATES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </select>

            {stateRestricted && pickedState && (
              <div className="flex items-start gap-3 p-3 rounded-brand bg-yellow-500/10 border border-yellow-500/20">
                <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-300 mb-0.5">
                    Limited Product Availability
                  </p>
                  <p className="text-xs text-brand-cream-muted">
                    Some hemp products are restricted in {stateName}. You'll only see compliant items.
                  </p>
                </div>
              </div>
            )}

            <Button
              onClick={handleStateConfirm}
              disabled={!pickedState}
              variant="primary"
              size="lg"
              className="w-full"
            >
              Continue to Age Verification
            </Button>
          </div>
        )}

        {/* STEP 2: AGE VERIFICATION */}
        {step === "age" && (
          <div className="space-y-4">
            <div id="access-gate-title" className="mb-6">
              <h2 className="text-xl font-display font-semibold text-brand-cream mb-2">
                Are you {minimumAge} or older?
              </h2>
              <p className="text-sm text-brand-cream-muted leading-relaxed">
                You must be at least {minimumAge} years of age to enter this site. By clicking
                "Yes, I'm {minimumAge}+" you confirm you are of legal age in your jurisdiction.
                We only offer compliant hemp products.
              </p>
            </div>

            {/* State badge */}
            <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-brand bg-brand-green/10 border border-brand-green/20">
              <Check className="h-4 w-4 text-brand-green" />
              <p className="text-xs text-brand-cream-muted">
                Shopping in: <span className="font-semibold text-brand-cream">{stateName}</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={handleAgeVerify}
                className="flex-1"
              >
                Yes, I&apos;m {minimumAge}+
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={handleDecline}
                className="flex-1 border border-white/10 hover:border-white/20"
              >
                No, Exit
              </Button>
            </div>

            <button
              onClick={handleChangeState}
              className="w-full text-xs text-brand-cream-muted hover:text-brand-cream transition-colors underline"
            >
              Change state
            </button>

            {/* Legal fine print */}
            <p className="text-[10px] text-brand-cream-dark/50 leading-relaxed">
              By entering you agree to our{" "}
              <a href="/terms" className="underline hover:text-brand-cream-dark" tabIndex={-1}>
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="underline hover:text-brand-cream-dark" tabIndex={-1}>
                Privacy Policy
              </a>
              . {siteConfig.legalName} complies with the 2018 Farm Bill.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
