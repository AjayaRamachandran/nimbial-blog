import React, { createContext, useEffect, useMemo, useState } from "react";

export const DarkModeContext = createContext({
  darkMode: false,
  setDarkMode: () => {},
});

export function DarkModeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem("darkMode") === "on";
    } catch (_) {
      return false;
    }
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("darkMode");
      if (stored === null) localStorage.setItem("darkMode", "off");
    } catch (_) {}
  }, []);

  // Apply the class globally so variables affect the whole app
  useEffect(() => {
    const rootEl = document.documentElement; // <html>
    if (darkMode) rootEl.classList.add("dark-mode");
    else rootEl.classList.remove("dark-mode");
  }, [darkMode]);

  const value = useMemo(() => ({ darkMode, setDarkMode }), [darkMode]);

  return (
    <DarkModeContext.Provider value={value}>
      {children}
    </DarkModeContext.Provider>
  );
}
