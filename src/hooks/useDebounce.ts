"use client";

import { useState, useEffect, useRef, useCallback } from "react";

////////////////////////////////////////////////////////////////////
// SHARED HOOKS — src/hooks/useDebounce.ts
// (This file also exports useLocalStorage and useMediaQuery to keep
//  small hooks together. They're each importable by name.)
//
// Contents:
//   1. useDebounce     — delays a value update until user stops typing
//   2. useLocalStorage — localStorage with SSR safety + type safety
//   3. useMediaQuery   — responsive breakpoint detection
//   4. useDebounceCallback — debounces a function call
////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////
// 1. USE DEBOUNCE
// Delays updating a value until the user stops changing it.
// Prevents excessive API calls on every keystroke.
//
// Usage:
//   const debouncedSearch = useDebounce(searchInput, 400)
//   useEffect(() => { fetchResults(debouncedSearch) }, [debouncedSearch])
////////////////////////////////////////////////////////////////////
export function useDebounce<T>(value: T, delayMs: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}


////////////////////////////////////////////////////////////////////
// 2. USE LOCAL STORAGE
// Type-safe localStorage wrapper that handles:
//   - SSR (server renders without localStorage access)
//   - JSON serialization/deserialization
//   - Default values
//   - Storage errors (private browsing mode, full storage)
//
// Usage:
//   const [theme, setTheme] = useLocalStorage("theme", "dark")
////////////////////////////////////////////////////////////////////
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  ////////////////////////////////////////////////////////////////////
  // Initialize from storage (SSR-safe)
  ////////////////////////////////////////////////////////////////////
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  ////////////////////////////////////////////////////////////////////
  // Setter — updates state AND localStorage
  ////////////////////////////////////////////////////////////////////
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch {
        console.warn(`useLocalStorage: Failed to set key "${key}"`);
      }
    },
    [key, storedValue]
  );

  ////////////////////////////////////////////////////////////////////
  // Remove — deletes from localStorage and resets to initial
  ////////////////////////////////////////////////////////////////////
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Non-fatal
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}


////////////////////////////////////////////////////////////////////
// 3. USE MEDIA QUERY
// Returns true when the CSS media query matches.
// Handles SSR by defaulting to false until hydration.
//
// Usage:
//   const isMobile = useMediaQuery("(max-width: 768px)")
//   const isDark = useMediaQuery("(prefers-color-scheme: dark)")
////////////////////////////////////////////////////////////////////
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

////////////////////////////////////////////////////////////////////
// Convenience breakpoint hooks using Tailwind's default breakpoints
////////////////////////////////////////////////////////////////////
export function useIsMobile() {
  return useMediaQuery("(max-width: 767px)");
}

export function useIsTablet() {
  return useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
}

export function useIsDesktop() {
  return useMediaQuery("(min-width: 1024px)");
}


////////////////////////////////////////////////////////////////////
// 4. USE DEBOUNCE CALLBACK
// Debounces a function rather than a value.
// Useful for search handlers, resize handlers, etc.
//
// Usage:
//   const handleSearch = useDebounceCallback((q) => fetchResults(q), 400)
////////////////////////////////////////////////////////////////////
export function useDebounceCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delayMs: number = 400
): (...args: Parameters<T>) => void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => callback(...args), delayMs);
    },
    [callback, delayMs]
  );
}