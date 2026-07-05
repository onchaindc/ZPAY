"use client";

import { useEffect, useState } from "react";

type ThemeMode = "dark" | "light";

type ThemeControlProps = {
  landing?: boolean;
  variant?: "floating" | "inline";
};

const THEME_STORAGE_KEY = "zpay:theme";

export default function ThemeControl({ landing = false, variant = "floating" }: ThemeControlProps) {
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    const savedTheme =
      typeof window !== "undefined" ? (window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null) : null;
    const nextTheme = savedTheme === "light" ? "light" : "dark";

    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";

    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={
        variant === "inline"
          ? "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[color:var(--theme-text)] transition duration-200 hover:border-zama-gold/40 hover:bg-zama-gold/10"
          : `theme-toggle ${landing ? "theme-toggle-landing" : ""}`
      }
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        {theme === "light" ? (
          <svg viewBox="0 0 24 24">
            <path d="M21 12.8A8.7 8.7 0 0 1 11.2 3 7.4 7.4 0 1 0 21 12.8Z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24">
            <path d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.7-5.7 1.4-1.4M4.9 19.1l1.4-1.4m0-11.4L4.9 4.9m14.2 14.2-1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
          </svg>
        )}
      </span>
    </button>
  );
}
