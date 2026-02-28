"use client";

import { type ReactNode } from "react";
import { AuthProvider } from "./AuthContext";
import { AgeGateProvider } from "@/features/age-gate/AgeGateProvider";
import { StateSelectorProvider } from "@/features/state-selector/StateSelectorProvider";
import { ThemeProvider } from "./ThemeProvider";
import { FontProvider } from "./FontProvider";
import { Toaster } from "react-hot-toast";

/*
  AppProvider — single root wrapper that composes all context providers.
  Placed in src/app/layout.tsx so every page has access.

  Provider order (outermost → innermost):
    1. AuthProvider     — session + profile state
    2. AgeGateProvider  — age verification state
    3. children         — page content
    4. Toaster          — global toast notifications
*/

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <ThemeProvider>
      <FontProvider>
        <AuthProvider>
          <StateSelectorProvider>
            <AgeGateProvider>
              {children}
              <Toaster
                position="bottom-right"
                gutter={8}
                toastOptions={{
                  duration: 3500,
                  style: {
                    background: "#1A2E1A",
                    color: "#F5F0E8",
                    border: "1px solid rgba(124, 179, 66, 0.2)",
                    borderRadius: "0.625rem",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.9rem",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                  },
                  success: {
                    iconTheme: {
                      primary: "#7CB342",
                      secondary: "#F5F0E8",
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: "#EF4444",
                      secondary: "#F5F0E8",
                    },
                  },
                }}
              />
            </AgeGateProvider>
          </StateSelectorProvider>
        </AuthProvider>
      </FontProvider>
    </ThemeProvider>
  );
}
