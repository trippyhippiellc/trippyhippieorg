"use client";

import { useState, useEffect, useCallback } from "react";
import { siteConfig } from "@/config/site";

////////////////////////////////////////////////////////////////////
// AGE GATE HOOK — src/features/age-gate/useAgeGate.ts
//
// Manages whether the age gate modal should be shown.
// Stores verification state in a cookie so returning visitors
// don't see it again within the session/expiry window.
//
// Usage:
//   const { isVerified, isLoading, verify, decline } = useAgeGate()
////////////////////////////////////////////////////////////////////

const COOKIE_NAME = "age_verified";
const COOKIE_EXPIRY_DAYS = 365; // Verify once per year

////////////////////////////////////////////////////////////////////
// COOKIE HELPERS
// Plain document.cookie manipulation — no external dependency needed
////////////////////////////////////////////////////////////////////

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days: number): void {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
}

function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}


////////////////////////////////////////////////////////////////////
// HOOK
////////////////////////////////////////////////////////////////////
export function useAgeGate() {
  ////////////////////////////////////////////////////////////////////
  // STATE
  // isLoading: true until we've checked cookies on mount (prevents flash)
  // isVerified: whether the user has passed the age gate
  ////////////////////////////////////////////////////////////////////
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isVerified, setIsVerified] = useState<boolean>(false);


  ////////////////////////////////////////////////////////////////////
  // ON MOUNT — CHECK COOKIE
  // If the cookie exists and is "true", skip the modal.
  // We delay state update to avoid SSR hydration mismatch.
  ////////////////////////////////////////////////////////////////////
  useEffect(() => {
    const cookie = getCookie(COOKIE_NAME);
    if (cookie === "true") {
      setIsVerified(true);
    }
    setIsLoading(false);
  }, []);


  ////////////////////////////////////////////////////////////////////
  // VERIFY — User confirms they are old enough
  // Sets the cookie and hides the modal
  ////////////////////////////////////////////////////////////////////
  const verify = useCallback(() => {
    setCookie(COOKIE_NAME, "true", COOKIE_EXPIRY_DAYS);
    setIsVerified(true);
  }, []);


  ////////////////////////////////////////////////////////////////////
  // DECLINE — User says they are under age
  // Redirects to a safe external page (Google)
  // Does NOT set the cookie — they will see the gate again
  ////////////////////////////////////////////////////////////////////
  const decline = useCallback(() => {
    // Redirect away from the site — do not allow underage access
    window.location.href = "https://www.google.com";
  }, []);


  ////////////////////////////////////////////////////////////////////
  // RESET — Clears verification (for testing only)
  // Not exposed in production usage — call manually in dev console
  ////////////////////////////////////////////////////////////////////
  const reset = useCallback(() => {
    deleteCookie(COOKIE_NAME);
    setIsVerified(false);
  }, []);


  ////////////////////////////////////////////////////////////////////
  // SHOULD SHOW GATE
  // True when: not loading AND not verified
  ////////////////////////////////////////////////////////////////////
  const shouldShowGate = !isLoading && !isVerified;

  return {
    isLoading,
    isVerified,
    shouldShowGate,
    minimumAge: siteConfig.minimumAge,
    verify,
    decline,
    reset, // Dev use only
  };
}