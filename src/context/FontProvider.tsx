"use client";

import { type ReactNode } from "react";
import { useFontLoader } from "@/hooks/useFontLoader";

interface FontProviderProps {
  children: ReactNode;
}

export function FontProvider({ children }: FontProviderProps) {
  // Load active font on app startup
  useFontLoader();

  return <>{children}</>;
}

export default FontProvider;
