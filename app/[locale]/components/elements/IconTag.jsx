"use client";
import { useSelector } from "react-redux";
import { selectColorValue } from "@/app/[locale]/lib/features/configSlice";
import { THEME } from "@/app/[locale]/lib/utils/themeClasses";

/**
 * Renders an icon with the active theme accent color.
 * @param {React.ReactNode} icon - The icon element to render.
 * @param {string} [className] - Optional extra class names.
 */
const IconTag = ({ icon, className = "" }) => {
  const colorTheme = useSelector(selectColorValue) ?? "teal";
  const t = THEME[colorTheme] ?? THEME.teal;

  return <span className={`${t.statIcon} ${className}`}>{icon}</span>;
};

export default IconTag;
