"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";
import { usePathname } from "next/navigation";

export type ThemeMode = "light" | "dark";

const THEME_STORAGE_KEY = "oriiko_theme";
const THEME_EVENT = "oriiko-theme-change";

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (next: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function isAdminRoutePath(pathname: string | null): boolean {
  return Boolean(pathname && pathname.startsWith("/admin"));
}

function applyThemeToDocument(mode: ThemeMode, isAdminRoute: boolean) {
  if (typeof document === "undefined") return;
  const effective: ThemeMode = isAdminRoute ? mode : "light";
  const root = document.documentElement;
  root.classList.toggle("dark", effective === "dark");
  root.setAttribute("data-theme", effective);
  root.style.colorScheme = effective;
}

function readStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    // Ignore storage read errors
  }
  return "light";
}

function subscribeTheme(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(THEME_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(THEME_EVENT, handler);
  };
}

function getServerThemeSnapshot(): ThemeMode {
  return "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = isAdminRoutePath(pathname);

  const theme = useSyncExternalStore(
    subscribeTheme,
    readStoredTheme,
    getServerThemeSnapshot
  );

  useEffect(() => {
    applyThemeToDocument(theme, isAdmin);
  }, [theme, isAdmin]);

  const setTheme = useCallback(
    (next: ThemeMode) => {
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(THEME_STORAGE_KEY, next);
        } catch {
          // Ignore storage write errors
        }
        applyThemeToDocument(next, isAdminRoutePath(window.location.pathname));
        window.dispatchEvent(new Event(THEME_EVENT));
      }
    },
    []
  );

  const toggleTheme = useCallback(() => {
    const current = readStoredTheme();
    setTheme(current === "dark" ? "light" : "dark");
  }, [setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
