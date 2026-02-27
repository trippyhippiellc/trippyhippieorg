/*
  src/hooks/useUser.ts
  Convenience wrappers around useAuth() for common patterns.
*/

import { useAuth } from "@/context/AuthContext";

/** Returns the current user and the most useful profile flags in one call. */
export function useUser() {
  const { user, profile, isLoading } = useAuth();

  return {
    user,
    profile,
    isLoading,

    /* Shortcuts */
    userId:       user?.id      ?? null,
    email:        user?.email   ?? null,
    fullName:     profile?.full_name  ?? null,
    avatarUrl:    profile?.avatar_url ?? null,

    /* Role flags */
    isLoggedIn:   !!user,
    isAdmin:      !!(profile?.is_admin),
    isWholesale:  !!(profile?.is_wholesale),
    isAffiliate:  !!(profile?.is_affiliate),
    isVerified:   !!(profile?.id_verified),

    /* Account status */
    accountStatus:  profile?.account_status ?? "pending",
    isPending:      (profile?.account_status ?? "pending") === "pending",
    isApproved:     profile?.account_status === "approved",
    isSuspended:    profile?.account_status === "suspended",

    /* Affiliate */
    affiliateCode:     profile?.affiliate_code     ?? null,
    affiliateEarnings: profile?.affiliate_earnings ?? 0,
  };
}
