"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectColorValue } from "../features/configSlice";

export default function ThemeProvider({ children }) {
  const colorTheme = useSelector(selectColorValue) ?? "teal";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", colorTheme);
  }, [colorTheme]);

  return children;
}
