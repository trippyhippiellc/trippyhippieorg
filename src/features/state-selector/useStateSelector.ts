"use client";

import { useState, useEffect, useCallback } from "react";
import { getStateByCode, isCategoryAllowedInState } from "./stateData";

////////////////////////////////////////////////////////////////////
// STATE SELECTOR HOOK — src/features/state-selector/useStateSelector.ts
//
// Manages which state the user has selected and persists it.
// The selected state controls which products are visible.
//
// Storage: localStorage (survives page refresh, cleared if user
// wants to change state via the state selector modal)
//
// Usage:
//   const { selectedState, setSelectedState, isProductAllowed } = useStateSelector()
////////////////////////////////////////////////////////////////////

const STORAGE_KEY = "trippy_hippie_state";

export function useStateSelector() {
  ////////////////////////////////////////////////////////////////////
  // STATE
  // selectedState: two-letter state code or null if not yet selected
  // hasSelected: whether the user has completed state selection
  ////////////////////////////////////////////////////////////////////
  const [selectedState, setSelectedStateInternal] = useState<string | null>(null);
  const [hasSelected, setHasSelected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);


  ////////////////////////////////////////////////////////////////////
  // ON MOUNT — RESTORE FROM STORAGE
  ////////////////////////////////////////////////////////////////////
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as { code: string };
        if (parsed.code && parsed.code.length === 2) {
          setSelectedStateInternal(parsed.code);
          setHasSelected(true);
        }
      }
    } catch {
      // Storage read failed — proceed without a state selection
    } finally {
      setIsLoading(false);
    }
  }, []);


  ////////////////////////////////////////////////////////////////////
  // SET STATE — saves to localStorage
  ////////////////////////////////////////////////////////////////////
  const setSelectedState = useCallback((code: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ code }));
    } catch {
      // Storage write failed — non-fatal
    }
    setSelectedStateInternal(code);
    setHasSelected(true);
  }, []);


  ////////////////////////////////////////////////////////////////////
  // CLEAR STATE — shows the state selector modal again
  ////////////////////////////////////////////////////////////////////
  const clearSelectedState = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Non-fatal
    }
    setSelectedStateInternal(null);
    setHasSelected(false);
  }, []);


  ////////////////////////////////////////////////////////////////////
  // CHECK IF PRODUCT CATEGORY IS ALLOWED IN SELECTED STATE
  // Returns true if no state is selected (show all by default)
  ////////////////////////////////////////////////////////////////////
  const isProductAllowed = useCallback(
    (category: string): boolean => {
      if (!selectedState) return true;
      return isCategoryAllowedInState(selectedState, category);
    },
    [selectedState]
  );


  ////////////////////////////////////////////////////////////////////
  // SELECTED STATE INFO OBJECT
  ////////////////////////////////////////////////////////////////////
  const stateInfo = selectedState ? getStateByCode(selectedState) : undefined;


  ////////////////////////////////////////////////////////////////////
  // SHOULD SHOW SELECTOR MODAL
  // True when age gate is passed but state not yet selected
  ////////////////////////////////////////////////////////////////////
  const shouldShowSelector = !isLoading && !hasSelected;

  return {
    selectedState,
    stateInfo,
    hasSelected,
    isLoading,
    shouldShowSelector,
    setSelectedState,
    clearSelectedState,
    isProductAllowed,
  };
}