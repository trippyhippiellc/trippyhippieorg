"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

/*
  Email verification page — src/app/(auth)/verify/page.tsx
  Handles email confirmation after signup via magic link in email.
  Shows success/error state for user feedback.
*/

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleVerification = async () => {
      try {
        // Check if user is already logged in (session exists)
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (session) {
          // User is already verified/logged in
          setStatus("success");
          setMessage("Your email has been verified! Redirecting to account...");
          setTimeout(() => router.push("/account"), 2000);
        } else {
          // No active session - link may be expired
          setStatus("error");
          setMessage(
            "Verification link has expired or is invalid. Please try signing up again."
          );
        }
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("error");
        setMessage("An error occurred during verification. Please try again.");
      }
    };

    handleVerification();
  }, [supabase, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: "radial-gradient(ellipse at top, #1A2E1A 0%, #0D1F0D 60%)" }}>
      <div className="max-w-md w-full">
        {/* Brand mark */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="h-8 w-8 rounded-full bg-brand-green flex items-center justify-center">
            <span className="text-brand-dark font-bold">TH</span>
          </div>
          <span className="font-display font-bold text-lg text-brand-cream">
            Trippy Hippie
          </span>
        </Link>

        {/* Verification card */}
        <div className="bg-brand-dark-secondary border border-brand-green-dark rounded-lg p-8">
          {status === "loading" && (
            <>
              <div className="flex justify-center mb-6">
                <div className="animate-spin">
                  <div className="h-10 w-10 border-4 border-brand-green border-t-transparent rounded-full"></div>
                </div>
              </div>
              <h2 className="text-xl font-display font-bold text-brand-cream text-center mb-2">
                Verifying Email
              </h2>
              <p className="text-brand-cream-muted text-center text-sm">
                Please wait while we confirm your email address...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center mb-6">
                <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-display font-bold text-green-400 text-center mb-2">
                Email Verified!
              </h2>
              <p className="text-brand-cream-muted text-center text-sm">
                {message}
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center mb-6">
                <div className="h-12 w-12 rounded-full bg-red-500 flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-display font-bold text-red-400 text-center mb-2">
                Verification Failed
              </h2>
              <p className="text-brand-cream-muted text-center text-sm mb-6">
                {message}
              </p>
              <Link
                href="/login"
                className="block w-full text-center px-4 py-2 bg-brand-green text-brand-dark font-semibold rounded-lg hover:bg-brand-green-light transition-colors"
              >
                Back to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
