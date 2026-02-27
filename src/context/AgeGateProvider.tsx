"use client";

import { createContext, useContext } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

/* src/context/AgeGateProvider.tsx */

interface AgeGateContextValue {
  isVerified: boolean;
  verify:     () => void;
  reset:      () => void;
}

const AgeGateContext = createContext<AgeGateContextValue>({
  isVerified: false,
  verify:     () => {},
  reset:      () => {},
});

export function AgeGateProvider({ children }: { children: React.ReactNode }) {
  const [isVerified, setVerified, removeVerified] = useLocalStorage<boolean>(
    "th-age-verified",
    false
  );

  function verify() { setVerified(true); }
  function reset()  { removeVerified(); }

  return (
    <AgeGateContext.Provider value={{ isVerified, verify, reset }}>
      {children}
    </AgeGateContext.Provider>
  );
}

export function useAgeGate() {
  return useContext(AgeGateContext);
}
