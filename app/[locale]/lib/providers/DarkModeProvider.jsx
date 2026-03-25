"use client";

import { createContext, useContext, useState, useEffect } from "react";

const DarkModeContext = createContext({ isDark: false, toggle: () => {} });

export const useDarkMode = () => useContext(DarkModeContext);

export default function DarkModeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  const toggle = () => setIsDark((prev) => !prev);

  return (
    <DarkModeContext.Provider value={{ isDark, toggle }}>
      {children}
    </DarkModeContext.Provider>
  );
}
