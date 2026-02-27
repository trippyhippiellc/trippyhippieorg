"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { UnderConstructionModal } from "@/components/modals/UnderConstructionModal";
import { useAuth } from "@/context/AuthContext";

export function ConstructionModeGuard({ children }: { children: React.ReactNode }) {
  const [isConstructionMode, setIsConstructionMode] = useState<boolean | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const checkConstructionMode = async () => {
      try {
        const response = await fetch("/api/construction");
        const data = await response.json();
        const inConstructionMode = data.isConstructionMode ?? false;
        console.log("[ConstructionModeGuard] isConstructionMode:", inConstructionMode);
        setIsConstructionMode(inConstructionMode);

        // If not in construction mode, everyone has access
        if (!inConstructionMode) {
          console.log("[ConstructionModeGuard] Not in construction mode, allowing access");
          setHasAccess(true);
          setIsLoading(false);
          return;
        }

        // In construction mode: admins have automatic access
        if (isAdmin) {
          console.log("[ConstructionModeGuard] User is admin, allowing access");
          setHasAccess(true);
          setIsLoading(false);
          return;
        }

        // Non-admins need the construction_access cookie
        const cookieValue = document.cookie
          .split("; ")
          .find((row) => row.startsWith("construction_access="))
          ?.split("=")[1];
        
        console.log("[ConstructionModeGuard] construction_access cookie value:", cookieValue);
        const hasCookie = cookieValue === "true";
        console.log("[ConstructionModeGuard] hasCookie:", hasCookie);
        
        setHasAccess(hasCookie);
        setIsLoading(false);
      } catch (err) {
        console.error("[ConstructionModeGuard] Error checking construction mode:", err);
        setIsConstructionMode(false);
        setHasAccess(true);
        setIsLoading(false);
      }
    };

    checkConstructionMode();
  }, [isAdmin]);

  // Allow access to API routes and admin routes (API handles auth)
  if (pathname?.startsWith("/api/") || pathname?.startsWith("/admin/")) {
    return <>{children}</>;
  }

  // Still loading - show nothing to avoid flash
  if (isLoading) {
    return null;
  }

  // If in construction mode and user doesn't have access, show modal
  if (isConstructionMode && !hasAccess) {
    return <UnderConstructionModal />;
  }

  // Otherwise, show the site normally
  return <>{children}</>;
}
