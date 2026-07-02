"use client";

import { useEffect, useState } from "react";

type ThemeMode = "dark" | "light";

type ThemeControlProps = {
  landing?: boolean;
};

const THEME_STORAGE_KEY = "zamapay:theme";

export default function ThemeControl({ landing = false }: ThemeControlProps) {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const storedTheme =
      typeof window !== "undefined" ? (window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null) : null;
    const nextTheme = storedTheme === "light" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`theme-fab ${landing ? "theme-fab-landing" : ""}`}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="theme-fab-icon" aria-hidden="true">
          {theme === "light" ? (
            <svg viewBox="0 0 24 24">
              <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0-16h.01M12 22h.01M4 12h.01M20 12h.01M6.34 6.34h.01M17.66 17.66h.01M17.66 6.34h.01M6.34 17.66h.01" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
            </svg>
          )}
        </span>
        <span>{theme === "light" ? "Light Mode" : "Dark Mode"}</span>
      </button>

      {open ? (
        <div className="theme-modal-backdrop" role="presentation" onClick={() => setOpen(false)}>
          <div
            className="theme-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Choose appearance"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="theme-modal-header">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-zama-soft">Appearance</p>
                <h2 className="mt-2 text-xl font-black theme-modal-title">Choose your mode</h2>
                <p className="mt-2 text-sm leading-6 theme-modal-copy">
                  Switch between ZamaPay&apos;s dark and light surfaces without changing the product layout.
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="icon-button">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2">
                  <path d="M6 6 18 18M18 6 6 18" />
                </svg>
              </button>
            </div>

            <div className="theme-option-grid">
              <button
                type="button"
                onClick={() => {
                  setTheme("dark");
                  setOpen(false);
                }}
                className={`theme-option-card ${theme === "dark" ? "theme-option-card-active" : ""}`}
              >
                <span className="theme-preview theme-preview-dark" aria-hidden="true" />
                <span className="block text-base font-black theme-modal-title">Dark</span>
                <span className="mt-1 block text-sm theme-modal-copy">Low-glare, high contrast, signature ZamaPay mood.</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTheme("light");
                  setOpen(false);
                }}
                className={`theme-option-card ${theme === "light" ? "theme-option-card-active" : ""}`}
              >
                <span className="theme-preview theme-preview-light" aria-hidden="true" />
                <span className="block text-base font-black theme-modal-title">Light</span>
                <span className="mt-1 block text-sm theme-modal-copy">Soft daylight surfaces with the same gold-accent hierarchy.</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
