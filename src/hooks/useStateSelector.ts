/*
  src/hooks/useStateSelector.ts
  Reads the user's selected US state for state-law product filtering.
  State is persisted in localStorage by StateSelectorProvider.
*/

import { useContext, createContext, useCallback } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface StateSelectorContextValue {
  selectedState:  string | null;
  setSelectedState: (state: string | null) => void;
  clearState:     () => void;
  isRestricted:   (state: string) => boolean;
}

/* Restricted states where THCa products cannot legally ship */
const RESTRICTED_STATES = new Set([
  "AK","AZ","AR","CO","DE","HI","ID","IA","KS","LA",
  "MD","MI","MN","MS","MO","MT","NH","NJ","NY","ND",
  "OH","OK","OR","PA","RI","SC","SD","UT","VT","VA","WA",
]);

export const StateSelectorContext = createContext<StateSelectorContextValue>({
  selectedState:    null,
  setSelectedState: () => {},
  clearState:       () => {},
  isRestricted:     () => false,
});

export function useStateSelector() {
  return useContext(StateSelectorContext);
}

/** Hook that provides the actual implementation — used inside StateSelectorProvider */
export function useStateSelectorImpl(): StateSelectorContextValue {
  const [selectedState, setSelectedStateRaw, removeState] = useLocalStorage<string | null>(
    "th-selected-state",
    null
  );

  const setSelectedState = useCallback((state: string | null) => {
    setSelectedStateRaw(state);
  }, [setSelectedStateRaw]);

  const clearState = useCallback(() => {
    removeState();
  }, [removeState]);

  const isRestricted = useCallback((state: string) => {
    return RESTRICTED_STATES.has(state.toUpperCase());
  }, []);

  return { selectedState, setSelectedState, clearState, isRestricted };
}
