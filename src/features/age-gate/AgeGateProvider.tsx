"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAgeGate } from "./useAgeGate";

////////////////////////////////////////////////////////////////////
// AGE GATE PROVIDER — src/features/age-gate/AgeGateProvider.tsx
//
// Wraps the useAgeGate hook in a React context so any component
// anywhere in the tree can read gate status without prop drilling.
//
// Usage:
//   1. Wrap your app: <AgeGateProvider>...</AgeGateProvider>
//   2. Use in any component: const { shouldShowGate } = useAgeGateContext()
////////////////////////////////////////////////////////////////////

type AgeGateContextValue = ReturnType<typeof useAgeGate>;

const AgeGateContext = createContext<AgeGateContextValue | undefined>(undefined);

////////////////////////////////////////////////////////////////////
// PROVIDER
////////////////////////////////////////////////////////////////////
export function AgeGateProvider({ children }: { children: ReactNode }) {
  const ageGate = useAgeGate();

  return (
    <AgeGateContext.Provider value={ageGate}>
      {children}
    </AgeGateContext.Provider>
  );
}

////////////////////////////////////////////////////////////////////
// HOOK
////////////////////////////////////////////////////////////////////
export function useAgeGateContext(): AgeGateContextValue {
  const context = useContext(AgeGateContext);

  if (context === undefined) {
    throw new Error("useAgeGateContext must be used within an AgeGateProvider");
  }

  return context;
}
