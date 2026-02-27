"use client";

import { createContext, useContext, useEffect, useState } from "react";

/*
  src/context/ThemeProvider.tsx
  Provides theme context. Currently dark-only — scaffolded for future light mode.
  Wrap in src/app/layout.tsx inside AppProvider.
*/

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme:      Theme;
  setTheme:   (t: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme:       "dark",
  setTheme:    () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  // Synchronously set the theme to avoid flash
  // This runs on client mount even before useEffect
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const stored = localStorage.getItem("th-theme") as Theme | null;
    const themeToUse = stored || "dark";
    if (themeToUse === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  useEffect(() => {
    const stored = localStorage.getItem("th-theme") as Theme | null;
    const themeToSet = stored || "dark";
    setThemeState(themeToSet);
  }, []);

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem("th-theme", t);
    
    // Apply the theme class to the document element
    if (t === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeProvider;
