import React, { createContext, useEffect, useMemo, useRef, useState } from "react";

// "system" follows the OS preference; "light" / "dark" are explicit overrides.
export const THEMES = ["system", "dark", "light"]; // cycle order
const STORAGE_KEY = "theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";
const THEME_TRANSITION_MS = 300; // keep in sync with .theme-transition in index.css

export const DarkModeContext = createContext({
  theme: "system",
  setTheme: () => {},
  cycleTheme: () => {},
  darkMode: false,
});

function readStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (THEMES.includes(stored)) return stored;

    // Migrate the old on/off setting. "off" was written for everyone by
    // default, so only an explicit "on" is kept as a choice.
    const legacy = localStorage.getItem("darkMode");
    localStorage.removeItem("darkMode");
    if (legacy === "on") {
      localStorage.setItem(STORAGE_KEY, "dark");
      return "dark";
    }
  } catch (_) {}
  return "system";
}

function systemPrefersDark() {
  try {
    return window.matchMedia(DARK_QUERY).matches;
  } catch (_) {
    return false;
  }
}

export function DarkModeProvider({ children }) {
  const [theme, setThemeState] = useState(readStoredTheme);
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  // Follow live changes to the OS preference.
  useEffect(() => {
    let mql;
    try {
      mql = window.matchMedia(DARK_QUERY);
    } catch (_) {
      return;
    }
    const onChange = (e) => setSystemDark(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const darkMode = theme === "dark" || (theme === "system" && systemDark);

  // Apply the class globally so variables affect the whole app.
  // On changes after the first render, briefly enable a site-wide color
  // transition so the switch fades instead of snapping.
  const isFirstApply = useRef(true);
  useEffect(() => {
    const rootEl = document.documentElement; // <html>
    let timer;
    if (!isFirstApply.current) {
      rootEl.classList.add("theme-transition");
      timer = setTimeout(
        () => rootEl.classList.remove("theme-transition"),
        THEME_TRANSITION_MS,
      );
    }
    isFirstApply.current = false;
    rootEl.classList.toggle("dark-mode", darkMode);
    rootEl.style.colorScheme = darkMode ? "dark" : "light";
    return () => {
      clearTimeout(timer);
      rootEl.classList.remove("theme-transition");
    };
  }, [darkMode]);

  const value = useMemo(() => {
    const setTheme = (next) => {
      setThemeState(next);
      try {
        if (next === "system") localStorage.removeItem(STORAGE_KEY);
        else localStorage.setItem(STORAGE_KEY, next);
      } catch (_) {}
    };
    const cycleTheme = () =>
      setTheme(THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]);
    return { theme, setTheme, cycleTheme, darkMode };
  }, [theme, darkMode]);

  return (
    <DarkModeContext.Provider value={value}>
      {children}
    </DarkModeContext.Provider>
  );
}
