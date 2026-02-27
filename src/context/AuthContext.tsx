"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/supabase";

////////////////////////////////////////////////////////////////////
// AUTH CONTEXT — src/context/AuthContext.tsx
//
// Provides the current user, their profile, and auth state
// to any component in the app tree.
//
// Wraps Supabase Auth and extends it with the profiles table
// so you can read is_admin, is_wholesale_approved, account_status, etc.
//
// Usage in any Client Component:
//   import { useAuth } from "@/context/AuthContext"
//   const { user, profile, isAdmin, isLoading } = useAuth()
////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////
// CONTEXT TYPE
// All values exposed by the auth context
////////////////////////////////////////////////////////////////////
interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;

  // Derived convenience booleans — avoids repeated null checks
  isAuthenticated: boolean;
  isAdmin: boolean;
  isWholesaleApproved: boolean;
  isAffiliate: boolean;
  isAccountApproved: boolean; // account_status === "approved"
  isAccountPending: boolean;  // account_status === "pending"

  // Actions
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}


////////////////////////////////////////////////////////////////////
// CONTEXT CREATION
////////////////////////////////////////////////////////////////////
const AuthContext = createContext<AuthContextValue | undefined>(undefined);


////////////////////////////////////////////////////////////////////
// AUTH PROVIDER COMPONENT
// Wrap this around your app in AppProvider.tsx
////////////////////////////////////////////////////////////////////
export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();

  ////////////////////////////////////////////////////////////////////
  // STATE
  ////////////////////////////////////////////////////////////////////
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);


  ////////////////////////////////////////////////////////////////////
  // FETCH PROFILE
  // Loads the user's extended profile from the profiles table.
  // Called on initial auth and whenever the session changes.
  ////////////////////////////////////////////////////////////////////
  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error.message);
        return;
      }

      setProfile(data);
    },
    [supabase]
  );


  ////////////////////////////////////////////////////////////////////
  // REFRESH PROFILE (PUBLIC)
  // Call this after any operation that changes the profile
  // (e.g., after admin approves account, after ID upload)
  ////////////////////////////////////////////////////////////////////
  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);


  ////////////////////////////////////////////////////////////////////
  // SIGN OUT
  ////////////////////////////////////////////////////////////////////
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  }, [supabase]);


  ////////////////////////////////////////////////////////////////////
  // AUTH STATE LISTENER
  // Supabase fires this whenever the user signs in, signs out,
  // or the token refreshes. We sync our state here.
  ////////////////////////////////////////////////////////////////////
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);


  ////////////////////////////////////////////////////////////////////
  // DERIVED VALUES
  // Computed booleans from user + profile state
  ////////////////////////////////////////////////////////////////////
  const isAuthenticated = !!user;
  const isAdmin = profile?.is_admin === true;
  const isWholesaleApproved = profile?.is_wholesale_approved === true;
  const isAffiliate = profile?.is_affiliate === true;
  const isAccountApproved = profile?.account_status === "approved";
  const isAccountPending = profile?.account_status === "pending";


  ////////////////////////////////////////////////////////////////////
  // CONTEXT VALUE
  ////////////////////////////////////////////////////////////////////
  const value: AuthContextValue = {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated,
    isAdmin,
    isWholesaleApproved,
    isAffiliate,
    isAccountApproved,
    isAccountPending,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


////////////////////////////////////////////////////////////////////
// HOOK
// Throws an error if used outside AuthProvider — prevents silent bugs
////////////////////////////////////////////////////////////////////
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
