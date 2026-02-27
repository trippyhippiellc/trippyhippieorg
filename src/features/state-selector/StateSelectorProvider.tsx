"use client";

import { useContext, ReactNode } from "react";
import { useStateSelectorImpl, StateSelectorContext } from "@/hooks/useStateSelector";

export function useStateSelectorContext() {
  const context = useContext(StateSelectorContext);
  if (context === undefined) {
    throw new Error("useStateSelectorContext must be used within a StateSelectorProvider");
  }
  return context;
}

export function StateSelectorProvider({ children }: { children: ReactNode }) {
  const value = useStateSelectorImpl();
  return (
    <StateSelectorContext.Provider value={value}>
      {children}
    </StateSelectorContext.Provider>
  );
}